import type { DoranDate } from './doran-date';

/** Options controlling which days count as working days. */
export interface WorkingDayOptions {
  /**
   * Weekday indices treated as the weekend (0 = Saturday … 6 = Friday). Defaults to
   * `[6]` (Friday), the Iranian weekend.
   */
  weekends?: number[];
  /**
   * Predicate marking additional non-working days, typically public holidays. Inject
   * `isHoliday` from `@doranjs/holidays` (or use the pre-bound helpers it exports) to
   * make these functions holiday-aware while keeping `@doranjs/core` dependency-free.
   */
  holidays?: (date: DoranDate) => boolean;
}

const DEFAULT_WEEKENDS = [6];

/** Whether a day falls on the weekend (Friday by default). Ignores holidays. */
export function isWeekend(date: DoranDate, weekends: number[] = DEFAULT_WEEKENDS): boolean {
  return weekends.includes(date.dayOfWeek);
}

/** Whether a day is a working day: neither a weekend nor (optionally) a holiday. */
export function isWorkingDay(date: DoranDate, options: WorkingDayOptions = {}): boolean {
  const { weekends = DEFAULT_WEEKENDS, holidays } = options;
  if (weekends.includes(date.dayOfWeek)) return false;
  if (holidays?.(date)) return false;
  return true;
}

/**
 * Adds `count` working days to a date, skipping weekends and holidays. The starting
 * day is never counted; `count` may be negative to move backwards. The time-of-day is
 * preserved.
 *
 * @example
 * ```ts
 * // Two working days after a Wednesday (with Friday weekend) is the following Sunday.
 * addWorkingDays(wednesday, 2);
 * ```
 */
export function addWorkingDays(
  date: DoranDate,
  count: number,
  options: WorkingDayOptions = {},
): DoranDate {
  if (count === 0) return date;
  const step = count < 0 ? -1 : 1;
  let remaining = Math.abs(count);
  let result = date;
  // Guard against a configuration where every day is non-working (infinite loop).
  let guard = 0;
  const limit = remaining * 7 + 3700;
  while (remaining > 0) {
    result = result.addDays(step);
    if (isWorkingDay(result, options)) remaining -= 1;
    guard += 1;
    if (guard > limit) {
      throw new RangeError(
        'addWorkingDays: no working day found — every day appears to be a weekend or holiday.',
      );
    }
  }
  return result;
}

/** The first working day strictly after `date`. */
export function nextWorkingDay(date: DoranDate, options?: WorkingDayOptions): DoranDate {
  return addWorkingDays(date, 1, options);
}

/** The first working day strictly before `date`. */
export function previousWorkingDay(date: DoranDate, options?: WorkingDayOptions): DoranDate {
  return addWorkingDays(date, -1, options);
}

/**
 * Counts the working days in the half-open day range between `start` and `end`
 * (start-inclusive, end-exclusive). Order-independent: the result is always
 * non-negative, so `workingDaysBetween(a, b)` equals `workingDaysBetween(b, a)`.
 */
export function workingDaysBetween(
  start: DoranDate,
  end: DoranDate,
  options: WorkingDayOptions = {},
): number {
  const from = start.startOf('day');
  const to = end.startOf('day');
  if (from.isSame(to, 'day')) return 0;
  const ascending = from.isBefore(to);
  const lo = ascending ? from : to;
  const hi = ascending ? to : from;

  let count = 0;
  let cursor = lo;
  while (cursor.isBefore(hi)) {
    if (isWorkingDay(cursor, options)) count += 1;
    cursor = cursor.addDays(1);
  }
  return count;
}
