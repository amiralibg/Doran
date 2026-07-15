import { describe, expect, it } from 'vitest';

import { normalizeDigits, toLatinDigits, toPersianDigits } from './digits';

describe('toPersianDigits', () => {
  it('replaces ASCII digits with Persian numerals', () => {
    expect(toPersianDigits('1405')).toBe('۱۴۰۵');
  });

  it('leaves non-digit characters alone', () => {
    expect(toPersianDigits('1405/01/01')).toBe('۱۴۰۵/۰۱/۰۱');
  });
});

describe('normalizeDigits', () => {
  it('converts Persian numerals to ASCII', () => {
    expect(normalizeDigits('۱۴۰۵')).toBe('1405');
  });

  it('converts Arabic-Indic numerals to ASCII', () => {
    expect(normalizeDigits('١٤٠٥')).toBe('1405');
  });

  it('handles both digit families in one string', () => {
    expect(normalizeDigits('۱۴٠٥')).toBe('1405');
  });

  it('is identity for ASCII input', () => {
    expect(normalizeDigits('1405')).toBe('1405');
  });

  it('preserves surrounding non-digit characters', () => {
    expect(normalizeDigits('۰۹۱۲-۳۴۵')).toBe('0912-345');
  });
});

describe('toLatinDigits', () => {
  it('converts Persian numerals to ASCII', () => {
    expect(toLatinDigits('۰۹۱۲۳۴۵۶۷۸۹')).toBe('09123456789');
  });

  it('converts Arabic-Indic numerals to ASCII', () => {
    expect(toLatinDigits('١٤٠٥')).toBe('1405');
  });

  it('is identity for ASCII input, so Latin-locale formatNumber is unchanged', () => {
    expect(toLatinDigits('1405')).toBe('1405');
    expect(toLatinDigits('09:30 AM')).toBe('09:30 AM');
  });
});
