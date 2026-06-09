import { DoranDate, type Locale } from '@doranjs/core';
import { parse, suggest, type Suggestion } from '@doranjs/nlp';
import { esc, resolveLocaleAttr } from './util';

/**
 * `<doran-nlp-input>` — a Persian natural-language date input with a live
 * autocomplete dropdown and a resolved-date hint pinned to the opposite (LTR) end.
 *
 * Attributes: `value`, `placeholder`, `locale`, `format`, `limit`, `show-hint`,
 * `show-suggestions`. Emits `input` (`{ value }`), `resolve` (`{ result }`), and
 * `change` (`{ result }`) events.
 */
export class DoranNlpInputElement extends HTMLElement {
  static get observedAttributes(): string[] {
    return ['value', 'placeholder', 'locale'];
  }

  #text = '';
  #open = false;
  #active = -1;
  #suggestions: Suggestion[] = [];
  #input: HTMLInputElement | null = null;
  #hint: HTMLSpanElement | null = null;
  #list: HTMLUListElement | null = null;
  #initialized = false;

  connectedCallback(): void {
    if (!this.#initialized) {
      this.#text = this.getAttribute('value') ?? '';
      this.#initialized = true;
    }
    this.#build();
    document.addEventListener('pointerdown', this.#onDocPointer);
  }

  disconnectedCallback(): void {
    document.removeEventListener('pointerdown', this.#onDocPointer);
  }

  attributeChangedCallback(name: string, _old: string | null, value: string | null): void {
    if (!this.#initialized) return;
    if (name === 'value' && value !== null && value !== this.#text) {
      this.#text = value;
      if (this.#input) this.#input.value = value;
      this.#update();
    }
  }

  get value(): string {
    return this.#text;
  }

  set value(text: string) {
    this.#text = text;
    if (this.#input) this.#input.value = text;
    this.#update();
  }

  get #locale(): Locale {
    return resolveLocaleAttr(this.getAttribute('locale'));
  }

  get #limit(): number {
    const n = Number(this.getAttribute('limit'));
    return Number.isFinite(n) && n > 0 ? n : 8;
  }

  #onDocPointer = (event: PointerEvent): void => {
    if (this.#open && !this.contains(event.target as Node)) {
      this.#open = false;
      this.#renderList();
    }
  };

  /**
   * Preview HTML for a date. The date and the numeric time are isolated in separate
   * `<bdi>` elements so the bidi algorithm can't reorder the Persian text and the
   * clock time relative to each other.
   */
  #previewHtml(date: DoranDate): string {
    const d = date.withLocale(this.#locale);
    const format = this.getAttribute('format');
    if (format) return `<bdi>${esc(d.format(format))}</bdi>`;
    const hasTime = date.hour !== 0 || date.minute !== 0;
    // Show the year only when it isn't the current one, so near-term dates stay terse but a
    // date that resolves to a different year (e.g. «۳ سال دیگه ۱۱ دی») isn't ambiguous.
    const dayFormat = hasTime ? 'D MMMM' : 'dddd D MMMM';
    const sameYear = date.year === DoranDate.now({ timeZone: date.timeZone }).year;
    const dateStr = esc(d.format(sameYear ? dayFormat : `${dayFormat} YYYY`));
    if (hasTime) {
      return `<bdi>${dateStr}</bdi><bdi dir="ltr" class="doran-nlp__time">${esc(d.format('HH:mm'))}</bdi>`;
    }
    return `<bdi>${dateStr}</bdi>`;
  }

  #build(): void {
    this.classList.add('doran-nlp');
    this.setAttribute('dir', 'rtl');
    const listId = `doran-nlp-list-${(uid += 1)}`;
    this.innerHTML =
      `<div class="doran-nlp__field">` +
      `<input type="text" class="doran-nlp__input" dir="rtl" autocomplete="off" spellcheck="false" role="combobox" aria-autocomplete="list" aria-controls="${listId}" />` +
      `<span class="doran-nlp__hint" aria-hidden></span>` +
      `</div>` +
      `<ul class="doran-nlp__suggestions" id="${listId}" role="listbox" hidden></ul>`;

    this.#input = this.querySelector('.doran-nlp__input');
    this.#hint = this.querySelector('.doran-nlp__hint');
    this.#list = this.querySelector('.doran-nlp__suggestions');

    const input = this.#input!;
    input.value = this.#text;
    input.placeholder = this.getAttribute('placeholder') ?? 'مثلاً: جمعه ساعت ۷ شب';

    input.addEventListener('input', () => {
      this.#text = input.value;
      this.#open = true;
      this.#active = -1;
      this.dispatchEvent(
        new CustomEvent('input', { bubbles: true, detail: { value: this.#text } }),
      );
      this.#update();
    });
    input.addEventListener('focus', () => {
      this.#open = true;
      this.#renderList();
    });
    input.addEventListener('keydown', (e) => this.#onKeyDown(e));

    this.#list!.addEventListener('click', (e) => {
      const btn = (e.target as HTMLElement).closest<HTMLElement>('[data-index]');
      if (!btn) return;
      const s = this.#suggestions[Number(btn.dataset.index)];
      if (s) this.#choose(s);
    });

    this.#update();
  }

  #onKeyDown(event: KeyboardEvent): void {
    if (boolAttr2(this, 'show-suggestions') === false || this.#suggestions.length === 0) return;
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.#open = true;
        this.#active = (this.#active + 1) % this.#suggestions.length;
        this.#renderList();
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.#open = true;
        this.#active = this.#active <= 0 ? this.#suggestions.length - 1 : this.#active - 1;
        this.#renderList();
        break;
      case 'Enter':
        if (this.#open && this.#active >= 0 && this.#suggestions[this.#active]) {
          event.preventDefault();
          this.#choose(this.#suggestions[this.#active]!);
        }
        break;
      case 'Escape':
        this.#open = false;
        this.#active = -1;
        this.#renderList();
        break;
      default:
        break;
    }
  }

  #choose(s: Suggestion): void {
    this.#text = s.value;
    if (this.#input) this.#input.value = s.value;
    this.#open = false;
    this.#active = -1;
    this.#input?.focus();
    this.dispatchEvent(new CustomEvent('input', { bubbles: true, detail: { value: this.#text } }));
    this.#update();
  }

  #update(): void {
    const result = parse(this.#text);
    this.#suggestions =
      boolAttr2(this, 'show-suggestions') === false
        ? []
        : suggest(this.#text, { limit: this.#limit });

    // Hint
    if (this.#hint) {
      const showHint = boolAttr2(this, 'show-hint') !== false;
      if (showHint && this.#text.trim()) {
        if (result) {
          this.#hint.innerHTML = this.#previewHtml(result.date);
          this.#hint.classList.remove('doran-nlp__hint--unknown');
          this.#hint.hidden = false;
        } else {
          this.#hint.textContent = 'نامشخص';
          this.#hint.classList.add('doran-nlp__hint--unknown');
          this.#hint.hidden = false;
        }
      } else {
        this.#hint.hidden = true;
      }
    }

    this.dispatchEvent(new CustomEvent('resolve', { bubbles: true, detail: { result } }));
    this.dispatchEvent(new CustomEvent('change', { bubbles: true, detail: { result } }));
    this.#renderList();
  }

  #renderList(): void {
    const list = this.#list;
    if (!list) return;
    const visible = this.#open && this.#suggestions.length > 0;
    list.hidden = !visible;
    this.#input?.setAttribute('aria-expanded', String(visible));
    if (!visible) {
      list.innerHTML = '';
      return;
    }
    list.innerHTML = this.#suggestions
      .map((s, i) => {
        const preview = s.date
          ? `<span class="doran-nlp__suggestion-preview">${this.#previewHtml(s.date)}</span>`
          : '';
        return (
          `<li role="option" aria-selected="${i === this.#active}">` +
          `<button type="button" class="doran-nlp__suggestion ${i === this.#active ? 'doran-nlp__suggestion--active' : ''}" data-index="${i}">` +
          `<span>${esc(s.label)}</span>${preview}</button></li>`
        );
      })
      .join('');
  }
}

/** Per-instance counter for unique listbox ids (combobox `aria-controls` linkage). */
let uid = 0;

/** An opt-out flag: `true` unless the attribute is explicitly `false`/`0`. */
function boolAttr2(el: Element, name: string): boolean {
  if (!el.hasAttribute(name)) return true;
  const v = el.getAttribute(name);
  return v !== 'false' && v !== '0';
}
