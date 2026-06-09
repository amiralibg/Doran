/** Weekday names → Persian weekday index (0 = Saturday … 6 = Friday). */
export const WEEKDAYS: Record<string, number> = {
  شنبه: 0,
  یکشنبه: 1,
  دوشنبه: 2,
  سهشنبه: 3,
  چهارشنبه: 4,
  پنجشنبه: 5,
  جمعه: 6,
};

/**
 * Display spellings of the weekdays (index 0 = Saturday), with the proper half-spaces
 * (ZWNJ). The {@link WEEKDAYS} keys are the *normalized* (space-less) forms used for
 * matching; these are what should be shown to a user or inserted into an input.
 */
export const WEEKDAY_LABELS = [
  'شنبه',
  'یک‌شنبه',
  'دوشنبه',
  'سه‌شنبه',
  'چهارشنبه',
  'پنج‌شنبه',
  'جمعه',
] as const;

/** Relative-day keywords → day offset from the reference date. */
export const RELATIVE_DAYS: Record<string, number> = {
  امروز: 0,
  امشب: 0,
  فردا: 1,
  پسفردا: 2,
  پسینفردا: 2,
  دیروز: -1,
  دیشب: -1,
  پریروز: -2,
  پریر: -2,
  پریشب: -2,
};

/** Persian Solar Hijri month names → month number (1–12). */
export const MONTHS: Record<string, number> = {
  فروردین: 1,
  اردیبهشت: 2,
  خرداد: 3,
  تیر: 4,
  مرداد: 5,
  امرداد: 5,
  شهریور: 6,
  مهر: 7,
  آبان: 8,
  آذر: 9,
  دی: 10,
  بهمن: 11,
  اسفند: 12,
};

/** Calendar units used by "N <unit> later/ago" expressions. */
export type Unit = 'day' | 'week' | 'month' | 'year';

/** Unit keywords → canonical unit. */
export const UNITS: Record<string, Unit> = {
  روز: 'day',
  هفته: 'week',
  ماه: 'month',
  سال: 'year',
};

/** Words that point to the future. */
export const FUTURE_WORDS = ['دیگه', 'دیگر', 'بعد', 'بعدی', 'بعدش', 'آینده', 'آتی', 'پیشرو'];

/** Words that point to the past. */
export const PAST_WORDS = ['پیش', 'قبل', 'قبلی', 'قبلش', 'گذشته', 'سپری'];

/** Words meaning "this / current". */
export const PRESENT_WORDS = ['این', 'همین', 'جاری', 'فعلی'];

/**
 * Time fractions used in expressions like `ساعت ۷ و نیم` (half past) or
 * `یک ربع به ۸` (quarter to). Values are minutes.
 */
export const TIME_FRACTIONS: Record<string, number> = {
  ربع: 15,
  نیم: 30,
  'سه ربع': 45,
};

/** Day-of-month anchors used by month expressions. */
export const MONTH_ANCHORS: Record<string, 'first' | 'middle' | 'last'> = {
  اوایل: 'first',
  اول: 'first',
  ابتدای: 'first',
  ابتدا: 'first',
  آغاز: 'first',
  اواسط: 'middle',
  وسط: 'middle',
  میانه: 'middle',
  اواخر: 'last',
  آخر: 'last',
  پایان: 'last',
  انتهای: 'last',
  انتها: 'last',
};

/** Part-of-day keywords → a default hour and whether they force PM. */
export const PART_OF_DAY: Record<string, { hour: number; pm: boolean | null }> = {
  سحر: { hour: 5, pm: false },
  بامداد: { hour: 5, pm: false },
  صبح: { hour: 8, pm: false },
  ظهر: { hour: 12, pm: null },
  نیمروز: { hour: 12, pm: null },
  بعدازظهر: { hour: 15, pm: true },
  عصر: { hour: 17, pm: true },
  غروب: { hour: 19, pm: true },
  شامگاه: { hour: 19, pm: true },
  شب: { hour: 20, pm: true },
  نیمهشب: { hour: 0, pm: null },
};

/** Recognized "special" named days → resolver from a year to (month, day). */
export const SPECIAL_DAYS: Record<string, { month: number; day: number }> = {
  نوروز: { month: 1, day: 1 },
  سیزدهبهدر: { month: 1, day: 13 },
  یلدا: { month: 9, day: 30 },
  چهارشنبهسوری: { month: 12, day: 29 },
};

/**
 * Display spellings of the special days, with proper half-spaces (ZWNJ). Keyed by the
 * normalized {@link SPECIAL_DAYS} key. Use these for suggestions / inserting into an
 * input; the normalized keys are only for matching.
 */
export const SPECIAL_DAY_LABELS: Record<keyof typeof SPECIAL_DAYS | string, string> = {
  نوروز: 'نوروز',
  سیزدهبهدر: 'سیزده‌به‌در',
  یلدا: 'یلدا',
  چهارشنبهسوری: 'چهارشنبه‌سوری',
};
