import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const fromRoot = (path: string) => fileURLToPath(new URL(path, import.meta.url));

// On GitHub Pages the demo is served from /Doran/examples/react/; local dev stays at /.
export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: command === 'build' ? '/Doran/examples/react/' : '/',
  resolve: {
    // Point the stylesheets at source during dev. They otherwise resolve to `dist`,
    // so every CSS edit needed a package rebuild before it showed up here — easy to
    // forget, and it makes you doubt a change that did land.
    alias:
      command === 'serve'
        ? [
            {
              find: '@doranjs/react/styles.css',
              replacement: fromRoot('../../packages/react/src/styles.css'),
            },
            {
              find: '@doranjs/ui/styles.css',
              replacement: fromRoot('../../packages/ui/src/styles.css'),
            },
          ]
        : [],
  },
}));
