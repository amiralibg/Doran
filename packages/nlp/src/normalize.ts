import { normalizeDigits } from '@doran/core';

/**
 * Normalizes Persian free text so that downstream matchers can rely on a single
 * canonical form. This:
 *
 * - converts Persian/Arabic numerals to ASCII digits,
 * - unifies Arabic glyphs to their Persian equivalents (ي → ی, ك → ک),
 * - removes diacritics and the zero-width non-joiner (ZWNJ),
 * - collapses runs of whitespace.
 */
export function normalize(input: string): string {
  return normalizeDigits(input)
    .replace(/ي/g, 'ی') // Arabic yeh → Persian yeh
    .replace(/ك/g, 'ک') // Arabic kaf → Persian kaf
    .replace(/[‌‏‎]/g, '') // ZWNJ + directional marks
    .replace(/[ً-ْ]/g, '') // Arabic harakat (diacritics)
    .replace(/\s+/g, ' ')
    .trim();
}
