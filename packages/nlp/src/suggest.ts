import type { DoranDate } from '@doranjs/core';
import { MONTHS, SPECIAL_DAY_LABELS, WEEKDAY_LABELS } from './dictionary';
import { parse } from './engine';
import { normalize } from './normalize';
import type { ParseOptions } from './types';

/** Properly-spelled weekday names (with ZWNJ), for display and insertion. */
const WEEKDAYS_DISPLAY = [...WEEKDAY_LABELS];
/** Properly-spelled special-day names (with ZWNJ). */
const SPECIAL_DAYS_DISPLAY = Object.values(SPECIAL_DAY_LABELS);

/** A single autocomplete suggestion. */
export interface Suggestion {
  /** The text to place in the input when the suggestion is chosen. */
  value: string;
  /** Human-friendly label (defaults to {@link value}). */
  label: string;
  /** The resolved date, when the suggestion parses to one. */
  date?: DoranDate;
}

/** Options for {@link suggest}. */
export interface SuggestOptions extends ParseOptions {
  /** Maximum number of suggestions to return. Defaults to `8`. */
  limit?: number;
}

/**
 * Curated full-phrase templates offered as completions. Written in their natural
 * (display) spelling; matching is done on the normalized form so a user typing
 * with or without ZWNJ and in either digit set still gets a hit.
 */
const PHRASES: string[] = [
  'امروز',
  'امشب',
  'فردا',
  'پس‌فردا',
  'دیروز',
  'دیشب',
  'پریروز',
  'این هفته',
  'هفته بعد',
  'هفته آینده',
  'هفته گذشته',
  'آخر هفته',
  'اول هفته',
  'این ماه',
  'ماه بعد',
  'ماه آینده',
  'ماه گذشته',
  'اول ماه',
  'وسط ماه',
  'آخر ماه',
  'اوایل ماه',
  'اواخر ماه',
  'اول ماه بعد',
  'آخر ماه بعد',
  'امسال',
  'سال بعد',
  'سال آینده',
  'سال گذشته',
  'دو روز دیگر',
  'سه روز دیگر',
  'یک هفته دیگر',
  'دو هفته دیگر',
  'یک ماه دیگر',
  ...WEEKDAYS_DISPLAY,
  ...WEEKDAYS_DISPLAY.map((w) => `${w} آینده`),
  ...WEEKDAYS_DISPLAY.map((w) => `${w} گذشته`),
  ...WEEKDAYS_DISPLAY.map((w) => `${w} هفته بعد`),
  ...SPECIAL_DAYS_DISPLAY,
  'نوروز سال آینده',
  'ساعت ۸ صبح',
  'ساعت ۱۲ ظهر',
  'ساعت ۵ عصر',
  'ساعت ۸ شب',
  'ساعت ۷ و نیم',
  'فردا ساعت ۹ صبح',
  'جمعه ساعت ۷ شب',
];

/** Single words used to complete the trailing partial token of the input. */
const COMPLETION_WORDS: string[] = [
  ...WEEKDAYS_DISPLAY,
  ...Object.keys(MONTHS),
  ...SPECIAL_DAYS_DISPLAY,
  'امروز',
  'امشب',
  'فردا',
  'پس‌فردا',
  'دیروز',
  'دیشب',
  'هفته',
  'ماه',
  'سال',
  'بعد',
  'آینده',
  'گذشته',
  'دیگر',
  'اوایل',
  'اواسط',
  'اواخر',
  'صبح',
  'ظهر',
  'عصر',
  'شب',
  'بامداد',
  'نیمروز',
];

/** The defaults shown for an empty input. */
const DEFAULTS = ['امروز', 'فردا', 'این هفته', 'هفته بعد', 'آخر هفته', 'اول ماه بعد'];

function attach(value: string, options?: SuggestOptions): Suggestion {
  const result = parse(value, options);
  return result ? { value, label: value, date: result.date } : { value, label: value };
}

/**
 * Returns autocomplete suggestions for a partially-typed Persian date expression.
 * Matches curated phrases by prefix and completes the trailing partial word, then
 * resolves each suggestion to a preview date where possible.
 *
 * @example
 * ```ts
 * suggest('جم');        // → [{ value: 'جمعه', ... }, { value: 'جمعه آینده', ... }]
 * suggest('هفته');      // → [{ value: 'هفته بعد', ... }, ...]
 * suggest('');          // → a curated default set
 * ```
 */
export function suggest(input: string, options?: SuggestOptions): Suggestion[] {
  const limit = options?.limit ?? 8;
  const norm = normalize(input);

  if (!norm) return DEFAULTS.map((v) => attach(v, options));

  const seen = new Set<string>();
  const values: string[] = [];
  const push = (v: string) => {
    const key = normalize(v);
    if (key === norm || seen.has(key)) return;
    seen.add(key);
    values.push(v);
  };

  // 1. Whole-input prefix matches against curated phrases.
  for (const phrase of PHRASES) {
    if (normalize(phrase).startsWith(norm)) push(phrase);
  }

  // 2. Complete the trailing partial token (e.g. "جلسه شنب" → "جلسه شنبه").
  const origTokens = input.trim().split(/\s+/);
  const base = origTokens.slice(0, -1).join(' ');
  const last = normalize(origTokens[origTokens.length - 1] ?? '');
  if (last) {
    for (const word of COMPLETION_WORDS) {
      const nw = normalize(word);
      if (nw !== last && nw.startsWith(last)) push(base ? `${base} ${word}` : word);
    }
  }

  return values.slice(0, limit).map((v) => attach(v, options));
}
