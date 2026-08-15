/** A Gregorian calendar date (no time component). Months are 1-based. */
export interface GregorianParts {
  year: number;
  /** 1 (January) – 12 (December). */
  month: number;
  day: number;
}

/** A Jalali calendar date (no time component). Months are 1-based. */
export interface JalaliParts {
  year: number;
  /** 1 (Farvardin) – 12 (Esfand). */
  month: number;
  day: number;
}

/** A full Jalali date-time broken into its civil fields. */
export interface DoranDateParts {
  year: number;
  /** 1 (Farvardin) – 12 (Esfand). */
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
  millisecond: number;
}

/** Calendar units used by arithmetic and `startOf` / `endOf`. */
export type DateUnit =
  | 'year'
  | 'quarter'
  | 'month'
  | 'week'
  | 'day'
  | 'hour'
  | 'minute'
  | 'second'
  | 'millisecond';

/** Units accepted by {@link DoranDate.diff}. */
export type DiffUnit = DateUnit;

/** Inclusivity for {@link DoranDate.isBetween}: `[` / `]` inclusive, `(` / `)` exclusive. */
export type Inclusivity = '()' | '[]' | '[)' | '(]';

/**
 * Relative-time phrase bundle used by {@link DoranDate.fromNow} and friends. Tokens
 * with `%d` receive the (locale-formatted) count; `%s` in `future`/`past` receives the
 * rendered phrase.
 */
export interface RelativeTimeStrings {
  future: string;
  past: string;
  /** a few seconds */ s: string;
  /** N seconds */ ss: string;
  /** a minute */ m: string;
  /** N minutes */ mm: string;
  /** an hour */ h: string;
  /** N hours */ hh: string;
  /** a day */ d: string;
  /** N days */ dd: string;
  /** a month */ M: string;
  /** N months */ MM: string;
  /** a year */ y: string;
  /** N years */ yy: string;
}

/** Options accepted when constructing a {@link DoranDate}. */
export interface DoranDateOptions {
  /**
   * IANA time-zone identifier (e.g. `"Asia/Tehran"`). Defaults to the host's
   * resolved time zone.
   */
  timeZone?: string;
  /** Locale used for formatting. Defaults to the Persian (`fa-IR`) locale. */
  locale?: LocaleLike;
}

/** Identifier for a registered locale, or a full locale object. */
export type LocaleLike = string | Locale;

/** Day-of-week index where 0 = Saturday … 6 = Friday (Persian week convention). */
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

/**
 * Text used by calendar controls, including the strings assistive technology reads.
 *
 * Every field is optional: anything you leave out falls back to the Persian default,
 * so a locale can override as little or as much as it likes. Use
 * {@link resolveCalendarLabels} to read them — it fills the gaps.
 */
export interface CalendarLabels {
  /** The action that selects today. */
  today?: string;
  /** The action that clears the current selection. */
  clear?: string;
  /** Placeholder for a date-picker input. */
  datePlaceholder?: string;
  /** Accessible name of the calendar pop-over. */
  calendar?: string;
  /** Accessible name of the button that opens the calendar. */
  openCalendar?: string;
  /** Accessible name of the previous-month button. */
  previousMonth?: string;
  /** Accessible name of the next-month button. */
  nextMonth?: string;
  /** Accessible name of the month selector. */
  month?: string;
  /** Accessible name of the year selector. */
  year?: string;
  /** Label for the hour field of a time picker. */
  hour?: string;
  /** Label for the minute field of a time picker. */
  minute?: string;
  /** Prefixes a stepper's accessible name, as `"{increase} {hour}"`. */
  increase?: string;
  /** Prefixes a stepper's accessible name, as `"{decrease} {hour}"`. */
  decrease?: string;
  /** Accessible name of the quick-pick range group. */
  presets?: string;
  /** Joins the two ends of a range summary, as `"{start}{rangeSeparator}{end}"`. */
  rangeSeparator?: string;
  /** Stands in for a range end that has not been picked yet. */
  rangeEmpty?: string;
  /** Placeholder for the natural-language input. */
  nlpPlaceholder?: string;
  /** Shown when natural-language text does not resolve to a date. */
  unresolved?: string;
  /** Joins a day's date with any custom annotation in its accessible name. */
  listSeparator?: string;
  /** Quick-pick label; `{count}` is replaced with the localized number. */
  lastDays?: string;
  /** Quick-pick label for the current month. */
  thisMonth?: string;
  /** Quick-pick label for the current year. */
  thisYear?: string;
}

/** {@link CalendarLabels} with every gap filled, as {@link resolveCalendarLabels} returns. */
export type ResolvedCalendarLabels = Required<CalendarLabels>;

/** A localization bundle for formatting Jalali dates. */
export interface Locale {
  /** Unique name, e.g. `"fa-IR"`. */
  name: string;
  /**
   * Writing direction for components rendered in this locale. Defaults to `'rtl'`,
   * which is what every existing locale assumed before this field existed.
   *
   * Components read this instead of hardcoding `dir`, so switching to a Latin locale
   * actually produces a left-to-right widget.
   */
  direction?: 'rtl' | 'ltr';
  /** Full month names, index 0 = Farvardin … 11 = Esfand. */
  months: readonly string[];
  /** Abbreviated month names, aligned with {@link Locale.months}. */
  monthsShort: readonly string[];
  /** Full weekday names, index 0 = Saturday … 6 = Friday. */
  weekdays: readonly string[];
  /** Abbreviated weekday names, aligned with {@link Locale.weekdays}. */
  weekdaysShort: readonly string[];
  /** Minimal weekday names (single glyph where possible). */
  weekdaysMin: readonly string[];
  /** Ante/Post meridiem markers: `[am, pm]`. */
  meridiem: readonly [string, string];
  /** Converts a Latin-digit string into this locale's preferred numerals. */
  formatNumber: (value: string) => string;
  /** Converts this locale's numerals back into Latin digits. */
  parseNumber: (value: string) => string;
  /** Relative-time phrases for {@link DoranDate.fromNow}. Optional; a default is used. */
  relativeTime?: RelativeTimeStrings;
  /** Labels used by calendar controls. Optional for backward-compatible custom locales. */
  calendarLabels?: CalendarLabels;
}
