import { normalizeDigits, toLatinDigits, toPersianDigits } from './digits';
import type { Locale, LocaleLike } from './types';

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
