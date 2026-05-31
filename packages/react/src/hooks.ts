'use client';

import { DoranDate, type DoranDateOptions } from '@doran/core';
import { useCallback, useMemo, useState } from 'react';
import { buildMonthGrid, type CalendarDay, type MonthGrid } from './grid';

/** A `{ year, month }` pair identifying a displayed month. */
export interface YearMonth {
  year: number;
  month: number;
}

export interface UseCalendarOptions extends DoranDateOptions {
  /** Controlled selected value. */
  value?: DoranDate | null;
  /** Initial selected value (uncontrolled). */
  defaultValue?: DoranDate | null;
  /** Called when the user selects a day. */
  onChange?: (date: DoranDate) => void;
  /** Initially displayed month (defaults to the selected value's month, else today). */
  defaultMonth?: YearMonth;
  /** Reference "today". */
  today?: DoranDate;
  /** Earliest selectable day (inclusive). */
  min?: DoranDate;
  /** Latest selectable day (inclusive). */
  max?: DoranDate;
  /** Render a stable 6-week grid. */
  fixedWeeks?: 5 | 6;
}

export interface UseCalendarReturn {
  year: number;
  month: number;
  grid: MonthGrid;
  selected: DoranDate | null;
  today: DoranDate;
  goToNextMonth: () => void;
  goToPrevMonth: () => void;
  goToNextYear: () => void;
  goToPrevYear: () => void;
  goToToday: () => void;
  setMonth: (value: YearMonth) => void;
  select: (day: DoranDate) => void;
  isDisabled: (day: DoranDate) => boolean;
  isSelected: (day: DoranDate) => boolean;
}

function addMonth({ year, month }: YearMonth, delta: number): YearMonth {
  const total = year * 12 + (month - 1) + delta;
  return { year: Math.floor(total / 12), month: (((total % 12) + 12) % 12) + 1 };
}

/**
 * Headless calendar state: which month is shown, the current selection, navigation,
 * and day-level disabled/selected predicates. Drives every Doran calendar component,
 * and can drive your own custom UI.
 */
export function useCalendar(options: UseCalendarOptions = {}): UseCalendarReturn {
  const {
    value,
    defaultValue,
    onChange,
    defaultMonth,
    min,
    max,
    fixedWeeks,
    today,
    ...dateOptions
  } = options;

  const resolvedToday = useMemo(
    () => (today ?? DoranDate.now(dateOptions)).startOf('day'),
    [today, dateOptions.timeZone],
  );

  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState<DoranDate | null>(defaultValue ?? null);
  const selected = isControlled ? (value ?? null) : internalValue;

  const initialMonth: YearMonth =
    defaultMonth ??
    (selected
      ? { year: selected.year, month: selected.month }
      : { year: resolvedToday.year, month: resolvedToday.month });
  const [view, setView] = useState<YearMonth>(initialMonth);

  const grid = useMemo(
    () =>
      buildMonthGrid(view.year, view.month, {
        ...dateOptions,
        today: resolvedToday,
        ...(fixedWeeks ? { fixedWeeks } : {}),
      }),
    [view.year, view.month, dateOptions.timeZone, resolvedToday, fixedWeeks],
  );

  const isDisabled = useCallback(
    (day: DoranDate) => {
      if (min && day.isBefore(min.startOf('day'))) return true;
      if (max && day.isAfter(max.endOf('day'))) return true;
      return false;
    },
    [min, max],
  );

  const isSelected = useCallback(
    (day: DoranDate) => (selected ? day.isSame(selected, 'day') : false),
    [selected],
  );

  const select = useCallback(
    (day: DoranDate) => {
      if (isDisabled(day)) return;
      if (!isControlled) setInternalValue(day);
      setView({ year: day.year, month: day.month });
      onChange?.(day);
    },
    [isControlled, isDisabled, onChange],
  );

  return {
    year: view.year,
    month: view.month,
    grid,
    selected,
    today: resolvedToday,
    goToNextMonth: () => setView((v) => addMonth(v, 1)),
    goToPrevMonth: () => setView((v) => addMonth(v, -1)),
    goToNextYear: () => setView((v) => addMonth(v, 12)),
    goToPrevYear: () => setView((v) => addMonth(v, -12)),
    goToToday: () => setView({ year: resolvedToday.year, month: resolvedToday.month }),
    setMonth: setView,
    select,
    isDisabled,
    isSelected,
  };
}

/** An ordered date range. */
export interface DateRange {
  start: DoranDate | null;
  end: DoranDate | null;
}

export interface UseDateRangeOptions extends DoranDateOptions {
  defaultValue?: DateRange;
  value?: DateRange;
  onChange?: (range: DateRange) => void;
}

export interface UseDateRangeReturn {
  range: DateRange;
  /** Feed the next clicked day; the hook manages the start/end handshake. */
  selectDay: (day: DoranDate) => void;
  reset: () => void;
  isInRange: (day: DoranDate) => boolean;
  isStart: (day: DoranDate) => boolean;
  isEnd: (day: DoranDate) => boolean;
}

/** Headless date-range selection with the usual two-click start/end behaviour. */
export function useDateRange(options: UseDateRangeOptions = {}): UseDateRangeReturn {
  const { value, defaultValue, onChange } = options;
  const isControlled = value !== undefined;
  const [internal, setInternal] = useState<DateRange>(defaultValue ?? { start: null, end: null });
  const range = isControlled ? value! : internal;

  const update = useCallback(
    (next: DateRange) => {
      if (!isControlled) setInternal(next);
      onChange?.(next);
    },
    [isControlled, onChange],
  );

  const selectDay = useCallback(
    (day: DoranDate) => {
      const d = day.startOf('day');
      if (!range.start || range.end) {
        update({ start: d, end: null });
      } else if (d.isBefore(range.start)) {
        update({ start: d, end: range.start });
      } else {
        update({ start: range.start, end: d });
      }
    },
    [range, update],
  );

  const isInRange = useCallback(
    (day: DoranDate) =>
      range.start && range.end ? day.isBetween(range.start, range.end.endOf('day')) : false,
    [range],
  );

  return {
    range,
    selectDay,
    reset: () => update({ start: null, end: null }),
    isInRange,
    isStart: (day) => (range.start ? day.isSame(range.start, 'day') : false),
    isEnd: (day) => (range.end ? day.isSame(range.end, 'day') : false),
  };
}

export type { CalendarDay, MonthGrid };
