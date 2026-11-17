/// <reference types="vitest" />
import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// GitHub Pages serve o site em /Coliseu-das-IAs/. Em outro host, defina COLISEU_BASE.
const base = process.env.COLISEU_BASE ?? '/Coliseu-das-IAs/';

export default defineConfig({
  base,
  plugins: [react()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.test.{ts,tsx}'],
  },
});
