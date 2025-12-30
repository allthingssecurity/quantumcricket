import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(() => ({
  server: { host: '0.0.0.0', port: 5300 },
  // Allow deploying under a subpath on GitHub Pages, e.g. /badminton/
  base: process.env.BASE_PATH || '/',
  plugins: [react()],
  resolve: { alias: { '@': path.resolve(__dirname, '.') } },
}));
