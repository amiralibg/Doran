import { normalizeDigits, toLatinDigits, toPersianDigits } from './digits';
import type { CalendarFormats, Locale, LocaleLike, LongDateFormat, WeekConfig } from './types';

/** Persian ordinal: appends the suffix «م» (e.g. `۱ → "۱م"`), matching moment-jalaali. */
const faOrdinal = (value: number): string => `${toPersianDigits(String(value))}م`;

/** English ordinal: `1 → "1st"`, `2 → "2nd"`, `11 → "11th"`, etc. */
const enOrdinal = (value: number): string => {
  const suffixes = ['th', 'st', 'nd', 'rd'];
  const v = value % 100;
  return `${value}${suffixes[(v - 20) % 10] ?? suffixes[v] ?? suffixes[0]}`;
};

const faLongDateFormat: LongDateFormat = {
  LT: 'HH:mm',
  LTS: 'HH:mm:ss',
  L: 'YYYY/MM/DD',
  LL: 'D MMMM YYYY',
  LLL: 'D MMMM YYYY [ساعت] HH:mm',
  LLLL: 'dddd D MMMM YYYY [ساعت] HH:mm',
};

const faCalendar: CalendarFormats = {
  sameDay: '[امروز ساعت] LT',
  nextDay: '[فردا ساعت] LT',
  nextWeek: 'dddd [ساعت] LT',
  lastDay: '[دیروز ساعت] LT',
  lastWeek: 'dddd [گذشته ساعت] LT',
  sameElse: 'L',
};

/** Neutral fallback long-date templates for locales that omit their own. */
export const DEFAULT_LONG_DATE_FORMAT: LongDateFormat = {
  LT: 'HH:mm',
  LTS: 'HH:mm:ss',
  L: 'YYYY/MM/DD',
  LL: 'D MMMM YYYY',
  LLL: 'D MMMM YYYY HH:mm',
  LLLL: 'dddd D MMMM YYYY HH:mm',
};

/** Neutral fallback calendar templates for locales that omit their own. */
export const DEFAULT_CALENDAR: CalendarFormats = {
  sameDay: '[Today at] LT',
  nextDay: '[Tomorrow at] LT',
  nextWeek: 'dddd [at] LT',
  lastDay: '[Yesterday at] LT',
  lastWeek: '[Last] dddd [at] LT',
  sameElse: 'L',
};

/** Fallback season names for locales that omit their own. */
export const DEFAULT_SEASONS: readonly [string, string, string, string] = [
  'Spring',
  'Summer',
  'Autumn',
  'Winter',
];

/** Persian week convention: weeks start on Saturday. */
export const DEFAULT_WEEK: WeekConfig = { dow: 6, doy: 12 };

/** The Persian (Iran) locale — the default for Doran. */
export const faIR: Locale = {
  name: 'fa-IR',
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
  longDateFormat: faLongDateFormat,
  calendar: faCalendar,
  ordinal: faOrdinal,
  seasons: ['بهار', 'تابستان', 'پاییز', 'زمستان'],
  week: DEFAULT_WEEK,
};

/** An English locale using transliterated Persian month/weekday names. */
export const enUS: Locale = {
  name: 'en-US',
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
  longDateFormat: {
    LT: 'h:mm A',
    LTS: 'h:mm:ss A',
    L: 'YYYY/MM/DD',
    LL: 'D MMMM YYYY',
    LLL: 'D MMMM YYYY h:mm A',
    LLLL: 'dddd, D MMMM YYYY h:mm A',
  },
  calendar: DEFAULT_CALENDAR,
  ordinal: enOrdinal,
  seasons: ['Bahar', 'Tabestan', 'Paeez', 'Zemestan'],
  week: DEFAULT_WEEK,
};

/**
 * The Dari (Afghanistan) locale. Uses the traditional Afghan zodiacal month names
 * (حمل، ثور، …) over the same Solar Hijri date arithmetic as {@link faIR}; only the month
 * names differ.
 */
export const faAF: Locale = {
  name: 'fa-AF',
  months: [
    'حمل',
    'ثور',
    'جوزا',
    'سرطان',
    'اسد',
    'سنبله',
    'میزان',
    'عقرب',
    'قوس',
    'جدی',
    'دلو',
    'حوت',
  ],
  monthsShort: ['حمل', 'ثور', 'جوز', 'سرط', 'اسد', 'سنب', 'میز', 'عقر', 'قوس', 'جدی', 'دلو', 'حوت'],
  weekdays: ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه'],
  weekdaysShort: ['شنبه', 'یک‌شنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه'],
  weekdaysMin: ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'],
  meridiem: ['قبل از ظهر', 'بعد از ظهر'],
  formatNumber: toPersianDigits,
  parseNumber: normalizeDigits,
  relativeTime: faIR.relativeTime,
  longDateFormat: faLongDateFormat,
  calendar: faCalendar,
  ordinal: faOrdinal,
  seasons: ['بهار', 'تابستان', 'پاییز', 'زمستان'],
  week: DEFAULT_WEEK,
};

const registry = new Map<string, Locale>([
  [faIR.name, faIR],
  [enUS.name, enUS],
  [faAF.name, faAF],
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
