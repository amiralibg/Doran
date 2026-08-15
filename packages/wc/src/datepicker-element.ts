import {
  parseJalali,
  type DayDataMap,
  type DoranDate,
  resolveCalendarLabels,
  resolveDirection,
} from '@doranjs/core';
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
  /** What the text field shows. Diverges from the value while being typed into. */
  #text = '';
  /** True while the user owns the text, so renders must not overwrite it. */
  #typing = false;
  #unparseable = false;

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
    this.addEventListener('input', this.#onInput);
    this.addEventListener('blur', this.#onFieldBlur, true);
    this.addEventListener('keydown', this.#onFieldKeyDown);
    document.addEventListener('pointerdown', this.#onDocPointer);
    document.addEventListener('keydown', this.#onKey);
    this.#render();
  }

  disconnectedCallback(): void {
    this.removeEventListener('click', this.#onClick);
    this.removeEventListener('input', this.#onInput);
    this.removeEventListener('blur', this.#onFieldBlur, true);
    this.removeEventListener('keydown', this.#onFieldKeyDown);
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

  /** Emits `change` with the same detail shape `<doran-calendar>` uses. */
  #emit(date: DoranDate | null): void {
    this.dispatchEvent(
      new CustomEvent('change', {
        bubbles: false,
        detail: {
          date,
          iso: date ? date.toISOString() : null,
          value: date ? date.format('YYYY/MM/DD') : '',
        },
      }),
    );
  }

  /** The text field inside the trigger, once rendered. */
  get #field(): HTMLInputElement | null {
    return this.querySelector<HTMLInputElement>('.doran-datepicker__control');
  }

  /** Whether a date sits inside `min`/`max`. */
  #withinBounds(date: DoranDate): boolean {
    const min = parseJalaliAttr(this.getAttribute('min'));
    const max = parseJalaliAttr(this.getAttribute('max'));
    if (min && date.isBefore(min.startOf('day'))) return false;
    if (max && date.isAfter(max.endOf('day'))) return false;
    return true;
  }

  /** Parses `raw`, returning a date only if it is complete and in range. */
  #readDate(raw: string): DoranDate | null {
    const parsed = parseJalali(raw);
    if (!parsed || !this.#withinBounds(parsed)) return null;
    return boolAttr(this, 'with-time') ? parsed : parsed.startOf('day');
  }

  /**
   * Parses on every keystroke so the calendar follows along, and commits as soon as
   * the text is a complete, in-range date. It never *raises* the invalid flag: en
   * route to `1402/05/12` the value passes through `1`, `14`, `140`, and flagging
   * each would leave the field red the whole time it is in use.
   */
  #onInput = (event: Event): void => {
    const field = event.target as HTMLInputElement;
    if (!field.classList.contains('doran-datepicker__control')) return;

    this.#typing = true;
    this.#text = field.value;

    if (field.value.trim() === '') {
      this.#setInvalid(false);
      this.#selected = null;
      this.#emit(null);
      return;
    }

    const parsed = this.#readDate(field.value);
    if (parsed) {
      this.#setInvalid(false);
      this.#selected = parsed;
      this.#emit(parsed);
      // Re-render only the calendar; rebuilding the trigger would drop the caret.
      if (this.#open) this.#render();
    }
  };

  /**
   * Blur is where the field settles: text that parsed is normalized to the display
   * format, and text that did not is left exactly as typed and marked invalid — so
   * the user can see and fix their input rather than watch it vanish.
   */
  #onFieldBlur = (event: Event): void => {
    const field = event.target as HTMLElement;
    if (!field.classList.contains('doran-datepicker__control')) return;

    const raw = this.#text.trim();
    if (raw === '' || this.#readDate(this.#text)) {
      this.#setInvalid(false);
      this.#typing = false;
      this.#render();
    } else {
      this.#setInvalid(true);
    }
  };

  #onFieldKeyDown = (event: KeyboardEvent): void => {
    const field = event.target as HTMLElement;
    if (!field.classList.contains('doran-datepicker__control')) return;

    if (event.key === 'ArrowDown' && !this.#open) {
      // The conventional way to reach a picker's calendar from its input.
      event.preventDefault();
      this.#open = true;
      this.#render();
    } else if (event.key === 'Enter' && this.#open) {
      event.preventDefault();
      this.#close(true);
    }
  };

  /** Toggles the invalid state in place, without a re-render that would drop focus. */
  #setInvalid(next: boolean): void {
    if (this.#unparseable === next) return;
    this.#unparseable = next;

    const field = this.#field;
    const wrapper = this.querySelector<HTMLElement>('.doran-datepicker__input');
    if (next) {
      field?.setAttribute('aria-invalid', 'true');
      wrapper?.setAttribute('data-invalid', 'true');
    } else {
      field?.removeAttribute('aria-invalid');
      wrapper?.removeAttribute('data-invalid');
    }
    this.dispatchEvent(new CustomEvent('parseerror', { detail: { invalid: next } }));
  }

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
    const labels = resolveCalendarLabels(locale);
    const placeholder = this.getAttribute('placeholder') ?? labels.datePlaceholder;
    const iconPosition = this.#iconPosition;
    const textAlign = this.#textAlign;
    const dropdownWidth = this.getAttribute('dropdown-width')?.trim() || 'auto';
    const dropdownWidthMode =
      dropdownWidth === 'auto' || dropdownWidth === 'trigger' ? dropdownWidth : 'custom';
    const valueText = this.#selected ? this.#selected.withLocale(locale).format(this.#format) : '';
    if (!this.#typing) this.#text = valueText;
    // Unlike a button, an input's value is announced separately from its name, so
    // naming the field costs nothing and the placeholder is the best default.
    const explicitLabel = this.getAttribute('aria-label');
    const fieldLabel = explicitLabel ?? placeholder;
    const openLabel = explicitLabel ? `${explicitLabel} — ${labels.calendar}` : labels.openCalendar;

    this.classList.add('doran-datepicker');
    this.classList.toggle('doran-datepicker--icon-left', iconPosition === 'left');
    this.classList.toggle('doran-datepicker--icon-right', iconPosition === 'right');
    this.classList.toggle('doran-datepicker--text-left', textAlign === 'left');
    this.classList.toggle('doran-datepicker--text-right', textAlign === 'right');
    this.setAttribute('dir', resolveDirection(locale));
    this.dataset.iconPosition = iconPosition;
    this.dataset.textAlign = textAlign;
    this.dataset.dropdownWidth = dropdownWidthMode;
    const inputWidth = this.getAttribute('input-width')?.trim();
    if (inputWidth) this.style.setProperty('--doran-input-width', inputWidth);
    else this.style.removeProperty('--doran-input-width');

    const disabled = boolAttr(this, 'disabled');
    const icon = boolAttr(this, 'hide-icon')
      ? ''
      : `<button type="button" class="doran-datepicker__icon" data-action="toggle" tabindex="-1" aria-label="${esc(openLabel)}" aria-haspopup="dialog" aria-expanded="${this.#open}" ${disabled ? 'disabled' : ''}>${this.#customIcon ? '' : calendarIcon}</button>`;

    // Rebuilding the trigger would wipe the caret and the selection mid-typing, so
    // once the field has focus only the pop-over is re-rendered.
    const fieldHasFocus = this.#field !== null && document.activeElement === this.#field;

    this.#destroyPopover();

    if (!fieldHasFocus) {
      // dir="auto": digit-only values (e.g. `YYYY-MM-DD HH:mm`) resolve LTR so the
      // host's RTL context can't reorder the date/time runs, while Persian
      // placeholders and month-name formats still resolve RTL.
      this.innerHTML =
        `<div class="doran-datepicker__input" data-icon-position="${iconPosition}" data-text-align="${textAlign}"${disabled ? ' data-disabled="true"' : ''}${this.#unparseable ? ' data-invalid="true"' : ''}>` +
        `<input type="text" class="doran-datepicker__control" inputmode="numeric" autocomplete="off" dir="auto"` +
        ` value="${esc(this.#text)}" placeholder="${esc(placeholder)}" aria-label="${esc(fieldLabel)}"` +
        ` data-text-align="${textAlign}"` +
        ` aria-haspopup="dialog" aria-expanded="${this.#open}"${this.#unparseable ? ' aria-invalid="true"' : ''}` +
        `${disabled ? ' disabled' : ''}${boolAttr(this, 'readonly') ? ' readonly' : ''} />` +
        icon +
        `</div>`;

      const trigger = this.querySelector<HTMLElement>('.doran-datepicker__input');
      if (trigger) {
        trigger.style.flexDirection = iconPosition === 'left' ? 'row' : 'row-reverse';
        if (inputWidth) trigger.style.width = inputWidth;
      }
      const control = this.#field;
      if (control) {
        control.style.flex = '1';
        control.style.textAlign = textAlign;
      }

      // Re-insert the user's custom icon node (innerHTML wiped the slot span).
      if (this.#customIcon && !boolAttr(this, 'hide-icon')) {
        this.querySelector('.doran-datepicker__icon')?.appendChild(this.#customIcon);
      }
    } else if (this.#field) {
      // Keep the pieces that can change while typing in sync, in place.
      this.#field.setAttribute('aria-expanded', String(this.#open));
    }

    if (this.#open) {
      const popover = document.createElement('div');
      popover.className = `doran-datepicker__popover doran-datepicker__popover--${dropdownWidthMode}`;
      popover.dataset.dropdownWidth = dropdownWidthMode;
      popover.setAttribute('role', 'dialog');
      popover.setAttribute('aria-modal', 'false');
      popover.setAttribute('aria-label', labels.calendar);
      popover.setAttribute('dir', resolveDirection(locale));
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
      // Measure the bordered field, not the host: `dropdown-width="trigger"` should
      // match what the user sees.
      const field = this.querySelector<HTMLElement>('.doran-datepicker__input');
      if (field) {
        this.#stopTracking = trackPopoverPosition(field, popover, {
          matchTriggerWidth: dropdownWidthMode === 'trigger',
        });
      }

      // Note: the calendar deliberately does not take focus on open. The trigger is
      // a text field now, and yanking the caret out mid-typing would make it
      // unusable; keyboard users reach the grid by tabbing forward.
    }

    if (this.#focusTriggerOnRender) {
      this.#focusTriggerOnRender = false;
      this.querySelector<HTMLElement>('[data-action="toggle"]')?.focus();
    }
  }
}
