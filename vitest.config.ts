/**
 * Main Vitest Configuration for QuranApp
 *
 * Comprehensive testing configuration with:
 * - jsdom environment for React components
 * - MSW for API mocking
 * - Coverage reporting
 * - Test organization and patterns
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
    mockReset: true,

    // File patterns for test discovery
    include: [
      'src/**/*.{test,spec}.{js,ts,jsx,tsx}',
      'src/tests/**/*.test.{ts,tsx}',
      '!src/tests/enhanced/**',
      '!src/tests/security/**',
    ],

    // Exclude patterns
    exclude: [
      'node_modules',
      'dist',
      'build',
      '.next',
      'coverage',
      'test-results',
      'src/tests/manual/**',
      'src/tests/enhanced/**',
      'src/tests/security/**',
      'docs/**',
    ],

    // Test timeout configuration
    testTimeout: 10000, // 10 seconds
    hookTimeout: 5000, // 5 seconds for setup/teardown

    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './coverage',

      // Include patterns for coverage
      include: [
        'src/**/*.{js,ts,jsx,tsx}',
        'src/components/**/*.{jsx,tsx}',
        'src/stores/**/*.{ts,tsx}',
        'src/hooks/**/*.{ts,tsx}',
        'src/utils/**/*.{ts,tsx}',
        'src/services/**/*.{ts,tsx}',
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
        'src/**/*.stories.{ts,tsx}',
        'src/**/*.config.{ts,js}',
        'node_modules/**',
        'dist/**',
        'coverage/**',
      ],

      // Coverage thresholds
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },

        // Critical components require higher coverage
        'src/components/QuranText.tsx': {
          branches: 90,
          functions: 90,
          lines: 90,
          statements: 90,
        },
        'src/stores/islamicContentQualityStore.ts': {
          branches: 90,
          functions: 90,
          lines: 90,
          statements: 90,
        },
        'src/services/islamicContentValidationGuardian.ts': {
          branches: 95,
          functions: 95,
          lines: 95,
          statements: 95,
        },
      },
    },

    // Reporter configuration
    reporters: ['default', 'json', 'html'],

    // Output configuration
    outputFile: {
      json: './test-results/test-results.json',
      html: './test-results/test-results.html',
    },

    // Test environment variables
    env: {
      VITE_API_BASE_URL: 'https://api.quran.com/api/v4',
      VITE_APP_ENV: 'test',
      VALIDATE_ARABIC_CONTENT: 'true',
      ENFORCE_ISLAMIC_CITATIONS: 'true',
      CHECK_RTL_LAYOUT: 'true',
      VERIFY_CONTENT_AUTHENTICITY: 'true',
    },

    // Performance monitoring
    logHeapUsage: true,

    // Retry configuration for flaky tests
    retry: 2,

    // Parallel execution
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

  // Resolve configuration
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@tests': path.resolve(__dirname, './src/tests'),
      '@components': path.resolve(__dirname, './src/components'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@stores': path.resolve(__dirname, './src/stores'),
      '@services': path.resolve(__dirname, './src/services'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@types': path.resolve(__dirname, './src/types'),
      '@mocks': path.resolve(__dirname, './src/mocks'),
    },
  },

  // Define configuration
  define: {
    __TEST_ENV__: true,
    __ISLAMIC_CONTENT_VALIDATION__: true,
    __RTL_TESTING_ENABLED__: true,
    __ARABIC_FONT_TESTING__: true,
  },
});
