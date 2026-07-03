import angular from '@analogjs/vite-plugin-angular';
import { defineConfig } from 'vite';

// On GitHub Pages the demo is served from /Doran/examples/angular/; local dev stays at /.
// Demo source for the code panels is embedded via `prebuild` (scripts/gen-sources.mjs);
// see the note there for why `?raw` doesn't work with the Angular plugin.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/Doran/examples/angular/' : '/',
  plugins: [angular({ tsconfig: './tsconfig.app.json' })],
}));
