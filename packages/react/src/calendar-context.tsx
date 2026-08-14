'use client';

import { type DoranDate, type Locale } from '@doranjs/core';
import { createContext, useContext, type ReactNode } from 'react';
import type { DateRange, YearMonth } from './hooks';

/**
 * The live calendar state handed to slot content.
 *
 * This is what makes slots more than decoration: a widget dropped into `aside` or
 * `footer` can read the selection and drive navigation, instead of only rendering
 * static markup.
 */
export interface DoranCalendarContextValue {
  /** Jalali year currently displayed. */
  year: number;
  /** Jalali month currently displayed, 1–12. */
  month: number;
  /** The calendar's reference "today". */
  today: DoranDate;
  /** The resolved locale, for formatting your own labels consistently. */
  locale: Locale;
  /** The selected day. Always `null` inside a range picker — read `range` there. */
  selected: DoranDate | null;
  /** The selected range. `null` outside a range picker. */
  range: DateRange | null;
  isSelected: (day: DoranDate) => boolean;
  isDisabled: (day: DoranDate) => boolean;
  goToPrevMonth: () => void;
  goToNextMonth: () => void;
  goToPrevYear: () => void;
  goToNextYear: () => void;
  /** Moves the view to today without changing the selection. */
  goToToday: () => void;
  setMonth: (value: YearMonth) => void;
  /** Selects a day, honouring the calendar's disabled rules. */
  select: (day: DoranDate) => void;
  /** Selects a whole range. No-op outside a range picker. */
  selectRange: (range: DateRange) => void;
  /** Clears the current selection. */
  clear: () => void;
}

const CalendarContext = createContext<DoranCalendarContextValue | null>(null);

/** @internal Wraps a calendar subtree so slot content can reach its state. */
export function DoranCalendarProvider({
  value,
  children,
}: {
  value: DoranCalendarContextValue;
  children: ReactNode;
}): ReactNode {
  return <CalendarContext.Provider value={value}>{children}</CalendarContext.Provider>;
}

/**
 * Reads the surrounding calendar's state and navigation from inside slot content.
 *
 * @example
 * ```tsx
 * function JumpThreeMonths() {
 *   const { month, year, setMonth } = useDoranCalendar();
 *   return <button onClick={() => setMonth({ year, month: month + 3 })}>+۳ ماه</button>;
 * }
 *
 * <DoranCalendar slots={{ footer: <JumpThreeMonths /> }} />
 * ```
 *
 * @throws If called outside a Doran calendar, since that is always a wiring mistake.
 */
export function useDoranCalendar(): DoranCalendarContextValue {
  const value = useContext(CalendarContext);
  if (!value) {
    throw new Error(
      'useDoranCalendar() must be called inside a Doran calendar. Render this component ' +
        'through the `slots` prop of DoranCalendar, DoranDatePicker, or DoranRangePicker.',
    );
  }
  return value;
}

/**
 * Regions of a calendar you can fill with your own content.
 *
 * Slot content sits outside the day grid, so unlike `dayContent` it may be fully
 * interactive — buttons, links, and inputs are all fine here.
 */
export interface CalendarSlots {
  /** Between the month header and the day grid. Good for a key to your day widgets. */
  legend?: ReactNode;
  /** A sidebar beside the day grid. Good for presets, filters, or a summary. */
  aside?: ReactNode;
  /** In the footer, before the built-in Today/Clear actions. */
  footer?: ReactNode;
}
