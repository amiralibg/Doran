'use client';

import { faIR, type Locale } from '@doranjs/core';
import { Button, cn } from '@doranjs/ui';
import { useCalendar } from './hooks';
import { useDateRange, type DateRange, type UseDateRangeOptions } from './hooks';
import { DoranMonthView } from './month-view';

export interface DoranRangePickerProps extends UseDateRangeOptions {
  locale?: Locale;
  className?: string;
}

/**
 * A two-click date-range picker built on {@link useDateRange} and
 * {@link DoranMonthView}, with start/end and in-range highlighting.
 */
export function DoranRangePicker({
  locale = faIR,
  className,
  ...rangeOptions
}: DoranRangePickerProps) {
  const range = useDateRange(rangeOptions);
  const calendar = useCalendar({ timeZone: rangeOptions.timeZone });
  const heading = `${locale.months[calendar.month - 1]} ${locale.formatNumber(String(calendar.year))}`;

  const summary = formatSummary(range.range, locale);

  return (
    <div className={cn('doran-calendar', 'doran-rangepicker', className)} dir="rtl">
      <div className="doran-calendar__header">
        <Button variant="ghost" icon aria-label="ماه قبل" onClick={calendar.goToPrevMonth}>
          ›
        </Button>
        <div className="doran-calendar__heading" aria-live="polite">
          {heading}
        </div>
        <Button variant="ghost" icon aria-label="ماه بعد" onClick={calendar.goToNextMonth}>
          ‹
        </Button>
      </div>

      <DoranMonthView
        grid={calendar.grid}
        locale={locale}
        onSelect={range.selectDay}
        isInRange={range.isInRange}
        isRangeStart={range.isStart}
        isRangeEnd={range.isEnd}
        isSelected={(d) => range.isStart(d) || range.isEnd(d)}
      />

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
