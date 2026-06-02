import { type DoranDate } from '@doranjs/core';

/** A named range shortcut shown beside `<doran-rangepicker>`. */
export interface RangePreset {
  /** The button label (already localized). */
  label: string;
  /** Computes the range relative to a reference "today". */
  range: (today: DoranDate) => { start: DoranDate; end: DoranDate };
}

/** Default Persian range presets: last 7 days, last 30 days, this month, this year. */
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
