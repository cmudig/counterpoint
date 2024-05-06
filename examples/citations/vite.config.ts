import { UserConfig, defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ command }) => {
  let base: UserConfig = {
    plugins: [svelte()],
    base: '/counterpoint/assets/citations/',
    optimizeDeps: {
      include: ['../..'],
    },
    assetsInclude: ['src/assets/**'],
    resolve: {
      alias: {
        'counterpoint-vis': path.resolve(
          __dirname,
          '../../counterpoint/lib/main.ts'
        ),
      },
    },
  };
  if (command === 'build') {
    base.build = {
      lib: {
        entry: path.resolve(__dirname, 'src/library.ts'),
        name: 'citations_vis',
      },
    };
  }
  return base;
});
