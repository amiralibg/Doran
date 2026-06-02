import { normalizeDigits } from '@doranjs/core';

/**
 * Normalizes Persian free text so that downstream matchers can rely on a single
 * canonical form. This:
 *
 * - converts Persian/Arabic numerals to ASCII digits,
 * - folds Arabic/variant glyphs to their Persian equivalents (ي ى ئ → ی, ك → ک,
 *   ة ۀ → ه, أ إ ٱ → ا) so different spellings of the same word match,
 * - removes diacritics and the zero-width non-joiner (ZWNJ),
 * - collapses runs of whitespace.
 *
 * The alef-madda (آ) is deliberately preserved because it is significant in the date
 * vocabulary (آینده, آبان, آخر, …).
 */
export function normalize(input: string): string {
  return normalizeDigits(input)
    .replace(/[يىئ]/g, 'ی') // Arabic/variant yeh → Persian yeh
    .replace(/ك/g, 'ک') // Arabic kaf → Persian kaf
    .replace(/[ةۀ]/g, 'ه') // taa marbuta / heh-with-yeh → heh
    .replace(/[أإٱ]/g, 'ا') // alef-hamza variants → bare alef (not آ)
    .replace(/[‌‏‎]/g, '') // ZWNJ + directional marks
    .replace(/[ً-ْ]/g, '') // Arabic harakat (diacritics)
    .replace(/\s+/g, ' ')
    .trim();
}
