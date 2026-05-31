import { describe, expect, it } from 'vitest';
import { parseJalali } from './parse';
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
