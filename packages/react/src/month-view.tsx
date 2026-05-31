'use client';

import { type DoranDate, faIR, type Locale } from '@doran/core';
import { cn } from '@doran/ui';
import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import type { MonthGrid } from './grid';

export interface DoranMonthViewProps {
  /** The month grid to render (from `buildMonthGrid` or `useCalendar`). */
  grid: MonthGrid;
  /** Locale for weekday headers and digits. Defaults to Persian. */
  locale?: Locale;
  /** Called when a day is activated. */
  onSelect?: (day: DoranDate) => void;
  isSelected?: (day: DoranDate) => boolean;
  isDisabled?: (day: DoranDate) => boolean;
  isInRange?: (day: DoranDate) => boolean;
  isRangeStart?: (day: DoranDate) => boolean;
  isRangeEnd?: (day: DoranDate) => boolean;
  /** Render days that fall outside the current month (default `true`). */
  showOutsideDays?: boolean;
  className?: string;
}

/**
 * A single month grid: an accessible `role="grid"` of day buttons, ordered
 * Saturday-first for RTL. Supports full keyboard navigation (arrow keys, Home/End,
 * Enter/Space). Pair it with `useCalendar` for navigation, or use it standalone.
 */
export function DoranMonthView({
  grid,
  locale = faIR,
  onSelect,
  isSelected,
  isDisabled,
  isInRange,
  isRangeStart,
  isRangeEnd,
  showOutsideDays = true,
  className,
}: DoranMonthViewProps) {
  const days = grid.days;
  const gridRef = useRef<HTMLDivElement>(null);

  const initialFocus = Math.max(
    0,
    days.findIndex((d) => d.inCurrentMonth && (isSelected?.(d.date) || d.isToday)),
  );
  const [focusIndex, setFocusIndex] = useState(
    initialFocus >= 0 ? initialFocus : days.findIndex((d) => d.inCurrentMonth),
  );
  const [isFocusWithin, setIsFocusWithin] = useState(false);

  useEffect(() => {
    if (!isFocusWithin) return;
    const node = gridRef.current?.querySelector<HTMLButtonElement>(
      `[data-cell-index="${focusIndex}"]`,
    );
    node?.focus();
  }, [focusIndex, isFocusWithin]);

  function move(delta: number) {
    setFocusIndex((current) => {
      let next = current + delta;
      while (next >= 0 && next < days.length && isDisabled?.(days[next]!.date)) {
        next += delta > 0 ? 1 : -1;
      }
      if (next < 0 || next >= days.length) return current;
      return next;
    });
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    switch (event.key) {
      // RTL: ArrowLeft advances, ArrowRight goes back.
      case 'ArrowLeft':
        move(1);
        break;
      case 'ArrowRight':
        move(-1);
        break;
      case 'ArrowDown':
        move(7);
        break;
      case 'ArrowUp':
        move(-7);
        break;
      case 'Home':
        move(-(focusIndex % 7));
        break;
      case 'End':
        move(6 - (focusIndex % 7));
        break;
      case 'Enter':
      case ' ': {
        const day = days[focusIndex];
        if (day && !isDisabled?.(day.date)) onSelect?.(day.date);
        break;
      }
      default:
        return;
    }
    event.preventDefault();
  }

  return (
    <div
      ref={gridRef}
      className={cn('doran-month', className)}
      role="grid"
      dir="rtl"
      onKeyDown={onKeyDown}
      onFocus={() => setIsFocusWithin(true)}
      onBlur={() => setIsFocusWithin(false)}
    >
      <div className="doran-month__weekdays" role="row">
        {locale.weekdaysMin.map((name, i) => (
          <div
            key={i}
            className="doran-month__weekday"
            role="columnheader"
            aria-label={locale.weekdays[i]}
          >
            {name}
          </div>
        ))}
      </div>

      {grid.weeks.map((week, wi) => (
        <div key={wi} className="doran-month__week" role="row">
          {week.map((cell) => {
            const flatIndex = wi * 7 + week.indexOf(cell);
            const disabled = isDisabled?.(cell.date) ?? false;
            const selected = isSelected?.(cell.date) ?? false;
            const inRange = isInRange?.(cell.date) ?? false;
            const rangeStart = isRangeStart?.(cell.date) ?? false;
            const rangeEnd = isRangeEnd?.(cell.date) ?? false;
            const hidden = !cell.inCurrentMonth && !showOutsideDays;

            return (
              <div
                key={flatIndex}
                className="doran-month__cell"
                role="gridcell"
                aria-selected={selected}
              >
                {hidden ? (
                  <span aria-hidden className="doran-month__spacer" />
                ) : (
                  <button
                    type="button"
                    data-cell-index={flatIndex}
                    className={cn(
                      'doran-day',
                      !cell.inCurrentMonth && 'doran-day--outside',
                      cell.isToday && 'doran-day--today',
                      selected && 'doran-day--selected',
                      inRange && 'doran-day--in-range',
                      rangeStart && 'doran-day--range-start',
                      rangeEnd && 'doran-day--range-end',
                    )}
                    tabIndex={flatIndex === focusIndex ? 0 : -1}
                    disabled={disabled}
                    aria-current={cell.isToday ? 'date' : undefined}
                    aria-label={cell.date.withLocale(locale).format('dddd D MMMM YYYY')}
                    onClick={() => onSelect?.(cell.date)}
                  >
                    {cell.date.withLocale(locale).format('D')}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
