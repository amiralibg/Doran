import { describe, expect, it } from 'vitest';

import { enUS, faIR, resolveCalendarLabels, resolveDirection } from './locale';
import type { Locale } from './types';

describe('resolveDirection', () => {
  it('reads the locale direction', () => {
    expect(resolveDirection(faIR)).toBe('rtl');
    expect(resolveDirection(enUS)).toBe('ltr');
  });

  // Every locale written before `direction` existed assumed right-to-left.
  it('defaults to rtl for a locale that omits it', () => {
    const legacy = { ...faIR, direction: undefined } as Locale;
    expect(resolveDirection(legacy)).toBe('rtl');
  });
});

describe('resolveCalendarLabels', () => {
  it('returns a complete Persian set by default', () => {
    const labels = resolveCalendarLabels(faIR);
    expect(labels.today).toBe('امروز');
    expect(labels.calendar).toBe('تقویم');
    expect(labels.hour).toBe('ساعت');
    expect(labels.rangeSeparator).toBe(' تا ');
  });

  it('returns the English set for enUS', () => {
    const labels = resolveCalendarLabels(enUS);
    expect(labels.today).toBe('Today');
    expect(labels.calendar).toBe('Calendar');
    expect(labels.previousMonth).toBe('Previous month');
    expect(labels.lastDays).toBe('Last {count} days');
  });

  // Locales written before these fields existed supply only today/clear.
  it('fills the gaps for a locale that defines only some labels', () => {
    const partial: Locale = { ...faIR, calendarLabels: { today: 'Now', clear: 'Reset' } };
    const labels = resolveCalendarLabels(partial);

    expect(labels.today).toBe('Now');
    expect(labels.clear).toBe('Reset');
    expect(labels.calendar).toBe('تقویم');
    expect(labels.minute).toBe('دقیقه');
  });

  it('fills the gaps for a locale with no labels at all', () => {
    const bare = { ...faIR, calendarLabels: undefined } as Locale;
    expect(resolveCalendarLabels(bare).openCalendar).toBe('باز کردن تقویم');
  });

  // An explicit `undefined` should read as "not supplied", not as a blank label.
  it('does not let an explicit undefined shadow a default', () => {
    const partial: Locale = { ...faIR, calendarLabels: { today: undefined, clear: 'Reset' } };
    expect(resolveCalendarLabels(partial).today).toBe('امروز');
  });

  it('lets a locale override every field', () => {
    const custom: Locale = {
      ...enUS,
      calendarLabels: { ...resolveCalendarLabels(enUS), calendar: 'Date grid' },
    };
    expect(resolveCalendarLabels(custom).calendar).toBe('Date grid');
    expect(resolveCalendarLabels(custom).today).toBe('Today');
  });
});
