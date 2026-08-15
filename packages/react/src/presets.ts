import {
  getDefaultLocale,
  resolveCalendarLabels,
  type DoranDate,
  type Locale,
} from '@doranjs/core';
import type { DateRange } from './hooks';

/** A named range shortcut shown above a range picker. */
export interface RangePreset {
  /** The button label (already localized). */
  label: string;
  /** Computes the range relative to a reference "today". */
  range: (today: DoranDate) => DateRange;
}

/**
 * The default range shortcuts: last 7 days, last 30 days, this month, this year.
 *
 * Labels come from the locale, including the numerals — hardcoding `'۷ روز اخیر'`
 * meant an English locale still showed Persian digits. Pass your own array to
 * {@link DoranRangePicker} to customize.
 */
export function defaultRangePresets(locale?: Locale): RangePreset[] {
  // No argument means the ambient default, so an existing `defaultRangePresets()`
  // call keeps producing Persian labels with Persian numerals.
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
