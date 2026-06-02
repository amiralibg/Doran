import type { DoranDate, DoranDateOptions } from '@doranjs/core';

/** The result of a successful natural-language parse. */
export interface ParseResult {
  /** The resolved date-time. */
  date: DoranDate;
  /** Confidence in the interpretation, between 0 and 1. */
  confidence: number;
  /** The portion of the (normalized) input that was understood. */
  matched: string;
}

/** Options accepted by {@link parse} and the {@link Parser}. */
export interface ParseOptions extends DoranDateOptions {
  /**
   * The "now" the expression is resolved against. Defaults to the current instant.
   * Useful for deterministic tests and for parsing relative to an arbitrary date.
   */
  reference?: DoranDate;
}

/** Shared context handed to every extractor. */
export interface NlpContext {
  /** The reference ("now") date. */
  reference: DoranDate;
  /** The normalized input text. */
  text: string;
  /** The original, unmodified input. */
  raw: string;
}

/** A resolved day component (no time-of-day applied yet). */
export interface DayMatch {
  /** The resolved calendar day, at the start of that day. */
  date: DoranDate;
  /** Confidence for this component, between 0 and 1. */
  confidence: number;
  /** The matched substring. */
  span: string;
}

/** A resolved time-of-day component. */
export interface TimeMatch {
  hour: number;
  minute: number;
  second: number;
  confidence: number;
  span: string;
}

/** Extracts a day component from the context, or returns `null` if it does not apply. */
export type DayExtractor = (ctx: NlpContext) => DayMatch | null;

/** Extracts a time-of-day component from the context, or `null` if it does not apply. */
export type TimeExtractor = (ctx: NlpContext) => TimeMatch | null;

/** A resolved date range (e.g. «از ۵ تا ۱۰ فروردین»). */
export interface RangeResult {
  /** The earlier endpoint. */
  start: DoranDate;
  /** The later endpoint. */
  end: DoranDate;
  /** Confidence in the interpretation, between 0 and 1. */
  confidence: number;
  /** The portion of the (normalized) input that was understood. */
  matched: string;
}

/** Units a duration can be expressed in. */
export type DurationUnit = 'minute' | 'hour' | 'day' | 'week' | 'month' | 'year';

/** A parsed length of time (e.g. «دو هفته», «یک ساعت و نیم»). */
export interface DurationResult {
  /** The quantity (may be fractional, e.g. `1.5` for «یک ساعت و نیم»). */
  amount: number;
  /** The unit the quantity is measured in. */
  unit: DurationUnit;
  confidence: number;
  matched: string;
}

/** How often a recurrence repeats. */
export type RecurrenceFreq = 'daily' | 'weekly' | 'monthly' | 'yearly';

/** A parsed recurrence rule (e.g. «هر دوشنبه», «هر دو هفته»). */
export interface RecurrenceResult {
  freq: RecurrenceFreq;
  /** How many `freq` periods between occurrences (`1` for «هر هفته», `2` for «هر دو هفته»). */
  interval: number;
  /** For weekly rules anchored to a weekday (0 = Saturday … 6 = Friday). */
  weekday?: number;
  confidence: number;
  matched: string;
}
