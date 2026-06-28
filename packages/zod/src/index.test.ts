import { DoranDate } from '@doranjs/core';
import { describe, expect, it } from 'vitest';
import { toDoranDate, zDoranDate } from './index';

describe('toDoranDate', () => {
  it('passes through a DoranDate', () => {
    const d = DoranDate.now();
    expect(toDoranDate(d)).toBe(d);
  });

  it('coerces ISO strings, Dates, and epochs to the same instant', () => {
    const iso = '2024-06-28T10:30:00.000Z';
    const epoch = Date.parse(iso);
    expect(toDoranDate(iso)?.epochMs).toBe(epoch);
    expect(toDoranDate(new Date(iso))?.epochMs).toBe(epoch);
    expect(toDoranDate(epoch)?.epochMs).toBe(epoch);
  });

  it('rejects junk', () => {
    expect(toDoranDate('not a date')).toBeNull();
    expect(toDoranDate('')).toBeNull();
    expect(toDoranDate('   ')).toBeNull();
    expect(toDoranDate(Number.NaN)).toBeNull();
    expect(toDoranDate(Infinity)).toBeNull();
    expect(toDoranDate(new Date('nope'))).toBeNull();
    expect(toDoranDate(null)).toBeNull();
    expect(toDoranDate({})).toBeNull();
  });
});

describe('zDoranDate', () => {
  it('parses valid input to a DoranDate', () => {
    const out = zDoranDate().parse('2024-06-28');
    expect(out).toBeInstanceOf(DoranDate);
    expect(out.epochMs).toBe(Date.parse('2024-06-28'));
  });

  it('fails on invalid input', () => {
    const result = zDoranDate().safeParse('garbage');
    expect(result.success).toBe(false);
  });

  it('enforces min bound (inclusive)', () => {
    const schema = zDoranDate({ min: '2024-01-01T00:00:00.000Z' });
    expect(schema.safeParse('2023-12-31T23:59:59.999Z').success).toBe(false);
    expect(schema.safeParse('2024-01-01T00:00:00.000Z').success).toBe(true);
    expect(schema.safeParse('2024-06-01').success).toBe(true);
  });

  it('enforces max bound (inclusive)', () => {
    const schema = zDoranDate({ max: new Date('2024-12-31T23:59:59.999Z') });
    expect(schema.safeParse('2025-01-01').success).toBe(false);
    expect(schema.safeParse('2024-12-31T23:59:59.999Z').success).toBe(true);
  });

  it('accepts an existing DoranDate as input', () => {
    const d = DoranDate.fromGregorian(new Date('2024-06-28'));
    expect(zDoranDate().parse(d)).toBe(d);
  });

  it('works inside an object schema (the form case)', () => {
    const z = zDoranDate();
    const out = z.parse('2024-06-28T00:00:00.000Z');
    // Submitting Gregorian back to an API round-trips via toISOString().
    expect(out.toISOString()).toBe('2024-06-28T00:00:00.000Z');
  });
});
