import { type DoranDate } from '@doranjs/core';
import { type DoranCalendarElement } from './calendar-element';
import { calendarIcon } from './icons';
import { boolAttr, esc, parseJalaliAttr, resolveLocaleAttr } from './util';

/**
 * `<doran-datepicker>` — a date input with a pop-over `<doran-calendar>`. Closes on
 * outside-click or Escape. Forwards `value`, `min`, `max`, `locale`, `header-mode`,
 * `with-time`, `show-holidays`, `placeholder`, and `format`.
 */
export class DoranDatePickerElement extends HTMLElement {
  static get observedAttributes(): string[] {
    return ['value', 'placeholder', 'format', 'locale', 'with-time'];
  }

  #selected: DoranDate | null = null;
  #open = false;
  #initialized = false;

  connectedCallback(): void {
    if (!this.#initialized) {
      this.#selected = parseJalaliAttr(this.getAttribute('value'));
      this.#initialized = true;
    }
    this.addEventListener('click', this.#onClick);
    document.addEventListener('pointerdown', this.#onDocPointer);
    document.addEventListener('keydown', this.#onKey);
    this.#render();
  }

  disconnectedCallback(): void {
    this.removeEventListener('click', this.#onClick);
    document.removeEventListener('pointerdown', this.#onDocPointer);
    document.removeEventListener('keydown', this.#onKey);
  }

  attributeChangedCallback(name: string): void {
    if (!this.#initialized) return;
    if (name === 'value') this.#selected = parseJalaliAttr(this.getAttribute('value'));
    this.#render();
  }

  get value(): DoranDate | null {
    return this.#selected;
  }

  set value(date: DoranDate | null) {
    this.#selected = date;
    this.#render();
  }

  get #format(): string {
    return (
      this.getAttribute('format') ??
      (boolAttr(this, 'with-time') ? 'YYYY/MM/DD HH:mm' : 'YYYY/MM/DD')
    );
  }

  #onDocPointer = (event: PointerEvent): void => {
    if (this.#open && !this.contains(event.target as Node)) {
      this.#open = false;
      this.#render();
    }
  };

  #onKey = (event: KeyboardEvent): void => {
    if (event.key === 'Escape' && this.#open) {
      this.#open = false;
      this.#render();
    }
  };

  #onClick = (event: Event): void => {
    const trigger = (event.target as HTMLElement).closest('[data-action="toggle"]');
    if (trigger && this.contains(trigger)) {
      this.#open = !this.#open;
      this.#render();
    }
  };

  #render(): void {
    const locale = resolveLocaleAttr(this.getAttribute('locale'));
    const placeholder = this.getAttribute('placeholder') ?? 'انتخاب تاریخ';
    const label = this.#selected
      ? esc(this.#selected.withLocale(locale).format(this.#format))
      : `<span class="doran-datepicker__placeholder">${esc(placeholder)}</span>`;

    this.classList.add('doran-datepicker');
    this.setAttribute('dir', 'rtl');

    this.innerHTML =
      `<button type="button" class="doran-datepicker__input" data-action="toggle" aria-haspopup="dialog" aria-expanded="${this.#open}">` +
      `<span>${label}</span><span class="doran-datepicker__icon" aria-hidden>${calendarIcon}</span>` +
      `</button>`;

    if (this.#open) {
      const popover = document.createElement('div');
      popover.className = 'doran-datepicker__popover';
      popover.setAttribute('role', 'dialog');

      const calendar = document.createElement('doran-calendar') as DoranCalendarElement;
      for (const attr of [
        'min',
        'max',
        'locale',
        'header-mode',
        'with-time',
        'show-holidays',
        'weekends',
      ]) {
        const v = this.getAttribute(attr);
        if (v !== null) calendar.setAttribute(attr, v);
      }
      if (this.#selected) {
        calendar.setAttribute('value', this.#selected.format('YYYY/MM/DD'));
      }
      calendar.addEventListener('change', (e) => {
        const detail = (e as CustomEvent).detail as { date: DoranDate };
        this.#selected = detail.date;
        if (!boolAttr(this, 'with-time')) {
          this.#open = false;
        }
        this.#render();
        this.dispatchEvent(new CustomEvent('change', { bubbles: true, detail }));
        e.stopPropagation();
      });
      popover.appendChild(calendar);
      this.appendChild(popover);
    }
  }
}
