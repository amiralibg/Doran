import { DoranDate } from '@doranjs/core';
import { describe, expect, it } from 'vitest';
import { buildMonthGrid, navigateFocus } from './grid';

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

describe('navigateFocus', () => {
  const at = (y: number, m: number, d: number) =>
    DoranDate.fromJalali(y, m, d, { timeZone: 'UTC' });

  it('moves by day and week', () => {
    const d = at(1404, 3, 15);
    expect(navigateFocus(d, 'next-day').isSame(at(1404, 3, 16), 'day')).toBe(true);
    expect(navigateFocus(d, 'prev-week').isSame(at(1404, 3, 8), 'day')).toBe(true);
  });

  it('snaps to the week edges', () => {
    const d = at(1404, 3, 15);
    expect(navigateFocus(d, 'week-start').dayOfWeek).toBe(0);
    expect(navigateFocus(d, 'week-end').dayOfWeek).toBe(6);
  });

  it('crosses the year boundary and clamps short months', () => {
    expect(navigateFocus(at(1405, 1, 1), 'prev-day').month).toBe(12);
    expect(navigateFocus(at(1404, 6, 31), 'next-month').isSame(at(1404, 7, 30), 'day')).toBe(true);
    expect(navigateFocus(at(1403, 12, 30), 'next-year').isSame(at(1404, 12, 29), 'day')).toBe(true);
  });
});
