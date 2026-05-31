import { describe, expect, it } from 'vitest';
import { DoranDate } from './doran-date';
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

  it('produces an ISO-like string with offset', () => {
    const d = DoranDate.fromJalali({ year: 1400, month: 1, day: 1, hour: 6, minute: 30 }, UTC_EN);
    expect(d.toISOString()).toBe('1400-01-01T06:30:00.000+00:00');
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
