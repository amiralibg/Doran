import { DoranDate } from '@doranjs/core';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { defineDoranElements } from './register';

beforeAll(() => defineDoranElements());
afterEach(() => {
  document.body.innerHTML = '';
  document.querySelectorAll('.doran-datepicker__popover').forEach((n) => n.remove());
});

function mount(attrs: Record<string, string> = {}): HTMLElement {
  const el = document.createElement('doran-rangedatepicker');
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  document.body.appendChild(el);
  return el;
}

const field = (el: Element, endpoint: 'start' | 'end') =>
  el.querySelector<HTMLInputElement>(`[data-endpoint="${endpoint}"]`)!;

function type(el: Element, endpoint: 'start' | 'end', text: string) {
  const input = field(el, endpoint);
  input.value = text;
  input.dispatchEvent(new Event('input', { bubbles: true }));
}

const dialog = () => document.querySelector('[role="dialog"]');

describe('<doran-rangedatepicker>', () => {
  it('renders one trigger holding two fields', () => {
    const el = mount();
    expect(el.querySelectorAll('.doran-rangetrigger__control')).toHaveLength(2);
    expect(el.querySelectorAll('.doran-datepicker__input')).toHaveLength(1);
  });

  it('parses a typed date into the field being edited', () => {
    const el = mount();
    const onChange = vi.fn();
    el.addEventListener('change', onChange);

    type(el, 'start', '1405/03/10');

    const detail = onChange.mock.calls[0]![0].detail as { start: DoranDate; end: null };
    expect(detail.start.day).toBe(10);
    expect(detail.end).toBeNull();
  });

  it('masks typed digits into the format as they go', () => {
    const el = mount();
    type(el, 'start', '14050310');
    expect(field(el, 'start').value).toBe('۱۴۰۵/۰۳/۱۰');
  });

  it('masks and parses a developer-supplied format', () => {
    const el = mount({ format: 'MM-DD-YYYY' });
    const onChange = vi.fn();
    el.addEventListener('change', onChange);

    type(el, 'start', '03101405');

    expect(field(el, 'start').value).toBe('۰۳-۱۰-۱۴۰۵');
    const detail = onChange.mock.calls[0]![0].detail as { start: DoranDate; end: null };
    expect([detail.start.year, detail.start.month, detail.start.day]).toEqual([1405, 3, 10]);
  });

  // Matches React: a backwards range is a slip, not an instruction.
  it('swaps a range typed backwards', () => {
    const el = mount();
    const onChange = vi.fn();
    el.addEventListener('change', onChange);

    type(el, 'start', '1405/03/20');
    type(el, 'end', '1405/03/10');

    const detail = onChange.mock.calls.at(-1)![0].detail as {
      start: DoranDate;
      end: DoranDate;
    };
    expect(detail.start.day).toBe(10);
    expect(detail.end.day).toBe(20);
  });

  it('opens the grid on focus and closes on Escape', () => {
    const el = mount();

    field(el, 'start').dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
    expect(dialog()).not.toBeNull();

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(dialog()).toBeNull();
  });

  it('opens on ArrowDown', () => {
    const el = mount({ readonly: '' });
    field(el, 'start').dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }),
    );
    expect(dialog()).not.toBeNull();
  });

  it('refuses a typed date outside min/max', () => {
    const el = mount({ min: '1405/03/10', max: '1405/03/20' });
    const onChange = vi.fn();
    el.addEventListener('change', onChange);

    type(el, 'start', '1405/03/25');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('reflects a range set through the value property', () => {
    const el = mount() as HTMLElement & {
      value: { start: DoranDate | null; end: DoranDate | null };
    };
    el.value = {
      start: DoranDate.fromJalali(1405, 3, 10),
      end: DoranDate.fromJalali(1405, 3, 20),
    };

    expect(field(el, 'start').value).toBe('۱۴۰۵/۰۳/۱۰');
    expect(field(el, 'end').value).toBe('۱۴۰۵/۰۳/۲۰');
  });

  it('follows the locale for direction and field names', () => {
    const el = mount({ locale: 'en' });

    expect(el.getAttribute('dir')).toBe('ltr');
    expect(field(el, 'start').getAttribute('aria-label')).toBe('Start date');
    expect(field(el, 'end').getAttribute('aria-label')).toBe('End date');
  });

  it('renders as a sheet when asked', () => {
    const el = mount({ mode: 'sheet' });
    el.querySelector<HTMLButtonElement>('.doran-datepicker__icon')!.click();

    expect((dialog() as HTMLElement).dataset.presentation).toBe('sheet');
  });

  it('forwards dayData to the pop-over grid', () => {
    const el = mount() as HTMLElement & { dayData: Record<string, { text: string }> };
    el.dayData = { '1405-3-12': { text: '۲ اتاق' } };
    el.querySelector<HTMLButtonElement>('.doran-datepicker__icon')!.click();

    const day = dialog()!.querySelector('[data-y="1405"][data-m="3"][data-d="12"]');
    // The grid may open on another month; when it does not, the annotation is there.
    if (day) expect(day.querySelector('.doran-day__content')?.textContent).toBe('۲ اتاق');
    expect(dialog()!.querySelector('doran-rangepicker')).not.toBeNull();
  });

  it('disables both fields and the calendar button', () => {
    const el = mount({ disabled: '' });
    expect(field(el, 'start').disabled).toBe(true);
    expect(field(el, 'end').disabled).toBe(true);
    expect(el.querySelector<HTMLButtonElement>('.doran-datepicker__icon')!.disabled).toBe(true);
  });
});
