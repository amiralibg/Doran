import { describe, expect, it } from 'vitest';
import {
  gregorianToJalali,
  gregorianWeekday,
  isLeapJalaliYear,
  isValidJalaliDate,
  jalaliMonthLength,
  jalaliToGregorian,
  jalaliToJdn,
  jdnToJalali,
} from './conversion';

/**
 * Reference pairs verified against multiple independent sources.
 * Format: [jalali Y/M/D, gregorian Y/M/D, note]
 */
const REFERENCE_DATES: Array<[[number, number, number], [number, number, number], string]> = [
  [[1400, 1, 1], [2021, 3, 21], 'Nowruz 1400'],
  [[1399, 1, 1], [2020, 3, 20], 'Nowruz 1399 (leap year start)'],
  [[1403, 1, 1], [2024, 3, 20], 'Nowruz 1403'],
  [[1357, 11, 22], [1979, 2, 11], '22 Bahman 1357 — 1979 revolution'],
  [[1304, 10, 11], [1926, 1, 1], 'Start of 1926'],
  [[1399, 12, 30], [2021, 3, 20], 'Leap-year Esfand 30'],
];

describe('Gregorian ↔ Jalali conversion', () => {
  it.each(REFERENCE_DATES)('converts %j to Gregorian (%s)', (jalali, gregorian) => {
    const [jy, jm, jd] = jalali;
    const [gy, gm, gd] = gregorian;
    expect(jalaliToGregorian(jy, jm, jd)).toEqual({ year: gy, month: gm, day: gd });
  });

  it.each(REFERENCE_DATES)('converts %j from Gregorian (%s)', (jalali, gregorian) => {
    const [jy, jm, jd] = jalali;
    const [gy, gm, gd] = gregorian;
    expect(gregorianToJalali(gy, gm, gd)).toEqual({ year: jy, month: jm, day: jd });
  });

  it('round-trips every day across several years without drift', () => {
    let jdn = jalaliToJdn(1395, 1, 1);
    const end = jalaliToJdn(1410, 1, 1);
    for (; jdn <= end; jdn += 1) {
      const jalali = jdnToJalali(jdn);
      const back = jalaliToJdn(jalali.year, jalali.month, jalali.day);
      expect(back).toBe(jdn);
    }
  });
});

describe('leap years', () => {
  it.each([1399, 1403, 1408, 1412])('treats %i as a leap year', (year) => {
    expect(isLeapJalaliYear(year)).toBe(true);
  });

  it.each([1400, 1401, 1402, 1404, 1405])('treats %i as a common year', (year) => {
    expect(isLeapJalaliYear(year)).toBe(false);
  });

  it('gives Esfand 30 days only in leap years', () => {
    expect(jalaliMonthLength(1399, 12)).toBe(30);
    expect(jalaliMonthLength(1400, 12)).toBe(29);
  });
});

describe('jalaliMonthLength', () => {
  it('returns 31 for the first six months', () => {
    for (let m = 1; m <= 6; m += 1) expect(jalaliMonthLength(1400, m)).toBe(31);
  });

  it('returns 30 for months 7–11', () => {
    for (let m = 7; m <= 11; m += 1) expect(jalaliMonthLength(1400, m)).toBe(30);
  });

  it('throws for an invalid month', () => {
    expect(() => jalaliMonthLength(1400, 13)).toThrow(RangeError);
  });
});

describe('isValidJalaliDate', () => {
  it('accepts real dates', () => {
    expect(isValidJalaliDate(1399, 12, 30)).toBe(true);
    expect(isValidJalaliDate(1400, 7, 30)).toBe(true);
  });

  it('rejects impossible dates', () => {
    expect(isValidJalaliDate(1400, 12, 30)).toBe(false);
    expect(isValidJalaliDate(1400, 7, 31)).toBe(false);
    expect(isValidJalaliDate(1400, 13, 1)).toBe(false);
    expect(isValidJalaliDate(1400, 0, 1)).toBe(false);
  });
});

describe('gregorianWeekday', () => {
  it('returns 0 for Saturday (Persian week start)', () => {
    // 2000-01-01 was a Saturday.
    expect(gregorianWeekday(2000, 1, 1)).toBe(0);
  });

  it('maps 2021-03-21 (Nowruz 1400) to Sunday = 1', () => {
    expect(gregorianWeekday(2021, 3, 21)).toBe(1);
  });
});
