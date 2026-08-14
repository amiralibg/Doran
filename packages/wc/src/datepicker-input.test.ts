import { type DoranDate } from '@doranjs/core';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { defineDoranElements } from './register';

beforeAll(() => defineDoranElements());
afterEach(() => {
  document.body.innerHTML = '';
});

function mount(attrs: Record<string, string> = {}): HTMLElement {
  const el = document.createElement('doran-datepicker');
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  document.body.appendChild(el);
  return el;
}

const control = (el: HTMLElement) =>
  el.querySelector<HTMLInputElement>('.doran-datepicker__control')!;

function type(el: HTMLElement, text: string) {
  const field = control(el);
  field.value = text;
  field.dispatchEvent(new Event('input', { bubbles: true }));
}

describe('typing into <doran-datepicker>', () => {
  it('renders a real text field rather than a button', () => {
    const el = mount();
    expect(control(el)).toBeInstanceOf(HTMLInputElement);
    expect(el.querySelector('button.doran-datepicker__input')).toBeNull();
  });

  it('parses a typed date and emits change', () => {
    const el = mount();
    const onChange = vi.fn();
    el.addEventListener('change', onChange);

    type(el, '1402/05/12');

    expect(onChange).toHaveBeenCalledTimes(1);
    const detail = onChange.mock.calls[0]![0].detail as { date: DoranDate };
    expect([detail.date.year, detail.date.month, detail.date.day]).toEqual([1402, 5, 12]);
  });

  it('accepts unpadded, dashed and Persian-digit input', () => {
    for (const text of ['1402/5/12', '1402-5-12', '۱۴۰۲/۰۵/۱۲']) {
      const el = mount();
      const onChange = vi.fn();
      el.addEventListener('change', onChange);

      type(el, text);

      const detail = onChange.mock.calls[0]![0].detail as { date: DoranDate };
      expect([detail.date.year, detail.date.month, detail.date.day]).toEqual([1402, 5, 12]);
      el.remove();
    }
  });

  it('emits null when the field is cleared', () => {
    const el = mount({ value: '1405/03/15' });
    const onChange = vi.fn();
    el.addEventListener('change', onChange);

    type(el, '');

    expect(onChange.mock.calls[0]![0].detail).toEqual({ date: null, iso: null, value: '' });
  });

  // Typing must survive the element's own re-renders; innerHTML would wipe the caret.
  it('does not rebuild the trigger while the field has focus', () => {
    const el = mount();
    const field = control(el);
    field.focus();

    type(el, '1402/05/12');

    expect(control(el)).toBe(field);
    expect(document.activeElement).toBe(field);
  });

  it('stays quiet on partial input and flags it on blur', () => {
    const el = mount();
    type(el, '140');
    expect(control(el).hasAttribute('aria-invalid')).toBe(false);

    control(el).dispatchEvent(new Event('blur', { bubbles: true }));
    expect(control(el).getAttribute('aria-invalid')).toBe('true');
    expect(control(el).value).toBe('140');
  });

  it('normalizes parseable text back to the display format on blur', () => {
    const el = mount();
    type(el, '1402/5/12');
    control(el).dispatchEvent(new Event('blur', { bubbles: true }));

    expect(control(el).value).toBe('۱۴۰۲/۰۵/۱۲');
  });

  it('refuses a typed date outside min/max', () => {
    const el = mount({ min: '1405/03/10', max: '1405/03/20' });
    const onChange = vi.fn();
    el.addEventListener('change', onChange);

    type(el, '1405/03/25');
    control(el).dispatchEvent(new Event('blur', { bubbles: true }));

    expect(onChange).not.toHaveBeenCalled();
    expect(control(el).getAttribute('aria-invalid')).toBe('true');
  });

  it('opens on ArrowDown and closes on Enter', () => {
    const el = mount();
    const field = control(el);

    field.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    expect(document.querySelector('[role="dialog"]')).not.toBeNull();

    control(el).dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    expect(document.querySelector('[role="dialog"]')).toBeNull();
  });

  it('honours the readonly attribute', () => {
    const el = mount({ readonly: '' });
    expect(control(el).readOnly).toBe(true);
    // The calendar still works — readonly restricts typing, not selection.
    expect(el.querySelector<HTMLButtonElement>('.doran-datepicker__icon')!.disabled).toBe(false);
  });

  it('names the field and gives the calendar button its own name', () => {
    const el = mount({ placeholder: 'تاریخ تولد' });
    expect(control(el).getAttribute('aria-label')).toBe('تاریخ تولد');
    expect(el.querySelector('.doran-datepicker__icon')!.getAttribute('aria-label')).toBe(
      'باز کردن تقویم',
    );
  });
});
