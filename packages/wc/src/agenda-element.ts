import { DoranDate, type Locale, resolveDirection } from '@doranjs/core';
import { esc, parseJalaliAttr, resolveLocaleAttr } from './util';

/** A single event rendered in the agenda. */
export interface AgendaEvent {
  id: string;
  /** The day the event falls on. */
  date: DoranDate;
  title: string;
  description?: string;
  /** Optional accent color for the event marker. */
  color?: string;
}

/**
 * `<doran-agenda>` — a vertical agenda: a sequence of days, each listing the events that
 * fall on it. RTL-first and accessible, mirroring the React `DoranAgenda`.
 *
 * Attributes: `start` (`YYYY/MM/DD`, defaults to today), `days` (default `7`), `locale`
 * (`fa`|`en`). Set the `events` array and an optional `renderEvent` formatter as JS
 * properties. Clicking a day header emits a `selectday` CustomEvent with `{ date }`.
 */
export class DoranAgendaElement extends HTMLElement {
  static get observedAttributes(): string[] {
    return ['start', 'days', 'locale'];
  }

  #events: AgendaEvent[] = [];
  #start: DoranDate | null = null;
  #renderEvent: ((event: AgendaEvent) => string) | null = null;
  #initialized = false;

  connectedCallback(): void {
    this.#initialized = true;
    this.addEventListener('click', this.#onClick);
    this.#render();
  }

  disconnectedCallback(): void {
    this.removeEventListener('click', this.#onClick);
  }

  attributeChangedCallback(): void {
    if (this.#initialized) this.#render();
  }

  /** Events to place on the timeline. */
  get events(): AgendaEvent[] {
    return this.#events;
  }

  set events(value: AgendaEvent[]) {
    this.#events = Array.isArray(value) ? value : [];
    this.#render();
  }

  /** First day of the agenda. Accepts a {@link DoranDate} or a `YYYY/MM/DD` string. */
  get start(): DoranDate {
    return this.#resolvedStart();
  }

  set start(value: DoranDate | string | null) {
    this.#start = typeof value === 'string' ? parseJalaliAttr(value) : value;
    this.#render();
  }

  /** Optional custom event renderer returning an HTML string for the event body. */
  set renderEvent(fn: ((event: AgendaEvent) => string) | null) {
    this.#renderEvent = fn;
    this.#render();
  }

  get #locale(): Locale {
    return resolveLocaleAttr(this.getAttribute('locale'));
  }

  get #days(): number {
    const n = Number(this.getAttribute('days'));
    return Number.isInteger(n) && n > 0 ? n : 7;
  }

  #resolvedStart(): DoranDate {
    return (this.#start ?? parseJalaliAttr(this.getAttribute('start')) ?? DoranDate.now()).startOf(
      'day',
    );
  }

  #onClick = (event: Event): void => {
    const btn = (event.target as HTMLElement).closest<HTMLElement>('[data-action="select-day"]');
    if (!btn || !this.contains(btn)) return;
    const offset = Number(btn.dataset.offset);
    if (!Number.isInteger(offset)) return;
    const day = this.#resolvedStart().addDays(offset);
    this.dispatchEvent(new CustomEvent('selectday', { bubbles: false, detail: { date: day } }));
  };

  #render(): void {
    if (!this.#initialized) return;
    const locale = this.#locale;
    const start = this.#resolvedStart();
    const dayKey = (d: DoranDate) => d.withLocale(locale).format('YYYY-MM-DD');

    const eventsByDay = new Map<string, AgendaEvent[]>();
    for (const event of this.#events) {
      const key = dayKey(event.date);
      const bucket = eventsByDay.get(key) ?? [];
      bucket.push(event);
      eventsByDay.set(key, bucket);
    }

    this.classList.add('doran-agenda');
    this.setAttribute('dir', resolveDirection(this.#locale));

    let html = '';
    for (let i = 0; i < this.#days; i += 1) {
      const day = start.addDays(i);
      const localized = day.withLocale(locale);
      const dayEvents = eventsByDay.get(dayKey(day)) ?? [];
      const isWeekend = day.dayOfWeek === 6; // Friday

      const eventsHtml = dayEvents.length
        ? dayEvents.map((e) => this.#renderEventHtml(e)).join('')
        : `<span class="doran-agenda__empty">رویدادی نیست</span>`;

      html +=
        `<section class="doran-agenda__day ${isWeekend ? 'doran-agenda__day--weekend' : ''}">` +
        `<button type="button" class="doran-agenda__date" data-action="select-day" data-offset="${i}" aria-label="${esc(localized.format('dddd D MMMM YYYY'))}">` +
        `<span class="doran-agenda__weekday">${esc(localized.format('dddd'))}</span>` +
        `<span class="doran-agenda__daynum">${esc(localized.format('D MMMM'))}</span>` +
        `</button>` +
        `<div class="doran-agenda__events">${eventsHtml}</div>` +
        `</section>`;
    }

    this.innerHTML = html;
  }

  #renderEventHtml(event: AgendaEvent): string {
    if (this.#renderEvent) return this.#renderEvent(event);
    const desc = event.description
      ? `<div class="doran-agenda__event-desc">${esc(event.description)}</div>`
      : '';
    return (
      `<div class="doran-agenda__event">` +
      `<span class="doran-agenda__marker" style="background: ${esc(event.color ?? 'var(--doran-primary)')}" aria-hidden></span>` +
      `<div><div class="doran-agenda__event-title">${esc(event.title)}</div>${desc}</div>` +
      `</div>`
    );
  }
}
