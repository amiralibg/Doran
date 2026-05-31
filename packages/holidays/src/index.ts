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

export { hijriToJdn, jdnToHijri } from './hijri';
export { LUNAR_HOLIDAYS, SOLAR_HOLIDAYS } from './data';

export type {
  GetHolidaysOptions,
  Holiday,
  HolidayCalendar,
  HolidayType,
  LunarHolidayDef,
  SolarHolidayDef,
} from './types';
