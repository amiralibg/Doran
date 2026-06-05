import { DoranDate } from '@doranjs/core';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { type DoranCalendarElement } from './calendar-element';
import { defineDoranElements } from './register';

beforeAll(() => defineDoranElements());
afterEach(() => {
  document.body.innerHTML = '';
});

/** Mount a `<doran-calendar>` with the given attributes and return it (connected). */
function mount(attrs: Record<string, string> = {}): DoranCalendarElement {
  const el = document.createElement('doran-calendar') as DoranCalendarElement;
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  document.body.appendChild(el);
  return el;
}

function day(el: HTMLElement, y: number, m: number, d: number) {
  return el.querySelector<HTMLButtonElement>(
    `[data-action="select-day"][data-y="${y}"][data-m="${m}"][data-d="${d}"]`,
  )!;
}

function monthHeading(el: HTMLElement) {
  return el.querySelector<HTMLElement>('.doran-calendar__heading-btn')!;
}

describe('<doran-calendar>', () => {
  it('renders an accessible month grid for the value attribute', () => {
    const el = mount({ value: '1405/03/15' });
    const grid = el.querySelector('[role="grid"]')!;
    expect(grid).not.toBeNull();
    expect(el.querySelectorAll('[role="columnheader"]')).toHaveLength(7);
    expect(day(el, 1405, 3, 15)).not.toBeNull();
    // The value day is marked selected.
    expect(day(el, 1405, 3, 15).classList.contains('doran-day--selected')).toBe(true);
  });

  it('emits a change CustomEvent with date detail when a day is clicked', () => {
    const el = mount({ value: '1405/03/15' });
    const onChange = vi.fn();
    el.addEventListener('change', (e) => onChange((e as CustomEvent).detail));
    day(el, 1405, 3, 20).click();
    expect(onChange).toHaveBeenCalledTimes(1);
    const detail = onChange.mock.calls[0]![0] as { date: DoranDate; value: string };
    expect([detail.date.year, detail.date.month, detail.date.day]).toEqual([1405, 3, 20]);
    expect(detail.value).toBe('۱۴۰۵/۰۳/۲۰');
    expect(el.value?.day).toBe(20);
  });

  it('navigates months via the nav buttons', () => {
    const el = mount({ value: '1405/03/15' });
    const khordad = monthHeading(el).textContent;
    el.querySelector<HTMLButtonElement>('[data-action="next"]')!.click();
    expect(monthHeading(el).textContent).not.toBe(khordad);
    el.querySelector<HTMLButtonElement>('[data-action="prev"]')!.click();
    expect(monthHeading(el).textContent).toBe(khordad);
  });

  it('opens the month panel with twelve options', () => {
    const el = mount({ value: '1405/03/15' });
    el.querySelector<HTMLButtonElement>(
      '[data-action="toggle-panel"][data-panel="months"]',
    )!.click();
    expect(el.querySelectorAll('[role="option"]')).toHaveLength(12);
  });

  it('respects min/max by disabling out-of-range days', () => {
    const el = mount({ value: '1405/03/15', min: '1405/03/10', max: '1405/03/20' });
    expect(day(el, 1405, 3, 9).disabled).toBe(true);
    expect(day(el, 1405, 3, 21).disabled).toBe(true);
    expect(day(el, 1405, 3, 15).disabled).toBe(false);
  });

  it('reflects the value property setter', () => {
    const el = mount();
    // Match the element's local-time grid (it builds with DoranDate.now()).
    el.value = DoranDate.fromJalali(1405, 7, 3);
    expect(day(el, 1405, 7, 3).classList.contains('doran-day--selected')).toBe(true);
  });

  it('moves the roving tabstop with ArrowLeft (RTL advance)', () => {
    const el = mount({ value: '1405/03/15' });
    expect(day(el, 1405, 3, 15).getAttribute('tabindex')).toBe('0');
    const grid = el.querySelector<HTMLElement>('.doran-month')!;
    grid.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
    expect(day(el, 1405, 3, 16).getAttribute('tabindex')).toBe('0');
    expect(day(el, 1405, 3, 15).getAttribute('tabindex')).toBe('-1');
  });
});
