import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  base: '/markify/',
  plugins: [react()],
  resolve: {
    alias: {
      'markify': path.resolve(__dirname, '../../packages/markify/src/index.jsx'),
    },
  },
  server: {
    port: 3000,
    host: true,
  },
});
