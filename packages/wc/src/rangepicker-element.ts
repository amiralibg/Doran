import { DoranDate, type Locale } from '@doranjs/core';
import { getHolidaysOn } from '@doranjs/holidays';
import { buildMonthGrid } from './grid';
import { chevronDown, chevronLeft, chevronRight } from './icons';
import { boolAttr, esc, resolveLocaleAttr } from './util';

type Panel = 'days' | 'months' | 'years';

/**
 * `<doran-rangepicker>` — a two-click Jalali date-range picker with start/end and
 * in-range highlighting, sharing the same chrome as `<doran-calendar>`.
 *
 * Emits a `change` CustomEvent with `{ start, end }` (DoranDate|null) once both
 * endpoints are chosen, and on every endpoint update.
 */
export class DoranRangePickerElement extends HTMLElement {
  static get observedAttributes(): string[] {
    return ['locale', 'header-mode', 'show-holidays', 'weekends', 'year-span'];
  }

  #start: DoranDate | null = null;
  #end: DoranDate | null = null;
  #viewYear = 0;
  #viewMonth = 0;
  #panel: Panel = 'days';
  #initialized = false;

  connectedCallback(): void {
    if (!this.#initialized) {
      const today = DoranDate.now();
      this.#viewYear = today.year;
      this.#viewMonth = today.month;
      this.#initialized = true;
    }
    this.addEventListener('click', this.#onClick);
    this.addEventListener('change', this.#onNativeChange, true);
    this.#render();
  }

  disconnectedCallback(): void {
    this.removeEventListener('click', this.#onClick);
    this.removeEventListener('change', this.#onNativeChange, true);
  }

  attributeChangedCallback(): void {
    if (this.#initialized) this.#render();
  }

  get value(): { start: DoranDate | null; end: DoranDate | null } {
    return { start: this.#start, end: this.#end };
  }

  get #locale(): Locale {
    return resolveLocaleAttr(this.getAttribute('locale'));
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

  #selectDay(date: DoranDate): void {
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
      new CustomEvent('change', { bubbles: true, detail: { start: this.#start, end: this.#end } }),
    );
  }

  #navMonth(delta: number): void {
    const total = this.#viewYear * 12 + (this.#viewMonth - 1) + delta;
    this.#viewYear = Math.floor(total / 12);
    this.#viewMonth = (((total % 12) + 12) % 12) + 1;
    this.#render();
  }

  #reset(): void {
    this.#start = null;
    this.#end = null;
    this.#render();
    this.dispatchEvent(
      new CustomEvent('change', { bubbles: true, detail: { start: null, end: null } }),
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
      case 'reset':
        this.#reset();
        break;
      default:
        break;
    }
  };

  #yearBounds(): [number, number] {
    const span = this.#yearSpan;
    return [this.#viewYear - Math.floor(span / 2), this.#viewYear + Math.ceil(span / 2)];
  }

  #render(): void {
    const locale = this.#locale;
    const num = (n: number | string) => locale.formatNumber(String(n));
    const mode = this.getAttribute('header-mode') === 'separate' ? 'separate' : 'dropdown';

    this.classList.add('doran-calendar', 'doran-rangepicker');
    this.setAttribute('dir', 'rtl');

    const body =
      this.#panel === 'days' ? this.#renderMonth(locale, num) : this.#renderPanel(locale, num);
    const fmt = (d: DoranDate | null) => (d ? d.withLocale(locale).format('YYYY/MM/DD') : '—');
    const summary = `${fmt(this.#start)} تا ${fmt(this.#end)}`;

    this.innerHTML =
      this.#renderHeader(locale, mode, num) +
      body +
      `<div class="doran-calendar__footer doran-rangepicker__footer">` +
      `<span class="doran-rangepicker__summary">${esc(summary)}</span>` +
      `<button type="button" class="doran-btn doran-btn--outline" data-action="reset">پاک کردن</button>` +
      `</div>`;
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

  #renderMonth(locale: Locale, num: (n: number | string) => string): string {
    const weekends = this.#weekends;
    const showHolidays = boolAttr(this, 'show-holidays');
    const grid = buildMonthGrid(this.#viewYear, this.#viewMonth, { today: DoranDate.now() });
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
            const inRange = start && end ? cell.date.isBetween(start, end.endOf('day')) : false;
            const weekend = weekends.includes(cell.weekday);
            const holiday =
              showHolidays && cell.inCurrentMonth && getHolidaysOn(cell.date).length > 0;
            const cls = [
              'doran-day',
              !cell.inCurrentMonth ? 'doran-day--outside' : '',
              weekend ? 'doran-day--weekend' : '',
              holiday ? 'doran-day--holiday' : '',
              cell.isToday ? 'doran-day--today' : '',
              isStart ? 'doran-day--range-start' : '',
              isEnd ? 'doran-day--range-end' : '',
              inRange && !isStart && !isEnd ? 'doran-day--in-range' : '',
              isStart || isEnd ? 'doran-day--selected' : '',
            ]
              .filter(Boolean)
              .join(' ');
            return (
              `<div class="doran-month__cell" role="gridcell">` +
              `<button type="button" class="${cls}" data-action="select-day" data-y="${cell.date.year}" data-m="${cell.date.month}" data-d="${cell.date.day}" aria-label="${esc(cell.date.withLocale(locale).format('dddd D MMMM YYYY'))}">${esc(num(cell.day))}</button>` +
              `</div>`
            );
          })
          .join('');
        return `<div class="doran-month__week" role="row">${cells}</div>`;
      })
      .join('');

    return `<div class="doran-month" role="grid"><div class="doran-month__weekdays" role="row">${weekdays}</div>${weeks}</div>`;
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
