import { svelte } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vite';

// On GitHub Pages the demo is served from /Doran/examples/svelte/; local dev stays at /.
export default defineConfig(({ command }) => ({
  plugins: [svelte()],
  base: command === 'build' ? '/Doran/examples/svelte/' : '/',
}));
