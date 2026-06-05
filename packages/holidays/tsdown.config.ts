import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  // declarationMap is on in tsconfig.base; tsup ignored it, so disable to keep dist lean.
  dts: { sourcemap: false },
  sourcemap: true,
  clean: true,
  target: 'es2022',
  // Match the published layout: ESM = .js/.d.ts, CJS = .cjs/.d.cts.
  outExtensions: ({ format }) =>
    format === 'cjs' ? { js: '.cjs', dts: '.d.cts' } : { js: '.js', dts: '.d.ts' },
});
