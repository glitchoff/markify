import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  base: '/markify/',
  plugins: [react()],
  resolve: {
    alias: [
      {
        find: /^@glitchoff\/markify$/,
        replacement: path.resolve(__dirname, '../../src/index.ts'),
      },
    ],
  },
  server: {
    port: 3000,
    host: true,
    fs: {
      allow: [path.resolve(__dirname, '../..')],
    },
  },
});
