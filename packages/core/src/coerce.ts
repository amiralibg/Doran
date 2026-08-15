import { DoranDate, isDoranDate } from './doran-date';
import { enUS } from './locale';
import { parseGregorian, parseJalali } from './parse';
import type { DoranDateOptions } from './types';

/**
 * Above this, a leading year is Gregorian rather than Jalali.
 *
 * The two calendars are ~621 years apart, so their strings are ambiguous on shape
 * alone: `parseJalali('2025-08-03')` happily reads a Jalali year 2025. Nothing
 * distinguishes them but magnitude. Jalali 1700 lands in Gregorian 2321 and
 * Gregorian 1700 predates any plausible input, so the gap between them is wide and
 * empty — which makes this a safe split rather than a guess.
 */
const GREGORIAN_YEAR_FLOOR = 1700;

/**
 * Anything a component will accept where a date is expected.
 *
 * Components take the loose form and hand back whatever their `valueFormat` asks
 * for — accepting only `DoranDate` forces every consumer storing an ISO string for
 * a query param to write a conversion wrapper.
 */
export type DateInput = DoranDate | Date | string | number;

/** How a component should express the dates it hands back. */
export type ValueFormat =
  | 'doran'
  | 'date'
  | 'iso'
  // Any other string is treated as a format pattern, e.g. `'YYYY-MM-DD'`.
  | (string & {});

/** The value type a given {@link ValueFormat} produces. */
export type FormattedValue<F extends ValueFormat> = F extends 'doran'
  ? DoranDate
  : F extends 'date'
    ? Date
    : string;

/**
 * Coerces loose input into a {@link DoranDate}, or `null` when it can't be read.
 *
 * Strings are tried as Jalali first and Gregorian second, so both `'1404/05/12'`
 * and `'2025-08-03'` work without the caller declaring which they have. Numbers are
 * epoch milliseconds.
 */
export function toDoranDate(
  input: DateInput | null | undefined,
  options?: DoranDateOptions,
): DoranDate | null {
  if (input === null || input === undefined) return null;

  // Brand rather than `instanceof`, so a date from another installed copy of core is
  // still recognized instead of being re-parsed or dropped.
  if (isDoranDate(input)) return input;
  if (input instanceof Date) {
    return Number.isNaN(input.getTime()) ? null : DoranDate.fromGregorian(input, options);
  }
  if (typeof input === 'number') {
    return Number.isFinite(input) ? DoranDate.fromEpochMs(input, options) : null;
  }

  const text = input.trim();
  if (text === '') return null;

  // Jalali first, since a Persian app's strings are far more often `1404/05/12` than
  // `2025-08-03` — but a Jalali parse of an ISO string succeeds too, so an
  // implausible year means we actually had Gregorian.
  const asJalali = parseJalali(text, undefined, options);
  if (asJalali && asJalali.year < GREGORIAN_YEAR_FLOOR) return asJalali;

  return parseGregorian(text, undefined, options) ?? asJalali;
}

/**
 * Expresses a date in the requested {@link ValueFormat}.
 *
 * `'doran'` returns the `DoranDate` itself, `'date'` a native `Date`, `'iso'` a
 * Gregorian UTC ISO-8601 string, and any other string is used as a Jalali format
 * pattern.
 *
 * Pattern output always uses Latin digits, whatever the display locale: this value
 * is bound for a query string, a form field, or an API — somewhere `۱۴۰۴-۰۵-۱۲`
 * would not survive. Format for display with `DoranDate.format` instead.
 */
export function formatValue<F extends ValueFormat>(
  date: DoranDate | null,
  format: F,
): FormattedValue<F> | null {
  if (!date) return null;

  if (format === 'doran') return date as FormattedValue<F>;
  if (format === 'date') return date.toGregorian() as FormattedValue<F>;
  if (format === 'iso') return date.toISOString() as FormattedValue<F>;

  return date.withLocale(enUS).format(format) as FormattedValue<F>;
}
