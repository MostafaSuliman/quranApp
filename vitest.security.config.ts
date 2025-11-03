/**
 * Vitest Configuration for Security Tests
 */

import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./src/tests/security/vitest.setup.ts'],
    include: ['./src/tests/security/**/*.test.ts'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      include: ['src/security/**/*.ts'],
      exclude: ['src/security/index.ts'],
    },
    testTimeout: 10000,
    hookTimeout: 10000,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@/security': resolve(__dirname, './src/security'),
    },
  },
});
