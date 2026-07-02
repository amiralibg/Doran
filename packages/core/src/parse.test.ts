import { describe, expect, it } from 'vitest';
import { parse, parseGregorian, parseJalali } from './parse';
import type { DoranDateOptions } from './types';

const UTC: DoranDateOptions = { timeZone: 'UTC' };

describe('parseJalali', () => {
  it('parses a slash-separated date', () => {
    const d = parseJalali('1405/03/11', undefined, UTC);
    expect(d?.toObject()).toMatchObject({ year: 1405, month: 3, day: 11 });
  });

  it('parses a dash-separated date with time', () => {
    const d = parseJalali('1405-03-11 07:30:15', undefined, UTC);
    expect(d?.toObject()).toMatchObject({
      year: 1405,
      month: 3,
      day: 11,
      hour: 7,
      minute: 30,
      second: 15,
    });
  });

  it('normalizes Persian digits before parsing', () => {
    const d = parseJalali('۱۴۰۵/۰۳/۱۱', undefined, UTC);
    expect(d?.toObject()).toMatchObject({ year: 1405, month: 3, day: 11 });
  });

  it('parses with an explicit month-name format', () => {
    const d = parseJalali('11 خرداد 1405', 'D MMMM YYYY', UTC);
    expect(d?.toObject()).toMatchObject({ year: 1405, month: 3, day: 11 });
  });

  it('returns null for unparseable input', () => {
    expect(parseJalali('not a date', undefined, UTC)).toBeNull();
  });

  it('returns null for an out-of-range day', () => {
    expect(parseJalali('1400/12/30', undefined, UTC)).toBeNull();
  });

  it('is the inverse of format for round-tripping', () => {
    const formatted = '1402/08/15';
    const d = parseJalali(formatted, 'YYYY/MM/DD', UTC);
    expect(d?.format('YYYY/MM/DD')).toBe('۱۴۰۲/۰۸/۱۵');
  });
});

describe('parseGregorian', () => {
  it('parses an ISO date', () => {
    const d = parseGregorian('2026-05-31', undefined, UTC);
    expect(d?.toGregorianParts()).toMatchObject({ year: 2026, month: 5, day: 31 });
  });

  it('parses an ISO datetime', () => {
    const d = parseGregorian('2026-05-31 10:09:05', undefined, UTC);
    expect(d?.toGregorianParts()).toMatchObject({
      year: 2026,
      month: 5,
      day: 31,
      hour: 10,
      minute: 9,
      second: 5,
    });
  });

  it('parses an explicit English month-name format', () => {
    const d = parseGregorian('31 May 2026', 'D MMMM YYYY', UTC);
    expect(d?.toGregorianParts()).toMatchObject({ year: 2026, month: 5, day: 31 });
  });

  it('returns null for an impossible Gregorian date (Feb 30)', () => {
    expect(parseGregorian('2026-02-30', undefined, UTC)).toBeNull();
  });

  it('returns null for garbage', () => {
    expect(parseGregorian('not a date', undefined, UTC)).toBeNull();
  });

  it('is consistent regardless of host engine (no new Date fallback)', () => {
    // A shape Date.parse accepts inconsistently is rejected unless it matches a known format.
    expect(parseGregorian('May 31', undefined, UTC)).toBeNull();
  });
});

describe('strict mode', () => {
  it('rejects a single-digit value where the format pins two digits', () => {
    expect(parseJalali('1405/3/1', 'YYYY/MM/DD', { ...UTC, strict: true })).toBeNull();
    expect(parseGregorian('2026-5-31', 'YYYY-MM-DD', { ...UTC, strict: true })).toBeNull();
  });

  it('accepts an exact-width match', () => {
    const d = parseJalali('1405/03/11', 'YYYY/MM/DD', { ...UTC, strict: true });
    expect(d?.toObject()).toMatchObject({ year: 1405, month: 3, day: 11 });
  });

  it('does not fall back to default formats without an explicit format', () => {
    expect(parseJalali('1405/03/11', undefined, { ...UTC, strict: true })).toBeNull();
  });

  it('lenient mode still accepts loose widths', () => {
    const d = parseGregorian('2026-5-31', 'YYYY-MM-DD', UTC);
    expect(d?.toGregorianParts()).toMatchObject({ year: 2026, month: 5, day: 31 });
  });
});

describe('parse (unified)', () => {
  it('defaults to the Jalali calendar', () => {
    const d = parse('1405/03/11', undefined, UTC);
    expect(d?.toObject()).toMatchObject({ year: 1405, month: 3, day: 11 });
  });

  it('selects the Gregorian calendar explicitly', () => {
    const d = parse('2026-05-31', undefined, { ...UTC, calendar: 'gregorian' });
    expect(d?.toGregorianParts()).toMatchObject({ year: 2026, month: 5, day: 31 });
  });
});
