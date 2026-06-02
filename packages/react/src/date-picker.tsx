'use client';

import { type DoranDate, faIR, type Locale } from '@doranjs/core';
import { CalendarIcon, cn } from '@doranjs/ui';
import { useEffect, useId, useRef, useState } from 'react';
import { DoranCalendar, type DoranCalendarProps } from './calendar';

export interface DoranDatePickerProps extends Pick<
  DoranCalendarProps,
  | 'headerMode'
  | 'withTime'
  | 'minuteStep'
  | 'defaultTime'
  | 'isHoliday'
  | 'weekends'
  | 'arrows'
  | 'showOutsideDays'
> {
  value?: DoranDate | null;
  defaultValue?: DoranDate | null;
  onChange?: (date: DoranDate) => void;
  locale?: Locale;
  /** Format pattern for the input display. Defaults to `YYYY/MM/DD` (`+ HH:mm` with time). */
  format?: string;
  placeholder?: string;
  min?: DoranDate;
  max?: DoranDate;
  disabled?: boolean;
  className?: string;
}

/**
 * A date input with a pop-over {@link DoranCalendar}. Controlled or uncontrolled,
 * accessible, and closes on outside-click or `Escape`. Supports an optional time
 * picker via `withTime`.
 */
export function DoranDatePicker({
  value,
  defaultValue,
  onChange,
  locale = faIR,
  format,
  placeholder = 'انتخاب تاریخ',
  min,
  max,
  disabled,
  className,
  withTime,
  headerMode,
  minuteStep,
  defaultTime,
  isHoliday,
  weekends,
  arrows,
  showOutsideDays,
}: DoranDatePickerProps) {
  const isControlled = value !== undefined;
  const [internal, setInternal] = useState<DoranDate | null>(defaultValue ?? null);
  const selected = isControlled ? (value ?? null) : internal;

  const resolvedFormat = format ?? (withTime ? 'YYYY/MM/DD HH:mm' : 'YYYY/MM/DD');

  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const popoverId = useId();

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false);
    }
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  function handleChange(date: DoranDate) {
    if (!isControlled) setInternal(date);
    onChange?.(date);
    // Keep the popover open while adjusting time; close on a plain date pick.
    if (!withTime) setOpen(false);
  }

  return (
    <div ref={rootRef} className={cn('doran-datepicker', className)} dir="rtl">
      <button
        type="button"
        className="doran-datepicker__input"
        disabled={disabled}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? popoverId : undefined}
        onClick={() => setOpen((o) => !o)}
      >
        <span className={cn(!selected && 'doran-datepicker__placeholder')}>
          {selected ? selected.withLocale(locale).format(resolvedFormat) : placeholder}
        </span>
        <span aria-hidden className="doran-datepicker__icon">
          <CalendarIcon />
        </span>
      </button>

      {open && (
        <div id={popoverId} role="dialog" aria-label="تقویم" className="doran-datepicker__popover">
          <DoranCalendar
            locale={locale}
            value={selected}
            onChange={handleChange}
            {...(min ? { min } : {})}
            {...(max ? { max } : {})}
            {...(withTime ? { withTime } : {})}
            {...(headerMode ? { headerMode } : {})}
            {...(minuteStep !== undefined ? { minuteStep } : {})}
            {...(defaultTime ? { defaultTime } : {})}
            {...(isHoliday ? { isHoliday } : {})}
            {...(weekends ? { weekends } : {})}
            {...(arrows ? { arrows } : {})}
            {...(showOutsideDays !== undefined ? { showOutsideDays } : {})}
            {...(selected ? { defaultMonth: { year: selected.year, month: selected.month } } : {})}
          />
        </div>
      )}
    </div>
  );
}
