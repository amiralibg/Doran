import { DoranDate, jalaliToJdn } from '@doranjs/core';
import { afterEach, describe, expect, it } from 'vitest';
import { hijriMonthLength, hijriToJdn, jdnToHijri } from './hijri';
import {
  clearCustomHolidays,
  getHolidays,
  getHolidaysOn,
  isHoliday,
  registerSolarHoliday,
} from './holidays';
import { registerOfficialLunarYear, resetOfficialLunarYears } from './official';

afterEach(() => {
  clearCustomHolidays();
  resetOfficialLunarYears();
});

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

  it('flags tabular (unseeded-year) religious holidays as approximate and lunar', () => {
    // 1405 has official dates; use an unseeded year for the tabular-approximate path.
    const religious = getHolidays(1412).filter((h) => h.type === 'religious');
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

  it('gives tabular months alternating 30/29 days', () => {
    expect(hijriMonthLength(1445, 1)).toBe(30); // Muharram
    expect(hijriMonthLength(1445, 2)).toBe(29); // Safar
  });

  it('keeps a clamped "last day of Safar" occasion within Safar', () => {
    // شهادت امام رضا is defined on Safar 30, but tabular Safar has 29 days; it must
    // resolve to a date that is still in Safar, never overflow into Rabi al-Awwal.
    for (const year of [1404, 1405, 1406]) {
      const reza = getHolidays(year).find((h) => h.titleEn === 'Martyrdom of Imam Reza');
      expect(reza, `expected Imam Reza in ${year}`).toBeDefined();
      const hijri = jdnToHijri(jalaliToJdn(reza!.year, reza!.month, reza!.day));
      expect(hijri.month).toBe(2); // Safar, not Rabi al-Awwal
    }
  });
});

describe('broadened observances', () => {
  it('includes cultural observance days that are not days off', () => {
    const holidays = getHolidays(1405);
    const yalda = holidays.find((h) => h.titleEn === 'Yalda Night');
    expect(yalda).toMatchObject({ month: 9, day: 30, official: false });
    expect(holidays.some((h) => h.titleEn === 'Hafez Commemoration Day')).toBe(true);
  });

  it('exposes descriptions on key occasions', () => {
    const nowruz = getHolidays(1405).find((h) => h.titleEn === 'Nowruz' && h.day === 1);
    expect(nowruz?.description).toBeTruthy();
  });
});

describe('official lunar dates', () => {
  // Authoritative Iranian-calendar dates for the seeded years.
  it.each([
    [1404, 'Eid al-Ghadir', 3, 24],
    [1404, 'Ashura', 4, 14],
    [1404, 'Tasua', 4, 13],
    [1405, 'Eid al-Ghadir', 3, 14],
    [1405, 'Ashura', 4, 4],
    [1405, 'Tasua', 4, 3],
    [1405, 'Eid al-Adha', 3, 6],
    [1405, 'Arbaeen', 5, 13],
  ])('places %s in %i on %i/%i', (year, titleEn, month, day) => {
    const match = getHolidays(year).find((h) => h.titleEn === titleEn);
    expect(match, `expected ${titleEn} in ${year}`).toBeDefined();
    expect({ month: match!.month, day: match!.day }).toEqual({ month, day });
  });

  it('marks officially-dated lunar holidays as exact (not approximate)', () => {
    const ghadir = getHolidays(1405).find((h) => h.titleEn === 'Eid al-Ghadir');
    expect(ghadir?.approximate).toBeFalsy();
  });

  it('does NOT place عید غدیر on 13 Khordad 1405 (the tabular drift)', () => {
    const on13 = getHolidaysOn(DoranDate.fromJalali(1405, 3, 13, { timeZone: 'UTC' }));
    expect(on13.some((h) => h.titleEn === 'Eid al-Ghadir')).toBe(false);
    const on14 = getHolidaysOn(DoranDate.fromJalali(1405, 3, 14, { timeZone: 'UTC' }));
    expect(on14.some((h) => h.titleEn === 'Eid al-Ghadir')).toBe(true);
  });

  it('falls back to the (approximate) tabular calc for unseeded years', () => {
    const religious = getHolidays(1410).filter((h) => h.calendar === 'lunar');
    expect(religious.length).toBeGreaterThan(0);
    expect(religious.every((h) => h.approximate)).toBe(true);
  });

  it('lets callers register official dates for a year', () => {
    registerOfficialLunarYear(1410, [{ titleEn: 'Eid al-Ghadir', month: 2, day: 25 }]);
    const ghadir = getHolidays(1410).find((h) => h.titleEn === 'Eid al-Ghadir');
    expect(ghadir).toMatchObject({ month: 2, day: 25 });
    expect(ghadir?.approximate).toBeFalsy();
  });
});
