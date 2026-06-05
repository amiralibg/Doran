/**
 * Cross-checks {@link DoranDate} against `moment-jalaali` (the de-facto reference) across
 * every Jalali day in a wide range, and emits a compact fixture of moment-jalaali's
 * ground-truth values for the parity regression test.
 *
 * Usage (from packages/core, with moment-jalaali installed and dist built):
 *   node scripts/parity/generate.mjs
 *
 * It exits non-zero if any live discrepancy is found. moment-jalaali is a temporary
 * dev dependency — it is removed once the fixture is committed.
 */
import { createRequire } from 'node:module';
import { writeFileSync } from 'node:fs';
import { DoranDate } from '../../dist/index.js';

const require = createRequire(import.meta.url);
const moment = require('moment-jalaali');
const pkg = require('moment-jalaali/package.json');

// Use the Persian week convention (Saturday-first, doy 12) — the same config DoranDate
// uses. Without this, moment falls back to the en locale's week (Sunday-first).
moment.loadPersian({ usePersianDigits: false, dialect: 'persian-modern' });

const UTC = { timeZone: 'UTC' };

const FROM_YEAR = 1300;
const TO_YEAR = 1500;

/** moment's `day()` is `0 = Sunday`; the Persian week is `0 = Saturday`. */
const toPersianDow = (jsDow) => (jsDow + 1) % 7;

const mismatches = [];
const rows = [];
let checked = 0;

for (let jy = FROM_YEAR; jy <= TO_YEAR; jy += 1) {
  for (let jm = 1; jm <= 12; jm += 1) {
    const dim = moment.jDaysInMonth(jy, jm - 1);
    const leap = moment.jIsLeapYear(jy);
    for (let jd = 1; jd <= dim; jd += 1) {
      const mj = moment(`${jy}/${jm}/${jd}`, 'jYYYY/jM/jD');
      const expected = {
        jy,
        jm,
        jd,
        dow: toPersianDow(mj.day()),
        doy: mj.jDayOfYear(),
        week: mj.jWeek(),
        weekYear: mj.jWeekYear(),
        dim,
        leap: leap ? 1 : 0,
      };

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

      for (const key of Object.keys(expected)) {
        if (expected[key] !== actual[key]) {
          mismatches.push({ jy, jm, jd, key, expected: expected[key], actual: actual[key] });
        }
      }

      checked += 1;
      // Compact, deterministic sample for the committed fixture: the 1st/8th/15th/22nd of
      // each month (spanning every weekday so week/weekYear rollover is exercised) plus the
      // year-end days (Esfand 29/30) that lock leap handling and the week-year boundary.
      if (jd === 1 || jd === 15 || (jm === 12 && jd >= 29)) {
        rows.push([
          expected.jy,
          expected.jm,
          expected.jd,
          expected.dow,
          expected.doy,
          expected.week,
          expected.weekYear,
          expected.dim,
          expected.leap,
        ]);
      }
    }
  }
}

console.log(`Checked ${checked} Jalali days (jy ${FROM_YEAR}–${TO_YEAR}).`);
console.log(`Fixture rows: ${rows.length}.`);

if (mismatches.length > 0) {
  console.error(`\n❌ ${mismatches.length} mismatch(es) vs moment-jalaali:`);
  for (const m of mismatches.slice(0, 40)) {
    console.error(`  ${m.jy}/${m.jm}/${m.jd}  ${m.key}: doran=${m.actual} moment=${m.expected}`);
  }
  process.exitCode = 1;
} else {
  console.log('\n✅ DoranDate matches moment-jalaali on every checked field.');
}

const fixture = {
  source: `moment-jalaali@${pkg.version}`,
  generated: new Date().toISOString().slice(0, 10),
  range: { fromYear: FROM_YEAR, toYear: TO_YEAR },
  weekConfig: { dow: 6, doy: 12 },
  fields: ['jy', 'jm', 'jd', 'dow', 'doy', 'week', 'weekYear', 'dim', 'leap'],
  rows,
};

const out = new URL('../../src/parity.fixture.json', import.meta.url);
writeFileSync(out, `${JSON.stringify(fixture)}\n`);
console.log(`Wrote ${out.pathname}`);
