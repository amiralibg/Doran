/**
 * Shared day-cell rendering for `<doran-calendar>` and `<doran-rangepicker>`.
 *
 * Both elements used to build the same button markup inline, which meant every
 * change — `dayData`, `aria-disabled`, the two-line layout — had to be made twice
 * and stay in sync.
 */

import { dayKey, type DayDatum, type DoranDate, type Locale } from '@doranjs/core';
import type { GridDay } from './grid';
import { esc } from './util';

/** Everything a cell needs to know about itself, resolved by the host element. */
export interface DayCellState {
  selected: boolean;
  disabled: boolean;
  holiday: boolean;
  weekend: boolean;
  active: boolean;
  inRange?: boolean;
  rangeStart?: boolean;
  rangeEnd?: boolean;
}

export interface DayCellOptions {
  locale: Locale;
  /** Localizes a number into the locale's numerals. */
  num: (value: number | string) => string;
  /** Per-day annotations, already normalized by `indexDayData`. */
  dayIndex: Map<string, DayDatum> | null;
}

/**
 * Renders one day cell, including any `dayData` annotation.
 *
 * Note the two deliberate choices mirrored from `@doranjs/react`: unavailable days
 * get `aria-disabled` rather than the `disabled` attribute so they stay focusable and
 * can announce why, and any custom label is *appended* to the formatted date rather
 * than replacing it.
 */
export function renderDayCell(cell: GridDay, state: DayCellState, options: DayCellOptions): string {
  const { locale, num, dayIndex } = options;
  const datum = dayIndex?.get(dayKey(cell.date));

  const disabled = state.disabled || datum?.disabled === true;
  const disabledReason = datum?.disabledReason;

  const classes = [
    'doran-day',
    !cell.inCurrentMonth ? 'doran-day--outside' : '',
    state.weekend ? 'doran-day--weekend' : '',
    state.holiday ? 'doran-day--holiday' : '',
    cell.isToday ? 'doran-day--today' : '',
    state.selected ? 'doran-day--selected' : '',
    state.rangeStart ? 'doran-day--range-start' : '',
    state.rangeEnd ? 'doran-day--range-end' : '',
    state.inRange && !state.rangeStart && !state.rangeEnd ? 'doran-day--in-range' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const additions = [datum?.label ?? datum?.text, disabled ? disabledReason : undefined].filter(
    (part): part is string => Boolean(part),
  );
  const label = esc(
    [cell.date.withLocale(locale).format('dddd D MMMM YYYY'), ...additions].join(', '),
  );

  const title = datum?.title ?? disabledReason;
  const number = esc(num(cell.day));

  const body = datum?.text
    ? `<span class="doran-day__number">${number}</span>` +
      `<span class="doran-day__content"${datum.tone ? ` data-tone="${esc(datum.tone)}"` : ''}>${esc(datum.text)}</span>`
    : number;

  return (
    `<div class="doran-month__cell" role="gridcell" aria-selected="${state.selected}">` +
    `<button type="button" class="${classes}"` +
    (disabled ? ' aria-disabled="true"' : '') +
    (title ? ` title="${esc(title)}"` : '') +
    ` tabindex="${state.active ? 0 : -1}"` +
    ` data-action="select-day" data-y="${cell.date.year}" data-m="${cell.date.month}" data-d="${cell.date.day}"` +
    ` aria-label="${label}">${body}</button>` +
    `</div>`
  );
}

/** Whether a day is blocked, counting both the host's rules and `dayData`. */
export function isDayBlocked(
  date: DoranDate,
  hostDisabled: boolean,
  dayIndex: Map<string, DayDatum> | null,
): boolean {
  return hostDisabled || dayIndex?.get(dayKey(date))?.disabled === true;
}
