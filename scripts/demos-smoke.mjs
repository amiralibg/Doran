// Real-browser smoke pass over the deployed demos.
// Proves each framework demo actually mounts, renders, stays console-clean, and
// that live binding works (lang toggle flips the header title) — none of which
// the build/deploy step can catch. Integration smoke, not unit coverage.
//
// Usage:
//   node scripts/demos-smoke.mjs                       # hits the deployed site
//   BASE_URL=http://localhost:4173 node scripts/demos-smoke.mjs
import { chromium } from 'playwright';

const BASE = (process.env.BASE_URL ?? 'https://amiralibg.github.io/Doran').replace(/\/$/, '');
const DEMOS = ['react', 'vanilla', 'vue', 'svelte', 'angular'];

// Chunk-load 404s and favicon noise aren't demo bugs; everything else is.
const ignore = (text) => /favicon/i.test(text);

async function checkDemo(browser, name) {
  const url = `${BASE}/examples/${name}/`;
  const page = await browser.newPage();
  const errors = [];
  page.on('console', (m) => m.type() === 'error' && !ignore(m.text()) && errors.push(m.text()));
  page.on('pageerror', (e) => errors.push(e.message));

  const problems = [];
  try {
    const res = await page.goto(url, { waitUntil: 'networkidle', timeout: 30_000 });
    if (!res || !res.ok()) problems.push(`HTTP ${res?.status() ?? 'no response'}`);

    // Render proof: the app mounted and produced its header.
    const title = page.locator('.app__title').first();
    await title.waitFor({ state: 'visible', timeout: 15_000 });
    const before = (await title.textContent())?.trim() ?? '';

    // Binding proof: first toolbar button toggles language → title text changes.
    const toggle = page.locator('.app__btn').first();
    if (await toggle.count()) {
      await toggle.click();
      await page
        .waitForFunction(
          (prev) => document.querySelector('.app__title')?.textContent?.trim() !== prev,
          before,
          { timeout: 5_000 },
        )
        .catch(() => problems.push('lang toggle did not change the header title'));
    }
  } catch (e) {
    problems.push(e.message.split('\n')[0]);
  }

  if (errors.length) problems.push(`console errors: ${errors.slice(0, 3).join(' | ')}`);
  await page.close();
  return problems;
}

const browser = await chromium.launch();
let failed = false;
for (const name of DEMOS) {
  const problems = await checkDemo(browser, name);
  if (problems.length) {
    failed = true;
    console.error(`✗ ${name}\n  - ${problems.join('\n  - ')}`);
  } else {
    console.log(`✓ ${name}`);
  }
}
await browser.close();
process.exit(failed ? 1 : 0);
