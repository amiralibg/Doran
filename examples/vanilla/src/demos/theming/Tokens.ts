import type { DoranCalendarElement } from '@doranjs/wc';

// Every part is styled by CSS variables. Override a handful of --doran-* tokens
// on a wrapper — no component overrides — and the same calendar restyles itself.
export default function Tokens(locale: string): HTMLElement {
  const wrap = document.createElement('div');
  wrap.style.setProperty('--doran-day-selected-bg', '#e11d48');
  wrap.style.setProperty('--doran-day-today-color', '#e11d48');
  wrap.style.setProperty('--doran-day-today-ring', '#fb7185');
  wrap.style.setProperty('--doran-day-hover-bg', '#fde7ec');
  wrap.style.setProperty('--doran-day-radius', '10px');

  const cal = document.createElement('doran-calendar') as DoranCalendarElement;
  cal.setAttribute('locale', locale);
  wrap.append(cal);
  return wrap;
}
