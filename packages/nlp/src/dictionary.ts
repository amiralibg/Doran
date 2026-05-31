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

/** Relative-day keywords → day offset from the reference date. */
export const RELATIVE_DAYS: Record<string, number> = {
  امروز: 0,
  فردا: 1,
  پسفردا: 2,
  دیروز: -1,
  پریروز: -2,
  پریر: -2,
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
export const FUTURE_WORDS = ['دیگه', 'دیگر', 'بعد', 'بعدی', 'آینده', 'آتی'];

/** Words that point to the past. */
export const PAST_WORDS = ['پیش', 'قبل', 'قبلی', 'گذشته'];

/** Words meaning "this / current". */
export const PRESENT_WORDS = ['این', 'همین', 'جاری'];

/** Day-of-month anchors used by month expressions. */
export const MONTH_ANCHORS: Record<string, 'first' | 'middle' | 'last'> = {
  اول: 'first',
  ابتدای: 'first',
  آغاز: 'first',
  وسط: 'middle',
  میانه: 'middle',
  آخر: 'last',
  پایان: 'last',
  انتهای: 'last',
};

/** Part-of-day keywords → a default hour and whether they force PM. */
export const PART_OF_DAY: Record<string, { hour: number; pm: boolean | null }> = {
  بامداد: { hour: 5, pm: false },
  صبح: { hour: 8, pm: false },
  ظهر: { hour: 12, pm: null },
  بعدازظهر: { hour: 15, pm: true },
  عصر: { hour: 17, pm: true },
  غروب: { hour: 19, pm: true },
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
