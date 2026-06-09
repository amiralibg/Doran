import { normalize } from './normalize';
import { NUMBER_PHRASE_PATTERN, parsePersianNumber } from './numbers';
import type { DurationResult, DurationUnit } from './types';

/** Unit keywords → canonical duration unit (extends the date units with time units). */
const DURATION_UNITS: Record<string, DurationUnit> = {
  دقیقه: 'minute',
  ساعت: 'hour',
  روز: 'day',
  هفته: 'week',
  ماه: 'month',
  سال: 'year',
};

const UNIT_ALT = Object.keys(DURATION_UNITS)
  .sort((a, b) => b.length - a.length)
  .join('|');

/**
 * Parses a Persian duration such as «دو هفته», «۳ روز», «نیم ساعت», or
 * «یک ساعت و نیم». The amount may be fractional (`و نیم` adds half a unit, a leading
 * `نیم` means half). Trailing words like «دیگه» are ignored, so «دو هفته دیگه» yields a
 * two-week duration.
 *
 * @example
 * ```ts
 * parseDuration('یک ساعت و نیم'); // → { amount: 1.5, unit: 'hour', … }
 * ```
 */
export function parseDuration(input: string): DurationResult | null {
  const text = normalize(input);

  const pattern = new RegExp(
    `(?:(${NUMBER_PHRASE_PATTERN}|\\d+(?:\\.\\d+)?)\\s+|(نیم)\\s+)?(${UNIT_ALT})(\\s+و\\s+نیم)?`,
  );
  const m = text.match(pattern);
  if (!m) return null;

  const unit = DURATION_UNITS[m[3]!]!;

  let amount: number;
  if (m[2]) {
    amount = 0.5; // leading «نیم» (half a unit)
  } else if (m[1]) {
    amount = /^\d+(?:\.\d+)?$/.test(m[1]) ? Number(m[1]) : (parsePersianNumber(m[1]) ?? 1);
  } else {
    amount = 1; // a bare unit means one (e.g. «هفته بعد» → one week)
  }
  if (m[4]) amount += 0.5; // trailing «و نیم»

  return { amount, unit, confidence: 0.9, matched: m[0]!.trim() };
}
