import { describe, expect, it } from 'vitest';
import { DoranDate } from './doran-date';
import { enUS } from './locale';
import type { DoranDateOptions } from './types';

const UTC: DoranDateOptions = { timeZone: 'UTC' };
const EN: DoranDateOptions = { timeZone: 'UTC', locale: enUS };

// 1403/1/1 = 2024-03-20, a Wednesday (Persian weekday 4).
const wed = DoranDate.fromJalali({ year: 1403, month: 1, day: 1, hour: 14, minute: 5 }, EN);

describe('localized format tokens', () => {
  it('expands L / LT / LTS', () => {
    expect(wed.format('L')).toBe('1403/01/01');
    expect(wed.format('LT')).toBe('2:05 PM');
    expect(wed.format('LTS')).toBe('2:05:00 PM');
  });

  it('expands LL / LLL / LLLL (with embedded LT)', () => {
    expect(wed.format('LL')).toBe('1 Farvardin 1403');
    expect(wed.format('LLL')).toBe('1 Farvardin 1403 2:05 PM');
    expect(wed.format('LLLL')).toBe('Chaharshanbe, 1 Farvardin 1403 2:05 PM');
  });

  it('uses the Persian long formats by default', () => {
    const fa = DoranDate.fromJalali({ year: 1403, month: 1, day: 1, hour: 14, minute: 5 }, UTC);
    expect(fa.format('LLLL')).toBe('چهارشنبه ۱ فروردین ۱۴۰۳ ساعت ۱۴:۰۵');
  });

  it('does not expand L inside a [literal]', () => {
    expect(wed.format('[Local:] L')).toBe('Local: 1403/01/01');
  });
});

describe('ordinal tokens', () => {
  it('renders English ordinals', () => {
    expect(wed.format('Do')).toBe('1st');
    expect(wed.format('Mo')).toBe('1st');
    expect(wed.format('Qo')).toBe('1st');
    expect(wed.format('wo')).toBe('1st');
    expect(DoranDate.fromJalali(1403, 1, 22, EN).format('Do')).toBe('22nd');
    expect(DoranDate.fromJalali(1403, 1, 13, EN).format('Do')).toBe('13th');
  });

  it('renders Persian ordinals with the «م» suffix', () => {
    expect(DoranDate.fromJalali(1403, 1, 1, UTC).format('Do')).toBe('۱م');
  });
});

describe('day-of-year, week, and weekday tokens', () => {
  it('renders DDD / DDDD', () => {
    const last = DoranDate.fromJalali(1403, 12, 30, EN); // leap year → day 366
    expect(last.format('DDD')).toBe('366');
    expect(wed.format('DDDD')).toBe('001');
  });

  it('renders w / ww / gggg / gg', () => {
    expect(wed.format('w')).toBe('1');
    expect(wed.format('ww')).toBe('01');
    expect(wed.format('gggg')).toBe('1403');
    expect(wed.format('gg')).toBe('03');
  });

  it('renders e (locale weekday) and E (ISO weekday)', () => {
    expect(wed.format('e')).toBe('4'); // Persian: 0=Sat, Wednesday = 4
    expect(wed.format('E')).toBe('3'); // ISO: Monday=1, Wednesday = 3
  });
});

describe('hour, fraction, and unix tokens', () => {
  it('renders k / kk (1–24 hour, midnight = 24)', () => {
    const midnight = DoranDate.fromJalali({ year: 1403, month: 1, day: 1 }, EN);
    expect(midnight.format('k')).toBe('24');
    expect(midnight.format('kk')).toBe('24');
    expect(wed.format('k')).toBe('14');
  });

  it('renders S / SS / SSS', () => {
    const ms = DoranDate.fromJalali({ year: 1403, month: 1, day: 1, millisecond: 45 }, EN);
    expect(ms.format('S')).toBe('0');
    expect(ms.format('SS')).toBe('04');
    expect(ms.format('SSS')).toBe('045');
  });

  it('renders X (unix seconds) and x (unix ms)', () => {
    const d = DoranDate.fromEpochMs(1742480700000, EN);
    expect(d.format('X')).toBe('1742480700');
    expect(d.format('x')).toBe('1742480700000');
  });
});

describe('calendar()', () => {
  const base = DoranDate.fromJalali({ year: 1403, month: 5, day: 10, hour: 9 }, EN);

  it('produces calendar-time phrases relative to a reference', () => {
    expect(base.calendar(base)).toBe('Today at 9:00 AM');
    expect(base.addDays(1).calendar(base)).toBe('Tomorrow at 9:00 AM');
    expect(base.addDays(-1).calendar(base)).toBe('Yesterday at 9:00 AM');
    expect(base.addDays(3).calendar(base)).toMatch(/at 9:00 AM$/);
    expect(base.addDays(10).calendar(base)).toBe('1403/05/20');
  });

  it('accepts per-call template overrides', () => {
    expect(base.calendar(base, { sameDay: '[today!]' })).toBe('today!');
  });
});

describe('season getters', () => {
  it('maps months to seasons', () => {
    expect(DoranDate.fromJalali(1403, 1, 1, EN).season).toBe(1);
    expect(DoranDate.fromJalali(1403, 5, 1, EN).season).toBe(2);
    expect(DoranDate.fromJalali(1403, 8, 1, EN).season).toBe(3);
    expect(DoranDate.fromJalali(1403, 11, 1, EN).season).toBe(4);
  });

  it('localizes the season name', () => {
    expect(DoranDate.fromJalali(1403, 1, 1, UTC).seasonName).toBe('بهار');
    expect(DoranDate.fromJalali(1403, 11, 1, UTC).seasonName).toBe('زمستان');
    expect(DoranDate.fromJalali(1403, 1, 1, EN).seasonName).toBe('Bahar');
  });
});
