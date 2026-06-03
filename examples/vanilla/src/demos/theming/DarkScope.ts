import type { DoranCalendarElement } from '@doranjs/wc';

// The dark theme is just a set of CSS variables under `[data-doran-theme="dark"]`.
// Put that attribute on any element to scope the dark theme to it — here only
// this box is dark, regardless of the page theme.
export default function DarkScope(locale: string): HTMLElement {
  const wrap = document.createElement('div');
  wrap.setAttribute('data-doran-theme', 'dark');
  wrap.style.padding = '1rem';
  wrap.style.borderRadius = '12px';
  wrap.style.background = 'var(--doran-bg)';

  const cal = document.createElement('doran-calendar') as DoranCalendarElement;
  cal.setAttribute('locale', locale);
  wrap.append(cal);
  return wrap;
}
