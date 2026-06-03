import type { DoranDatePickerElement } from '@doranjs/wc';

// `show-holidays` is forwarded to the popover calendar, marking official holidays.
export default function Holidays(locale: string): HTMLElement {
  const dp = document.createElement('doran-datepicker') as DoranDatePickerElement;
  dp.setAttribute('locale', locale);
  dp.setAttribute('show-holidays', '');
  dp.setAttribute('placeholder', '۱۴۰۳/۰۱/۰۱');
  return dp;
}
