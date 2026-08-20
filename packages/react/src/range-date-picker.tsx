'use client';

import {
  applyFormatMask,
  formatValue,
  parseJalali,
  resolveCalendarLabels,
  toDoranDate,
  type DateInput,
  type DoranDate,
  type Locale,
} from '@doranjs/core';
import { CalendarIcon, cn } from '@doranjs/ui';
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ChangeEvent,
  type CSSProperties,
  type FocusEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { useDirection, useResolvedLocale } from './provider';
import { DoranRangePicker, type DoranRangePickerProps } from './range-picker';
import { usePopover } from './use-popover';
import { isCoarsePointer, usePresentation, type PickerMode } from './use-presentation';
import type { DateRange, GregorianDateRange } from './hooks';

/** Which end of the range the user is editing. */
type Endpoint = 'start' | 'end';

/** A loosely-typed range, matching what `value` accepts. */
export interface DateInputRange {
  start?: DateInput | null;
  end?: DateInput | null;
}

export interface DoranRangeDatePickerProps extends Pick<
  DoranRangePickerProps,
  | 'headerMode'
  | 'isHoliday'
  | 'weekends'
  | 'arrows'
  | 'yearSpan'
  | 'presets'
  | 'numberOfMonths'
  | 'dayContent'
  | 'dayProps'
  | 'dayData'
  | 'disabledDates'
  | 'slots'
> {
  /** Controlled range. Each end accepts the same loose forms as `DoranDatePicker`. */
  value?: DateInputRange | null;
  /** Initial range (uncontrolled). */
  defaultValue?: DateInputRange | null;
  /**
   * Called whenever either end changes. The second argument carries the same range as
   * native `Date`s, for backends that expect Gregorian.
   */
  onChange?: (range: DateRange, gregorian: GregorianDateRange) => void;
  locale?: Locale;
  /**
   * Display format for both fields. Defaults to `YYYY/MM/DD`. Typed digits are
   * masked into this shape as they are entered, and parsed back against it.
   */
  format?: string;
  /** Placeholders, defaulting to the locale's. */
  startPlaceholder?: string;
  endPlaceholder?: string;
  /** Earliest and latest selectable dates. */
  min?: DateInput;
  max?: DateInput;
  disabled?: boolean;
  /** Stops typing while leaving the calendar usable. */
  readOnly?: boolean;
  /** Names for native form submission — a hidden field is emitted for each end. */
  startName?: string;
  endName?: string;
  /** Writing direction. Defaults to the locale's. */
  dir?: 'rtl' | 'ltr';
  className?: string;
  style?: CSSProperties;
  id?: string;
  /** The trigger icon; `null` renders none. */
  icon?: ReactNode | null;
  /** Explicit trigger width. Numeric values are pixels. */
  inputWidth?: CSSProperties['width'];
  /** Where the pop-over is portaled. Defaults to `document.body`. */
  portalContainer?: HTMLElement | null;
  /**
   * How the calendar is presented: anchored to the trigger (`popover`), as a bottom
   * sheet (`sheet`), or `auto` — the default — which switches to a sheet under 640px.
   *
   * A range picker is the widest thing this library renders; anchored to a field on a
   * phone it runs off the bottom of the screen with no way to scroll it.
   */
  mode?: PickerMode;
}

function normalizeWidth(width: CSSProperties['width']): CSSProperties['width'] {
  return typeof width === 'number' ? `${width}px` : width;
}

/**
 * A date-range input with a pop-over {@link DoranRangePicker}: one trigger holding
 * two fields, either of which can be typed into or filled from the grid.
 *
 * Both ends are kept in order — picking or typing an end before the start swaps them
 * rather than producing a backwards range, which nothing previously checked.
 */
export function DoranRangeDatePicker({
  value,
  defaultValue,
  onChange,
  locale: localeProp,
  format = 'YYYY/MM/DD',
  startPlaceholder,
  endPlaceholder,
  min,
  max,
  disabled,
  readOnly,
  startName,
  endName,
  dir,
  className,
  style,
  id,
  icon,
  inputWidth,
  portalContainer,
  mode = 'auto',
  ...rangeProps
}: DoranRangeDatePickerProps) {
  const locale = useResolvedLocale(localeProp);
  const direction = useDirection(locale, dir);
  const labels = resolveCalendarLabels(locale);

  const isControlled = value !== undefined;
  const coerce = (input: DateInputRange | null | undefined): DateRange => ({
    start: toDoranDate(input?.start),
    end: toDoranDate(input?.end),
  });

  const [internal, setInternal] = useState<DateRange>(() => coerce(defaultValue));
  const range = isControlled ? coerce(value) : internal;

  const minDate = toDoranDate(min);
  const maxDate = toDoranDate(max);

  /** Which field the next grid click fills. */
  const [editing, setEditing] = useState<Endpoint>('start');

  const startRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLInputElement>(null);

  const presentation = usePresentation(mode);
  const popover = usePopover({
    positioned: presentation !== 'sheet',
    onClose: (restoreFocus) => {
      if (restoreFocus) (editing === 'end' ? endRef : startRef).current?.focus();
    },
  });

  const text = (date: DoranDate | null) => (date ? date.withLocale(locale).format(format) : '');
  const [startText, setStartText] = useState(text(range.start));
  const [endText, setEndText] = useState(text(range.end));
  const [typing, setTyping] = useState<Endpoint | null>(null);

  // Track the value except while that field is being edited, so a half-typed date
  // is never overwritten mid-keystroke.
  useEffect(() => {
    if (typing !== 'start') setStartText(text(range.start));
    if (typing !== 'end') setEndText(text(range.end));
    // Intentionally not depending on `text`: it closes over the same locale and
    // format already listed, and adding it would re-run on every render.
  }, [range.start, range.end, typing, format, locale]);

  // Where the caret belongs after the mask rewrites a field; applied once React
  // commits the new value, since a controlled input drops the caret on re-render.
  const pendingCaret = useRef<{ endpoint: Endpoint; caret: number } | null>(null);
  useLayoutEffect(() => {
    const pending = pendingCaret.current;
    pendingCaret.current = null;
    if (!pending) return;
    const node = pending.endpoint === 'start' ? startRef.current : endRef.current;
    if (node && document.activeElement === node) {
      node.setSelectionRange(pending.caret, pending.caret);
    }
  }, [startText, endText]);

  function withinBounds(date: DoranDate): boolean {
    if (minDate && date.isBefore(minDate.startOf('day'))) return false;
    if (maxDate && date.isAfter(maxDate.endOf('day'))) return false;
    return true;
  }

  /**
   * Commits a range, keeping the ends in order. A backwards range is a slip, not an
   * instruction — swapping is what the user meant.
   */
  function commit(next: DateRange) {
    const ordered =
      next.start && next.end && next.end.isBefore(next.start)
        ? { start: next.end, end: next.start }
        : next;

    if (!isControlled) setInternal(ordered);
    onChange?.(ordered, {
      start: ordered.start?.toGregorian() ?? null,
      end: ordered.end?.toGregorian() ?? null,
    });
  }

  function handleInput(endpoint: Endpoint, event: ChangeEvent<HTMLInputElement>) {
    const raw = event.target.value;
    // Flow typed digits into the configured format as they go.
    const masked = applyFormatMask(raw, format, {
      locale,
      caret: event.target.selectionStart ?? raw.length,
      previous: endpoint === 'start' ? startText : endText,
    });
    setTyping(endpoint);
    if (masked.text !== raw) {
      // Write through to the DOM as well as to state: when the mask swallows a
      // keystroke the new state equals the old one, React skips the re-render, and
      // the field would otherwise be left showing the unmasked text.
      event.target.value = masked.text;
      event.target.setSelectionRange(masked.caret, masked.caret);
      pendingCaret.current = { endpoint, caret: masked.caret };
    }
    if (endpoint === 'start') setStartText(masked.text);
    else setEndText(masked.text);

    if (masked.text.trim() === '') {
      commit({ ...range, [endpoint]: null });
      return;
    }

    // The developer's format wins so the field parses what it displays; the common
    // defaults stay as a fallback so loose input keeps working.
    const parsed =
      parseJalali(masked.text, format, { locale }) ??
      parseJalali(masked.text, undefined, { locale });
    if (parsed && withinBounds(parsed)) {
      commit({ ...range, [endpoint]: parsed.startOf('day') });
    }
  }

  function handleFocus(endpoint: Endpoint) {
    setEditing(endpoint);
    if (!readOnly) popover.setOpen(true);
  }

  function handleBlur(event: FocusEvent<HTMLInputElement>) {
    // Only settle when focus has genuinely left the widget, so moving between the
    // two fields doesn't reformat under the caret.
    if (popover.rootRef.current?.contains(event.relatedTarget as Node | null)) return;
    setTyping(null);
  }

  function handleKeyDown(event: ReactKeyboardEvent<HTMLInputElement>) {
    if (event.key === 'ArrowDown' && !popover.open) {
      event.preventDefault();
      popover.setOpen(true);
    } else if (event.key === 'Enter' && popover.open) {
      event.preventDefault();
      popover.close(true);
    }
  }

  /** A pick from the grid fills whichever field is being edited, then advances. */
  function handleRangeChange(next: DateRange) {
    setTyping(null);
    commit(next);
    if (next.start && next.end) popover.close(true);
    else setEditing('end');
  }

  const normalizedInputWidth = normalizeWidth(inputWidth);

  /**
   * Whether the trigger should refuse to raise an on-screen keyboard.
   *
   * This picker opens on focus, so unlike the single one it cannot simply give up the
   * caret when the calendar appears — that is the very thing that opened it. Instead
   * the field stays focusable and goes `readonly`, which is the one signal browsers
   * honour for "focus this, but do not raise a keyboard".
   *
   * Only when it is actually a sheet on an actual finger: a narrow desktop window is
   * also a sheet, and there a keyboard costs nothing and typing should still work.
   * `presentation` only becomes `sheet` after mount, so this stays false through
   * hydration and cannot mismatch the server.
   */
  const suppressKeyboard = presentation === 'sheet' && isCoarsePointer();
  const rootStyle =
    normalizedInputWidth !== undefined || style
      ? ({
          ...(normalizedInputWidth !== undefined
            ? { '--doran-input-width': normalizedInputWidth }
            : {}),
          ...style,
        } as CSSProperties)
      : undefined;

  const field = (endpoint: Endpoint) => (
    <input
      ref={endpoint === 'start' ? startRef : endRef}
      type="text"
      inputMode="numeric"
      autoComplete="off"
      dir="auto"
      className="doran-datepicker__control doran-rangetrigger__control"
      value={endpoint === 'start' ? startText : endText}
      placeholder={
        endpoint === 'start'
          ? (startPlaceholder ?? labels.datePlaceholder)
          : (endPlaceholder ?? labels.datePlaceholder)
      }
      disabled={disabled}
      // `readOnly` the prop still means what it did; `suppressKeyboard` only borrows
      // the attribute. The open-on-focus check below deliberately reads the prop, so
      // a sheet still opens when the keyboard is being suppressed.
      readOnly={readOnly || suppressKeyboard}
      aria-label={endpoint === 'start' ? labels.rangeStart : labels.rangeEnd}
      aria-haspopup="dialog"
      aria-expanded={popover.open}
      aria-controls={popover.open ? popover.popoverId : undefined}
      onChange={(event) => handleInput(endpoint, event)}
      onFocus={() => handleFocus(endpoint)}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
    />
  );

  return (
    <div
      ref={popover.rootRef}
      id={id}
      className={cn('doran-datepicker', 'doran-rangetrigger', className)}
      style={rootStyle}
      dir={direction}
    >
      <div
        ref={popover.fieldRef}
        className="doran-datepicker__input doran-rangetrigger__field"
        {...(disabled ? { 'data-disabled': 'true' } : {})}
        data-editing={editing}
      >
        {field('start')}
        <span className="doran-rangetrigger__separator" aria-hidden>
          {labels.rangeSeparator.trim() || '–'}
        </span>
        {field('end')}

        {/* Machine-readable values for native submission, as the single picker does. */}
        {startName && (
          <input
            type="hidden"
            name={startName}
            value={formatValue(range.start, 'YYYY-MM-DD') ?? ''}
          />
        )}
        {endName && (
          <input type="hidden" name={endName} value={formatValue(range.end, 'YYYY-MM-DD') ?? ''} />
        )}

        {icon !== null && (
          <button
            type="button"
            className="doran-datepicker__icon"
            aria-label={labels.openCalendar}
            aria-haspopup="dialog"
            aria-expanded={popover.open}
            disabled={disabled}
            tabIndex={-1}
            onClick={() => popover.setOpen(!popover.open)}
          >
            {icon ?? <CalendarIcon />}
          </button>
        )}
      </div>

      {popover.open &&
        createPortal(
          <div
            ref={popover.popoverRef}
            id={popover.popoverId}
            role="dialog"
            aria-modal="false"
            aria-label={labels.calendar}
            dir={direction}
            className={cn(
              'doran-datepicker__popover',
              presentation === 'sheet' && 'doran-datepicker__popover--sheet',
            )}
            data-presentation={presentation}
            // A sheet is pinned to the viewport by CSS, so measuring it against the
            // trigger would only fight the stylesheet.
            style={
              presentation === 'sheet' ? undefined : (popover.position ?? { visibility: 'hidden' })
            }
            onKeyDown={popover.onKeyDown}
          >
            <DoranRangePicker
              locale={locale}
              value={range}
              onChange={handleRangeChange}
              dir={direction}
              {...(minDate ? { min: minDate } : {})}
              {...(maxDate ? { max: maxDate } : {})}
              {...rangeProps}
            />
          </div>,
          portalContainer ?? document.body,
        )}
    </div>
  );
}
