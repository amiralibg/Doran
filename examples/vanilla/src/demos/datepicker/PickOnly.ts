import type { DoranDatePickerElement } from '@doranjs/wc';

export default function PickOnly(locale: string): HTMLElement {
  const dp = document.createElement('doran-datepicker') as DoranDatePickerElement;
  dp.setAttribute('locale', locale);
  // The trigger becomes a button: the whole field opens the calendar and no
  // on-screen keyboard ever appears over it.
  dp.setAttribute('editable', 'false');
  dp.setAttribute('mode', 'auto');
  dp.setAttribute('input-width', '14rem');
  return dp;
}
