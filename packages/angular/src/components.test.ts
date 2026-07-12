import { DoranDate } from '@doranjs/core';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { defineDoranElements } from '../../wc/src/register';
import { applyDatePickerAttributes, setFooterActions } from './attributes';

beforeAll(() => defineDoranElements());
afterEach(() => {
  document.body.innerHTML = '';
});

describe('Angular Web Component attribute bridge', () => {
  it('forwards date-picker customization inputs and normalizes arrays/dates', () => {
    const el = document.createElement('doran-datepicker');
    applyDatePickerAttributes(el, {
      footerActions: ['clear', 'today'],
      iconPosition: 'right',
      textAlign: 'left',
      inputWidth: '19rem',
      dropdownWidth: 'trigger',
      min: DoranDate.fromJalali(1405, 2, 3),
      max: '1405/08/09',
      headerMode: 'separate',
      showHolidays: true,
      weekends: [5, 6],
    });
    document.body.appendChild(el);

    expect(el.getAttribute('footer-actions')).toBe('clear,today');
    expect(el.getAttribute('icon-position')).toBe('right');
    expect(el.getAttribute('text-align')).toBe('left');
    expect(el.getAttribute('input-width')).toBe('19rem');
    expect(el.getAttribute('dropdown-width')).toBe('trigger');
    expect(el.getAttribute('min')).toBe('1405/02/03');
    expect(el.getAttribute('max')).toBe('1405/08/09');
    expect(el.getAttribute('header-mode')).toBe('separate');
    expect(el.hasAttribute('show-holidays')).toBe(true);
    expect(el.getAttribute('weekends')).toBe('5,6');
  });

  it('preserves explicit empty action arrays for calendar and range picker', () => {
    const calendar = document.createElement('doran-calendar');
    setFooterActions(calendar, []);
    document.body.appendChild(calendar);
    expect(calendar.getAttribute('footer-actions')).toBe('');
    expect(calendar.querySelector('[data-action="today"]')).toBeNull();

    const range = document.createElement('doran-rangepicker');
    setFooterActions(range, []);
    document.body.appendChild(range);
    expect(range.getAttribute('footer-actions')).toBe('');
    expect(range.querySelector('[data-action="clear"]')).toBeNull();
  });

  it('forwards clear and receives the nullable Web Component change', () => {
    const el = document.createElement('doran-datepicker');
    el.setAttribute('value', '1405/03/15');
    applyDatePickerAttributes(el, { footerActions: ['clear'] });
    document.body.appendChild(el);
    const onChange = vi.fn();
    el.addEventListener('change', (event) => onChange((event as CustomEvent).detail));

    el.querySelector<HTMLButtonElement>('[data-action="toggle"]')!.click();
    document
      .querySelector<HTMLButtonElement>('.doran-datepicker__popover [data-action="clear"]')!
      .click();

    expect(onChange).toHaveBeenCalledWith({ date: null, iso: null, value: '' });
    expect(document.querySelector('.doran-datepicker__popover')).toBeNull();
  });

  it('propagates disabled to the actual trigger and prevents opening', () => {
    const el = document.createElement('doran-datepicker');
    applyDatePickerAttributes(el, {}, true);
    document.body.appendChild(el);

    const trigger = el.querySelector<HTMLButtonElement>('[data-action="toggle"]')!;
    expect(el.hasAttribute('disabled')).toBe(true);
    expect(trigger.disabled).toBe(true);
    trigger.click();
    expect(document.querySelector('.doran-datepicker__popover')).toBeNull();
  });
});
