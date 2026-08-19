import {
  type AfterViewInit,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  type ElementRef,
  EventEmitter,
  forwardRef,
  inject,
  Input,
  type OnChanges,
  Output,
  ViewChild,
} from '@angular/core';
import { type ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { type DayDataMap, type DoranDate } from '@doranjs/core';
import { type AgendaEvent } from '@doranjs/wc';
import {
  applyDatePickerAttributes,
  applyDayWidgets,
  type DayWidgetInputs,
  type FooterActionsInput,
  setAttr,
  setBool,
  setFooterActions,
  weekendsAttr,
} from './attributes';
import { DORAN_DEFAULTS, type DoranDefaults } from './provider';
import { detail, ensureElements } from './wc';

/** Apply the resolved locale (explicit input → provider) to a custom element. */
function applyLocale(
  el: HTMLElement,
  explicit: string | undefined,
  defaults: DoranDefaults | null,
): void {
  const locale = explicit ?? defaults?.locale;
  if (locale) el.setAttribute('locale', locale);
}

/** Range value shared by the range picker — mirrors `@doranjs/react`'s shape. */
export interface DoranDateRange {
  start: DoranDate | null;
  end: DoranDate | null;
}
export interface GregorianDateRange {
  start: Date | null;
  end: Date | null;
}

type Noop = () => void;

/**
 * `<doran-date-picker>` — popover date picker.
 * Reactive-forms ready (`ControlValueAccessor`); the model is a `DoranDate | null`.
 * `(change)` also emits the Gregorian `Date` (the instant model).
 */
@Component({
  selector: 'dr-date-picker',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `<doran-datepicker #el (change)="onChange($event)"
    ><ng-content></ng-content
  ></doran-datepicker>`,
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => DoranDatePicker), multi: true },
  ],
})
export class DoranDatePicker implements ControlValueAccessor, AfterViewInit, OnChanges {
  @ViewChild('el') el!: ElementRef<HTMLElement & { value: DoranDate | null }>;
  @Output() change = new EventEmitter<{ value: DoranDate | null; gregorian: Date | null }>();

  @Input() locale?: string;
  @Input() placeholder?: string;
  @Input() format?: string;
  @Input() withTime?: boolean;
  @Input() footerActions?: FooterActionsInput;
  @Input() iconPosition?: 'left' | 'right';
  @Input() textAlign?: 'left' | 'right';
  @Input() inputWidth?: string;
  @Input() dropdownWidth?: 'auto' | 'trigger' | string;
  @Input() min?: DoranDate | string;
  @Input() max?: DoranDate | string;
  @Input() headerMode?: 'dropdown' | 'separate';
  @Input() showHolidays?: boolean;
  @Input() weekends?: number[] | string;
  @Input() disabled?: boolean;
  /** Hide the trigger icon. Project a custom one instead via `<svg slot="icon">…`. */
  @Input() hideIcon?: boolean;
  /** Stops the user typing a date while leaving the calendar usable. */
  @Input() readOnly?: boolean;
  /** `false` swaps the text field for a button trigger; defaults to `true`. */
  @Input() editable?: boolean;
  /** How the calendar is presented: anchored, a bottom sheet, or auto by width. */
  @Input() mode?: 'popover' | 'sheet' | 'auto';
  /** Per-day annotations keyed by Jalali `YYYY-M-D`, forwarded to the pop-over calendar. */
  @Input() dayData?: DayDataMap | null;
  /** Blocks individual days beyond `min`/`max`. */
  @Input() disabledDates?: (day: DoranDate) => boolean;

  private value: DoranDate | null = null;
  private formDisabled = false;
  // Element properties (`value`) must be set *after* the lazy `@doranjs/wc` import
  // upgrades the element — a pre-upgrade assignment creates an expando that shadows
  // the element's setter and never renders. `ready` gates every property write.
  private ready = false;
  private cbChange: (v: DoranDate | null) => void = () => {};
  private cbTouched: Noop = () => {};
  private defaults = inject(DORAN_DEFAULTS, { optional: true });

  constructor() {
    ensureElements();
  }

  ngAfterViewInit(): void {
    ensureElements().then(() => {
      this.ready = true;
      this.syncEl();
    });
  }
  ngOnChanges(): void {
    if (this.ready) this.syncEl();
  }
  private syncEl(): void {
    const el = this.el.nativeElement;
    applyLocale(el, this.locale, this.defaults);
    applyDatePickerAttributes(el, this, this.formDisabled);
    applyDayWidgets(el, this as DayWidgetInputs);
    el.value = this.value;
  }

  writeValue(v: DoranDate | null): void {
    this.value = v;
    if (this.ready) this.el.nativeElement.value = v;
  }
  registerOnChange(fn: (v: DoranDate | null) => void): void {
    this.cbChange = fn;
  }
  registerOnTouched(fn: Noop): void {
    this.cbTouched = fn;
  }
  setDisabledState(isDisabled: boolean): void {
    this.formDisabled = isDisabled;
    if (this.el) {
      this.el.nativeElement.toggleAttribute('disabled', this.disabled === true || isDisabled);
    }
  }

  onChange(e: Event): void {
    const value = detail<{ date: DoranDate | null }>(e)?.date ?? null;
    this.value = value;
    this.cbChange(value);
    this.cbTouched();
    this.change.emit({ value, gregorian: value ? value.toGregorian() : null });
  }
}

/**
 * `<doran-calendar>` — inline month grid.
 * Reactive-forms ready; the model is a `DoranDate | null`.
 */
@Component({
  selector: 'dr-calendar',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `<doran-calendar #el (change)="onChange($event)"
    ><ng-content></ng-content
  ></doran-calendar>`,
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => DoranCalendar), multi: true },
  ],
})
export class DoranCalendar implements ControlValueAccessor, AfterViewInit, OnChanges {
  @ViewChild('el') el!: ElementRef<HTMLElement & { value: DoranDate | null }>;
  @Output() change = new EventEmitter<{ value: DoranDate | null; gregorian: Date | null }>();

  @Input() locale?: string;
  @Input() headerMode?: 'dropdown' | 'separate';
  @Input() withTime?: boolean;
  @Input() showHolidays?: boolean;
  @Input() weekends?: number[] | string;
  @Input() hideFooter?: boolean;
  @Input() footerActions?: FooterActionsInput;
  @Input() yearSpan?: number;
  /** Per-day annotations keyed by Jalali `YYYY-M-D` — a fare, a count, a sold-out flag. */
  @Input() dayData?: DayDataMap | null;
  /** Blocks individual days beyond `min`/`max`. */
  @Input() disabledDates?: (day: DoranDate) => boolean;

  private value: DoranDate | null = null;
  private ready = false;
  private cbChange: (v: DoranDate | null) => void = () => {};
  private cbTouched: Noop = () => {};
  private defaults = inject(DORAN_DEFAULTS, { optional: true });

  constructor() {
    ensureElements();
  }

  ngAfterViewInit(): void {
    ensureElements().then(() => {
      this.ready = true;
      this.syncEl();
    });
  }
  ngOnChanges(): void {
    if (this.ready) this.syncEl();
  }
  private syncEl(): void {
    const el = this.el.nativeElement;
    applyLocale(el, this.locale, this.defaults);
    setAttr(el, 'header-mode', this.headerMode);
    setBool(el, 'with-time', this.withTime);
    setBool(el, 'show-holidays', this.showHolidays);
    setAttr(el, 'weekends', weekendsAttr(this.weekends));
    setBool(el, 'hide-footer', this.hideFooter);
    setFooterActions(el, this.footerActions);
    setAttr(el, 'year-span', this.yearSpan);
    applyDayWidgets(el, this as DayWidgetInputs);
    el.value = this.value;
  }

  writeValue(v: DoranDate | null): void {
    this.value = v;
    if (this.ready) this.el.nativeElement.value = v;
  }
  registerOnChange(fn: (v: DoranDate | null) => void): void {
    this.cbChange = fn;
  }
  registerOnTouched(fn: Noop): void {
    this.cbTouched = fn;
  }
  setDisabledState(isDisabled: boolean): void {
    if (this.el) this.el.nativeElement.toggleAttribute('disabled', isDisabled);
  }

  onChange(e: Event): void {
    const value = detail<{ date: DoranDate | null }>(e)?.date ?? null;
    this.value = value;
    this.cbChange(value);
    this.cbTouched();
    this.change.emit({ value, gregorian: value ? value.toGregorian() : null });
  }
}

/**
 * `<doran-range-picker>` — start/end picker.
 * Reactive-forms ready; the model is `{ start, end }` of `DoranDate`; `(change)`
 * also emits the Gregorian range.
 */
@Component({
  selector: 'dr-range-picker',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `<doran-rangepicker #el (change)="onChange($event)"
    ><ng-content></ng-content
  ></doran-rangepicker>`,
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => DoranRangePicker), multi: true },
  ],
})
export class DoranRangePicker implements ControlValueAccessor, AfterViewInit, OnChanges {
  @ViewChild('el') el!: ElementRef<HTMLElement & { value: DoranDateRange }>;
  @Output() change = new EventEmitter<{ value: DoranDateRange; gregorian: GregorianDateRange }>();

  @Input() locale?: string;
  @Input() headerMode?: 'dropdown' | 'separate';
  @Input() showHolidays?: boolean;
  @Input() weekends?: number[] | string;
  @Input() presets?: boolean;
  @Input() months?: number;
  @Input() footerActions?: FooterActionsInput;
  @Input() yearSpan?: number;
  /** Per-day annotations keyed by Jalali `YYYY-M-D` — a fare, a count, a sold-out flag. */
  @Input() dayData?: DayDataMap | null;
  /** Blocks individual days beyond `min`/`max`. */
  @Input() disabledDates?: (day: DoranDate) => boolean;

  private value: DoranDateRange = { start: null, end: null };
  private ready = false;
  private cbChange: (v: DoranDateRange) => void = () => {};
  private cbTouched: Noop = () => {};
  private defaults = inject(DORAN_DEFAULTS, { optional: true });

  constructor() {
    ensureElements();
  }

  ngAfterViewInit(): void {
    ensureElements().then(() => {
      this.ready = true;
      this.syncEl();
    });
  }
  ngOnChanges(): void {
    if (this.ready) this.syncEl();
  }
  private syncEl(): void {
    const el = this.el.nativeElement;
    applyLocale(el, this.locale, this.defaults);
    setAttr(el, 'header-mode', this.headerMode);
    setBool(el, 'show-holidays', this.showHolidays);
    setAttr(el, 'weekends', weekendsAttr(this.weekends));
    setBool(el, 'presets', this.presets);
    setAttr(el, 'months', this.months);
    setFooterActions(el, this.footerActions);
    setAttr(el, 'year-span', this.yearSpan);
    applyDayWidgets(el, this as DayWidgetInputs);
    el.value = this.value;
  }

  writeValue(v: DoranDateRange | null): void {
    this.value = v ?? { start: null, end: null };
    if (this.ready) this.el.nativeElement.value = this.value;
  }
  registerOnChange(fn: (v: DoranDateRange) => void): void {
    this.cbChange = fn;
  }
  registerOnTouched(fn: Noop): void {
    this.cbTouched = fn;
  }
  setDisabledState(isDisabled: boolean): void {
    if (this.el) this.el.nativeElement.toggleAttribute('disabled', isDisabled);
  }

  onChange(e: Event): void {
    const value = detail<DoranDateRange>(e) ?? { start: null, end: null };
    this.value = value;
    this.cbChange(value);
    this.cbTouched();
    this.change.emit({
      value,
      gregorian: {
        start: value.start ? value.start.toGregorian() : null,
        end: value.end ? value.end.toGregorian() : null,
      },
    });
  }
}

/**
 * `<doran-range-picker>` — start/end picker.
 * Reactive-forms ready; the model is `{ start, end }` of `DoranDate`; `(change)`
 * also emits the Gregorian range.
 */
@Component({
  selector: 'dr-range-date-picker',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `<doran-rangedatepicker #el (change)="onChange($event)"
    ><ng-content></ng-content
  ></doran-rangedatepicker>`,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DoranRangeDatePicker),
      multi: true,
    },
  ],
})
export class DoranRangeDatePicker implements ControlValueAccessor, AfterViewInit, OnChanges {
  @ViewChild('el') el!: ElementRef<HTMLElement & { value: DoranDateRange }>;
  @Output() change = new EventEmitter<{ value: DoranDateRange; gregorian: GregorianDateRange }>();

  @Input() locale?: string;
  @Input() headerMode?: 'dropdown' | 'separate';
  @Input() showHolidays?: boolean;
  @Input() weekends?: number[] | string;
  @Input() presets?: boolean;
  @Input() months?: number;
  @Input() footerActions?: FooterActionsInput;
  @Input() yearSpan?: number;
  /** Per-day annotations keyed by Jalali `YYYY-M-D` — a fare, a count, a sold-out flag. */
  @Input() dayData?: DayDataMap | null;
  /** Blocks individual days beyond `min`/`max`. */
  @Input() disabledDates?: (day: DoranDate) => boolean;

  private value: DoranDateRange = { start: null, end: null };
  private ready = false;
  private cbChange: (v: DoranDateRange) => void = () => {};
  private cbTouched: Noop = () => {};
  private defaults = inject(DORAN_DEFAULTS, { optional: true });

  constructor() {
    ensureElements();
  }

  ngAfterViewInit(): void {
    ensureElements().then(() => {
      this.ready = true;
      this.syncEl();
    });
  }
  ngOnChanges(): void {
    if (this.ready) this.syncEl();
  }
  private syncEl(): void {
    const el = this.el.nativeElement;
    applyLocale(el, this.locale, this.defaults);
    setAttr(el, 'header-mode', this.headerMode);
    setBool(el, 'show-holidays', this.showHolidays);
    setAttr(el, 'weekends', weekendsAttr(this.weekends));
    setBool(el, 'presets', this.presets);
    setAttr(el, 'months', this.months);
    setFooterActions(el, this.footerActions);
    setAttr(el, 'year-span', this.yearSpan);
    applyDayWidgets(el, this as DayWidgetInputs);
    el.value = this.value;
  }

  writeValue(v: DoranDateRange | null): void {
    this.value = v ?? { start: null, end: null };
    if (this.ready) this.el.nativeElement.value = this.value;
  }
  registerOnChange(fn: (v: DoranDateRange) => void): void {
    this.cbChange = fn;
  }
  registerOnTouched(fn: Noop): void {
    this.cbTouched = fn;
  }
  setDisabledState(isDisabled: boolean): void {
    if (this.el) this.el.nativeElement.toggleAttribute('disabled', isDisabled);
  }

  onChange(e: Event): void {
    const value = detail<DoranDateRange>(e) ?? { start: null, end: null };
    this.value = value;
    this.cbChange(value);
    this.cbTouched();
    this.change.emit({
      value,
      gregorian: {
        start: value.start ? value.start.toGregorian() : null,
        end: value.end ? value.end.toGregorian() : null,
      },
    });
  }
}

/**
 * `<doran-nlp-input>` — natural-language date input.
 * Reactive-forms ready; the model is the raw text string. `(resolve)` fires when
 * the text parses to a date; `(change)` reports the same result.
 */
@Component({
  selector: 'dr-nlp-input',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `<doran-nlp-input
    #el
    (input)="onInput($event)"
    (resolve)="onResolve($event)"
    (change)="onChangeEvent($event)"
  ></doran-nlp-input>`,
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => DoranNlpInput), multi: true },
  ],
})
export class DoranNlpInput implements ControlValueAccessor, AfterViewInit, OnChanges {
  @ViewChild('el') el!: ElementRef<HTMLElement & { value: string }>;
  @Output() resolve = new EventEmitter<unknown>();
  @Output() change = new EventEmitter<unknown>();

  @Input() locale?: string;
  @Input() placeholder?: string;

  private value = '';
  private ready = false;
  private cbChange: (v: string) => void = () => {};
  private cbTouched: Noop = () => {};
  private defaults = inject(DORAN_DEFAULTS, { optional: true });

  constructor() {
    ensureElements();
  }

  ngAfterViewInit(): void {
    ensureElements().then(() => {
      this.ready = true;
      this.syncEl();
    });
  }
  ngOnChanges(): void {
    if (this.ready) this.syncEl();
  }
  private syncEl(): void {
    const el = this.el.nativeElement;
    applyLocale(el, this.locale, this.defaults);
    setAttr(el, 'placeholder', this.placeholder);
    el.value = this.value;
  }

  writeValue(v: string | null): void {
    this.value = v ?? '';
    if (this.ready) this.el.nativeElement.value = this.value;
  }
  registerOnChange(fn: (v: string) => void): void {
    this.cbChange = fn;
  }
  registerOnTouched(fn: Noop): void {
    this.cbTouched = fn;
  }
  setDisabledState(isDisabled: boolean): void {
    if (this.el) this.el.nativeElement.toggleAttribute('disabled', isDisabled);
  }

  onInput(e: Event): void {
    this.value = detail<{ value: string }>(e)?.value ?? '';
    this.cbChange(this.value);
    this.cbTouched();
  }
  onResolve(e: Event): void {
    this.resolve.emit(detail<{ result: unknown }>(e)?.result);
  }
  onChangeEvent(e: Event): void {
    this.change.emit(detail<{ result: unknown }>(e)?.result);
  }
}

/** Element shape for the agenda's property-based inputs. */
type AgendaEl = HTMLElement & {
  start: DoranDate | null;
  events: AgendaEvent[];
  renderEvent: ((event: AgendaEvent) => string) | null;
};

/**
 * `<doran-agenda>` — vertical agenda. Not a form control: pass `[start]`,
 * `[events]`, `[days]`, `[renderEvent]` and listen to `(selectday)`, which emits
 * the tapped `DoranDate`. `start`/`events`/`renderEvent` are element properties,
 * so they're applied after the element upgrades.
 */
@Component({
  selector: 'dr-agenda',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `<doran-agenda #el (selectday)="onSelectday($event)"></doran-agenda>`,
})
export class DoranAgenda implements AfterViewInit, OnChanges {
  @ViewChild('el') el!: ElementRef<AgendaEl>;
  @Input() start: DoranDate | null = null;
  @Input() events: AgendaEvent[] = [];
  @Input() days?: number;
  @Input() renderEvent?: (event: AgendaEvent) => string;
  @Input() locale?: string;
  @Output() selectday = new EventEmitter<DoranDate>();
  private defaults = inject(DORAN_DEFAULTS, { optional: true });
  private ready = false;

  constructor() {
    ensureElements();
  }
  ngAfterViewInit(): void {
    ensureElements().then(() => {
      this.ready = true;
      this.syncEl();
    });
  }
  ngOnChanges(): void {
    if (this.ready) this.syncEl();
  }
  private syncEl(): void {
    const el = this.el.nativeElement;
    applyLocale(el, this.locale, this.defaults);
    setAttr(el, 'days', this.days);
    if (this.start) el.start = this.start;
    el.events = this.events;
    el.renderEvent = this.renderEvent ?? null;
  }

  onSelectday(e: Event): void {
    this.selectday.emit(detail<{ date: DoranDate }>(e).date);
  }
}
