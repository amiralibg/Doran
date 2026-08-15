/**
 * `@doranjs/holidays` — Iranian official, religious, and cultural holidays.
 *
 * @packageDocumentation
 */

export {
  clearCustomHolidays,
  getHolidayCoverage,
  type HolidayCoverage,
  getHolidays,
  getHolidaysOn,
  isHoliday,
  registerLunarHoliday,
  registerSolarHoliday,
} from './holidays';

// Holiday-aware working-day helpers (default the `holidays` predicate to `isHoliday`).
export {
  addWorkingDays,
  isWorkingDay,
  nextWorkingDay,
  previousWorkingDay,
  workingDaysBetween,
} from './working-days';

export { hijriMonthLength, hijriToJdn, jdnToHijri } from './hijri';
export { LUNAR_HOLIDAYS, SOLAR_HOLIDAYS } from './data';
export {
  getOfficialLunarDates,
  getOfficialLunarYears,
  hasOfficialLunarDates,
  registerOfficialLunarYear,
  resetOfficialLunarYears,
  type OfficialLunarDate,
} from './official';

export type {
  GetHolidaysOptions,
  Holiday,
  HolidayCalendar,
  HolidayType,
  LunarHolidayDef,
  SolarHolidayDef,
} from './types';
