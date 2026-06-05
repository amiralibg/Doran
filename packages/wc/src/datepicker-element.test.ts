import { type DoranDate } from '@doranjs/core';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { type DoranDatePickerElement } from './datepicker-element';
import { defineDoranElements } from './register';

beforeAll(() => defineDoranElements());
afterEach(() => {
  document.body.innerHTML = '';
});

function mount(attrs: Record<string, string> = {}): DoranDatePickerElement {
  const el = document.createElement('doran-datepicker') as DoranDatePickerElement;
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  document.body.appendChild(el);
  return el;
}

const trigger = (el: HTMLElement) => el.querySelector<HTMLButtonElement>('[data-action="toggle"]')!;

describe('<doran-datepicker>', () => {
  it('shows the placeholder until a value is set', () => {
    const el = mount({ placeholder: 'یک تاریخ' });
    expect(el.querySelector('.doran-datepicker__placeholder')?.textContent).toBe('یک تاریخ');
    expect(el.querySelector('[role="dialog"]')).toBeNull();
  });

  it('formats a value attribute in the trigger', () => {
    const el = mount({ value: '1405/03/15' });
    expect(trigger(el).textContent).toContain('۱۴۰۵/۰۳/۱۵');
  });

  it('opens a calendar dialog when the trigger is clicked', () => {
    const el = mount({ value: '1405/03/15' });
    trigger(el).click();
    const dialog = el.querySelector('[role="dialog"]')!;
    expect(dialog).not.toBeNull();
    expect(dialog.querySelector('doran-calendar .doran-month')).not.toBeNull();
  });

  it('picks a day, emits change, and closes the popover', () => {
    const el = mount({ value: '1405/03/15' });
    const onChange = vi.fn();
    el.addEventListener('change', (e) => onChange((e as CustomEvent).detail));
    trigger(el).click();
    el.querySelector<HTMLButtonElement>(
      '[data-action="select-day"][data-y="1405"][data-m="3"][data-d="22"]',
    )!.click();
    expect(onChange).toHaveBeenCalledTimes(1);
    const detail = onChange.mock.calls[0]![0] as { date: DoranDate };
    expect(detail.date.day).toBe(22);
    expect(el.querySelector('[role="dialog"]')).toBeNull();
    expect(el.value?.day).toBe(22);
  });

  it('closes the popover on Escape', () => {
    const el = mount({ value: '1405/03/15' });
    trigger(el).click();
    expect(el.querySelector('[role="dialog"]')).not.toBeNull();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(el.querySelector('[role="dialog"]')).toBeNull();
  });
});
