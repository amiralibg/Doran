'use client';

import { type Locale } from '@doranjs/core';
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon, cn } from '@doranjs/ui';
import type { ReactNode } from 'react';

/** Which in-place picker panel the calendar is showing. */
export type CalendarPanel = 'days' | 'months' | 'years';

/** How the month/year selectors are presented. */
export type HeaderMode = 'dropdown' | 'separate';

/** Render-prop overrides for the navigation arrows. */
export interface CalendarArrows {
  /** Previous-month arrow. Defaults to a right-pointing chevron (RTL "back"). */
  prev?: ReactNode;
  /** Next-month arrow. Defaults to a left-pointing chevron (RTL "forward"). */
  next?: ReactNode;
}

export interface CalendarHeaderProps {
  year: number;
  month: number;
  locale: Locale;
  mode: HeaderMode;
  panel: CalendarPanel;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onTogglePanel: (panel: Exclude<CalendarPanel, 'days'>) => void;
  onSelectMonth: (month: number) => void;
  onSelectYear: (year: number) => void;
  /** Inclusive year bounds for the `separate` year `<select>`. */
  yearRange: [number, number];
  arrows?: CalendarArrows;
}

/**
 * The calendar's top bar: previous/next navigation plus the month/year selector.
 * In `dropdown` mode the month and year are buttons that open in-place panels;
 * in `separate` mode they are native `<select>`s.
 */
export function CalendarHeader({
  year,
  month,
  locale,
  mode,
  panel,
  onPrevMonth,
  onNextMonth,
  onTogglePanel,
  onSelectMonth,
  onSelectYear,
  yearRange,
  arrows,
}: CalendarHeaderProps) {
  return (
    <div className="doran-calendar__header">
      {/* RTL: "previous" sits on the right and points right. */}
      <button
        type="button"
        className="doran-calendar__nav"
        aria-label="ماه قبل"
        onClick={onPrevMonth}
      >
        {arrows?.prev ?? <ChevronRightIcon />}
      </button>

      <div className="doran-calendar__heading" aria-live="polite">
        {mode === 'separate' ? (
          <>
            <select
              className="doran-calendar__heading-btn"
              aria-label="ماه"
              value={month}
              onChange={(e) => onSelectMonth(Number(e.target.value))}
            >
              {locale.months.map((name, i) => (
                <option key={i} value={i + 1}>
                  {name}
                </option>
              ))}
            </select>
            <select
              className="doran-calendar__heading-btn"
              aria-label="سال"
              value={year}
              onChange={(e) => onSelectYear(Number(e.target.value))}
            >
              {yearsBetween(yearRange).map((y) => (
                <option key={y} value={y}>
                  {locale.formatNumber(String(y))}
                </option>
              ))}
            </select>
          </>
        ) : (
          <>
            <button
              type="button"
              className={cn(
                'doran-calendar__heading-btn',
                panel === 'months' && 'doran-calendar__heading-btn--active',
              )}
              aria-expanded={panel === 'months'}
              onClick={() => onTogglePanel('months')}
            >
              {locale.months[month - 1]}
              <ChevronDownIcon />
            </button>
            <button
              type="button"
              className={cn(
                'doran-calendar__heading-btn',
                panel === 'years' && 'doran-calendar__heading-btn--active',
              )}
              aria-expanded={panel === 'years'}
              onClick={() => onTogglePanel('years')}
            >
              {locale.formatNumber(String(year))}
              <ChevronDownIcon />
            </button>
          </>
        )}
      </div>

      <button
        type="button"
        className="doran-calendar__nav"
        aria-label="ماه بعد"
        onClick={onNextMonth}
      >
        {arrows?.next ?? <ChevronLeftIcon />}
      </button>
    </div>
  );
}

function yearsBetween([from, to]: [number, number]): number[] {
  const out: number[] = [];
  for (let y = from; y <= to; y += 1) out.push(y);
  return out;
}

export interface MonthYearPanelProps {
  panel: Exclude<CalendarPanel, 'days'>;
  year: number;
  month: number;
  locale: Locale;
  yearRange: [number, number];
  onSelectMonth: (month: number) => void;
  onSelectYear: (year: number) => void;
}

/** The in-place month / year grid shown when a `dropdown` heading button is open. */
export function MonthYearPanel({
  panel,
  year,
  month,
  locale,
  yearRange,
  onSelectMonth,
  onSelectYear,
}: MonthYearPanelProps) {
  if (panel === 'months') {
    return (
      <div className="doran-picker-panel">
        <div className="doran-picker-panel__grid doran-picker-panel__grid--months" role="listbox">
          {locale.months.map((name, i) => (
            <button
              key={i}
              type="button"
              role="option"
              aria-selected={i + 1 === month}
              className={cn(
                'doran-picker-option',
                i + 1 === month && 'doran-picker-option--active',
              )}
              onClick={() => onSelectMonth(i + 1)}
            >
              {name}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="doran-picker-panel">
      <div className="doran-picker-panel__grid doran-picker-panel__grid--years" role="listbox">
        {yearsBetween(yearRange).map((y) => (
          <button
            key={y}
            type="button"
            role="option"
            aria-selected={y === year}
            className={cn('doran-picker-option', y === year && 'doran-picker-option--active')}
            onClick={() => onSelectYear(y)}
          >
            {locale.formatNumber(String(y))}
          </button>
        ))}
      </div>
    </div>
  );
}
