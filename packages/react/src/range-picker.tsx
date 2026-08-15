'use client';

import {
  resolveCalendarLabels,
  type DayDataMap,
  type DayMeta,
  type DoranDate,
  type Locale,
  type ResolvedCalendarLabels,
} from '@doranjs/core';
import { useDirection, useResolvedLocale } from './provider';
import { Button, ChevronLeftIcon, ChevronRightIcon, cn } from '@doranjs/ui';
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
import { buildMonthGrid } from './grid';
import { useCalendar, type YearMonth } from './hooks';
import { useDateRange, type DateRange, type UseDateRangeOptions } from './hooks';
import { DoranMonthView, type DayPropsResult } from './month-view';
import { defaultRangePresets, type RangePreset } from './presets';

const DEFAULT_FOOTER_ACTIONS: readonly 'clear'[] = ['clear'];

export interface DoranRangePickerProps extends UseDateRangeOptions {
  locale?: Locale;
  headerMode?: HeaderMode;
  /** Marks holiday days (dot + holiday color). */
  isHoliday?: (day: DoranDate) => boolean;
  /**
   * Renders extra content beneath each day number — a nightly rate, a count, a dot.
   * Must be non-interactive: the day cell is itself a `<button>`.
   */
  dayContent?: (day: DoranDate, meta: DayMeta) => ReactNode;
  /** Merges attributes onto a day button — styling hooks, tooltips, disabled state. */
  dayProps?: (day: DoranDate, meta: DayMeta) => DayPropsResult | undefined;
  /** Serializable per-day annotations, keyed by Jalali `YYYY-M-D`. */
  dayData?: DayDataMap;
  /**
   * Your own content in the picker's `legend`, `aside`, and `footer` regions.
   * `aside` shares the sidebar with `presets`, rendering above them.
   */
  slots?: CalendarSlots;
  /** Blocks individual days — dates already booked, a sold-out departure. */
  disabledDates?: (day: DoranDate) => boolean;
  /** Earliest selectable day (inclusive). */
  min?: DoranDate;
  /** Latest selectable day (inclusive). */
  max?: DoranDate;
  /** Weekday indices treated as weekend (0 = Saturday). Defaults to `[6]` (Friday). */
  weekends?: number[];
  arrows?: CalendarArrows;
  /** Writing direction. Defaults to the locale's. */
  dir?: 'rtl' | 'ltr';
  yearSpan?: number;
  /**
   * Quick-pick presets shown beside the calendar. `true` uses
   * {@link defaultRangePresets}; pass an array to customize, or omit for none.
   */
  presets?: boolean | RangePreset[];
  /** How many month grids to show side by side. Defaults to `1`. */
  numberOfMonths?: number;
  /** Ordered footer actions. Defaults to `['clear']`; pass `[]` to hide the footer. */
  footerActions?: readonly 'clear'[];
  className?: string;
}

function addMonths({ year, month }: YearMonth, delta: number): YearMonth {
  const total = year * 12 + (month - 1) + delta;
  return { year: Math.floor(total / 12), month: (((total % 12) + 12) % 12) + 1 };
}

/**
 * A two-click date-range picker built on {@link useDateRange} and
 * {@link DoranMonthView}, with start/end and in-range highlighting plus the same
 * navigation chrome as {@link DoranCalendar}. Supports quick-pick `presets` and a
 * side-by-side multi-month view via `numberOfMonths`.
 */
export function DoranRangePicker({
  locale: localeProp,
  headerMode = 'dropdown',
  isHoliday,
  dayContent,
  dayProps,
  dayData,
  slots,
  disabledDates,
  min,
  max,
  weekends,
  arrows,
  dir,
  yearSpan = 60,
  presets,
  numberOfMonths = 1,
  footerActions = DEFAULT_FOOTER_ACTIONS,
  className,
  ...rangeOptions
}: DoranRangePickerProps) {
  const locale = useResolvedLocale(localeProp);
  const direction = useDirection(locale, dir);
  const labels = resolveCalendarLabels(locale);
  const range = useDateRange(rangeOptions);
  const calendar = useCalendar({
    ...(rangeOptions.timeZone ? { timeZone: rangeOptions.timeZone } : {}),
    ...(disabledDates ? { disabledDates } : {}),
    ...(min ? { min } : {}),
    ...(max ? { max } : {}),
  });
  const [panel, setPanel] = useState<CalendarPanel>('days');

  const months = Math.max(1, numberOfMonths);
  const multi = months > 1;
  const summary = formatSummary(range.range, locale, labels);

  const presetList =
    presets === true ? defaultRangePresets(locale) : Array.isArray(presets) ? presets : [];

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

  function applyPreset(preset: RangePreset) {
    const next = preset.range(calendar.today);
    range.setRange(next);
    if (next.start) calendar.setMonth({ year: next.start.year, month: next.start.month });
  }

  // The month grids to render (the first comes straight from the hook).
  const grids = Array.from({ length: months }, (_, i) => {
    if (i === 0) return calendar.grid;
    const ym = addMonths({ year: calendar.year, month: calendar.month }, i);
    return buildMonthGrid(ym.year, ym.month, {
      today: calendar.today,
      ...(rangeOptions.timeZone ? { timeZone: rangeOptions.timeZone } : {}),
    });
  });

  const monthView = (grid: (typeof grids)[number], key: number) => (
    <DoranMonthView
      key={key}
      grid={grid}
      locale={locale}
      onSelect={range.selectDay}
      onMonthChange={calendar.setMonth}
      multiselectable
      isInRange={range.isInRange}
      isRangeStart={range.isStart}
      isRangeEnd={range.isEnd}
      isSelected={(d) => range.isStart(d) || range.isEnd(d)}
      isDisabled={calendar.isDisabled}
      isOutOfBounds={calendar.isOutOfBounds}
      dir={direction}
      {...(isHoliday ? { isHoliday } : {})}
      {...(dayContent ? { dayContent } : {})}
      {...(dayProps ? { dayProps } : {})}
      {...(dayData ? { dayData } : {})}
      {...(weekends ? { weekends } : {})}
    />
  );

  const calendarBody = multi ? (
    <>
      <div className="doran-calendar__header">
        <button
          type="button"
          className="doran-calendar__nav"
          aria-label={labels.previousMonth}
          onClick={calendar.goToPrevMonth}
        >
          {arrows?.prev ?? (direction === 'rtl' ? <ChevronRightIcon /> : <ChevronLeftIcon />)}
        </button>
        <div className="doran-calendar__heading" aria-live="polite">
          {monthLabel(calendar.year, calendar.month, locale)}
          {months > 1 &&
            ` – ${monthLabel(...monthTuple(addMonths({ year: calendar.year, month: calendar.month }, months - 1)), locale)}`}
        </div>
        <button
          type="button"
          className="doran-calendar__nav"
          aria-label={labels.nextMonth}
          onClick={calendar.goToNextMonth}
        >
          {arrows?.next ?? (direction === 'rtl' ? <ChevronLeftIcon /> : <ChevronRightIcon />)}
        </button>
      </div>
      <div className="doran-rangepicker__months">
        {grids.map((grid, i) => (
          <div className="doran-rangepicker__month" key={i}>
            <div className="doran-rangepicker__month-caption">
              {monthLabel(
                ...monthTuple(addMonths({ year: calendar.year, month: calendar.month }, i)),
                locale,
              )}
            </div>
            {monthView(grid, i)}
          </div>
        ))}
      </div>
    </>
  ) : (
    <>
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
        direction={direction}
        {...(arrows ? { arrows } : {})}
      />
      {panel === 'days' ? (
        monthView(grids[0]!, 0)
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
    </>
  );

  const context: DoranCalendarContextValue = {
    year: calendar.year,
    month: calendar.month,
    today: calendar.today,
    locale,
    // A range picker has no single selection; `range` carries the real state.
    selected: null,
    range: range.range,
    isSelected: (d) => range.isStart(d) || range.isEnd(d),
    isDisabled: calendar.isDisabled,
    goToPrevMonth: calendar.goToPrevMonth,
    goToNextMonth: calendar.goToNextMonth,
    goToPrevYear: calendar.goToPrevYear,
    goToNextYear: calendar.goToNextYear,
    goToToday: calendar.goToToday,
    setMonth: calendar.setMonth,
    select: range.selectDay,
    selectRange: range.setRange,
    clear: range.reset,
  };

  const hasSidebar = presetList.length > 0 || Boolean(slots?.aside);
  const showFooter = footerActions.length > 0 || Boolean(slots?.footer);

  return (
    <DoranCalendarProvider value={context}>
      <div
        className={cn(
          'doran-calendar',
          'doran-rangepicker',
          multi && 'doran-rangepicker--multi',
          className,
        )}
        dir={direction}
      >
        {slots?.legend && <div className="doran-calendar__legend">{slots.legend}</div>}

        <div className="doran-rangepicker__body">
          {hasSidebar && (
            <div className="doran-rangepicker__presets doran-calendar__aside">
              {slots?.aside}
              {presetList.length > 0 && (
                <div
                  className="doran-rangepicker__preset-group"
                  role="group"
                  aria-label={labels.presets}
                >
                  {presetList.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      className="doran-rangepicker__preset"
                      onClick={() => applyPreset(preset)}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
          <div className="doran-rangepicker__calendar">{calendarBody}</div>
        </div>

        {showFooter && (
          <div className="doran-calendar__footer doran-rangepicker__footer">
            <span className="doran-rangepicker__summary">{summary}</span>
            {slots?.footer && <div className="doran-calendar__footer-slot">{slots.footer}</div>}
            {footerActions.map((action, index) => (
              <Button
                key={`${action}-${index}`}
                variant="outline"
                className="doran-calendar__footer-action doran-calendar__footer-action--clear"
                data-footer-action={action}
                onClick={range.reset}
              >
                {labels.clear}
              </Button>
            ))}
          </div>
        )}
      </div>
    </DoranCalendarProvider>
  );
}

function monthTuple(ym: YearMonth): [number, number] {
  return [ym.year, ym.month];
}

function monthLabel(year: number, month: number, locale: Locale): string {
  return `${locale.months[month - 1]} ${locale.formatNumber(String(year))}`;
}

function formatSummary(range: DateRange, locale: Locale, labels: ResolvedCalendarLabels): string {
  const fmt = (d: DateRange['start']) =>
    d ? d.withLocale(locale).format('YYYY/MM/DD') : labels.rangeEmpty;
  return `${fmt(range.start)}${labels.rangeSeparator}${fmt(range.end)}`;
}
