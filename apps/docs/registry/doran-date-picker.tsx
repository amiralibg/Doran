'use client';

import * as React from 'react';
import {
  DoranDate,
  getDefaultLocale,
  parseJalali,
  resolveCalendarLabels,
  resolveDirection,
  toDoranDate,
  type DateInput,
  type Locale,
} from '@doranjs/core';
import { buildMonthGrid, navigateFocus, useCalendar, type GridNav } from '@doranjs/react';
import { CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

/**
 * A Persian (Jalali) date picker built from your own shadcn/ui primitives.
 *
 * Every visual comes from your Button, Input, Popover, and theme tokens — this file
 * is yours to edit. Doran supplies only the calendar engine: the month grid, the
 * keyboard model, and Jalali parsing and formatting.
 */
export interface DoranDatePickerProps {
  value?: DateInput | null;
  onChange?: (date: DoranDate | null) => void;
  /** Locale for month names, numerals, direction, and labels. Defaults to Persian. */
  locale?: Locale;
  /** Display format. Defaults to `YYYY/MM/DD`. */
  format?: string;
  placeholder?: string;
  min?: DateInput;
  max?: DateInput;
  disabled?: boolean;
  className?: string;
}

export function DoranDatePicker({
  value,
  onChange,
  locale,
  format = 'YYYY/MM/DD',
  placeholder,
  min,
  max,
  disabled,
  className,
}: DoranDatePickerProps) {
  // Falling back to the ambient default means `setDefaultLocale(enUS)` reaches this
  // component too, rather than it being permanently Persian.
  const resolved = locale ?? getDefaultLocale();
  const labels = resolveCalendarLabels(resolved);
  const direction = resolveDirection(resolved);
  const rtl = direction === 'rtl';

  const selected = toDoranDate(value);
  const [open, setOpen] = React.useState(false);

  const calendar = useCalendar({
    value: selected,
    onChange: (date) => {
      onChange?.(date);
      setOpen(false);
    },
    ...(toDoranDate(min) ? { min: toDoranDate(min)! } : {}),
    ...(toDoranDate(max) ? { max: toDoranDate(max)! } : {}),
  });

  const display = (date: DoranDate | null) =>
    date ? date.withLocale(resolved).format(format) : '';

  // The input keeps whatever is being typed; the value only follows once it parses.
  const [text, setText] = React.useState(() => display(selected));
  const [typing, setTyping] = React.useState(false);

  React.useEffect(() => {
    if (!typing) setText(display(selected));
  }, [selected, typing, format, resolved]);

  function handleInput(event: React.ChangeEvent<HTMLInputElement>) {
    const raw = event.target.value;
    setTyping(true);
    setText(raw);

    if (raw.trim() === '') {
      onChange?.(null);
      return;
    }
    const parsed = parseJalali(raw, undefined, { locale: resolved });
    if (parsed && !calendar.isDisabled(parsed)) onChange?.(parsed.startOf('day'));
  }

  // Roving tabindex: one day is tabbable, arrows move it. Mirrors the ARIA grid
  // pattern, with left/right following the writing direction.
  const [focusDate, setFocusDate] = React.useState<DoranDate | null>(null);
  const active = focusDate ?? selected ?? calendar.today;
  const gridRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;
    const key = `${active.year}-${active.month}-${active.day}`;
    gridRef.current?.querySelector<HTMLElement>(`[data-day="${key}"]`)?.focus();
  }, [open, active]);

  function move(nav: GridNav) {
    let target = navigateFocus(active, nav);
    // Skip out-of-range days, which can span years, but stop on anything else.
    let guard = 0;
    while (calendar.isDisabled(target) && guard < 366) {
      target = target.addDays(nav.startsWith('prev') ? -1 : 1);
      guard += 1;
    }
    setFocusDate(target);
    if (target.year !== calendar.year || target.month !== calendar.month) {
      calendar.setMonth({ year: target.year, month: target.month });
    }
  }

  function onGridKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    const moves: Record<string, GridNav> = {
      ArrowLeft: rtl ? 'next-day' : 'prev-day',
      ArrowRight: rtl ? 'prev-day' : 'next-day',
      ArrowUp: 'prev-week',
      ArrowDown: 'next-week',
      Home: 'week-start',
      End: 'week-end',
      PageUp: event.shiftKey ? 'prev-year' : 'prev-month',
      PageDown: event.shiftKey ? 'next-year' : 'next-month',
    };

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (!calendar.isDisabled(active)) calendar.select(active);
      return;
    }
    const nav = moves[event.key];
    if (!nav) return;
    event.preventDefault();
    move(nav);
  }

  const grid = buildMonthGrid(calendar.year, calendar.month, { today: calendar.today });
  const heading = DoranDate.fromJalali({ year: calendar.year, month: calendar.month, day: 1 });
  const monthLabel = heading.withLocale(resolved).format('MMMM YYYY');
  const num = (n: number) => resolved.formatNumber(String(n));

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <div className={cn('relative flex items-center', className)} dir={direction}>
        <Input
          value={text}
          onChange={handleInput}
          onBlur={() => setTyping(false)}
          onKeyDown={(event) => {
            if (event.key === 'ArrowDown' && !open) {
              event.preventDefault();
              setOpen(true);
            }
          }}
          placeholder={placeholder ?? labels.datePlaceholder}
          disabled={disabled}
          aria-label={placeholder ?? labels.datePlaceholder}
          className="pe-9"
          dir="auto"
          inputMode="numeric"
        />
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            disabled={disabled}
            tabIndex={-1}
            aria-label={labels.openCalendar}
            className="absolute end-1 h-7 w-7"
          >
            <CalendarIcon className="h-4 w-4 opacity-60" />
          </Button>
        </PopoverTrigger>
      </div>

      <PopoverContent className="w-auto p-3" align="start" dir={direction}>
        <div className="mb-2 flex items-center justify-between gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            aria-label={labels.previousMonth}
            onClick={calendar.goToPrevMonth}
          >
            {rtl ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
          <div className="text-sm font-medium" aria-live="polite">
            {monthLabel}
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            aria-label={labels.nextMonth}
            onClick={calendar.goToNextMonth}
          >
            {rtl ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
        </div>

        <div
          ref={gridRef}
          role="grid"
          aria-label={monthLabel}
          dir={direction}
          onKeyDown={onGridKeyDown}
        >
          <div role="row" className="grid grid-cols-7">
            {resolved.weekdaysMin.map((day, i) => (
              <div
                key={i}
                role="columnheader"
                className="text-muted-foreground py-1 text-center text-[0.7rem] font-medium"
              >
                {day}
              </div>
            ))}
          </div>

          {grid.weeks.map((week, wi) => (
            <div key={wi} role="row" className="grid grid-cols-7">
              {week.map((cell) => {
                const isSelected = calendar.isSelected(cell.date);
                const isDisabled = calendar.isDisabled(cell.date);
                const isActive = cell.date.isSame(active, 'day');
                const key = `${cell.year}-${cell.month}-${cell.day}`;

                return (
                  <div key={key} role="gridcell" aria-selected={isSelected} className="p-0.5">
                    <button
                      type="button"
                      data-day={key}
                      tabIndex={isActive ? 0 : -1}
                      // aria-disabled rather than disabled: the day stays focusable,
                      // so a keyboard user can reach it and hear that it is blocked.
                      aria-disabled={isDisabled || undefined}
                      aria-current={cell.isToday ? 'date' : undefined}
                      aria-label={cell.date.withLocale(resolved).format('dddd D MMMM YYYY')}
                      onClick={() => {
                        if (isDisabled) return;
                        setFocusDate(cell.date);
                        calendar.select(cell.date);
                      }}
                      className={cn(
                        'h-8 w-8 rounded-md text-sm tabular-nums transition-colors',
                        'focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none',
                        !cell.inCurrentMonth && 'text-muted-foreground/50',
                        cell.isToday && !isSelected && 'ring-border ring-1',
                        isSelected
                          ? 'bg-primary text-primary-foreground'
                          : !isDisabled && 'hover:bg-accent hover:text-accent-foreground',
                        isDisabled && 'cursor-not-allowed opacity-40',
                      )}
                    >
                      {num(cell.day)}
                    </button>
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        <div className="mt-2 flex justify-center">
          <Button type="button" variant="outline" size="sm" onClick={calendar.selectToday}>
            {labels.today}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
