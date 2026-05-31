'use client';

import { type DoranDate, faIR, type Locale } from '@doranjs/core';
import { Button, cn } from '@doranjs/ui';
import { useCalendar, type UseCalendarOptions } from './hooks';
import { DoranMonthView } from './month-view';

export interface DoranCalendarProps extends UseCalendarOptions {
  /** Locale for labels and digits. Defaults to Persian. */
  locale?: Locale;
  /** Render days outside the current month. */
  showOutsideDays?: boolean;
  className?: string;
}

/**
 * A complete, RTL-first month calendar: a header with month/year and previous/next
 * navigation, plus a {@link DoranMonthView}. For full control over state, compose
 * {@link useCalendar} and {@link DoranMonthView} yourself.
 */
export function DoranCalendar({
  locale = faIR,
  showOutsideDays,
  className,
  ...options
}: DoranCalendarProps) {
  const calendar = useCalendar(options);
  const heading = `${locale.months[calendar.month - 1]} ${locale.formatNumber(String(calendar.year))}`;

  return (
    <div className={cn('doran-calendar', className)} dir="rtl">
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
        onSelect={calendar.select}
        isSelected={calendar.isSelected}
        isDisabled={calendar.isDisabled}
        showOutsideDays={showOutsideDays}
      />

      <div className="doran-calendar__footer">
        <Button variant="outline" onClick={calendar.goToToday}>
          امروز
        </Button>
      </div>
    </div>
  );
}

export type { DoranDate };
