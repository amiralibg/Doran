import { normalizeDigits } from '@doran/core';

/** Persian cardinal number words for 0–19. */
const ONES: Record<string, number> = {
  صفر: 0,
  یک: 1,
  دو: 2,
  سه: 3,
  چهار: 4,
  پنج: 5,
  شش: 6,
  شیش: 6,
  هفت: 7,
  هشت: 8,
  نه: 9,
  ده: 10,
  یازده: 11,
  دوازده: 12,
  سیزده: 13,
  چهارده: 14,
  پانزده: 15,
  پونزده: 15,
  شانزده: 16,
  هفده: 17,
  هجده: 18,
  هیجده: 18,
  نوزده: 19,
};

/** Persian cardinal number words for the tens. */
const TENS: Record<string, number> = {
  بیست: 20,
  سی: 30,
  چهل: 40,
  پنجاه: 50,
  شصت: 60,
};

/**
 * Parses a Persian cardinal number, written either with digits (already normalized
 * to ASCII) or as words such as `"بیست و یک"`. Returns `null` when the text is not
 * a recognizable number.
 */
export function parsePersianNumber(text: string): number | null {
  const trimmed = normalizeDigits(text).trim();
  if (trimmed === '') return null;

  if (/^\d+$/.test(trimmed)) {
    return Number(trimmed);
  }

  const words = trimmed.split(/\s+و\s+|\s+/).filter(Boolean);
  let total = 0;
  let matched = false;

  for (const word of words) {
    if (word in TENS) {
      total += TENS[word]!;
      matched = true;
    } else if (word in ONES) {
      total += ONES[word]!;
      matched = true;
    } else if (word !== 'و') {
      return null;
    }
  }

  return matched ? total : null;
}

/** A regex fragment matching any supported number word (without anchors). */
export const NUMBER_WORD_PATTERN = [
  ...Object.keys(TENS),
  ...Object.keys(ONES).sort((a, b) => b.length - a.length),
]
  .map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
  .join('|');
