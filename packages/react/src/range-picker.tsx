'use client';

import { type DoranDate, getDefaultLocale, type Locale } from '@doranjs/core';
import { Button, ChevronLeftIcon, ChevronRightIcon, cn } from '@doranjs/ui';
import { useState } from 'react';
import {
  CalendarHeader,
  MonthYearPanel,
  type CalendarArrows,
  type CalendarPanel,
  type HeaderMode,
} from './calendar-header';
import { buildMonthGrid } from './grid';
import { useCalendar, type YearMonth } from './hooks';
import { useDateRange, type DateRange, type UseDateRangeOptions } from './hooks';
import { DoranMonthView } from './month-view';
import { defaultRangePresets, type RangePreset } from './presets';

export interface DoranRangePickerProps extends UseDateRangeOptions {
  locale?: Locale;
  headerMode?: HeaderMode;
  /** Marks holiday days (dot + holiday color). */
  isHoliday?: (day: DoranDate) => boolean;
  /** Weekday indices treated as weekend (0 = Saturday). Defaults to `[6]` (Friday). */
  weekends?: number[];
  arrows?: CalendarArrows;
  yearSpan?: number;
  /**
   * Quick-pick presets shown beside the calendar. `true` uses
   * {@link defaultRangePresets}; pass an array to customize, or omit for none.
   */
  presets?: boolean | RangePreset[];
  /** How many month grids to show side by side. Defaults to `1`. */
  numberOfMonths?: number;
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
  locale = getDefaultLocale(),
  headerMode = 'dropdown',
  isHoliday,
  weekends,
  arrows,
  yearSpan = 60,
  presets,
  numberOfMonths = 1,
  className,
  ...rangeOptions
}: DoranRangePickerProps) {
  const range = useDateRange(rangeOptions);
  const calendar = useCalendar({ timeZone: rangeOptions.timeZone });
  const [panel, setPanel] = useState<CalendarPanel>('days');

  const months = Math.max(1, numberOfMonths);
  const multi = months > 1;
  const summary = formatSummary(range.range, locale);

  const presetList =
    presets === true ? defaultRangePresets() : Array.isArray(presets) ? presets : [];

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
      {...(isHoliday ? { isHoliday } : {})}
      {...(weekends ? { weekends } : {})}
    />
  );

  const calendarBody = multi ? (
    <>
      <div className="doran-calendar__header">
        <button
          type="button"
          className="doran-calendar__nav"
          aria-label="ماه قبل"
          onClick={calendar.goToPrevMonth}
        >
          {arrows?.prev ?? <ChevronRightIcon />}
        </button>
        <div className="doran-calendar__heading" aria-live="polite">
          {monthLabel(calendar.year, calendar.month, locale)}
          {months > 1 &&
            ` – ${monthLabel(...monthTuple(addMonths({ year: calendar.year, month: calendar.month }, months - 1)), locale)}`}
        </div>
        <button
          type="button"
          className="doran-calendar__nav"
          aria-label="ماه بعد"
          onClick={calendar.goToNextMonth}
        >
          {arrows?.next ?? <ChevronLeftIcon />}
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

  return (
    <div
      className={cn(
        'doran-calendar',
        'doran-rangepicker',
        multi && 'doran-rangepicker--multi',
        className,
      )}
      dir="rtl"
    >
      <div className="doran-rangepicker__body">
        {presetList.length > 0 && (
          <div className="doran-rangepicker__presets" role="group" aria-label="بازه‌های آماده">
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
        <div className="doran-rangepicker__calendar">{calendarBody}</div>
      </div>

      <div className="doran-calendar__footer doran-rangepicker__footer">
        <span className="doran-rangepicker__summary">{summary}</span>
        <Button variant="outline" onClick={range.reset}>
          پاک کردن
        </Button>
      </div>
    </div>
  );
}

function monthTuple(ym: YearMonth): [number, number] {
  return [ym.year, ym.month];
}

function monthLabel(year: number, month: number, locale: Locale): string {
  return `${locale.months[month - 1]} ${locale.formatNumber(String(year))}`;
}

function formatSummary(range: DateRange, locale: Locale): string {
  const fmt = (d: DateRange['start']) => (d ? d.withLocale(locale).format('YYYY/MM/DD') : '—');
  return `${fmt(range.start)} تا ${fmt(range.end)}`;
}
