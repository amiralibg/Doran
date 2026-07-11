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
// The pop-over is portaled to <body>, so dialogs are queried on the document.
const dialog = () => document.querySelector('[role="dialog"]');

describe('<doran-datepicker>', () => {
  it('shows the placeholder until a value is set', () => {
    const el = mount({ placeholder: 'یک تاریخ' });
    expect(el.querySelector('.doran-datepicker__placeholder')?.textContent).toBe('یک تاریخ');
    expect(dialog()).toBeNull();
  });

  it('formats a value attribute in the trigger', () => {
    const el = mount({ value: '1405/03/15' });
    expect(trigger(el).textContent).toContain('۱۴۰۵/۰۳/۱۵');
  });

  it('opens a calendar dialog when the trigger is clicked', () => {
    const el = mount({ value: '1405/03/15' });
    trigger(el).click();
    expect(dialog()).not.toBeNull();
    expect(dialog()!.querySelector('doran-calendar .doran-month')).not.toBeNull();
  });

  it('portals the popover to <body> so overflow ancestors cannot clip it', () => {
    const wrapper = document.createElement('div');
    wrapper.style.overflow = 'hidden';
    document.body.appendChild(wrapper);
    const el = document.createElement('doran-datepicker') as DoranDatePickerElement;
    el.setAttribute('value', '1405/03/15');
    wrapper.appendChild(el);
    trigger(el).click();
    expect(dialog()).not.toBeNull();
    expect(el.contains(dialog())).toBe(false);
    expect(dialog()!.parentElement).toBe(document.body);
  });

  it('picks a day, emits change, and closes the popover', () => {
    const el = mount({ value: '1405/03/15' });
    const onChange = vi.fn();
    el.addEventListener('change', (e) => onChange((e as CustomEvent).detail));
    trigger(el).click();
    document
      .querySelector<HTMLButtonElement>(
        '[data-action="select-day"][data-y="1405"][data-m="3"][data-d="22"]',
      )!
      .click();
    expect(onChange).toHaveBeenCalledTimes(1);
    const detail = onChange.mock.calls[0]![0] as { date: DoranDate };
    expect(detail.date.day).toBe(22);
    expect(dialog()).toBeNull();
    expect(el.value?.day).toBe(22);
  });

  it('closes the popover on Escape', () => {
    const el = mount({ value: '1405/03/15' });
    trigger(el).click();
    expect(dialog()).not.toBeNull();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(dialog()).toBeNull();
  });

  it('keeps the popover open when clicking inside it', () => {
    const el = mount({ value: '1405/03/15' });
    trigger(el).click();
    dialog()!.dispatchEvent(new Event('pointerdown', { bubbles: true }));
    expect(dialog()).not.toBeNull();
    document.body.dispatchEvent(new Event('pointerdown', { bubbles: true }));
    expect(dialog()).toBeNull();
  });

  it('removes the popover when the element is disconnected', () => {
    const el = mount({ value: '1405/03/15' });
    trigger(el).click();
    expect(dialog()).not.toBeNull();
    el.remove();
    expect(dialog()).toBeNull();
  });

  it('renders the default calendar icon', () => {
    const el = mount();
    expect(el.querySelector('.doran-datepicker__icon svg')).not.toBeNull();
  });

  it('hides the icon with hide-icon', () => {
    const el = mount({ 'hide-icon': '' });
    expect(el.querySelector('.doran-datepicker__icon')).toBeNull();
  });

  it('renders a custom [slot="icon"] child instead of the default icon', () => {
    const el = document.createElement('doran-datepicker') as DoranDatePickerElement;
    const star = document.createElement('span');
    star.setAttribute('slot', 'icon');
    star.textContent = '★';
    el.appendChild(star);
    document.body.appendChild(el);
    const icon = el.querySelector('.doran-datepicker__icon')!;
    expect(icon.querySelector('svg')).toBeNull();
    expect(icon.textContent).toBe('★');
    // …and it survives re-renders.
    el.setAttribute('value', '1405/03/15');
    expect(el.querySelector('.doran-datepicker__icon')?.textContent).toBe('★');
  });
});
