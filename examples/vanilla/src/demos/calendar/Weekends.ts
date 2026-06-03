import type { DoranCalendarElement } from '@doranjs/wc';

// `weekends` is a comma-separated list of weekday indices to treat as the
// weekend (0 = Saturday). Here both Thursday and Friday.
export default function Weekends(locale: string): HTMLElement {
  const cal = document.createElement('doran-calendar') as DoranCalendarElement;
  cal.setAttribute('locale', locale);
  cal.setAttribute('weekends', '5,6');
  return cal;
}
