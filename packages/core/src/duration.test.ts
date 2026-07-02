import { describe, expect, it } from 'vitest';
import { DoranDate } from './doran-date';
import { Duration } from './duration';
import { enUS } from './locale';

describe('Duration', () => {
  it('converts to a unit with as()', () => {
    expect(new Duration({ hours: 1, minutes: 30 }).as('minute')).toBe(90);
    expect(new Duration({ days: 2 }).as('hour')).toBe(48);
    expect(new Duration({ minutes: 90 }).as('hour')).toBe(1.5);
  });

  it('adds and subtracts field-wise', () => {
    const a = new Duration({ hours: 1, minutes: 30 });
    expect(a.add({ minutes: 30 }).as('hour')).toBe(2);
    expect(a.subtract({ minutes: 30 }).as('hour')).toBe(1);
  });

  it('negates', () => {
    expect(new Duration({ days: 3 }).negate().as('day')).toBe(-3);
  });

  it('is comparable via valueOf', () => {
    expect(new Duration({ hours: 2 }) > new Duration({ hours: 1 })).toBe(true);
  });

  it('round-trips through millis with greedy decomposition', () => {
    const ms = 2 * 86_400_000 + 3 * 3_600_000 + 5_000; // 2d 3h 5s
    const d = Duration.fromMillis(ms);
    expect(d.toObject()).toMatchObject({ days: 2, hours: 3, seconds: 5 });
    expect(d.toMillis()).toBe(ms);
  });

  it('preserves sign when decomposing a negative span', () => {
    const d = Duration.fromMillis(-90 * 60_000); // -90 min
    expect(d.toObject()).toMatchObject({ hours: -1, minutes: -30 });
  });

  it('humanizes its magnitude', () => {
    expect(new Duration({ hours: 1 }).humanize(enUS)).toBe('an hour');
    expect(new Duration({ hours: 2 }).humanize(enUS)).toBe('2 hours');
  });
});

describe('DoranDate.diff returning a Duration', () => {
  it('breaks the span into fields', () => {
    const a = DoranDate.fromJalali(1405, 1, 1, { timeZone: 'UTC' });
    const b = a.addDays(2).addHours(3).addMinutes(30);
    const d = b.diff(a, 'duration');
    expect(d).toBeInstanceOf(Duration);
    expect(d.toObject()).toMatchObject({ days: 2, hours: 3, minutes: 30 });
  });

  it('still returns a number for ordinary units', () => {
    const a = DoranDate.fromJalali(1405, 1, 1, { timeZone: 'UTC' });
    expect(a.addDays(5).diff(a, 'day')).toBe(5);
  });
});
