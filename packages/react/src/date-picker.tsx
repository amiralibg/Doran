'use client';

import { type DoranDate, faIR, type Locale } from '@doranjs/core';
import { CalendarIcon, cn } from '@doranjs/ui';
import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react';
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
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const popoverId = useId();

  /** Close the popover, optionally returning focus to the trigger button. */
  function close(restoreFocus: boolean) {
    setOpen(false);
    if (restoreFocus) triggerRef.current?.focus();
  }

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') close(true);
    }
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  // On open, move focus into the calendar (the focusable day), so keyboard users land
  // directly on the grid rather than being stranded on the trigger.
  useEffect(() => {
    if (!open) return;
    const day = popoverRef.current?.querySelector<HTMLElement>('.doran-month [tabindex="0"]');
    day?.focus();
  }, [open]);

  // Keep Tab focus cycling within the dialog while it is open.
  function trapTab(event: ReactKeyboardEvent<HTMLDivElement>) {
    if (event.key !== 'Tab') return;
    const focusable = popoverRef.current?.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );
    if (!focusable || focusable.length === 0) return;
    const first = focusable[0]!;
    const last = focusable[focusable.length - 1]!;
    const active = document.activeElement;
    if (event.shiftKey && active === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function handleChange(date: DoranDate) {
    if (!isControlled) setInternal(date);
    onChange?.(date);
    // Keep the popover open while adjusting time; close on a plain date pick.
    if (!withTime) close(true);
  }

  return (
    <div ref={rootRef} className={cn('doran-datepicker', className)} dir="rtl">
      <button
        ref={triggerRef}
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
        <div
          ref={popoverRef}
          id={popoverId}
          role="dialog"
          aria-modal="false"
          aria-label="تقویم"
          className="doran-datepicker__popover"
          onKeyDown={trapTab}
        >
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
