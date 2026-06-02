import { defineConfig } from 'tsup';

const copyStyles = 'cat ../ui/src/styles.css ../react/src/styles.css > dist/styles.css';

export default defineConfig([
  // npm entry: ESM + CJS, workspace deps externalized.
  {
    entry: ['src/index.ts'],
    format: ['esm', 'cjs'],
    dts: true,
    sourcemap: true,
    clean: true,
    treeshake: true,
    target: 'es2022',
    external: ['@doranjs/core', '@doranjs/nlp', '@doranjs/holidays'],
    onSuccess: copyStyles,
    outExtension({ format }) {
      return { js: format === 'cjs' ? '.cjs' : '.js' };
    },
  },
  // CDN entry: a single self-registering IIFE bundle with everything inlined.
  {
    entry: { doran: 'src/global.ts' },
    format: ['iife'],
    globalName: 'Doran',
    sourcemap: true,
    clean: false,
    treeshake: true,
    target: 'es2022',
    minify: true,
  },
]);
