import type { DoranDatePickerElement } from '@doranjs/wc';

// A date input that opens a calendar popover on click.
export default function Default(locale: string): HTMLElement {
  const dp = document.createElement('doran-datepicker') as DoranDatePickerElement;
  dp.setAttribute('locale', locale);
  return dp;
}
