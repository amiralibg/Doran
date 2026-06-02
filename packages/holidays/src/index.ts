/**
 * `@doranjs/holidays` — Iranian official, religious, and cultural holidays.
 *
 * @packageDocumentation
 */

export {
  clearCustomHolidays,
  getHolidays,
  getHolidaysOn,
  isHoliday,
  registerLunarHoliday,
  registerSolarHoliday,
} from './holidays';

export { hijriMonthLength, hijriToJdn, jdnToHijri } from './hijri';
export { LUNAR_HOLIDAYS, SOLAR_HOLIDAYS } from './data';
export {
  getOfficialLunarDates,
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
