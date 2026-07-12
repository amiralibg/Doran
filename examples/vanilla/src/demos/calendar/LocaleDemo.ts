import type { DoranCalendarElement } from '@doranjs/wc';

// The `locale` attribute switches the calendar's language. `locale="en"` renders
// English month/weekday names, Latin digits, and localized footer actions — the
// same element, independent of the page language.
export default function LocaleDemo(): HTMLElement {
  const cal = document.createElement('doran-calendar') as DoranCalendarElement;
  cal.setAttribute('locale', 'en');
  return cal;
}
