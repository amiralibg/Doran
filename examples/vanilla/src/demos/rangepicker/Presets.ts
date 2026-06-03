import type { DoranRangePickerElement } from '@doranjs/wc';

// The `presets` attribute adds shortcut buttons (last 7 days, this month, …)
// above the calendar.
export default function Presets(locale: string): HTMLElement {
  const rp = document.createElement('doran-rangepicker') as DoranRangePickerElement;
  rp.setAttribute('locale', locale);
  rp.setAttribute('presets', '');
  return rp;
}
