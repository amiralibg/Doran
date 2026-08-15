import {
  getDefaultLocale,
  resolveCalendarLabels,
  type DoranDate,
  type Locale,
} from '@doranjs/core';

/** A named range shortcut shown beside `<doran-rangepicker>`. */
export interface RangePreset {
  /** The button label (already localized). */
  label: string;
  /** Computes the range relative to a reference "today". */
  range: (today: DoranDate) => { start: DoranDate; end: DoranDate };
}

/** Default Persian range presets: last 7 days, last 30 days, this month, this year. */
export function defaultRangePresets(locale?: Locale): RangePreset[] {
  // No argument means the ambient default, so existing calls keep their Persian labels.
  const resolved = locale ?? getDefaultLocale();
  const labels = resolveCalendarLabels(resolved);
  const lastDays = (count: number) =>
    labels.lastDays.replace('{count}', resolved.formatNumber(String(count)));
  return [
    {
      label: lastDays(7),
      range: (t) => ({ start: t.subtract(6, 'day').startOf('day'), end: t.startOf('day') }),
    },
    {
      label: lastDays(30),
      range: (t) => ({ start: t.subtract(29, 'day').startOf('day'), end: t.startOf('day') }),
    },
    {
      label: labels.thisMonth,
      range: (t) => ({ start: t.startOf('month'), end: t.endOf('month').startOf('day') }),
    },
    {
      label: labels.thisYear,
      range: (t) => ({ start: t.startOf('year'), end: t.endOf('year').startOf('day') }),
    },
  ];
}
