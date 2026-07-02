import { DoranDate } from '@doranjs/core';
import { describe, expect, it } from 'vitest';
import { createCalendarGrid } from './use-calendar-grid';

describe('createCalendarGrid', () => {
  it('builds a Saturday-first grid for the cursor month', () => {
    const { cursor, grid } = createCalendarGrid(
      DoranDate.fromJalali({ year: 1403, month: 1, day: 15 }),
    );
    expect(cursor().year).toBe(1403);
    expect(grid().month).toBe(1);
    expect(grid().weeks.length).toBeGreaterThan(0);
    expect(grid().weeks[0]).toHaveLength(7);
  });

  it('steps months and recomputes the grid reactively', () => {
    const { cursor, grid, next, prev } = createCalendarGrid(
      DoranDate.fromJalali({ year: 1403, month: 1, day: 1 }),
    );
    next();
    expect(grid().month).toBe(2);
    prev();
    prev();
    expect(grid().month).toBe(12);
    expect(cursor().year).toBe(1402); // wrapped to the previous year
  });

  it('keeps the DoranDate un-proxied (private fields still work)', () => {
    const { cursor, next } = createCalendarGrid(
      DoranDate.fromJalali({ year: 1403, month: 5, day: 1 }),
    );
    next();
    expect(() => cursor().toISOString()).not.toThrow();
  });
});
