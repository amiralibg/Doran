import { resolveLocale } from './locale';
import { humanizeRelative } from './relative';
import type { Locale, LocaleLike } from './types';

const MS_PER_SECOND = 1000;
const MS_PER_MINUTE = 60 * MS_PER_SECOND;
const MS_PER_HOUR = 60 * MS_PER_MINUTE;
const MS_PER_DAY = 24 * MS_PER_HOUR;
const MS_PER_WEEK = 7 * MS_PER_DAY;

/** The average length of a month in the Gregorian/Solar year — Moment's constant. */
const daysToMonths = (days: number): number => (days * 4800) / 146097;
const monthsToDays = (months: number): number => (months * 146097) / 4800;

/** Floors toward zero (Moment's `absFloor`). */
const absFloor = (value: number): number => (value < 0 ? Math.ceil(value) : Math.floor(value));

/** A calendar unit accepted by {@link Duration.as} and {@link duration}. */
export type DurationUnit =
  | 'year'
  | 'quarter'
  | 'month'
  | 'week'
  | 'day'
  | 'hour'
  | 'minute'
  | 'second'
  | 'millisecond';

/** Object form accepted by {@link duration}. */
export interface DurationInput {
  years?: number;
  quarters?: number;
  months?: number;
  weeks?: number;
  days?: number;
  hours?: number;
  minutes?: number;
  seconds?: number;
  milliseconds?: number;
}

/** The bubbled, per-unit breakdown returned by {@link Duration.toObject}. */
export interface DurationObject {
  years: number;
  months: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  milliseconds: number;
}

/**
 * An immutable length of time, decomposed (like Moment's `Duration`) into months,
 * days, and milliseconds so that calendar-aware units (`month`, `year`) and exact units
 * (`day` and below) both convert correctly.
 *
 * @example
 * ```ts
 * duration({ hours: 2, minutes: 30 }).asMinutes(); // 150
 * duration(3, 'day').humanize(true);                // "در ۳ روز"
 * a.diffDuration(b).humanize();                     // "۲ ماه"
 * ```
 */
export class Duration {
  readonly #months: number;
  readonly #days: number;
  readonly #milliseconds: number;
  readonly #locale: Locale;

  /** @internal Use {@link duration} to construct a Duration. */
  constructor(months: number, days: number, milliseconds: number, locale: Locale) {
    this.#months = months;
    this.#days = days;
    this.#milliseconds = milliseconds;
    this.#locale = locale;
  }

  /** Total value expressed in `unit` (fractional). */
  as(unit: DurationUnit): number {
    const ms = this.#milliseconds;
    if (unit === 'month' || unit === 'quarter' || unit === 'year') {
      const days = this.#days + ms / MS_PER_DAY;
      const months = this.#months + daysToMonths(days);
      if (unit === 'month') return months;
      if (unit === 'quarter') return months / 3;
      return months / 12;
    }
    const days = this.#days + Math.round(monthsToDays(this.#months));
    switch (unit) {
      case 'week':
        return days / 7 + ms / MS_PER_WEEK;
      case 'day':
        return days + ms / MS_PER_DAY;
      case 'hour':
        return days * 24 + ms / MS_PER_HOUR;
      case 'minute':
        return days * 1440 + ms / MS_PER_MINUTE;
      case 'second':
        return days * 86400 + ms / MS_PER_SECOND;
      case 'millisecond':
        return Math.floor(days * MS_PER_DAY) + ms;
    }
  }

  asMilliseconds(): number {
    return this.as('millisecond');
  }
  asSeconds(): number {
    return this.as('second');
  }
  asMinutes(): number {
    return this.as('minute');
  }
  asHours(): number {
    return this.as('hour');
  }
  asDays(): number {
    return this.as('day');
  }
  asWeeks(): number {
    return this.as('week');
  }
  asMonths(): number {
    return this.as('month');
  }
  asQuarters(): number {
    return this.as('quarter');
  }
  asYears(): number {
    return this.as('year');
  }

  /** The bubbled, per-unit breakdown (milliseconds < 1000, seconds < 60, …). */
  toObject(): DurationObject {
    let milliseconds = this.#milliseconds;
    let days = this.#days;

    let seconds = absFloor(milliseconds / MS_PER_SECOND);
    milliseconds %= MS_PER_SECOND;
    let minutes = absFloor(seconds / 60);
    seconds %= 60;
    let hours = absFloor(minutes / 60);
    minutes %= 60;
    days += absFloor(hours / 24);
    hours %= 24;

    const monthsFromDays = absFloor(daysToMonths(days));
    let months = this.#months + monthsFromDays;
    days -= absFloor(monthsToDays(monthsFromDays));
    const years = absFloor(months / 12);
    months %= 12;

    return { years, months, days, hours, minutes, seconds, milliseconds };
  }

  /** The value of a single bubbled field, e.g. `get('hour')` → 0–23. */
  get(unit: DurationUnit): number {
    const o = this.toObject();
    switch (unit) {
      case 'year':
        return o.years;
      case 'quarter':
        return Math.floor(o.months / 3);
      case 'month':
        return o.months;
      case 'week':
        return Math.floor(o.days / 7);
      case 'day':
        return o.days;
      case 'hour':
        return o.hours;
      case 'minute':
        return o.minutes;
      case 'second':
        return o.seconds;
      case 'millisecond':
        return o.milliseconds;
    }
  }

  /** `-1`, `0`, or `1` — the sign of the duration. */
  sign(): -1 | 0 | 1 {
    const ms = this.asMilliseconds();
    return ms < 0 ? -1 : ms > 0 ? 1 : 0;
  }

  /** The absolute value of this duration. */
  abs(): Duration {
    return new Duration(
      Math.abs(this.#months),
      Math.abs(this.#days),
      Math.abs(this.#milliseconds),
      this.#locale,
    );
  }

  /** Returns a new duration with `other` added. */
  add(other: Duration | DurationInput): Duration {
    const d = other instanceof Duration ? other : duration(other);
    return new Duration(
      this.#months + d.#months,
      this.#days + d.#days,
      this.#milliseconds + d.#milliseconds,
      this.#locale,
    );
  }

  /** Returns a new duration with `other` subtracted. */
  subtract(other: Duration | DurationInput): Duration {
    const d = other instanceof Duration ? other : duration(other);
    return new Duration(
      this.#months - d.#months,
      this.#days - d.#days,
      this.#milliseconds - d.#milliseconds,
      this.#locale,
    );
  }

  /**
   * A humanized phrase for this duration in its locale — e.g. `"۲ ماه"`. Pass
   * `withSuffix = true` for a relative phrase (`"در ۲ ماه"` / `"۲ ماه پیش"`).
   */
  humanize(withSuffix = false): string {
    return humanizeRelative(this.asMilliseconds(), this.#locale, !withSuffix);
  }

  /** The ISO-8601 duration string, e.g. `"P1Y2M10DT2H30M"`. */
  toISOString(): string {
    if (this.asMilliseconds() === 0) return 'P0D';
    const o = this.abs().toObject();
    const sign = this.sign() < 0 ? '-' : '';
    const seconds = o.seconds + o.milliseconds / MS_PER_SECOND;
    const date =
      (o.years ? `${o.years}Y` : '') +
      (o.months ? `${o.months}M` : '') +
      (o.days ? `${o.days}D` : '');
    const time =
      (o.hours ? `${o.hours}H` : '') +
      (o.minutes ? `${o.minutes}M` : '') +
      (seconds ? `${seconds}S` : '');
    return `${sign}P${date}${time ? `T${time}` : ''}`;
  }

  /** Returns the same duration bound to a different locale (for {@link humanize}). */
  withLocale(locale: LocaleLike): Duration {
    return new Duration(this.#months, this.#days, this.#milliseconds, resolveLocale(locale));
  }

  /** An identical copy. */
  clone(): Duration {
    return new Duration(this.#months, this.#days, this.#milliseconds, this.#locale);
  }

  /** Total milliseconds — enables numeric coercion and comparison. */
  valueOf(): number {
    return this.asMilliseconds();
  }

  toString(): string {
    return this.toISOString();
  }
}

/**
 * Creates a {@link Duration}.
 *
 * @example
 * ```ts
 * duration(1500);                       // 1.5 seconds
 * duration(2, 'hour');                  // 2 hours
 * duration({ months: 1, days: 10 });    // 1 month and 10 days
 * ```
 */
export function duration(
  input: number | DurationInput,
  unit: DurationUnit = 'millisecond',
  locale?: LocaleLike,
): Duration {
  const resolved = resolveLocale(locale);

  if (typeof input === 'number') {
    const fields: DurationInput = {};
    switch (unit) {
      case 'year':
        fields.years = input;
        break;
      case 'quarter':
        fields.quarters = input;
        break;
      case 'month':
        fields.months = input;
        break;
      case 'week':
        fields.weeks = input;
        break;
      case 'day':
        fields.days = input;
        break;
      case 'hour':
        fields.hours = input;
        break;
      case 'minute':
        fields.minutes = input;
        break;
      case 'second':
        fields.seconds = input;
        break;
      case 'millisecond':
        fields.milliseconds = input;
        break;
    }
    return fromInput(fields, resolved);
  }

  return fromInput(input, resolved);
}

function fromInput(input: DurationInput, locale: Locale): Duration {
  const months = (input.years ?? 0) * 12 + (input.quarters ?? 0) * 3 + (input.months ?? 0);
  const days = (input.weeks ?? 0) * 7 + (input.days ?? 0);
  const milliseconds =
    (input.hours ?? 0) * MS_PER_HOUR +
    (input.minutes ?? 0) * MS_PER_MINUTE +
    (input.seconds ?? 0) * MS_PER_SECOND +
    (input.milliseconds ?? 0);
  return new Duration(months, days, milliseconds, locale);
}
