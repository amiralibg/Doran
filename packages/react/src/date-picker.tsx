'use client';

import { type DoranDate, faIR, type Locale } from '@doranjs/core';
import { cn } from '@doranjs/ui';
import { useEffect, useId, useRef, useState } from 'react';
import { DoranCalendar } from './calendar';

export interface DoranDatePickerProps {
  value?: DoranDate | null;
  defaultValue?: DoranDate | null;
  onChange?: (date: DoranDate) => void;
  locale?: Locale;
  /** Format pattern for the input display. Defaults to `YYYY/MM/DD`. */
  format?: string;
  placeholder?: string;
  min?: DoranDate;
  max?: DoranDate;
  disabled?: boolean;
  className?: string;
}

/**
 * A date input with a pop-over {@link DoranCalendar}. Controlled or uncontrolled,
 * accessible, and closes on outside-click or `Escape`.
 */
export function DoranDatePicker({
  value,
  defaultValue,
  onChange,
  locale = faIR,
  format = 'YYYY/MM/DD',
  placeholder = 'انتخاب تاریخ',
  min,
  max,
  disabled,
  className,
}: DoranDatePickerProps) {
  const isControlled = value !== undefined;
  const [internal, setInternal] = useState<DoranDate | null>(defaultValue ?? null);
  const selected = isControlled ? (value ?? null) : internal;

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
    setOpen(false);
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
          {selected ? selected.withLocale(locale).format(format) : placeholder}
        </span>
        <span aria-hidden className="doran-datepicker__icon">
          📅
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
            {...(selected ? { defaultMonth: { year: selected.year, month: selected.month } } : {})}
          />
        </div>
      )}
    </div>
  );
}
