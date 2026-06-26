'use client';

import { type DoranDate, getDefaultLocale, type Locale } from '@doranjs/core';
import { Button, cn } from '@doranjs/ui';
import { useState } from 'react';
import {
  CalendarHeader,
  MonthYearPanel,
  type CalendarArrows,
  type CalendarPanel,
  type HeaderMode,
} from './calendar-header';
import { useCalendar, type UseCalendarOptions } from './hooks';
import { DoranMonthView } from './month-view';
import { DoranTimePicker, type TimeValue } from './time-picker';

export interface DoranCalendarProps extends UseCalendarOptions {
  /** Locale for labels and digits. Defaults to Persian. */
  locale?: Locale;
  /** Render days outside the current month. */
  showOutsideDays?: boolean;
  /**
   * How the month/year selectors are shown: `dropdown` (default) opens in-place
   * panels; `separate` renders native month and year `<select>`s.
   */
  headerMode?: HeaderMode;
  /** Show a time picker and carry the time-of-day on the selected value. */
  withTime?: boolean;
  /** Minute increment for the time picker. Defaults to `1`. */
  minuteStep?: number;
  /** Default time-of-day used when `withTime` and no value is selected yet. */
  defaultTime?: TimeValue;
  /** Marks holiday days (dot + holiday color). */
  isHoliday?: (day: DoranDate) => boolean;
  /** Weekday indices treated as weekend (0 = Saturday). Defaults to `[6]` (Friday). */
  weekends?: number[];
  /** How many years to offer around the current view in the year picker. */
  yearSpan?: number;
  /** Custom navigation arrows. */
  arrows?: CalendarArrows;
  /** Hide the "today" footer button. */
  hideFooter?: boolean;
  className?: string;
}

function combineDayAndTime(day: DoranDate, time: TimeValue): DoranDate {
  return day.startOf('day').addHours(time.hour).addMinutes(time.minute);
}

/**
 * A complete, RTL-first month calendar: a header with month/year navigation and
 * (optionally) month/year/time pickers, plus a {@link DoranMonthView}. For full
 * control over state, compose {@link useCalendar} and {@link DoranMonthView} yourself.
 */
export function DoranCalendar({
  locale = getDefaultLocale(),
  showOutsideDays,
  headerMode = 'dropdown',
  withTime = false,
  minuteStep = 1,
  defaultTime = { hour: 0, minute: 0 },
  isHoliday,
  weekends,
  yearSpan = 60,
  arrows,
  hideFooter,
  className,
  value,
  defaultValue,
  onChange,
  ...options
}: DoranCalendarProps) {
  const isControlled = value !== undefined;
  const [internal, setInternal] = useState<DoranDate | null>(defaultValue ?? null);
  const selected = isControlled ? (value ?? null) : internal;

  const [panel, setPanel] = useState<CalendarPanel>('days');

  const time: TimeValue = selected ? { hour: selected.hour, minute: selected.minute } : defaultTime;

  function emit(next: DoranDate) {
    if (!isControlled) setInternal(next);
    onChange?.(next);
  }

  function handleDaySelect(day: DoranDate) {
    emit(withTime ? combineDayAndTime(day, time) : day);
  }

  const calendar = useCalendar({ ...options, value: selected, onChange: handleDaySelect });

  function handleTimeChange(next: TimeValue) {
    const base = selected ?? calendar.today;
    emit(combineDayAndTime(base, next));
  }

  const yearRange: [number, number] = [
    calendar.year - Math.floor(yearSpan / 2),
    calendar.year + Math.ceil(yearSpan / 2),
  ];

  function togglePanel(next: Exclude<CalendarPanel, 'days'>) {
    setPanel((current) => (current === next ? 'days' : next));
  }

  function selectMonth(month: number) {
    calendar.setMonth({ year: calendar.year, month });
    setPanel('days');
  }

  function selectYear(year: number) {
    calendar.setMonth({ year, month: calendar.month });
    setPanel('days');
  }

  return (
    <div className={cn('doran-calendar', className)} dir="rtl">
      <CalendarHeader
        year={calendar.year}
        month={calendar.month}
        locale={locale}
        mode={headerMode}
        panel={panel}
        onPrevMonth={calendar.goToPrevMonth}
        onNextMonth={calendar.goToNextMonth}
        onTogglePanel={togglePanel}
        onSelectMonth={selectMonth}
        onSelectYear={selectYear}
        yearRange={yearRange}
        {...(arrows ? { arrows } : {})}
      />

      {panel === 'days' ? (
        <DoranMonthView
          grid={calendar.grid}
          locale={locale}
          onSelect={calendar.select}
          onMonthChange={calendar.setMonth}
          isSelected={calendar.isSelected}
          isDisabled={calendar.isDisabled}
          {...(isHoliday ? { isHoliday } : {})}
          {...(weekends ? { weekends } : {})}
          {...(showOutsideDays !== undefined ? { showOutsideDays } : {})}
        />
      ) : (
        <MonthYearPanel
          panel={panel}
          year={calendar.year}
          month={calendar.month}
          locale={locale}
          yearRange={yearRange}
          onSelectMonth={selectMonth}
          onSelectYear={selectYear}
        />
      )}

      {withTime && panel === 'days' && (
        <DoranTimePicker
          value={time}
          onChange={handleTimeChange}
          minuteStep={minuteStep}
          locale={locale}
        />
      )}

      {!hideFooter && (
        <div className="doran-calendar__footer">
          <Button variant="outline" onClick={calendar.goToToday}>
            امروز
          </Button>
        </div>
      )}
    </div>
  );
}

export type { DoranDate };
