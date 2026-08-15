/**
 * `@doranjs/zod` — a framework-agnostic {@link https://zod.dev | zod} schema that
 * validates and coerces date input to a {@link DoranDate}.
 *
 * Accepts an ISO-8601 string, a `number` epoch (ms), a native `Date`, or an
 * existing `DoranDate`, and outputs a `DoranDate`. Strings and `Date`s are read
 * as Gregorian instants (the "one instant, two calendars" model), so they round
 * -trip with `DoranDate#toISOString()` / `JSON.stringify`.
 *
 * @packageDocumentation
 */
import { DoranDate, isDoranDate } from '@doranjs/core';
import { z } from 'zod';

/** Anything {@link zDoranDate} knows how to coerce into a `DoranDate`. */
export type DoranDateInput = string | number | Date | DoranDate;

/** Options for {@link zDoranDate}. Bounds accept any {@link DoranDateInput}. */
export interface ZDoranDateOptions {
  /** Reject instants strictly before this bound (inclusive lower bound). */
  min?: DoranDateInput;
  /** Reject instants strictly after this bound (inclusive upper bound). */
  max?: DoranDateInput;
}

/**
 * Coerce arbitrary date-ish input to a `DoranDate`, or `null` when it cannot be
 * represented (invalid string, non-finite number, invalid `Date`, wrong type).
 */
export function toDoranDate(value: unknown): DoranDate | null {
  // Not `instanceof`: a DoranDate built by another installed copy of @doranjs/core
  // would fail that check and fall through to the string branch, silently rejecting a
  // perfectly valid date.
  if (isDoranDate(value)) return value;
  if (value instanceof Date) return DoranDate.tryFromGregorian(value);
  if (typeof value === 'number') {
    return Number.isFinite(value) ? DoranDate.fromEpochMs(value) : null;
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed === '') return null;
    const date = new Date(trimmed);
    return Number.isNaN(date.getTime()) ? null : DoranDate.fromGregorian(date);
  }
  return null;
}

/**
 * A zod schema whose input is a {@link DoranDateInput} and whose output is a
 * `DoranDate`. Pass `min` / `max` to bound the accepted instant range.
 *
 * @example
 * ```ts
 * const schema = zDoranDate({ min: '2024-01-01' });
 * schema.parse('2024-06-28');        // → DoranDate
 * schema.parse(new Date());          // → DoranDate
 * schema.parse('not a date');        // throws ZodError
 * ```
 */
export function zDoranDate(options: ZDoranDateOptions = {}) {
  const min = options.min === undefined ? undefined : toDoranDate(options.min);
  const max = options.max === undefined ? undefined : toDoranDate(options.max);

  return z.custom<DoranDateInput>().transform((value, ctx): DoranDate => {
    const date = toDoranDate(value);
    if (!date) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Invalid date' });
      return z.NEVER;
    }
    if (min && date.epochMs < min.epochMs) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Date must be on or after ${min.toISOString()}`,
      });
      return z.NEVER;
    }
    if (max && date.epochMs > max.epochMs) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Date must be on or before ${max.toISOString()}`,
      });
      return z.NEVER;
    }
    return date;
  });
}
