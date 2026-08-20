import {
  applyFormatMask,
  parseJalali,
  resolveCalendarLabels,
  resolveDirection,
  type DayDataMap,
  type DoranDate,
} from '@doranjs/core';
import { calendarIcon } from './icons';
import { trackPopoverPosition } from './popover-position';
import { captureSlots, type SlotName } from './slots';
import { boolAttr, esc, parseJalaliAttr, resolveLocaleAttr } from './util';
import type { DoranRangePickerElement } from './rangepicker-element';

/** Which end of the range the user is editing. */
type Endpoint = 'start' | 'end';

/**
 * `<doran-rangedatepicker>` — a date-range input with a pop-over
 * `<doran-rangepicker>`: one trigger holding two fields, either typable or fillable
 * from the grid. The web-component counterpart of React's `DoranRangeDatePicker`.
 *
 * Attributes: `locale`, `min`, `max`, `format`, `start-placeholder`,
 * `end-placeholder`, `disabled`, `readonly`, `mode` (`popover`|`sheet`|`auto`),
 * `presets`, `months`, `show-holidays`, `weekends`, `year-span`, `header-mode`, and
 * `input-width`. `format` (default `YYYY/MM/DD`) sets the display pattern of both
 * fields; typed digits are masked into that shape as they are entered.
 *
 * Emits a `change` CustomEvent with `{ start, end }` whenever either end changes.
 * Both ends are kept in order: an end before the start swaps them.
 */
export class DoranRangeDatePickerElement extends HTMLElement {
  static get observedAttributes(): string[] {
    return [
      'locale',
      'min',
      'max',
      'format',
      'start-placeholder',
      'end-placeholder',
      'disabled',
      'readonly',
      'mode',
      'presets',
      'months',
      'show-holidays',
      'weekends',
      'year-span',
      'header-mode',
      'input-width',
    ];
  }

  #start: DoranDate | null = null;
  #end: DoranDate | null = null;
  #open = false;
  #initialized = false;
  #editing: Endpoint = 'start';
  #popover: HTMLDivElement | null = null;
  #stopTracking: (() => void) | null = null;
  #focusTriggerOnRender = false;
  #slots: Map<SlotName, Element> = new Map();
  #dayData: DayDataMap | null = null;
  #disabledDates: ((day: DoranDate) => boolean) | null = null;
  /** Text of each field. Diverges from the value while being typed into. */
  #text: Record<Endpoint, string> = { start: '', end: '' };
  #typing: Endpoint | null = null;

  /** Per-day annotations keyed by Jalali `YYYY-M-D`, forwarded to the pop-over grid. */
  get dayData(): DayDataMap | null {
    return this.#dayData;
  }

  set dayData(value: DayDataMap | null) {
    this.#dayData = value;
    if (this.#open) this.#render();
  }

  /** Blocks individual days beyond `min`/`max` — dates already booked, for instance. */
  get disabledDates(): ((day: DoranDate) => boolean) | null {
    return this.#disabledDates;
  }

  set disabledDates(value: ((day: DoranDate) => boolean) | null) {
    this.#disabledDates = value;
    if (this.#open) this.#render();
  }

  get value(): { start: DoranDate | null; end: DoranDate | null } {
    return { start: this.#start, end: this.#end };
  }

  set value(range: { start: DoranDate | null; end: DoranDate | null } | null) {
    this.#start = range?.start ?? null;
    this.#end = range?.end ?? null;
    if (this.#initialized) this.#render();
  }

  connectedCallback(): void {
    if (!this.#initialized) {
      this.#slots = captureSlots(this);
      this.#initialized = true;
    }
    this.addEventListener('click', this.#onClick);
    this.addEventListener('input', this.#onInput);
    this.addEventListener('focusin', this.#onFocusIn);
    this.addEventListener('keydown', this.#onKeyDown);
    document.addEventListener('pointerdown', this.#onDocPointer);
    document.addEventListener('keydown', this.#onDocKey);
    this.#render();
  }

  disconnectedCallback(): void {
    this.removeEventListener('click', this.#onClick);
    this.removeEventListener('input', this.#onInput);
    this.removeEventListener('focusin', this.#onFocusIn);
    this.removeEventListener('keydown', this.#onKeyDown);
    document.removeEventListener('pointerdown', this.#onDocPointer);
    document.removeEventListener('keydown', this.#onDocKey);
    this.#destroyPopover();
  }

  attributeChangedCallback(): void {
    if (this.#initialized) this.#render();
  }

  get #format(): string {
    return this.getAttribute('format') ?? 'YYYY/MM/DD';
  }

  /** How the grid is presented: anchored, a bottom sheet, or auto by viewport width. */
  get #presentation(): 'popover' | 'sheet' {
    const mode = this.getAttribute('mode');
    if (mode === 'sheet') return 'sheet';
    // `auto` is the default: a panel anchored to a field near the bottom of a phone
    // can only flip and clamp, so it ends up squeezed against an edge.
    if (mode === 'popover') return 'popover';
    if (typeof window === 'undefined' || !window.matchMedia) return 'popover';
    return window.matchMedia('(max-width: 639px)').matches ? 'sheet' : 'popover';
  }

  #field(endpoint: Endpoint): HTMLInputElement | null {
    return this.querySelector<HTMLInputElement>(`[data-endpoint="${endpoint}"]`);
  }

  #withinBounds(date: DoranDate): boolean {
    const min = parseJalaliAttr(this.getAttribute('min'));
    const max = parseJalaliAttr(this.getAttribute('max'));
    if (min && date.isBefore(min.startOf('day'))) return false;
    if (max && date.isAfter(max.endOf('day'))) return false;
    return true;
  }

  /**
   * Commits a range, keeping the ends in order. A backwards range is a slip, not an
   * instruction — swapping is what the user meant.
   */
  #commit(start: DoranDate | null, end: DoranDate | null): void {
    if (start && end && end.isBefore(start)) {
      this.#start = end;
      this.#end = start;
    } else {
      this.#start = start;
      this.#end = end;
    }
    this.dispatchEvent(
      new CustomEvent('change', {
        bubbles: false,
        detail: { start: this.#start, end: this.#end },
      }),
    );
  }

  #onInput = (event: Event): void => {
    const field = event.target as HTMLInputElement;
    const endpoint = field.dataset.endpoint as Endpoint | undefined;
    if (!endpoint) return;

    const locale = resolveLocaleAttr(this.getAttribute('locale'));
    // Mask typed digits into the configured format as they go, in place.
    const masked = applyFormatMask(field.value, this.#format, {
      locale,
      caret: field.selectionStart ?? field.value.length,
      previous: this.#text[endpoint],
    });
    if (masked.text !== field.value) {
      field.value = masked.text;
      field.setSelectionRange(masked.caret, masked.caret);
    }

    this.#typing = endpoint;
    this.#text[endpoint] = field.value;

    if (field.value.trim() === '') {
      this.#commit(
        endpoint === 'start' ? null : this.#start,
        endpoint === 'end' ? null : this.#end,
      );
      return;
    }

    // The developer's format wins so the field parses what it displays; the common
    // defaults stay as a fallback so loose input keeps working.
    const parsed =
      parseJalali(field.value, this.#format, { locale }) ??
      parseJalali(field.value, undefined, { locale });
    if (!parsed || !this.#withinBounds(parsed)) return;

    const day = parsed.startOf('day');
    this.#commit(endpoint === 'start' ? day : this.#start, endpoint === 'end' ? day : this.#end);
    // Re-render the grid only; rebuilding the trigger would drop the caret.
    if (this.#open) this.#renderPopover();
  };

  #onFocusIn = (event: Event): void => {
    const field = event.target as HTMLElement;
    const endpoint = field.dataset?.endpoint as Endpoint | undefined;
    if (!endpoint) return;

    this.#editing = endpoint;
    if (!boolAttr(this, 'readonly') && !this.#open) {
      this.#open = true;
      this.#render();
      this.#field(endpoint)?.focus();
    }
  };

  #onKeyDown = (event: KeyboardEvent): void => {
    const endpoint = (event.target as HTMLElement).dataset?.endpoint as Endpoint | undefined;
    if (!endpoint) return;

    if (event.key === 'ArrowDown' && !this.#open) {
      event.preventDefault();
      this.#open = true;
      this.#render();
      this.#field(endpoint)?.focus();
    } else if (event.key === 'Enter' && this.#open) {
      event.preventDefault();
      this.#close(true);
    }
  };

  #onClick = (event: Event): void => {
    const toggle = (event.target as HTMLElement).closest('[data-action="toggle"]');
    if (toggle && this.contains(toggle)) {
      if (boolAttr(this, 'disabled')) return;
      this.#open = !this.#open;
      this.#render();
    }
  };

  #onDocPointer = (event: PointerEvent): void => {
    const target = event.target as Node;
    if (this.#open && !this.contains(target) && !this.#popover?.contains(target)) {
      this.#open = false;
      this.#render();
    }
  };

  #onDocKey = (event: KeyboardEvent): void => {
    if (event.key === 'Escape' && this.#open) this.#close(true);
  };

  #close(restoreFocus: boolean): void {
    if (!this.#open) return;
    this.#open = false;
    this.#focusTriggerOnRender = restoreFocus;
    this.#typing = null;
    this.#render();
  }

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
    const direction = resolveDirection(locale);
    const disabled = boolAttr(this, 'disabled');
    const readonly = boolAttr(this, 'readonly');

    const display = (date: DoranDate | null) =>
      date ? date.withLocale(locale).format(this.#format) : '';
    if (this.#typing !== 'start') this.#text.start = display(this.#start);
    if (this.#typing !== 'end') this.#text.end = display(this.#end);

    // Rebuilding the trigger would wipe the caret mid-typing, so once a field has
    // focus only the pop-over is re-rendered.
    const active = document.activeElement as HTMLElement | null;
    const fieldHasFocus = Boolean(active?.dataset?.endpoint) && this.contains(active);

    this.classList.add('doran-datepicker', 'doran-rangetrigger');
    this.setAttribute('dir', direction);

    this.#destroyPopover();

    if (!fieldHasFocus) {
      const field = (endpoint: Endpoint, label: string, placeholder: string) =>
        `<input type="text" class="doran-datepicker__control doran-rangetrigger__control"` +
        ` data-endpoint="${endpoint}" inputmode="numeric" autocomplete="off" dir="auto"` +
        ` value="${esc(this.#text[endpoint])}" placeholder="${esc(placeholder)}"` +
        ` aria-label="${esc(label)}" aria-haspopup="dialog" aria-expanded="${this.#open}"` +
        `${disabled ? ' disabled' : ''}${readonly ? ' readonly' : ''} />`;

      const icon = boolAttr(this, 'hide-icon')
        ? ''
        : `<button type="button" class="doran-datepicker__icon" data-action="toggle" tabindex="-1"` +
          ` aria-label="${esc(labels.openCalendar)}" aria-haspopup="dialog"` +
          ` aria-expanded="${this.#open}"${disabled ? ' disabled' : ''}>${calendarIcon}</button>`;

      this.innerHTML =
        `<div class="doran-datepicker__input doran-rangetrigger__field"` +
        `${disabled ? ' data-disabled="true"' : ''} data-editing="${this.#editing}">` +
        field(
          'start',
          labels.rangeStart,
          this.getAttribute('start-placeholder') ?? labels.datePlaceholder,
        ) +
        `<span class="doran-rangetrigger__separator" aria-hidden>${esc(labels.rangeSeparator.trim() || '–')}</span>` +
        field(
          'end',
          labels.rangeEnd,
          this.getAttribute('end-placeholder') ?? labels.datePlaceholder,
        ) +
        icon +
        `</div>`;

      const inputWidth = this.getAttribute('input-width')?.trim();
      if (inputWidth) {
        const trigger = this.querySelector<HTMLElement>('.doran-datepicker__input');
        if (trigger) trigger.style.width = inputWidth;
      }
    }

    if (this.#open) this.#renderPopover(locale, labels.calendar, direction);

    if (this.#focusTriggerOnRender) {
      this.#focusTriggerOnRender = false;
      this.#field(this.#editing)?.focus();
    }
  }

  /** Builds (or rebuilds) the portaled grid without touching the trigger. */
  #renderPopover(
    locale = resolveLocaleAttr(this.getAttribute('locale')),
    label = resolveCalendarLabels(locale).calendar,
    direction = resolveDirection(locale),
  ): void {
    this.#destroyPopover();

    const presentation = this.#presentation;
    const popover = document.createElement('div');
    popover.className =
      'doran-datepicker__popover' +
      (presentation === 'sheet' ? ' doran-datepicker__popover--sheet' : '');
    popover.dataset.presentation = presentation;
    popover.setAttribute('role', 'dialog');
    popover.setAttribute('aria-modal', 'false');
    popover.setAttribute('aria-label', label);
    popover.setAttribute('dir', direction);

    const grid = document.createElement('doran-rangepicker') as DoranRangePickerElement;
    for (const attr of [
      'locale',
      'header-mode',
      'show-holidays',
      'weekends',
      'year-span',
      'presets',
      'months',
    ]) {
      const value = this.getAttribute(attr);
      if (value !== null) grid.setAttribute(attr, value);
    }
    grid.setAttribute('hide-footer', '');
    if (this.#dayData) grid.dayData = this.#dayData;
    if (this.#disabledDates) grid.disabledDates = this.#disabledDates;

    grid.addEventListener('change', (event) => {
      const detail = (event as CustomEvent).detail as {
        start: DoranDate | null;
        end: DoranDate | null;
      };
      this.#typing = null;
      this.#commit(detail.start, detail.end);
      if (detail.start && detail.end) this.#close(true);
      else {
        this.#editing = 'end';
        this.#render();
      }
    });

    // Move the author's slot children into the grid for as long as it lives, so
    // `<doran-rangedatepicker><div slot="legend">` lands inside the pop-over.
    for (const [name, node] of this.#slots) {
      node.setAttribute('slot', name);
      grid.appendChild(node);
    }

    popover.appendChild(grid);
    document.body.appendChild(popover);
    grid.value = { start: this.#start, end: this.#end };
    this.#popover = popover;

    const trigger = this.querySelector<HTMLElement>('.doran-datepicker__input');
    if (trigger && presentation !== 'sheet') {
      this.#stopTracking = trackPopoverPosition(trigger, popover, { matchTriggerWidth: false });
    }
  }
}
