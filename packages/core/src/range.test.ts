import { describe, expect, it } from 'vitest';
import { DoranDate } from './doran-date';
import { DoranRange } from './range';
import type { DoranDateOptions } from './types';

const UTC: DoranDateOptions = { timeZone: 'UTC' };
const at = (y: number, m: number, d: number) => DoranDate.fromJalali(y, m, d, UTC);

describe('DoranRange', () => {
  const range = new DoranRange(at(1403, 1, 1), at(1403, 1, 10));

  it('normalizes reversed endpoints', () => {
    const reversed = new DoranRange(at(1403, 1, 10), at(1403, 1, 1));
    expect(reversed.start.day).toBe(1);
    expect(reversed.end.day).toBe(10);
  });

  it('measures its duration', () => {
    expect(range.duration('day')).toBe(9);
    expect(range.asDuration().asDays()).toBe(9);
  });

  it('tests containment (endpoints inclusive by default)', () => {
    expect(range.contains(at(1403, 1, 5))).toBe(true);
    expect(range.contains(at(1403, 1, 1))).toBe(true);
    expect(range.contains(at(1403, 1, 1), { excludeStart: true })).toBe(false);
    expect(range.contains(at(1403, 1, 10), { excludeEnd: true })).toBe(false);
    expect(range.contains(at(1403, 2, 1))).toBe(false);
  });

  it('detects overlap and intersection', () => {
    const other = new DoranRange(at(1403, 1, 5), at(1403, 1, 20));
    const disjoint = new DoranRange(at(1403, 2, 1), at(1403, 2, 5));
    expect(range.overlaps(other)).toBe(true);
    expect(range.overlaps(disjoint)).toBe(false);
    expect(range.intersect(other)?.duration('day')).toBe(5); // 1/5 … 1/10
    expect(range.intersect(disjoint)).toBeNull();
  });

  it('treats touching ranges as overlapping only when adjacent is set', () => {
    const touching = new DoranRange(at(1403, 1, 10), at(1403, 1, 15));
    expect(range.overlaps(touching)).toBe(false);
    expect(range.overlaps(touching, { adjacent: true })).toBe(true);
  });

  it('iterates by a unit', () => {
    expect([...range.by('day')]).toHaveLength(10);
    expect(range.toArray('day', { excludeEnd: true })).toHaveLength(9);
    expect([...range.by('day', { step: 2 })]).toHaveLength(5);
    expect([...range]).toHaveLength(10); // default iterator steps by day
  });

  it('rejects a non-positive step', () => {
    expect(() => [...range.by('day', { step: 0 })]).toThrow(RangeError);
  });

  it('compares equality and serializes', () => {
    expect(range.isEqual(new DoranRange(at(1403, 1, 1), at(1403, 1, 10)))).toBe(true);
    expect(range.toString()).toContain('/');
  });
});
