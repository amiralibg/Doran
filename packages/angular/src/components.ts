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
import { type DoranDate } from '@doranjs/core';
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
  template: `<doran-datepicker #el (change)="onChange($event)"></doran-datepicker>`,
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => DoranDatePicker), multi: true },
  ],
})
export class DoranDatePicker implements ControlValueAccessor, AfterViewInit {
  @ViewChild('el') el!: ElementRef<HTMLElement & { value: DoranDate | null }>;
  @Output() change = new EventEmitter<{ value: DoranDate | null; gregorian: Date | null }>();

  private value: DoranDate | null = null;
  private cbChange: (v: DoranDate | null) => void = () => {};
  private cbTouched: Noop = () => {};

  constructor() {
    ensureElements();
  }
  @Input() locale?: string;
  private defaults = inject(DORAN_DEFAULTS, { optional: true });

  ngAfterViewInit(): void {
    this.el.nativeElement.value = this.value;
    applyLocale(this.el.nativeElement, this.locale, this.defaults);
  }

  writeValue(v: DoranDate | null): void {
    this.value = v;
    if (this.el) this.el.nativeElement.value = v;
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
 * `<doran-calendar>` — inline month grid.
 * Reactive-forms ready; the model is a `DoranDate | null`.
 */
@Component({
  selector: 'dr-calendar',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `<doran-calendar #el (change)="onChange($event)"></doran-calendar>`,
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => DoranCalendar), multi: true },
  ],
})
export class DoranCalendar implements ControlValueAccessor, AfterViewInit {
  @ViewChild('el') el!: ElementRef<HTMLElement & { value: DoranDate | null }>;
  @Output() change = new EventEmitter<{ value: DoranDate | null; gregorian: Date | null }>();

  private value: DoranDate | null = null;
  private cbChange: (v: DoranDate | null) => void = () => {};
  private cbTouched: Noop = () => {};

  constructor() {
    ensureElements();
  }
  @Input() locale?: string;
  private defaults = inject(DORAN_DEFAULTS, { optional: true });

  ngAfterViewInit(): void {
    this.el.nativeElement.value = this.value;
    applyLocale(this.el.nativeElement, this.locale, this.defaults);
  }

  writeValue(v: DoranDate | null): void {
    this.value = v;
    if (this.el) this.el.nativeElement.value = v;
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
    const value = detail<{ date: DoranDate }>(e)?.date ?? null;
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
  template: `<doran-rangepicker #el (change)="onChange($event)"></doran-rangepicker>`,
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => DoranRangePicker), multi: true },
  ],
})
export class DoranRangePicker implements ControlValueAccessor, AfterViewInit {
  @ViewChild('el') el!: ElementRef<HTMLElement & { value: DoranDateRange }>;
  @Output() change = new EventEmitter<{ value: DoranDateRange; gregorian: GregorianDateRange }>();

  private value: DoranDateRange = { start: null, end: null };
  private cbChange: (v: DoranDateRange) => void = () => {};
  private cbTouched: Noop = () => {};

  constructor() {
    ensureElements();
  }
  @Input() locale?: string;
  private defaults = inject(DORAN_DEFAULTS, { optional: true });

  ngAfterViewInit(): void {
    this.el.nativeElement.value = this.value;
    applyLocale(this.el.nativeElement, this.locale, this.defaults);
  }

  writeValue(v: DoranDateRange | null): void {
    this.value = v ?? { start: null, end: null };
    if (this.el) this.el.nativeElement.value = this.value;
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
export class DoranNlpInput implements ControlValueAccessor, AfterViewInit {
  @ViewChild('el') el!: ElementRef<HTMLElement & { value: string }>;
  @Output() resolve = new EventEmitter<unknown>();
  @Output() change = new EventEmitter<unknown>();

  private value = '';
  private cbChange: (v: string) => void = () => {};
  private cbTouched: Noop = () => {};

  constructor() {
    ensureElements();
  }
  @Input() locale?: string;
  private defaults = inject(DORAN_DEFAULTS, { optional: true });

  ngAfterViewInit(): void {
    this.el.nativeElement.value = this.value;
    applyLocale(this.el.nativeElement, this.locale, this.defaults);
  }

  writeValue(v: string | null): void {
    this.value = v ?? '';
    if (this.el) this.el.nativeElement.value = this.value;
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

/**
 * `<doran-agenda>` — month agenda. Not a form control: pass `[events]` and listen
 * to `(selectday)`, which emits the tapped `DoranDate`.
 */
@Component({
  selector: 'dr-agenda',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `<doran-agenda #el (selectday)="onSelectday($event)"></doran-agenda>`,
})
export class DoranAgenda implements AfterViewInit, OnChanges {
  @ViewChild('el') el!: ElementRef<HTMLElement & { events: unknown }>;
  @Input() events: unknown = [];
  @Input() locale?: string;
  @Output() selectday = new EventEmitter<DoranDate>();
  private defaults = inject(DORAN_DEFAULTS, { optional: true });

  constructor() {
    ensureElements();
  }
  ngAfterViewInit(): void {
    this.el.nativeElement.events = this.events;
    applyLocale(this.el.nativeElement, this.locale, this.defaults);
  }
  ngOnChanges(): void {
    if (this.el) this.el.nativeElement.events = this.events;
  }

  onSelectday(e: Event): void {
    this.selectday.emit(detail<{ date: DoranDate }>(e).date);
  }
}
