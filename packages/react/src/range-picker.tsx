'use client';

import { type DoranDate, faIR, type Locale } from '@doranjs/core';
import { Button, cn } from '@doranjs/ui';
import { useState } from 'react';
import {
  CalendarHeader,
  MonthYearPanel,
  type CalendarArrows,
  type CalendarPanel,
  type HeaderMode,
} from './calendar-header';
import { useCalendar } from './hooks';
import { useDateRange, type DateRange, type UseDateRangeOptions } from './hooks';
import { DoranMonthView } from './month-view';

export interface DoranRangePickerProps extends UseDateRangeOptions {
  locale?: Locale;
  headerMode?: HeaderMode;
  /** Marks holiday days (dot + holiday color). */
  isHoliday?: (day: DoranDate) => boolean;
  /** Weekday indices treated as weekend (0 = Saturday). Defaults to `[6]` (Friday). */
  weekends?: number[];
  arrows?: CalendarArrows;
  yearSpan?: number;
  className?: string;
}

/**
 * A two-click date-range picker built on {@link useDateRange} and
 * {@link DoranMonthView}, with start/end and in-range highlighting plus the same
 * navigation chrome as {@link DoranCalendar}.
 */
export function DoranRangePicker({
  locale = faIR,
  headerMode = 'dropdown',
  isHoliday,
  weekends,
  arrows,
  yearSpan = 60,
  className,
  ...rangeOptions
}: DoranRangePickerProps) {
  const range = useDateRange(rangeOptions);
  const calendar = useCalendar({ timeZone: rangeOptions.timeZone });
  const [panel, setPanel] = useState<CalendarPanel>('days');

  const summary = formatSummary(range.range, locale);

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
    <div className={cn('doran-calendar', 'doran-rangepicker', className)} dir="rtl">
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
          onSelect={range.selectDay}
          isInRange={range.isInRange}
          isRangeStart={range.isStart}
          isRangeEnd={range.isEnd}
          isSelected={(d) => range.isStart(d) || range.isEnd(d)}
          {...(isHoliday ? { isHoliday } : {})}
          {...(weekends ? { weekends } : {})}
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

      <div className="doran-calendar__footer doran-rangepicker__footer">
        <span className="doran-rangepicker__summary">{summary}</span>
        <Button variant="outline" onClick={range.reset}>
          پاک کردن
        </Button>
      </div>
    </div>
  );
}

function formatSummary(range: DateRange, locale: Locale): string {
  const fmt = (d: DateRange['start']) => (d ? d.withLocale(locale).format('YYYY/MM/DD') : '—');
  return `${fmt(range.start)} تا ${fmt(range.end)}`;
}
