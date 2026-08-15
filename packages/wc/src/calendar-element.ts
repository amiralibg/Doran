import {
  DoranDate,
  indexDayData,
  resolveCalendarLabels,
  type DayDataMap,
  type DayDatum,
  type Locale,
  resolveDirection,
} from '@doranjs/core';
import { isDayBlocked, renderDayCell } from './day-render';
import { buildMonthGrid, navigateFocus, type GridNav, type MonthGrid } from './grid';
import { hasHolidayOn } from './holidays-cache';
import { chevronDown, chevronLeft, chevronRight, chevronUp } from './icons';
import { captureSlots, restoreSlots, slotPlaceholder, type SlotName } from './slots';
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
  #dayData: DayDataMap | null = null;
  #dayIndex: Map<string, DayDatum> | null = null;
  #disabledDates: ((day: DoranDate) => boolean) | null = null;
  /** Author-supplied `[slot]` children, captured before the first render. */
  #slots: Map<SlotName, Element> = new Map();

  /**
   * Per-day annotations keyed by Jalali `YYYY-M-D` — a fare, a count, a sold-out
   * flag. Set as a JS property (render functions can't cross an HTML attribute):
   *
   * ```js
   * picker.dayData = { '1404-5-12': { text: '۱٬۲۰۰٬۰۰۰', tone: 'low' } };
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

  /** Blocks individual days beyond `min`/`max` — booked dates, sold-out departures. */
  get disabledDates(): ((day: DoranDate) => boolean) | null {
    return this.#disabledDates;
  }

  set disabledDates(value: ((day: DoranDate) => boolean) | null) {
    this.#disabledDates = value;
    if (this.#initialized) this.#render();
  }
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

  /**
   * Whether a day is outside `min`/`max`. Keyboard navigation skips these — a bounds
   * gap can span decades — but lands on individually blocked days so they announce why.
   */
  #isOutOfBounds(date: DoranDate): boolean {
    const min = parseJalaliAttr(this.getAttribute('min'));
    const max = parseJalaliAttr(this.getAttribute('max'));
    if (min && date.isBefore(min.startOf('day'))) return true;
    if (max && date.isAfter(max.endOf('day'))) return true;
    return false;
  }

  #isDisabled(date: DoranDate): boolean {
    if (this.#isOutOfBounds(date)) return true;
    if (this.#disabledDates?.(date)) return true;
    return isDayBlocked(date, false, this.#dayIndex);
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
        this.#stepTime(btn.dataset.field ?? 'hour', Number(btn.dataset.delta));
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

  /** Applies a delta to one time field, wrapping, and re-renders. */
  #stepTime(field: string, delta: number): void {
    if (field === 'hour') this.#time.hour = (((this.#time.hour + delta) % 24) + 24) % 24;
    else this.#time.minute = (((this.#time.minute + delta) % 60) + 60) % 60;
    this.#commitTime();
  }

  /** Jumps one time field straight to a value, for Home and End. */
  #setTime(field: string, value: number): void {
    if (field === 'hour') this.#time.hour = value;
    else this.#time.minute = value;
    this.#commitTime();
  }

  #commitTime(): void {
    if (this.#selected) {
      const next = withTime(this.#selected, this.#time);
      this.#selected = next;
      this.#emit(next);
    }
    this.#render();
  }

  /**
   * Arrow keys on a time spinbutton. Without this the only way to change the time
   * was to Tab onto a chevron and press Enter.
   */
  #onTimeKeyDown(event: KeyboardEvent, spin: HTMLElement): boolean {
    const field = spin.dataset.field ?? 'hour';
    const max = Number(spin.dataset.max ?? 59);
    const PAGE = 5;

    switch (event.key) {
      case 'ArrowUp':
        this.#stepTime(field, 1);
        break;
      case 'ArrowDown':
        this.#stepTime(field, -1);
        break;
      case 'PageUp':
        this.#stepTime(field, PAGE);
        break;
      case 'PageDown':
        this.#stepTime(field, -PAGE);
        break;
      case 'Home':
        this.#setTime(field, 0);
        break;
      case 'End':
        this.#setTime(field, max);
        break;
      default:
        return false;
    }
    event.preventDefault();
    // The re-render replaced the node, so put focus back where the user left it.
    this.querySelector<HTMLElement>(`.doran-time__value[data-field="${field}"]`)?.focus();
    return true;
  }

  #onKeyDown = (event: KeyboardEvent): void => {
    const spin = (event.target as HTMLElement).closest<HTMLElement>('.doran-time__value');
    if (spin) {
      this.#onTimeKeyDown(event, spin);
      return;
    }
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
      while (this.#isOutOfBounds(target) && guard < 366) {
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
    this.setAttribute('dir', resolveDirection(locale));

    const header = this.#renderHeader(locale, headerMode, num);
    const legend = slotPlaceholder(this.#slots, 'legend');
    const panel =
      this.#panel === 'days' ? this.#renderMonth(locale, num) : this.#renderPanel(locale, num);
    // The row wrapper only appears when there is an aside to place, so the default
    // markup — and anyone's CSS targeting it — is unchanged.
    const body = this.#slots.has('aside')
      ? `<div class="doran-calendar__body">${slotPlaceholder(this.#slots, 'aside')}<div class="doran-calendar__main">${panel}</div></div>`
      : panel;
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
    const footerSlot = slotPlaceholder(this.#slots, 'footer');
    const footer =
      boolAttr(this, 'hide-footer') || (footerButtons === '' && footerSlot === '')
        ? ''
        : `<div class="doran-calendar__footer">${footerSlot}${footerButtons}</div>`;

    this.innerHTML = header + legend + body + time + footer;
    restoreSlots(this, this.#slots);

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
    const labels = resolveCalendarLabels(locale);
    // "Previous" points back along the reading direction.
    const rtl = resolveDirection(locale) === 'rtl';
    const prevChevron = rtl ? chevronRight : chevronLeft;
    const nextChevron = rtl ? chevronLeft : chevronRight;
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
      heading = `<select class="doran-calendar__heading-btn" data-role="month" aria-label="${esc(labels.month)}">${months}</select><select class="doran-calendar__heading-btn" data-role="year" aria-label="${esc(labels.year)}">${years}</select>`;
    } else {
      heading =
        `<button type="button" class="doran-calendar__heading-btn ${this.#panel === 'months' ? 'doran-calendar__heading-btn--active' : ''}" data-action="toggle-panel" data-panel="months">${esc(locale.months[this.#viewMonth - 1]!)}${chevronDown}</button>` +
        `<button type="button" class="doran-calendar__heading-btn ${this.#panel === 'years' ? 'doran-calendar__heading-btn--active' : ''}" data-action="toggle-panel" data-panel="years">${esc(num(this.#viewYear))}${chevronDown}</button>`;
    }

    return (
      `<div class="doran-calendar__header">` +
      `<button type="button" class="doran-calendar__nav" data-action="prev" aria-label="${esc(labels.previousMonth)}">${prevChevron}</button>` +
      `<div class="doran-calendar__heading" aria-live="polite">${heading}</div>` +
      `<button type="button" class="doran-calendar__nav" data-action="next" aria-label="${esc(labels.nextMonth)}">${nextChevron}</button>` +
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
          .map((cell) =>
            renderDayCell(
              cell,
              {
                selected: this.#selected ? cell.date.isSame(this.#selected, 'day') : false,
                disabled: this.#isDisabled(cell.date),
                holiday: showHolidays && cell.inCurrentMonth && hasHolidayOn(cell.date),
                weekend: weekends.includes(cell.weekday),
                active: cell.date.isSame(active, 'day'),
              },
              { locale, num, dayIndex: this.#dayIndex },
            ),
          )
          .join('');
        return `<div class="doran-month__week" role="row">${cells}</div>`;
      })
      .join('');

    const richClass = this.#dayIndex ? ' doran-month--rich' : '';
    return `<div class="doran-month${richClass}" role="grid" aria-label="${gridLabel}"><div class="doran-month__weekdays" role="row">${weekdays}</div>${weeks}</div>`;
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
    const labels = resolveCalendarLabels(this.#locale);
    const pad = (n: number) => num(String(n).padStart(2, '0'));
    // The value is a `spinbutton`, so the field is a tab stop that answers to the
    // arrow keys. Previously the only route was Tab onto a chevron and press Enter.
    const field = (label: string, value: number, max: number, fieldName: string) =>
      `<div class="doran-time__field" role="group" aria-label="${esc(label)}">` +
      `<button type="button" class="doran-time__btn" tabindex="-1" data-action="time" data-field="${fieldName}" data-delta="1" aria-label="${esc(`${labels.increase} ${label}`)}">${chevronUp}</button>` +
      `<span class="doran-time__value" role="spinbutton" tabindex="0" data-field="${fieldName}" data-max="${max}"` +
      ` aria-label="${esc(label)}" aria-valuenow="${value}" aria-valuemin="0" aria-valuemax="${max}" aria-valuetext="${esc(pad(value))}">${pad(value)}</span>` +
      `<button type="button" class="doran-time__btn" tabindex="-1" data-action="time" data-field="${fieldName}" data-delta="-1" aria-label="${esc(`${labels.decrease} ${label}`)}">${chevronDown}</button>` +
      `</div>`;
    return (
      `<div class="doran-time" dir="ltr">` +
      field(labels.hour, this.#time.hour, 23, 'hour') +
      `<span class="doran-time__sep">:</span>` +
      field(labels.minute, this.#time.minute, 59, 'minute') +
      `</div>`
    );
  }
}
