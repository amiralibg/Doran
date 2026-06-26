/**
 * `@doranjs/core` — the immutable Solar Hijri (Persian / Jalali) date engine.
 *
 * @packageDocumentation
 */

export { DoranDate, type JalaliInput, type SettableUnit } from './doran-date';
export { parseJalali } from './parse';
export { durationToHuman, humanizeRelative } from './relative';

// Working-day (business-day) helpers — weekend-aware, optionally holiday-aware.
export {
  addWorkingDays,
  isWeekend,
  isWorkingDay,
  nextWorkingDay,
  previousWorkingDay,
  workingDaysBetween,
  type WorkingDayOptions,
} from './business';

// Conversion primitives (useful for advanced/low-level work).
export {
  gregorianToJalali,
  gregorianToJdn,
  gregorianWeekday,
  isLeapJalaliYear,
  isValidJalaliDate,
  jalaliMonthLength,
  jalaliToGregorian,
  jalaliToJdn,
  jdnToGregorian,
  jdnToJalali,
} from './conversion';

// Formatting.
export { formatParts, type FormatContext } from './format';

// Digit utilities.
export { normalizeDigits, toLatinDigits, toPersianDigits } from './digits';

// Locales.
export {
  enUS,
  faIR,
  getDefaultLocale,
  getLocale,
  registerLocale,
  resolveLocale,
  setDefaultLocale,
} from './locale';

// Time-zone helpers.
export {
  getSystemTimeZone,
  getTimeZoneOffsetMs,
  instantToWallClock,
  wallClockToInstant,
  type WallClock,
} from './timezone';

// Types.
export type {
  DateUnit,
  DiffUnit,
  DoranDateOptions,
  DoranDateParts,
  GregorianParts,
  Inclusivity,
  JalaliParts,
  Locale,
  LocaleLike,
  RelativeTimeStrings,
  Weekday,
} from './types';
