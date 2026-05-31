import { isValidJalaliDate } from './conversion';
import { normalizeDigits } from './digits';
import { DoranDate, type JalaliInput } from './doran-date';
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

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function compileFormat(format: string, locale: Locale): CompiledFormat {
  const fields: Field[] = [];
  let source = '^\\s*';

  const monthAlternation = locale.months.map(escapeRegex).join('|');
  const monthShortAlternation = locale.monthsShort.map(escapeRegex).join('|');
  const meridiemAlternation = [...locale.meridiem, 'AM', 'PM', 'am', 'pm']
    .map(escapeRegex)
    .join('|');

  for (const match of format.matchAll(PARSE_TOKEN)) {
    const token = match[0];
    const literal = match[1];

    if (literal !== undefined) {
      source += escapeRegex(literal);
      continue;
    }

    switch (token) {
      case 'YYYY':
        source += '(\\d{1,4})';
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
      case 'M':
        source += '(\\d{1,2})';
        fields.push('month');
        break;
      case 'DD':
      case 'D':
        source += '(\\d{1,2})';
        fields.push('day');
        break;
      case 'HH':
      case 'H':
        source += '(\\d{1,2})';
        fields.push('hour');
        break;
      case 'hh':
      case 'h':
        source += '(\\d{1,2})';
        fields.push('hour12');
        break;
      case 'mm':
      case 'm':
        source += '(\\d{1,2})';
        fields.push('minute');
        break;
      case 'ss':
      case 's':
        source += '(\\d{1,2})';
        fields.push('second');
        break;
      case 'SSS':
        source += '(\\d{1,3})';
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

function applyMatch(match: RegExpExecArray, fields: Field[], locale: Locale): JalaliInput | null {
  const input: JalaliInput = { year: NaN, month: 1, day: 1 };
  let hour12: number | undefined;
  let pm = false;
  let hasMeridiem = false;

  fields.forEach((field, index) => {
    const raw = match[index + 1] ?? '';
    switch (field) {
      case 'year': {
        const value = Number(raw);
        input.year = raw.length <= 2 ? 1400 + value : value;
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

  if (Number.isNaN(input.year) || !isValidJalaliDate(input.year, input.month, input.day)) {
    return null;
  }
  return input;
}

const DEFAULT_FORMATS = [
  'YYYY/M/D H:m:s',
  'YYYY/M/D H:m',
  'YYYY/M/D',
  'YYYY-M-D H:m:s',
  'YYYY-M-DTH:m:s',
  'YYYY-M-D',
] as const;

/**
 * Parses a Jalali date string into a {@link DoranDate}, or returns `null` if it
 * cannot be parsed.
 *
 * @param input  The string to parse. Persian/Arabic digits are normalized first.
 * @param format Optional explicit format pattern (same tokens as {@link DoranDate.format}).
 *               When omitted, a set of common numeric formats is tried in turn.
 *
 * @example
 * ```ts
 * parseJalali('1405/03/11');
 * parseJalali('۱۴۰۵-۰۳-۱۱ ۰۷:۳۰');
 * parseJalali('11 خرداد 1405', 'D MMMM YYYY');
 * ```
 */
export function parseJalali(
  input: string,
  format?: string,
  options?: DoranDateOptions,
): DoranDate | null {
  const locale = resolveLocale(options?.locale);
  const normalized = normalizeDigits(input).trim();
  const formats = format ? [format] : DEFAULT_FORMATS;

  for (const fmt of formats) {
    const compiled = compileFormat(fmt, locale);
    const match = compiled.regex.exec(normalized);
    if (!match) continue;
    const parsed = applyMatch(match, compiled.fields, locale);
    if (parsed) {
      return DoranDate.fromJalali(parsed, options);
    }
  }

  return null;
}
