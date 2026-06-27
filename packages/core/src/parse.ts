import { normalizeDigits } from './digits';
import { DoranDate, type GregorianInput, type JalaliInput } from './doran-date';
import { GREGORIAN_LOCALE } from './format';
import { resolveLocale } from './locale';
import type { DoranDateOptions, Locale } from './types';

/** Matches a format token, a `[literal]`, or any single passthrough character. */
const PARSE_TOKEN = /\[([^\]]*)]|YYYY|YY|MMMM|MMM|MM|M|DD|D|HH|H|hh|h|mm|m|ss|s|SSS|A|a|[\s\S]/g;

type Field =
  | 'year'
  | 'month'
  | 'monthName'
  | 'day'
  | 'hour'
  | 'hour12'
  | 'minute'
  | 'second'
  | 'ms'
  | 'meridiem';

interface CompiledFormat {
  regex: RegExp;
  fields: Field[];
}

/** Parsed civil fields, shared shape between {@link JalaliInput} and {@link GregorianInput}. */
type Parts = JalaliInput & GregorianInput;

/** Options for the parse functions: time zone / locale plus an optional strict toggle. */
export interface ParseOptions extends DoranDateOptions {
  /**
   * When `true`, fixed-width tokens (`YYYY`, `MM`, `DD`, `HH`, `SSS`, …) must
   * match their exact digit count, and no fallback default formats are tried.
   * Partial / loosely-shaped input returns `null`.
   */
  strict?: boolean;
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function compileFormat(format: string, locale: Locale, strict: boolean): CompiledFormat {
  const fields: Field[] = [];
  let source = '^\\s*';

  const monthAlternation = locale.months.map(escapeRegex).join('|');
  const monthShortAlternation = locale.monthsShort.map(escapeRegex).join('|');
  const meridiemAlternation = [...locale.meridiem, 'AM', 'PM', 'am', 'pm']
    .map(escapeRegex)
    .join('|');

  // Strict mode pins double-letter tokens to an exact width; lenient stays 1–2.
  const d2 = strict ? '(\\d{2})' : '(\\d{1,2})';

  for (const match of format.matchAll(PARSE_TOKEN)) {
    const token = match[0];
    const literal = match[1];

    if (literal !== undefined) {
      source += escapeRegex(literal);
      continue;
    }

    switch (token) {
      case 'YYYY':
        source += strict ? '(\\d{4})' : '(\\d{1,4})';
        fields.push('year');
        break;
      case 'YY':
        source += '(\\d{2})';
        fields.push('year');
        break;
      case 'MMMM':
        source += `(${monthAlternation})`;
        fields.push('monthName');
        break;
      case 'MMM':
        source += `(${monthShortAlternation})`;
        fields.push('monthName');
        break;
      case 'MM':
        source += d2;
        fields.push('month');
        break;
      case 'M':
        source += '(\\d{1,2})';
        fields.push('month');
        break;
      case 'DD':
        source += d2;
        fields.push('day');
        break;
      case 'D':
        source += '(\\d{1,2})';
        fields.push('day');
        break;
      case 'HH':
        source += d2;
        fields.push('hour');
        break;
      case 'H':
        source += '(\\d{1,2})';
        fields.push('hour');
        break;
      case 'hh':
        source += d2;
        fields.push('hour12');
        break;
      case 'h':
        source += '(\\d{1,2})';
        fields.push('hour12');
        break;
      case 'mm':
        source += d2;
        fields.push('minute');
        break;
      case 'm':
        source += '(\\d{1,2})';
        fields.push('minute');
        break;
      case 'ss':
        source += d2;
        fields.push('second');
        break;
      case 's':
        source += '(\\d{1,2})';
        fields.push('second');
        break;
      case 'SSS':
        source += strict ? '(\\d{3})' : '(\\d{1,3})';
        fields.push('ms');
        break;
      case 'A':
      case 'a':
        source += `(${meridiemAlternation})`;
        fields.push('meridiem');
        break;
      default:
        source += token === ' ' ? '\\s+' : escapeRegex(token);
    }
  }

  source += '\\s*$';
  return { regex: new RegExp(source), fields };
}

function isPm(value: string, locale: Locale): boolean {
  if (value === locale.meridiem[1]) return true;
  return /pm/i.test(value);
}

/** Extracts civil fields from a match. `yearBase` expands 2-digit years (1400 Jalali / 2000 Gregorian). */
function extractParts(
  match: RegExpExecArray,
  fields: Field[],
  locale: Locale,
  yearBase: number,
): Parts {
  const input: Parts = { year: NaN, month: 1, day: 1 };
  let hour12: number | undefined;
  let pm = false;
  let hasMeridiem = false;

  fields.forEach((field, index) => {
    const raw = match[index + 1] ?? '';
    switch (field) {
      case 'year': {
        const value = Number(raw);
        input.year = raw.length <= 2 ? yearBase + value : value;
        break;
      }
      case 'month':
        input.month = Number(raw);
        break;
      case 'monthName': {
        const full = locale.months.indexOf(raw);
        const short = locale.monthsShort.indexOf(raw);
        input.month = (full !== -1 ? full : short) + 1;
        break;
      }
      case 'day':
        input.day = Number(raw);
        break;
      case 'hour':
        input.hour = Number(raw);
        break;
      case 'hour12':
        hour12 = Number(raw);
        break;
      case 'minute':
        input.minute = Number(raw);
        break;
      case 'second':
        input.second = Number(raw);
        break;
      case 'ms':
        input.millisecond = Number(raw.padEnd(3, '0'));
        break;
      case 'meridiem':
        hasMeridiem = true;
        pm = isPm(raw, locale);
        break;
    }
  });

  if (hour12 !== undefined) {
    let hour = hour12 % 12;
    if (hasMeridiem && pm) hour += 12;
    input.hour = hour;
  }

  return input;
}

const DEFAULT_JALALI_FORMATS = [
  'YYYY/M/D H:m:s',
  'YYYY/M/D H:m',
  'YYYY/M/D',
  'YYYY-M-D H:m:s',
  'YYYY-M-DTH:m:s',
  'YYYY-M-D',
] as const;

const DEFAULT_GREGORIAN_FORMATS = [
  'YYYY-M-DTH:m:s.SSS',
  'YYYY-M-DTH:m:s',
  'YYYY-M-D H:m:s',
  'YYYY-M-DTH:m',
  'YYYY-M-D H:m',
  'YYYY-M-D',
  'YYYY/M/D H:m:s',
  'YYYY/M/D',
] as const;

/** Shared engine: tries each format in turn, constructing via `build` (which validates). */
function parseWith(
  input: string,
  format: string | undefined,
  defaults: readonly string[],
  locale: Locale,
  yearBase: number,
  strict: boolean,
  build: (parts: Parts) => DoranDate | null,
): DoranDate | null {
  const normalized = normalizeDigits(input).trim();
  // Strict mode never falls back to the default format list — it needs an explicit shape.
  const formats = format ? [format] : strict ? [] : defaults;

  for (const fmt of formats) {
    const compiled = compileFormat(fmt, locale, strict);
    const match = compiled.regex.exec(normalized);
    if (!match) continue;
    const date = build(extractParts(match, compiled.fields, locale, yearBase));
    if (date) return date;
  }

  return null;
}

/**
 * Parses a Jalali date string into a {@link DoranDate}, or returns `null` if it
 * cannot be parsed.
 *
 * @param input  The string to parse. Persian/Arabic digits are normalized first.
 * @param format Optional explicit format pattern (same tokens as {@link DoranDate.format}).
 *               When omitted, a set of common numeric formats is tried in turn.
 * @param options Time zone / locale, plus `strict` to require an exact token-width match.
 *
 * @example
 * ```ts
 * parseJalali('1405/03/11');
 * parseJalali('۱۴۰۵-۰۳-۱۱ ۰۷:۳۰');
 * parseJalali('11 خرداد 1405', 'D MMMM YYYY');
 * parseJalali('1405/3/1', 'YYYY/MM/DD', { strict: true }); // → null (M is one digit)
 * ```
 */
export function parseJalali(
  input: string,
  format?: string,
  options?: ParseOptions,
): DoranDate | null {
  const locale = resolveLocale(options?.locale);
  return parseWith(
    input,
    format,
    DEFAULT_JALALI_FORMATS,
    locale,
    1400,
    options?.strict ?? false,
    (parts) => DoranDate.tryFromJalali(parts, options),
  );
}

/**
 * Parses a Gregorian date string into a {@link DoranDate}, or returns `null` if
 * it cannot be parsed. The Gregorian counterpart to {@link parseJalali} —
 * consistent across engines, unlike `new Date(string)`.
 *
 * @param input  The string to parse. Persian/Arabic digits are normalized first.
 * @param format Optional explicit format pattern. When omitted, common ISO-style
 *               formats are tried in turn.
 * @param options Time zone / locale, plus `strict` to require an exact token-width match.
 *
 * @example
 * ```ts
 * parseGregorian('2026-05-31');
 * parseGregorian('2026-05-31 10:09:05');
 * parseGregorian('31 May 2026', 'D MMMM YYYY');
 * parseGregorian('2026-5-31', 'YYYY-MM-DD', { strict: true }); // → null
 * ```
 */
export function parseGregorian(
  input: string,
  format?: string,
  options?: ParseOptions,
): DoranDate | null {
  // Gregorian names are always English; ignore a Jalali locale for token matching.
  return parseWith(
    input,
    format,
    DEFAULT_GREGORIAN_FORMATS,
    GREGORIAN_LOCALE,
    2000,
    options?.strict ?? false,
    (parts) => DoranDate.tryFromGregorianParts(parts, options),
  );
}

/**
 * Unified parser with explicit calendar selection. Defaults to Jalali; pass
 * `{ calendar: 'gregorian' }` to parse Gregorian input.
 *
 * @example
 * ```ts
 * parse('1405/03/11');
 * parse('2026-05-31', undefined, { calendar: 'gregorian' });
 * ```
 */
export function parse(
  input: string,
  format?: string,
  options?: ParseOptions & { calendar?: 'jalali' | 'gregorian' },
): DoranDate | null {
  return options?.calendar === 'gregorian'
    ? parseGregorian(input, format, options)
    : parseJalali(input, format, options);
}
