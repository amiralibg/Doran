import type { DoranRangeDatePickerElement } from '@doranjs/wc';

// `<doran-rangedatepicker>` is the range picker with a trigger: one field holding
// two inputs, either typable or fillable from the grid. The ends are kept in order,
// so entering an end before the start swaps them.
export default function WithTrigger(locale: string): HTMLElement {
  const picker = document.createElement('doran-rangedatepicker') as DoranRangeDatePickerElement;
  picker.setAttribute('locale', locale);
  picker.setAttribute('presets', '');
  picker.setAttribute('months', '2');
  return picker;
}
