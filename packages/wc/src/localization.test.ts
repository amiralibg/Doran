import { enUS, faIR, setDefaultLocale } from '@doranjs/core';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import { defineDoranElements } from './register';

beforeAll(() => defineDoranElements());
afterEach(() => {
  document.body.innerHTML = '';
  setDefaultLocale(faIR);
});

function mount(tag: string, attrs: Record<string, string> = {}): HTMLElement {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  document.body.appendChild(el);
  return el;
}

const label = (el: Element, selector: string) =>
  el.querySelector(selector)?.getAttribute('aria-label');

describe('locale="en" drives direction and labels', () => {
  it('renders the calendar left to right with English controls', () => {
    const el = mount('doran-calendar', { locale: 'en', 'footer-actions': 'today,clear' });

    expect(el.getAttribute('dir')).toBe('ltr');
    expect(label(el, '[data-action="prev"]')).toBe('Previous month');
    expect(label(el, '[data-action="next"]')).toBe('Next month');
    expect(el.querySelector('[data-footer-action="today"]')?.textContent).toBe('Today');
    expect(el.querySelector('[data-footer-action="clear"]')?.textContent).toBe('Clear');
  });

  it('renders the date picker left to right with English text', () => {
    const el = mount('doran-datepicker', { locale: 'en' });

    expect(el.getAttribute('dir')).toBe('ltr');
    expect(el.querySelector('.doran-datepicker__control')?.getAttribute('placeholder')).toBe(
      'Pick a date',
    );
    expect(label(el, '.doran-datepicker__icon')).toBe('Open calendar');
  });

  it('names the pop-over in English', () => {
    const el = mount('doran-datepicker', { locale: 'en' });
    el.querySelector<HTMLButtonElement>('.doran-datepicker__icon')!.click();

    const dialog = document.querySelector('[role="dialog"]')!;
    expect(dialog.getAttribute('aria-label')).toBe('Calendar');
    expect(dialog.getAttribute('dir')).toBe('ltr');
  });

  it('localizes the range summary and presets', () => {
    const el = mount('doran-rangepicker', { locale: 'en', presets: '' });

    expect(el.getAttribute('dir')).toBe('ltr');
    expect(el.querySelector('.doran-rangepicker__summary')?.textContent).toContain(' to ');
    expect(label(el, '.doran-rangepicker__preset-group')).toBe('Quick ranges');
    expect(el.querySelector('.doran-rangepicker__preset')?.textContent).toBe('Last 7 days');
  });

  it('localizes the time picker fields', () => {
    const el = mount('doran-calendar', { locale: 'en', 'with-time': '' });
    expect(el.querySelector('.doran-time__field')?.getAttribute('aria-label')).toBe('Hour');
  });

  it('localizes the natural-language input', () => {
    const el = mount('doran-nlp-input', { locale: 'en' });
    expect(el.querySelector<HTMLInputElement>('.doran-nlp__input')?.placeholder).toBe(
      'e.g. Friday at 7pm',
    );
    expect(el.getAttribute('dir')).toBe('ltr');
  });
});

describe('Persian stays the default', () => {
  it('keeps rtl and Persian labels with no locale attribute', () => {
    const el = mount('doran-calendar', { 'footer-actions': 'today' });

    expect(el.getAttribute('dir')).toBe('rtl');
    expect(label(el, '[data-action="prev"]')).toBe('ماه قبل');
    expect(el.querySelector('[data-footer-action="today"]')?.textContent).toBe('امروز');
  });

  it('follows setDefaultLocale', () => {
    setDefaultLocale(enUS);
    const el = mount('doran-calendar');
    expect(el.getAttribute('dir')).toBe('ltr');
  });
});
