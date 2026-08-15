'use client';

import {
  dayKey,
  indexDayData,
  resolveCalendarLabels,
  type DayDataMap,
  type DayDatum,
  type DayMeta,
  type DayTone,
  type DoranDate,
  type Locale,
} from '@doranjs/core';
import { useDirection, useResolvedLocale } from './provider';
import { cn } from '@doranjs/ui';
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { navigateFocus, type CalendarDay, type GridNav, type MonthGrid } from './grid';

/**
 * Attributes merged onto a single day button, returned from
 * {@link DoranMonthViewProps.dayProps}.
 *
 * Anything starting with `data-` is forwarded to the DOM, which is the hook for
 * styling days from your own stylesheet without fighting Doran's class names.
 */
export interface DayPropsResult {
  className?: string;
  style?: CSSProperties;
  /**
   * Appended to the day's accessible name, after the formatted date. Use it to
   * announce whatever {@link DoranMonthViewProps.dayContent} shows visually —
   * without it, custom content is invisible to screen readers.
   */
  label?: string;
  /** Native tooltip text. */
  title?: string;
  /** Overrides the day's disabled state, whatever `min`/`max`/`dayData` decided. */
  disabled?: boolean;
  /** Why the day is unselectable. Folded into the tooltip and accessible name. */
  disabledReason?: string;
  [key: `data-${string}`]: unknown;
}

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
  /**
   * Whether a day lies outside the calendar's `min`/`max` bounds, as opposed to being
   * individually blocked. Arrow navigation skips out-of-bounds days — which can span
   * decades — but lands on individually disabled ones so they can announce why they
   * are unavailable. Defaults to `isDisabled`, which skips both.
   */
  isOutOfBounds?: (day: DoranDate) => boolean;
  isInRange?: (day: DoranDate) => boolean;
  isRangeStart?: (day: DoranDate) => boolean;
  isRangeEnd?: (day: DoranDate) => boolean;
  /** Marks a day as a holiday (adds a dot + holiday color). */
  isHoliday?: (day: DoranDate) => boolean;
  /**
   * Renders extra content beneath the day number — a fare, a count, a dot.
   *
   * The day cell is a `<button>`, so this content **must be non-interactive**:
   * nested buttons and links are invalid HTML and break the grid's keyboard model.
   * Anything it shows should also be announced via `dayProps().label`.
   *
   * Called once per rendered cell (42 per month), so keep it cheap.
   */
  dayContent?: (day: DoranDate, meta: DayMeta) => ReactNode;
  /** Merges attributes onto a day button — styling hooks, tooltips, disabled state. */
  dayProps?: (day: DoranDate, meta: DayMeta) => DayPropsResult | undefined;
  /**
   * Serializable per-day annotations, keyed by Jalali `YYYY-M-D`. The framework-neutral
   * alternative to `dayContent`: it survives JSON, so it can come straight from an API
   * response. `dayContent` wins where both supply content for the same day.
   */
  dayData?: DayDataMap;
  /**
   * Persian weekday indices treated as the weekend (0 = Saturday … 6 = Friday).
   * Defaults to `[6]` (Friday), the Iranian weekend.
   */
  weekends?: number[];
  /** Render days that fall outside the current month (default `true`). */
  showOutsideDays?: boolean;
  /** Whether the grid allows selecting multiple days (e.g. a range). */
  multiselectable?: boolean;
  /** Writing direction. Defaults to the locale's. */
  dir?: 'rtl' | 'ltr';
  /** Class names for individual parts, for styling without Doran's stylesheet. */
  classNames?: MonthViewClassNames;
  className?: string;
}

/** Per-part class names for {@link DoranMonthView}. */
export interface MonthViewClassNames {
  /** The `role="grid"` root. */
  grid?: string;
  /** The weekday header row. */
  weekdays?: string;
  /** A single weekday header cell. */
  weekday?: string;
  /** A week row. */
  week?: string;
  /** A `role="gridcell"` wrapper. */
  cell?: string;
  /** The day button itself. */
  day?: string;
}

/**
 * Hides an element from sight while leaving it in the accessibility tree.
 *
 * Inline because it is behaviour, not decoration: a consumer styling the calendar
 * themselves must not end up with the live region's announcements printed on screen.
 */
const VISUALLY_HIDDEN: CSSProperties = {
  position: 'absolute',
  width: 1,
  height: 1,
  margin: -1,
  padding: 0,
  overflow: 'hidden',
  clipPath: 'inset(50%)',
  whiteSpace: 'nowrap',
  border: 0,
};

/** The day that should be focusable when the grid is first tabbed into. */
function defaultFocusDate(grid: MonthGrid, isSelected?: (day: DoranDate) => boolean): DoranDate {
  const inMonth = grid.days.filter((d) => d.inCurrentMonth);
  const selected = isSelected && inMonth.find((d) => isSelected(d.date));
  if (selected) return selected.date;
  const today = inMonth.find((d) => d.isToday);
  if (today) return today.date;
  return (inMonth[0] ?? grid.days[0]!).date;
}

/** Picks out the `data-*` entries a consumer returned, discarding the known keys. */
function dataAttributes(props: DayPropsResult | undefined): Record<string, unknown> {
  if (!props) return {};
  const attrs: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(props)) {
    if (key.startsWith('data-') && value !== undefined) attrs[key] = value;
  }
  return attrs;
}

/** Everything needed to render one day cell, resolved from every input that can affect it. */
interface ResolvedDay {
  cell: CalendarDay;
  key: string;
  meta: DayMeta;
  disabled: boolean;
  /** The full accessible name: the formatted date plus any custom additions. */
  label: string;
  title: string | undefined;
  className: string | undefined;
  style: CSSProperties | undefined;
  data: Record<string, unknown>;
  content: ReactNode;
  tone: DayTone | undefined;
}

/**
 * A single month grid: an accessible `role="grid"` of day buttons, ordered
 * Saturday-first for RTL. Supports full keyboard navigation — arrow keys (with RTL
 * direction), Home/End for the week edges, PageUp/PageDown for months (hold Shift for
 * years), and Enter/Space to select. Arrowing or paging past the month edge calls
 * `onMonthChange` so focus can cross month boundaries seamlessly. Pair it with
 * `useCalendar` for navigation, or use it standalone.
 *
 * Days are annotated through three layers, each overriding the last: `dayData` for
 * serializable per-day values, `dayContent` for arbitrary markup, and `dayProps` for
 * attributes and disabled state.
 */
export function DoranMonthView({
  grid,
  locale: localeProp,
  onSelect,
  onMonthChange,
  isSelected,
  isDisabled,
  isOutOfBounds,
  isInRange,
  isRangeStart,
  isRangeEnd,
  isHoliday,
  dayContent,
  dayProps,
  dayData,
  weekends = [6],
  showOutsideDays = true,
  multiselectable,
  dir,
  classNames,
  className,
}: DoranMonthViewProps) {
  const locale = useResolvedLocale(localeProp);
  const direction = useDirection(locale, dir);
  const labels = resolveCalendarLabels(locale);
  const gridRef = useRef<HTMLDivElement>(null);
  const [focusDate, setFocusDate] = useState<DoranDate | null>(null);
  const [isFocusWithin, setIsFocusWithin] = useState(false);

  const dayIndex = useMemo(() => indexDayData(dayData), [dayData]);

  const inGrid = (date: DoranDate) => grid.days.some((d) => d.date.isSame(date, 'day'));

  // The currently focusable day. Falls back to a sensible default whenever the stored
  // focus is absent or no longer on screen (e.g. after the parent changes month).
  const activeDate = useMemo(() => {
    if (focusDate && inGrid(focusDate)) return focusDate;
    return defaultFocusDate(grid, isSelected);
  }, [focusDate, grid, isSelected]);

  const activeKey = dayKey(activeDate);

  useEffect(() => {
    if (!isFocusWithin) return;
    const node = gridRef.current?.querySelector<HTMLButtonElement>(
      `[data-cell-date="${activeKey}"]`,
    );
    node?.focus();
  }, [activeKey, isFocusWithin]);

  function resolveDay(cell: CalendarDay): ResolvedDay {
    const key = dayKey(cell);
    const datum: DayDatum | undefined = dayIndex?.get(key);

    const selected = isSelected?.(cell.date) ?? false;
    const rangeStart = isRangeStart?.(cell.date) ?? false;
    const rangeEnd = isRangeEnd?.(cell.date) ?? false;
    // Endpoints are styled as filled days, not as part of the in-range band.
    const inRange = (isInRange?.(cell.date) ?? false) && !rangeStart && !rangeEnd;
    const holiday = isHoliday?.(cell.date) ?? false;
    const weekend = weekends.includes(cell.weekday);

    // `dayProps` receives the state decided by everything before it, and may then
    // override `disabled` — so the meta it sees is the pre-override value.
    const baseDisabled = (isDisabled?.(cell.date) ?? false) || datum?.disabled === true;

    const meta: DayMeta = {
      year: cell.year,
      month: cell.month,
      day: cell.day,
      weekday: cell.weekday,
      inCurrentMonth: cell.inCurrentMonth,
      isToday: cell.isToday,
      selected,
      disabled: baseDisabled,
      holiday,
      weekend,
      inRange,
      rangeStart,
      rangeEnd,
    };

    const custom = dayProps?.(cell.date, meta);
    const disabled = custom?.disabled ?? baseDisabled;
    const disabledReason = custom?.disabledReason ?? datum?.disabledReason;

    const content = dayContent?.(cell.date, { ...meta, disabled });
    const resolvedContent = content ?? (datum?.text ? datum.text : null);

    // The formatted date always leads; custom text follows so the day is still
    // identifiable when a widget adds noise.
    const additions = [
      custom?.label ?? datum?.label ?? datum?.text,
      disabled ? disabledReason : undefined,
    ].filter((part): part is string => Boolean(part));

    return {
      cell,
      key,
      meta: { ...meta, disabled },
      disabled,
      label: [cell.date.withLocale(locale).format('dddd D MMMM YYYY'), ...additions].join(
        labels.listSeparator,
      ),
      title: custom?.title ?? datum?.title ?? disabledReason,
      className: custom?.className,
      style: custom?.style,
      data: dataAttributes(custom),
      content: resolvedContent,
      tone: datum?.tone,
    };
  }

  const resolved = new Map<string, ResolvedDay>();
  for (const cell of grid.days) resolved.set(dayKey(cell), resolveDay(cell));

  /** Resolved disabled state for a day, falling back to the raw predicates off-grid. */
  function isDayDisabled(date: DoranDate): boolean {
    const known = resolved.get(dayKey(date));
    if (known) return known.disabled;
    return (isDisabled?.(date) ?? false) || dayIndex?.get(dayKey(date))?.disabled === true;
  }

  function navigate(move: GridNav, skipDisabled = false) {
    let target = navigateFocus(activeDate, move);
    // Only bounds are worth skipping: a `min`/`max` gap can run for decades, while an
    // individually blocked day is information the user should land on and hear.
    const shouldSkip = isOutOfBounds ?? isDisabled;
    if (skipDisabled && shouldSkip) {
      const dir = move === 'prev-day' || move === 'prev-week' ? -1 : 1;
      let guard = 0;
      while (shouldSkip(target) && guard < 366) {
        target = target.addDays(dir);
        guard += 1;
      }
    }
    setFocusDate(target);
    if (!inGrid(target)) onMonthChange?.({ year: target.year, month: target.month });
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    switch (event.key) {
      // Arrow keys follow the writing direction: in RTL, ArrowLeft advances.
      case 'ArrowLeft':
        navigate(direction === 'rtl' ? 'next-day' : 'prev-day', true);
        break;
      case 'ArrowRight':
        navigate(direction === 'rtl' ? 'prev-day' : 'next-day', true);
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
        if (!isDayDisabled(activeDate)) onSelect?.(activeDate);
        break;
      default:
        return;
    }
    event.preventDefault();
  }

  const heading = grid.days.find((d) => d.inCurrentMonth)?.date ?? grid.days[0]!.date;
  const gridLabel = heading.withLocale(locale).format('MMMM YYYY');

  // Arrow keys move DOM focus, which most screen readers announce on their own — but
  // not when navigation crosses a month boundary and the whole grid re-renders. The
  // live region covers that gap, and is only populated once the grid has focus so it
  // stays silent for mouse users.
  const focusedDay = resolved.get(activeKey);
  const liveMessage = isFocusWithin && focusedDay ? focusedDay.label : '';

  // Cells only need the taller two-line layout when something can actually fill it.
  const hasDayContent = Boolean(dayContent) || Boolean(dayIndex);

  return (
    <div
      ref={gridRef}
      className={cn(
        'doran-month',
        hasDayContent && 'doran-month--rich',
        classNames?.grid,
        className,
      )}
      role="grid"
      aria-label={gridLabel}
      {...(multiselectable ? { 'aria-multiselectable': true } : {})}
      dir={direction}
      onKeyDown={onKeyDown}
      onFocus={() => setIsFocusWithin(true)}
      onBlur={() => setIsFocusWithin(false)}
    >
      <span
        className="doran-month__live"
        role="status"
        aria-live="polite"
        // Inlined rather than left to the stylesheet: this text must never be seen,
        // and the components are usable without importing Doran's CSS at all.
        style={VISUALLY_HIDDEN}
      >
        {liveMessage}
      </span>

      <div className={cn('doran-month__weekdays', classNames?.weekdays)} role="row">
        {locale.weekdaysMin.map((name, i) => (
          <div
            key={i}
            className={cn(
              'doran-month__weekday',
              weekends.includes(i) && 'doran-month__weekday--weekend',
              classNames?.weekday,
            )}
            role="columnheader"
            aria-label={locale.weekdays[i]}
          >
            {name}
          </div>
        ))}
      </div>

      {grid.weeks.map((week, wi) => (
        <div key={wi} className={cn('doran-month__week', classNames?.week)} role="row">
          {week.map((cell, ci) => {
            const day = resolved.get(dayKey(cell))!;
            const { meta } = day;
            const hidden = !cell.inCurrentMonth && !showOutsideDays;
            const isActive = cell.date.isSame(activeDate, 'day');
            const number = cell.date.withLocale(locale).format('D');

            return (
              <div
                key={`${wi}-${ci}`}
                className={cn('doran-month__cell', classNames?.cell)}
                role="gridcell"
                aria-selected={meta.selected}
              >
                {hidden ? (
                  <span aria-hidden className="doran-month__spacer" />
                ) : (
                  <button
                    type="button"
                    data-cell-date={day.key}
                    {...day.data}
                    className={cn(
                      'doran-day',
                      !cell.inCurrentMonth && 'doran-day--outside',
                      meta.weekend && 'doran-day--weekend',
                      meta.holiday && 'doran-day--holiday',
                      cell.isToday && 'doran-day--today',
                      meta.selected && 'doran-day--selected',
                      meta.inRange && 'doran-day--in-range',
                      meta.rangeStart && 'doran-day--range-start',
                      meta.rangeEnd && 'doran-day--range-end',
                      classNames?.day,
                      day.className,
                    )}
                    {...(day.style ? { style: day.style } : {})}
                    tabIndex={isActive ? 0 : -1}
                    // `aria-disabled` rather than `disabled`: a disabled day stays
                    // focusable, so keyboard and screen-reader users can reach it and
                    // hear why it is unavailable.
                    aria-disabled={day.disabled || undefined}
                    aria-current={cell.isToday ? 'date' : undefined}
                    aria-label={day.label}
                    {...(day.title ? { title: day.title } : {})}
                    onClick={() => {
                      if (day.disabled) return;
                      setFocusDate(cell.date);
                      onSelect?.(cell.date);
                    }}
                  >
                    {day.content === null ? (
                      number
                    ) : (
                      <>
                        <span className="doran-day__number">{number}</span>
                        <span
                          className="doran-day__content"
                          {...(day.tone ? { 'data-tone': day.tone } : {})}
                        >
                          {day.content}
                        </span>
                      </>
                    )}
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
