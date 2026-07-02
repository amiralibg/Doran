#!/usr/bin/env node
// Tiny, dependency-free benchmark for @doranjs/core hot paths.
// Run: pnpm --filter @doranjs/core build && node packages/core/bench/index.mjs
// Optionally compares against moment-jalaali if it is installed (it is not a dep).
import { fileURLToPath } from 'node:url';

const dist = fileURLToPath(new URL('../dist/index.js', import.meta.url));
const { DoranDate, parseJalali } = await import(dist);

/** Runs fn for ~`ms`, returns ops/sec. */
function bench(fn, ms = 600) {
  for (let i = 0; i < 1000; i++) fn(i); // warmup
  const start = process.hrtime.bigint();
  let ops = 0;
  while (Number(process.hrtime.bigint() - start) / 1e6 < ms) {
    fn(ops);
    ops++;
  }
  return Math.round(ops / (Number(process.hrtime.bigint() - start) / 1e9));
}

const d = DoranDate.fromJalali(1405, 3, 11, { timeZone: 'UTC' });
const d2 = d.addDays(100);

const cases = {
  format: () => d.format('YYYY/MM/DD HH:mm:ss'),
  parse: () => parseJalali('1405/03/11'),
  'diff(day)': () => d2.diff(d, 'day'),
  construct: () => DoranDate.fromJalali(1405, 3, 11, { timeZone: 'UTC' }),
};

console.log('@doranjs/core — ops/sec\n');
for (const [name, fn] of Object.entries(cases)) {
  console.log(name.padEnd(12), bench(fn).toLocaleString().padStart(14));
}
