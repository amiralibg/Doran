import { DoranDate } from '@doranjs/core';
import type { DoranDatePickerElement } from '@doranjs/wc';

export default function Customization(locale: string): HTMLElement {
  const dp = document.createElement('doran-datepicker') as DoranDatePickerElement;
  dp.value = DoranDate.now();
  dp.setAttribute('locale', locale);
  dp.setAttribute('footer-actions', 'today,clear');
  dp.setAttribute('icon-position', 'right');
  dp.setAttribute('text-align', 'left');
  dp.setAttribute('input-width', '18rem');
  dp.setAttribute('dropdown-width', 'trigger');
  return dp;
}
