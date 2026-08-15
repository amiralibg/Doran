/**
 * A per-year holiday index.
 *
 * `getHolidaysOn()` resolves an entire Jalali year on every call, and the calendar
 * elements were calling it once per rendered cell — 42 full-year rebuilds per render,
 * multiplied again by `number-of-months`. This caches each year the first time it is
 * needed and reuses it thereafter.
 */

import { dayKey, type DoranDate } from '@doranjs/core';
import { getHolidays } from '@doranjs/holidays';

const years = new Map<number, Set<string>>();

function indexFor(year: number): Set<string> {
  let index = years.get(year);
  if (!index) {
    index = new Set(
      getHolidays(year).map((holiday) => `${holiday.year}-${holiday.month}-${holiday.day}`),
    );
    years.set(year, index);
  }
  return index;
}

/** Whether any holiday falls on the given date. */
export function hasHolidayOn(date: DoranDate): boolean {
  return indexFor(date.year).has(dayKey(date));
}

/**
 * Drops the cache. Call after registering custom holidays, since those change what
 * `getHolidays` returns for years already indexed.
 */
export function clearHolidayCache(): void {
  years.clear();
}
