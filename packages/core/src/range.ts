import { DoranDate } from './doran-date';
import type { Duration } from './duration';
import type { DateUnit } from './types';

/** Options for {@link DoranRange.contains}. */
export interface ContainsOptions {
  /** Treat the start as exclusive. */ excludeStart?: boolean;
  /** Treat the end as exclusive. */ excludeEnd?: boolean;
}

/** Options for {@link DoranRange.by}. */
export interface ByOptions {
  /** Step size in `unit`s (default `1`). */ step?: number;
  /** Omit the end if it lands exactly on a step. */ excludeEnd?: boolean;
}

/**
 * An immutable, half-open-aware interval between two {@link DoranDate}s. Endpoints are
 * normalized so `start` is never after `end`.
 *
 * @example
 * ```ts
 * const r = new DoranRange(a, b);
 * r.contains(c);
 * [...r.by('day')];          // every day from a to b
 * r.overlaps(other);
 * r.asDuration().humanize(); // "۳ روز"
 * ```
 */
export class DoranRange {
  readonly start: DoranDate;
  readonly end: DoranDate;

  constructor(start: DoranDate, end: DoranDate) {
    if (start.isAfter(end)) {
      this.start = end;
      this.end = start;
    } else {
      this.start = start;
      this.end = end;
    }
  }

  /** Length of the range in `unit`s (fractional when `float` is true). */
  duration(unit: DateUnit = 'millisecond', float = false): number {
    return this.end.diff(this.start, unit, float);
  }

  /** Length of the range as a {@link Duration}. */
  asDuration(): Duration {
    return this.end.diffDuration(this.start);
  }

  /** `true` if `date` falls within the range (endpoints inclusive by default). */
  contains(date: DoranDate, options: ContainsOptions = {}): boolean {
    const afterStart = options.excludeStart
      ? date.isAfter(this.start)
      : date.isSameOrAfter(this.start);
    const beforeEnd = options.excludeEnd ? date.isBefore(this.end) : date.isSameOrBefore(this.end);
    return afterStart && beforeEnd;
  }

  /** `true` if this range and `other` share any instant. */
  overlaps(other: DoranRange, options: { adjacent?: boolean } = {}): boolean {
    const startsBeforeOtherEnds = options.adjacent
      ? this.start.isSameOrBefore(other.end)
      : this.start.isBefore(other.end);
    const endsAfterOtherStarts = options.adjacent
      ? this.end.isSameOrAfter(other.start)
      : this.end.isAfter(other.start);
    return startsBeforeOtherEnds && endsAfterOtherStarts;
  }

  /** The overlapping range shared with `other`, or `null` if they are disjoint. */
  intersect(other: DoranRange): DoranRange | null {
    const start = DoranDate.max(this.start, other.start);
    const end = DoranDate.min(this.end, other.end);
    return start.isSameOrBefore(end) ? new DoranRange(start, end) : null;
  }

  /** `true` if both endpoints are the same instant as `other`'s. */
  isEqual(other: DoranRange): boolean {
    return this.start.isSame(other.start) && this.end.isSame(other.end);
  }

  /**
   * Yields each step from `start` toward `end` in increments of `unit`.
   *
   * @example
   * ```ts
   * [...range.by('day')];
   * [...range.by('hour', { step: 6 })];
   * ```
   */
  *by(unit: DateUnit, options: ByOptions = {}): IterableIterator<DoranDate> {
    const step = options.step ?? 1;
    if (step <= 0) throw new RangeError('DoranRange.by step must be a positive number.');
    let current = this.start;
    while (current.isSameOrBefore(this.end)) {
      if (options.excludeEnd && current.isSame(this.end)) break;
      yield current;
      current = current.add(step, unit);
    }
  }

  /** Materializes {@link by} into an array. */
  toArray(unit: DateUnit, options: ByOptions = {}): DoranDate[] {
    return [...this.by(unit, options)];
  }

  /** Iterates the range one day at a time. */
  [Symbol.iterator](): IterableIterator<DoranDate> {
    return this.by('day');
  }

  /** An identical copy. */
  clone(): DoranRange {
    return new DoranRange(this.start, this.end);
  }

  /** ISO-8601 interval string, `"<start>/<end>"`. */
  toString(): string {
    return `${this.start.toISOString()}/${this.end.toISOString()}`;
  }
}
