import { type DayDataMap, type DoranDate } from '@doranjs/core';
import { type DoranCalendarElement } from './calendar-element';
import { calendarIcon } from './icons';
import { trackPopoverPosition } from './popover-position';
import { captureSlots, type SlotName } from './slots';
import { boolAttr, esc, parseJalaliAttr, resolveLocaleAttr } from './util';

/**
 * `<doran-datepicker>` — a date input with a pop-over `<doran-calendar>`. Closes on
 * outside-click or Escape. Forwards calendar configuration including `min`, `max`,
 * `locale`, `header-mode`, `with-time`, `show-holidays`, and `footer-actions`.
 * Customize the trigger with `icon-position`, `text-align`, `input-width`, and
 * `dropdown-width` (`auto`, `trigger`, or a CSS width).
 *
 * The pop-over is appended to `document.body` and positioned `fixed` from the
 * trigger rect, so it always renders above the page and is never clipped by an
 * `overflow: hidden/auto` ancestor.
 *
 * Icon: set `hide-icon` to render no trigger icon, or provide a custom one as a
 * light-DOM child: `<doran-datepicker><svg slot="icon" …></svg></doran-datepicker>`.
 */
export class DoranDatePickerElement extends HTMLElement {
  static get observedAttributes(): string[] {
    return [
      'value',
      'placeholder',
      'format',
      'locale',
      'min',
      'max',
      'header-mode',
      'with-time',
      'show-holidays',
      'weekends',
      'hide-footer',
      'footer-actions',
      'year-span',
      'hide-icon',
      'icon-position',
      'text-align',
      'input-width',
      'dropdown-width',
      'disabled',
    ];
  }

  #selected: DoranDate | null = null;
  #open = false;
  #initialized = false;
  /** Move focus into the calendar after the next render (popover just opened). */
  #focusCalendarOnRender = false;
  /** Return focus to the trigger after the next render (popover closed via keyboard). */
  #focusTriggerOnRender = false;
  /** The body-portaled pop-over while open. */
  #popover: HTMLDivElement | null = null;
  /** Stops the pop-over's position tracking (scroll/resize/size listeners). */
  #stopTracking: (() => void) | null = null;
  /** A user-supplied `[slot="icon"]` child, captured before the first render. */
  #customIcon: Element | null = null;
  /** `[slot="legend"|"aside"|"footer"]` children, forwarded to the pop-over calendar. */
  #slots: Map<SlotName, Element> = new Map();
  #dayData: DayDataMap | null = null;
  #disabledDates: ((day: DoranDate) => boolean) | null = null;

  /**
   * Per-day annotations keyed by Jalali `YYYY-M-D`, forwarded to the pop-over
   * calendar. Set as a JS property:
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
    if (this.#open) this.#render();
  }

  /** Blocks individual days beyond `min`/`max`, forwarded to the pop-over calendar. */
  get disabledDates(): ((day: DoranDate) => boolean) | null {
    return this.#disabledDates;
  }

  set disabledDates(value: ((day: DoranDate) => boolean) | null) {
    this.#disabledDates = value;
    if (this.#open) this.#render();
  }

  connectedCallback(): void {
    if (!this.#initialized) {
      this.#selected = parseJalaliAttr(this.getAttribute('value'));
      this.#customIcon = this.querySelector('[slot="icon"]');
      this.#slots = captureSlots(this);
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
    this.#destroyPopover();
  }

  attributeChangedCallback(name: string): void {
    if (!this.#initialized) return;
    if (name === 'value') this.#selected = parseJalaliAttr(this.getAttribute('value'));
    if (name === 'disabled' && boolAttr(this, 'disabled')) this.#open = false;
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

  get #iconPosition(): 'left' | 'right' {
    return this.getAttribute('icon-position') === 'right' ? 'right' : 'left';
  }

  get #textAlign(): 'left' | 'right' {
    return this.getAttribute('text-align') === 'left' ? 'left' : 'right';
  }

  #onDocPointer = (event: PointerEvent): void => {
    const target = event.target as Node;
    // The pop-over lives in a body portal, so check both trees.
    if (this.#open && !this.contains(target) && !this.#popover?.contains(target)) {
      this.#open = false;
      this.#render();
    }
  };

  /** Closes the pop-over, optionally returning focus to the trigger. */
  #close(restoreFocus: boolean): void {
    if (!this.#open) return;
    this.#open = false;
    this.#focusTriggerOnRender = restoreFocus;
    this.#render();
  }

  #onKey = (event: KeyboardEvent): void => {
    if (event.key === 'Escape' && this.#open) this.#close(true);
  };

  #onClick = (event: Event): void => {
    const trigger = (event.target as HTMLElement).closest('[data-action="toggle"]');
    if (trigger && this.contains(trigger)) {
      if (boolAttr(this, 'disabled')) return;
      this.#open = !this.#open;
      if (this.#open) this.#focusCalendarOnRender = true;
      this.#render();
    }
  };

  /**
   * Tabbing past either end of the pop-over closes it and moves on.
   *
   * The pop-over is `aria-modal="false"`, which promises assistive technology that
   * the rest of the page is still reachable. A focus trap broke that promise: the
   * keyboard could never leave. Escape still closes and restores focus.
   */
  #onPopoverKeyDown = (event: KeyboardEvent): void => {
    if (event.key !== 'Tab') return;
    const popover = this.#popover;
    if (!popover) return;
    const focusable = popover.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );
    if (focusable.length === 0) return;
    const first = focusable[0]!;
    const last = focusable[focusable.length - 1]!;
    const active = document.activeElement;
    if (event.shiftKey && active === first) {
      // Backwards out of the pop-over lands on the trigger, where Tab began.
      event.preventDefault();
      this.#close(true);
    } else if (!event.shiftKey && active === last) {
      // Forwards out continues into the page; let the browser pick the next stop.
      this.#close(false);
    }
  };

  /** Removes the body-portaled pop-over and its position listeners. */
  #destroyPopover(): void {
    this.#stopTracking?.();
    this.#stopTracking = null;
    this.#popover?.remove();
    this.#popover = null;
  }

  #render(): void {
    if (boolAttr(this, 'disabled')) this.#open = false;
    const locale = resolveLocaleAttr(this.getAttribute('locale'));
    const placeholder = this.getAttribute('placeholder') ?? 'انتخاب تاریخ';
    const iconPosition = this.#iconPosition;
    const textAlign = this.#textAlign;
    const dropdownWidth = this.getAttribute('dropdown-width')?.trim() || 'auto';
    const dropdownWidthMode =
      dropdownWidth === 'auto' || dropdownWidth === 'trigger' ? dropdownWidth : 'custom';
    const label = this.#selected
      ? esc(this.#selected.withLocale(locale).format(this.#format))
      : esc(placeholder);
    const labelClass = `doran-datepicker__value${this.#selected ? '' : ' doran-datepicker__placeholder'}`;
    // `aria-label` replaces the button's text rather than adding to it, so naming the
    // field must not cost the value: the description says what the control is, the
    // value says what it holds. An explicit `aria-label` attribute wins.
    const describedAs = this.getAttribute('aria-label') ?? placeholder;
    const triggerLabel = esc(
      this.#selected
        ? `${describedAs}: ${this.#selected.withLocale(locale).format(this.#format)}`
        : describedAs,
    );

    this.classList.add('doran-datepicker');
    this.classList.toggle('doran-datepicker--icon-left', iconPosition === 'left');
    this.classList.toggle('doran-datepicker--icon-right', iconPosition === 'right');
    this.classList.toggle('doran-datepicker--text-left', textAlign === 'left');
    this.classList.toggle('doran-datepicker--text-right', textAlign === 'right');
    this.setAttribute('dir', 'rtl');
    this.dataset.iconPosition = iconPosition;
    this.dataset.textAlign = textAlign;
    this.dataset.dropdownWidth = dropdownWidthMode;
    const inputWidth = this.getAttribute('input-width')?.trim();
    if (inputWidth) this.style.setProperty('--doran-input-width', inputWidth);
    else this.style.removeProperty('--doran-input-width');

    const icon = boolAttr(this, 'hide-icon')
      ? ''
      : `<span class="doran-datepicker__icon" aria-hidden>${this.#customIcon ? '' : calendarIcon}</span>`;
    // dir="auto": digit-only values (e.g. `YYYY-MM-DD HH:mm`) resolve LTR so the
    // host's RTL context can't reorder the date/time runs, while Persian
    // placeholders and month-name formats still resolve RTL.
    const labelHtml = `<span class="${labelClass}" data-text-align="${textAlign}" dir="auto">${label}</span>`;

    this.#destroyPopover();
    this.innerHTML =
      `<button type="button" class="doran-datepicker__input" data-action="toggle" data-icon-position="${iconPosition}" data-text-align="${textAlign}" aria-haspopup="dialog" aria-expanded="${this.#open}" aria-label="${triggerLabel}" ${boolAttr(this, 'disabled') ? 'disabled' : ''}>` +
      labelHtml +
      icon +
      `</button>`;
    const trigger = this.querySelector<HTMLElement>('[data-action="toggle"]');
    if (trigger) {
      trigger.style.flexDirection = iconPosition === 'left' ? 'row' : 'row-reverse';
      if (inputWidth) trigger.style.width = inputWidth;
    }
    const value = this.querySelector<HTMLElement>('.doran-datepicker__value');
    if (value) {
      value.style.flex = '1';
      value.style.textAlign = textAlign;
    }

    // Re-insert the user's custom icon node (innerHTML wiped the slot span).
    if (this.#customIcon && !boolAttr(this, 'hide-icon')) {
      this.querySelector('.doran-datepicker__icon')?.appendChild(this.#customIcon);
    }

    if (this.#open) {
      const popover = document.createElement('div');
      popover.className = `doran-datepicker__popover doran-datepicker__popover--${dropdownWidthMode}`;
      popover.dataset.dropdownWidth = dropdownWidthMode;
      popover.setAttribute('role', 'dialog');
      popover.setAttribute('aria-modal', 'false');
      popover.setAttribute('aria-label', 'تقویم');
      popover.setAttribute('dir', 'rtl');
      popover.addEventListener('keydown', this.#onPopoverKeyDown);

      const calendar = document.createElement('doran-calendar') as DoranCalendarElement;
      for (const attr of [
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
      // Properties, not attributes — a day map and a predicate can't cross HTML.
      // Set before appending so the calendar's first render already has them.
      if (this.#dayData) calendar.dayData = this.#dayData;
      if (this.#disabledDates) calendar.disabledDates = this.#disabledDates;
      // Move the author's slot children into the calendar for as long as it lives,
      // so `<doran-datepicker><div slot="legend">` lands inside the popover.
      for (const [name, node] of this.#slots) {
        node.setAttribute('slot', name);
        calendar.appendChild(node);
      }
      calendar.addEventListener('change', (e) => {
        const detail = (e as CustomEvent).detail as {
          date: DoranDate | null;
          iso: string | null;
          value: string;
        };
        this.#selected = detail.date;
        if (detail.date === null || !boolAttr(this, 'with-time')) {
          this.#open = false;
          this.#focusTriggerOnRender = true;
        }
        this.#render();
        this.dispatchEvent(new CustomEvent('change', { bubbles: false, detail }));
        e.stopPropagation();
      });
      popover.appendChild(calendar);
      if (dropdownWidthMode === 'custom') popover.style.width = dropdownWidth;
      // Body portal + fixed positioning: never clipped by overflow ancestors.
      document.body.appendChild(popover);
      // Preserve a property-set value's time-of-day; the value attribute only
      // carries a Jalali date and cannot represent time.
      if (this.#selected) calendar.value = this.#selected;
      this.#popover = popover;
      if (trigger) {
        this.#stopTracking = trackPopoverPosition(trigger, popover, {
          matchTriggerWidth: dropdownWidthMode === 'trigger',
        });
      }

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
