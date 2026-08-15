import { normalizeDigits } from './digits';
import { resolveLocale } from './locale';
import type { Locale, LocaleLike } from './types';

/**
 * Live masking for date input fields: as digits are typed they are flowed into the
 * developer's format pattern, so typing `14020512` into a `YYYY/MM/DD` field shows
 * `1402/05/12` (with the locale's own numerals) without the user typing separators.
 */

/** A format token, a `[literal]`, or any single passthrough character. */
const MASK_TOKEN =
  /\[([^\]]*)]|YYYY|YY|MMMM|MMM|MM|M|DD|D|dddd|ddd|dd|d|Q|HH|H|hh|h|mm|m|ss|s|SSS|A|a|ZZ|Z|[\s\S]/g;

/** What a digit token can hold, and how it renders once it is full. */
interface FieldSpec {
  /** How many typed digits the field accepts. */
  width: number;
  /** Largest value the field can hold, where one exists. Drives auto-advance. */
  max?: number;
  /** Whether the token renders zero-padded, so a short value is padded once closed. */
  pad: boolean;
}

/** Digit tokens and what each one accepts. */
const FIELD_SPEC: Record<string, FieldSpec> = {
  YYYY: { width: 4, pad: false },
  YY: { width: 2, pad: true },
  MM: { width: 2, max: 12, pad: true },
  M: { width: 2, max: 12, pad: false },
  DD: { width: 2, max: 31, pad: true },
  D: { width: 2, max: 31, pad: false },
  HH: { width: 2, max: 23, pad: true },
  H: { width: 2, max: 23, pad: false },
  hh: { width: 2, max: 12, pad: true },
  h: { width: 2, max: 12, pad: false },
  mm: { width: 2, max: 59, pad: true },
  m: { width: 2, max: 59, pad: false },
  ss: { width: 2, max: 59, pad: true },
  s: { width: 2, max: 59, pad: false },
  SSS: { width: 3, pad: true },
};

/**
 * Tokens that render text rather than digits a keyboard can produce. A format
 * containing one is left unmasked — the field stays free-typing and settles on blur.
 */
const UNMASKABLE_TOKENS = new Set([
  'MMMM',
  'MMM',
  'dddd',
  'ddd',
  'dd',
  'd',
  'Q',
  'A',
  'a',
  'Z',
  'ZZ',
]);

type MaskSegment = ({ kind: 'field' } & FieldSpec) | { kind: 'literal'; text: string };

// Compiled masks are pure for a given format — cache them so repeated keystrokes
// (the common case) don't re-tokenize. Mirrors parse.ts's cache; formats are few
// and app-controlled, so no eviction is needed.
const maskCache = new Map<string, MaskSegment[] | null>();

function compileMask(format: string): MaskSegment[] | null {
  const cached = maskCache.get(format);
  if (cached !== undefined) return cached;

  const segments: MaskSegment[] = [];
  let hasField = false;
  let maskable = true;

  for (const match of format.matchAll(MASK_TOKEN)) {
    const literal = match[1];
    if (literal !== undefined) {
      if (literal) segments.push({ kind: 'literal', text: literal });
      continue;
    }
    const token = match[0]!;
    if (UNMASKABLE_TOKENS.has(token)) {
      maskable = false;
      break;
    }
    const spec = FIELD_SPEC[token];
    if (spec) {
      segments.push({ kind: 'field', ...spec });
      hasField = true;
      continue;
    }
    // A single passthrough character such as `/`, `-`, or a space.
    segments.push({ kind: 'literal', text: token });
  }

  const result = maskable && hasField ? segments : null;
  maskCache.set(format, result);
  return result;
}

/**
 * Whether typed text can be masked into `format` — every token is a digit field or
 * a literal. Formats with month names, weekday names, meridiem, or UTC offsets are
 * not maskable and keep the field free-typing.
 */
export function isMaskableFormat(format: string): boolean {
  return compileMask(format) !== null;
}

/** Options for {@link applyFormatMask}. */
export interface MaskOptions {
  /** Locale used to render the typed digits. Defaults to the global default locale. */
  locale?: LocaleLike;
  /** Caret position inside `value`. Defaults to the end of the text. */
  caret?: number;
  /** The field's value before this edit; lets backspace delete through separators. */
  previous?: string;
}

/** The result of {@link applyFormatMask}. */
export interface MaskResult {
  /** The masked text to show in the input. */
  text: string;
  /** Where the caret belongs inside `text`. */
  caret: number;
}

/** Separators users habitually type even when the format uses a different one. */
const SEPARATOR_CHARS = new Set(['/', '-', '.', ':', ' ']);
const ASCII_DIGIT = /[0-9]/;

function countDigits(value: string): number {
  let count = 0;
  for (const char of value) if (ASCII_DIGIT.test(char)) count++;
  return count;
}

/** Drops the `ordinal`-th digit (1-based) from `value`, leaving everything else in place. */
function dropDigit(value: string, ordinal: number): string {
  let seen = 0;
  for (let i = 0; i < value.length; i++) {
    if (ASCII_DIGIT.test(value.charAt(i))) {
      seen++;
      if (seen === ordinal) return value.slice(0, i) + value.slice(i + 1);
    }
  }
  return value;
}

/** A typed digit, plus whether the user closed its field with a separator. */
interface TypedDigit {
  char: string;
  /** A separator followed this digit, so whatever field holds it is finished. */
  closes: boolean;
}

/**
 * Reduces the raw text to the digits the user typed. Separators carry no position of
 * their own — they only mark the digit before them as the end of its field, which is
 * how `1402-1-2` stays month 1 / day 2 instead of collapsing into month 12.
 */
function scanDigits(value: string): { digits: TypedDigit[]; trailingSeparator: boolean } {
  const digits: TypedDigit[] = [];
  let trailingSeparator = false;
  for (const char of value) {
    if (ASCII_DIGIT.test(char)) {
      digits.push({ char, closes: false });
      trailingSeparator = false;
      continue;
    }
    const last = digits.at(-1);
    if (!last) continue; // A leading separator has no field to close.
    last.closes = true;
    trailingSeparator = true;
  }
  return { digits, trailingSeparator };
}

/** One rendered chunk of the masked text, tagged by where it came from. */
interface Piece {
  text: string;
  /** `digit` was typed, `pad` was supplied by the mask, `literal` comes from the format. */
  kind: 'digit' | 'pad' | 'literal';
}

/** Flows the typed digits through the compiled segments, one field at a time. */
function runMask(value: string, segments: MaskSegment[], locale: Locale): Piece[] {
  const { digits, trailingSeparator } = scanDigits(value);
  const pieces: Piece[] = [];
  let index = 0;
  /** Whether anything is still waiting to land after what has been consumed. */
  const pending = (): boolean => index < digits.length || trailingSeparator;

  for (const segment of segments) {
    if (segment.kind === 'literal') {
      // A separator is worth showing only once something follows it.
      if (!pending()) break;
      pieces.push({ text: segment.text, kind: 'literal' });
      continue;
    }
    if (index >= digits.length) break;

    let taken = '';
    let closed = false;
    while (index < digits.length && taken.length < segment.width) {
      const next = taken + digits[index]!.char;
      // A second digit that would overflow belongs to the next field: `9` then `5`
      // in `MM` is month 09, day 5 — the same auto-advance a native date input does.
      if (taken.length > 0 && segment.max !== undefined && Number(next) > segment.max) {
        closed = true;
        break;
      }
      taken = next;
      const closes = digits[index]!.closes;
      index++;
      if (closes) {
        closed = true;
        break;
      }
    }

    // A field the user left short is zero-padded once it is definitively closed —
    // never while it is still the field being typed into.
    const short = taken.length < segment.width;
    const text =
      closed && short && segment.pad && pending() ? taken.padStart(segment.width, '0') : taken;
    const padCount = text.length - taken.length;
    for (let i = 0; i < text.length; i++) {
      pieces.push({
        text: locale.formatNumber(text.charAt(i)),
        kind: i < padCount ? 'pad' : 'digit',
      });
    }
  }

  return pieces;
}

/**
 * Places the caret after the same typed digit it sat behind in the raw text, then
 * slides it past any separator that follows so the next keystroke lands in the next
 * field. Pads are skipped in the count — the user never typed them.
 */
function placeCaret(pieces: Piece[], text: string, digitsBefore: number): number {
  let caret = 0;
  let seen = 0;
  let placed = digitsBefore === 0;

  for (const piece of pieces) {
    if (!placed) {
      caret += piece.text.length;
      if (piece.kind !== 'digit') continue;
      seen++;
      if (seen === digitsBefore) placed = true;
      continue;
    }
    if (piece.kind !== 'literal') break;
    caret += piece.text.length;
  }

  return placed ? caret : text.length;
}

/**
 * Flows typed text into `format`, inserting its separators automatically and
 * rendering digits with the locale's numerals.
 *
 * The mask applies only to digit-and-separator text; anything else (prose, a month
 * name being typed) is returned unchanged so the field can flag it invalid rather
 * than destroy it. Typed separators are normalized to the format's own and close the
 * field they follow, so `1402-1-2` in a `YYYY/MM/DD` field becomes `1402/01/2`
 * rather than collapsing into month 12. A field that cannot hold another digit also
 * closes on its own: `95` in `MM` is month 09, day 5.
 *
 * @param value   The current text of the input, in Latin or Persian/Arabic digits.
 * @param format  The format pattern to mask into (same tokens as `DoranDate.format`).
 * @param options Locale, caret position, and the value before this edit.
 *
 * @example
 * ```ts
 * applyFormatMask('14020512', 'YYYY/MM/DD');              // → { text: '1402/05/12', caret: 10 }
 * applyFormatMask('05121402', 'MM-DD-YYYY');               // → { text: '05-12-1402', caret: 10 }
 * applyFormatMask('1402', 'YYYY/MM/DD', { locale: faIR }); // → { text: '۱۴۰۲', caret: 4 }
 * ```
 */
export function applyFormatMask(value: string, format: string, options?: MaskOptions): MaskResult {
  const caretIn = Math.max(0, Math.min(options?.caret ?? value.length, value.length));
  const segments = compileMask(format);
  if (!segments || value === '') return { text: value, caret: caretIn };

  const literalChars = new Set<string>();
  for (const segment of segments) {
    if (segment.kind === 'literal') for (const char of segment.text) literalChars.add(char);
  }
  // normalizeDigits is a 1:1 char substitution, so caret indices stay valid.
  const normalized = normalizeDigits(value);
  for (const char of normalized) {
    if (ASCII_DIGIT.test(char) || SEPARATOR_CHARS.has(char) || literalChars.has(char)) continue;
    return { text: value, caret: caretIn };
  }

  const locale = resolveLocale(options?.locale);
  const render = (work: string, caret: number): MaskResult => {
    const pieces = runMask(work, segments, locale);
    const text = pieces.map((piece) => piece.text).join('');
    return { text, caret: placeCaret(pieces, text, countDigits(work.slice(0, caret))) };
  };

  const first = render(normalized, caretIn);

  // Deleting a separator the mask would immediately put back leaves the text exactly
  // as it was, trapping backspace. When that happens, delete the digit in front of
  // the caret instead, so deletion moves through separators the user never typed.
  const previous = options?.previous;
  if (previous !== undefined && value.length < previous.length && first.text === previous) {
    const before = countDigits(normalized.slice(0, caretIn));
    if (before > 0) return render(dropDigit(normalized, before), caretIn - 1);
  }

  return first;
}
