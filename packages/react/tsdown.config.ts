import { defineConfig } from 'tsdown';

export default defineConfig({
  // `holidays` is a separate entry so the Iranian holiday dataset only lands in
  // bundles that actually import `@doranjs/react/holidays`.
  entry: ['src/index.ts', 'src/holidays.ts'],
  format: ['esm', 'cjs'],
  // declarationMap is on in tsconfig.base; tsup ignored it, so disable to keep dist lean.
  dts: { sourcemap: false },
  sourcemap: true,
  clean: true,
  target: 'es2022',
  // react/react-dom and @doranjs/* are in (peer)dependencies, so tsdown externalizes
  // them automatically. Ship the stylesheet alongside the bundle.
  copy: [{ from: 'src/styles.css', to: 'dist' }],
  outExtensions: ({ format }) =>
    format === 'cjs' ? { js: '.cjs', dts: '.d.cts' } : { js: '.js', dts: '.d.ts' },
});
