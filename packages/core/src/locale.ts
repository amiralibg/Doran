import { normalizeDigits, toLatinDigits, toPersianDigits } from './digits';
import type { CalendarLabels, Locale, LocaleLike, ResolvedCalendarLabels } from './types';

/**
 * The Persian fallback for every label. A locale supplying only some fields gets the
 * rest from here, which is what keeps `CalendarLabels` fully optional.
 */
const DEFAULT_CALENDAR_LABELS: ResolvedCalendarLabels = {
  today: 'امروز',
  clear: 'پاک کردن',
  datePlaceholder: 'انتخاب تاریخ',
  calendar: 'تقویم',
  openCalendar: 'باز کردن تقویم',
  previousMonth: 'ماه قبل',
  nextMonth: 'ماه بعد',
  month: 'ماه',
  year: 'سال',
  hour: 'ساعت',
  minute: 'دقیقه',
  increase: 'افزایش',
  decrease: 'کاهش',
  presets: 'بازه‌های آماده',
  rangeSeparator: ' تا ',
  rangeEmpty: '—',
  nlpPlaceholder: 'مثلاً: جمعه ساعت ۷ شب',
  unresolved: 'نامشخص',
  listSeparator: '، ',
  lastDays: '{count} روز اخیر',
  thisMonth: 'این ماه',
  thisYear: 'این سال',
};

/** English counterparts, for locales that read left to right. */
const EN_CALENDAR_LABELS: ResolvedCalendarLabels = {
  today: 'Today',
  clear: 'Clear',
  datePlaceholder: 'Pick a date',
  calendar: 'Calendar',
  openCalendar: 'Open calendar',
  previousMonth: 'Previous month',
  nextMonth: 'Next month',
  month: 'Month',
  year: 'Year',
  hour: 'Hour',
  minute: 'Minute',
  increase: 'Increase',
  decrease: 'Decrease',
  presets: 'Quick ranges',
  rangeSeparator: ' to ',
  rangeEmpty: '—',
  nlpPlaceholder: 'e.g. Friday at 7pm',
  unresolved: 'Unresolved',
  listSeparator: ', ',
  lastDays: 'Last {count} days',
  thisMonth: 'This month',
  thisYear: 'This year',
};

/** The Persian (Iran) locale — the default for Doran. */
export const faIR: Locale = {
  name: 'fa-IR',
  direction: 'rtl',
  months: [
    'فروردین',
    'اردیبهشت',
    'خرداد',
    'تیر',
    'مرداد',
    'شهریور',
    'مهر',
    'آبان',
    'آذر',
    'دی',
    'بهمن',
    'اسفند',
  ],
  monthsShort: ['فرو', 'ارد', 'خرد', 'تیر', 'مرد', 'شهر', 'مهر', 'آبا', 'آذر', 'دی', 'بهم', 'اسف'],
  weekdays: ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه'],
  weekdaysShort: ['شنبه', 'یک‌شنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه'],
  weekdaysMin: ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'],
  meridiem: ['قبل از ظهر', 'بعد از ظهر'],
  formatNumber: toPersianDigits,
  parseNumber: normalizeDigits,
  calendarLabels: DEFAULT_CALENDAR_LABELS,
  relativeTime: {
    future: 'در %s',
    past: '%s پیش',
    s: 'چند ثانیه',
    ss: '%d ثانیه',
    m: 'یک دقیقه',
    mm: '%d دقیقه',
    h: 'یک ساعت',
    hh: '%d ساعت',
    d: 'یک روز',
    dd: '%d روز',
    M: 'یک ماه',
    MM: '%d ماه',
    y: 'یک سال',
    yy: '%d سال',
  },
};

/** An English locale using transliterated Persian month/weekday names. */
export const enUS: Locale = {
  name: 'en-US',
  direction: 'ltr',
  months: [
    'Farvardin',
    'Ordibehesht',
    'Khordad',
    'Tir',
    'Mordad',
    'Shahrivar',
    'Mehr',
    'Aban',
    'Azar',
    'Dey',
    'Bahman',
    'Esfand',
  ],
  monthsShort: ['Far', 'Ord', 'Kho', 'Tir', 'Mor', 'Sha', 'Meh', 'Aba', 'Aza', 'Dey', 'Bah', 'Esf'],
  weekdays: ['Shanbe', 'Yekshanbe', 'Doshanbe', 'Seshanbe', 'Chaharshanbe', 'Panjshanbe', 'Jome'],
  weekdaysShort: ['Sha', 'Yek', 'Dos', 'Ses', 'Cha', 'Pan', 'Jom'],
  weekdaysMin: ['Sh', 'Ye', 'Do', 'Se', 'Ch', 'Pa', 'Jo'],
  meridiem: ['AM', 'PM'],
  formatNumber: toLatinDigits,
  parseNumber: normalizeDigits,
  calendarLabels: EN_CALENDAR_LABELS,
  relativeTime: {
    future: 'in %s',
    past: '%s ago',
    s: 'a few seconds',
    ss: '%d seconds',
    m: 'a minute',
    mm: '%d minutes',
    h: 'an hour',
    hh: '%d hours',
    d: 'a day',
    dd: '%d days',
    M: 'a month',
    MM: '%d months',
    y: 'a year',
    yy: '%d years',
  },
};

const registry = new Map<string, Locale>([
  [faIR.name, faIR],
  [enUS.name, enUS],
]);

let defaultLocale: Locale = faIR;

/** Registers (or overrides) a locale so it can be referenced by name. */
export function registerLocale(locale: Locale): void {
  registry.set(locale.name, locale);
}

/** Returns a registered locale by name, or `undefined` if it is not registered. */
export function getLocale(name: string): Locale | undefined {
  return registry.get(name);
}

/** Sets the locale used when none is supplied. Accepts a name or a locale object. */
export function setDefaultLocale(locale: LocaleLike): void {
  defaultLocale = resolveLocale(locale);
}

/** Returns the current default locale. */
export function getDefaultLocale(): Locale {
  return defaultLocale;
}

/**
 * Resolves a {@link LocaleLike} into a concrete {@link Locale}. Strings are looked
 * up in the registry; unknown names fall back to the default locale.
 */
export function resolveLocale(locale?: LocaleLike): Locale {
  if (!locale) return defaultLocale;
  if (typeof locale === 'string') return registry.get(locale) ?? defaultLocale;
  return locale;
}

/**
 * Returns calendar-control labels with every gap filled.
 *
 * Merges rather than replaces, so a locale defining only `today` and `clear` — as
 * every locale written before the rest of these fields existed does — still gets a
 * complete set.
 */
export function resolveCalendarLabels(locale: Locale): ResolvedCalendarLabels {
  if (!locale.calendarLabels) return DEFAULT_CALENDAR_LABELS;
  return { ...DEFAULT_CALENDAR_LABELS, ...stripUndefined(locale.calendarLabels) };
}

/** Drops explicitly-undefined keys so they don't shadow a default during the spread. */
function stripUndefined(labels: CalendarLabels): CalendarLabels {
  const defined: Record<string, string> = {};
  for (const [key, value] of Object.entries(labels)) {
    if (value !== undefined) defined[key] = value;
  }
  return defined;
}

/** The writing direction for a locale. Defaults to right-to-left. */
export function resolveDirection(locale: Locale): 'rtl' | 'ltr' {
  return locale.direction ?? 'rtl';
}
