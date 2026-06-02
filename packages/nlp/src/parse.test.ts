import { DoranDate } from '@doranjs/core';
import { describe, expect, it } from 'vitest';
import { Parser, parse } from './engine';
import { remapKeyboard } from './keyboard';
import { normalize } from './normalize';
import { parsePersianNumber } from './numbers';
import { suggest } from './suggest';
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

describe('explicit dates', () => {
  it('parses ۱۵ خرداد (day + month) in the reference year', () => {
    const { date } = parsed('۱۵ خرداد');
    expect(date.year).toBe(reference.year);
    expect(date.month).toBe(3);
    expect(date.day).toBe(15);
  });

  it('parses ۱۵ خرداد ۱۴۰۶ (day + month + year)', () => {
    const { date } = parsed('۱۵ خرداد ۱۴۰۶');
    expect(date.year).toBe(1406);
    expect(date.month).toBe(3);
    expect(date.day).toBe(15);
  });

  it('parses پانزده خرداد (number-word day)', () => {
    const { date } = parsed('پانزده خرداد');
    expect(date.month).toBe(3);
    expect(date.day).toBe(15);
  });

  it('parses ۱۵م تیر (ordinal suffix)', () => {
    const { date } = parsed('۱۵م تیر');
    expect(date.month).toBe(4);
    expect(date.day).toBe(15);
  });

  it('parses numeric ۱۴۰۵/۰۳/۲۰', () => {
    const { date } = parsed('۱۴۰۵/۰۳/۲۰');
    expect(date.year).toBe(1405);
    expect(date.month).toBe(3);
    expect(date.day).toBe(20);
  });

  it('parses بهمن ۱۴۰۵ (month + year) as the first of that month', () => {
    const { date } = parsed('بهمن ۱۴۰۵');
    expect(date.year).toBe(1405);
    expect(date.month).toBe(11);
    expect(date.day).toBe(1);
  });
});

describe('current-period & weekend', () => {
  it('parses این هفته (this week) as the start of the week', () => {
    const { date } = parsed('این هفته');
    expect(date.isSame(reference.startOf('week'), 'day')).toBe(true);
  });

  it('parses این ماه (this month) as the first of the month', () => {
    const { date } = parsed('این ماه');
    expect(date.day).toBe(1);
    expect(date.month).toBe(reference.month);
  });

  it('parses آخر هفته (weekend) as Friday', () => {
    expect(parsed('آخر هفته').date.dayOfWeek).toBe(6);
  });
});

describe('richer time', () => {
  it('parses ساعت ۷ و نیم (half past seven)', () => {
    const { date } = parsed('ساعت ۷ و نیم');
    expect(date.hour).toBe(7);
    expect(date.minute).toBe(30);
  });

  it('parses ساعت ۸ و ربع (quarter past eight)', () => {
    const { date } = parsed('ساعت ۸ و ربع');
    expect(date.hour).toBe(8);
    expect(date.minute).toBe(15);
  });

  it('parses یک ربع به ۸ (quarter to eight)', () => {
    const { date } = parsed('یک ربع به ۸');
    expect(date.hour).toBe(7);
    expect(date.minute).toBe(45);
  });

  it('parses ۲۰ دقیقه به ۹ (twenty to nine)', () => {
    const { date } = parsed('۲۰ دقیقه به ۹');
    expect(date.hour).toBe(8);
    expect(date.minute).toBe(40);
  });

  it('parses ساعت هفت شب (seven pm, number word)', () => {
    expect(parsed('ساعت هفت شب').date.hour).toBe(19);
  });

  it('treats ۱۲ شب as midnight', () => {
    expect(parsed('ساعت ۱۲ شب').date.hour).toBe(0);
  });

  it('treats ۱۲ ظهر as noon', () => {
    expect(parsed('ساعت ۱۲ ظهر').date.hour).toBe(12);
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

  it('folds yeh/alef/heh variants so spellings match', () => {
    expect(normalize('مئبد')).toBe(normalize('میبد'));
    expect(normalize('ميبد')).toBe(normalize('میبد'));
    expect(normalize('مىبد')).toBe(normalize('میبد'));
  });
});

describe('search-expression robustness', () => {
  it('parses text typed with the keyboard left in English (layout remap)', () => {
    // «فردا» typed on a US layout comes out as "tvnh".
    expect(parse('tvnh', opts)?.date.diff(reference.startOf('day'), 'day')).toBe(1);
  });

  it('remaps a known city sample correctly (dcn → یزد)', () => {
    expect(remapKeyboard('dcn')).toBe('یزد');
    expect(remapKeyboard('ldfn')).toBe('میبد');
    expect(remapKeyboard('ivhj')).toBe('هرات');
  });

  it('parses Finglish (Latin-script Persian)', () => {
    expect(parse('farda', opts)?.date.diff(reference.startOf('day'), 'day')).toBe(1);
    expect(parse('emruz', opts)?.date.isSame(reference.startOf('day'))).toBe(true);
  });

  it('parses a composed Finglish expression', () => {
    const { date } = parse('jomeh saat 7 shab', opts)!;
    expect(date.dayOfWeek).toBe(6); // Friday
    expect(date.hour).toBe(19);
  });

  it('still returns null for true gibberish', () => {
    expect(parse('qwzx', opts)).toBeNull();
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

describe('suggestions', () => {
  it('completes a partial weekday', () => {
    const values = suggest('جم', opts).map((s) => s.value);
    expect(values).toContain('جمعه');
  });

  it('offers week phrases for "هفته"', () => {
    const values = suggest('هفته', opts).map((s) => s.value);
    expect(values).toContain('هفته بعد');
  });

  it('completes a trailing partial token while keeping the prefix', () => {
    const values = suggest('جلسه شنب', opts).map((s) => s.value);
    expect(values).toContain('جلسه شنبه');
  });

  it('attaches a resolved preview date when the suggestion parses', () => {
    const fardaa = suggest('فرد', opts).find((s) => s.value === 'فردا');
    expect(fardaa?.date?.diff(reference.startOf('day'), 'day')).toBe(1);
  });

  it('suggests special days with proper half-spaces (ZWNJ), not space-less blobs', () => {
    const s = suggest('سیزده', opts).find((x) => normalize(x.value) === 'سیزدهبهدر');
    expect(s, 'expected a سیزده‌به‌در suggestion').toBeDefined();
    expect(s!.value).toContain('‌'); // ZWNJ present → "سیزده‌به‌در"
    expect(s!.value).not.toBe('سیزدهبهدر');
    expect(s!.date).toMatchObject({}); // resolves
    expect(s!.date?.month).toBe(1);
    expect(s!.date?.day).toBe(13);
  });

  it('suggests weekdays with proper half-spaces and they still parse', () => {
    const s = suggest('سه', opts).find((x) => normalize(x.value) === 'سهشنبه');
    expect(s, 'expected a سه‌شنبه suggestion').toBeDefined();
    expect(s!.value).toContain('‌');
    expect(parse(s!.value, opts)?.date.dayOfWeek).toBe(3);
  });

  it('returns curated defaults for empty input', () => {
    expect(suggest('', opts).length).toBeGreaterThan(0);
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
