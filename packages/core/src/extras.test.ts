import { describe, expect, it } from 'vitest';
import { DoranDate } from './doran-date';
import { duration } from './duration';
import { enUS, faAF } from './locale';
import { parseJalali } from './parse';
import type { DoranDateOptions } from './types';

const UTC: DoranDateOptions = { timeZone: 'UTC' };
const EN: DoranDateOptions = { timeZone: 'UTC', locale: enUS };

describe('unix helpers', () => {
  it('round-trips through unix seconds', () => {
    const d = DoranDate.fromJalali({ year: 1403, month: 5, day: 10, hour: 8, minute: 30 }, UTC);
    expect(DoranDate.fromUnix(d.unix(), UTC).isSame(d.startOf('second'))).toBe(true);
  });

  it('floors milliseconds to whole seconds', () => {
    expect(DoranDate.fromEpochMs(1742480700123, UTC).unix()).toBe(1742480700);
  });
});

describe('toArray', () => {
  it('returns civil fields in order', () => {
    const d = DoranDate.fromJalali({ year: 1403, month: 1, day: 1, hour: 14, minute: 5 }, UTC);
    expect(d.toArray()).toEqual([1403, 1, 1, 14, 5, 0, 0]);
  });
});

describe('week numbering', () => {
  it('counts 52 or 53 weeks per year', () => {
    expect(DoranDate.fromJalali(1399, 1, 1, UTC).weeksInYear).toBe(53);
    expect(DoranDate.fromJalali(1400, 1, 1, UTC).weeksInYear).toBe(52);
    expect(DoranDate.fromJalali(1404, 1, 1, UTC).weeksInYear).toBe(53);
  });

  it('rolls the final days of a year into the next week-year', () => {
    const last = DoranDate.fromJalali(1402, 12, 29, UTC);
    expect(last.week).toBe(1);
    expect(last.weekYear).toBe(1403);
    expect(last.weekOfYear).toBe(last.week); // weekOfYear is an alias
  });
});

describe('diffDuration', () => {
  it('returns a signed Duration between two dates', () => {
    const a = DoranDate.fromJalali(1403, 1, 10, EN);
    const b = DoranDate.fromJalali(1403, 1, 1, EN);
    expect(a.diffDuration(b).asDays()).toBe(9);
    expect(b.diffDuration(a).asDays()).toBe(-9);
    expect(a.diffDuration(b).humanize(true)).toBe('in 9 days');
  });

  it('is consistent with duration() of the raw delta', () => {
    const a = DoranDate.fromJalali(1403, 6, 1, UTC);
    const b = DoranDate.fromJalali(1403, 1, 1, UTC);
    expect(a.diffDuration(b).asMilliseconds()).toBe(
      duration(a.epochMs - b.epochMs).asMilliseconds(),
    );
  });
});

describe('parseJalali with multiple formats', () => {
  it('tries each format in order', () => {
    expect(parseJalali('1403-01-05', ['YYYY/MM/DD', 'YYYY-MM-DD'])?.format('YYYY/MM/DD')).toBe(
      '۱۴۰۳/۰۱/۰۵',
    );
  });

  it('returns null when nothing matches', () => {
    expect(parseJalali('not a date', ['YYYY/MM/DD'])).toBeNull();
    expect(parseJalali('nope')).toBeNull();
  });
});

describe('fa-AF (Dari) locale', () => {
  it('is registered and uses Afghan zodiacal month names', () => {
    expect(
      DoranDate.fromJalali(1403, 1, 1, { timeZone: 'UTC', locale: 'fa-AF' }).format('MMMM'),
    ).toBe('حمل');
    expect(DoranDate.fromJalali(1403, 7, 1, { timeZone: 'UTC', locale: faAF }).format('MMMM')).toBe(
      'میزان',
    );
    expect(
      DoranDate.fromJalali(1403, 12, 1, { timeZone: 'UTC', locale: faAF }).format('MMMM'),
    ).toBe('حوت');
  });

  it('keeps the same date arithmetic as fa-IR (names differ only)', () => {
    const af = DoranDate.fromJalali(1403, 1, 1, { timeZone: 'UTC', locale: faAF });
    const ir = DoranDate.fromJalali(1403, 1, 1, UTC);
    expect(af.epochMs).toBe(ir.epochMs);
    expect(af.dayOfWeek).toBe(ir.dayOfWeek);
  });
});
