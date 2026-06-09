import { normalizeDigits } from '@doranjs/core';

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
  هیجده: 18,
  هجده: 18,
  نوزده: 19,
};

/** Persian cardinal number words for the tens. */
const TENS: Record<string, number> = {
  بیست: 20,
  سی: 30,
  چهل: 40,
  پنجاه: 50,
  شصت: 60,
  هفتاد: 70,
  هشتاد: 80,
  نود: 90,
};

/** Persian cardinal number words for the hundreds. */
const HUNDREDS: Record<string, number> = {
  صد: 100,
  یکصد: 100,
  دویست: 200,
  سیصد: 300,
  چهارصد: 400,
  پانصد: 500,
  ششصد: 600,
  هفتصد: 700,
  هشتصد: 800,
  نهصد: 900,
};

/** Every recognized magnitude word, merged for lookup. */
const ALL_WORDS: Record<string, number> = { ...HUNDREDS, ...TENS, ...ONES };

/**
 * Parses a Persian cardinal number, written either with digits (already normalized
 * to ASCII) or as words such as `"بیست و یک"` or `"صد و بیست و سه"`. Persian number
 * words are additive within a group (hundreds + tens + ones), so a simple sum of the
 * recognized words is exact below one thousand. Returns `null` when the text is not a
 * recognizable number.
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
    if (word in ALL_WORDS) {
      total += ALL_WORDS[word]!;
      matched = true;
    } else if (word !== 'و') {
      return null;
    }
  }

  return matched ? total : null;
}

/**
 * A regex fragment matching any single supported number word (without anchors).
 * Sorted longest-first so multi-character words win the alternation (e.g. `ششصد`
 * before `شش`, `پانزده` before `پنج`).
 */
export const NUMBER_WORD_PATTERN = Object.keys(ALL_WORDS)
  .sort((a, b) => b.length - a.length)
  .map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
  .join('|');

/**
 * A regex fragment matching a *compound* number phrase such as `بیست و یک` or
 * `صد و بیست و سه` — one or more number words joined by «و». Use this where users may
 * write multi-word counts (day of month, "N units later", recurrence intervals);
 * {@link parsePersianNumber} resolves the captured text.
 */
export const NUMBER_PHRASE_PATTERN = `(?:${NUMBER_WORD_PATTERN})(?:\\s+و\\s+(?:${NUMBER_WORD_PATTERN}))*`;
