import type { ParseResult } from '@doranjs/nlp';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import type { DoranNlpInputElement } from './nlp-input-element';
import { defineDoranElements } from './register';

beforeAll(() => defineDoranElements());
afterEach(() => {
  document.body.innerHTML = '';
});

function mount(attrs: Record<string, string> = {}): DoranNlpInputElement {
  const el = document.createElement('doran-nlp-input') as DoranNlpInputElement;
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  document.body.appendChild(el);
  return el;
}

function type(el: HTMLElement, text: string): HTMLInputElement {
  const input = el.querySelector<HTMLInputElement>('.doran-nlp__input')!;
  input.value = text;
  input.dispatchEvent(new Event('input', { bubbles: true }));
  return input;
}

describe('<doran-nlp-input>', () => {
  it('renders an accessible combobox input', () => {
    const el = mount();
    const input = el.querySelector('.doran-nlp__input')!;
    expect(input.getAttribute('role')).toBe('combobox');
    expect(input.getAttribute('aria-autocomplete')).toBe('list');
  });

  it('emits input events and updates the value as the user types', () => {
    const el = mount();
    const onInput = vi.fn();
    // The element re-dispatches a CustomEvent('input') carrying detail alongside the
    // native bubbling input event; ignore the latter (it has no detail).
    el.addEventListener('input', (e) => {
      const detail = (e as CustomEvent).detail;
      if (detail) onInput(detail.value);
    });
    type(el, 'فردا');
    expect(onInput).toHaveBeenLastCalledWith('فردا');
    expect(el.value).toBe('فردا');
  });

  it('resolves a known phrase and reports it via the resolve event', () => {
    const el = mount();
    const onResolve = vi.fn<(r: ParseResult | null) => void>();
    el.addEventListener('resolve', (e) => onResolve((e as CustomEvent).detail.result));
    type(el, 'فردا');
    expect(onResolve.mock.calls.at(-1)![0]).not.toBeNull();
  });

  it('shows a suggestion dropdown and completes the field when one is chosen', () => {
    const el = mount();
    const input = el.querySelector<HTMLInputElement>('.doran-nlp__input')!;
    input.dispatchEvent(new FocusEvent('focus'));
    type(el, 'فرد');
    // The list is body-portaled so overflow ancestors cannot clip it.
    const list = document.querySelector<HTMLUListElement>('.doran-nlp__suggestions')!;
    expect(el.contains(list)).toBe(false);
    expect(list.parentElement).toBe(document.body);
    expect(list.hidden).toBe(false);
    const options = list.querySelectorAll<HTMLButtonElement>('[data-index]');
    expect(options.length).toBeGreaterThan(0);
    const farda = [...options].find((b) => b.textContent?.includes('فردا'))!;
    farda.click();
    expect(input.value.startsWith('فرد')).toBe(true);
    expect(input.value.length).toBeGreaterThan('فرد'.length);
  });

  it('removes the portaled list when the element is disconnected', () => {
    const el = mount();
    el.querySelector<HTMLInputElement>('.doran-nlp__input')!.dispatchEvent(new FocusEvent('focus'));
    type(el, 'فرد');
    expect(document.querySelector('.doran-nlp__suggestions')).not.toBeNull();
    el.remove();
    expect(document.querySelector('.doran-nlp__suggestions')).toBeNull();
  });
});
