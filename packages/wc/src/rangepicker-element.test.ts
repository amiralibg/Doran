import { type DoranDate } from '@doranjs/core';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { defineDoranElements } from './register';
import type { DoranRangePickerElement } from './rangepicker-element';

beforeAll(() => defineDoranElements());
afterEach(() => {
  document.body.innerHTML = '';
});

function mount(attrs: Record<string, string> = {}): DoranRangePickerElement {
  const el = document.createElement('doran-rangepicker') as DoranRangePickerElement;
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  document.body.appendChild(el);
  return el;
}

/** In-month day buttons, in date order. */
function monthDays(el: HTMLElement): HTMLButtonElement[] {
  return [
    ...el.querySelectorAll<HTMLButtonElement>(
      '[data-action="select-day"]:not(.doran-day--outside)',
    ),
  ];
}

describe('<doran-rangepicker>', () => {
  it('renders a multiselectable month grid', () => {
    const el = mount();
    const grid = el.querySelector('[role="grid"]')!;
    expect(grid.getAttribute('aria-multiselectable')).toBe('true');
    expect(el.querySelectorAll('[role="columnheader"]')).toHaveLength(7);
  });

  it('builds a range with the two-click handshake and emits change each time', () => {
    const el = mount();
    const onChange = vi.fn();
    el.addEventListener('change', (e) => onChange((e as CustomEvent).detail));
    const days = monthDays(el);
    days[0]!.click();
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(el.value.start).not.toBeNull();
    expect(el.value.end).toBeNull();

    monthDays(el)[5]!.click();
    expect(onChange).toHaveBeenCalledTimes(2);
    const detail = onChange.mock.calls[1]![0] as {
      start: DoranDate | null;
      end: DoranDate | null;
    };
    expect(detail.start).not.toBeNull();
    expect(detail.end).not.toBeNull();
    expect(detail.end!.isAfter(detail.start!)).toBe(true);
    // The band between endpoints is highlighted.
    expect(el.querySelectorAll('.doran-day--in-range').length).toBeGreaterThan(0);
  });

  it('shows quick-pick presets and applies one on click', () => {
    const el = mount({ presets: '' });
    const presetButtons = el.querySelectorAll<HTMLButtonElement>('[data-action="preset"]');
    expect(presetButtons.length).toBeGreaterThan(0);
    const onChange = vi.fn();
    el.addEventListener('change', (e) => onChange((e as CustomEvent).detail));
    presetButtons[0]!.click();
    const detail = onChange.mock.calls.at(-1)![0] as {
      start: DoranDate | null;
      end: DoranDate | null;
    };
    expect(detail.start).not.toBeNull();
    expect(detail.end).not.toBeNull();
  });

  it('clears the selection via the reset button', () => {
    const el = mount();
    monthDays(el)[0]!.click();
    const onChange = vi.fn();
    el.addEventListener('change', (e) => onChange((e as CustomEvent).detail));
    el.querySelector<HTMLButtonElement>('[data-action="clear"]')!.click();
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(el.value.start).toBeNull();
    expect(el.value.end).toBeNull();
  });

  it('localizes Clear in English', () => {
    const el = mount({ locale: 'en' });

    expect(el.querySelector('[data-action="clear"]')?.textContent).toBe('Clear');
    expect(el.textContent).not.toContain('پاک کردن');
  });

  it('defaults to Clear, honors only clear tokens, and supports no actions', () => {
    expect(mount().querySelector('[data-action="clear"]')).not.toBeNull();
    document.body.innerHTML = '';

    const filtered = mount({ 'footer-actions': 'today clear today' });
    expect(filtered.querySelectorAll('[data-action="clear"]')).toHaveLength(1);
    expect(filtered.querySelector('[data-action="today"]')).toBeNull();
    document.body.innerHTML = '';

    const none = mount({ 'footer-actions': '' });
    expect(none.querySelector('[data-action="clear"]')).toBeNull();
    expect(none.querySelector('.doran-rangepicker__footer')).toBeNull();
  });

  it('keeps hide-footer compatibility', () => {
    const el = mount({ 'hide-footer': '', 'footer-actions': 'clear' });
    expect(el.querySelector('.doran-rangepicker__footer')).toBeNull();
  });
});
