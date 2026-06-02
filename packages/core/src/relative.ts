import type { Locale, RelativeTimeStrings } from './types';

/** Fallback relative-time strings (English) when a locale omits its own. */
const DEFAULT_RELATIVE: RelativeTimeStrings = {
  future: 'in %s',
  past: '%s ago',
  s: 'a few seconds',
  ss: '%d seconds',
  m: 'a minute',
  mm: '%d minutes',
  h: 'an hour',
  hh: '%d hours',
  d: 'a day',
  dd: '%d days',
  M: 'a month',
  MM: '%d months',
  y: 'a year',
  yy: '%d years',
};

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/**
 * Renders a humanized relative-time phrase for a signed millisecond delta, using the
 * same thresholds as Moment.js. `deltaMs > 0` means the future. When `withoutSuffix`
 * is true, the bare phrase (e.g. "3 days") is returned without "ago"/"in".
 */
export function humanizeRelative(deltaMs: number, locale: Locale, withoutSuffix = false): string {
  const rt = locale.relativeTime ?? DEFAULT_RELATIVE;
  const future = deltaMs > 0;
  const abs = Math.abs(deltaMs);

  const seconds = abs / SECOND;
  const minutes = abs / MINUTE;
  const hours = abs / HOUR;
  const days = abs / DAY;
  const months = days / 30;
  const years = days / 365;

  let key: keyof RelativeTimeStrings;
  let count = 0;

  if (seconds < 45) key = 's';
  else if (seconds < 90) key = 'm';
  else if (minutes < 45) {
    key = 'mm';
    count = Math.round(minutes);
  } else if (minutes < 90) key = 'h';
  else if (hours < 22) {
    key = 'hh';
    count = Math.round(hours);
  } else if (hours < 36) key = 'd';
  else if (days < 26) {
    key = 'dd';
    count = Math.round(days);
  } else if (days < 46) key = 'M';
  else if (days < 320) {
    key = 'MM';
    count = Math.round(months);
  } else if (days < 548) key = 'y';
  else {
    key = 'yy';
    count = Math.round(years);
  }

  const template = rt[key];
  const phrase = template.replace('%d', locale.formatNumber(String(count)));

  if (withoutSuffix) return phrase;
  return (future ? rt.future : rt.past).replace('%s', phrase);
}
