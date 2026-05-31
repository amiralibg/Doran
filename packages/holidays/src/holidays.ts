import { type DoranDate, jalaliToJdn, jdnToJalali } from '@doran/core';
import { LUNAR_HOLIDAYS, SOLAR_HOLIDAYS } from './data';
import { hijriToJdn, jdnToHijri } from './hijri';
import type { GetHolidaysOptions, Holiday, LunarHolidayDef, SolarHolidayDef } from './types';

const customSolar: SolarHolidayDef[] = [];
const customLunar: LunarHolidayDef[] = [];

/** Registers a custom holiday fixed on the solar (Jalali) calendar. */
export function registerSolarHoliday(def: SolarHolidayDef): void {
  customSolar.push(def);
}

/** Registers a custom holiday anchored to the Hijri (lunar) calendar. */
export function registerLunarHoliday(def: LunarHolidayDef): void {
  customLunar.push(def);
}

/** Removes all custom-registered holidays. */
export function clearCustomHolidays(): void {
  customSolar.length = 0;
  customLunar.length = 0;
}

function resolveSolar(def: SolarHolidayDef, year: number): Holiday {
  return {
    year,
    month: def.month,
    day: def.day,
    title: def.title,
    titleEn: def.titleEn,
    type: def.type,
    calendar: 'solar',
    official: def.official,
    ...(def.description ? { description: def.description } : {}),
  };
}

/**
 * Resolves every occurrence of a lunar holiday that falls within the given Jalali
 * year. Because a solar year spans parts of two Hijri years, a lunar holiday may
 * occur zero, one, or two times in a single Jalali year.
 */
function resolveLunar(def: LunarHolidayDef, year: number): Holiday[] {
  const startJdn = jalaliToJdn(year, 1, 1);
  const endJdn = jalaliToJdn(year + 1, 1, 1) - 1;
  const firstHijriYear = jdnToHijri(startJdn).year;
  const lastHijriYear = jdnToHijri(endJdn).year;

  const result: Holiday[] = [];
  for (let hy = firstHijriYear; hy <= lastHijriYear; hy += 1) {
    const jdn = hijriToJdn(hy, def.hijriMonth, def.hijriDay);
    if (jdn < startJdn || jdn > endJdn) continue;
    const jalali = jdnToHijriJalali(jdn);
    result.push({
      year: jalali.year,
      month: jalali.month,
      day: jalali.day,
      title: def.title,
      titleEn: def.titleEn,
      type: def.type,
      calendar: 'lunar',
      official: def.official,
      approximate: true,
      ...(def.description ? { description: def.description } : {}),
    });
  }
  return result;
}

function jdnToHijriJalali(jdn: number): { year: number; month: number; day: number } {
  return jdnToJalali(jdn);
}

function sortHolidays(holidays: Holiday[]): Holiday[] {
  return holidays.sort((a, b) => a.month - b.month || a.day - b.day);
}

/**
 * Returns all holidays for a Jalali year, sorted chronologically.
 *
 * @param year    The Jalali year, e.g. `1405`.
 * @param options Toggle categories of holidays on or off.
 *
 * @example
 * ```ts
 * getHolidays(1405);
 * getHolidays(1405, { includeReligious: false });
 * ```
 */
export function getHolidays(year: number, options: GetHolidaysOptions = {}): Holiday[] {
  const { includeUnofficial = true, includeReligious = true, includeCustom = true } = options;

  const holidays: Holiday[] = [];

  for (const def of SOLAR_HOLIDAYS) {
    if (!includeUnofficial && !def.official) continue;
    holidays.push(resolveSolar(def, year));
  }

  if (includeReligious) {
    for (const def of LUNAR_HOLIDAYS) {
      if (!includeUnofficial && !def.official) continue;
      holidays.push(...resolveLunar(def, year));
    }
  }

  if (includeCustom) {
    for (const def of customSolar) {
      if (!includeUnofficial && !def.official) continue;
      holidays.push(resolveSolar(def, year));
    }
    for (const def of customLunar) {
      if (!includeUnofficial && !def.official) continue;
      holidays.push(...resolveLunar(def, year));
    }
  }

  return sortHolidays(holidays);
}

/** Returns the holidays that fall on the given date (may be more than one). */
export function getHolidaysOn(date: DoranDate, options?: GetHolidaysOptions): Holiday[] {
  return getHolidays(date.year, options).filter(
    (h) => h.month === date.month && h.day === date.day,
  );
}

/** Returns `true` if the given date is an official public holiday. */
export function isHoliday(date: DoranDate): boolean {
  return getHolidaysOn(date).some((h) => h.official);
}
