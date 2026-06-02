import { DoranDate, type DoranDateOptions } from '@doranjs/core';

/** A single day cell of a month grid. */
export interface GridDay {
  date: DoranDate;
  day: number;
  weekday: number;
  inCurrentMonth: boolean;
  isToday: boolean;
}

/** A laid-out month: rows of 7 days, Saturday-first (RTL). */
export interface MonthGrid {
  year: number;
  month: number;
  weeks: GridDay[][];
}

/** Builds the Saturday-first month grid for a Jalali year/month. Pure. */
export function buildMonthGrid(
  year: number,
  month: number,
  options: DoranDateOptions & { today?: DoranDate } = {},
): MonthGrid {
  const { today, ...dateOptions } = options;
  const reference = (today ?? DoranDate.now(dateOptions)).startOf('day');

  const firstOfMonth = DoranDate.fromJalali({ year, month, day: 1 }, dateOptions);
  const leading = firstOfMonth.dayOfWeek;
  const daysInMonth = firstOfMonth.daysInMonth;
  const gridStart = firstOfMonth.subtract(leading, 'day');
  const totalCells = Math.ceil((leading + daysInMonth) / 7) * 7;

  const weeks: GridDay[][] = [];
  let week: GridDay[] = [];
  for (let i = 0; i < totalCells; i += 1) {
    const date = gridStart.addDays(i);
    week.push({
      date,
      day: date.day,
      weekday: date.dayOfWeek,
      inCurrentMonth: date.year === year && date.month === month,
      isToday: date.isSame(reference, 'day'),
    });
    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
  }
  return { year, month, weeks };
}
