/** Persian (Extended Arabic-Indic) digits ۰–۹. */
const PERSIAN_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'] as const;

/** Arabic-Indic digits ٠–٩, sometimes seen in Persian text. */
const ARABIC_DIGITS = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'] as const;

/** Replaces ASCII digits `0-9` in a string with Persian numerals. */
export function toPersianDigits(value: string): string {
  return value.replace(/[0-9]/g, (d) => PERSIAN_DIGITS[Number(d)]!);
}

/** Leaves a string untouched — the identity converter used by Latin-digit locales. */
export function toLatinDigits(value: string): string {
  return value;
}

/**
 * Normalizes Persian and Arabic numerals in a string back to ASCII `0-9`.
 * Useful when parsing user input that may contain localized digits.
 */
export function normalizeDigits(value: string): string {
  let result = '';
  for (const char of value) {
    const persianIndex = PERSIAN_DIGITS.indexOf(char as (typeof PERSIAN_DIGITS)[number]);
    if (persianIndex !== -1) {
      result += String(persianIndex);
      continue;
    }
    const arabicIndex = ARABIC_DIGITS.indexOf(char as (typeof ARABIC_DIGITS)[number]);
    if (arabicIndex !== -1) {
      result += String(arabicIndex);
      continue;
    }
    result += char;
  }
  return result;
}
