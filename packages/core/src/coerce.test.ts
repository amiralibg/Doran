import { describe, expect, it } from 'vitest';

import { formatValue, toDoranDate } from './coerce';
import { DoranDate } from './doran-date';

const UTC = { timeZone: 'UTC' };
const jalali = DoranDate.fromJalali({ year: 1404, month: 5, day: 12 }, UTC);

describe('toDoranDate', () => {
  it('passes a DoranDate through untouched', () => {
    expect(toDoranDate(jalali)).toBe(jalali);
  });

  it('reads a native Date', () => {
    const gregorian = jalali.toGregorian();
    const result = toDoranDate(gregorian, UTC)!;
    expect([result.year, result.month, result.day]).toEqual([1404, 5, 12]);
  });

  it('reads epoch milliseconds', () => {
    const result = toDoranDate(jalali.valueOf(), UTC)!;
    expect([result.year, result.month, result.day]).toEqual([1404, 5, 12]);
  });

  it('reads a Jalali string', () => {
    const result = toDoranDate('1404/05/12', UTC)!;
    expect([result.year, result.month, result.day]).toEqual([1404, 5, 12]);
  });

  it('reads Persian digits', () => {
    const result = toDoranDate('۱۴۰۴/۰۵/۱۲', UTC)!;
    expect([result.year, result.month, result.day]).toEqual([1404, 5, 12]);
  });

  // Both forms are common in the same app — one in state, one from the API.
  it('falls back to Gregorian for ISO strings', () => {
    const result = toDoranDate('2025-08-03', UTC)!;
    expect(result.year).toBe(1404);
  });

  it('does not misread a Jalali year as Gregorian', () => {
    const result = toDoranDate('1404-05-12', UTC)!;
    expect([result.year, result.month, result.day]).toEqual([1404, 5, 12]);
  });

  // Nothing but magnitude separates the two calendars' strings: a Jalali parse of
  // an ISO date succeeds, it just yields an absurd year.
  it('splits the calendars on year magnitude, not string shape', () => {
    expect(toDoranDate('1404/05/12', UTC)!.year).toBe(1404);
    expect(toDoranDate('2025/08/03', UTC)!.year).toBe(1404);
  });

  it('returns null for empty and unreadable input', () => {
    expect(toDoranDate(null)).toBeNull();
    expect(toDoranDate(undefined)).toBeNull();
    expect(toDoranDate('')).toBeNull();
    expect(toDoranDate('   ')).toBeNull();
    expect(toDoranDate('not a date')).toBeNull();
  });

  it('returns null for an invalid Date or number rather than throwing', () => {
    expect(toDoranDate(new Date('nonsense'))).toBeNull();
    expect(toDoranDate(Number.NaN)).toBeNull();
    expect(toDoranDate(Number.POSITIVE_INFINITY)).toBeNull();
  });
});

describe('formatValue', () => {
  it('returns the DoranDate itself for "doran"', () => {
    expect(formatValue(jalali, 'doran')).toBe(jalali);
  });

  it('returns a native Date for "date"', () => {
    const result = formatValue(jalali, 'date')!;
    expect(result).toBeInstanceOf(Date);
    expect(result.getTime()).toBe(jalali.valueOf());
  });

  it('returns a Gregorian UTC ISO string for "iso"', () => {
    expect(formatValue(jalali, 'iso')).toBe(jalali.toISOString());
  });

  // The value is bound for a query string or an API, where Persian digits would
  // not survive — display formatting is DoranDate.format's job.
  it('treats any other string as a Jalali pattern, in Latin digits', () => {
    expect(formatValue(jalali, 'YYYY-MM-DD')).toBe('1404-05-12');
    expect(formatValue(jalali, 'YYYY/MM/DD')).toBe('1404/05/12');
  });

  it('returns null for a null date, whatever the format', () => {
    expect(formatValue(null, 'doran')).toBeNull();
    expect(formatValue(null, 'iso')).toBeNull();
    expect(formatValue(null, 'YYYY-MM-DD')).toBeNull();
  });

  it('round-trips through toDoranDate', () => {
    const iso = formatValue(jalali, 'YYYY-MM-DD')!;
    const back = toDoranDate(iso, UTC)!;
    expect([back.year, back.month, back.day]).toEqual([1404, 5, 12]);
  });
});
