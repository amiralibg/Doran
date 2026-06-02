import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// On GitHub Pages the demo is served from /Doran/examples/react/; local dev stays at /.
export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: command === 'build' ? '/Doran/examples/react/' : '/',
}));
