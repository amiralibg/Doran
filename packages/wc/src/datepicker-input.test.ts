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
    // Partial input is kept — rendered in the locale's numerals by the live mask.
    expect(control(el).value).toBe('۱۴۰');
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

describe('live format masking', () => {
  /** Types one character at a time from the caret, the way a keyboard does. */
  function typeKeys(el: HTMLElement, keys: string) {
    const field = control(el);
    for (const key of keys) {
      const caret = field.selectionStart ?? field.value.length;
      field.value = field.value.slice(0, caret) + key + field.value.slice(caret);
      field.setSelectionRange(caret + 1, caret + 1);
      field.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }

  it('keeps the caret at the end while a date is typed key by key', () => {
    const el = mount();

    typeKeys(el, '14020512');

    expect(control(el).value).toBe('۱۴۰۲/۰۵/۱۲');
    expect(control(el).selectionStart).toBe(10);
  });

  it('backspaces through an auto-inserted separator', () => {
    const el = mount();
    typeKeys(el, '14020512');

    const field = control(el);
    for (const expected of ['۱۴۰۲/۰۵/۱', '۱۴۰۲/۰۵/', '۱۴۰۲/۰۵', '۱۴۰۲/۰']) {
      field.value = field.value.slice(0, -1);
      field.setSelectionRange(field.value.length, field.value.length);
      field.dispatchEvent(new Event('input', { bubbles: true }));
      expect(field.value).toBe(expected);
    }
  });

  it('flows typed digits into the display format as they go', () => {
    const el = mount();
    const onChange = vi.fn();
    el.addEventListener('change', onChange);

    type(el, '14020512');

    expect(control(el).value).toBe('۱۴۰۲/۰۵/۱۲');
    const detail = onChange.mock.calls[0]![0].detail as { date: DoranDate };
    expect([detail.date.year, detail.date.month, detail.date.day]).toEqual([1402, 5, 12]);
  });

  it('normalizes typed separators to the format’s own', () => {
    const el = mount();
    type(el, '1402-5-12');
    expect(control(el).value).toBe('۱۴۰۲/۰۵/۱۲');
  });

  it('treats a typed separator as the end of its field', () => {
    // `1-2` is month 1 and day 2, not the month 12 the bare digits would read as.
    const el = mount();
    type(el, '1402-1-2');
    expect(control(el).value).toBe('۱۴۰۲/۰۱/۲');
  });

  it('masks into a developer-supplied format', () => {
    const el = mount({ format: 'MM-DD-YYYY' });
    const onChange = vi.fn();
    el.addEventListener('change', onChange);

    type(el, '05121402');

    expect(control(el).value).toBe('۰۵-۱۲-۱۴۰۲');
    const detail = onChange.mock.calls[0]![0].detail as { date: DoranDate };
    expect([detail.date.year, detail.date.month, detail.date.day]).toEqual([1402, 5, 12]);
  });

  it('parses typed text against the developer-supplied format', () => {
    const el = mount({ format: 'MM-DD-YYYY' });
    const onChange = vi.fn();
    el.addEventListener('change', onChange);

    type(el, '05-12-1402');

    const detail = onChange.mock.calls[0]![0].detail as { date: DoranDate };
    expect([detail.date.year, detail.date.month, detail.date.day]).toEqual([1402, 5, 12]);
  });

  it('leaves free text alone for formats that are not maskable', () => {
    const el = mount({ format: 'D MMMM YYYY' });
    type(el, '12 خرداد');
    expect(control(el).value).toBe('12 خرداد');
  });
});

describe('presentation mode', () => {
  const open = (el: HTMLElement) =>
    el.querySelector<HTMLButtonElement>('.doran-datepicker__icon')!.click();

  it('anchors to the trigger by default', () => {
    const el = mount();
    open(el);
    expect(document.querySelector<HTMLElement>('[role="dialog"]')!.dataset.presentation).toBe(
      'popover',
    );
  });

  it('renders as a bottom sheet when asked', () => {
    const el = mount({ mode: 'sheet' });
    open(el);

    const dialog = document.querySelector<HTMLElement>('[role="dialog"]')!;
    expect(dialog.dataset.presentation).toBe('sheet');
    expect(dialog.classList.contains('doran-datepicker__popover--sheet')).toBe(true);
    // Pinned to the viewport, so it carries no measured position.
    expect(dialog.style.top).toBe('');
  });

  it('still closes on Escape as a sheet', () => {
    const el = mount({ mode: 'sheet' });
    open(el);
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(document.querySelector('[role="dialog"]')).toBeNull();
  });
});

describe('time picker keyboard', () => {
  const spin = (el: HTMLElement, field: string) =>
    el.querySelector<HTMLElement>(`.doran-time__value[data-field="${field}"]`)!;

  function mountCalendar(): HTMLElement {
    document.body.innerHTML = '<doran-calendar value="1405/03/15" with-time></doran-calendar>';
    return document.querySelector('doran-calendar')!;
  }

  it('exposes each field as a typable spinbutton', () => {
    const el = mountCalendar();
    const hour = spin(el, 'hour') as HTMLInputElement;

    // An input, so it is a tab stop by nature and can be typed into as well as stepped.
    expect(hour.tagName).toBe('INPUT');
    expect(hour.getAttribute('role')).toBe('spinbutton');
    expect(hour.getAttribute('aria-valuemax')).toBe('23');
  });

  it('commits a typed value', () => {
    const el = mountCalendar();
    const minute = spin(el, 'minute') as HTMLInputElement;

    minute.value = '45';
    minute.dispatchEvent(new Event('input', { bubbles: true }));

    expect(spin(el, 'minute').getAttribute('aria-valuenow')).toBe('45');
  });

  it('moves every unit by one by default', () => {
    const el = mountCalendar();
    const before = Number(spin(el, 'minute').getAttribute('aria-valuenow'));

    spin(el, 'minute').dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }),
    );

    expect(Number(spin(el, 'minute').getAttribute('aria-valuenow'))).toBe((before + 1) % 60);
  });

  it('adjusts the value with the arrow keys', () => {
    const el = mountCalendar();
    const before = spin(el, 'hour').getAttribute('aria-valuenow');

    spin(el, 'hour').dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }));

    expect(spin(el, 'hour').getAttribute('aria-valuenow')).not.toBe(before);
  });

  it('jumps to the bounds with Home and End', () => {
    const el = mountCalendar();

    spin(el, 'hour').dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }));
    expect(spin(el, 'hour').getAttribute('aria-valuenow')).toBe('0');

    spin(el, 'minute').dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }));
    expect(spin(el, 'minute').getAttribute('aria-valuenow')).toBe('59');
  });

  it('keeps the chevrons out of the tab order', () => {
    const el = mountCalendar();
    for (const btn of el.querySelectorAll('.doran-time__btn')) {
      expect(btn.getAttribute('tabindex')).toBe('-1');
    }
  });
});
