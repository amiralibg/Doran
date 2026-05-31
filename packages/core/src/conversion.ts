/**
 * Solar Hijri (Jalali) ↔ Gregorian conversion.
 *
 * This is a typed, documented port of the widely-used and battle-tested algorithm
 * by Kazimierz M. Borkowski / Behrang Noruzi Niya (the same algorithm that powers
 * `jalaali-js`, `moment-jalaali`, and friends). It is accurate for Jalali years in
 * the range [-61, 3177], which comfortably covers every practical use of the
 * calendar.
 *
 * The intermediate representation is the **Julian Day Number** (JDN): the integer
 * count of days since the Julian epoch. Working through JDN makes both directions
 * of conversion exact and makes day-based arithmetic trivial.
 */

import type { GregorianParts, JalaliParts } from './types';

/** Integer division that truncates toward zero (matches the reference algorithm). */
function div(a: number, b: number): number {
  return Math.trunc(a / b);
}

/** Modulo that follows the sign of the reference algorithm (truncated division). */
function mod(a: number, b: number): number {
  return a - Math.trunc(a / b) * b;
}

/**
 * Jalali years where a leap-year break occurs. Used to determine, for any Jalali
 * year, how many leap years precede it and on which Gregorian day Farvardin 1 falls.
 */
const BREAKS = [
  -61, 9, 38, 199, 426, 686, 756, 818, 1111, 1181, 1210, 1635, 2060, 2097, 2192, 2262, 2326, 2394,
  2456, 3178,
] as const;

interface JalaliCalendar {
  /** 0 if the year is a leap year, otherwise the number of years until the next leap year. */
  leap: number;
  /** The Gregorian year that contains Farvardin 1 of the given Jalali year. */
  gy: number;
  /** The Gregorian day of March on which that Jalali year begins. */
  march: number;
}

/**
 * This determines if the Jalali year is leap (366 days) or not, and finds the day
 * in March (Gregorian) of the first day of that Jalali year.
 *
 * @throws {RangeError} when the year falls outside the supported range.
 */
function jalCal(jy: number, withoutLeap = false): JalaliCalendar {
  const bl = BREAKS.length;
  const gy = jy + 621;
  let leapJ = -14;
  let jp: number = BREAKS[0]!;

  if (jy < jp || jy >= BREAKS[bl - 1]!) {
    throw new RangeError(
      `Jalali year ${jy} is out of the supported range [${jp}, ${BREAKS[bl - 1]!}).`,
    );
  }

  let jump = 0;
  let jm = 0;
  for (let i = 1; i < bl; i += 1) {
    jm = BREAKS[i]!;
    jump = jm - jp;
    if (jy < jm) break;
    leapJ = leapJ + div(jump, 33) * 8 + div(mod(jump, 33), 4);
    jp = jm;
  }
  let n = jy - jp;

  leapJ = leapJ + div(n, 33) * 8 + div(mod(n, 33) + 3, 4);
  if (mod(jump, 33) === 4 && jump - n === 4) {
    leapJ += 1;
  }

  const leapG = div(gy, 4) - div((div(gy, 100) + 1) * 3, 4) - 150;
  const march = 20 + leapJ - leapG;

  let leap = 0;
  if (!withoutLeap) {
    if (jump - n < 6) {
      n = n - jump + div(jump + 4, 33) * 33;
    }
    leap = mod(mod(n + 1, 33) - 1, 4);
    if (leap === -1) {
      leap = 4;
    }
  }

  return { leap, gy, march };
}

/** Converts a Gregorian calendar date to a Julian Day Number. */
export function gregorianToJdn(gy: number, gm: number, gd: number): number {
  let d =
    div((gy + div(gm - 8, 6) + 100100) * 1461, 4) +
    div(153 * mod(gm + 9, 12) + 2, 5) +
    gd -
    34840408;
  d = d - div(div(gy + 100100 + div(gm - 8, 6), 100) * 3, 4) + 752;
  return d;
}

/** Converts a Julian Day Number to a Gregorian calendar date. */
export function jdnToGregorian(jdn: number): GregorianParts {
  let j = 4 * jdn + 139361631;
  j = j + div(div(4 * jdn + 183187720, 146097) * 3, 4) * 4 - 3908;
  const i = div(mod(j, 1461), 4) * 5 + 308;
  const gd = div(mod(i, 153), 5) + 1;
  const gm = mod(div(i, 153), 12) + 1;
  const gy = div(j, 1461) - 100100 + div(8 - gm, 6);
  return { year: gy, month: gm, day: gd };
}

/** Converts a Jalali calendar date to a Julian Day Number. */
export function jalaliToJdn(jy: number, jm: number, jd: number): number {
  const r = jalCal(jy, true);
  return gregorianToJdn(r.gy, 3, r.march) + (jm - 1) * 31 - div(jm, 7) * (jm - 7) + jd - 1;
}

/** Converts a Julian Day Number to a Jalali calendar date. */
export function jdnToJalali(jdn: number): JalaliParts {
  const gy = jdnToGregorian(jdn).year;
  let jy = gy - 621;
  const r = jalCal(jy, false);
  const jdn1f = gregorianToJdn(gy, 3, r.march);
  let k = jdn - jdn1f;

  if (k >= 0) {
    if (k <= 185) {
      const jm = 1 + div(k, 31);
      const jd = mod(k, 31) + 1;
      return { year: jy, month: jm, day: jd };
    }
    k -= 186;
  } else {
    jy -= 1;
    k += 179;
    if (r.leap === 1) k += 1;
  }
  const jm = 7 + div(k, 30);
  const jd = mod(k, 30) + 1;
  return { year: jy, month: jm, day: jd };
}

/** Converts Gregorian date parts directly to Jalali date parts. */
export function gregorianToJalali(gy: number, gm: number, gd: number): JalaliParts {
  return jdnToJalali(gregorianToJdn(gy, gm, gd));
}

/** Converts Jalali date parts directly to Gregorian date parts. */
export function jalaliToGregorian(jy: number, jm: number, jd: number): GregorianParts {
  return jdnToGregorian(jalaliToJdn(jy, jm, jd));
}

/**
 * Returns the day of week for a Gregorian date using Zeller's congruence.
 * The result is `0 = Saturday … 6 = Friday`, which is exactly the Persian week
 * convention (the week begins on Saturday / شنبه).
 */
export function gregorianWeekday(gy: number, gm: number, gd: number): number {
  let m = gm;
  let y = gy;
  if (m < 3) {
    m += 12;
    y -= 1;
  }
  const k = mod(y, 100);
  const j = div(y, 100);
  const h = mod(gd + div(13 * (m + 1), 5) + k + div(k, 4) + div(j, 4) + 5 * j, 7);
  return mod(h, 7);
}

/** Returns `true` if the given Jalali year is a leap year (366 days). */
export function isLeapJalaliYear(jy: number): boolean {
  return jalCal(jy, false).leap === 0;
}

/**
 * Returns the number of days in the given Jalali month.
 * Months 1–6 have 31 days, months 7–11 have 30 days, and Esfand (12) has 29 days,
 * or 30 in a leap year.
 */
export function jalaliMonthLength(jy: number, jm: number): number {
  if (jm < 1 || jm > 12) {
    throw new RangeError(`Jalali month must be between 1 and 12, received ${jm}.`);
  }
  if (jm <= 6) return 31;
  if (jm <= 11) return 30;
  return isLeapJalaliYear(jy) ? 30 : 29;
}

/** Returns `true` if the given Jalali date is a real calendar date. */
export function isValidJalaliDate(jy: number, jm: number, jd: number): boolean {
  if (jm < 1 || jm > 12 || jd < 1) return false;
  try {
    return jd <= jalaliMonthLength(jy, jm);
  } catch {
    return false;
  }
}
