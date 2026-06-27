#!/usr/bin/env node
// Zero-dependency bundle-size guard. Gzips each built entry and fails if it
// exceeds its budget — the CI equivalent of size-limit, without a new dep.
// Run after `pnpm build`. Update budgets here when an intentional size change lands.
import { gzipSync } from 'node:zlib';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));

/** entry → gzip budget in kB (of the built, unminified dist file). */
const BUDGETS = [{ file: 'packages/core/dist/index.js', budgetKb: 20 }];

let failed = false;
for (const { file, budgetKb } of BUDGETS) {
  let bytes;
  try {
    bytes = readFileSync(root + file);
  } catch {
    console.error(`✗ ${file} — not found (did you run \`pnpm build\` first?)`);
    failed = true;
    continue;
  }
  const gz = gzipSync(bytes).length / 1024;
  const ok = gz <= budgetKb;
  failed ||= !ok;
  console.log(`${ok ? '✓' : '✗'} ${file}  ${gz.toFixed(2)} kB gz  (budget ${budgetKb} kB)`);
}

if (failed) {
  console.error('\nBundle size budget exceeded. Trim the change, or raise the budget in scripts/size-check.mjs if intentional.');
  process.exit(1);
}
