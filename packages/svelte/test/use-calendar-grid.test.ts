import { DoranDate } from '@doranjs/core';
import { get } from 'svelte/store';
import { describe, expect, it } from 'vitest';
import { createCalendarGrid } from '../src/lib/use-calendar-grid';

describe('createCalendarGrid', () => {
  it('builds a Saturday-first grid for the cursor month', () => {
    const { cursor, grid } = createCalendarGrid(
      DoranDate.fromJalali({ year: 1403, month: 1, day: 15 }),
    );
    expect(get(cursor).year).toBe(1403);
    const g = get(grid);
    expect(g.month).toBe(1);
    expect(g.weeks.length).toBeGreaterThan(0);
    expect(g.weeks[0]).toHaveLength(7);
  });

  it('steps months and recomputes the grid reactively', () => {
    const { grid, cursor, next, prev } = createCalendarGrid(
      DoranDate.fromJalali({ year: 1403, month: 1, day: 1 }),
    );
    next();
    expect(get(grid).month).toBe(2);
    prev();
    prev();
    expect(get(grid).month).toBe(12);
    expect(get(cursor).year).toBe(1402); // wrapped to the previous year
  });

  it('keeps the DoranDate intact (no proxy clobbering private fields)', () => {
    const { cursor, next } = createCalendarGrid(
      DoranDate.fromJalali({ year: 1403, month: 5, day: 1 }),
    );
    next();
    expect(() => get(cursor).toISOString()).not.toThrow();
  });
});
