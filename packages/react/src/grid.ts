import { DoranDate, type DoranDateOptions } from '@doran/core';

/** A single cell in a calendar month grid. */
export interface CalendarDay {
  /** The day, at the start of that day in the configured time zone. */
  date: DoranDate;
  year: number;
  month: number;
  day: number;
  /** Persian weekday index, 0 = Saturday … 6 = Friday. */
  weekday: number;
  /** Whether this day belongs to the month being displayed. */
  inCurrentMonth: boolean;
  /** Whether this day is "today" relative to the provided reference. */
  isToday: boolean;
}

/** A fully laid-out month, with weeks ordered Saturday-first (RTL convention). */
export interface MonthGrid {
  year: number;
  month: number;
  /** Rows of 7 days each, Saturday-first. */
  weeks: CalendarDay[][];
  /** Flat list of all grid days, in order. */
  days: CalendarDay[];
}

/** Options controlling grid generation. */
export interface BuildMonthGridOptions extends DoranDateOptions {
  /** The reference "today" used for the `isToday` flag. Defaults to the current day. */
  today?: DoranDate;
  /**
   * Force the number of rows. Defaults to the minimum needed (5 or 6). Set to `6` for
   * a stable height across months.
   */
  fixedWeeks?: 5 | 6;
}

/**
 * Builds the month grid for a given Jalali year/month. Pure and UI-agnostic — the
 * headless core that every Doran calendar component is built on.
 *
 * @example
 * ```ts
 * const grid = buildMonthGrid(1405, 3);
 * grid.weeks.forEach((week) => week.forEach((cell) => render(cell)));
 * ```
 */
export function buildMonthGrid(
  year: number,
  month: number,
  options: BuildMonthGridOptions = {},
): MonthGrid {
  const { today, fixedWeeks, ...dateOptions } = options;
  const reference = (today ?? DoranDate.now(dateOptions)).startOf('day');

  const firstOfMonth = DoranDate.fromJalali({ year, month, day: 1 }, dateOptions);
  const leading = firstOfMonth.dayOfWeek; // days of the previous month to show first
  const daysInMonth = firstOfMonth.daysInMonth;
  const gridStart = firstOfMonth.subtract(leading, 'day');

  const totalCells = (fixedWeeks ?? Math.ceil((leading + daysInMonth) / 7)) * 7;

  const days: CalendarDay[] = [];
  for (let i = 0; i < totalCells; i += 1) {
    const date = gridStart.addDays(i);
    days.push({
      date,
      year: date.year,
      month: date.month,
      day: date.day,
      weekday: date.dayOfWeek,
      inCurrentMonth: date.year === year && date.month === month,
      isToday: date.isSame(reference, 'day'),
    });
  }

  const weeks: CalendarDay[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  return { year, month, weeks, days };
}
