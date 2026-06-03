import type { DoranCalendarElement } from '@doranjs/wc';

// `show-holidays` marks official holidays (the element reads the @doranjs/holidays
// data itself) with a dot and the holiday color.
export default function Holidays(locale: string): HTMLElement {
  const cal = document.createElement('doran-calendar') as DoranCalendarElement;
  cal.setAttribute('locale', locale);
  cal.setAttribute('show-holidays', '');
  return cal;
}
