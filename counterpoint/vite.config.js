import path from 'path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

module.exports = defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, 'lib/main.ts'),
      name: 'counterpoint-vis',
      fileName: (format) => `counterpoint-vis.${format}.js`,
    },
  },
  plugins: [
    dts({
      insertTypesEntry: true,
      include: 'lib/**',
    }),
  ],
});
