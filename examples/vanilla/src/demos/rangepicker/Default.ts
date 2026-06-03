import type { DoranRangePickerElement } from '@doranjs/wc';

// Click a start day, then an end day. The element manages the handshake and
// fires `change` with `{ start, end }`.
export default function Default(locale: string): HTMLElement {
  const rp = document.createElement('doran-rangepicker') as DoranRangePickerElement;
  rp.setAttribute('locale', locale);
  return rp;
}
