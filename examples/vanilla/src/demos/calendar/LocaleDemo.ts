import type { DoranCalendarElement } from '@doranjs/wc';

// The `locale` attribute switches the calendar's language. `locale="en"` renders
// English month/weekday names with Latin digits — the same element, a different
// locale (independent of the page language).
export default function LocaleDemo(): HTMLElement {
  const cal = document.createElement('doran-calendar') as DoranCalendarElement;
  cal.setAttribute('locale', 'en');
  return cal;
}
