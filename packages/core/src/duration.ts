import { durationToHuman } from './relative';
import type { LocaleLike } from './types';

/** Plain-object form of a {@link Duration}; every field is optional and defaults to 0. */
export interface DurationLike {
  years?: number;
  months?: number;
  days?: number;
  hours?: number;
  minutes?: number;
  seconds?: number;
  milliseconds?: number;
}

/** Units accepted by {@link Duration.as}. */
export type DurationUnit =
  | 'year'
  | 'month'
  | 'week'
  | 'day'
  | 'hour'
  | 'minute'
  | 'second'
  | 'millisecond';

const MS_PER_SECOND = 1000;
const MS_PER_MINUTE = 60 * MS_PER_SECOND;
const MS_PER_HOUR = 60 * MS_PER_MINUTE;
const MS_PER_DAY = 24 * MS_PER_HOUR;

// ponytail: months/years have no fixed length, so as()/toMillis() use the same
// fixed averages moment/luxon use for un-anchored durations (30-day month,
// 365-day year). For exact calendar deltas, use DoranDate arithmetic instead.
const MS_PER_MONTH = 30 * MS_PER_DAY;
const MS_PER_YEAR = 365 * MS_PER_DAY;

const MS_PER_UNIT: Record<DurationUnit, number> = {
  year: MS_PER_YEAR,
  month: MS_PER_MONTH,
  week: 7 * MS_PER_DAY,
  day: MS_PER_DAY,
  hour: MS_PER_HOUR,
  minute: MS_PER_MINUTE,
  second: MS_PER_SECOND,
  millisecond: 1,
};

/**
 * A small immutable duration with field-wise arithmetic, unit conversion, and
 * humanization — moment.duration / luxon Duration parity. Tree-shakeable: import
 * it only where you need it.
 *
 * @example
 * ```ts
 * const d = new Duration({ hours: 1, minutes: 30 });
 * d.as('minute');   // 90
 * d.humanize();     // "an hour" / "یک ساعت"
 * d.add({ minutes: 30 }).as('hour'); // 2
 * ```
 */
export class Duration {
  readonly years: number;
  readonly months: number;
  readonly days: number;
  readonly hours: number;
  readonly minutes: number;
  readonly seconds: number;
  readonly milliseconds: number;

  constructor(input: DurationLike = {}) {
    this.years = input.years ?? 0;
    this.months = input.months ?? 0;
    this.days = input.days ?? 0;
    this.hours = input.hours ?? 0;
    this.minutes = input.minutes ?? 0;
    this.seconds = input.seconds ?? 0;
    this.milliseconds = input.milliseconds ?? 0;
  }

  /** Builds a duration from a plain object (or copies one). */
  static from(input: DurationLike | Duration): Duration {
    return new Duration(input instanceof Duration ? input.toObject() : input);
  }

  /** Decomposes a millisecond span into a duration, greedily from years down (sign preserved). */
  static fromMillis(ms: number): Duration {
    const sign = ms < 0 ? -1 : 1;
    let rest = Math.abs(ms);
    const take = (unit: number): number => {
      const n = Math.floor(rest / unit);
      rest -= n * unit;
      return n * sign;
    };
    return new Duration({
      years: take(MS_PER_YEAR),
      months: take(MS_PER_MONTH),
      days: take(MS_PER_DAY),
      hours: take(MS_PER_HOUR),
      minutes: take(MS_PER_MINUTE),
      seconds: take(MS_PER_SECOND),
      milliseconds: rest * sign,
    });
  }

  /** This duration's fields as a plain object. */
  toObject(): Required<DurationLike> {
    return {
      years: this.years,
      months: this.months,
      days: this.days,
      hours: this.hours,
      minutes: this.minutes,
      seconds: this.seconds,
      milliseconds: this.milliseconds,
    };
  }

  /** Total length in milliseconds (using the fixed month/year averages). */
  toMillis(): number {
    return (
      this.years * MS_PER_YEAR +
      this.months * MS_PER_MONTH +
      this.days * MS_PER_DAY +
      this.hours * MS_PER_HOUR +
      this.minutes * MS_PER_MINUTE +
      this.seconds * MS_PER_SECOND +
      this.milliseconds
    );
  }

  /** Total length in milliseconds — enables `<`/`>` comparison between durations. */
  valueOf(): number {
    return this.toMillis();
  }

  /** This duration expressed as a (possibly fractional) count of `unit`. */
  as(unit: DurationUnit): number {
    return this.toMillis() / MS_PER_UNIT[unit];
  }

  /** Field-wise sum with another duration. */
  add(other: DurationLike | Duration): Duration {
    const o = Duration.from(other);
    return new Duration({
      years: this.years + o.years,
      months: this.months + o.months,
      days: this.days + o.days,
      hours: this.hours + o.hours,
      minutes: this.minutes + o.minutes,
      seconds: this.seconds + o.seconds,
      milliseconds: this.milliseconds + o.milliseconds,
    });
  }

  /** Field-wise difference with another duration. */
  subtract(other: DurationLike | Duration): Duration {
    return this.add(Duration.from(other).negate());
  }

  /** A duration of the same magnitude with the opposite sign. */
  negate(): Duration {
    return new Duration({
      years: -this.years,
      months: -this.months,
      days: -this.days,
      hours: -this.hours,
      minutes: -this.minutes,
      seconds: -this.seconds,
      milliseconds: -this.milliseconds,
    });
  }

  /** Human phrase for this duration's magnitude, e.g. "2 hours" / "۲ ساعت". */
  humanize(locale?: LocaleLike): string {
    return durationToHuman(Math.abs(this.toMillis()) / MS_PER_SECOND, locale);
  }
}
