import type { DoranRangePickerElement } from '@doranjs/wc';

// The same holiday/weekend marking as the calendar via `show-holidays` and
// `weekends`.
export default function Holidays(locale: string): HTMLElement {
  const rp = document.createElement('doran-rangepicker') as DoranRangePickerElement;
  rp.setAttribute('locale', locale);
  rp.setAttribute('show-holidays', '');
  rp.setAttribute('weekends', '5,6');
  return rp;
}
