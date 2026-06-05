import { describe, expect, it } from 'vitest';
import { Duration, duration } from './duration';
import { enUS } from './locale';

describe('duration() factory', () => {
  it('treats a bare number as milliseconds', () => {
    expect(duration(1500).asSeconds()).toBe(1.5);
    expect(duration(1500)).toBeInstanceOf(Duration);
  });

  it('treats a number + unit as that unit', () => {
    expect(duration(2, 'hour').asMinutes()).toBe(120);
    expect(duration(3, 'day').asHours()).toBe(72);
    expect(duration(1, 'week').asDays()).toBe(7);
  });

  it('builds from an object of fields', () => {
    const d = duration({ hours: 2, minutes: 30 });
    expect(d.asMinutes()).toBe(150);
    expect(d.asMilliseconds()).toBe((2 * 60 + 30) * 60 * 1000);
  });
});

describe('Duration conversions', () => {
  const d = duration({ months: 1, days: 10, hours: 2, minutes: 30 });

  it('converts calendar units using Moment-compatible averages', () => {
    expect(d.asMonths()).toBeCloseTo(1.332, 3);
    expect(d.asDays()).toBeCloseTo(40.1042, 3);
    expect(d.asYears()).toBeCloseTo(1.332 / 12, 4);
    expect(d.asQuarters()).toBeCloseTo(1.332 / 3, 4);
  });

  it('bubbles into per-unit fields', () => {
    expect(d.toObject()).toEqual({
      years: 0,
      months: 1,
      days: 10,
      hours: 2,
      minutes: 30,
      seconds: 0,
      milliseconds: 0,
    });
  });

  it('reads a single bubbled field with get()', () => {
    expect(d.get('month')).toBe(1);
    expect(d.get('hour')).toBe(2);
    expect(duration({ months: 25 }).get('year')).toBe(2);
    expect(duration({ months: 25 }).get('month')).toBe(1);
  });

  it('serializes to ISO-8601', () => {
    expect(d.toISOString()).toBe('P1M10DT2H30M');
    expect(duration(0).toISOString()).toBe('P0D');
    expect(duration({ years: 1, seconds: 5 }).toISOString()).toBe('P1YT5S');
  });
});

describe('Duration arithmetic and sign', () => {
  it('adds and subtracts durations', () => {
    expect(duration({ hours: 1 }).add({ minutes: 30 }).asMinutes()).toBe(90);
    expect(
      duration({ hours: 2 })
        .subtract(duration({ hours: 1 }))
        .asHours(),
    ).toBe(1);
  });

  it('reports sign and abs', () => {
    expect(duration(-5000).sign()).toBe(-1);
    expect(duration(0).sign()).toBe(0);
    expect(duration(5000).sign()).toBe(1);
    expect(duration(-5000).abs().asSeconds()).toBe(5);
  });

  it('coerces to total milliseconds via valueOf', () => {
    expect(Number(duration(1, 'second'))).toBe(1000);
    expect(duration(2, 'second') > duration(1, 'second')).toBe(true);
  });
});

describe('Duration.humanize', () => {
  it('humanizes in the given locale', () => {
    expect(duration(3, 'day', enUS).humanize()).toBe('3 days');
    expect(duration(3, 'day', enUS).humanize(true)).toBe('in 3 days');
    expect(duration(-3, 'day', enUS).humanize(true)).toBe('3 days ago');
  });

  it('defaults to the Persian locale', () => {
    expect(duration(2, 'hour').humanize()).toBe('۲ ساعت');
  });

  it('can be rebound to another locale', () => {
    expect(duration(1, 'day').withLocale(enUS).humanize()).toBe('a day');
  });
});
