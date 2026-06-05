import { describe, expect, it } from 'vitest';
import { DoranDate } from './doran-date';
import { duration, type DurationUnit } from './duration';
import { enUS } from './locale';
import { parseJalali } from './parse';
import type { DoranDateOptions } from './types';

const EN: DoranDateOptions = { timeZone: 'UTC', locale: enUS };

describe('relative-time thresholds (via Duration.humanize)', () => {
  const cases: Array<[number, DurationUnit, string]> = [
    [10, 'second', 'a few seconds'],
    [60, 'second', 'a minute'],
    [10, 'minute', '10 minutes'],
    [80, 'minute', 'an hour'],
    [5, 'hour', '5 hours'],
    [30, 'hour', 'a day'],
    [5, 'day', '5 days'],
    [40, 'day', 'a month'],
    [60, 'day', '2 months'],
    [400, 'day', 'a year'],
    [800, 'day', '2 years'],
  ];

  it.each(cases)('humanizes %d %s as "%s"', (amount, unit, expected) => {
    expect(duration(amount, unit, enUS).humanize()).toBe(expected);
  });
});

describe('Duration unit construction and misc', () => {
  const units: DurationUnit[] = [
    'year',
    'quarter',
    'month',
    'week',
    'day',
    'hour',
    'minute',
    'second',
    'millisecond',
  ];

  it.each(units)('round-trips a single %s', (unit) => {
    expect(duration(1, unit).as(unit)).toBeCloseTo(1, 6);
  });

  it('clones, stringifies, and reads quarter/week fields', () => {
    const d = duration({ months: 7, days: 9 });
    expect(d.clone().asMilliseconds()).toBe(d.asMilliseconds());
    expect(d.toString()).toBe(d.toISOString());
    expect(d.get('quarter')).toBe(2); // 7 months → 2 full quarters
    expect(d.get('week')).toBe(1); // 9 days → 1 full week
    expect(duration(0).asMilliseconds()).toBe(0);
  });
});

describe('format tokens — full sweep', () => {
  // 1403/1/1 14:05 PM, in Tehran so the offset tokens are exercised.
  const d = DoranDate.fromJalali(
    { year: 1403, month: 1, day: 1, hour: 14, minute: 5, second: 9 },
    { timeZone: 'Asia/Tehran', locale: enUS },
  );

  it('renders the short/padded numeric tokens', () => {
    expect(d.format('YY M MMM')).toBe('03 1 Far');
    expect(d.format('h:hh a A')).toBe('2:02 PM PM');
    expect(d.format('m s')).toBe('5 9');
    expect(d.format('ddd dd')).toBe('Cha Ch');
  });

  it('renders the offset tokens', () => {
    expect(d.format('Z')).toMatch(/^[+-]\d\d:\d\d$/);
    expect(d.format('ZZ')).toMatch(/^[+-]\d{4}$/);
  });

  it('leaves unknown letters untouched via the default branch', () => {
    expect(DoranDate.fromJalali(1403, 1, 1, EN).format('[year] YYYY')).toBe('year 1403');
  });
});

describe('parse — meridiem, month name, milliseconds', () => {
  it('parses a 12-hour time with a PM marker', () => {
    const d = parseJalali('1403/01/01 02:30 PM', 'YYYY/MM/DD hh:mm A', EN);
    expect(d?.hour).toBe(14);
    expect(d?.minute).toBe(30);
  });

  it('parses a localized month name and milliseconds', () => {
    const d = parseJalali('1 Farvardin 1403', 'D MMMM YYYY', EN);
    expect(d?.month).toBe(1);
    const ms = parseJalali('1403/01/01 00:00:00.250', 'YYYY/MM/DD HH:mm:ss.SSS');
    expect(ms?.millisecond).toBe(250);
  });
});

describe('serialization defaults', () => {
  const d = DoranDate.fromJalali({ year: 1403, month: 1, day: 1, hour: 9, minute: 30 }, EN);

  it('renders toString / toJSON / toISOString', () => {
    expect(d.toString()).toBe('1403/01/01 09:30:00');
    expect(d.toISOString()).toMatch(/^1403-01-01T09:30:00\.000[+-]\d\d:\d\d$/);
    expect(JSON.parse(JSON.stringify({ at: d }))).toEqual({ at: d.toISOString() });
  });
});
