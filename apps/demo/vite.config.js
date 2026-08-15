import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  base: '/markify/',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@glitchoff/markify': path.resolve(__dirname, '../../src/index.ts'),
    },
  },
  server: {
    port: 3000,
    host: true,
  },
});
