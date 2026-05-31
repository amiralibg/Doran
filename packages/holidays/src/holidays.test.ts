import { DoranDate } from '@doran/core';
import { afterEach, describe, expect, it } from 'vitest';
import { hijriToJdn, jdnToHijri } from './hijri';
import {
  clearCustomHolidays,
  getHolidays,
  getHolidaysOn,
  isHoliday,
  registerSolarHoliday,
} from './holidays';

afterEach(() => clearCustomHolidays());

describe('getHolidays', () => {
  it('includes the fixed Nowruz block', () => {
    const holidays = getHolidays(1405);
    const nowruz = holidays.filter((h) => h.titleEn === 'Nowruz');
    expect(nowruz).toHaveLength(4);
    expect(nowruz.map((h) => h.day)).toEqual([1, 2, 3, 4]);
    expect(nowruz.every((h) => h.official && h.calendar === 'solar')).toBe(true);
  });

  it('includes the 22 Bahman revolution anniversary', () => {
    const holidays = getHolidays(1405);
    expect(holidays.some((h) => h.month === 11 && h.day === 22 && h.official)).toBe(true);
  });

  it('returns chronologically sorted holidays', () => {
    const holidays = getHolidays(1405);
    for (let i = 1; i < holidays.length; i += 1) {
      const prev = holidays[i - 1]!;
      const cur = holidays[i]!;
      expect(prev.month * 100 + prev.day).toBeLessThanOrEqual(cur.month * 100 + cur.day);
    }
  });

  it('flags religious holidays as approximate and lunar', () => {
    const religious = getHolidays(1405).filter((h) => h.type === 'religious');
    expect(religious.length).toBeGreaterThan(0);
    expect(religious.every((h) => h.calendar === 'lunar' && h.approximate)).toBe(true);
  });

  it('can exclude religious and unofficial holidays', () => {
    const onlyOfficialSolar = getHolidays(1405, {
      includeReligious: false,
      includeUnofficial: false,
    });
    expect(onlyOfficialSolar.every((h) => h.calendar === 'solar' && h.official)).toBe(true);
    expect(onlyOfficialSolar.some((h) => h.titleEn === 'Yalda Night')).toBe(false);
  });

  it('places every holiday within its requested year', () => {
    const year = 1404;
    for (const h of getHolidays(year)) {
      expect(h.year).toBe(year);
      expect(h.month).toBeGreaterThanOrEqual(1);
      expect(h.month).toBeLessThanOrEqual(12);
    }
  });
});

describe('custom holidays', () => {
  it('includes registered custom holidays', () => {
    registerSolarHoliday({
      month: 6,
      day: 31,
      title: 'روز کارمند',
      titleEn: 'Employee Day',
      type: 'cultural',
      official: false,
    });
    const match = getHolidays(1405).find((h) => h.titleEn === 'Employee Day');
    expect(match).toMatchObject({ month: 6, day: 31, official: false });
  });

  it('can be cleared', () => {
    registerSolarHoliday({
      month: 5,
      day: 5,
      title: 'تست',
      titleEn: 'Test',
      type: 'cultural',
      official: false,
    });
    clearCustomHolidays();
    expect(getHolidays(1405).some((h) => h.titleEn === 'Test')).toBe(false);
  });
});

describe('lookups', () => {
  it('detects an official holiday on Nowruz', () => {
    expect(isHoliday(DoranDate.fromJalali(1405, 1, 1, { timeZone: 'UTC' }))).toBe(true);
  });

  it('reports a normal day as not a holiday', () => {
    expect(isHoliday(DoranDate.fromJalali(1405, 5, 7, { timeZone: 'UTC' }))).toBe(false);
  });

  it('returns the holidays falling on a date', () => {
    const found = getHolidaysOn(DoranDate.fromJalali(1405, 1, 1, { timeZone: 'UTC' }));
    expect(found.some((h) => h.titleEn === 'Nowruz')).toBe(true);
  });
});

describe('tabular Hijri conversion', () => {
  it('round-trips Hijri ↔ JDN across a range', () => {
    for (let jdn = hijriToJdn(1440, 1, 1); jdn <= hijriToJdn(1450, 1, 1); jdn += 1) {
      const h = jdnToHijri(jdn);
      expect(hijriToJdn(h.year, h.month, h.day)).toBe(jdn);
    }
  });

  it('anchors 1 Muharram 1445 to the calibrated date', () => {
    expect(jdnToHijri(hijriToJdn(1445, 1, 1))).toMatchObject({ year: 1445, month: 1, day: 1 });
  });
});
