'use client';

import { type DoranDate, type Locale } from '@doranjs/core';
import { useResolvedLocale } from './provider';
import { cn } from '@doranjs/ui';
import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { navigateFocus, type GridNav, type MonthGrid } from './grid';

export interface DoranMonthViewProps {
  /** The month grid to render (from `buildMonthGrid` or `useCalendar`). */
  grid: MonthGrid;
  /** Locale for weekday headers and digits. Defaults to Persian. */
  locale?: Locale;
  /** Called when a day is activated. */
  onSelect?: (day: DoranDate) => void;
  /**
   * Called when keyboard navigation moves focus to a day outside the displayed month.
   * Parents should switch the view to `{ year, month }` so the target becomes visible;
   * focus follows automatically.
   */
  onMonthChange?: (target: { year: number; month: number }) => void;
  isSelected?: (day: DoranDate) => boolean;
  isDisabled?: (day: DoranDate) => boolean;
  isInRange?: (day: DoranDate) => boolean;
  isRangeStart?: (day: DoranDate) => boolean;
  isRangeEnd?: (day: DoranDate) => boolean;
  /** Marks a day as a holiday (adds a dot + holiday color). */
  isHoliday?: (day: DoranDate) => boolean;
  /**
   * Persian weekday indices treated as the weekend (0 = Saturday … 6 = Friday).
   * Defaults to `[6]` (Friday), the Iranian weekend.
   */
  weekends?: number[];
  /** Render days that fall outside the current month (default `true`). */
  showOutsideDays?: boolean;
  /** Whether the grid allows selecting multiple days (e.g. a range). */
  multiselectable?: boolean;
  className?: string;
}

/** Stable key identifying a day cell by its Jalali parts. */
function dayKey(year: number, month: number, day: number): string {
  return `${year}-${month}-${day}`;
}

/** The day that should be focusable when the grid is first tabbed into. */
function defaultFocusDate(grid: MonthGrid, isSelected?: (day: DoranDate) => boolean): DoranDate {
  const inMonth = grid.days.filter((d) => d.inCurrentMonth);
  const selected = isSelected && inMonth.find((d) => isSelected(d.date));
  if (selected) return selected.date;
  const today = inMonth.find((d) => d.isToday);
  if (today) return today.date;
  return (inMonth[0] ?? grid.days[0]!).date;
}

/**
 * A single month grid: an accessible `role="grid"` of day buttons, ordered
 * Saturday-first for RTL. Supports full keyboard navigation — arrow keys (with RTL
 * direction), Home/End for the week edges, PageUp/PageDown for months (hold Shift for
 * years), and Enter/Space to select. Arrowing or paging past the month edge calls
 * `onMonthChange` so focus can cross month boundaries seamlessly. Pair it with
 * `useCalendar` for navigation, or use it standalone.
 */
export function DoranMonthView({
  grid,
  locale: localeProp,
  onSelect,
  onMonthChange,
  isSelected,
  isDisabled,
  isInRange,
  isRangeStart,
  isRangeEnd,
  isHoliday,
  weekends = [6],
  showOutsideDays = true,
  multiselectable,
  className,
}: DoranMonthViewProps) {
  const locale = useResolvedLocale(localeProp);
  const gridRef = useRef<HTMLDivElement>(null);
  const [focusDate, setFocusDate] = useState<DoranDate | null>(null);
  const [isFocusWithin, setIsFocusWithin] = useState(false);

  const inGrid = (date: DoranDate) => grid.days.some((d) => d.date.isSame(date, 'day'));

  // The currently focusable day. Falls back to a sensible default whenever the stored
  // focus is absent or no longer on screen (e.g. after the parent changes month).
  const activeDate = useMemo(() => {
    if (focusDate && inGrid(focusDate)) return focusDate;
    return defaultFocusDate(grid, isSelected);
  }, [focusDate, grid, isSelected]);

  const activeKey = dayKey(activeDate.year, activeDate.month, activeDate.day);

  useEffect(() => {
    if (!isFocusWithin) return;
    const node = gridRef.current?.querySelector<HTMLButtonElement>(
      `[data-cell-date="${activeKey}"]`,
    );
    node?.focus();
  }, [activeKey, isFocusWithin]);

  function navigate(move: GridNav, skipDisabled = false) {
    let target = navigateFocus(activeDate, move);
    if (skipDisabled && isDisabled) {
      const dir = move === 'prev-day' || move === 'prev-week' ? -1 : 1;
      let guard = 0;
      while (isDisabled(target) && guard < 366) {
        target = target.addDays(dir);
        guard += 1;
      }
    }
    setFocusDate(target);
    if (!inGrid(target)) onMonthChange?.({ year: target.year, month: target.month });
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    switch (event.key) {
      // RTL: ArrowLeft advances, ArrowRight goes back.
      case 'ArrowLeft':
        navigate('next-day', true);
        break;
      case 'ArrowRight':
        navigate('prev-day', true);
        break;
      case 'ArrowDown':
        navigate('next-week', true);
        break;
      case 'ArrowUp':
        navigate('prev-week', true);
        break;
      case 'Home':
        navigate('week-start');
        break;
      case 'End':
        navigate('week-end');
        break;
      case 'PageUp':
        navigate(event.shiftKey ? 'prev-year' : 'prev-month');
        break;
      case 'PageDown':
        navigate(event.shiftKey ? 'next-year' : 'next-month');
        break;
      case 'Enter':
      case ' ':
        if (!isDisabled?.(activeDate)) onSelect?.(activeDate);
        break;
      default:
        return;
    }
    event.preventDefault();
  }

  const heading = grid.days.find((d) => d.inCurrentMonth)?.date ?? grid.days[0]!.date;
  const gridLabel = heading.withLocale(locale).format('MMMM YYYY');

  return (
    <div
      ref={gridRef}
      className={cn('doran-month', className)}
      role="grid"
      aria-label={gridLabel}
      {...(multiselectable ? { 'aria-multiselectable': true } : {})}
      dir="rtl"
      onKeyDown={onKeyDown}
      onFocus={() => setIsFocusWithin(true)}
      onBlur={() => setIsFocusWithin(false)}
    >
      <div className="doran-month__weekdays" role="row">
        {locale.weekdaysMin.map((name, i) => (
          <div
            key={i}
            className={cn(
              'doran-month__weekday',
              weekends.includes(i) && 'doran-month__weekday--weekend',
            )}
            role="columnheader"
            aria-label={locale.weekdays[i]}
          >
            {name}
          </div>
        ))}
      </div>

      {grid.weeks.map((week, wi) => (
        <div key={wi} className="doran-month__week" role="row">
          {week.map((cell, ci) => {
            const disabled = isDisabled?.(cell.date) ?? false;
            const selected = isSelected?.(cell.date) ?? false;
            const rangeStart = isRangeStart?.(cell.date) ?? false;
            const rangeEnd = isRangeEnd?.(cell.date) ?? false;
            // Endpoints are styled as filled days, not as part of the in-range band.
            const inRange = (isInRange?.(cell.date) ?? false) && !rangeStart && !rangeEnd;
            const holiday = isHoliday?.(cell.date) ?? false;
            const weekend = weekends.includes(cell.weekday);
            const hidden = !cell.inCurrentMonth && !showOutsideDays;
            const isActive = cell.date.isSame(activeDate, 'day');

            return (
              <div
                key={`${wi}-${ci}`}
                className="doran-month__cell"
                role="gridcell"
                aria-selected={selected}
              >
                {hidden ? (
                  <span aria-hidden className="doran-month__spacer" />
                ) : (
                  <button
                    type="button"
                    data-cell-date={dayKey(cell.year, cell.month, cell.day)}
                    className={cn(
                      'doran-day',
                      !cell.inCurrentMonth && 'doran-day--outside',
                      weekend && 'doran-day--weekend',
                      holiday && 'doran-day--holiday',
                      cell.isToday && 'doran-day--today',
                      selected && 'doran-day--selected',
                      inRange && 'doran-day--in-range',
                      rangeStart && 'doran-day--range-start',
                      rangeEnd && 'doran-day--range-end',
                    )}
                    tabIndex={isActive ? 0 : -1}
                    disabled={disabled}
                    aria-current={cell.isToday ? 'date' : undefined}
                    aria-label={cell.date.withLocale(locale).format('dddd D MMMM YYYY')}
                    onClick={() => {
                      setFocusDate(cell.date);
                      onSelect?.(cell.date);
                    }}
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
