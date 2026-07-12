import { DoranDate, resolveCalendarLabels, type Locale } from '@doranjs/core';
import { getHolidaysOn } from '@doranjs/holidays';
import { buildMonthGrid, navigateFocus, type GridNav, type MonthGrid } from './grid';
import { chevronDown, chevronLeft, chevronRight, chevronUp } from './icons';
import {
  boolAttr,
  esc,
  parseFooterActions,
  parseJalaliAttr,
  resolveLocaleAttr,
  withTime,
} from './util';

type Panel = 'days' | 'months' | 'years';

/**
 * `<doran-calendar>` — a framework-agnostic Persian (Jalali) month calendar.
 *
 * Attributes: `value`, `min`, `max` (`YYYY/MM/DD`), `locale` (`fa`|`en`),
 * `header-mode` (`dropdown`|`separate`), `with-time`, `show-holidays`,
 * `weekends` (comma-separated indices), `footer-actions` (`today,clear`),
 * `hide-footer`, and `year-span`.
 *
 * Emits a `change` CustomEvent with `{ date, iso, value }` when a day is chosen
 * or cleared; Clear emits `date: null`, `iso: null`, and `value: ''`.
 */
export class DoranCalendarElement extends HTMLElement {
  static get observedAttributes(): string[] {
    return [
      'value',
      'min',
      'max',
      'locale',
      'header-mode',
      'with-time',
      'show-holidays',
      'weekends',
      'hide-footer',
      'footer-actions',
      'year-span',
    ];
  }

  #selected: DoranDate | null = null;
  #viewYear = 0;
  #viewMonth = 0;
  #time = { hour: 0, minute: 0 };
  #panel: Panel = 'days';
  #initialized = false;
  /** The day reachable via keyboard (roving tabindex). */
  #focusDate: DoranDate | null = null;
  /** When true, the next render moves DOM focus onto the focusable day. */
  #focusDayAfterRender = false;

  connectedCallback(): void {
    if (!this.#initialized) {
      this.#selected = parseJalaliAttr(this.getAttribute('value'));
      const base = this.#selected ?? DoranDate.now();
      this.#viewYear = base.year;
      this.#viewMonth = base.month;
      if (this.#selected) this.#time = { hour: this.#selected.hour, minute: this.#selected.minute };
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

  attributeChangedCallback(name: string, _old: string | null, value: string | null): void {
    if (!this.#initialized) return;
    if (name === 'value') {
      this.#selected = parseJalaliAttr(value);
      if (this.#selected) {
        this.#viewYear = this.#selected.year;
        this.#viewMonth = this.#selected.month;
        this.#time = { hour: this.#selected.hour, minute: this.#selected.minute };
      }
    }
    this.#render();
  }

  /** The currently selected date, or `null`. */
  get value(): DoranDate | null {
    return this.#selected;
  }

  set value(date: DoranDate | null) {
    this.#selected = date;
    if (date) {
      this.#viewYear = date.year;
      this.#viewMonth = date.month;
      this.#time = { hour: date.hour, minute: date.minute };
    }
    this.#render();
  }

  get #locale(): Locale {
    return resolveLocaleAttr(this.getAttribute('locale'));
  }

  get #withTime(): boolean {
    return boolAttr(this, 'with-time');
  }

  get #weekends(): number[] {
    const attr = this.getAttribute('weekends');
    if (!attr) return [6];
    return attr
      .split(',')
      .map((s) => Number(s.trim()))
      .filter((n) => Number.isInteger(n));
  }

  get #yearSpan(): number {
    const n = Number(this.getAttribute('year-span'));
    return Number.isFinite(n) && n > 0 ? n : 60;
  }

  #isDisabled(date: DoranDate): boolean {
    const min = parseJalaliAttr(this.getAttribute('min'));
    const max = parseJalaliAttr(this.getAttribute('max'));
    if (min && date.isBefore(min.startOf('day'))) return true;
    if (max && date.isAfter(max.endOf('day'))) return true;
    return false;
  }

  #emit(date: DoranDate | null): void {
    this.dispatchEvent(
      new CustomEvent('change', {
        bubbles: false,
        detail: {
          date,
          iso: date?.toISOString() ?? null,
          value:
            date
              ?.withLocale(this.#locale)
              .format(this.#withTime ? 'YYYY/MM/DD HH:mm' : 'YYYY/MM/DD') ?? '',
        },
      }),
    );
  }

  #selectDay(date: DoranDate): void {
    if (this.#isDisabled(date)) return;
    const next = this.#withTime ? withTime(date, this.#time) : date.startOf('day');
    this.#selected = next;
    this.#viewYear = next.year;
    this.#viewMonth = next.month;
    this.#render();
    this.#emit(next);
  }

  #clear(): void {
    this.#selected = null;
    this.#render();
    this.#emit(null);
  }

  #navMonth(delta: number): void {
    const total = this.#viewYear * 12 + (this.#viewMonth - 1) + delta;
    this.#viewYear = Math.floor(total / 12);
    this.#viewMonth = (((total % 12) + 12) % 12) + 1;
    this.#render();
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
    const { action } = btn.dataset;
    switch (action) {
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
      case 'today': {
        this.#selectDay(DoranDate.now());
        break;
      }
      case 'clear': {
        this.#clear();
        break;
      }
      case 'time': {
        const field = btn.dataset.field;
        const delta = Number(btn.dataset.delta);
        if (field === 'hour') this.#time.hour = (((this.#time.hour + delta) % 24) + 24) % 24;
        else this.#time.minute = (((this.#time.minute + delta) % 60) + 60) % 60;
        if (this.#selected) {
          const next = withTime(this.#selected, this.#time);
          this.#selected = next;
          this.#emit(next);
        }
        this.#render();
        break;
      }
      default:
        break;
    }
  };

  /** The day that should be focusable, given the current view and selection. */
  #activeFocusDate(grid: MonthGrid): DoranDate {
    const cells = grid.weeks.flat();
    if (this.#focusDate && cells.some((c) => c.date.isSame(this.#focusDate!, 'day'))) {
      return this.#focusDate;
    }
    const inMonth = cells.filter((c) => c.inCurrentMonth);
    const selected = this.#selected && inMonth.find((c) => c.date.isSame(this.#selected!, 'day'));
    if (selected) return selected.date;
    const today = inMonth.find((c) => c.isToday);
    if (today) return today.date;
    return (inMonth[0] ?? cells[0]!).date;
  }

  #onKeyDown = (event: KeyboardEvent): void => {
    if (this.#panel !== 'days') return;
    if (!(event.target as HTMLElement).closest('.doran-month')) return;

    const grid = buildMonthGrid(this.#viewYear, this.#viewMonth, { today: DoranDate.now() });
    const active = this.#activeFocusDate(grid);

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
      if (!this.#isDisabled(active)) {
        this.#focusDayAfterRender = true;
        this.#selectDay(active);
      }
      return;
    }

    if (!move) return;
    event.preventDefault();

    let target = navigateFocus(active, move);
    // Skip over disabled days when arrowing (not when jumping months/years).
    if (
      move === 'prev-day' ||
      move === 'next-day' ||
      move === 'prev-week' ||
      move === 'next-week'
    ) {
      const dir = move === 'prev-day' || move === 'prev-week' ? -1 : 1;
      let guard = 0;
      while (this.#isDisabled(target) && guard < 366) {
        target = target.addDays(dir);
        guard += 1;
      }
    }

    this.#focusDate = target;
    this.#focusDayAfterRender = true;
    const inGrid = grid.weeks.flat().some((c) => c.date.isSame(target, 'day'));
    if (!inGrid) {
      this.#viewYear = target.year;
      this.#viewMonth = target.month;
    }
    this.#render();
  };

  #render(): void {
    const locale = this.#locale;
    const labels = resolveCalendarLabels(locale);
    const num = (n: number | string) => locale.formatNumber(String(n));
    const headerMode = this.getAttribute('header-mode') === 'separate' ? 'separate' : 'dropdown';

    this.classList.add('doran-calendar');
    this.setAttribute('dir', 'rtl');

    const header = this.#renderHeader(locale, headerMode, num);
    const body =
      this.#panel === 'days' ? this.#renderMonth(locale, num) : this.#renderPanel(locale, num);
    const time = this.#withTime && this.#panel === 'days' ? this.#renderTime(num) : '';
    const footerActions = parseFooterActions(this.getAttribute('footer-actions'), ['today']);
    const todayDisabled = this.#isDisabled(DoranDate.now());
    const footerButtons = footerActions
      .map((action) =>
        action === 'today'
          ? `<button type="button" class="doran-btn doran-btn--outline doran-calendar__footer-action doran-calendar__footer-action--today" data-action="today" data-footer-action="today" ${todayDisabled ? 'disabled' : ''}>${esc(labels.today)}</button>`
          : `<button type="button" class="doran-btn doran-btn--outline doran-calendar__footer-action doran-calendar__footer-action--clear" data-action="clear" data-footer-action="clear">${esc(labels.clear)}</button>`,
      )
      .join('');
    const footer =
      boolAttr(this, 'hide-footer') || footerButtons === ''
        ? ''
        : `<div class="doran-calendar__footer">${footerButtons}</div>`;

    this.innerHTML = header + body + time + footer;

    if (this.#focusDayAfterRender) {
      this.#focusDayAfterRender = false;
      this.querySelector<HTMLElement>('.doran-month [tabindex="0"]')?.focus();
    }
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

  #yearBounds(): [number, number] {
    const span = this.#yearSpan;
    return [this.#viewYear - Math.floor(span / 2), this.#viewYear + Math.ceil(span / 2)];
  }

  #renderMonth(locale: Locale, num: (n: number | string) => string): string {
    const weekends = this.#weekends;
    const showHolidays = boolAttr(this, 'show-holidays');
    const grid = buildMonthGrid(this.#viewYear, this.#viewMonth, { today: DoranDate.now() });
    const active = this.#activeFocusDate(grid);
    const gridLabel = esc(
      DoranDate.fromJalali({ year: this.#viewYear, month: this.#viewMonth, day: 1 })
        .withLocale(locale)
        .format('MMMM YYYY'),
    );

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
            const disabled = this.#isDisabled(cell.date);
            const selected = this.#selected ? cell.date.isSame(this.#selected, 'day') : false;
            const weekend = weekends.includes(cell.weekday);
            const holiday =
              showHolidays && cell.inCurrentMonth && getHolidaysOn(cell.date).length > 0;
            const cls = [
              'doran-day',
              !cell.inCurrentMonth ? 'doran-day--outside' : '',
              weekend ? 'doran-day--weekend' : '',
              holiday ? 'doran-day--holiday' : '',
              cell.isToday ? 'doran-day--today' : '',
              selected ? 'doran-day--selected' : '',
            ]
              .filter(Boolean)
              .join(' ');
            const isActive = cell.date.isSame(active, 'day');
            return (
              `<div class="doran-month__cell" role="gridcell" aria-selected="${selected}">` +
              `<button type="button" class="${cls}" ${disabled ? 'disabled' : ''} tabindex="${isActive ? 0 : -1}" data-action="select-day" data-y="${cell.date.year}" data-m="${cell.date.month}" data-d="${cell.date.day}" aria-label="${esc(cell.date.withLocale(locale).format('dddd D MMMM YYYY'))}">${esc(num(cell.day))}</button>` +
              `</div>`
            );
          })
          .join('');
        return `<div class="doran-month__week" role="row">${cells}</div>`;
      })
      .join('');

    return `<div class="doran-month" role="grid" aria-label="${gridLabel}"><div class="doran-month__weekdays" role="row">${weekdays}</div>${weeks}</div>`;
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

  #renderTime(num: (n: number | string) => string): string {
    const pad = (n: number) => num(String(n).padStart(2, '0'));
    const field = (label: string, value: string, fieldName: string) =>
      `<div class="doran-time__field" role="group" aria-label="${label}">` +
      `<button type="button" class="doran-time__btn" data-action="time" data-field="${fieldName}" data-delta="1" aria-label="افزایش ${label}">${chevronUp}</button>` +
      `<span class="doran-time__value">${value}</span>` +
      `<button type="button" class="doran-time__btn" data-action="time" data-field="${fieldName}" data-delta="-1" aria-label="کاهش ${label}">${chevronDown}</button>` +
      `</div>`;
    return (
      `<div class="doran-time" dir="ltr">` +
      field('ساعت', pad(this.#time.hour), 'hour') +
      `<span class="doran-time__sep">:</span>` +
      field('دقیقه', pad(this.#time.minute), 'minute') +
      `</div>`
    );
  }
}
