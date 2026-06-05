import { readFileSync, writeFileSync } from 'node:fs';
import { defineConfig } from 'tsdown';

/** The wc stylesheet bundles the ui + react styles, concatenated in that order. */
function concatStyles(): void {
  const css =
    readFileSync('../ui/src/styles.css', 'utf8') + readFileSync('../react/src/styles.css', 'utf8');
  writeFileSync('dist/styles.css', css);
}

export default defineConfig([
  // npm entry: ESM + CJS, workspace deps externalized (the default for (peer)dependencies).
  {
    entry: ['src/index.ts'],
    format: ['esm', 'cjs'],
    dts: { sourcemap: false },
    sourcemap: true,
    clean: true,
    target: 'es2022',
    outExtensions: ({ format }) =>
      format === 'cjs' ? { js: '.cjs', dts: '.d.cts' } : { js: '.js', dts: '.d.ts' },
    hooks: { 'build:done': concatStyles },
  },
  // CDN entry: a single self-registering IIFE bundle with every dependency inlined.
  {
    entry: { doran: 'src/global.ts' },
    format: ['iife'],
    globalName: 'Doran',
    platform: 'browser',
    sourcemap: true,
    clean: false,
    target: 'es2022',
    minify: true,
    dts: false,
    // CDN must inline the workspace packages, not leave them as bare imports.
    deps: { alwaysBundle: [/^@doranjs\//] },
    outputOptions: { entryFileNames: '[name].global.js' },
  },
]);
