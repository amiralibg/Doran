import { DoranDate } from '@doran/core';
import { describe, expect, it } from 'vitest';
import { buildMonthGrid } from './grid';

const UTC = { timeZone: 'UTC' };

describe('buildMonthGrid', () => {
  it('lays out weeks of 7 days, Saturday-first', () => {
    const grid = buildMonthGrid(1405, 3, UTC);
    expect(grid.weeks.length).toBeGreaterThanOrEqual(5);
    for (const week of grid.weeks) {
      expect(week).toHaveLength(7);
      expect(week[0]!.weekday).toBe(0); // Saturday starts each row
      expect(week[6]!.weekday).toBe(6); // Friday ends each row
    }
  });

  it('places the 1st of the month in the correct column', () => {
    // 1 Farvardin 1404 = 2025-03-21, a Friday → weekday 6.
    const grid = buildMonthGrid(1404, 1, UTC);
    const first = grid.days.find((d) => d.inCurrentMonth && d.day === 1)!;
    expect(first.weekday).toBe(6);
    const firstRow = grid.weeks[0]!;
    expect(firstRow[6]!.day).toBe(1);
    expect(firstRow[6]!.inCurrentMonth).toBe(true);
    expect(firstRow[0]!.inCurrentMonth).toBe(false); // leading day from prev month
  });

  it('marks leading and trailing days as outside the current month', () => {
    const grid = buildMonthGrid(1405, 1, UTC);
    const inMonth = grid.days.filter((d) => d.inCurrentMonth);
    expect(inMonth).toHaveLength(31); // Farvardin always has 31 days
    expect(inMonth[0]!.day).toBe(1);
    expect(inMonth.at(-1)!.day).toBe(31);
  });

  it('flags today correctly', () => {
    const today = DoranDate.fromJalali(1405, 3, 15, UTC);
    const grid = buildMonthGrid(1405, 3, { ...UTC, today });
    const todayCell = grid.days.find((d) => d.isToday);
    expect(todayCell?.day).toBe(15);
    expect(grid.days.filter((d) => d.isToday)).toHaveLength(1);
  });

  it('honours fixedWeeks for stable height', () => {
    const grid = buildMonthGrid(1405, 2, { ...UTC, fixedWeeks: 6 });
    expect(grid.weeks).toHaveLength(6);
    expect(grid.days).toHaveLength(42);
  });

  it('produces contiguous days across the whole grid', () => {
    const grid = buildMonthGrid(1405, 7, UTC);
    for (let i = 1; i < grid.days.length; i += 1) {
      expect(grid.days[i]!.date.diff(grid.days[i - 1]!.date, 'day')).toBe(1);
    }
  });
});
