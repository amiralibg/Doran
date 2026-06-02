import { defineConfig } from 'vite';

// On GitHub Pages the demo is served from /Doran/examples/vanilla/; local dev stays at /.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/Doran/examples/vanilla/' : '/',
  server: { port: 5200 },
}));
