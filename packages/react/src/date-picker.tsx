'use client';

import {
  applyFormatMask,
  formatValue,
  parseJalali,
  resolveCalendarLabels,
  toDoranDate,
  type DateInput,
  type DoranDate,
  type FormattedValue,
  type Locale,
  type ValueFormat,
} from '@doranjs/core';
import { useDirection, useResolvedLocale } from './provider';
import { CalendarIcon, cn } from '@doranjs/ui';
import {
  forwardRef,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ChangeEvent,
  type CSSProperties,
  type FocusEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactElement,
  type ReactNode,
  type Ref,
} from 'react';
import { createPortal } from 'react-dom';
import { DoranCalendar, type CalendarFooterAction, type DoranCalendarProps } from './calendar';
import { usePopoverPosition } from './use-popover-position';
import { usePresentation, type PickerMode } from './use-presentation';

export interface DoranDatePickerProps<F extends ValueFormat = 'doran'> extends Pick<
  DoranCalendarProps,
  | 'headerMode'
  | 'withTime'
  | 'hourStep'
  | 'minuteStep'
  | 'withSeconds'
  | 'secondStep'
  | 'hourCycle'
  | 'defaultTime'
  | 'isHoliday'
  | 'weekends'
  | 'arrows'
  | 'showOutsideDays'
  | 'hideFooter'
  | 'dayContent'
  | 'dayProps'
  | 'dayData'
  | 'slots'
  | 'disabledDates'
> {
  /**
   * Controlled value. Accepts a `DoranDate`, a native `Date`, epoch milliseconds,
   * or a string — Jalali (`'1404/05/12'`) or Gregorian (`'2025-08-03'`), in Latin
   * or Persian digits.
   */
  value?: DateInput | null;
  /** Initial value (uncontrolled). Accepts the same loose forms as `value`. */
  defaultValue?: DateInput | null;
  /**
   * What `onChange` hands back: a `DoranDate` (the default), a native `Date`, a
   * Gregorian ISO string, or any Jalali format pattern.
   *
   * ```tsx
   * <DoranDatePicker valueFormat="YYYY-MM-DD" onChange={setQueryParam} />
   * ```
   *
   * Pattern output uses Latin digits, since it is bound for a query string or an
   * API rather than the screen.
   */
  valueFormat?: F;
  /**
   * Called when the user selects or clears a date. Both arguments are `null`
   * after Clear; the second always carries the instant as a native `Date` for
   * backends that expect Gregorian, whatever `valueFormat` says.
   */
  onChange?: (value: FormattedValue<F> | null, gregorian: Date | null) => void;
  /** Formatting locale. Falls back to the global default set by `setDefaultLocale()`. */
  locale?: Locale;
  /**
   * Format pattern for the input display. Defaults to `YYYY/MM/DD` (`+ HH:mm` with
   * time). Typed digits are masked into this shape as they are entered — typing
   * `14020512` shows `1402/05/12` — and the text is parsed back against it, so a
   * custom pattern like `MM-DD-YYYY` accepts `05-12-1402`-style input.
   */
  format?: string;
  placeholder?: string;
  /** Earliest selectable date. Accepts the same loose forms as `value`. */
  min?: DateInput;
  /** Latest selectable date. Accepts the same loose forms as `value`. */
  max?: DateInput;
  disabled?: boolean;
  className?: string;
  /** Inline styles forwarded to the root element. */
  style?: CSSProperties;
  /** `id` forwarded to the root element. */
  id?: string;
  /** Preset height — `sm` 32 px · `md` 40 px (default) · `lg` 48 px. */
  size?: 'sm' | 'md' | 'lg';
  /**
   * The trigger icon. Defaults to the built-in calendar icon; pass any node to
   * replace it, or `null` to render no icon at all.
   */
  icon?: ReactNode | null;
  /** Ordered calendar footer actions. Defaults to `['today']`; pass `[]` to hide it. */
  footerActions?: readonly CalendarFooterAction[];
  /** Visual icon position. Defaults to `left`, preserving the existing RTL layout. */
  iconPosition?: 'left' | 'right';
  /** Trigger text alignment. Defaults to `right`. */
  textAlign?: 'left' | 'right';
  /**
   * Accessible name for the trigger. Without one it announces only the formatted
   * value — "۱۴۰۵/۰۳/۱۵, button" — with nothing saying it opens a date picker.
   * Defaults to the placeholder, which is usually the right description.
   */
  'aria-label'?: string;
  /** `id` of an element labelling the trigger, e.g. your own `<label>`. */
  'aria-labelledby'?: string;
  /** `id` of an element describing the field — a hint or an error message. */
  'aria-describedby'?: string;
  /** Form field name. Required for the value to take part in native form submission. */
  name?: string;
  /** Marks the field required, for native validation and assistive technology. */
  required?: boolean;
  /**
   * Stops the user typing a date while leaving the calendar usable. Reach for this
   * when a date must come from the grid — the input remains focusable and readable.
   */
  readOnly?: boolean;
  /**
   * Marks the field invalid: sets `aria-invalid` and a `data-invalid` styling hook.
   * The picker sets this on its own when the typed text can't be parsed, so pass it
   * only for validation your own code performs.
   */
  invalid?: boolean;
  /** Fires when focus leaves the field. Pair with `react-hook-form`'s `onBlur`. */
  onBlur?: (event: FocusEvent<HTMLInputElement>) => void;
  onFocus?: (event: FocusEvent<HTMLInputElement>) => void;
  /**
   * Called when the typed text cannot be parsed, or becomes parseable again.
   * The text is kept either way — silently discarding what someone typed is worse
   * than showing it as invalid.
   */
  onParseError?: (text: string) => void;
  /**
   * Class names for individual parts, for when `className` on the root can't reach
   * what you need to style.
   *
   * ```tsx
   * <DoranDatePicker classNames={{ trigger: 'h-9', popover: 'shadow-xl' }} />
   * ```
   */
  classNames?: DatePickerClassNames;
  /**
   * Where the pop-over is portaled. Defaults to `document.body`.
   *
   * Pass the dialog's own element when the picker lives inside a focus-trapping
   * dialog (shadcn, Radix, Headless UI) — a body-level pop-over sits outside the
   * trap, so the trap pulls focus straight back out of the calendar.
   */
  portalContainer?: HTMLElement | null;
  /** Writing direction. Defaults to the locale's. */
  dir?: 'rtl' | 'ltr';
  /**
   * How the calendar is presented: anchored to the trigger (`popover`, the default),
   * as a bottom sheet (`sheet`), or `auto` to switch to a sheet on narrow viewports.
   */
  mode?: PickerMode;
  /** Explicit trigger width. Numeric values are interpreted as pixels. */
  inputWidth?: CSSProperties['width'];
  /**
   * Popover width: intrinsic (`auto`), equal to the trigger (`trigger`), or a
   * custom CSS width. Numeric custom widths are interpreted as pixels.
   */
  dropdownWidth?: 'auto' | 'trigger' | CSSProperties['width'];
}

/**
 * A date input with a pop-over {@link DoranCalendar}. Controlled or uncontrolled,
 * accessible, and closes on outside-click or `Escape`. Supports an optional time
 * picker via `withTime`.
 */
/** Per-part class names, merged with Doran's own rather than replacing them. */
export interface DatePickerClassNames {
  /** The outermost element. Same target as the plain `className` prop. */
  root?: string;
  /** The bordered field wrapping the text input and the calendar icon. */
  trigger?: string;
  /** The bare `<input>` inside the field. */
  input?: string;
  /** The calendar icon button. */
  icon?: string;
  /** The portaled pop-over that holds the calendar. */
  popover?: string;
  /** The calendar itself, inside the pop-over. */
  calendar?: string;
}

const SIZE_HEIGHT: Record<'sm' | 'md' | 'lg', string> = {
  sm: '32px',
  md: '40px',
  lg: '48px',
};

function normalizeWidth(width: CSSProperties['width']): CSSProperties['width'] {
  return typeof width === 'number' ? `${width}px` : width;
}

const DatePickerImpl = forwardRef<HTMLInputElement, DoranDatePickerProps<ValueFormat>>(
  function DoranDatePicker(
    {
      value,
      defaultValue,
      valueFormat,
      onChange,
      locale: localeProp,
      format,
      placeholder,
      min,
      max,
      disabled,
      className,
      style,
      id,
      size,
      icon,
      footerActions,
      hideFooter,
      iconPosition = 'left',
      textAlign = 'right',
      'aria-label': ariaLabel,
      'aria-labelledby': ariaLabelledBy,
      'aria-describedby': ariaDescribedBy,
      name,
      required,
      readOnly,
      invalid,
      onBlur,
      onFocus,
      onParseError,
      classNames,
      portalContainer,
      dir,
      mode = 'popover',
      inputWidth,
      dropdownWidth = 'auto',
      withTime,
      headerMode,
      hourStep,
      minuteStep,
      withSeconds,
      secondStep,
      hourCycle,
      defaultTime,
      isHoliday,
      dayContent,
      dayProps,
      dayData,
      slots,
      disabledDates,
      weekends,
      arrows,
      showOutsideDays,
    }: DoranDatePickerProps<ValueFormat>,
    forwardedRef,
  ) {
    const locale = useResolvedLocale(localeProp);
    const direction = useDirection(locale, dir);
    const presentation = usePresentation(mode);
    const labels = resolveCalendarLabels(locale);
    const resolvedPlaceholder = placeholder ?? labels.datePlaceholder;
    const isControlled = value !== undefined;
    // Loose input is coerced once, at the edge, so the rest of the component only
    // ever deals in DoranDate.
    const [internal, setInternal] = useState<DoranDate | null>(() => toDoranDate(defaultValue));
    const selected = isControlled ? toDoranDate(value) : internal;
    const minDate = toDoranDate(min);
    const maxDate = toDoranDate(max);

    const resolvedFormat = format ?? (withTime ? 'YYYY/MM/DD HH:mm' : 'YYYY/MM/DD');

    const [open, setOpen] = useState(false);
    const rootRef = useRef<HTMLDivElement>(null);
    // The bordered field, not the root: `dropdownWidth="trigger"` should match what
    // the user sees, and a consumer's padding on the root would skew that.
    const fieldRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement | null>(null);
    const popoverRef = useRef<HTMLDivElement>(null);
    const popoverId = useId();
    const matchesTriggerWidth = dropdownWidth === 'trigger';
    const customDropdownWidth =
      dropdownWidth !== 'auto' && dropdownWidth !== 'trigger'
        ? normalizeWidth(dropdownWidth)
        : undefined;
    const normalizedInputWidth = normalizeWidth(inputWidth);
    // The popover is portaled to <body> and positioned `fixed` from the trigger
    // rect, so it can never be clipped by an overflow ancestor (cards, modals, …).
    const popoverPosition = usePopoverPosition(
      open && presentation === 'popover',
      fieldRef,
      popoverRef,
      {
        matchTriggerWidth: matchesTriggerWidth,
      },
    );

    const valueText = selected ? selected.withLocale(locale).format(resolvedFormat) : '';

    // What the input shows. It tracks the selected value, except while the user is
    // mid-edit — overwriting someone's half-typed date on every keystroke would make
    // the field unusable.
    const [text, setText] = useState(valueText);
    const [typing, setTyping] = useState(false);
    const [unparseable, setUnparseable] = useState(false);

    useEffect(() => {
      if (!typing) setText(valueText);
    }, [valueText, typing]);

    // Where the caret belongs after the mask rewrites the text; applied once React
    // commits the new value, since a controlled input drops the caret on re-render.
    const pendingCaret = useRef<number | null>(null);
    useLayoutEffect(() => {
      const node = inputRef.current;
      if (pendingCaret.current !== null && node && document.activeElement === node) {
        node.setSelectionRange(pendingCaret.current, pendingCaret.current);
      }
      pendingCaret.current = null;
    }, [text]);

    /** Keeps the internal ref working while still honouring a forwarded one. */
    function setInputRef(node: HTMLInputElement | null) {
      inputRef.current = node;
      if (typeof forwardedRef === 'function') forwardedRef(node);
      else if (forwardedRef) forwardedRef.current = node;
    }

    /** Close the popover, optionally returning focus to the input. */
    function close(restoreFocus: boolean) {
      setOpen(false);
      if (restoreFocus) inputRef.current?.focus();
    }

    function commit(date: DoranDate | null) {
      if (!isControlled) setInternal(date);
      onChange?.(formatValue(date, valueFormat ?? 'doran'), date?.toGregorian() ?? null);
    }

    /** Whether a parsed date is inside `min`/`max`. */
    function withinBounds(date: DoranDate): boolean {
      if (minDate && date.isBefore(minDate.startOf('day'))) return false;
      if (maxDate && date.isAfter(maxDate.endOf('day'))) return false;
      return true;
    }

    function markUnparseable(next: boolean, raw: string) {
      setUnparseable((prev) => {
        if (prev !== next) onParseError?.(next ? raw : '');
        return next;
      });
    }

    /** Parses `raw`, returning the date only if it is complete and in range. */
    function readDate(raw: string): DoranDate | null {
      // The developer's format wins so `format="MM-DD-YYYY"` parses what it displays;
      // the common defaults stay as a fallback so loose input keeps working.
      const parsed =
        parseJalali(raw, resolvedFormat, { locale }) ?? parseJalali(raw, undefined, { locale });
      if (!parsed || !withinBounds(parsed)) return null;
      return withTime ? parsed : parsed.startOf('day');
    }

    /**
     * Parses on every keystroke so the calendar follows along, and commits as soon as
     * the text is a complete, in-range date.
     *
     * Crucially this never *raises* the invalid flag: en route to `1402/05/12` the
     * field passes through `1`, `14`, `140`… and flagging each of those would mean
     * the input is red the entire time it is being used. Errors surface on blur.
     */
    function handleInput(event: ChangeEvent<HTMLInputElement>) {
      const raw = event.target.value;
      // Flow typed digits into the developer's format as they go — `14020512` becomes
      // `1402/05/12` without the user typing separators.
      const masked = applyFormatMask(raw, resolvedFormat, {
        locale,
        caret: event.target.selectionStart ?? raw.length,
        previous: text,
      });
      setTyping(true);
      if (masked.text !== raw) {
        // Write through to the DOM as well as to state: when the mask swallows a
        // keystroke the new state equals the old one, React skips the re-render, and
        // the field would otherwise be left showing the unmasked text.
        event.target.value = masked.text;
        event.target.setSelectionRange(masked.caret, masked.caret);
        pendingCaret.current = masked.caret;
      }
      setText(masked.text);

      if (masked.text.trim() === '') {
        markUnparseable(false, masked.text);
        commit(null);
        return;
      }

      const parsed = readDate(masked.text);
      if (parsed) {
        markUnparseable(false, masked.text);
        commit(parsed);
      }
    }

    /**
     * Blur is where the field settles: text that parsed is normalized to the display
     * format, and text that didn't is left exactly as typed and marked invalid — so
     * the user can see and fix their input rather than watch it vanish.
     */
    function handleBlur(event: FocusEvent<HTMLInputElement>) {
      const raw = text.trim();

      if (raw === '' || readDate(text)) {
        markUnparseable(false, text);
        // Releasing ownership lets the value re-format through the sync effect.
        setTyping(false);
      } else {
        markUnparseable(true, text);
        // Stay "typing" so the effect can't overwrite what they still need to fix.
      }

      onBlur?.(event);
    }

    function handleTriggerKeyDown(event: ReactKeyboardEvent<HTMLInputElement>) {
      if (event.key === 'ArrowDown' && !open) {
        // The conventional way to reach a picker's calendar from its input.
        event.preventDefault();
        setOpen(true);
      } else if (event.key === 'Enter' && open) {
        event.preventDefault();
        close(true);
      }
    }

    useEffect(() => {
      if (!open) return;
      function onPointerDown(event: PointerEvent) {
        const target = event.target as Node;
        // The popover lives in a body portal, so check both trees.
        if (!rootRef.current?.contains(target) && !popoverRef.current?.contains(target)) {
          setOpen(false);
        }
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

    // The calendar no longer steals focus on open: the trigger is a text field now, and
    // yanking the caret out of it mid-typing would make the input unusable. Keyboard
    // users reach the grid by tabbing forward, which is one keystroke and predictable.

    /**
     * Tabbing past either end of the pop-over closes it and moves on.
     *
     * The pop-over is `aria-modal="false"`, which promises assistive technology that
     * the rest of the page is still reachable. A focus trap broke that promise: the
     * keyboard could never leave. Instead the pop-over behaves like the non-modal
     * dialog it claims to be — Tab exits forwards, Shift+Tab exits backwards to the
     * trigger, and Escape still closes and restores focus.
     */
    function onPopoverKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
      if (event.key !== 'Tab') return;
      const focusable = popoverRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable || focusable.length === 0) return;

      const first = focusable[0]!;
      const last = focusable[focusable.length - 1]!;
      const active = document.activeElement;

      if (event.shiftKey && active === first) {
        // Backwards out of the pop-over lands on the trigger, where Tab began.
        event.preventDefault();
        close(true);
      } else if (!event.shiftKey && active === last) {
        // Forwards out continues into the page; let the browser pick the next stop.
        close(false);
      }
    }

    /** A pick from the calendar grid, as opposed to typed text. */
    function handleChange(date: DoranDate | null) {
      setTyping(false);
      markUnparseable(false, '');
      commit(date);
      // Keep the popover open while adjusting time; close on a plain date pick.
      if (date === null || !withTime) close(true);
    }

    const sizeStyle = size
      ? ({ '--doran-input-height': SIZE_HEIGHT[size] } as CSSProperties)
      : undefined;
    const inputWidthStyle =
      normalizedInputWidth !== undefined
        ? ({ '--doran-input-width': normalizedInputWidth } as CSSProperties)
        : undefined;
    const rootStyle =
      sizeStyle || inputWidthStyle || style
        ? ({ ...sizeStyle, ...inputWidthStyle, ...style } as CSSProperties)
        : undefined;
    // Unlike a button, an input's value is announced separately from its name — so
    // naming the field costs nothing here, and the placeholder is the best default.
    // Prefer a real <label> via `aria-labelledby` where you have one.
    const fieldLabel = ariaLabel ?? resolvedPlaceholder;
    // `doran` can't cross a form boundary, so a named picker defaults to an
    // unambiguous Latin-digit Jalali date rather than what the field displays.
    const submitted = formatValue(
      selected,
      !valueFormat || valueFormat === 'doran' ? 'YYYY-MM-DD' : valueFormat,
    );
    const submitValue =
      submitted instanceof Date ? submitted.toISOString() : ((submitted as string | null) ?? '');
    const openLabel = ariaLabel ? `${ariaLabel} — ${labels.calendar}` : labels.openCalendar;
    const isInvalid = invalid === true || unparseable;

    const dropdownWidthMode =
      dropdownWidth === 'auto' || dropdownWidth === 'trigger' ? dropdownWidth : 'custom';
    const resolvedPopoverStyle = popoverPosition
      ? {
          ...popoverPosition,
          ...(customDropdownWidth !== undefined ? { width: customDropdownWidth } : {}),
        }
      : {
          visibility: 'hidden' as const,
          ...(customDropdownWidth !== undefined ? { width: customDropdownWidth } : {}),
        };

    return (
      <div
        ref={rootRef}
        id={id}
        className={cn('doran-datepicker', classNames?.root, className)}
        style={rootStyle}
        data-icon-position={iconPosition}
        data-text-align={textAlign}
        data-dropdown-width={dropdownWidthMode}
        dir={direction}
      >
        <div
          ref={fieldRef}
          className={cn('doran-datepicker__input', classNames?.trigger)}
          style={{
            flexDirection: iconPosition === 'left' ? 'row' : 'row-reverse',
            ...(normalizedInputWidth !== undefined ? { width: normalizedInputWidth } : {}),
          }}
          data-icon-position={iconPosition}
          data-text-align={textAlign}
          {...(disabled ? { 'data-disabled': 'true' } : {})}
          {...(isInvalid ? { 'data-invalid': 'true' } : {})}
        >
          {/* dir="auto": digit-only values (e.g. `YYYY-MM-DD HH:mm`) resolve LTR so
            the surrounding RTL context can't reorder the date/time runs, while
            Persian placeholders and month-name formats still resolve RTL. */}
          <input
            ref={setInputRef}
            type="text"
            // Persian date entry is digits and separators; this brings up the right
            // phone keyboard without rejecting a pasted month name.
            inputMode="numeric"
            autoComplete="off"
            dir="auto"
            // `doran-datepicker__value` is kept as an alias: it named the text span
            // this input replaced, so stylesheets written against the old markup keep
            // applying rather than silently losing their rules.
            className={cn(
              'doran-datepicker__control',
              'doran-datepicker__value',
              classNames?.input,
            )}
            style={{ flex: 1, textAlign }}
            value={text}
            placeholder={resolvedPlaceholder}
            disabled={disabled}
            readOnly={readOnly}
            required={required}
            aria-haspopup="dialog"
            aria-expanded={open}
            aria-controls={open ? popoverId : undefined}
            aria-invalid={isInvalid || undefined}
            {...(ariaDescribedBy ? { 'aria-describedby': ariaDescribedBy } : {})}
            {...(ariaLabelledBy
              ? { 'aria-labelledby': ariaLabelledBy }
              : { 'aria-label': fieldLabel })}
            onChange={handleInput}
            onBlur={handleBlur}
            {...(onFocus ? { onFocus } : {})}
            onKeyDown={handleTriggerKeyDown}
          />
          {/* Native submission needs a machine-readable value, not the Persian-digit
              text on screen. The visible field stays unnamed so only this submits. */}
          {name && <input type="hidden" name={name} value={submitValue} />}
          {icon !== null && (
            <button
              type="button"
              className={cn('doran-datepicker__icon', classNames?.icon)}
              // The input owns typing, so the calendar needs its own control — this is
              // also the only pointer-free way to open it besides ArrowDown.
              aria-label={openLabel}
              aria-haspopup="dialog"
              aria-expanded={open}
              aria-controls={open ? popoverId : undefined}
              disabled={disabled}
              tabIndex={-1}
              onClick={() => setOpen((o) => !o)}
            >
              {icon ?? <CalendarIcon />}
            </button>
          )}
        </div>

        {open &&
          createPortal(
            <div
              ref={popoverRef}
              id={popoverId}
              role="dialog"
              aria-modal="false"
              aria-label={labels.calendar}
              dir={direction}
              className={cn(
                'doran-datepicker__popover',
                `doran-datepicker__popover--${dropdownWidthMode}`,
                presentation === 'sheet' && 'doran-datepicker__popover--sheet',
                classNames?.popover,
              )}
              data-dropdown-width={dropdownWidthMode}
              data-presentation={presentation}
              style={presentation === 'sheet' ? undefined : resolvedPopoverStyle}
              onKeyDown={onPopoverKeyDown}
            >
              <DoranCalendar
                locale={locale}
                value={selected}
                onChange={handleChange}
                {...(classNames?.calendar ? { className: classNames.calendar } : {})}
                {...(footerActions ? { footerActions } : {})}
                {...(hideFooter !== undefined ? { hideFooter } : {})}
                {...(minDate ? { min: minDate } : {})}
                {...(maxDate ? { max: maxDate } : {})}
                {...(withTime ? { withTime } : {})}
                {...(headerMode ? { headerMode } : {})}
                {...(hourStep !== undefined ? { hourStep } : {})}
                {...(minuteStep !== undefined ? { minuteStep } : {})}
                {...(withSeconds !== undefined ? { withSeconds } : {})}
                {...(secondStep !== undefined ? { secondStep } : {})}
                {...(hourCycle !== undefined ? { hourCycle } : {})}
                {...(defaultTime ? { defaultTime } : {})}
                {...(isHoliday ? { isHoliday } : {})}
                {...(dayContent ? { dayContent } : {})}
                {...(dayProps ? { dayProps } : {})}
                {...(dayData ? { dayData } : {})}
                {...(slots ? { slots } : {})}
                {...(disabledDates ? { disabledDates } : {})}
                {...(weekends ? { weekends } : {})}
                {...(arrows ? { arrows } : {})}
                {...(showOutsideDays !== undefined ? { showOutsideDays } : {})}
                {...(selected
                  ? { defaultMonth: { year: selected.year, month: selected.month } }
                  : {})}
              />
            </div>,
            portalContainer ?? document.body,
          )}
      </div>
    );
  },
);

/**
 * A date input with a pop-over {@link DoranCalendar}. Type a date or pick one —
 * `1402/5/12`, `1402-5-12`, and `۱۴۰۲/۰۵/۱۲` all parse. Controlled or uncontrolled,
 * form-associable via `name` and a forwarded ref, and closes on outside-click or
 * `Escape`.
 *
 * The cast preserves the `valueFormat` generic through `forwardRef`, so
 * `valueFormat="YYYY-MM-DD"` types `onChange` as receiving a string.
 */
export const DoranDatePicker = DatePickerImpl as <F extends ValueFormat = 'doran'>(
  props: DoranDatePickerProps<F> & { ref?: Ref<HTMLInputElement> },
) => ReactElement;
