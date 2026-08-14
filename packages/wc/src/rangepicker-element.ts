import {
  DoranDate,
  indexDayData,
  resolveCalendarLabels,
  type DayDataMap,
  type DayDatum,
  type Locale,
} from '@doranjs/core';
import { isDayBlocked, renderDayCell } from './day-render';
import { buildMonthGrid, navigateFocus, type GridNav } from './grid';
import { hasHolidayOn } from './holidays-cache';
import { chevronDown, chevronLeft, chevronRight } from './icons';
import { defaultRangePresets, type RangePreset } from './presets';
import { captureSlots, restoreSlots, slotPlaceholder, type SlotName } from './slots';
import { boolAttr, esc, parseFooterActions, resolveLocaleAttr } from './util';

type Panel = 'days' | 'months' | 'years';

/**
 * `<doran-rangepicker>` — a two-click Jalali date-range picker with start/end and
 * in-range highlighting, sharing the same chrome as `<doran-calendar>`. Supports
 * quick-pick presets (`presets` attribute, or a `presets` property for custom ones)
 * and a side-by-side multi-month view (`months` attribute).
 *
 * Emits a `change` CustomEvent with `{ start, end }` (DoranDate|null) once both
 * endpoints are chosen, and on every endpoint update.
 */
export class DoranRangePickerElement extends HTMLElement {
  static get observedAttributes(): string[] {
    return [
      'locale',
      'header-mode',
      'show-holidays',
      'weekends',
      'hide-footer',
      'footer-actions',
      'year-span',
      'presets',
      'months',
    ];
  }

  #start: DoranDate | null = null;
  #end: DoranDate | null = null;
  #viewYear = 0;
  #viewMonth = 0;
  #panel: Panel = 'days';
  #initialized = false;
  /** The day reachable via keyboard (roving tabindex). */
  #focusDate: DoranDate | null = null;
  /** When true, the next render moves DOM focus onto the focusable day. */
  #focusDayAfterRender = false;
  /** Custom presets set via JS property; falls back to the defaults when the attribute is present. */
  #customPresets: RangePreset[] | null = null;
  #dayData: DayDataMap | null = null;
  #dayIndex: Map<string, DayDatum> | null = null;
  #disabledDates: ((day: DoranDate) => boolean) | null = null;
  /** Author-supplied `[slot]` children, captured before the first render. */
  #slots: Map<SlotName, Element> = new Map();

  /**
   * Per-day annotations keyed by Jalali `YYYY-M-D` — a nightly rate, availability,
   * a sold-out flag. Set as a JS property:
   *
   * ```js
   * picker.dayData = { '1404-5-12': { text: '۲ اتاق', tone: 'low' } };
   * ```
   */
  get dayData(): DayDataMap | null {
    return this.#dayData;
  }

  set dayData(value: DayDataMap | null) {
    this.#dayData = value;
    this.#dayIndex = indexDayData(value);
    if (this.#initialized) this.#render();
  }

  /** Blocks individual days beyond `min`/`max` — dates already booked, for instance. */
  get disabledDates(): ((day: DoranDate) => boolean) | null {
    return this.#disabledDates;
  }

  set disabledDates(value: ((day: DoranDate) => boolean) | null) {
    this.#disabledDates = value;
    if (this.#initialized) this.#render();
  }

  connectedCallback(): void {
    if (!this.#initialized) {
      const today = DoranDate.now();
      this.#viewYear = today.year;
      this.#viewMonth = today.month;
      // Must happen before the first render: innerHTML would discard these children.
      this.#slots = captureSlots(this);
      this.#initialized = true;
    }
    this.addEventListener('click', this.#onClick);
    this.addEventListener('change', this.#onNativeChange, true);
    this.addEventListener('keydown', this.#onKeyDown);
    this.#render();
  }

  disconnectedCallback(): void {
    this.removeEventListener('click', this.#onClick);
    this.removeEventListener('change', this.#onNativeChange, true);
    this.removeEventListener('keydown', this.#onKeyDown);
  }

  attributeChangedCallback(): void {
    if (this.#initialized) this.#render();
  }

  get value(): { start: DoranDate | null; end: DoranDate | null } {
    return { start: this.#start, end: this.#end };
  }

  set value(range: { start: DoranDate | null; end: DoranDate | null } | null) {
    this.#start = range?.start ?? null;
    this.#end = range?.end ?? null;
    // Frameworks may set properties before the element connects (view state not
    // yet initialized); connectedCallback renders once it is.
    if (this.#initialized) this.#render();
  }

  /** Custom quick-pick presets. Setting this also implies presets are shown. */
  set presets(presets: RangePreset[] | boolean | null) {
    // A bare `presets` attribute bound as a property arrives as a boolean; treat
    // that as "show the defaults" rather than a custom list.
    if (Array.isArray(presets)) {
      this.#customPresets = presets;
    } else {
      this.#customPresets = null;
      this.toggleAttribute('presets', !!presets);
    }
    if (this.#initialized) this.#render();
  }

  get #locale(): Locale {
    return resolveLocaleAttr(this.getAttribute('locale'));
  }

  /** The presets to show: custom ones if set, the defaults if the attribute is present, else none. */
  get #presetList(): RangePreset[] {
    if (this.#customPresets) return this.#customPresets;
    return boolAttr(this, 'presets') ? defaultRangePresets() : [];
  }

  /** How many month grids to show side by side. */
  get #months(): number {
    const n = Number(this.getAttribute('months'));
    return Number.isInteger(n) && n > 1 ? n : 1;
  }

  get #weekends(): number[] {
    const attr = this.getAttribute('weekends');
    if (!attr) return [6];
    return attr
      .split(',')
      .map((s) => Number(s.trim()))
      .filter(Number.isInteger);
  }

  get #yearSpan(): number {
    const n = Number(this.getAttribute('year-span'));
    return Number.isFinite(n) && n > 0 ? n : 60;
  }

  /** Whether a day is blocked, by either the `disabledDates` hook or `dayData`. */
  #isDisabled(date: DoranDate): boolean {
    if (this.#disabledDates?.(date)) return true;
    return isDayBlocked(date, false, this.#dayIndex);
  }

  #selectDay(date: DoranDate): void {
    if (this.#isDisabled(date)) return;
    const d = date.startOf('day');
    if (!this.#start || this.#end) {
      this.#start = d;
      this.#end = null;
    } else if (d.isBefore(this.#start)) {
      this.#end = this.#start;
      this.#start = d;
    } else {
      this.#end = d;
    }
    this.#render();
    this.dispatchEvent(
      new CustomEvent('change', { bubbles: false, detail: { start: this.#start, end: this.#end } }),
    );
  }

  #navMonth(delta: number): void {
    const total = this.#viewYear * 12 + (this.#viewMonth - 1) + delta;
    this.#viewYear = Math.floor(total / 12);
    this.#viewMonth = (((total % 12) + 12) % 12) + 1;
    this.#render();
  }

  /** Absolute month index for ordering/visibility math. */
  #monthIndex(year: number, month: number): number {
    return year * 12 + (month - 1);
  }

  /** Whether a date's month is within the visible window of `#months` months. */
  #isMonthVisible(date: DoranDate): boolean {
    const start = this.#monthIndex(this.#viewYear, this.#viewMonth);
    const idx = this.#monthIndex(date.year, date.month);
    return idx >= start && idx <= start + this.#months - 1;
  }

  /** Scrolls the window the minimum amount needed to make a date's month visible. */
  #scrollToMonth(date: DoranDate): void {
    const start = this.#monthIndex(this.#viewYear, this.#viewMonth);
    const idx = this.#monthIndex(date.year, date.month);
    let newStart: number | null = null;
    if (idx < start) newStart = idx;
    else if (idx > start + this.#months - 1) newStart = idx - (this.#months - 1);
    if (newStart !== null) {
      this.#viewYear = Math.floor(newStart / 12);
      this.#viewMonth = (newStart % 12) + 1;
    }
  }

  /** The single day that is keyboard-focusable across the whole (possibly multi-month) widget. */
  #globalActiveDate(): DoranDate {
    if (this.#focusDate && this.#isMonthVisible(this.#focusDate)) return this.#focusDate;
    const anchor = this.#start ?? this.#end;
    if (anchor && this.#isMonthVisible(anchor)) return anchor;
    const today = DoranDate.now().startOf('day');
    if (this.#isMonthVisible(today)) return today;
    return DoranDate.fromJalali({ year: this.#viewYear, month: this.#viewMonth, day: 1 });
  }

  #setRange(start: DoranDate, end: DoranDate): void {
    const [s, e] = start.isAfter(end) ? [end, start] : [start, end];
    this.#start = s.startOf('day');
    this.#end = e.startOf('day');
    this.#scrollToMonth(this.#start);
    this.#render();
    this.dispatchEvent(
      new CustomEvent('change', { bubbles: false, detail: { start: this.#start, end: this.#end } }),
    );
  }

  #reset(): void {
    this.#start = null;
    this.#end = null;
    this.#render();
    this.dispatchEvent(
      new CustomEvent('change', { bubbles: false, detail: { start: null, end: null } }),
    );
  }

  #onNativeChange = (event: Event): void => {
    const target = event.target as HTMLElement;
    if (target instanceof HTMLSelectElement && target.dataset.role) {
      event.stopPropagation();
      if (target.dataset.role === 'month') this.#viewMonth = Number(target.value);
      if (target.dataset.role === 'year') this.#viewYear = Number(target.value);
      this.#render();
    }
  };

  #onClick = (event: Event): void => {
    const btn = (event.target as HTMLElement).closest<HTMLElement>('[data-action]');
    if (!btn || !this.contains(btn)) return;
    switch (btn.dataset.action) {
      case 'prev':
        this.#navMonth(-1);
        break;
      case 'next':
        this.#navMonth(1);
        break;
      case 'toggle-panel': {
        const panel = btn.dataset.panel as Panel;
        this.#panel = this.#panel === panel ? 'days' : panel;
        this.#render();
        break;
      }
      case 'select-month':
        this.#viewMonth = Number(btn.dataset.month);
        this.#panel = 'days';
        this.#render();
        break;
      case 'select-year':
        this.#viewYear = Number(btn.dataset.year);
        this.#panel = 'days';
        this.#render();
        break;
      case 'select-day':
        this.#selectDay(
          DoranDate.fromJalali({
            year: Number(btn.dataset.y),
            month: Number(btn.dataset.m),
            day: Number(btn.dataset.d),
          }),
        );
        break;
      case 'preset': {
        const preset = this.#presetList[Number(btn.dataset.index)];
        if (preset) {
          const { start, end } = preset.range(DoranDate.now());
          this.#setRange(start, end);
        }
        break;
      }
      case 'clear':
      case 'reset':
        this.#reset();
        break;
      default:
        break;
    }
  };

  #onKeyDown = (event: KeyboardEvent): void => {
    if (this.#panel !== 'days') return;
    // Read the focused day directly so navigation works across multiple month grids.
    const dayBtn = (event.target as HTMLElement).closest<HTMLElement>('[data-action="select-day"]');
    if (!dayBtn) return;
    const active = DoranDate.fromJalali({
      year: Number(dayBtn.dataset.y),
      month: Number(dayBtn.dataset.m),
      day: Number(dayBtn.dataset.d),
    });

    const moves: Record<string, GridNav> = {
      // RTL: ArrowLeft advances, ArrowRight goes back.
      ArrowLeft: 'next-day',
      ArrowRight: 'prev-day',
      ArrowDown: 'next-week',
      ArrowUp: 'prev-week',
      Home: 'week-start',
      End: 'week-end',
    };

    let move: GridNav | undefined = moves[event.key];
    if (event.key === 'PageUp') move = event.shiftKey ? 'prev-year' : 'prev-month';
    if (event.key === 'PageDown') move = event.shiftKey ? 'next-year' : 'next-month';

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.#focusDayAfterRender = true;
      this.#selectDay(active);
      return;
    }

    if (!move) return;
    event.preventDefault();

    const target = navigateFocus(active, move);
    this.#focusDate = target;
    this.#focusDayAfterRender = true;
    if (!this.#isMonthVisible(target)) this.#scrollToMonth(target);
    this.#render();
  };

  #yearBounds(): [number, number] {
    const span = this.#yearSpan;
    return [this.#viewYear - Math.floor(span / 2), this.#viewYear + Math.ceil(span / 2)];
  }

  #render(): void {
    const locale = this.#locale;
    const labels = resolveCalendarLabels(locale);
    const num = (n: number | string) => locale.formatNumber(String(n));
    const mode = this.getAttribute('header-mode') === 'separate' ? 'separate' : 'dropdown';
    const months = this.#months;
    const multi = months > 1;
    const active = this.#globalActiveDate();

    this.classList.add('doran-calendar', 'doran-rangepicker');
    this.classList.toggle('doran-rangepicker--multi', multi);
    this.setAttribute('dir', 'rtl');

    const header = multi
      ? this.#renderMultiHeader(locale, num, months)
      : this.#renderHeader(locale, mode, num);

    let body: string;
    if (!multi && this.#panel !== 'days') {
      body = this.#renderPanel(locale, num);
    } else if (multi) {
      const startIdx = this.#monthIndex(this.#viewYear, this.#viewMonth);
      let monthsHtml = '';
      for (let i = 0; i < months; i += 1) {
        const idx = startIdx + i;
        const y = Math.floor(idx / 12);
        const m = (idx % 12) + 1;
        const caption = esc(
          DoranDate.fromJalali({ year: y, month: m, day: 1 })
            .withLocale(locale)
            .format('MMMM YYYY'),
        );
        monthsHtml +=
          `<div class="doran-rangepicker__month">` +
          `<div class="doran-rangepicker__month-caption">${caption}</div>` +
          this.#renderMonth(locale, num, y, m, active) +
          `</div>`;
      }
      body = `<div class="doran-rangepicker__months">${monthsHtml}</div>`;
    } else {
      body = this.#renderMonth(locale, num, this.#viewYear, this.#viewMonth, active);
    }

    const presets = this.#presetList;
    // The aside shares the sidebar with the presets, sitting above them. The presets
    // keep their own labelled group so the aside doesn't join their accessible name.
    const presetGroup = presets.length
      ? `<div class="doran-rangepicker__preset-group" role="group" aria-label="بازه‌های آماده">` +
        presets
          .map(
            (p, i) =>
              `<button type="button" class="doran-rangepicker__preset" data-action="preset" data-index="${i}">${esc(p.label)}</button>`,
          )
          .join('') +
        `</div>`
      : '';
    const sidebar =
      presets.length || this.#slots.has('aside')
        ? `<div class="doran-rangepicker__presets">${slotPlaceholder(this.#slots, 'aside')}${presetGroup}</div>`
        : '';

    const fmt = (d: DoranDate | null) => (d ? d.withLocale(locale).format('YYYY/MM/DD') : '—');
    const summary = `${fmt(this.#start)} تا ${fmt(this.#end)}`;
    const footerActions = parseFooterActions(
      this.getAttribute('footer-actions'),
      ['clear'],
      ['clear'],
    );
    const footerButtons = footerActions
      .map(
        () =>
          `<button type="button" class="doran-btn doran-btn--outline doran-calendar__footer-action doran-calendar__footer-action--clear" data-action="clear" data-footer-action="clear">${esc(labels.clear)}</button>`,
      )
      .join('');
    const footerSlot = slotPlaceholder(this.#slots, 'footer');
    const footer =
      boolAttr(this, 'hide-footer') || (footerButtons === '' && footerSlot === '')
        ? ''
        : `<div class="doran-calendar__footer doran-rangepicker__footer">` +
          `<span class="doran-rangepicker__summary">${esc(summary)}</span>` +
          footerSlot +
          footerButtons +
          `</div>`;

    this.innerHTML =
      slotPlaceholder(this.#slots, 'legend') +
      `<div class="doran-rangepicker__body">${sidebar}<div class="doran-rangepicker__calendar">${header}${body}</div></div>` +
      footer;
    restoreSlots(this, this.#slots);

    if (this.#focusDayAfterRender) {
      this.#focusDayAfterRender = false;
      this.querySelector<HTMLElement>('.doran-month [tabindex="0"]')?.focus();
    }
  }

  /** A simplified arrows-only header for the multi-month layout. */
  #renderMultiHeader(locale: Locale, num: (n: number | string) => string, months: number): string {
    const label = (idx: number) => {
      const y = Math.floor(idx / 12);
      const m = (idx % 12) + 1;
      return `${locale.months[m - 1]} ${num(y)}`;
    };
    const startIdx = this.#monthIndex(this.#viewYear, this.#viewMonth);
    const caption = esc(`${label(startIdx)} – ${label(startIdx + months - 1)}`);
    return (
      `<div class="doran-calendar__header">` +
      `<button type="button" class="doran-calendar__nav" data-action="prev" aria-label="ماه قبل">${chevronRight}</button>` +
      `<div class="doran-calendar__heading" aria-live="polite">${caption}</div>` +
      `<button type="button" class="doran-calendar__nav" data-action="next" aria-label="ماه بعد">${chevronLeft}</button>` +
      `</div>`
    );
  }

  #renderHeader(
    locale: Locale,
    mode: 'dropdown' | 'separate',
    num: (n: number | string) => string,
  ): string {
    let heading: string;
    if (mode === 'separate') {
      const months = locale.months
        .map(
          (name, i) =>
            `<option value="${i + 1}" ${i + 1 === this.#viewMonth ? 'selected' : ''}>${esc(name)}</option>`,
        )
        .join('');
      const [from, to] = this.#yearBounds();
      let years = '';
      for (let y = from; y <= to; y += 1) {
        years += `<option value="${y}" ${y === this.#viewYear ? 'selected' : ''}>${esc(num(y))}</option>`;
      }
      heading = `<select class="doran-calendar__heading-btn" data-role="month" aria-label="ماه">${months}</select><select class="doran-calendar__heading-btn" data-role="year" aria-label="سال">${years}</select>`;
    } else {
      heading =
        `<button type="button" class="doran-calendar__heading-btn ${this.#panel === 'months' ? 'doran-calendar__heading-btn--active' : ''}" data-action="toggle-panel" data-panel="months">${esc(locale.months[this.#viewMonth - 1]!)}${chevronDown}</button>` +
        `<button type="button" class="doran-calendar__heading-btn ${this.#panel === 'years' ? 'doran-calendar__heading-btn--active' : ''}" data-action="toggle-panel" data-panel="years">${esc(num(this.#viewYear))}${chevronDown}</button>`;
    }
    return (
      `<div class="doran-calendar__header">` +
      `<button type="button" class="doran-calendar__nav" data-action="prev" aria-label="ماه قبل">${chevronRight}</button>` +
      `<div class="doran-calendar__heading" aria-live="polite">${heading}</div>` +
      `<button type="button" class="doran-calendar__nav" data-action="next" aria-label="ماه بعد">${chevronLeft}</button>` +
      `</div>`
    );
  }

  #renderMonth(
    locale: Locale,
    num: (n: number | string) => string,
    year: number,
    month: number,
    active: DoranDate,
  ): string {
    const weekends = this.#weekends;
    const showHolidays = boolAttr(this, 'show-holidays');
    const grid = buildMonthGrid(year, month, { today: DoranDate.now() });
    const gridLabel = esc(
      DoranDate.fromJalali({ year, month, day: 1 }).withLocale(locale).format('MMMM YYYY'),
    );
    const start = this.#start;
    const end = this.#end;

    const weekdays = locale.weekdaysMin
      .map(
        (name, i) =>
          `<div class="doran-month__weekday ${weekends.includes(i) ? 'doran-month__weekday--weekend' : ''}" role="columnheader" aria-label="${esc(locale.weekdays[i]!)}">${esc(name)}</div>`,
      )
      .join('');

    const weeks = grid.weeks
      .map((week) => {
        const cells = week
          .map((cell) => {
            const isStart = start ? cell.date.isSame(start, 'day') : false;
            const isEnd = end ? cell.date.isSame(end, 'day') : false;
            return renderDayCell(
              cell,
              {
                selected: isStart || isEnd,
                disabled: this.#disabledDates?.(cell.date) ?? false,
                holiday: showHolidays && cell.inCurrentMonth && hasHolidayOn(cell.date),
                weekend: weekends.includes(cell.weekday),
                active: cell.date.isSame(active, 'day'),
                inRange: start && end ? cell.date.isBetween(start, end.endOf('day')) : false,
                rangeStart: isStart,
                rangeEnd: isEnd,
              },
              { locale, num, dayIndex: this.#dayIndex },
            );
          })
          .join('');
        return `<div class="doran-month__week" role="row">${cells}</div>`;
      })
      .join('');

    const richClass = this.#dayIndex ? ' doran-month--rich' : '';
    return `<div class="doran-month${richClass}" role="grid" aria-multiselectable="true" aria-label="${gridLabel}"><div class="doran-month__weekdays" role="row">${weekdays}</div>${weeks}</div>`;
  }

  #renderPanel(locale: Locale, num: (n: number | string) => string): string {
    if (this.#panel === 'months') {
      const options = locale.months
        .map(
          (name, i) =>
            `<button type="button" role="option" class="doran-picker-option ${i + 1 === this.#viewMonth ? 'doran-picker-option--active' : ''}" data-action="select-month" data-month="${i + 1}">${esc(name)}</button>`,
        )
        .join('');
      return `<div class="doran-picker-panel"><div class="doran-picker-panel__grid doran-picker-panel__grid--months" role="listbox">${options}</div></div>`;
    }
    const [from, to] = this.#yearBounds();
    let options = '';
    for (let y = from; y <= to; y += 1) {
      options += `<button type="button" role="option" class="doran-picker-option ${y === this.#viewYear ? 'doran-picker-option--active' : ''}" data-action="select-year" data-year="${y}">${esc(num(y))}</button>`;
    }
    return `<div class="doran-picker-panel"><div class="doran-picker-panel__grid doran-picker-panel__grid--years" role="listbox">${options}</div></div>`;
  }
}
