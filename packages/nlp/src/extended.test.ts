import { DoranDate } from '@doranjs/core';
import { describe, expect, it } from 'vitest';
import { parseDuration } from './duration';
import { occurrences, parseRecurrence } from './recurrence';
import { parseRange } from './range';
import type { ParseOptions } from './types';

/** A fixed reference (1405/03/11 is a Monday / دوشنبه) so tests are deterministic. */
const reference = DoranDate.fromJalali(1405, 3, 11, { timeZone: 'UTC' });
const opts: ParseOptions = { reference, timeZone: 'UTC' };

describe('parseRange', () => {
  it('parses «از ۵ تا ۱۰ فروردین» borrowing the month for the bare left day', () => {
    const r = parseRange('از ۵ تا ۱۰ فروردین', opts)!;
    expect(r).not.toBeNull();
    expect([r.start.year, r.start.month, r.start.day]).toEqual([1405, 1, 5]);
    expect([r.end.year, r.end.month, r.end.day]).toEqual([1405, 1, 10]);
  });

  it('parses «از فردا تا جمعه»', () => {
    const r = parseRange('از فردا تا جمعه', opts)!;
    expect(r.start.day).toBe(12); // tomorrow
    expect(r.end.day).toBe(15); // upcoming Friday
  });

  it('parses two explicit dates', () => {
    const r = parseRange('۱۵ خرداد تا ۲۰ خرداد', opts)!;
    expect([r.start.month, r.start.day]).toEqual([3, 15]);
    expect([r.end.month, r.end.day]).toEqual([3, 20]);
  });

  it('orders endpoints chronologically even when reversed', () => {
    const r = parseRange('از ۱۰ تا ۵ فروردین', opts)!;
    expect(r.start.day).toBe(5);
    expect(r.end.day).toBe(10);
  });

  it('parses «بین ۵ و ۱۰ فروردین» (بین … و … form)', () => {
    const r = parseRange('بین ۵ و ۱۰ فروردین', opts)!;
    expect(r).not.toBeNull();
    expect([r.start.month, r.start.day]).toEqual([1, 5]);
    expect([r.end.month, r.end.day]).toEqual([1, 10]);
  });

  it('returns null when there is no range', () => {
    expect(parseRange('فردا', opts)).toBeNull();
  });
});

describe('parseDuration', () => {
  it('parses a whole-unit duration', () => {
    expect(parseDuration('دو هفته')).toMatchObject({ amount: 2, unit: 'week' });
    expect(parseDuration('۳ روز')).toMatchObject({ amount: 3, unit: 'day' });
  });

  it('parses fractional durations', () => {
    expect(parseDuration('یک ساعت و نیم')).toMatchObject({ amount: 1.5, unit: 'hour' });
    expect(parseDuration('نیم ساعت')).toMatchObject({ amount: 0.5, unit: 'hour' });
  });

  it('defaults a bare unit to one', () => {
    expect(parseDuration('هفته')).toMatchObject({ amount: 1, unit: 'week' });
  });

  it('ignores trailing direction words', () => {
    expect(parseDuration('دو هفته دیگه')).toMatchObject({ amount: 2, unit: 'week' });
  });

  it('returns null without a unit', () => {
    expect(parseDuration('فردا')).toBeNull();
  });
});

describe('parseRecurrence', () => {
  it('parses «هر دوشنبه» as a weekly weekday rule', () => {
    expect(parseRecurrence('هر دوشنبه')).toMatchObject({
      freq: 'weekly',
      interval: 1,
      weekday: 2,
    });
  });

  it('parses «هر روز» and «هر دو هفته»', () => {
    expect(parseRecurrence('هر روز')).toMatchObject({ freq: 'daily', interval: 1 });
    expect(parseRecurrence('هر دو هفته')).toMatchObject({ freq: 'weekly', interval: 2 });
  });

  it('parses adverbs of frequency', () => {
    expect(parseRecurrence('هفتگی')).toMatchObject({ freq: 'weekly', interval: 1 });
    expect(parseRecurrence('ماهانه')).toMatchObject({ freq: 'monthly', interval: 1 });
  });

  it('parses «یک روز در میان» (every other day) as a daily rule, interval 2', () => {
    expect(parseRecurrence('یک روز در میان')).toMatchObject({ freq: 'daily', interval: 2 });
  });

  it('parses «هر شب» (every night) as a daily rule', () => {
    expect(parseRecurrence('هر شب')).toMatchObject({ freq: 'daily', interval: 1 });
  });

  it('parses a compound interval «هر بیست و یک روز»', () => {
    expect(parseRecurrence('هر بیست و یک روز')).toMatchObject({ freq: 'daily', interval: 21 });
  });

  it('does not match «ظهر» (no false «هر»)', () => {
    expect(parseRecurrence('ظهر')).toBeNull();
    expect(parseRecurrence('فردا')).toBeNull();
  });

  it('expands occurrences of a weekday rule (today inclusive)', () => {
    const rule = parseRecurrence('هر دوشنبه')!;
    const days = occurrences(rule, reference, 3).map((d) => d.day);
    expect(days).toEqual([11, 18, 25]);
  });

  it('expands daily and interval rules', () => {
    expect(occurrences(parseRecurrence('هر روز')!, reference, 3).map((d) => d.day)).toEqual([
      11, 12, 13,
    ]);
    expect(occurrences(parseRecurrence('هر دو هفته')!, reference, 2).map((d) => d.day)).toEqual([
      11, 25,
    ]);
  });
});
