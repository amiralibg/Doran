import { type DayDataMap, type DoranDate } from '@doranjs/core';

export type FooterAction = 'today' | 'clear';
export type FooterActionsInput = readonly FooterAction[] | string;

/** The day-widget inputs every calendar-like wrapper accepts. */
export interface DayWidgetInputs {
  dayData?: DayDataMap | null;
  disabledDates?: ((day: DoranDate) => boolean) | null;
}

/**
 * Applies the day-widget inputs as element *properties*.
 *
 * A day map and a predicate cannot be stringified into attributes, so unlike every
 * other input here these are assigned directly. Call only after the custom element
 * has upgraded, or the setters won't exist yet.
 */
export function applyDayWidgets(el: HTMLElement, inputs: DayWidgetInputs): void {
  const target = el as HTMLElement & DayWidgetInputs;
  if (inputs.dayData !== undefined) target.dayData = inputs.dayData;
  if (inputs.disabledDates !== undefined) target.disabledDates = inputs.disabledDates;
}

/** Set/remove a string or numeric attribute (empty/nullish clears it). */
export function setAttr(
  el: HTMLElement,
  name: string,
  value: string | number | undefined | null,
): void {
  if (value == null || value === '') el.removeAttribute(name);
  else el.setAttribute(name, String(value));
}

/** Toggle a boolean attribute (present when `true`). */
export function setBool(el: HTMLElement, name: string, value: boolean | undefined): void {
  el.toggleAttribute(name, value === true);
}

/** Normalize action arrays while preserving an explicit empty value. */
export function setFooterActions(el: HTMLElement, value: FooterActionsInput | undefined): void {
  if (value === undefined) el.removeAttribute('footer-actions');
  else el.setAttribute('footer-actions', typeof value === 'string' ? value : value.join(','));
}

/** Normalize a date bound into the WC's ASCII Jalali attribute format. */
function dateAttr(value: DoranDate | string | undefined): string | undefined {
  if (value === undefined || typeof value === 'string') return value;
  return `${value.year}/${String(value.month).padStart(2, '0')}/${String(value.day).padStart(2, '0')}`;
}

/** Normalize the `weekends` input (`[5, 6]` or `"5,6"`) into the attribute form. */
export function weekendsAttr(value: number[] | string | undefined): string | undefined {
  if (value == null) return undefined;
  return Array.isArray(value) ? value.join(',') : value;
}

export interface DatePickerAttributeInputs {
  placeholder?: string;
  format?: string;
  withTime?: boolean;
  footerActions?: FooterActionsInput;
  iconPosition?: 'left' | 'right';
  textAlign?: 'left' | 'right';
  inputWidth?: string;
  dropdownWidth?: 'auto' | 'trigger' | string;
  min?: DoranDate | string;
  max?: DoranDate | string;
  headerMode?: 'dropdown' | 'separate';
  showHolidays?: boolean;
  weekends?: number[] | string;
  disabled?: boolean;
  hideIcon?: boolean;
  /** Stops the user typing a date while leaving the calendar usable. */
  readOnly?: boolean;
  /** How the calendar is presented: anchored, a bottom sheet, or auto by width. */
  mode?: 'popover' | 'sheet' | 'auto';
}

/** Apply the date-picker wrapper's explicit inputs to its custom element. */
export function applyDatePickerAttributes(
  el: HTMLElement,
  inputs: DatePickerAttributeInputs,
  formDisabled = false,
): void {
  setAttr(el, 'placeholder', inputs.placeholder);
  setAttr(el, 'format', inputs.format);
  setAttr(el, 'min', dateAttr(inputs.min));
  setAttr(el, 'max', dateAttr(inputs.max));
  setAttr(el, 'header-mode', inputs.headerMode);
  setBool(el, 'with-time', inputs.withTime);
  setBool(el, 'show-holidays', inputs.showHolidays);
  setAttr(el, 'weekends', weekendsAttr(inputs.weekends));
  setFooterActions(el, inputs.footerActions);
  setAttr(el, 'icon-position', inputs.iconPosition);
  setAttr(el, 'text-align', inputs.textAlign);
  setAttr(el, 'input-width', inputs.inputWidth);
  setAttr(el, 'dropdown-width', inputs.dropdownWidth);
  setBool(el, 'disabled', inputs.disabled === true || formDisabled);
  setBool(el, 'hide-icon', inputs.hideIcon);
  setBool(el, 'readonly', inputs.readOnly);
  setAttr(el, 'mode', inputs.mode);
}
