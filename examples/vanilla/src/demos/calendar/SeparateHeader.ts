import type { DoranCalendarElement } from '@doranjs/wc';

// `header-mode="separate"` renders native month and year menus instead of the
// in-place dropdown panels.
export default function SeparateHeader(locale: string): HTMLElement {
  const cal = document.createElement('doran-calendar') as DoranCalendarElement;
  cal.setAttribute('locale', locale);
  cal.setAttribute('header-mode', 'separate');
  return cal;
}
