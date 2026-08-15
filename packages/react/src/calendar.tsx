'use client';

import {
  resolveCalendarLabels,
  type DayDataMap,
  type DayMeta,
  type DoranDate,
  type Locale,
} from '@doranjs/core';
import { useDirection, useResolvedLocale } from './provider';
import { Button, cn } from '@doranjs/ui';
import { useState, type ReactNode } from 'react';
import {
  CalendarHeader,
  MonthYearPanel,
  type CalendarArrows,
  type CalendarPanel,
  type HeaderMode,
} from './calendar-header';
import {
  DoranCalendarProvider,
  type CalendarSlots,
  type DoranCalendarContextValue,
} from './calendar-context';
import { useCalendar, type UseCalendarOptions } from './hooks';
import { DoranMonthView, type DayPropsResult } from './month-view';
import { DoranTimePicker, type TimeValue } from './time-picker';

/** Actions that can be rendered in a calendar footer. */
export type CalendarFooterAction = 'today' | 'clear';

const DEFAULT_FOOTER_ACTIONS: readonly CalendarFooterAction[] = ['today'];

export interface DoranCalendarProps extends Omit<UseCalendarOptions, 'onChange'> {
  /** Called when a date is selected or the selection is cleared. */
  onChange?: (date: DoranDate | null) => void;
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
  /** Show a seconds field on the time picker. */
  withSeconds?: boolean;
  /** Second increment for the time picker. Defaults to `1`. */
  secondStep?: number;
  /** `24` (default) or `12`, which adds a meridiem toggle. */
  hourCycle?: 12 | 24;
  /** Default time-of-day used when `withTime` and no value is selected yet. */
  defaultTime?: TimeValue;
  /** Marks holiday days (dot + holiday color). */
  isHoliday?: (day: DoranDate) => boolean;
  /**
   * Renders extra content beneath each day number — a fare, a count, a dot.
   * Must be non-interactive: the day cell is itself a `<button>`.
   */
  dayContent?: (day: DoranDate, meta: DayMeta) => ReactNode;
  /** Merges attributes onto a day button — styling hooks, tooltips, disabled state. */
  dayProps?: (day: DoranDate, meta: DayMeta) => DayPropsResult | undefined;
  /** Serializable per-day annotations, keyed by Jalali `YYYY-M-D`. */
  dayData?: DayDataMap;
  /** Your own content in the calendar's `legend`, `aside`, and `footer` regions. */
  slots?: CalendarSlots;
  /** Writing direction. Defaults to the locale's. */
  dir?: 'rtl' | 'ltr';
  /** Weekday indices treated as weekend (0 = Saturday). Defaults to `[6]` (Friday). */
  weekends?: number[];
  /** How many years to offer around the current view in the year picker. */
  yearSpan?: number;
  /** Custom navigation arrows. */
  arrows?: CalendarArrows;
  /** Ordered footer actions. Defaults to `['today']`; pass `[]` to hide the footer. */
  footerActions?: readonly CalendarFooterAction[];
  /** @deprecated Use `footerActions={[]}` instead. */
  hideFooter?: boolean;
  className?: string;
}

function combineDayAndTime(day: DoranDate, time: TimeValue): DoranDate {
  return day
    .startOf('day')
    .addHours(time.hour)
    .addMinutes(time.minute)
    .addSeconds(time.second ?? 0);
}

/**
 * A complete, RTL-first month calendar: a header with month/year navigation and
 * (optionally) month/year/time pickers, plus a {@link DoranMonthView}. For full
 * control over state, compose {@link useCalendar} and {@link DoranMonthView} yourself.
 */
export function DoranCalendar({
  locale: localeProp,
  showOutsideDays,
  headerMode = 'dropdown',
  withTime = false,
  minuteStep = 1,
  withSeconds,
  secondStep,
  hourCycle,
  defaultTime = { hour: 0, minute: 0 },
  isHoliday,
  dayContent,
  dayProps,
  dayData,
  slots,
  dir,
  weekends,
  yearSpan = 60,
  arrows,
  footerActions = DEFAULT_FOOTER_ACTIONS,
  hideFooter,
  className,
  value,
  defaultValue,
  onChange,
  ...options
}: DoranCalendarProps) {
  const locale = useResolvedLocale(localeProp);
  const direction = useDirection(locale, dir);
  const labels = resolveCalendarLabels(locale);
  const isControlled = value !== undefined;
  const [internal, setInternal] = useState<DoranDate | null>(defaultValue ?? null);
  const selected = isControlled ? (value ?? null) : internal;

  const [panel, setPanel] = useState<CalendarPanel>('days');
  const resolvedFooterActions = hideFooter ? [] : footerActions;

  const time: TimeValue = selected
    ? { hour: selected.hour, minute: selected.minute, second: selected.second }
    : defaultTime;

  function emit(next: DoranDate | null) {
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

  // Not memoized: `useCalendar` hands back a fresh object every render, so a memo
  // would recompute anyway while making `clear`'s capture of `emit` easy to stale.
  const context: DoranCalendarContextValue = {
    year: calendar.year,
    month: calendar.month,
    today: calendar.today,
    locale,
    selected,
    range: null,
    isSelected: calendar.isSelected,
    isDisabled: calendar.isDisabled,
    goToPrevMonth: calendar.goToPrevMonth,
    goToNextMonth: calendar.goToNextMonth,
    goToPrevYear: calendar.goToPrevYear,
    goToNextYear: calendar.goToNextYear,
    goToToday: calendar.goToToday,
    setMonth: calendar.setMonth,
    select: calendar.select,
    // Ranges belong to DoranRangePicker; a single calendar has nothing to set.
    selectRange: () => {},
    clear: () => emit(null),
  };

  const monthView = (
    <DoranMonthView
      grid={calendar.grid}
      locale={locale}
      onSelect={calendar.select}
      onMonthChange={calendar.setMonth}
      isSelected={calendar.isSelected}
      isDisabled={calendar.isDisabled}
      isOutOfBounds={calendar.isOutOfBounds}
      dir={direction}
      {...(isHoliday ? { isHoliday } : {})}
      {...(dayContent ? { dayContent } : {})}
      {...(dayProps ? { dayProps } : {})}
      {...(dayData ? { dayData } : {})}
      {...(weekends ? { weekends } : {})}
      {...(showOutsideDays !== undefined ? { showOutsideDays } : {})}
    />
  );

  const panelContent =
    panel === 'days' ? (
      monthView
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
    );

  const showFooter = resolvedFooterActions.length > 0 || Boolean(slots?.footer);

  return (
    <DoranCalendarProvider value={context}>
      <div className={cn('doran-calendar', className)} dir={direction}>
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

        {slots?.legend && <div className="doran-calendar__legend">{slots.legend}</div>}

        {/* The row wrapper only appears when there's an aside to place, so the default
          DOM (and anyone's CSS targeting it) is untouched. */}
        {slots?.aside ? (
          <div className="doran-calendar__body">
            <div className="doran-calendar__aside">{slots.aside}</div>
            <div className="doran-calendar__main">{panelContent}</div>
          </div>
        ) : (
          panelContent
        )}

        {withTime && panel === 'days' && (
          <DoranTimePicker
            value={time}
            onChange={handleTimeChange}
            minuteStep={minuteStep}
            locale={locale}
            {...(withSeconds !== undefined ? { withSeconds } : {})}
            {...(secondStep !== undefined ? { secondStep } : {})}
            {...(hourCycle !== undefined ? { hourCycle } : {})}
          />
        )}

        {showFooter && (
          <div className="doran-calendar__footer">
            {slots?.footer && <div className="doran-calendar__footer-slot">{slots.footer}</div>}
            {resolvedFooterActions.map((action, index) =>
              action === 'today' ? (
                <Button
                  key={`${action}-${index}`}
                  variant="outline"
                  className="doran-calendar__footer-action doran-calendar__footer-action--today"
                  data-footer-action={action}
                  disabled={calendar.isDisabled(calendar.today)}
                  onClick={calendar.selectToday}
                >
                  {labels.today}
                </Button>
              ) : (
                <Button
                  key={`${action}-${index}`}
                  variant="outline"
                  className="doran-calendar__footer-action doran-calendar__footer-action--clear"
                  data-footer-action={action}
                  onClick={() => emit(null)}
                >
                  {labels.clear}
                </Button>
              ),
            )}
          </div>
        )}
      </div>
    </DoranCalendarProvider>
  );
}

export type { DoranDate };
