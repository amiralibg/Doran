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
  /** Move focus into the calendar after the next render (popover just opened). */
  #focusCalendarOnRender = false;
  /** Return focus to the trigger after the next render (popover closed via keyboard). */
  #focusTriggerOnRender = false;

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
      this.#focusTriggerOnRender = true;
      this.#render();
    }
  };

  #onClick = (event: Event): void => {
    const trigger = (event.target as HTMLElement).closest('[data-action="toggle"]');
    if (trigger && this.contains(trigger)) {
      this.#open = !this.#open;
      if (this.#open) this.#focusCalendarOnRender = true;
      this.#render();
    }
  };

  /** Keeps Tab focus cycling within the open dialog. */
  #trapTab = (event: KeyboardEvent): void => {
    if (event.key !== 'Tab') return;
    const popover = this.querySelector('.doran-datepicker__popover');
    if (!popover) return;
    const focusable = popover.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );
    if (focusable.length === 0) return;
    const first = focusable[0]!;
    const last = focusable[focusable.length - 1]!;
    const active = document.activeElement;
    if (event.shiftKey && active === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
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
      popover.setAttribute('aria-modal', 'false');
      popover.setAttribute('aria-label', 'تقویم');
      popover.addEventListener('keydown', this.#trapTab);

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
        const s = this.#selected;
        calendar.setAttribute(
          'value',
          `${s.year}/${String(s.month).padStart(2, '0')}/${String(s.day).padStart(2, '0')}`,
        );
      }
      calendar.addEventListener('change', (e) => {
        const detail = (e as CustomEvent).detail as { date: DoranDate };
        this.#selected = detail.date;
        if (!boolAttr(this, 'with-time')) {
          this.#open = false;
          this.#focusTriggerOnRender = true;
        }
        this.#render();
        this.dispatchEvent(new CustomEvent('change', { bubbles: false, detail }));
        e.stopPropagation();
      });
      popover.appendChild(calendar);
      this.appendChild(popover);

      // Appending upgrades <doran-calendar> synchronously, so its focusable day exists.
      if (this.#focusCalendarOnRender) {
        this.#focusCalendarOnRender = false;
        popover.querySelector<HTMLElement>('.doran-month [tabindex="0"]')?.focus();
      }
    }

    if (this.#focusTriggerOnRender) {
      this.#focusTriggerOnRender = false;
      this.querySelector<HTMLElement>('[data-action="toggle"]')?.focus();
    }
  }
}
