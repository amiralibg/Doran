import type { DoranCalendarElement } from '@doranjs/wc';

// `hide-footer` removes the "today" button; `year-span` sets how many years the
// year picker offers around the current view.
export default function Footer(locale: string): HTMLElement {
  const cal = document.createElement('doran-calendar') as DoranCalendarElement;
  cal.setAttribute('locale', locale);
  cal.setAttribute('hide-footer', '');
  cal.setAttribute('year-span', '20');
  return cal;
}
