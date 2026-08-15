import { DoranDate } from '@doranjs/core';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { type DoranCalendarElement } from './calendar-element';
import { defineDoranElements } from './register';

beforeAll(() => defineDoranElements());
afterEach(() => {
  document.body.innerHTML = '';
});

function mountCalendar(html = ''): DoranCalendarElement {
  document.body.innerHTML = `<doran-calendar value="1405/03/15">${html}</doran-calendar>`;
  return document.querySelector('doran-calendar') as DoranCalendarElement;
}

function day(el: Element, year: number, month: number, dayOfMonth: number): HTMLButtonElement {
  return el.querySelector<HTMLButtonElement>(
    `[data-y="${year}"][data-m="${month}"][data-d="${dayOfMonth}"]`,
  )!;
}

describe('dayData on <doran-calendar>', () => {
  it('renders annotation text under the day number', () => {
    const el = mountCalendar();
    el.dayData = { '1405-3-12': { text: '۱٬۲۰۰٬۰۰۰', tone: 'low' } };

    const btn = day(el, 1405, 3, 12);
    expect(btn.querySelector('.doran-day__number')?.textContent).toBe('۱۲');
    const content = btn.querySelector('.doran-day__content')!;
    expect(content.textContent).toBe('۱٬۲۰۰٬۰۰۰');
    expect(content.getAttribute('data-tone')).toBe('low');
  });

  it('switches the grid to the rich layout only when annotations exist', () => {
    const el = mountCalendar();
    expect(el.querySelector('.doran-month')!.classList.contains('doran-month--rich')).toBe(false);

    el.dayData = { '1405-3-12': { text: 'x' } };
    expect(el.querySelector('.doran-month')!.classList.contains('doran-month--rich')).toBe(true);
  });

  it('accepts padded and Persian-digit keys', () => {
    const el = mountCalendar();
    el.dayData = { '۱۴۰۵/۰۳/۱۲': { text: 'ok' } };
    expect(day(el, 1405, 3, 12).querySelector('.doran-day__content')?.textContent).toBe('ok');
  });

  it('appends the annotation to the accessible name rather than replacing it', () => {
    const el = mountCalendar();
    el.dayData = { '1405-3-12': { text: '۳ رویداد' } };

    const label = day(el, 1405, 3, 12).getAttribute('aria-label')!;
    expect(label).toContain('خرداد');
    expect(label).toContain('۳ رویداد');
  });

  it('blocks a day and explains why', () => {
    const el = mountCalendar();
    const onChange = vi.fn();
    el.addEventListener('change', onChange);
    el.dayData = { '1405-3-12': { disabled: true, disabledReason: 'ظرفیت تکمیل' } };

    const btn = day(el, 1405, 3, 12);
    expect(btn.getAttribute('aria-disabled')).toBe('true');
    expect(btn.getAttribute('title')).toBe('ظرفیت تکمیل');
    expect(btn.getAttribute('aria-label')).toContain('ظرفیت تکمیل');

    btn.click();
    expect(onChange).not.toHaveBeenCalled();
  });

  it('blocks days through the disabledDates predicate', () => {
    const el = mountCalendar();
    el.disabledDates = (date: DoranDate) => date.day === 12;

    expect(day(el, 1405, 3, 12).getAttribute('aria-disabled')).toBe('true');
    expect(day(el, 1405, 3, 13).hasAttribute('aria-disabled')).toBe(false);
  });

  it('escapes annotation text', () => {
    const el = mountCalendar();
    el.dayData = { '1405-3-12': { text: '<img src=x onerror=alert(1)>' } };

    const content = day(el, 1405, 3, 12).querySelector('.doran-day__content')!;
    expect(content.querySelector('img')).toBeNull();
    expect(content.textContent).toBe('<img src=x onerror=alert(1)>');
  });
});

describe('light-DOM slots', () => {
  it('places legend, aside and footer children into their regions', () => {
    const el = mountCalendar(
      '<div slot="legend" id="lg">راهنما</div>' +
        '<div slot="aside" id="as">کنار</div>' +
        '<div slot="footer" id="ft">پانویس</div>',
    );

    expect(el.querySelector('.doran-calendar__legend')?.contains(el.querySelector('#lg'))).toBe(
      true,
    );
    expect(el.querySelector('.doran-calendar__aside')?.contains(el.querySelector('#as'))).toBe(
      true,
    );
    expect(
      el.querySelector('.doran-calendar__footer-slot')?.contains(el.querySelector('#ft')),
    ).toBe(true);
  });

  // innerHTML wipes children on every render, so the captured nodes must be
  // re-inserted each time rather than captured once and lost.
  it('keeps slot content across re-renders', () => {
    const el = mountCalendar('<div slot="legend" id="lg">راهنما</div>');
    el.dayData = { '1405-3-1': { text: 'x' } };
    el.value = DoranDate.fromJalali(1405, 4, 2);

    expect(el.querySelector('#lg')).not.toBeNull();
    expect(el.querySelector('.doran-calendar__legend')?.contains(el.querySelector('#lg'))).toBe(
      true,
    );
  });

  it('adds no slot markup when the author supplied none', () => {
    const el = mountCalendar();
    expect(el.querySelector('.doran-calendar__legend')).toBeNull();
    expect(el.querySelector('.doran-calendar__body')).toBeNull();
    expect(el.querySelector('.doran-calendar__footer-slot')).toBeNull();
  });

  it('shows the footer for a slot even with every action hidden', () => {
    document.body.innerHTML =
      '<doran-calendar footer-actions="" ><div slot="footer" id="ft">x</div></doran-calendar>';
    const el = document.querySelector('doran-calendar') as DoranCalendarElement;

    expect(el.querySelector('.doran-calendar__footer')).not.toBeNull();
    expect(el.querySelector('#ft')).not.toBeNull();
  });
});

describe('<doran-datepicker> forwarding', () => {
  it('passes dayData and slot children to the pop-over calendar', () => {
    document.body.innerHTML =
      '<doran-datepicker value="1405/03/15"><div slot="legend" id="lg">راهنما</div></doran-datepicker>';
    const picker = document.querySelector('doran-datepicker') as HTMLElement & {
      dayData: Record<string, { text?: string }> | null;
    };
    picker.dayData = { '1405-3-12': { text: '۱٬۲۰۰' } };

    picker.querySelector<HTMLButtonElement>('.doran-datepicker__icon')!.click();

    const calendar = document.querySelector('doran-calendar')!;
    expect(day(calendar, 1405, 3, 12).querySelector('.doran-day__content')?.textContent).toBe(
      '۱٬۲۰۰',
    );
    expect(calendar.querySelector('#lg')).not.toBeNull();
  });
});

describe('<doran-rangepicker> day widgets', () => {
  it('renders annotations and blocks sold-out days', () => {
    document.body.innerHTML = '<doran-rangepicker></doran-rangepicker>';
    const el = document.querySelector('doran-rangepicker') as HTMLElement & {
      dayData: Record<string, unknown> | null;
    };
    const today = DoranDate.now();
    const key = `${today.year}-${today.month}-${today.day}`;
    el.dayData = { [key]: { text: '۲ اتاق', disabled: true, disabledReason: 'تکمیل' } };

    const btn = day(el, today.year, today.month, today.day);
    expect(btn.querySelector('.doran-day__content')?.textContent).toBe('۲ اتاق');
    expect(btn.getAttribute('aria-disabled')).toBe('true');

    btn.click();
    // A blocked day must not start a range.
    expect(el.querySelector('.doran-day--range-start')).toBeNull();
  });

  it('shares the sidebar between an aside slot and the presets', () => {
    document.body.innerHTML =
      '<doran-rangepicker presets><div slot="aside" id="as">فیلتر</div></doran-rangepicker>';
    const el = document.querySelector('doran-rangepicker')!;

    const sidebar = el.querySelector('.doran-rangepicker__presets')!;
    expect(sidebar.contains(el.querySelector('#as'))).toBe(true);
    expect(sidebar.querySelector('.doran-rangepicker__preset-group')).not.toBeNull();
  });
});
