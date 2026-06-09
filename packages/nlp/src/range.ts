import { parse } from './engine';
import { normalize } from './normalize';
import { parsePersianNumber } from './numbers';
import type { ParseOptions, RangeResult } from './types';

/**
 * Splits a range expression into its two halves. Handles «از X تا Y», «X تا Y»,
 * «X الی Y», and «(ما)بین X و Y». The «بین … و …» form is tried first so its «و»
 * separator is not mistaken for part of an endpoint.
 */
const RANGE_PATTERNS: RegExp[] = [
  /^(?:ما\s?بین|بین)\s+(.+?)\s+(?:تا|الی|و)\s+(.+)$/,
  /^(?:از\s+)?(.+?)\s+(?:تا|الی)\s+(.+)$/,
];

/**
 * Parses a Persian date-range expression such as «از ۵ تا ۱۰ فروردین», «از فردا تا
 * جمعه», or «۱۵ خرداد تا ۲۰ خرداد». Each side is resolved with the full date parser; a
 * bare day number on the left (as in «۵ تا ۱۰ فروردین») borrows the month and year from
 * the right side. Endpoints are returned in chronological order.
 *
 * @example
 * ```ts
 * parseRange('از ۵ تا ۱۰ فروردین', { reference: DoranDate.fromJalali(1405, 1, 1) });
 * // → { start: 1405/01/05, end: 1405/01/10, … }
 * ```
 */
export function parseRange(input: string, options?: ParseOptions): RangeResult | null {
  const text = normalize(input);
  let m: RegExpMatchArray | null = null;
  for (const pattern of RANGE_PATTERNS) {
    m = text.match(pattern);
    if (m) break;
  }
  if (!m) return null;

  const leftRaw = m[1]!.trim();
  const rightRaw = m[2]!.trim();

  const right = parse(rightRaw, options);
  if (!right) return null;

  const leftParsed = parse(leftRaw, options);
  let leftDate = leftParsed?.date ?? null;
  let leftConfidence = leftParsed?.confidence ?? 0;

  if (!leftDate) {
    // A lone day number on the left borrows the month/year from the right endpoint.
    const day = parsePersianNumber(leftRaw);
    if (day !== null && day >= 1 && day <= 31) {
      leftDate = right.date.startOf('day').withDay(day);
      leftConfidence = 0.85;
    }
  }

  if (!leftDate) return null;

  let start = leftDate;
  let end = right.date;
  if (start.isAfter(end)) [start, end] = [end, start];

  return {
    start,
    end,
    confidence: Math.min(leftConfidence, right.confidence),
    matched: text,
  };
}
