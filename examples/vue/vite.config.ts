import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';

// On GitHub Pages the demo is served from /Doran/examples/vue/; local dev stays at /.
export default defineConfig(({ command }) => ({
  plugins: [vue()],
  base: command === 'build' ? '/Doran/examples/vue/' : '/',
}));
