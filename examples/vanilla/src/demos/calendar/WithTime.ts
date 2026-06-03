import type { DoranCalendarElement } from '@doranjs/wc';

// The `with-time` attribute adds a time picker; the change value then carries
// the time of day.
export default function WithTime(locale: string): HTMLElement {
  const cal = document.createElement('doran-calendar') as DoranCalendarElement;
  cal.setAttribute('locale', locale);
  cal.setAttribute('with-time', '');
  return cal;
}
