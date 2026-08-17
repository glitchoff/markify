import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  base: '/markify/',
  plugins: [react()],
  worker: {
    format: 'es',
  },
  resolve: {
    alias: [
      {
        find: /^@glitchoff\/markify$/,
        replacement: path.resolve(__dirname, '../../src/index.ts'),
      },
      {
        find: /^@glitchoff\/markify\/mermaid$/,
        replacement: path.resolve(__dirname, '../../src/mermaid/index.ts'),
      },
      {
        find: /^@glitchoff\/markify\/chess$/,
        replacement: path.resolve(__dirname, '../../src/chess/index.ts'),
      },
    ],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'mermaid': ['mermaid'],
          'highlight.js': ['highlight.js/lib/core'],
          'katex': ['katex'],
        }
      }
    }
  },
  server: {
    port: 3000,
    host: true,
    fs: {
      allow: [path.resolve(__dirname, '../..')],
    },
  },
});
