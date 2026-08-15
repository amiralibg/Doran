'use client';

import { normalizeDigits, resolveCalendarLabels, type Locale } from '@doranjs/core';
import { useResolvedLocale } from './provider';
import { ChevronDownIcon, ChevronUpIcon } from '@doranjs/ui';
import { useEffect, useState, type ChangeEvent, type FocusEvent, type KeyboardEvent } from 'react';

/** A time-of-day value, 24-hour. `second` is only present when `withSeconds` is on. */
export interface TimeValue {
  hour: number;
  minute: number;
  second?: number;
}

export interface DoranTimePickerProps {
  value: TimeValue;
  onChange: (value: TimeValue) => void;
  /** How much one arrow press moves the hour. Defaults to `1`. */
  hourStep?: number;
  /** How much one arrow press moves the minute. Defaults to `1`. */
  minuteStep?: number;
  /** How much one arrow press moves the second. Defaults to `1`. */
  secondStep?: number;
  /** Show a seconds field. */
  withSeconds?: boolean;
  /**
   * `24` (default) or `12`. In 12-hour mode a meridiem toggle appears, labelled from
   * the locale's `meridiem` pair. The value stays 24-hour either way.
   */
  hourCycle?: 12 | 24;
  /** Stops typing while leaving the steppers usable. */
  readOnly?: boolean;
  locale?: Locale;
  className?: string;
}

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

function wrap(value: number, max: number): number {
  return ((value % max) + max) % max;
}

/** How far PageUp/PageDown move, as a multiple of the field's step. */
const PAGE_MULTIPLIER = 5;

/**
 * A compact time picker with hour/minute (and optional seconds) fields.
 * Headless-friendly: fully controlled via `value`/`onChange`. Used by
 * {@link DoranCalendar} when `withTime` is set, and exported for standalone use.
 *
 * Each field can be typed into directly or stepped with the arrow keys. Every unit
 * has its own step, so `minuteStep={15}` leaves the hour moving one at a time.
 */
export function DoranTimePicker({
  value,
  onChange,
  hourStep = 1,
  minuteStep = 1,
  secondStep = 1,
  withSeconds = false,
  hourCycle = 24,
  readOnly,
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

  const isPm = value.hour >= 12;
  // In 12-hour mode midnight and noon both display as 12.
  const displayHour = hourCycle === 12 ? value.hour % 12 || 12 : value.hour;

  /** Maps a typed 12-hour reading back onto the 24-hour value. */
  const setTypedHour = (typed: number) => {
    if (hourCycle === 24) return emit({ hour: wrap(typed, 24) });
    const base = typed % 12;
    emit({ hour: isPm ? base + 12 : base });
  };

  return (
    <div className={className ? `doran-time ${className}` : 'doran-time'} dir="ltr">
      <Field
        label={labels.hour}
        increase={labels.increase}
        decrease={labels.decrease}
        display={num(displayHour)}
        value={value.hour}
        max={23}
        {...(readOnly ? { readOnly } : {})}
        onStep={(delta) => emit({ hour: wrap(value.hour + delta * hourStep, 24) })}
        onSet={(n) => emit({ hour: n })}
        onType={setTypedHour}
        typedMax={hourCycle === 12 ? 12 : 23}
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
        {...(readOnly ? { readOnly } : {})}
        onStep={(delta) => emit({ minute: wrap(value.minute + delta * minuteStep, 60) })}
        onSet={(n) => emit({ minute: n })}
        onType={(n) => emit({ minute: n })}
        typedMax={59}
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
            {...(readOnly ? { readOnly } : {})}
            onStep={(delta) => emit({ second: wrap(second + delta * secondStep, 60) })}
            onSet={(n) => emit({ second: n })}
            onType={(n) => emit({ second: n })}
            typedMax={59}
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
          onClick={() => emit({ hour: wrap(value.hour + (isPm ? -12 : 12), 24) })}
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
  readOnly?: boolean;
  onStep: (delta: number) => void;
  /** Jumps straight to a value, for Home and End. */
  onSet: (value: number) => void;
  /** Commits a typed reading, which in 12-hour mode is not the stored value. */
  onType: (value: number) => void;
  /** Largest value the field accepts as typed input. */
  typedMax: number;
}

function Field({
  label,
  increase,
  decrease,
  display,
  value,
  max,
  readOnly,
  onStep,
  onSet,
  onType,
  typedMax,
}: FieldProps) {
  // Keeps whatever is being typed. Committing on every keystroke would fight the
  // user halfway through "15", when the field briefly reads "1".
  const [text, setText] = useState(display);
  const [typing, setTyping] = useState(false);

  useEffect(() => {
    if (!typing) setText(display);
  }, [display, typing]);

  function handleInput(event: ChangeEvent<HTMLInputElement>) {
    const raw = event.target.value;
    setTyping(true);
    setText(raw);

    // Accept Persian and Arabic numerals, which is what a Persian keyboard produces.
    const digits = normalizeDigits(raw).replace(/\D/g, '');
    if (digits === '') return;

    const parsed = Number(digits);
    if (Number.isFinite(parsed) && parsed <= typedMax) onType(parsed);
  }

  function handleBlur() {
    // Whatever was typed either committed already or was out of range; either way the
    // field settles back to the real value rather than keeping a dead-end string.
    setTyping(false);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    switch (event.key) {
      case 'ArrowUp':
        onStep(1);
        break;
      case 'ArrowDown':
        onStep(-1);
        break;
      case 'PageUp':
        onStep(PAGE_MULTIPLIER);
        break;
      case 'PageDown':
        onStep(-PAGE_MULTIPLIER);
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
    // The steppers own these keys; let everything else reach the input.
    event.preventDefault();
    setTyping(false);
  }

  function handleFocus(event: FocusEvent<HTMLInputElement>) {
    // Selecting on focus means typing replaces the value rather than appending to it.
    event.target.select();
  }

  return (
    <div className="doran-time__field">
      <button
        type="button"
        className="doran-time__btn"
        aria-label={`${increase} ${label}`}
        // The field beside it is the keyboard route; a tab stop per chevron would put
        // six extra stops between the grid and the footer.
        tabIndex={-1}
        onClick={() => onStep(1)}
      >
        <ChevronUpIcon />
      </button>
      <input
        type="text"
        className="doran-time__value"
        inputMode="numeric"
        autoComplete="off"
        // A spinbutton that also accepts typing: the arrows step it, the keyboard
        // fills it, and assistive technology gets the range either way.
        role="spinbutton"
        aria-label={label}
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuetext={display}
        value={text}
        readOnly={readOnly}
        onChange={handleInput}
        onBlur={handleBlur}
        onFocus={handleFocus}
        onKeyDown={handleKeyDown}
      />
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
