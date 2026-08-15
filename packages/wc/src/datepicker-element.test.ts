import { type DoranDate } from '@doranjs/core';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { type DoranDatePickerElement } from './datepicker-element';
import { defineDoranElements } from './register';

beforeAll(() => defineDoranElements());
afterEach(() => {
  document.body.innerHTML = '';
  vi.restoreAllMocks();
});

function mount(attrs: Record<string, string> = {}): DoranDatePickerElement {
  const el = document.createElement('doran-datepicker') as DoranDatePickerElement;
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  document.body.appendChild(el);
  return el;
}

const trigger = (el: HTMLElement) => el.querySelector<HTMLElement>('.doran-datepicker__input')!;
const openButton = (el: HTMLElement) =>
  el.querySelector<HTMLButtonElement>('.doran-datepicker__icon')!;
const control = (el: HTMLElement) =>
  el.querySelector<HTMLInputElement>('.doran-datepicker__control')!;
// The pop-over is portaled to <body>, so dialogs are queried on the document.
const dialog = () => document.querySelector('[role="dialog"]');

describe('<doran-datepicker>', () => {
  it('shows the placeholder until a value is set', () => {
    const el = mount({ placeholder: 'یک تاریخ' });
    const control = el.querySelector<HTMLInputElement>('.doran-datepicker__control')!;
    expect(control.getAttribute('placeholder')).toBe('یک تاریخ');
    expect(control.value).toBe('');
    expect(dialog()).toBeNull();
  });

  it('formats a value attribute in the trigger', () => {
    const el = mount({ value: '1405/03/15' });
    expect(control(el).value).toBe('۱۴۰۵/۰۳/۱۵');
  });

  it('opens a calendar dialog when the trigger is clicked', () => {
    const el = mount({ value: '1405/03/15' });
    openButton(el).click();
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
    openButton(el).click();
    expect(dialog()).not.toBeNull();
    expect(el.contains(dialog())).toBe(false);
    expect(dialog()!.parentElement).toBe(document.body);
  });

  it('picks a day, emits change, and closes the popover', () => {
    const el = mount({ value: '1405/03/15' });
    const onChange = vi.fn();
    el.addEventListener('change', (e) => onChange((e as CustomEvent).detail));
    openButton(el).click();
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

  it('forwards calendar constraints and footer configuration', () => {
    const el = mount({
      min: '1405/03/10',
      max: '1405/03/20',
      'header-mode': 'separate',
      'show-holidays': '',
      weekends: '5,6',
      'footer-actions': '',
    });
    openButton(el).click();
    const calendar = dialog()!.querySelector('doran-calendar')!;
    expect(calendar.getAttribute('min')).toBe('1405/03/10');
    expect(calendar.getAttribute('max')).toBe('1405/03/20');
    expect(calendar.getAttribute('header-mode')).toBe('separate');
    expect(calendar.hasAttribute('show-holidays')).toBe(true);
    expect(calendar.getAttribute('weekends')).toBe('5,6');
    expect(calendar.getAttribute('footer-actions')).toBe('');
    expect(calendar.querySelector('.doran-calendar__footer')).toBeNull();
  });

  it('closes on clear and forwards the nullable change detail', () => {
    const el = mount({
      value: '1405/03/15',
      'with-time': '',
      'footer-actions': 'clear',
    });
    const onChange = vi.fn();
    el.addEventListener('change', (e) => onChange((e as CustomEvent).detail));
    openButton(el).click();

    dialog()!.querySelector<HTMLButtonElement>('[data-action="clear"]')!.click();

    expect(dialog()).toBeNull();
    expect(el.value).toBeNull();
    expect(onChange).toHaveBeenCalledWith({ date: null, iso: null, value: '' });
  });

  it('closes after plain Today but stays open for Today with time', () => {
    const plain = mount({ value: '1405/03/15' });
    openButton(plain).click();
    dialog()!.querySelector<HTMLButtonElement>('[data-action="today"]')!.click();
    expect(dialog()).toBeNull();

    plain.remove();
    const timed = mount({ value: '1405/03/15', 'with-time': '' });
    openButton(timed).click();
    dialog()!.querySelector<HTMLButtonElement>('[data-action="today"]')!.click();
    expect(dialog()).not.toBeNull();
  });

  it('reflects alignment attributes and applies input width', () => {
    const el = mount({
      'icon-position': 'right',
      'text-align': 'left',
      'input-width': '18rem',
    });
    const input = trigger(el);
    expect(el.dataset.iconPosition).toBe('right');
    expect(el.dataset.textAlign).toBe('left');
    expect(el.classList.contains('doran-datepicker--icon-right')).toBe(true);
    expect(input.dataset.iconPosition).toBe('right');
    expect(input.querySelector('.doran-datepicker__control')?.getAttribute('data-text-align')).toBe(
      'left',
    );
    expect(input.style.flexDirection).toBe('row-reverse');
    expect(input.style.width).toBe('18rem');
    expect((input.querySelector('.doran-datepicker__control') as HTMLElement).style.textAlign).toBe(
      'left',
    );
    // Bidi isolation: without dir="auto" the RTL host reorders digit-only
    // values like `1405-04-16 03:24` into time-before-date.
    expect(input.querySelector('.doran-datepicker__control')?.getAttribute('dir')).toBe('auto');
    expect(el.style.getPropertyValue('--doran-input-width')).toBe('18rem');
  });

  it('supports trigger-matched and custom dropdown widths', () => {
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
      top: 20,
      right: 250,
      bottom: 60,
      left: 10,
      width: 240,
      height: 40,
      x: 10,
      y: 20,
      toJSON: () => ({}),
    });
    const matched = mount({ 'dropdown-width': 'trigger' });
    openButton(matched).click();
    expect((dialog() as HTMLElement).style.width).toBe('240px');
    matched.remove();

    const custom = mount({ 'dropdown-width': '22rem' });
    openButton(custom).click();
    expect(custom.dataset.dropdownWidth).toBe('custom');
    expect((dialog() as HTMLElement).style.width).toBe('22rem');
    expect((dialog() as HTMLElement).dataset.dropdownWidth).toBe('custom');
    expect(dialog()!.classList.contains('doran-datepicker__popover--custom')).toBe(true);
  });

  it('propagates disabled to the trigger and prevents opening', () => {
    const el = mount({ disabled: '' });
    expect(control(el).disabled).toBe(true);
    expect(openButton(el).disabled).toBe(true);
    expect(trigger(el).dataset.disabled).toBe('true');
    openButton(el).click();
    expect(dialog()).toBeNull();
  });

  it('closes the popover on Escape', () => {
    const el = mount({ value: '1405/03/15' });
    openButton(el).click();
    expect(dialog()).not.toBeNull();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(dialog()).toBeNull();
  });

  it('keeps the popover open when clicking inside it', () => {
    const el = mount({ value: '1405/03/15' });
    openButton(el).click();
    dialog()!.dispatchEvent(new Event('pointerdown', { bubbles: true }));
    expect(dialog()).not.toBeNull();
    document.body.dispatchEvent(new Event('pointerdown', { bubbles: true }));
    expect(dialog()).toBeNull();
  });

  it('removes the popover when the element is disconnected', () => {
    const el = mount({ value: '1405/03/15' });
    openButton(el).click();
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
