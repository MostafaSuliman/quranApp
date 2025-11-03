/**
 * Vitest Configuration for QuranApp Testing
 *
 * Optimized configuration for Islamic content testing with proper
 * environment setup, coverage reporting, and test organization.
 */

import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    // Test environment configuration
    environment: 'jsdom',
    setupFiles: ['./src/tests/test-setup.ts'],

    // Global test configuration
    globals: true,
    clearMocks: true,
    restoreMocks: true,

    // File patterns for test discovery
    include: [
      'src/tests/**/*.{test,spec}.{js,ts,jsx,tsx}',
      'src/tests/unit/**/*.test.{ts,tsx}',
      'src/tests/integration/**/*.test.{ts,tsx}',
      'src/tests/regression/**/*.test.{ts,tsx}',
    ],

    // Exclude patterns
    exclude: [
      'node_modules',
      'dist',
      'build',
      '.next',
      'src/tests/manual/**',
      'docs/testing/**',
    ],

    // Test timeout configuration
    testTimeout: 10000, // 10 seconds for integration tests
    hookTimeout: 5000, // 5 seconds for setup/teardown

    // Coverage configuration for Islamic content testing
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './coverage',

      // Include patterns for coverage
      include: [
        'src/**/*.{js,ts,jsx,tsx}',
        '!src/**/*.d.ts',
        '!src/tests/**',
        '!src/vite-env.d.ts',
      ],

      // Exclude from coverage
      exclude: [
        'src/tests/**',
        'src/**/*.test.{ts,tsx}',
        'src/**/*.spec.{ts,tsx}',
        'src/main.tsx',
        'src/vite-env.d.ts',
        'node_modules/**',
        'dist/**',
      ],

      // Coverage thresholds for quality assurance
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },

        // Specific thresholds for Islamic content components
        'src/components/QuranText.tsx': {
          branches: 90,
          functions: 90,
          lines: 90,
          statements: 90,
        },
        'src/components/AyahDisplay.tsx': {
          branches: 90,
          functions: 90,
          lines: 90,
          statements: 90,
        },
        'src/utils/quranApi.ts': {
          branches: 85,
          functions: 85,
          lines: 85,
          statements: 85,
        },
      },
    },

    // Reporter configuration
    reporter: [
      'default',
      'json',
      'html',
    ],

    // Output configuration
    outputFile: {
      json: './test-results/test-results.json',
      html: './test-results/test-results.html',
    },

    // Test categorization for better organization
    env: {
      // Test environment variables
      VITE_API_BASE_URL: 'https://api.quran.com/api/v4',
      VITE_APP_ENV: 'test',

      // Islamic content testing flags
      VALIDATE_ARABIC_CONTENT: 'true',
      ENFORCE_ISLAMIC_CITATIONS: 'true',
      CHECK_RTL_LAYOUT: 'true',
      VERIFY_CONTENT_AUTHENTICITY: 'true',
    },

    // Performance monitoring during tests
    logHeapUsage: true,

    // Retry configuration for flaky tests
    retry: 2,

    // Parallel execution configuration
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: false,
        isolate: true,
        useAtomics: true,
      },
    },

    // Watch mode configuration
    watch: {
      ignore: [
        'node_modules/**',
        'dist/**',
        'coverage/**',
        'test-results/**',
        'docs/**',
      ],
    },

    // Snapshot configuration
    snapshotFormat: {
      escapeString: false,
      printBasicPrototype: false,
    },
  },

  // Resolve configuration for test imports
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@tests': path.resolve(__dirname, './src/tests'),
      '@components': path.resolve(__dirname, './src/components'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@stores': path.resolve(__dirname, './src/stores'),
      '@types': path.resolve(__dirname, './src/types'),
    },
  },

  // Define configuration for test-specific globals
  define: {
    __TEST_ENV__: true,
    __ISLAMIC_CONTENT_VALIDATION__: true,
    __RTL_TESTING_ENABLED__: true,
    __ARABIC_FONT_TESTING__: true,
  },
});
