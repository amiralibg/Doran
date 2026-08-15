import type { DoranDatePickerElement } from '@doranjs/wc';

// `format` controls how the selected date is displayed — and how typing is masked:
// digits flow into this shape as they are entered, so here `14030101` becomes
// `1403-01-01`. `placeholder` is the empty-state hint.
export default function Format(locale: string): HTMLElement {
  const dp = document.createElement('doran-datepicker') as DoranDatePickerElement;
  dp.setAttribute('locale', locale);
  dp.setAttribute('format', 'YYYY-MM-DD');
  dp.setAttribute('placeholder', '۱۴۰۳-۰۱-۰۱');
  return dp;
}
