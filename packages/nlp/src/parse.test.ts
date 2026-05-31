import { DoranDate } from '@doranjs/core';
import { describe, expect, it } from 'vitest';
import { Parser, parse } from './engine';
import { normalize } from './normalize';
import { parsePersianNumber } from './numbers';
import type { ParseOptions } from './types';

/** A fixed reference so every test is deterministic. */
const reference = DoranDate.fromJalali(1405, 3, 11, { timeZone: 'UTC' });
const opts: ParseOptions = { reference, timeZone: 'UTC' };

function parsed(input: string) {
  const result = parse(input, opts);
  expect(result, `expected to parse "${input}"`).not.toBeNull();
  return result!;
}

describe('relative days', () => {
  it('parses فردا (tomorrow)', () => {
    const { date, confidence } = parsed('فردا');
    expect(date.diff(reference.startOf('day'), 'day')).toBe(1);
    expect(confidence).toBeCloseTo(0.98, 2);
  });

  it('parses پس فردا (day after tomorrow)', () => {
    expect(parsed('پس فردا').date.diff(reference.startOf('day'), 'day')).toBe(2);
  });

  it('parses دیروز (yesterday)', () => {
    expect(parsed('دیروز').date.diff(reference.startOf('day'), 'day')).toBe(-1);
  });

  it('parses امروز (today)', () => {
    expect(parsed('امروز').date.isSame(reference.startOf('day'))).toBe(true);
  });
});

describe('weekdays', () => {
  it('parses سه شنبه آینده (next Tuesday) strictly in the future', () => {
    const { date } = parsed('سه شنبه آینده');
    expect(date.dayOfWeek).toBe(3);
    expect(date.isAfter(reference.startOf('day'))).toBe(true);
    expect(date.diff(reference.startOf('day'), 'day')).toBeGreaterThanOrEqual(1);
    expect(date.diff(reference.startOf('day'), 'day')).toBeLessThanOrEqual(7);
  });

  it('parses شنبه صبح (Saturday morning)', () => {
    const { date } = parsed('شنبه صبح');
    expect(date.dayOfWeek).toBe(0);
    expect(date.hour).toBe(8);
  });
});

describe('month & unit arithmetic', () => {
  it('parses اول ماه بعد (first of next month)', () => {
    const { date } = parsed('اول ماه بعد');
    expect(date.day).toBe(1);
    expect(date.month).toBe(reference.addMonths(1).month);
  });

  it('parses دو هفته دیگر (two weeks later)', () => {
    expect(parsed('دو هفته دیگر').date.diff(reference.startOf('day'), 'day')).toBe(14);
  });

  it('parses ۳ روز پیش (three days ago) with digits', () => {
    expect(parsed('۳ روز پیش').date.diff(reference.startOf('day'), 'day')).toBe(-3);
  });
});

describe('special days', () => {
  it('parses نوروز سال آینده (Nowruz next year)', () => {
    const { date } = parsed('نوروز سال آینده');
    expect(date.month).toBe(1);
    expect(date.day).toBe(1);
    expect(date.year).toBe(reference.year + 1);
  });
});

describe('day + time composition', () => {
  it('parses جمعه ساعت ۷ شب (Friday 7pm) with high confidence', () => {
    const { date, confidence } = parsed('جمعه ساعت ۷ شب');
    expect(date.dayOfWeek).toBe(6);
    expect(date.hour).toBe(19);
    expect(confidence).toBeGreaterThanOrEqual(0.95);
  });

  it('parses ساعت ۱۴:۳۰ as 24-hour time today', () => {
    const { date } = parsed('ساعت ۱۴:۳۰');
    expect(date.hour).toBe(14);
    expect(date.minute).toBe(30);
    expect(date.isSame(reference.startOf('day'), 'day')).toBe(true);
  });
});

describe('robustness', () => {
  it('returns null for unrecognized input', () => {
    expect(parse('یک جمله بی‌ربط', opts)).toBeNull();
  });

  it('normalizes Arabic glyphs and ZWNJ', () => {
    expect(normalize('سه‌شنبه')).toBe('سهشنبه');
    expect(normalize('كيف')).toBe('کیف');
  });
});

describe('number words', () => {
  it.each([
    ['یک', 1],
    ['دو', 2],
    ['بیست و یک', 21],
    ['۱۵', 15],
  ])('parses %s as %i', (word, value) => {
    expect(parsePersianNumber(word)).toBe(value);
  });

  it('returns null for non-numbers', () => {
    expect(parsePersianNumber('سلام')).toBeNull();
  });
});

describe('extensibility', () => {
  it('lets callers register a custom day extractor', () => {
    const parser = new Parser();
    parser.useDay((ctx) =>
      /تولد/.test(ctx.text)
        ? {
            date: DoranDate.fromJalali(ctx.reference.year, 7, 1, opts),
            confidence: 1,
            span: 'تولد',
          }
        : null,
    );
    const result = parser.parse('تولد', opts);
    expect(result?.date.month).toBe(7);
    expect(result?.confidence).toBe(1);
  });
});
