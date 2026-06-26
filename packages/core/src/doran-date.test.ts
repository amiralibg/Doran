import { afterEach, describe, expect, it } from 'vitest';
import { DoranDate, freeze } from './doran-date';
import { enUS } from './locale';
import type { DoranDateOptions } from './types';

const UTC: DoranDateOptions = { timeZone: 'UTC' };
const UTC_EN: DoranDateOptions = { timeZone: 'UTC', locale: enUS };

describe('DoranDate factories', () => {
  it('builds from Jalali positional arguments', () => {
    const d = DoranDate.fromJalali(1400, 1, 1, UTC);
    expect(d.year).toBe(1400);
    expect(d.month).toBe(1);
    expect(d.day).toBe(1);
  });

  it('builds from a Jalali input object with time', () => {
    const d = DoranDate.fromJalali({ year: 1405, month: 3, day: 11, hour: 7, minute: 30 }, UTC);
    expect(d.toObject()).toMatchObject({ year: 1405, month: 3, day: 11, hour: 7, minute: 30 });
  });

  it('builds from a native Date and converts back', () => {
    const date = new Date('2021-03-21T00:00:00Z');
    const d = DoranDate.fromGregorian(date, UTC);
    expect(d.toObject()).toMatchObject({ year: 1400, month: 1, day: 1 });
    expect(d.toGregorian().toISOString()).toBe('2021-03-21T00:00:00.000Z');
  });

  it('rejects an invalid Date', () => {
    expect(() => DoranDate.fromGregorian(new Date('nonsense'))).toThrow(RangeError);
  });

  it('round-trips through epoch milliseconds', () => {
    const a = DoranDate.fromJalali(1402, 8, 15, UTC);
    const b = DoranDate.fromEpochMs(a.epochMs, UTC);
    expect(b.isSame(a)).toBe(true);
  });
});

describe('invalid-date policy', () => {
  it('fromJalali throws on a non-existent date instead of rolling over', () => {
    // 1404 is not a leap year, so Esfand (month 12) has only 29 days.
    expect(() => DoranDate.fromJalali(1404, 12, 31, UTC)).toThrow(RangeError);
    expect(() => DoranDate.fromJalali(1400, 13, 1, UTC)).toThrow(RangeError);
    expect(() => DoranDate.fromJalali(1400, 1, 0, UTC)).toThrow(RangeError);
  });

  it('fromJalali throws on NaN / non-finite fields', () => {
    expect(() => DoranDate.fromJalali(NaN, 1, 1, UTC)).toThrow(RangeError);
    expect(() => DoranDate.fromJalali({ year: 1400, month: 1, day: 1, hour: NaN }, UTC)).toThrow(
      RangeError,
    );
  });

  it('fromEpochMs throws on NaN', () => {
    expect(() => DoranDate.fromEpochMs(NaN, UTC)).toThrow(RangeError);
  });

  it('tryFromJalali returns null instead of throwing', () => {
    expect(DoranDate.tryFromJalali(1404, 12, 31, UTC)).toBeNull();
    expect(DoranDate.tryFromJalali({ year: 1400, month: 13, day: 1 }, UTC)).toBeNull();
    expect(DoranDate.tryFromJalali(1404, 12, 29, UTC)?.day).toBe(29);
  });

  it('tryFromGregorian returns null on an invalid Date', () => {
    expect(DoranDate.tryFromGregorian(new Date('nonsense'))).toBeNull();
    expect(DoranDate.tryFromGregorian(new Date('2021-03-21T00:00:00Z'), UTC)?.year).toBe(1400);
  });
});

describe('field accessors', () => {
  it('computes the Persian weekday (0 = Saturday)', () => {
    // 2021-03-21 (Nowruz 1400) was a Sunday.
    expect(DoranDate.fromJalali(1400, 1, 1, UTC).dayOfWeek).toBe(1);
  });

  it('computes day of year', () => {
    expect(DoranDate.fromJalali(1400, 1, 1, UTC).dayOfYear).toBe(1);
    expect(DoranDate.fromJalali(1400, 12, 29, UTC).dayOfYear).toBe(365);
    expect(DoranDate.fromJalali(1399, 12, 30, UTC).dayOfYear).toBe(366);
  });

  it('computes quarter and daysInMonth', () => {
    expect(DoranDate.fromJalali(1400, 1, 1, UTC).quarter).toBe(1);
    expect(DoranDate.fromJalali(1400, 7, 1, UTC).quarter).toBe(3);
    expect(DoranDate.fromJalali(1400, 7, 1, UTC).daysInMonth).toBe(30);
    expect(DoranDate.fromJalali(1399, 12, 1, UTC).daysInMonth).toBe(30);
  });

  it('reports leap years', () => {
    expect(DoranDate.fromJalali(1399, 1, 1, UTC).isLeapYear()).toBe(true);
    expect(DoranDate.fromJalali(1400, 1, 1, UTC).isLeapYear()).toBe(false);
  });
});

describe('immutable arithmetic', () => {
  it('does not mutate the original instance', () => {
    const d = DoranDate.fromJalali(1400, 1, 1, UTC);
    d.addDays(5);
    expect(d.day).toBe(1);
  });

  it('adds days across a year boundary', () => {
    const d = DoranDate.fromJalali(1400, 12, 29, UTC).addDays(1);
    expect(d.toObject()).toMatchObject({ year: 1401, month: 1, day: 1 });
  });

  it('clamps the day when adding months', () => {
    const d = DoranDate.fromJalali(1400, 6, 31, UTC).addMonths(1);
    expect(d.toObject()).toMatchObject({ year: 1400, month: 7, day: 30 });
  });

  it('clamps Esfand 30 to 29 when adding years into a common year', () => {
    const d = DoranDate.fromJalali(1399, 12, 30, UTC).addYears(1);
    expect(d.toObject()).toMatchObject({ year: 1400, month: 12, day: 29 });
  });

  it('handles negative month arithmetic', () => {
    const d = DoranDate.fromJalali(1400, 1, 15, UTC).addMonths(-1);
    expect(d.toObject()).toMatchObject({ year: 1399, month: 12, day: 15 });
  });

  it('adds time-based units', () => {
    const base = DoranDate.fromJalali({ year: 1400, month: 1, day: 1, hour: 10 }, UTC);
    expect(base.addHours(15).day).toBe(2);
    expect(base.addMinutes(90).hour).toBe(11);
  });
});

describe('startOf / endOf', () => {
  it('finds the start and end of a day', () => {
    const d = DoranDate.fromJalali({ year: 1400, month: 5, day: 10, hour: 13, minute: 45 }, UTC);
    expect(d.startOf('day').toObject()).toMatchObject({ hour: 0, minute: 0, second: 0 });
    expect(d.endOf('day').toObject()).toMatchObject({
      hour: 23,
      minute: 59,
      second: 59,
      millisecond: 999,
    });
  });

  it('finds the start of a month and year', () => {
    const d = DoranDate.fromJalali(1400, 5, 10, UTC);
    expect(d.startOf('month').day).toBe(1);
    expect(d.startOf('year').toObject()).toMatchObject({ month: 1, day: 1 });
  });

  it('finds the end of a leap-year Esfand', () => {
    const d = DoranDate.fromJalali(1399, 12, 1, UTC).endOf('month');
    expect(d.day).toBe(30);
  });
});

describe('comparison & diff', () => {
  const a = DoranDate.fromJalali(1400, 1, 1, UTC);
  const b = DoranDate.fromJalali(1400, 1, 11, UTC);

  it('compares instants', () => {
    expect(a.isBefore(b)).toBe(true);
    expect(b.isAfter(a)).toBe(true);
    expect(a.compare(b)).toBe(-1);
    expect(a.isSame(a.clone())).toBe(true);
    expect(b.isBetween(a, b)).toBe(true);
  });

  it('compares at a granularity', () => {
    const noon = DoranDate.fromJalali({ year: 1400, month: 1, day: 1, hour: 12 }, UTC);
    expect(a.isSame(noon, 'day')).toBe(true);
    expect(a.isSame(noon)).toBe(false);
  });

  it('computes day difference', () => {
    expect(b.diff(a, 'day')).toBe(10);
    expect(a.diff(b, 'day')).toBe(-10);
  });

  it('computes month and year difference', () => {
    const later = DoranDate.fromJalali(1402, 7, 1, UTC);
    expect(later.diff(a, 'month')).toBe(30);
    expect(later.diff(a, 'year')).toBe(2);
  });
});

describe('formatting', () => {
  it('formats with localized Persian digits by default', () => {
    const d = DoranDate.fromJalali(1400, 1, 1, UTC);
    expect(d.format('YYYY/MM/DD')).toBe('۱۴۰۰/۰۱/۰۱');
  });

  it('formats with Latin digits under the en-US locale', () => {
    const d = DoranDate.fromJalali(1405, 3, 11, UTC_EN);
    expect(d.format('YYYY/MM/DD')).toBe('1405/03/11');
    expect(d.format('dddd D MMMM YYYY')).toBe('Doshanbe 11 Khordad 1405');
  });

  it('formats month and weekday names in Persian', () => {
    const d = DoranDate.fromJalali(1400, 1, 1, UTC);
    expect(d.format('dddd')).toBe('یکشنبه');
    expect(d.format('MMMM')).toBe('فروردین');
  });

  it('honours escaped literals and meridiem', () => {
    const d = DoranDate.fromJalali({ year: 1400, month: 1, day: 1, hour: 19 }, UTC_EN);
    expect(d.format('[ساعت] h A')).toBe('ساعت 7 PM');
  });

  it('toJalaliISO produces a Jalali ISO-like string with offset', () => {
    const d = DoranDate.fromJalali({ year: 1400, month: 1, day: 1, hour: 6, minute: 30 }, UTC_EN);
    expect(d.toJalaliISO()).toBe('1400-01-01T06:30:00.000+00:00');
  });

  it('toISOString produces Gregorian UTC ISO-8601', () => {
    // 1400/01/01 = 2021-03-21
    const d = DoranDate.fromJalali({ year: 1400, month: 1, day: 1, hour: 6, minute: 30 }, UTC_EN);
    expect(d.toISOString()).toBe('2021-03-21T06:30:00.000Z');
  });
});

describe('reconfiguration', () => {
  it('re-expresses the same instant in another time zone', () => {
    const d = DoranDate.fromJalali({ year: 1400, month: 1, day: 1, hour: 0 }, UTC);
    const tehran = d.withTimeZone('Asia/Tehran');
    expect(tehran.epochMs).toBe(d.epochMs);
    // Tehran is UTC+03:30, so local wall-clock is 03:30 the same day.
    expect(tehran.hour).toBe(3);
    expect(tehran.minute).toBe(30);
  });

  it('changes locale without changing the instant', () => {
    const d = DoranDate.fromJalali(1400, 1, 1, UTC);
    expect(d.withLocale(enUS).format('MMMM')).toBe('Farvardin');
  });
});

describe('setters', () => {
  const base = DoranDate.fromJalali({ year: 1405, month: 3, day: 11, hour: 9, minute: 30 }, UTC);

  it('sets a single field with set()', () => {
    expect(base.set('year', 1406).year).toBe(1406);
    expect(base.set('hour', 23).hour).toBe(23);
  });

  it('sets multiple fields with with()', () => {
    const d = base.with({ year: 1406, month: 1, day: 1 });
    expect(d.toObject()).toMatchObject({ year: 1406, month: 1, day: 1, hour: 9, minute: 30 });
  });

  it('clamps the day when moving to a shorter month', () => {
    const endOfTir = DoranDate.fromJalali(1404, 4, 31, UTC); // Tir has 31 days
    expect(endOfTir.withMonth(12).day).toBe(jalaliEsfandLength(1404)); // Esfand has 29/30
  });

  it('withX helpers return new instances', () => {
    expect(base.withMinute(0).minute).toBe(0);
    expect(base.minute).toBe(30); // original unchanged
  });
});

function jalaliEsfandLength(year: number): number {
  return DoranDate.fromJalali(year, 12, 1, UTC).daysInMonth;
}

describe('week starts on Saturday', () => {
  it('startOf("week") is the preceding Saturday', () => {
    // 1405/03/11 — verify the week start is a Saturday (dayOfWeek 0).
    const d = DoranDate.fromJalali(1405, 3, 11, UTC);
    const weekStart = d.startOf('week');
    expect(weekStart.dayOfWeek).toBe(0);
    expect(weekStart.isSameOrBefore(d)).toBe(true);
    expect(d.diff(weekStart, 'day')).toBeLessThan(7);
  });

  it('a Saturday is its own week start', () => {
    const sat = DoranDate.fromJalali(1405, 3, 11, UTC).startOf('week');
    expect(sat.startOf('week').isSame(sat)).toBe(true);
  });
});

describe('quarter', () => {
  it('reports the quarter and its boundaries', () => {
    const d = DoranDate.fromJalali(1405, 8, 15, UTC); // Aban → Q3
    expect(d.quarter).toBe(3);
    expect(d.startOf('quarter').month).toBe(7);
    expect(d.endOf('quarter').month).toBe(9);
  });

  it('adds and diffs by quarter', () => {
    const d = DoranDate.fromJalali(1405, 1, 1, UTC);
    expect(d.add(2, 'quarter').month).toBe(7);
    expect(d.add(2, 'quarter').diff(d, 'quarter')).toBe(2);
  });
});

describe('helpers', () => {
  it('daysInYear reflects leap years', () => {
    expect(DoranDate.fromJalali(1403, 1, 1, UTC).daysInYear).toBe(366); // 1403 is leap
    expect(DoranDate.fromJalali(1404, 1, 1, UTC).daysInYear).toBe(365);
  });

  it('min and max pick the extremes', () => {
    const a = DoranDate.fromJalali(1400, 1, 1, UTC);
    const b = DoranDate.fromJalali(1405, 1, 1, UTC);
    const c = DoranDate.fromJalali(1402, 1, 1, UTC);
    expect(DoranDate.min(a, b, c).isSame(a)).toBe(true);
    expect(DoranDate.max(a, b, c).isSame(b)).toBe(true);
  });

  it('isValid validates Jalali dates', () => {
    expect(DoranDate.isValid(1403, 12, 30)).toBe(true); // leap year
    expect(DoranDate.isValid(1404, 12, 30)).toBe(false); // non-leap
    expect(DoranDate.isValid(1405, 13, 1)).toBe(false);
  });

  it('isBetween respects inclusivity', () => {
    const start = DoranDate.fromJalali(1405, 1, 1, UTC);
    const end = DoranDate.fromJalali(1405, 1, 10, UTC);
    expect(start.isBetween(start, end)).toBe(true); // '[]'
    expect(start.isBetween(start, end, '(]')).toBe(false);
    expect(end.isBetween(start, end, '[)')).toBe(false);
  });

  it('isToday / isTomorrow / isYesterday', () => {
    const now = DoranDate.now(UTC);
    expect(now.isToday()).toBe(true);
    expect(now.addDays(1).isTomorrow()).toBe(true);
    expect(now.addDays(-1).isYesterday()).toBe(true);
  });
});

describe('relative time', () => {
  const ref = DoranDate.fromJalali({ year: 1405, month: 3, day: 11, hour: 12 }, UTC);

  it('humanizes past and future in Persian', () => {
    expect(ref.addDays(-3).from(ref)).toBe('۳ روز پیش');
    expect(ref.addHours(2).from(ref)).toBe('در ۲ ساعت');
  });

  it('supports withoutSuffix and English locale', () => {
    expect(ref.addDays(-3).from(ref, true)).toBe('۳ روز');
    expect(ref.withLocale(enUS).addDays(-3).from(ref.withLocale(enUS))).toBe('3 days ago');
  });
});

describe('quarter token', () => {
  it('formats Q', () => {
    expect(DoranDate.fromJalali(1405, 8, 1, UTC_EN).format('Q')).toBe('3');
  });
});

describe('freezable clock', () => {
  afterEach(() => DoranDate.resetNow());

  const fixed = DoranDate.fromGregorian(new Date('2021-03-21T00:00:00Z'), UTC);

  it('setNow with a fixed instant freezes now() and today-dependent APIs', () => {
    DoranDate.setNow(fixed);
    expect(DoranDate.now(UTC).toObject()).toMatchObject({ year: 1400, month: 1, day: 1 });
    expect(fixed.isToday()).toBe(true);
    expect(fixed.addDays(1).isTomorrow()).toBe(true);
    expect(fixed.addDays(-1).isYesterday()).toBe(true);
  });

  it('accepts number, Date and a function source', () => {
    DoranDate.setNow(fixed.epochMs);
    expect(DoranDate.now(UTC).year).toBe(1400);
    DoranDate.setNow(new Date('2021-03-21T00:00:00Z'));
    expect(DoranDate.now(UTC).year).toBe(1400);
    DoranDate.setNow(() => fixed.epochMs);
    expect(DoranDate.now(UTC).year).toBe(1400);
  });

  it('resetNow restores the real clock', () => {
    DoranDate.setNow(fixed);
    DoranDate.resetNow();
    expect(DoranDate.now().year).toBeGreaterThan(1400);
  });

  it('freeze fixes now() only inside the callback and restores after', () => {
    const before = DoranDate.now().year;
    const result = freeze(fixed, () => DoranDate.now(UTC).year);
    expect(result).toBe(1400);
    expect(DoranDate.now().year).toBe(before);
  });

  it('freeze restores the clock even when the callback throws', () => {
    expect(() =>
      freeze(fixed, () => {
        throw new Error('boom');
      }),
    ).toThrow('boom');
    expect(DoranDate.now().year).toBeGreaterThan(1400);
  });

  it('freeze restores after an async callback settles', async () => {
    await freeze(fixed, async () => {
      expect(DoranDate.now(UTC).year).toBe(1400);
    });
    expect(DoranDate.now().year).toBeGreaterThan(1400);
  });
});

describe('toISOString / toJSON / toGregorianISO', () => {
  // 1400/01/01 in Jalali = 2021-03-21 in Gregorian
  const d = DoranDate.fromGregorian(new Date('2021-03-21T10:30:00.000Z'), UTC);

  it('toISOString returns Gregorian UTC ISO-8601', () => {
    expect(d.toISOString()).toBe('2021-03-21T10:30:00.000Z');
  });

  it('toGregorianISO is an alias for toISOString', () => {
    expect(d.toGregorianISO()).toBe(d.toISOString());
  });

  it('toJSON returns the same Gregorian UTC string', () => {
    expect(d.toJSON()).toBe('2021-03-21T10:30:00.000Z');
  });

  it('JSON.stringify round-trips losslessly', () => {
    const json = JSON.stringify({ d });
    const parsed = JSON.parse(json) as { d: string };
    expect(new Date(parsed.d).toISOString()).toBe(d.toISOString());
  });

  it('toJalaliISO contains the Jalali year (Persian digits in fa-IR)', () => {
    // faIR locale emits Persian digits — 1400 = ۱۴۰۰
    expect(d.toJalaliISO()).toContain('۱۴۰۰');
    expect(d.toJalaliISO()).not.toContain('2021');
  });
});

describe('Gregorian output helpers', () => {
  // 2026-06-01T08:00:00Z
  const d = DoranDate.fromGregorian(new Date('2026-06-01T08:00:00.000Z'), UTC);

  it('toGregorianParts returns correct Gregorian fields', () => {
    const parts = d.toGregorianParts();
    expect(parts.year).toBe(2026);
    expect(parts.month).toBe(6);
    expect(parts.day).toBe(1);
    expect(parts.hour).toBe(8);
  });

  it('formatGregorian formats numeric tokens', () => {
    expect(d.formatGregorian('YYYY-MM-DD')).toBe('2026-06-01');
    expect(d.formatGregorian('YYYY/MM/DD HH:mm:ss')).toBe('2026/06/01 08:00:00');
  });

  it('formatGregorian renders English name tokens with ASCII digits', () => {
    expect(d.formatGregorian('DD MMM YYYY')).toBe('01 Jun 2026');
    expect(d.formatGregorian('dddd D MMMM YYYY')).toBe('Monday 1 June 2026');
    expect(d.formatGregorian('ddd dd')).toBe('Mon Mo');
    expect(d.formatGregorian('Q')).toBe('2');
    expect(d.formatGregorian('h:mm A')).toBe('8:00 AM');
  });

  it('formatGregorian honours escaped literals', () => {
    expect(d.formatGregorian('[Today is] dddd')).toBe('Today is Monday');
  });

  it('unix returns epoch seconds', () => {
    const ms = new Date('2026-06-01T08:00:00.000Z').getTime();
    expect(d.unix()).toBe(Math.floor(ms / 1000));
  });

  it('toMillis returns epoch milliseconds', () => {
    expect(d.toMillis()).toBe(d.epochMs);
  });
});
