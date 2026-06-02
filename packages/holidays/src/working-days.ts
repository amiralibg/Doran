import {
  addWorkingDays as coreAddWorkingDays,
  isWorkingDay as coreIsWorkingDay,
  nextWorkingDay as coreNextWorkingDay,
  previousWorkingDay as corePreviousWorkingDay,
  workingDaysBetween as coreWorkingDaysBetween,
  type DoranDate,
  type WorkingDayOptions,
} from '@doranjs/core';
import { isHoliday } from './holidays';

/**
 * Holiday-aware working-day helpers. These are thin wrappers over the `@doranjs/core`
 * working-day engine that default the `holidays` predicate to this package's
 * {@link isHoliday} (official Iranian public holidays). Pass your own `holidays` to
 * override, or `weekends` to change the weekend set (defaults to Friday only).
 *
 * @example
 * ```ts
 * import { addWorkingDays, isWorkingDay } from '@doranjs/holidays';
 * isWorkingDay(DoranDate.now());      // false on Fridays and official holidays
 * addWorkingDays(DoranDate.now(), 3); // three working days ahead, holidays skipped
 * ```
 */

/** Fills in `holidays` with the package's official-holiday predicate when omitted. */
function withHolidays(options: WorkingDayOptions = {}): WorkingDayOptions {
  return { ...options, holidays: options.holidays ?? isHoliday };
}

/** Whether a day is a working day — not a weekend and not an official holiday. */
export function isWorkingDay(date: DoranDate, options?: WorkingDayOptions): boolean {
  return coreIsWorkingDay(date, withHolidays(options));
}

/** Adds `count` working days, skipping weekends and official holidays. */
export function addWorkingDays(
  date: DoranDate,
  count: number,
  options?: WorkingDayOptions,
): DoranDate {
  return coreAddWorkingDays(date, count, withHolidays(options));
}

/** The first working day strictly after `date`. */
export function nextWorkingDay(date: DoranDate, options?: WorkingDayOptions): DoranDate {
  return coreNextWorkingDay(date, withHolidays(options));
}

/** The first working day strictly before `date`. */
export function previousWorkingDay(date: DoranDate, options?: WorkingDayOptions): DoranDate {
  return corePreviousWorkingDay(date, withHolidays(options));
}

/** Counts working days in the half-open range `[start, end)`, order-independent. */
export function workingDaysBetween(
  start: DoranDate,
  end: DoranDate,
  options?: WorkingDayOptions,
): number {
  return coreWorkingDaysBetween(start, end, withHolidays(options));
}
