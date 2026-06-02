import { DoranDate } from '@doranjs/core';
import { describe, expect, it } from 'vitest';
import { buildMonthGrid } from './grid';

describe('buildMonthGrid', () => {
  const today = DoranDate.fromJalali(1405, 3, 11, { timeZone: 'UTC' });

  it('lays out full Saturday-first weeks', () => {
    const grid = buildMonthGrid(1405, 3, { today, timeZone: 'UTC' });
    expect(grid.year).toBe(1405);
    expect(grid.month).toBe(3);
    expect(grid.weeks.length).toBeGreaterThanOrEqual(5);
    for (const week of grid.weeks) {
      expect(week).toHaveLength(7);
      expect(week[0]!.weekday).toBe(0); // Saturday first
    }
  });

  it('flags the current month and today', () => {
    const grid = buildMonthGrid(1405, 3, { today, timeZone: 'UTC' });
    const all = grid.weeks.flat();
    expect(all.some((d) => d.isToday && d.day === 11)).toBe(true);
    expect(all.filter((d) => d.inCurrentMonth).every((d) => d.date.month === 3)).toBe(true);
  });
});
