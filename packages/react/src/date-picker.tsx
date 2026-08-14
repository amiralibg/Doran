'use client';

import { type DoranDate, type Locale } from '@doranjs/core';
import { useResolvedLocale } from './provider';
import { CalendarIcon, cn } from '@doranjs/ui';
import {
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { DoranCalendar, type CalendarFooterAction, type DoranCalendarProps } from './calendar';
import { usePopoverPosition } from './use-popover-position';

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
  | 'hideFooter'
  | 'dayContent'
  | 'dayProps'
  | 'dayData'
  | 'slots'
  | 'disabledDates'
> {
  value?: DoranDate | null;
  defaultValue?: DoranDate | null;
  /**
   * Called when the user selects or clears a date. Both arguments are `null`
   * after Clear; otherwise the second carries the same instant as a native
   * `Date` for backends that expect Gregorian.
   */
  onChange?: (date: DoranDate | null, gregorian: Date | null) => void;
  /** Formatting locale. Falls back to the global default set by `setDefaultLocale()`. */
  locale?: Locale;
  /** Format pattern for the input display. Defaults to `YYYY/MM/DD` (`+ HH:mm` with time). */
  format?: string;
  placeholder?: string;
  min?: DoranDate;
  max?: DoranDate;
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
const SIZE_HEIGHT: Record<'sm' | 'md' | 'lg', string> = {
  sm: '32px',
  md: '40px',
  lg: '48px',
};

function normalizeWidth(width: CSSProperties['width']): CSSProperties['width'] {
  return typeof width === 'number' ? `${width}px` : width;
}

export function DoranDatePicker({
  value,
  defaultValue,
  onChange,
  locale: localeProp,
  format,
  placeholder = 'انتخاب تاریخ',
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
  inputWidth,
  dropdownWidth = 'auto',
  withTime,
  headerMode,
  minuteStep,
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
}: DoranDatePickerProps) {
  const locale = useResolvedLocale(localeProp);
  const isControlled = value !== undefined;
  const [internal, setInternal] = useState<DoranDate | null>(defaultValue ?? null);
  const selected = isControlled ? (value ?? null) : internal;

  const resolvedFormat = format ?? (withTime ? 'YYYY/MM/DD HH:mm' : 'YYYY/MM/DD');

  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
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
  const popoverPosition = usePopoverPosition(open, triggerRef, popoverRef, {
    matchTriggerWidth: matchesTriggerWidth,
  });

  /** Close the popover, optionally returning focus to the trigger button. */
  function close(restoreFocus: boolean) {
    setOpen(false);
    if (restoreFocus) triggerRef.current?.focus();
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

  // On open, move focus into the calendar (the focusable day), so keyboard users land
  // directly on the grid rather than being stranded on the trigger.
  useEffect(() => {
    if (!open) return;
    const day = popoverRef.current?.querySelector<HTMLElement>('.doran-month [tabindex="0"]');
    day?.focus();
  }, [open]);

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

  function handleChange(date: DoranDate | null) {
    if (!isControlled) setInternal(date);
    onChange?.(date, date?.toGregorian() ?? null);
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
  const valueText = selected ? selected.withLocale(locale).format(resolvedFormat) : '';

  // `aria-label` replaces the button's text rather than adding to it, so naming the
  // field alone would silence the value. Compose both: the description says what the
  // control is, the value says what it currently holds.
  const describedAs = ariaLabel ?? placeholder;
  const triggerLabel = valueText ? `${describedAs}: ${valueText}` : describedAs;

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
      className={cn('doran-datepicker', className)}
      style={rootStyle}
      data-icon-position={iconPosition}
      data-text-align={textAlign}
      data-dropdown-width={dropdownWidthMode}
      dir="rtl"
    >
      <button
        ref={triggerRef}
        type="button"
        className="doran-datepicker__input"
        style={{
          flexDirection: iconPosition === 'left' ? 'row' : 'row-reverse',
          ...(normalizedInputWidth !== undefined ? { width: normalizedInputWidth } : {}),
        }}
        data-icon-position={iconPosition}
        data-text-align={textAlign}
        disabled={disabled}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? popoverId : undefined}
        {...(ariaLabelledBy
          ? { 'aria-labelledby': ariaLabelledBy }
          : { 'aria-label': triggerLabel })}
        onClick={() => setOpen((o) => !o)}
      >
        {/* dir="auto": digit-only values (e.g. `YYYY-MM-DD HH:mm`) resolve LTR so
            the surrounding RTL context can't reorder the date/time runs, while
            Persian placeholders and month-name formats still resolve RTL. */}
        <span
          dir="auto"
          className={cn('doran-datepicker__value', !selected && 'doran-datepicker__placeholder')}
          style={{ flex: 1, textAlign }}
        >
          {valueText || placeholder}
        </span>
        {icon !== null && (
          <span aria-hidden className="doran-datepicker__icon">
            {icon ?? <CalendarIcon />}
          </span>
        )}
      </button>

      {open &&
        createPortal(
          <div
            ref={popoverRef}
            id={popoverId}
            role="dialog"
            aria-modal="false"
            aria-label="تقویم"
            dir="rtl"
            className={cn(
              'doran-datepicker__popover',
              `doran-datepicker__popover--${dropdownWidthMode}`,
            )}
            data-dropdown-width={dropdownWidthMode}
            style={resolvedPopoverStyle}
            onKeyDown={onPopoverKeyDown}
          >
            <DoranCalendar
              locale={locale}
              value={selected}
              onChange={handleChange}
              {...(footerActions ? { footerActions } : {})}
              {...(hideFooter !== undefined ? { hideFooter } : {})}
              {...(min ? { min } : {})}
              {...(max ? { max } : {})}
              {...(withTime ? { withTime } : {})}
              {...(headerMode ? { headerMode } : {})}
              {...(minuteStep !== undefined ? { minuteStep } : {})}
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
          document.body,
        )}
    </div>
  );
}
