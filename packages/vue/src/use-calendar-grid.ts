import { DoranDate } from '@doranjs/core';
import { buildMonthGrid, type GridNav, type MonthGrid, navigateFocus } from '@doranjs/wc';
import { computed, type ComputedRef, type ShallowRef, shallowRef } from 'vue';

export interface UseCalendarGrid {
  /** The month currently in view (a `DoranDate`). Immutable — reassign to move. */
  cursor: ShallowRef<DoranDate>;
  /** The 6×7 grid for `cursor`'s month, rebuilt reactively. */
  grid: ComputedRef<MonthGrid>;
  /** Step the cursor one month forward / back. */
  next: () => void;
  prev: () => void;
  /** Move focus within the grid (e.g. arrow-key navigation). */
  move: (nav: GridNav) => void;
}

/**
 * Headless calendar-grid composable — reuses the shared `buildMonthGrid` /
 * `navigateFocus` from `@doranjs/wc`, so there's no per-framework grid logic.
 * Build your own markup around it; the components above are the batteries-included path.
 */
export function useCalendarGrid(initial?: DoranDate): UseCalendarGrid {
  // shallowRef: DoranDate has private fields and must not be Vue-proxied.
  const cursor = shallowRef(initial ?? DoranDate.now());
  const grid = computed(() =>
    buildMonthGrid(cursor.value.year, cursor.value.month, { today: DoranDate.now() }),
  );
  return {
    cursor,
    grid,
    next: () => {
      cursor.value = cursor.value.add(1, 'month');
    },
    prev: () => {
      cursor.value = cursor.value.add(-1, 'month');
    },
    move: (nav: GridNav) => {
      cursor.value = navigateFocus(cursor.value, nav);
    },
  };
}
