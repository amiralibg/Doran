'use client';

import { type Locale } from '@doranjs/core';
import { useResolvedLocale } from './provider';
import { ChevronDownIcon, ChevronUpIcon } from '@doranjs/ui';

/** A time-of-day value, 24-hour. */
export interface TimeValue {
  hour: number;
  minute: number;
}

export interface DoranTimePickerProps {
  value: TimeValue;
  onChange: (value: TimeValue) => void;
  /** Minute increment for the steppers. Defaults to `1`. */
  minuteStep?: number;
  locale?: Locale;
  className?: string;
}

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

function wrap(value: number, max: number): number {
  return ((value % max) + max) % max;
}

/**
 * A compact 24-hour time picker with hour/minute steppers. Headless-friendly:
 * fully controlled via `value`/`onChange`. Used by {@link DoranCalendar} when
 * `withTime` is set, and exported for standalone use.
 */
export function DoranTimePicker({
  value,
  onChange,
  minuteStep = 1,
  locale: localeProp,
  className,
}: DoranTimePickerProps) {
  const locale = useResolvedLocale(localeProp);
  const num = (n: number) => locale.formatNumber(pad(n));

  const setHour = (delta: number) =>
    onChange({ hour: wrap(value.hour + delta, 24), minute: value.minute });
  const setMinute = (delta: number) =>
    onChange({ hour: value.hour, minute: wrap(value.minute + delta * minuteStep, 60) });

  return (
    <div className={className ? `doran-time ${className}` : 'doran-time'} dir="ltr">
      <Field
        label="ساعت"
        display={num(value.hour)}
        onUp={() => setHour(1)}
        onDown={() => setHour(-1)}
      />
      <span className="doran-time__sep" aria-hidden>
        :
      </span>
      <Field
        label="دقیقه"
        display={num(value.minute)}
        onUp={() => setMinute(1)}
        onDown={() => setMinute(-1)}
      />
    </div>
  );
}

interface FieldProps {
  label: string;
  display: string;
  onUp: () => void;
  onDown: () => void;
}

function Field({ label, display, onUp, onDown }: FieldProps) {
  return (
    <div className="doran-time__field" role="group" aria-label={label}>
      <button
        type="button"
        className="doran-time__btn"
        aria-label={`افزایش ${label}`}
        onClick={onUp}
      >
        <ChevronUpIcon />
      </button>
      <span className="doran-time__value" aria-live="polite">
        {display}
      </span>
      <button
        type="button"
        className="doran-time__btn"
        aria-label={`کاهش ${label}`}
        onClick={onDown}
      >
        <ChevronDownIcon />
      </button>
    </div>
  );
}
