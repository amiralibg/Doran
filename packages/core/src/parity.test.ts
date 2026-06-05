import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { DoranDate } from './doran-date';
import type { DoranDateOptions } from './types';

/**
 * Parity lock-in: every row in `parity.fixture.json` is a ground-truth value produced by
 * `moment-jalaali` (with `loadPersian`). The fixture is committed so the cross-check keeps
 * running without the dependency; regenerate it with `scripts/parity/generate.mjs` if the
 * reference ever needs refreshing. Each `[jy, jm, jd, dow, doy, week, weekYear, dim, leap]`
 * row asserts that DoranDate agrees with moment-jalaali on the field.
 */
interface Fixture {
  source: string;
  fields: string[];
  weekConfig: { dow: number; doy: number };
  rows: number[][];
}

const fixture: Fixture = JSON.parse(
  readFileSync(new URL('./parity.fixture.json', import.meta.url), 'utf8'),
);

const UTC: DoranDateOptions = { timeZone: 'UTC' };

describe(`moment-jalaali parity (${fixture.source})`, () => {
  it('has a non-trivial, well-formed fixture', () => {
    expect(fixture.rows.length).toBeGreaterThan(1000);
    expect(fixture.weekConfig).toEqual({ dow: 6, doy: 12 });
    expect(fixture.fields).toEqual([
      'jy',
      'jm',
      'jd',
      'dow',
      'doy',
      'week',
      'weekYear',
      'dim',
      'leap',
    ]);
  });

  it('matches moment-jalaali on every fixture row', () => {
    const mismatches: string[] = [];

    for (const [jy, jm, jd, dow, doy, week, weekYear, dim, leap] of fixture.rows) {
      const d = DoranDate.fromJalali(jy, jm, jd, UTC);
      const actual = {
        jy: d.year,
        jm: d.month,
        jd: d.day,
        dow: d.dayOfWeek,
        doy: d.dayOfYear,
        week: d.week,
        weekYear: d.weekYear,
        dim: d.daysInMonth,
        leap: d.isLeapYear() ? 1 : 0,
      };
      const expected = { jy, jm, jd, dow, doy, week, weekYear, dim, leap };

      for (const key of Object.keys(expected) as (keyof typeof expected)[]) {
        if (actual[key] !== expected[key]) {
          mismatches.push(`${jy}/${jm}/${jd} ${key}: doran=${actual[key]} moment=${expected[key]}`);
        }
      }
    }

    expect(mismatches).toEqual([]);
  });
});
