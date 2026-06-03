import type { DoranDatePickerElement } from '@doranjs/wc';

// `with-time` adds a time picker to the popover; `format` shows the time too.
export default function WithTime(locale: string): HTMLElement {
  const dp = document.createElement('doran-datepicker') as DoranDatePickerElement;
  dp.setAttribute('locale', locale);
  dp.setAttribute('with-time', '');
  dp.setAttribute('format', 'dddd D MMMM YYYY — HH:mm');
  return dp;
}
