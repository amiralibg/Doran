import { DoranDate } from '@doranjs/core';
import { describe, expect, it } from 'vitest';
import { defaultRangePresets } from './presets';

const UTC = { timeZone: 'UTC' };
const today = DoranDate.fromJalali(1405, 3, 20, UTC); // 20 Khordad 1405

function preset(label: string) {
  const p = defaultRangePresets().find((x) => x.label === label)!;
  expect(p, `expected a preset labelled "${label}"`).toBeTruthy();
  return p.range(today);
}

describe('defaultRangePresets', () => {
  it('«۷ روز اخیر» spans the last 7 days, inclusive', () => {
    const { start, end } = preset('۷ روز اخیر');
    expect([start.month, start.day]).toEqual([3, 14]);
    expect([end.month, end.day]).toEqual([3, 20]);
  });

  it('«۳۰ روز اخیر» spans 30 days', () => {
    const { start, end } = preset('۳۰ روز اخیر');
    expect(end!.diff(start!, 'day')).toBe(29); // 30 days inclusive → 29 days apart
  });

  it('«این ماه» covers the whole current month', () => {
    const { start, end } = preset('این ماه');
    expect([start.year, start.month, start.day]).toEqual([1405, 3, 1]);
    expect([end.year, end.month, end.day]).toEqual([1405, 3, 31]); // Khordad has 31 days
  });

  it('«این سال» covers the whole current year', () => {
    const { start, end } = preset('این سال');
    expect([start.year, start.month, start.day]).toEqual([1405, 1, 1]);
    expect(end.year).toBe(1405);
    expect(end.month).toBe(12);
  });
});
