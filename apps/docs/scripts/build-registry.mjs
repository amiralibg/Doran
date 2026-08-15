/**
 * Generates the shadcn registry payloads under `public/r/` from the component
 * sources in `registry/`.
 *
 * The sources are real `.tsx` files so they stay lintable and type-checkable;
 * embedding them by hand in JSON would guarantee the two drift apart.
 *
 * Run via `pnpm build:registry`, which the docs build calls first.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const outDir = join(root, 'public', 'r');

/** Where the published registry lives — the docs site's GitHub Pages base. */
const BASE = 'https://amiralibg.github.io/Doran/r';

const items = [
  {
    name: 'doran-date-picker',
    type: 'registry:ui',
    title: 'Persian Date Picker',
    description:
      'A Jalali date picker built from your own shadcn/ui Button, Input, and Popover. ' +
      'Type a date or pick one; Doran supplies the calendar engine, your theme supplies every visual.',
    dependencies: ['@doranjs/core', '@doranjs/react', 'lucide-react'],
    registryDependencies: ['button', 'input', 'popover'],
    files: [
      {
        source: 'doran-date-picker.tsx',
        path: 'components/ui/doran-date-picker.tsx',
        type: 'registry:ui',
        target: 'components/ui/doran-date-picker.tsx',
      },
    ],
  },
];

mkdirSync(outDir, { recursive: true });

for (const item of items) {
  const payload = {
    $schema: 'https://ui.shadcn.com/schema/registry-item.json',
    name: item.name,
    type: item.type,
    title: item.title,
    description: item.description,
    dependencies: item.dependencies,
    registryDependencies: item.registryDependencies,
    files: item.files.map((file) => ({
      path: file.path,
      type: file.type,
      target: file.target,
      content: readFileSync(join(root, 'registry', file.source), 'utf8'),
    })),
  };

  writeFileSync(join(outDir, `${item.name}.json`), `${JSON.stringify(payload, null, 2)}\n`);
}

// The index, so `shadcn` can list what this registry offers.
const index = {
  $schema: 'https://ui.shadcn.com/schema/registry.json',
  name: 'doran',
  homepage: 'https://amiralibg.github.io/Doran/',
  items: items.map((item) => ({
    name: item.name,
    type: item.type,
    title: item.title,
    description: item.description,
    registryDependencies: item.registryDependencies,
    dependencies: item.dependencies,
    files: [{ path: `${BASE}/${item.name}.json`, type: item.type }],
  })),
};

writeFileSync(join(outDir, 'registry.json'), `${JSON.stringify(index, null, 2)}\n`);

console.log(`registry: wrote ${items.length + 1} files to public/r/`);
