'use client';

import { dayKey, type DayMeta, type DoranDate } from '@doranjs/core';
import {
  getHolidayCoverage,
  getHolidays,
  type GetHolidaysOptions,
  type Holiday,
  type HolidayCoverage,
} from '@doranjs/holidays';
import { useMemo } from 'react';
import type { DayPropsResult } from './month-view';

export interface HolidayHelperOptions extends GetHolidaysOptions {
  /**
   * Mark only official public holidays — the days people actually get off.
   * Set `false` to also mark observances like Nowruz eve. Defaults to `true`,
   * matching `isHoliday` from `@doranjs/holidays`.
   */
  officialOnly?: boolean;
  /** Which title to surface in tooltips and labels. Defaults to Persian. */
  language?: 'fa' | 'en';
}

export interface HolidayHelpers {
  /** Whether the day is a holiday under the configured options. */
  isHoliday: (day: DoranDate) => boolean;
  /** Every holiday falling on the day — Nowruz and Eid can collide. */
  holidaysOn: (day: DoranDate) => Holiday[];
  /**
   * Ready to pass as `dayProps`: adds the holiday name as a tooltip and to the day's
   * accessible name, plus `data-holiday` and `data-approximate` styling hooks.
   */
  dayProps: (day: DoranDate, meta: DayMeta) => DayPropsResult | undefined;
  /**
   * Whether a year's religious holidays come from Iran's announcements or from the
   * tabular calendar, which can be a day out.
   *
   * Iran announces these by moon sighting, so no library can compute them exactly in
   * advance. Surface this rather than presenting an estimate as fact:
   *
   * ```tsx
   * {!holidays.coverage(year).official && <p>تعطیلات مذهبی این سال تخمینی است.</p>}
   * ```
   */
  coverage: (year: number) => HolidayCoverage;
}

/** Groups a year's holidays by day, so a month render is 42 map lookups. */
function buildYearIndex(year: number, options: GetHolidaysOptions): Map<string, Holiday[]> {
  const index = new Map<string, Holiday[]>();
  for (const holiday of getHolidays(year, options)) {
    const key = `${holiday.year}-${holiday.month}-${holiday.day}`;
    const existing = index.get(key);
    if (existing) existing.push(holiday);
    else index.set(key, [holiday]);
  }
  return index;
}

/**
 * Builds holiday helpers backed by a per-year cache.
 *
 * `getHolidaysOn` recomputes a whole year on every call, which a month grid would do
 * 42 times per render. These helpers resolve each year once and reuse it, so paging
 * through months stays cheap. Use {@link useHolidays} inside components; reach for
 * this directly on the server or outside React.
 */
export function createHolidayHelpers(options: HolidayHelperOptions = {}): HolidayHelpers {
  const { officialOnly = true, language = 'fa', ...getOptions } = options;

  const years = new Map<number, Map<string, Holiday[]>>();
  function indexFor(year: number): Map<string, Holiday[]> {
    let index = years.get(year);
    if (!index) {
      index = buildYearIndex(year, getOptions);
      years.set(year, index);
    }
    return index;
  }

  function holidaysOn(day: DoranDate): Holiday[] {
    return indexFor(day.year).get(dayKey(day)) ?? [];
  }

  function matching(day: DoranDate): Holiday[] {
    const found = holidaysOn(day);
    return officialOnly ? found.filter((holiday) => holiday.official) : found;
  }

  return {
    holidaysOn,
    coverage: (year) => getHolidayCoverage(year, getOptions),
    isHoliday: (day) => matching(day).length > 0,
    dayProps: (day) => {
      const found = matching(day);
      if (found.length === 0) return undefined;

      const separator = language === 'en' ? ', ' : '، ';
      const names = found
        .map((holiday) => (language === 'en' ? holiday.titleEn : holiday.title))
        .join(separator);

      return {
        label: names,
        title: names,
        'data-holiday': 'true',
        // Lunar dates come from the tabular calendar outside the years Iran has
        // officially announced, so they can land a day either side.
        ...(found.some((holiday) => holiday.approximate) ? { 'data-approximate': 'true' } : {}),
      };
    },
  };
}

/**
 * Iranian public holidays, ready to drop into any Doran calendar.
 *
 * @example
 * ```tsx
 * const holidays = useHolidays();
 *
 * <DoranDatePicker isHoliday={holidays.isHoliday} dayProps={holidays.dayProps} />
 * ```
 *
 * To combine with your own `dayProps`, merge the results yourself:
 * ```tsx
 * dayProps={(day, meta) => ({ ...holidays.dayProps(day, meta), ...mine(day, meta) })}
 * ```
 *
 * Note that lunar holidays outside the years Iran has officially announced are
 * computed arithmetically and may differ by a day — those carry `data-approximate`.
 */
export function useHolidays(options: HolidayHelperOptions = {}): HolidayHelpers {
  const { officialOnly, language, includeUnofficial, includeReligious, includeCustom } = options;

  return useMemo(
    () =>
      createHolidayHelpers({
        ...(officialOnly !== undefined ? { officialOnly } : {}),
        ...(language ? { language } : {}),
        ...(includeUnofficial !== undefined ? { includeUnofficial } : {}),
        ...(includeReligious !== undefined ? { includeReligious } : {}),
        ...(includeCustom !== undefined ? { includeCustom } : {}),
      }),
    [officialOnly, language, includeUnofficial, includeReligious, includeCustom],
  );
}

export type { Holiday, HolidayCoverage };
