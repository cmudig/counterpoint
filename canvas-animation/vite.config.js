import path from 'path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

module.exports = defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, 'lib/main.ts'),
      name: 'canvas-animation',
      fileName: (format) => `canvas-animation.${format}.js`,
      formats: ['cjs', 'es', 'umd'],
    },
  },
  plugins: [
    dts({
      insertTypesEntry: true,
      include: 'lib/**',
    }),
  ],
});
