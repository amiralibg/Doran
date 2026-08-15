import { type DoranDate, jalaliToJdn, jdnToJalali } from '@doranjs/core';
import { LUNAR_HOLIDAYS, SOLAR_HOLIDAYS } from './data';
import { hijriMonthLength, hijriToJdn, jdnToHijri } from './hijri';
import { getOfficialLunarDates, hasOfficialLunarDates } from './official';
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
    // Clamp to the month length so "last day of the month" occasions (e.g. آخر صفر)
    // never overflow into the next tabular month.
    const day = Math.min(def.hijriDay, hijriMonthLength(hy, def.hijriMonth));
    const jdn = hijriToJdn(hy, def.hijriMonth, day);
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
 * Replaces the (approximate) tabular lunar holidays with the authoritative official
 * dates for years that have them, so popular-calendar accuracy beats arithmetic.
 */
function applyOfficialOverrides(
  holidays: Holiday[],
  year: number,
  includeUnofficial: boolean,
): Holiday[] {
  const official = getOfficialLunarDates(year);
  if (!official) return holidays;

  const defByTitle = new Map(LUNAR_HOLIDAYS.map((d) => [d.titleEn, d]));
  const overridden = new Set(official.map((o) => o.titleEn));

  // Drop the tabular lunar entries we have an official date for.
  const result = holidays.filter((h) => !(h.calendar === 'lunar' && overridden.has(h.titleEn)));

  for (const { titleEn, month, day } of official) {
    const def = defByTitle.get(titleEn);
    if (!def) continue;
    if (!includeUnofficial && !def.official) continue;
    result.push({
      year,
      month,
      day,
      title: def.title,
      titleEn: def.titleEn,
      type: def.type,
      calendar: 'lunar',
      official: def.official,
      ...(def.description ? { description: def.description } : {}),
    });
  }
  return result;
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

  const resolved = includeReligious
    ? applyOfficialOverrides(holidays, year, includeUnofficial)
    : holidays;

  return sortHolidays(resolved);
}

/** Returns the holidays that fall on the given date (may be more than one). */
export function getHolidaysOn(date: DoranDate, options?: GetHolidaysOptions): Holiday[] {
  return getHolidays(date.year, options).filter(
    (h) => h.month === date.month && h.day === date.day,
  );
}

/** How trustworthy a year's holiday dates are. */
export interface HolidayCoverage {
  year: number;
  /**
   * Whether Iran's announced lunar dates are on file. When `false`, lunar holidays
   * are computed from the tabular calendar and can land a day either side.
   */
  official: boolean;
  /** How many of the year's holidays are arithmetically approximated. */
  approximate: number;
  /** Total holidays resolved for the year. */
  total: number;
}

/**
 * Reports whether a year's dates are announced or approximated, so an application can
 * say so rather than presenting a guess as fact.
 *
 * @example
 * ```ts
 * const { official } = getHolidayCoverage(1410);
 * if (!official) showNotice('Religious holidays for this year are estimates.');
 * ```
 */
export function getHolidayCoverage(year: number, options?: GetHolidaysOptions): HolidayCoverage {
  const holidays = getHolidays(year, options);
  return {
    year,
    official: hasOfficialLunarDates(year),
    approximate: holidays.filter((holiday) => holiday.approximate).length,
    total: holidays.length,
  };
}

/** Returns `true` if the given date is an official public holiday. */
export function isHoliday(date: DoranDate): boolean {
  return getHolidaysOn(date).some((h) => h.official);
}
