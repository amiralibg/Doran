'use client';

import { resolveCalendarLabels, type Locale } from '@doranjs/core';
import { useResolvedLocale } from './provider';
import { ChevronDownIcon, ChevronUpIcon } from '@doranjs/ui';
import type { KeyboardEvent } from 'react';

/** A time-of-day value, 24-hour. `second` is only present when `withSeconds` is on. */
export interface TimeValue {
  hour: number;
  minute: number;
  second?: number;
}

export interface DoranTimePickerProps {
  value: TimeValue;
  onChange: (value: TimeValue) => void;
  /** Minute increment for the steppers. Defaults to `1`. */
  minuteStep?: number;
  /** Show a seconds field. */
  withSeconds?: boolean;
  /** Second increment for the steppers. Defaults to `1`. */
  secondStep?: number;
  /**
   * `24` (default) or `12`. In 12-hour mode a meridiem toggle appears, labelled from
   * the locale's `meridiem` pair. The value stays 24-hour either way.
   */
  hourCycle?: 12 | 24;
  locale?: Locale;
  className?: string;
}

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

function wrap(value: number, max: number): number {
  return ((value % max) + max) % max;
}

/** How far PageUp/PageDown move, in units. */
const PAGE_STEP = 5;

/**
 * A compact time picker with hour/minute (and optional seconds) steppers.
 * Headless-friendly: fully controlled via `value`/`onChange`. Used by
 * {@link DoranCalendar} when `withTime` is set, and exported for standalone use.
 *
 * Each field is a `spinbutton`, so it is reachable by Tab and adjustable with the
 * arrow keys — previously the only way to change the time was to Tab onto a chevron
 * and press Enter, which made 00:00 → 23:45 a long afternoon.
 */
export function DoranTimePicker({
  value,
  onChange,
  minuteStep = 1,
  withSeconds = false,
  secondStep = 1,
  hourCycle = 24,
  locale: localeProp,
  className,
}: DoranTimePickerProps) {
  const locale = useResolvedLocale(localeProp);
  const labels = resolveCalendarLabels(locale);
  const num = (n: number) => locale.formatNumber(pad(n));

  const second = value.second ?? 0;
  const emit = (next: Partial<TimeValue>) =>
    onChange({
      hour: value.hour,
      minute: value.minute,
      ...(withSeconds ? { second } : {}),
      ...next,
    });

  const setHour = (delta: number) => emit({ hour: wrap(value.hour + delta, 24) });
  const setMinute = (delta: number) =>
    emit({ minute: wrap(value.minute + delta * minuteStep, 60) });
  const setSecond = (delta: number) => emit({ second: wrap(second + delta * secondStep, 60) });

  const isPm = value.hour >= 12;
  // In 12-hour mode midnight and noon both display as 12.
  const displayHour = hourCycle === 12 ? value.hour % 12 || 12 : value.hour;

  const toggleMeridiem = () => emit({ hour: wrap(value.hour + (isPm ? -12 : 12), 24) });

  return (
    <div className={className ? `doran-time ${className}` : 'doran-time'} dir="ltr">
      <Field
        label={labels.hour}
        increase={labels.increase}
        decrease={labels.decrease}
        display={num(displayHour)}
        value={value.hour}
        max={23}
        onStep={setHour}
        onSet={(n) => emit({ hour: n })}
      />
      <span className="doran-time__sep" aria-hidden>
        :
      </span>
      <Field
        label={labels.minute}
        increase={labels.increase}
        decrease={labels.decrease}
        display={num(value.minute)}
        value={value.minute}
        max={59}
        onStep={setMinute}
        onSet={(n) => emit({ minute: n })}
      />

      {withSeconds && (
        <>
          <span className="doran-time__sep" aria-hidden>
            :
          </span>
          <Field
            label={labels.second}
            increase={labels.increase}
            decrease={labels.decrease}
            display={num(second)}
            value={second}
            max={59}
            onStep={setSecond}
            onSet={(n) => emit({ second: n })}
          />
        </>
      )}

      {hourCycle === 12 && (
        <button
          type="button"
          className="doran-time__meridiem"
          // A toggle rather than a stepper: there are only two states, and
          // `aria-pressed` says which one without needing a value range.
          aria-pressed={isPm}
          aria-label={labels.meridiem}
          onClick={toggleMeridiem}
        >
          {locale.meridiem[isPm ? 1 : 0]}
        </button>
      )}
    </div>
  );
}

interface FieldProps {
  label: string;
  increase: string;
  decrease: string;
  display: string;
  /** The underlying 24-hour value, for assistive technology. */
  value: number;
  max: number;
  onStep: (delta: number) => void;
  /** Jumps straight to a value, for Home and End. */
  onSet: (value: number) => void;
}

function Field({ label, increase, decrease, display, value, max, onStep, onSet }: FieldProps) {
  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    switch (event.key) {
      case 'ArrowUp':
        onStep(1);
        break;
      case 'ArrowDown':
        onStep(-1);
        break;
      case 'PageUp':
        onStep(PAGE_STEP);
        break;
      case 'PageDown':
        onStep(-PAGE_STEP);
        break;
      case 'Home':
        onSet(0);
        break;
      case 'End':
        onSet(max);
        break;
      default:
        return;
    }
    event.preventDefault();
  }

  return (
    <div className="doran-time__field" role="group" aria-label={label}>
      <button
        type="button"
        className="doran-time__btn"
        aria-label={`${increase} ${label}`}
        // The spinbutton beside it is the keyboard route; a tab stop per chevron
        // would put three extra stops between the calendar and the footer.
        tabIndex={-1}
        onClick={() => onStep(1)}
      >
        <ChevronUpIcon />
      </button>
      <span
        className="doran-time__value"
        role="spinbutton"
        tabIndex={0}
        aria-label={label}
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuetext={display}
        onKeyDown={onKeyDown}
      >
        {display}
      </span>
      <button
        type="button"
        className="doran-time__btn"
        aria-label={`${decrease} ${label}`}
        tabIndex={-1}
        onClick={() => onStep(-1)}
      >
        <ChevronDownIcon />
      </button>
    </div>
  );
}
