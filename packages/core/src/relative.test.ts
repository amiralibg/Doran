import { describe, expect, it } from 'vitest';
import { enUS, faIR } from './locale';
import { durationToHuman } from './relative';

describe('durationToHuman', () => {
  it('humanizes seconds in English (default locale is fa-IR, pass enUS explicitly)', () => {
    expect(durationToHuman(30, enUS)).toBe('a few seconds');
    expect(durationToHuman(60, enUS)).toBe('a minute');
    expect(durationToHuman(2 * 60, enUS)).toBe('2 minutes');
    expect(durationToHuman(3600, enUS)).toBe('an hour');
    expect(durationToHuman(3 * 3600, enUS)).toBe('3 hours');
    expect(durationToHuman(86400, enUS)).toBe('a day');
    expect(durationToHuman(3 * 86400, enUS)).toBe('3 days');
  });

  it('humanizes in Persian', () => {
    expect(durationToHuman(3 * 3600, faIR)).toBe('۳ ساعت');
    expect(durationToHuman(3 * 86400, faIR)).toBe('۳ روز');
  });

  it('uses the global default locale when none is given (fa-IR by default)', () => {
    // Default locale is fa-IR so Persian digits appear
    const result = durationToHuman(3600);
    expect(result).toBe('یک ساعت');
  });

  it('accepts a locale name string', () => {
    expect(durationToHuman(3600, 'en-US')).toBe('an hour');
  });
});
