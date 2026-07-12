/**
 * `@doranjs/core` — the immutable Solar Hijri (Persian / Jalali) date engine.
 *
 * @packageDocumentation
 */

export {
  DoranDate,
  freeze,
  type GregorianInput,
  type JalaliInput,
  type NowInput,
  type NowSource,
  type SettableUnit,
  type TemporalLike,
  type TemporalZonedDateTime,
} from './doran-date';
export { parse, parseGregorian, parseJalali, type ParseOptions } from './parse';
export { Duration, type DurationLike, type DurationUnit } from './duration';
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
  gregorianMonthLength,
  gregorianToJalali,
  gregorianToJdn,
  gregorianWeekday,
  isLeapGregorianYear,
  isLeapJalaliYear,
  isValidGregorianDate,
  isValidJalaliDate,
  jalaliMonthLength,
  jalaliToGregorian,
  jalaliToJdn,
  jdnToGregorian,
  jdnToJalali,
} from './conversion';

// Formatting.
export { formatParts, type DigitStyle, type FormatContext } from './format';

// Digit utilities.
export { normalizeDigits, toLatinDigits, toPersianDigits } from './digits';

// Locales.
export {
  enUS,
  faIR,
  getDefaultLocale,
  getLocale,
  registerLocale,
  resolveCalendarLabels,
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
  CalendarLabels,
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
