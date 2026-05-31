import type { DoranDate, DoranDateOptions } from '@doran/core';

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
