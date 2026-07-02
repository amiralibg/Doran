import { computed, type Signal, signal, type WritableSignal } from '@angular/core';
import { DoranDate } from '@doranjs/core';
import { buildMonthGrid, type GridNav, type MonthGrid, navigateFocus } from '@doranjs/wc';

export interface CalendarGrid {
  /** The month currently in view (a `DoranDate`). Set the signal to jump months. */
  cursor: WritableSignal<DoranDate>;
  /** The 6×7 grid for `cursor`'s month, Saturday-first. Recomputes reactively. */
  grid: Signal<MonthGrid>;
  /** Step the cursor one month forward / back. */
  next: () => void;
  prev: () => void;
  /** Move focus within the grid (e.g. arrow-key navigation). */
  move: (nav: GridNav) => void;
}

/**
 * Headless calendar-grid built on Angular signals — reuses the shared
 * `buildMonthGrid` / `navigateFocus` from `@doranjs/wc`, so there's no
 * per-framework grid logic. Signals hold the immutable `DoranDate` as-is; nothing
 * proxies its private fields. Build your own markup around it; the components are
 * the batteries-included path.
 */
export function createCalendarGrid(initial?: DoranDate): CalendarGrid {
  const cursor = signal(initial ?? DoranDate.now());
  const grid = computed(() =>
    buildMonthGrid(cursor().year, cursor().month, { today: DoranDate.now() }),
  );
  return {
    cursor,
    grid,
    next: () => cursor.update((c) => c.add(1, 'month')),
    prev: () => cursor.update((c) => c.add(-1, 'month')),
    move: (nav: GridNav) => cursor.update((c) => navigateFocus(c, nav)),
  };
}
