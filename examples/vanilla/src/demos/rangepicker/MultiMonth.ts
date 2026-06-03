import type { DoranRangePickerElement } from '@doranjs/wc';

// `months` renders several months side by side, easing long-range selection.
export default function MultiMonth(locale: string): HTMLElement {
  const rp = document.createElement('doran-rangepicker') as DoranRangePickerElement;
  rp.setAttribute('locale', locale);
  rp.setAttribute('months', '2');
  return rp;
}
