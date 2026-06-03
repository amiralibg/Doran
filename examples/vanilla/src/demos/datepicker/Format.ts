import type { DoranDatePickerElement } from '@doranjs/wc';

// `format` controls how the selected date is displayed; `placeholder` is the
// empty-state hint.
export default function Format(locale: string): HTMLElement {
  const dp = document.createElement('doran-datepicker') as DoranDatePickerElement;
  dp.setAttribute('locale', locale);
  dp.setAttribute('format', 'YYYY/MM/DD');
  dp.setAttribute('placeholder', '۱۴۰۳/۰۱/۰۱');
  return dp;
}
