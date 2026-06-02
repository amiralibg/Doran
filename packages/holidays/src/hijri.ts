/**
 * Arithmetic (tabular) Hijri ↔ Julian Day Number conversion.
 *
 * Iran's official religious holidays follow the *observational* lunar calendar, which
 * is announced each year and can differ from any arithmetic rule by ±1 day. This
 * module implements the standard tabular Islamic calendar, calibrated to a known
 * anchor, so religious holidays can be *computed* for any year — always flagged as
 * approximate. For day-precise official dates, register them explicitly.
 */

import { gregorianToJdn } from '@doranjs/core';

/** Day-offset of a tabular Hijri date from the calendar's (uncalibrated) origin. */
function hijriOffset(year: number, month: number, day: number): number {
  return (
    day + Math.ceil(29.5 * (month - 1)) + (year - 1) * 354 + Math.floor((3 + 11 * year) / 30) - 1
  );
}

/**
 * Calibrated so that 1 Muharram 1447 AH maps to 26 June 2025 — the Islamic New Year
 * as announced for Iran. Anchoring to the current era keeps the bulk of today's
 * religious holidays aligned with Iran's official (sighting-based) calendar; the
 * tabular rule can still differ by ±1 day for sighting-sensitive days such as Eid
 * al-Fitr, which is why lunar holidays are flagged `approximate`.
 */
const ISLAMIC_EPOCH_JDN = gregorianToJdn(2025, 6, 26) - hijriOffset(1447, 1, 1);

/** Converts a tabular Hijri date to a Julian Day Number. */
export function hijriToJdn(year: number, month: number, day: number): number {
  return hijriOffset(year, month, day) + ISLAMIC_EPOCH_JDN;
}

/** Converts a Julian Day Number to a tabular Hijri date. */
export function jdnToHijri(jdn: number): { year: number; month: number; day: number } {
  const days = jdn - ISLAMIC_EPOCH_JDN;
  const year = Math.floor((30 * days + 10646) / 10631);
  const month = Math.min(12, Math.max(1, Math.ceil((jdn - (hijriToJdn(year, 1, 1) - 1)) / 29.5)));
  const day = jdn - hijriToJdn(year, month, 1) + 1;
  return { year, month, day };
}

/**
 * The number of days in a tabular Hijri month (29 or 30). Useful for clamping a
 * holiday that is conventionally "the last day of the month" (e.g. آخر صفر) so it
 * never overflows into the following month.
 */
export function hijriMonthLength(year: number, month: number): number {
  return hijriToJdn(year, month + 1, 1) - hijriToJdn(year, month, 1);
}
