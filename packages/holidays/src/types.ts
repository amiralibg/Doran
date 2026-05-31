/** What kind of occasion a holiday marks. */
export type HolidayType = 'national' | 'religious' | 'cultural';

/** Which calendar the holiday is anchored to. */
export type HolidayCalendar = 'solar' | 'lunar';

/** A resolved holiday on a specific Jalali date. */
export interface Holiday {
  /** Jalali year. */
  year: number;
  /** Jalali month, 1–12. */
  month: number;
  /** Jalali day of month. */
  day: number;
  /** Persian title. */
  title: string;
  /** English title. */
  titleEn: string;
  /** The kind of occasion. */
  type: HolidayType;
  /** The calendar the date is anchored to. */
  calendar: HolidayCalendar;
  /** Whether this is an official public holiday (a day off). */
  official: boolean;
  /**
   * `true` when the date was computed from the arithmetic (tabular) lunar calendar
   * and may differ by ±1 day from Iran's official sighting-based announcement.
   */
  approximate?: boolean;
  /** Optional longer description. */
  description?: string;
}

/** A holiday that recurs on the same Jalali (solar) date every year. */
export interface SolarHolidayDef {
  month: number;
  day: number;
  title: string;
  titleEn: string;
  type: HolidayType;
  official: boolean;
  description?: string;
}

/** A holiday anchored to a Hijri (lunar) date, recomputed for each year. */
export interface LunarHolidayDef {
  /** Hijri month, 1 (Muharram) – 12 (Dhu al-Hijjah). */
  hijriMonth: number;
  /** Hijri day of month. */
  hijriDay: number;
  title: string;
  titleEn: string;
  type: HolidayType;
  official: boolean;
  description?: string;
}

/** Options for {@link getHolidays}. */
export interface GetHolidaysOptions {
  /** Include unofficial cultural/observance days (default `true`). */
  includeUnofficial?: boolean;
  /** Include religious (lunar) holidays (default `true`). */
  includeReligious?: boolean;
  /** Include custom-registered holidays (default `true`). */
  includeCustom?: boolean;
}
