import { DoranDate } from '@doranjs/core';
import { buildMonthGrid, type GridNav, type MonthGrid, navigateFocus } from '@doranjs/wc';
import { derived, type Readable, type Writable, writable } from 'svelte/store';

export interface CalendarGrid {
  /** The month currently in view. Writable — set it to jump months. */
  cursor: Writable<DoranDate>;
  /** The 6×7 grid for `cursor`'s month, Saturday-first. Recomputes reactively. */
  grid: Readable<MonthGrid>;
  /** Step the cursor one month forward / back. */
  next: () => void;
  prev: () => void;
  /** Move focus within the grid (e.g. arrow-key navigation). */
  move: (nav: GridNav) => void;
}

/**
 * Headless calendar-grid store — reuses the shared `buildMonthGrid` /
 * `navigateFocus` from `@doranjs/wc`, so there's no per-framework grid logic.
 * Svelte stores never proxy their value, so the immutable `DoranDate` is safe.
 */
export function createCalendarGrid(initial?: DoranDate): CalendarGrid {
  const cursor = writable(initial ?? DoranDate.now());
  const grid = derived(cursor, (c) => buildMonthGrid(c.year, c.month, { today: DoranDate.now() }));
  return {
    cursor,
    grid,
    next: () => cursor.update((c) => c.add(1, 'month')),
    prev: () => cursor.update((c) => c.add(-1, 'month')),
    move: (nav: GridNav) => cursor.update((c) => navigateFocus(c, nav)),
  };
}
