import { describe, expect, it } from 'vitest';

import { dayKey, indexDayData, normalizeDayKey } from './day';
import { DoranDate } from './doran-date';

describe('dayKey', () => {
  it('builds an unpadded Jalali key', () => {
    expect(dayKey({ year: 1404, month: 5, day: 12 })).toBe('1404-5-12');
  });

  it('accepts a DoranDate directly', () => {
    const date = DoranDate.fromJalali({ year: 1405, month: 3, day: 1 });
    expect(dayKey(date)).toBe('1405-3-1');
  });
});

describe('normalizeDayKey', () => {
  it('is identity for the canonical form', () => {
    expect(normalizeDayKey('1404-5-12')).toBe('1404-5-12');
  });

  it('strips zero padding', () => {
    expect(normalizeDayKey('1404-05-12')).toBe('1404-5-12');
  });

  it('accepts slash and dot separators', () => {
    expect(normalizeDayKey('1404/05/12')).toBe('1404-5-12');
    expect(normalizeDayKey('1404.5.12')).toBe('1404-5-12');
  });

  it('accepts Persian and Arabic numerals', () => {
    expect(normalizeDayKey('۱۴۰۴/۰۵/۱۲')).toBe('1404-5-12');
    expect(normalizeDayKey('١٤٠٤-٥-١٢')).toBe('1404-5-12');
  });

  it('tolerates surrounding whitespace in parts', () => {
    expect(normalizeDayKey('1404 - 5 - 12')).toBe('1404-5-12');
  });

  // A typo should surface as a day with no annotation, never as a thrown error
  // mid-render.
  it('returns unparseable keys unchanged', () => {
    expect(normalizeDayKey('not-a-date')).toBe('not-a-date');
    expect(normalizeDayKey('1404-5')).toBe('1404-5');
    expect(normalizeDayKey('')).toBe('');
  });
});

describe('indexDayData', () => {
  it('returns null for absent or empty maps, so callers can skip the lookup', () => {
    expect(indexDayData(undefined)).toBeNull();
    expect(indexDayData(null)).toBeNull();
    expect(indexDayData({})).toBeNull();
  });

  it('normalizes keys so mixed authoring styles resolve to the same day', () => {
    const index = indexDayData({
      '1404-5-12': { text: 'a' },
      '۱۴۰۴/۰۵/۱۳': { text: 'b' },
      '1404.05.14': { text: 'c' },
    })!;

    expect(index.get('1404-5-12')?.text).toBe('a');
    expect(index.get('1404-5-13')?.text).toBe('b');
    expect(index.get('1404-5-14')?.text).toBe('c');
  });

  it('looks up by the key dayKey produces', () => {
    const date = DoranDate.fromJalali({ year: 1404, month: 5, day: 12 });
    const index = indexDayData({ '1404/05/12': { text: '۱٬۲۰۰٬۰۰۰', tone: 'low' } })!;

    expect(index.get(dayKey(date))).toEqual({ text: '۱٬۲۰۰٬۰۰۰', tone: 'low' });
  });

  it('skips null entries rather than indexing them', () => {
    const index = indexDayData({
      '1404-5-12': { text: 'a' },
      '1404-5-13': null as never,
    })!;

    expect(index.size).toBe(1);
    expect(index.has('1404-5-13')).toBe(false);
  });
});
