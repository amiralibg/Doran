import { type DoranDate } from '@doranjs/core';
import type { DateRange } from './hooks';

/** A named range shortcut shown above a range picker. */
export interface RangePreset {
  /** The button label (already localized). */
  label: string;
  /** Computes the range relative to a reference "today". */
  range: (today: DoranDate) => DateRange;
}

/**
 * The default Persian range presets: last 7 days, last 30 days, this month, this year.
 * Pass your own array to {@link DoranRangePicker} to customize.
 */
export function defaultRangePresets(): RangePreset[] {
  return [
    {
      label: '۷ روز اخیر',
      range: (t) => ({ start: t.subtract(6, 'day').startOf('day'), end: t.startOf('day') }),
    },
    {
      label: '۳۰ روز اخیر',
      range: (t) => ({ start: t.subtract(29, 'day').startOf('day'), end: t.startOf('day') }),
    },
    {
      label: 'این ماه',
      range: (t) => ({ start: t.startOf('month'), end: t.endOf('month').startOf('day') }),
    },
    {
      label: 'این سال',
      range: (t) => ({ start: t.startOf('year'), end: t.endOf('year').startOf('day') }),
    },
  ];
}
