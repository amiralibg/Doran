import { describe, expect, it } from 'vitest';
import { DoranDate } from './doran-date';
import {
  enUS,
  faIR,
  getDefaultLocale,
  getLocale,
  registerLocale,
  setDefaultLocale,
} from './locale';
import type { DoranDateOptions, Locale } from './types';

const UTC: DoranDateOptions = { timeZone: 'UTC' };

describe('DoranDate — remaining methods', () => {
  const d = DoranDate.fromJalali({ year: 1403, month: 5, day: 10, hour: 8, minute: 20 }, UTC);

  it('toDate aliases toGregorian and valueOf returns epochMs', () => {
    expect(d.toDate().getTime()).toBe(d.epochMs);
    expect(d.valueOf()).toBe(d.epochMs);
    expect(+d).toBe(d.epochMs);
  });

  it('adds small units and weeks', () => {
    expect(d.addMilliseconds(1000).diff(d, 'second')).toBe(1);
    expect(d.addSeconds(60).diff(d, 'minute')).toBe(1);
    expect(d.addWeeks(1).diff(d, 'day')).toBe(7);
  });

  it('subtracts via the generic API', () => {
    expect(d.subtract(1, 'day').addDays(1).isSame(d)).toBe(true);
  });

  it('sets the remaining clock fields', () => {
    expect(d.withHour(23).hour).toBe(23);
    expect(d.withSecond(45).second).toBe(45);
    expect(d.withMillisecond(123).millisecond).toBe(123);
  });

  it('compares with isSameOrAfter', () => {
    expect(d.addDays(1).isSameOrAfter(d)).toBe(true);
    expect(d.isSameOrAfter(d)).toBe(true);
    expect(d.subtract(1, 'day').isSameOrAfter(d)).toBe(false);
  });

  it('produces relative phrases with to / toNow / fromNow', () => {
    const later = d.addDays(3);
    expect(d.to(later, true)).toBe('۳ روز');
    expect(typeof d.toNow()).toBe('string');
    expect(typeof d.fromNow()).toBe('string');
  });
});

describe('locale registry', () => {
  it('registers and looks up a locale by name', () => {
    const klingon: Locale = { ...enUS, name: 'tlh' };
    expect(getLocale('tlh')).toBeUndefined();
    registerLocale(klingon);
    expect(getLocale('tlh')).toBe(klingon);
  });

  it('gets and sets the default locale (restoring it afterward)', () => {
    const previous = getDefaultLocale();
    try {
      setDefaultLocale(enUS);
      expect(getDefaultLocale()).toBe(enUS);
      // With no explicit locale, formatting now uses Latin digits.
      expect(DoranDate.fromJalali(1403, 1, 1, { timeZone: 'UTC' }).format('YYYY')).toBe('1403');
    } finally {
      setDefaultLocale(previous);
    }
    expect(getDefaultLocale()).toBe(faIR);
  });
});
