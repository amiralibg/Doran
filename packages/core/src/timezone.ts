/**
 * Time-zone utilities built entirely on the standard `Intl` API, so `@doran/core`
 * stays dependency-free while still supporting any IANA time zone.
 *
 * The model: a `DoranDate` is an absolute instant (epoch milliseconds) plus an IANA
 * time zone. "Wall-clock" civil fields are derived by projecting the instant into
 * the zone; constructing from civil fields inverts that projection, accounting for
 * UTC-offset changes (e.g. historical DST in Iran).
 */

import type { GregorianParts } from './types';

/** The host environment's resolved IANA time zone. */
export function getSystemTimeZone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
}

const formatterCache = new Map<string, Intl.DateTimeFormat>();

function getFormatter(timeZone: string): Intl.DateTimeFormat {
  let formatter = formatterCache.get(timeZone);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat('en-US', {
      timeZone,
      hourCycle: 'h23',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    formatterCache.set(timeZone, formatter);
  }
  return formatter;
}

/** Gregorian wall-clock fields, including time, for an instant in a time zone. */
export interface WallClock extends GregorianParts {
  hour: number;
  minute: number;
  second: number;
  millisecond: number;
}

/** Projects an absolute instant into the civil (wall-clock) fields of a time zone. */
export function instantToWallClock(epochMs: number, timeZone: string): WallClock {
  const parts = getFormatter(timeZone).formatToParts(new Date(epochMs));
  const lookup: Record<string, number> = {};
  for (const part of parts) {
    if (part.type !== 'literal') {
      lookup[part.type] = Number(part.value);
    }
  }
  // `Intl` reports midnight as hour 24 in some engines; normalize to 0.
  const hour = lookup.hour === 24 ? 0 : (lookup.hour ?? 0);
  return {
    year: lookup.year ?? 1970,
    month: lookup.month ?? 1,
    day: lookup.day ?? 1,
    hour,
    minute: lookup.minute ?? 0,
    second: lookup.second ?? 0,
    millisecond: epochMs - Math.floor(epochMs / 1000) * 1000,
  };
}

/** Returns the UTC offset (in milliseconds, east-positive) of a time zone at an instant. */
export function getTimeZoneOffsetMs(epochMs: number, timeZone: string): number {
  const wall = instantToWallClock(epochMs, timeZone);
  const asUtc = Date.UTC(
    wall.year,
    wall.month - 1,
    wall.day,
    wall.hour,
    wall.minute,
    wall.second,
    0,
  );
  // Round to the nearest second; sub-second components are carried by `epochMs`.
  return asUtc - Math.floor(epochMs / 1000) * 1000;
}

/**
 * Inverts {@link instantToWallClock}: given civil fields interpreted in a time
 * zone, returns the absolute instant. Two passes resolve UTC-offset transitions.
 */
export function wallClockToInstant(
  wall: {
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
    second: number;
    millisecond: number;
  },
  timeZone: string,
): number {
  const utcGuess = Date.UTC(
    wall.year,
    wall.month - 1,
    wall.day,
    wall.hour,
    wall.minute,
    wall.second,
    wall.millisecond,
  );
  const offset1 = getTimeZoneOffsetMs(utcGuess, timeZone);
  let instant = utcGuess - offset1;
  const offset2 = getTimeZoneOffsetMs(instant, timeZone);
  if (offset2 !== offset1) {
    instant = utcGuess - offset2;
  }
  return instant;
}
