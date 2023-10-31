import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [svelte()],
  optimizeDeps: {
    include: ['../..'],
  },
  resolve: {
    alias: {
      'canvas-animation': path.resolve(
        __dirname,
        '../../canvas-animation/lib/main.ts'
      ),
    },
  },
});
