import { normalizeDigits } from './digits';

/**
 * Semantic emphasis for a day annotation, surfaced in the DOM as `data-tone` so
 * themes can style it. The listed values are the conventions Doran's own stylesheet
 * ships; any other string is allowed and simply passes through for you to style.
 */
export type DayTone =
  | 'neutral'
  | 'low'
  | 'high'
  | 'positive'
  | 'negative'
  // Keeps the literals in autocomplete while still accepting custom tones.
  | (string & {});

/**
 * A serializable annotation attached to a single day.
 *
 * This is the cross-framework way to put content under a day: unlike a render
 * function it survives JSON, so it works from a server response, an HTML attribute,
 * or a web-component property. React users who want arbitrary markup should reach
 * for `dayContent` instead.
 */
export interface DayDatum {
  /** Short text rendered beneath the day number — a fare, a count, a temperature. */
  text?: string;
  /** Semantic emphasis, emitted as `data-tone`. */
  tone?: DayTone;
  /**
   * Appended to the day's accessible name. Defaults to {@link DayDatum.text}, which
   * is usually what you want — set this when the raw text reads poorly aloud
   * (e.g. `text: '۱٬۲۰۰٬۰۰۰'`, `label: 'ارزان‌ترین نرخ ۱٬۲۰۰٬۰۰۰ تومان'`).
   */
  label?: string;
  /** Native tooltip text for the day. */
  title?: string;
  /** Marks the day unselectable, on top of any `min`/`max` or `disabledDates` rule. */
  disabled?: boolean;
  /**
   * Why the day is unselectable. Shown as a tooltip and folded into the accessible
   * name, so keyboard and screen-reader users get the same explanation sighted
   * users do.
   */
  disabledReason?: string;
}

/**
 * Day annotations keyed by date. Keys are Jalali `YYYY-M-D`, but zero-padded and
 * Persian-digit forms are accepted too — see {@link normalizeDayKey}.
 */
export type DayDataMap = Record<string, DayDatum>;

/** The state of a day cell at render time, passed to day render functions. */
export interface DayMeta {
  /** Jalali year of this cell. */
  year: number;
  /** Jalali month, 1–12. */
  month: number;
  /** Jalali day of month. */
  day: number;
  /** Persian weekday index, 0 = Saturday … 6 = Friday. */
  weekday: number;
  /** Whether the day belongs to the month currently displayed. */
  inCurrentMonth: boolean;
  /** Whether the day is "today" relative to the calendar's reference date. */
  isToday: boolean;
  selected: boolean;
  /** Whether the day is unselectable, from any source. */
  disabled: boolean;
  holiday: boolean;
  weekend: boolean;
  /** Whether the day falls strictly inside a selected range. */
  inRange: boolean;
  rangeStart: boolean;
  rangeEnd: boolean;
}

/** Anything carrying Jalali date parts — a `DoranDate`, a grid cell, a plain object. */
interface JalaliDayParts {
  year: number;
  month: number;
  day: number;
}

/**
 * The canonical {@link DayDataMap} key for a date: unpadded Jalali `YYYY-M-D`.
 *
 * @example
 * ```ts
 * dayKey(DoranDate.fromJalali({ year: 1404, month: 5, day: 12 })); // '1404-5-12'
 * ```
 */
export function dayKey(date: JalaliDayParts): string {
  return `${date.year}-${date.month}-${date.day}`;
}

/**
 * Normalizes a hand-written day key to the form {@link dayKey} produces.
 *
 * Accepts `-`, `/`, and `.` separators, zero-padded parts, and Persian or Arabic
 * numerals — so `'۱۴۰۴/۰۵/۱۲'`, `'1404-05-12'`, and `'1404-5-12'` all resolve to the
 * same day. Keys that don't parse are returned unchanged rather than thrown on, so a
 * typo shows up as a day that simply has no annotation.
 */
export function normalizeDayKey(key: string): string {
  const parts = normalizeDigits(key).split(/[-/.]/);
  if (parts.length !== 3) return key;

  const [year, month, day] = parts.map((part) => Number(part.trim()));
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) return key;

  return `${year}-${month}-${day}`;
}

/**
 * Builds a normalized lookup from a {@link DayDataMap}, so per-cell reads are a plain
 * `Map.get` rather than a re-parse. Returns `null` for an absent or empty map, letting
 * callers skip the lookup entirely.
 *
 * Memoize this on the map identity — a month renders 42 cells.
 */
export function indexDayData(data: DayDataMap | undefined | null): Map<string, DayDatum> | null {
  if (!data) return null;

  const entries = Object.entries(data);
  if (entries.length === 0) return null;

  const index = new Map<string, DayDatum>();
  for (const [key, datum] of entries) {
    if (datum) index.set(normalizeDayKey(key), datum);
  }
  return index;
}
