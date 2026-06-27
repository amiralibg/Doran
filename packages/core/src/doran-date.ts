import {
  gregorianToJalali,
  gregorianWeekday,
  isLeapJalaliYear,
  isValidGregorianDate,
  isValidJalaliDate,
  jalaliMonthLength,
  jalaliToGregorian,
  jalaliToJdn,
  jdnToJalali,
} from './conversion';
import { Duration } from './duration';
import { formatParts, GREGORIAN_LOCALE, type DigitStyle, type FormatContext } from './format';
import { resolveLocale } from './locale';
import { humanizeRelative } from './relative';
import {
  getSystemTimeZone,
  getTimeZoneOffsetMs,
  instantToWallClock,
  wallClockToInstant,
} from './timezone';
import type {
  DateUnit,
  DiffUnit,
  DoranDateOptions,
  DoranDateParts,
  Inclusivity,
  Locale,
  LocaleLike,
  Weekday,
} from './types';

/** A single settable Jalali/clock field. */
export type SettableUnit = 'year' | 'month' | 'day' | 'hour' | 'minute' | 'second' | 'millisecond';

/** Object form accepted by {@link DoranDate.fromJalali}. */
export interface JalaliInput {
  year: number;
  month: number;
  day: number;
  hour?: number;
  minute?: number;
  second?: number;
  millisecond?: number;
}

/** Object form accepted by {@link DoranDate.fromGregorianParts} (month is 1–12). */
export interface GregorianInput {
  year: number;
  month: number;
  day: number;
  hour?: number;
  minute?: number;
  second?: number;
  millisecond?: number;
}

const MS_PER_SECOND = 1000;
const MS_PER_MINUTE = 60 * MS_PER_SECOND;
const MS_PER_HOUR = 60 * MS_PER_MINUTE;
const MS_PER_DAY = 24 * MS_PER_HOUR;

interface ResolvedConfig {
  timeZone: string;
  locale: Locale;
}

function resolveConfig(options?: DoranDateOptions): ResolvedConfig {
  return {
    timeZone: options?.timeZone ?? getSystemTimeZone(),
    locale: resolveLocale(options?.locale),
  };
}

/** A fixed instant accepted by {@link DoranDate.setNow} / {@link freeze}. */
export type NowInput = number | Date | DoranDate;
/** A clock source: a fixed instant, or a function re-evaluated on every `now` read. */
export type NowSource = NowInput | (() => NowInput);

/** The injected clock, or `null` to use the real `Date.now()`. Module-private. */
let nowSource: NowSource | null = null;

function nowInputToMs(value: NowInput): number {
  if (typeof value === 'number') return value;
  if (value instanceof Date) return value.getTime();
  return value.epochMs; // DoranDate
}

function currentEpochMs(): number {
  if (nowSource === null) return Date.now();
  return nowInputToMs(typeof nowSource === 'function' ? nowSource() : nowSource);
}

/**
 * An immutable Solar Hijri (Persian / Jalali) date-time.
 *
 * A `DoranDate` represents a single absolute instant together with an IANA time
 * zone and a formatting locale. Every method that "changes" the date returns a new
 * instance — the original is never mutated.
 *
 * @example
 * ```ts
 * const today = DoranDate.now();
 * today.addDays(10).format('YYYY/MM/DD');
 * today.toGregorian(); // native Date
 * DoranDate.fromGregorian(new Date());
 * ```
 */
export class DoranDate {
  readonly #epochMs: number;
  readonly #timeZone: string;
  readonly #locale: Locale;
  #parts?: DoranDateParts;
  #weekday?: Weekday;

  private constructor(epochMs: number, timeZone: string, locale: Locale) {
    this.#epochMs = epochMs;
    this.#timeZone = timeZone;
    this.#locale = locale;
  }

  // ---------------------------------------------------------------------------
  // Factories
  // ---------------------------------------------------------------------------

  /**
   * The current instant. Reads the injected clock when one is set via
   * {@link setNow} / {@link freeze}, otherwise the real `Date.now()`. Every
   * `now`-dependent API (`today`, `isToday`, `fromNow`, …) routes through here.
   */
  static now(options?: DoranDateOptions): DoranDate {
    const { timeZone, locale } = resolveConfig(options);
    return new DoranDate(currentEpochMs(), timeZone, locale);
  }

  /**
   * Overrides what {@link now} returns — for deterministic tests, without
   * monkey-patching the global `Date`. Pass a fixed instant to freeze the clock,
   * or a function (re-evaluated each read) for a controllable clock.
   *
   * @example
   * ```ts
   * DoranDate.setNow(DoranDate.fromJalali(1405, 1, 1)); // frozen
   * DoranDate.setNow(() => Date.now() + 3600_000);      // always +1h
   * DoranDate.resetNow();                                // back to real time
   * ```
   */
  static setNow(source: NowSource): void {
    nowSource = source;
  }

  /** Restores {@link now} to the real `Date.now()`. */
  static resetNow(): void {
    nowSource = null;
  }

  /** Builds a date from epoch milliseconds (UTC). Throws `RangeError` on `NaN`/non-finite input. */
  static fromEpochMs(epochMs: number, options?: DoranDateOptions): DoranDate {
    if (!Number.isFinite(epochMs)) {
      throw new RangeError(`Cannot construct a DoranDate from a non-finite epoch: ${epochMs}.`);
    }
    const { timeZone, locale } = resolveConfig(options);
    return new DoranDate(epochMs, timeZone, locale);
  }

  /** Builds a date from a native JavaScript `Date` (interpreted as an instant). Throws on an invalid `Date`. */
  static fromGregorian(date: Date, options?: DoranDateOptions): DoranDate {
    const ms = date.getTime();
    if (Number.isNaN(ms)) {
      throw new RangeError('Cannot construct a DoranDate from an invalid Date.');
    }
    const { timeZone, locale } = resolveConfig(options);
    return new DoranDate(ms, timeZone, locale);
  }

  /** Like {@link fromGregorian}, but returns `null` instead of throwing on an invalid `Date`. */
  static tryFromGregorian(date: Date, options?: DoranDateOptions): DoranDate | null {
    return Number.isNaN(date.getTime()) ? null : DoranDate.fromGregorian(date, options);
  }

  /**
   * Builds a date from Jalali civil fields, interpreted in the target time zone.
   *
   * Throws `RangeError` on a non-existent date (e.g. Esfand 31 in a non-leap year)
   * or non-finite fields — it never silently rolls over into the next month. Use
   * {@link tryFromJalali} for a non-throwing variant.
   */
  static fromJalali(
    year: number,
    month: number,
    day: number,
    options?: DoranDateOptions,
  ): DoranDate;
  static fromJalali(input: JalaliInput, options?: DoranDateOptions): DoranDate;
  static fromJalali(
    yearOrInput: number | JalaliInput,
    monthOrOptions?: number | DoranDateOptions,
    dayArg?: number,
    optionsArg?: DoranDateOptions,
  ): DoranDate {
    let input: JalaliInput;
    let options: DoranDateOptions | undefined;

    if (typeof yearOrInput === 'object') {
      input = yearOrInput;
      options = monthOrOptions as DoranDateOptions | undefined;
    } else {
      input = {
        year: yearOrInput,
        month: monthOrOptions as number,
        day: dayArg as number,
      };
      options = optionsArg;
    }

    if (!DoranDate.#isValidInput(input)) {
      throw new RangeError(
        `Invalid Jalali date: ${input.year}/${input.month}/${input.day}. ` +
          `Use DoranDate.tryFromJalali for a non-throwing variant.`,
      );
    }

    const { timeZone, locale } = resolveConfig(options);
    const epochMs = DoranDate.#jalaliToInstant(input, timeZone);
    return new DoranDate(epochMs, timeZone, locale);
  }

  /** Like {@link fromJalali}, but returns `null` instead of throwing on an invalid date. */
  static tryFromJalali(
    year: number,
    month: number,
    day: number,
    options?: DoranDateOptions,
  ): DoranDate | null;
  static tryFromJalali(input: JalaliInput, options?: DoranDateOptions): DoranDate | null;
  static tryFromJalali(
    yearOrInput: number | JalaliInput,
    monthOrOptions?: number | DoranDateOptions,
    dayArg?: number,
    optionsArg?: DoranDateOptions,
  ): DoranDate | null {
    try {
      // Forward the same overloaded arguments unchanged.
      return DoranDate.fromJalali(
        yearOrInput as number,
        monthOrOptions as number,
        dayArg as number,
        optionsArg,
      );
    } catch {
      return null;
    }
  }

  /** Validates Jalali civil fields: real calendar date plus finite time components. */
  static #isValidInput(input: JalaliInput): boolean {
    const timeFinite = [input.hour, input.minute, input.second, input.millisecond].every(
      (value) => value === undefined || Number.isFinite(value),
    );
    return timeFinite && isValidJalaliDate(input.year, input.month, input.day);
  }

  /**
   * Builds a date from Gregorian civil fields (month 1–12), interpreted in the
   * target time zone — the Gregorian counterpart to {@link fromJalali}. Throws
   * `RangeError` on a non-existent date (e.g. Feb 30) or non-finite fields. Use
   * {@link tryFromGregorianParts} for a non-throwing variant.
   */
  static fromGregorianParts(input: GregorianInput, options?: DoranDateOptions): DoranDate {
    if (!DoranDate.#isValidGregorianInput(input)) {
      throw new RangeError(
        `Invalid Gregorian date: ${input.year}/${input.month}/${input.day}. ` +
          `Use DoranDate.tryFromGregorianParts for a non-throwing variant.`,
      );
    }
    const { timeZone, locale } = resolveConfig(options);
    const epochMs = wallClockToInstant(
      {
        year: input.year,
        month: input.month,
        day: input.day,
        hour: input.hour ?? 0,
        minute: input.minute ?? 0,
        second: input.second ?? 0,
        millisecond: input.millisecond ?? 0,
      },
      timeZone,
    );
    return new DoranDate(epochMs, timeZone, locale);
  }

  /** Like {@link fromGregorianParts}, but returns `null` instead of throwing on an invalid date. */
  static tryFromGregorianParts(
    input: GregorianInput,
    options?: DoranDateOptions,
  ): DoranDate | null {
    try {
      return DoranDate.fromGregorianParts(input, options);
    } catch {
      return null;
    }
  }

  /** Validates Gregorian civil fields: real calendar date plus finite time components. */
  static #isValidGregorianInput(input: GregorianInput): boolean {
    const timeFinite = [input.hour, input.minute, input.second, input.millisecond].every(
      (value) => value === undefined || Number.isFinite(value),
    );
    return timeFinite && isValidGregorianDate(input.year, input.month, input.day);
  }

  /** The earliest of the given dates. Throws if none are provided. */
  static min(...dates: DoranDate[]): DoranDate {
    if (dates.length === 0) throw new RangeError('DoranDate.min requires at least one date.');
    return dates.reduce((a, b) => (b.#epochMs < a.#epochMs ? b : a));
  }

  /** The latest of the given dates. Throws if none are provided. */
  static max(...dates: DoranDate[]): DoranDate {
    if (dates.length === 0) throw new RangeError('DoranDate.max requires at least one date.');
    return dates.reduce((a, b) => (b.#epochMs > a.#epochMs ? b : a));
  }

  /** `true` if the given Jalali year/month/day is a real calendar date. */
  static isValid(year: number, month: number, day: number): boolean {
    return isValidJalaliDate(year, month, day);
  }

  static #jalaliToInstant(input: JalaliInput, timeZone: string): number {
    const greg = jalaliToGregorian(input.year, input.month, input.day);
    return wallClockToInstant(
      {
        year: greg.year,
        month: greg.month,
        day: greg.day,
        hour: input.hour ?? 0,
        minute: input.minute ?? 0,
        second: input.second ?? 0,
        millisecond: input.millisecond ?? 0,
      },
      timeZone,
    );
  }

  // ---------------------------------------------------------------------------
  // Field access
  // ---------------------------------------------------------------------------

  #computeParts(): DoranDateParts {
    if (!this.#parts) {
      const wall = instantToWallClock(this.#epochMs, this.#timeZone);
      const jalali = gregorianToJalali(wall.year, wall.month, wall.day);
      this.#parts = {
        year: jalali.year,
        month: jalali.month,
        day: jalali.day,
        hour: wall.hour,
        minute: wall.minute,
        second: wall.second,
        millisecond: wall.millisecond,
      };
      this.#weekday = gregorianWeekday(wall.year, wall.month, wall.day) as Weekday;
    }
    return this.#parts;
  }

  /** Jalali year. */
  get year(): number {
    return this.#computeParts().year;
  }

  /** Jalali month, 1 (Farvardin) – 12 (Esfand). */
  get month(): number {
    return this.#computeParts().month;
  }

  /** Day of month. */
  get day(): number {
    return this.#computeParts().day;
  }

  /** Hour, 0–23. */
  get hour(): number {
    return this.#computeParts().hour;
  }

  /** Minute, 0–59. */
  get minute(): number {
    return this.#computeParts().minute;
  }

  /** Second, 0–59. */
  get second(): number {
    return this.#computeParts().second;
  }

  /** Millisecond, 0–999. */
  get millisecond(): number {
    return this.#computeParts().millisecond;
  }

  /** Day of week, `0 = Saturday … 6 = Friday`. */
  get dayOfWeek(): Weekday {
    this.#computeParts();
    return this.#weekday!;
  }

  /** Quarter of the Jalali year, 1–4. */
  get quarter(): 1 | 2 | 3 | 4 {
    return (Math.floor((this.month - 1) / 3) + 1) as 1 | 2 | 3 | 4;
  }

  /** 1-based day of the Jalali year. */
  get dayOfYear(): number {
    const { year, month, day } = this.#computeParts();
    return jalaliToJdn(year, month, day) - jalaliToJdn(year, 1, 1) + 1;
  }

  /** ISO-style week of the Jalali year (weeks begin on Saturday). */
  get weekOfYear(): number {
    const firstDay = jalaliToGregorian(this.year, 1, 1);
    const firstDow = gregorianWeekday(firstDay.year, firstDay.month, firstDay.day);
    return Math.floor((this.dayOfYear - 1 + firstDow) / 7) + 1;
  }

  /** Number of days in the current Jalali month. */
  get daysInMonth(): number {
    return jalaliMonthLength(this.year, this.month);
  }

  /** Number of days in the current Jalali year (365, or 366 in a leap year). */
  get daysInYear(): number {
    return isLeapJalaliYear(this.year) ? 366 : 365;
  }

  /** The IANA time zone this date is expressed in. */
  get timeZone(): string {
    return this.#timeZone;
  }

  /** The locale used for formatting. */
  get locale(): Locale {
    return this.#locale;
  }

  /** Epoch milliseconds (UTC) of this instant. */
  get epochMs(): number {
    return this.#epochMs;
  }

  /** UTC offset of this date's time zone, in minutes (east-positive). */
  get utcOffset(): number {
    return getTimeZoneOffsetMs(this.#epochMs, this.#timeZone) / MS_PER_MINUTE;
  }

  /** `true` if the current Jalali year is a leap year. */
  isLeapYear(): boolean {
    return isLeapJalaliYear(this.year);
  }

  // ---------------------------------------------------------------------------
  // Arithmetic (immutable)
  // ---------------------------------------------------------------------------

  #withInstant(epochMs: number): DoranDate {
    return new DoranDate(epochMs, this.#timeZone, this.#locale);
  }

  /** Rebuilds this date from Jalali fields, clamping the day to the month length. */
  #withJalali(year: number, month: number, day: number): DoranDate {
    const maxDay = jalaliMonthLength(year, month);
    const clamped = Math.min(day, maxDay);
    const parts = this.#computeParts();
    const epochMs = DoranDate.#jalaliToInstant(
      {
        year,
        month,
        day: clamped,
        hour: parts.hour,
        minute: parts.minute,
        second: parts.second,
        millisecond: parts.millisecond,
      },
      this.#timeZone,
    );
    return this.#withInstant(epochMs);
  }

  addMilliseconds(amount: number): DoranDate {
    return this.#withInstant(this.#epochMs + amount);
  }

  addSeconds(amount: number): DoranDate {
    return this.addMilliseconds(amount * MS_PER_SECOND);
  }

  addMinutes(amount: number): DoranDate {
    return this.addMilliseconds(amount * MS_PER_MINUTE);
  }

  addHours(amount: number): DoranDate {
    return this.addMilliseconds(amount * MS_PER_HOUR);
  }

  /** Adds calendar days, preserving the wall-clock time of day across DST shifts. */
  addDays(amount: number): DoranDate {
    const { year, month, day } = this.#computeParts();
    const next = jdnToJalali(jalaliToJdn(year, month, day) + amount);
    return this.#withJalali(next.year, next.month, next.day);
  }

  addWeeks(amount: number): DoranDate {
    return this.addDays(amount * 7);
  }

  /** Adds calendar months, clamping the day to the resulting month's length. */
  addMonths(amount: number): DoranDate {
    const { year, month, day } = this.#computeParts();
    const total = year * 12 + (month - 1) + amount;
    const nextYear = Math.floor(total / 12);
    const nextMonth = (((total % 12) + 12) % 12) + 1;
    return this.#withJalali(nextYear, nextMonth, day);
  }

  /** Adds calendar years, clamping Esfand 30 to 29 in non-leap years. */
  addYears(amount: number): DoranDate {
    const { year, month, day } = this.#computeParts();
    return this.#withJalali(year + amount, month, day);
  }

  /** Generic addition by {@link DateUnit}. */
  add(amount: number, unit: DateUnit): DoranDate {
    switch (unit) {
      case 'millisecond':
        return this.addMilliseconds(amount);
      case 'second':
        return this.addSeconds(amount);
      case 'minute':
        return this.addMinutes(amount);
      case 'hour':
        return this.addHours(amount);
      case 'day':
        return this.addDays(amount);
      case 'week':
        return this.addWeeks(amount);
      case 'month':
        return this.addMonths(amount);
      case 'quarter':
        return this.addMonths(amount * 3);
      case 'year':
        return this.addYears(amount);
    }
  }

  /** Generic subtraction by {@link DateUnit}. */
  subtract(amount: number, unit: DateUnit): DoranDate {
    return this.add(-amount, unit);
  }

  // ---------------------------------------------------------------------------
  // Setters (immutable)
  // ---------------------------------------------------------------------------

  /**
   * Returns a copy with one or more Jalali/clock fields replaced. The day of month is
   * clamped to the resulting month's length (e.g. setting month to Esfand from the
   * 31st yields the 29th/30th).
   *
   * @example
   * ```ts
   * date.with({ year: 1406, month: 1, day: 1 });
   * ```
   */
  with(parts: Partial<DoranDateParts>): DoranDate {
    const p = this.#computeParts();
    const year = parts.year ?? p.year;
    const month = parts.month ?? p.month;
    const day = Math.min(parts.day ?? p.day, jalaliMonthLength(year, month));
    const epochMs = DoranDate.#jalaliToInstant(
      {
        year,
        month,
        day,
        hour: parts.hour ?? p.hour,
        minute: parts.minute ?? p.minute,
        second: parts.second ?? p.second,
        millisecond: parts.millisecond ?? p.millisecond,
      },
      this.#timeZone,
    );
    return this.#withInstant(epochMs);
  }

  /** Returns a copy with a single field set. */
  set(unit: SettableUnit, value: number): DoranDate {
    return this.with({ [unit]: value });
  }

  /** Returns a copy with the Jalali year set. */
  withYear(year: number): DoranDate {
    return this.with({ year });
  }

  /** Returns a copy with the Jalali month (1–12) set. */
  withMonth(month: number): DoranDate {
    return this.with({ month });
  }

  /** Returns a copy with the day of month set. */
  withDay(day: number): DoranDate {
    return this.with({ day });
  }

  /** Returns a copy with the hour (0–23) set. */
  withHour(hour: number): DoranDate {
    return this.with({ hour });
  }

  /** Returns a copy with the minute set. */
  withMinute(minute: number): DoranDate {
    return this.with({ minute });
  }

  /** Returns a copy with the second set. */
  withSecond(second: number): DoranDate {
    return this.with({ second });
  }

  /** Returns a copy with the millisecond set. */
  withMillisecond(millisecond: number): DoranDate {
    return this.with({ millisecond });
  }

  // ---------------------------------------------------------------------------
  // Boundaries
  // ---------------------------------------------------------------------------

  /** Returns the start of the given unit (e.g. midnight for `'day'`). */
  startOf(unit: DateUnit): DoranDate {
    const p = this.#computeParts();
    switch (unit) {
      case 'year':
        return DoranDate.fromJalali({ year: p.year, month: 1, day: 1 }, this.#configOptions());
      case 'quarter': {
        const month = (this.quarter - 1) * 3 + 1;
        return DoranDate.fromJalali({ year: p.year, month, day: 1 }, this.#configOptions());
      }
      case 'month':
        return DoranDate.fromJalali(
          { year: p.year, month: p.month, day: 1 },
          this.#configOptions(),
        );
      case 'week': {
        return this.subtract(this.dayOfWeek, 'day').startOf('day');
      }
      case 'day':
        return this.#rebuildTime(0, 0, 0, 0);
      case 'hour':
        return this.#rebuildTime(p.hour, 0, 0, 0);
      case 'minute':
        return this.#rebuildTime(p.hour, p.minute, 0, 0);
      case 'second':
        return this.#rebuildTime(p.hour, p.minute, p.second, 0);
      case 'millisecond':
        return this;
    }
  }

  /** Returns the last representable instant within the given unit. */
  endOf(unit: DateUnit): DoranDate {
    if (unit === 'millisecond') return this;
    const nextUnit: Record<Exclude<DateUnit, 'millisecond'>, DateUnit> = {
      year: 'year',
      quarter: 'quarter',
      month: 'month',
      week: 'week',
      day: 'day',
      hour: 'hour',
      minute: 'minute',
      second: 'second',
    };
    return this.startOf(unit).add(1, nextUnit[unit]).addMilliseconds(-1);
  }

  #rebuildTime(hour: number, minute: number, second: number, millisecond: number): DoranDate {
    const p = this.#computeParts();
    const epochMs = DoranDate.#jalaliToInstant(
      { year: p.year, month: p.month, day: p.day, hour, minute, second, millisecond },
      this.#timeZone,
    );
    return this.#withInstant(epochMs);
  }

  #configOptions(): DoranDateOptions {
    return { timeZone: this.#timeZone, locale: this.#locale };
  }

  // ---------------------------------------------------------------------------
  // Comparison
  // ---------------------------------------------------------------------------

  /** Returns `-1`, `0`, or `1` comparing this instant to `other`. */
  compare(other: DoranDate): -1 | 0 | 1 {
    if (this.#epochMs < other.#epochMs) return -1;
    if (this.#epochMs > other.#epochMs) return 1;
    return 0;
  }

  isBefore(other: DoranDate): boolean {
    return this.#epochMs < other.#epochMs;
  }

  isAfter(other: DoranDate): boolean {
    return this.#epochMs > other.#epochMs;
  }

  /** Equality at the given granularity (defaults to the exact instant). */
  isSame(other: DoranDate, unit?: DateUnit): boolean {
    if (!unit) return this.#epochMs === other.#epochMs;
    return this.startOf(unit).#epochMs === other.startOf(unit).#epochMs;
  }

  isSameOrBefore(other: DoranDate): boolean {
    return this.#epochMs <= other.#epochMs;
  }

  isSameOrAfter(other: DoranDate): boolean {
    return this.#epochMs >= other.#epochMs;
  }

  /**
   * `true` if this date falls between `start` and `end`. `inclusivity` controls
   * whether each endpoint is included: `[` / `]` inclusive (default `'[]'`), `(` / `)`
   * exclusive.
   */
  isBetween(start: DoranDate, end: DoranDate, inclusivity: Inclusivity = '[]'): boolean {
    const afterStart =
      inclusivity[0] === '[' ? this.#epochMs >= start.#epochMs : this.#epochMs > start.#epochMs;
    const beforeEnd =
      inclusivity[1] === ']' ? this.#epochMs <= end.#epochMs : this.#epochMs < end.#epochMs;
    return afterStart && beforeEnd;
  }

  /** `true` if this date is the same calendar day as now (in its own time zone). */
  isToday(): boolean {
    return this.isSame(DoranDate.now({ timeZone: this.#timeZone }), 'day');
  }

  /** `true` if this date is the day after now (in its own time zone). */
  isTomorrow(): boolean {
    return this.isSame(DoranDate.now({ timeZone: this.#timeZone }).addDays(1), 'day');
  }

  /** `true` if this date is the day before now (in its own time zone). */
  isYesterday(): boolean {
    return this.isSame(DoranDate.now({ timeZone: this.#timeZone }).addDays(-1), 'day');
  }

  /**
   * Difference between this date and `other`, expressed in `unit`. The result is
   * positive when this date is later. By default it is truncated to an integer;
   * pass `float = true` for a fractional result. Pass `unit: 'duration'` to get a
   * {@link Duration} broken down into years/months/…/milliseconds instead.
   */
  diff(other: DoranDate, unit: 'duration'): Duration;
  diff(other: DoranDate, unit?: DiffUnit, float?: boolean): number;
  diff(
    other: DoranDate,
    unit: DiffUnit | 'duration' = 'millisecond',
    float = false,
  ): number | Duration {
    if (unit === 'duration') {
      return Duration.fromMillis(this.#epochMs - other.#epochMs);
    }
    if (unit === 'year' || unit === 'quarter' || unit === 'month') {
      const a = this.#computeParts();
      const b = other.#computeParts();
      let months = (a.year - b.year) * 12 + (a.month - b.month);
      const anchor = other.addMonths(months);
      if (anchor.isAfter(this) && months > 0) months -= 1;
      else if (anchor.isBefore(this) && months < 0) months += 1;
      const base = other.addMonths(months);
      const next = other.addMonths(months + (this.isSameOrAfter(other) ? 1 : -1));
      const remainder =
        (this.#epochMs - base.#epochMs) / Math.abs(next.#epochMs - base.#epochMs || 1);
      const value = months + (this.isSameOrAfter(other) ? remainder : -remainder);
      const result = unit === 'year' ? value / 12 : unit === 'quarter' ? value / 3 : value;
      return float ? result : Math.trunc(result);
    }

    const deltaMs = this.#epochMs - other.#epochMs;
    const divisor: Record<Exclude<DiffUnit, 'year' | 'quarter' | 'month'>, number> = {
      week: MS_PER_DAY * 7,
      day: MS_PER_DAY,
      hour: MS_PER_HOUR,
      minute: MS_PER_MINUTE,
      second: MS_PER_SECOND,
      millisecond: 1,
    };
    const value = deltaMs / divisor[unit];
    return float ? value : Math.trunc(value);
  }

  // ---------------------------------------------------------------------------
  // Reconfiguration (immutable)
  // ---------------------------------------------------------------------------

  /** Returns the same instant expressed in a different time zone. */
  withTimeZone(timeZone: string): DoranDate {
    return new DoranDate(this.#epochMs, timeZone, this.#locale);
  }

  /** Returns the same instant with a different formatting locale. */
  withLocale(locale: LocaleLike): DoranDate {
    return new DoranDate(this.#epochMs, this.#timeZone, resolveLocale(locale));
  }

  /** Returns an identical copy. */
  clone(): DoranDate {
    return new DoranDate(this.#epochMs, this.#timeZone, this.#locale);
  }

  // ---------------------------------------------------------------------------
  // Relative time
  // ---------------------------------------------------------------------------

  /**
   * A humanized relative phrase versus `other`, in this date's locale — e.g.
   * `"۳ روز پیش"` or `"در ۲ ساعت"`. Pass `withoutSuffix = true` for the bare duration
   * (`"۳ روز"`).
   */
  from(other: DoranDate, withoutSuffix = false): string {
    return humanizeRelative(this.#epochMs - other.#epochMs, this.#locale, withoutSuffix);
  }

  /** Relative phrase versus now — e.g. `"۳ روز پیش"`. */
  fromNow(withoutSuffix = false): string {
    return this.from(
      DoranDate.now({ timeZone: this.#timeZone, locale: this.#locale }),
      withoutSuffix,
    );
  }

  /** Relative phrase of `other` versus this date (the inverse of {@link from}). */
  to(other: DoranDate, withoutSuffix = false): string {
    return humanizeRelative(other.#epochMs - this.#epochMs, this.#locale, withoutSuffix);
  }

  /** Relative phrase of now versus this date — e.g. `"در ۳ روز"` for a past date. */
  toNow(withoutSuffix = false): string {
    return this.to(
      DoranDate.now({ timeZone: this.#timeZone, locale: this.#locale }),
      withoutSuffix,
    );
  }

  // ---------------------------------------------------------------------------
  // Conversion & serialization
  // ---------------------------------------------------------------------------

  /** Converts to a native JavaScript `Date` (the underlying instant). */
  toGregorian(): Date {
    return new Date(this.#epochMs);
  }

  /** Alias of {@link DoranDate.toGregorian}. */
  toDate(): Date {
    return this.toGregorian();
  }

  /** The Jalali civil fields as a plain object. */
  toObject(): DoranDateParts {
    return { ...this.#computeParts() };
  }

  /**
   * The Gregorian wall-clock fields for this instant in its time zone.
   * Useful when you need the Gregorian date without converting to a `Date` object.
   */
  toGregorianParts(): {
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
    second: number;
    millisecond: number;
  } {
    return { ...instantToWallClock(this.#epochMs, this.#timeZone) };
  }

  /** Epoch milliseconds (UTC). Alias of the `epochMs` getter, for dayjs/moment parity. */
  toMillis(): number {
    return this.#epochMs;
  }

  /** Unix timestamp in whole seconds (UTC). */
  unix(): number {
    return Math.floor(this.#epochMs / 1000);
  }

  /** Epoch milliseconds — also enables `<`, `>`, and arithmetic coercion. */
  valueOf(): number {
    return this.#epochMs;
  }

  /**
   * Standard Gregorian UTC ISO-8601 string, identical to `new Date(…).toISOString()`.
   * Safe to send to backends and to round-trip via `new Date(…)` or
   * `DoranDate.fromGregorian(new Date(…))`.
   *
   * For the Jalali ISO representation use {@link toJalaliISO}.
   */
  toISOString(): string {
    return new Date(this.#epochMs).toISOString();
  }

  /** Alias of {@link toISOString} — explicit Gregorian UTC ISO-8601. */
  toGregorianISO(): string {
    return new Date(this.#epochMs).toISOString();
  }

  /**
   * ISO-8601-like string in the **Jalali** calendar with the local UTC offset.
   * Example: `"1405-03-11T13:39:05.000+03:30"`.
   *
   * Use this when you need a Jalali-calendar ISO string for display; use
   * {@link toISOString} when communicating with backends or `JSON.stringify`.
   */
  toJalaliISO(): string {
    return this.format('YYYY-MM-DDTHH:mm:ss.SSSZ');
  }

  /**
   * Serializes as a Gregorian UTC ISO-8601 string for `JSON.stringify`, matching the
   * behaviour of native `Date`. This makes `JSON.stringify({ d: DoranDate.now() })`
   * safe to send to any backend without additional conversion.
   */
  toJSON(): string {
    return this.toISOString();
  }

  /** Default string form: `YYYY/MM/DD HH:mm:ss` (Jalali). */
  toString(): string {
    return this.format('YYYY/MM/DD HH:mm:ss');
  }

  /**
   * Formats the date using the token vocabulary documented on {@link formatParts}.
   * All tokens (`YYYY`, `MM`, `DD`, `dddd`, etc.) refer to **Jalali** fields.
   * @param pattern Token pattern, e.g. `"dddd D MMMM YYYY"`.
   * @param options `{ digits: 'latin' | 'persian' }` overrides the locale's digit
   *   style for this call only — month/weekday names still come from the locale.
   */
  format(pattern: string, options?: { digits?: DigitStyle }): string {
    const p = this.#computeParts();
    const ctx: FormatContext = {
      ...p,
      weekday: this.dayOfWeek,
      offsetMs: getTimeZoneOffsetMs(this.#epochMs, this.#timeZone),
    };
    return formatParts(ctx, pattern, this.#locale, options?.digits);
  }

  /**
   * Formats the date using **Gregorian** calendar fields with the same token
   * vocabulary as {@link format}. Names render in English and digits stay Latin
   * (ASCII), so the output is safe to send to a backend.
   *
   * @example
   * ```ts
   * date.formatGregorian('YYYY-MM-DD HH:mm') // "2026-05-31 10:09"
   * date.formatGregorian('DD MMM YYYY')      // "31 May 2026"
   * ```
   */
  formatGregorian(pattern: string): string {
    const g = instantToWallClock(this.#epochMs, this.#timeZone);
    const ctx: FormatContext = {
      ...g,
      weekday: this.dayOfWeek,
      offsetMs: getTimeZoneOffsetMs(this.#epochMs, this.#timeZone),
    };
    return formatParts(ctx, pattern, GREGORIAN_LOCALE);
  }
}

/**
 * Runs `fn` with {@link DoranDate.now} frozen at `instant`, then restores the
 * previous clock — even if `fn` throws. If `fn` returns a promise, the clock is
 * restored when it settles, so `await freeze(...)` works too. Nests safely.
 *
 * @example
 * ```ts
 * freeze(DoranDate.fromJalali(1405, 1, 1), () => {
 *   expect(DoranDate.now().format('YYYY/MM/DD')).toBe('۱۴۰۵/۰۱/۰۱');
 * });
 * ```
 */
export function freeze<T>(instant: NowInput, fn: () => T): T {
  const previous = nowSource;
  nowSource = instant;
  let result: T;
  try {
    result = fn();
  } catch (error) {
    nowSource = previous;
    throw error;
  }
  if (result != null && typeof (result as { then?: unknown }).then === 'function') {
    return (result as unknown as Promise<unknown>).finally(() => {
      nowSource = previous;
    }) as unknown as T;
  }
  nowSource = previous;
  return result;
}
