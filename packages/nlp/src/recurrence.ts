import type { DoranDate } from '@doranjs/core';
import { normalize } from './normalize';
import { NUMBER_PHRASE_PATTERN, parsePersianNumber } from './numbers';
import type { RecurrenceFreq, RecurrenceResult } from './types';

/** Weekday matchers, compound names first so `شنبه` does not shadow `یکشنبه`. */
const WEEKDAY_PATTERNS: Array<[RegExp, number]> = [
  [/پنج\s?شنبه/, 5],
  [/چهار\s?شنبه/, 4],
  [/سه\s?شنبه/, 3],
  [/دو\s?شنبه/, 2],
  [/یک\s?شنبه/, 1],
  [/جمعه/, 6],
  [/شنبه/, 0],
];

/** Unit keyword → frequency, for «هر [N] <unit>». */
const UNIT_FREQ: Array<[RegExp, RecurrenceFreq]> = [
  [/روز/, 'daily'],
  [/هفته/, 'weekly'],
  [/ماه/, 'monthly'],
  [/سال/, 'yearly'],
];

/** Single-word adverbs of frequency. */
const ADVERBS: Array<[RegExp, RecurrenceFreq]> = [
  [/روزانه/, 'daily'],
  [/هفتگی/, 'weekly'],
  [/ماهانه|ماهیانه/, 'monthly'],
  [/سالانه|سالیانه/, 'yearly'],
];

/**
 * Parses a Persian recurrence expression such as «هر روز», «هر دوشنبه», «هر دو هفته»,
 * or the adverbs «روزانه/هفتگی/ماهانه/سالانه». Returns `null` when nothing recurs.
 *
 * @example
 * ```ts
 * parseRecurrence('هر دوشنبه');  // → { freq: 'weekly', interval: 1, weekday: 2, … }
 * parseRecurrence('هر دو هفته'); // → { freq: 'weekly', interval: 2, … }
 * ```
 */
export function parseRecurrence(input: string): RecurrenceResult | null {
  const text = normalize(input);

  for (const [pattern, freq] of ADVERBS) {
    const m = text.match(pattern);
    if (m) return { freq, interval: 1, confidence: 0.9, matched: m[0]! };
  }

  // «[N] <unit> در میان» (e.g. «یک روز در میان» = every other day → interval N+1).
  for (const [pattern, freq] of UNIT_FREQ) {
    const m = text.match(
      new RegExp(`(?:(${NUMBER_PHRASE_PATTERN}|\\d+)\\s+)?(${pattern.source})\\s+در\\s?میان`),
    );
    if (m) {
      const n = m[1] ? (parsePersianNumber(m[1]) ?? 1) : 1;
      return { freq, interval: n + 1, confidence: 0.9, matched: m[0]! };
    }
  }

  // Require «هر» as a standalone word (followed by a space) so it does not match
  // substrings like «ظهر». The per-rule patterns below also anchor on «هر ».
  if (!/(?:^|\s)هر\s/.test(text)) return null;

  // «هر <weekday>» → a weekly rule anchored to that weekday.
  for (const [pattern, weekday] of WEEKDAY_PATTERNS) {
    const m = text.match(new RegExp(`هر\\s+(${pattern.source})`));
    if (m) {
      return { freq: 'weekly', interval: 1, weekday, confidence: 0.95, matched: m[0]! };
    }
  }

  // «هر [N] <unit>» → interval N (default 1) of the unit's frequency.
  for (const [pattern, freq] of UNIT_FREQ) {
    const m = text.match(
      new RegExp(`هر\\s+(?:(${NUMBER_PHRASE_PATTERN}|\\d+)\\s+)?(${pattern.source})`),
    );
    if (m) {
      const interval = m[1] ? (parsePersianNumber(m[1]) ?? 1) : 1;
      return { freq, interval, confidence: 0.92, matched: m[0]! };
    }
  }

  // «هر <part-of-day>» (e.g. «هر صبح», «هر شب») → a daily rule.
  if (/هر\s+(?:صبح|ظهر|عصر|غروب|شب|بامداد|سحر|شامگاه|نیمروز|بعد\s?از\s?ظهر)/.test(text)) {
    return { freq: 'daily', interval: 1, confidence: 0.9, matched: text };
  }

  return null;
}

/**
 * Expands a recurrence rule into its first `count` occurrences on or after `from`.
 * For weekly rules with a `weekday`, the first occurrence is the next matching weekday
 * (today inclusive). All occurrences are at the start of their day.
 *
 * @example
 * ```ts
 * occurrences(parseRecurrence('هر دوشنبه')!, DoranDate.now(), 4);
 * ```
 */
export function occurrences(rule: RecurrenceResult, from: DoranDate, count: number): DoranDate[] {
  if (count <= 0) return [];
  const start = from.startOf('day');

  let first = start;
  if (rule.freq === 'weekly' && rule.weekday !== undefined) {
    const diff = (rule.weekday - start.dayOfWeek + 7) % 7; // upcoming, today inclusive
    first = start.addDays(diff);
  }

  const step = (date: DoranDate, n: number): DoranDate => {
    switch (rule.freq) {
      case 'daily':
        return date.addDays(n * rule.interval);
      case 'weekly':
        return date.addWeeks(n * rule.interval);
      case 'monthly':
        return date.addMonths(n * rule.interval);
      case 'yearly':
        return date.addYears(n * rule.interval);
    }
  };

  return Array.from({ length: count }, (_, i) => step(first, i));
}
