/**
 * Enhanced Vitest Configuration
 *
 * Configuration for running enhanced test suites with Islamic content validation,
 * performance monitoring, and comprehensive reporting.
 */

import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    // Enhanced test environment configuration
    environment: 'jsdom',
    setupFiles: [
      './src/tests/test-setup.ts',
      './src/tests/enhanced/enhanced-test-setup.ts',
    ],

    // Global test configuration with enhanced timeouts
    globals: true,
    clearMocks: true,
    restoreMocks: true,

    // Enhanced file patterns for comprehensive test discovery
    include: [
      'src/tests/**/*.{test,spec}.{js,ts,jsx,tsx}',
      'src/tests/enhanced/**/*.test.{ts,tsx}',
      'src/tests/unit/**/*.test.{ts,tsx}',
      'src/tests/integration/**/*.test.{ts,tsx}',
      'src/tests/regression/**/*.test.{ts,tsx}',
      'src/tests/end-to-end/**/*.test.{ts,tsx}',
    ],

    // Exclude patterns
    exclude: [
      'node_modules',
      'dist',
      'build',
      '.next',
      'src/tests/manual/**',
      'docs/testing/**',
      'coverage/**',
      'test-results/**',
    ],

    // Enhanced timeout configuration for comprehensive tests
    testTimeout: 30000, // 30 seconds for enhanced tests
    hookTimeout: 10000, // 10 seconds for setup/teardown

    // Enhanced coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov', 'clover'],
      reportsDirectory: './coverage/enhanced',

      // Enhanced include patterns
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

      // Enhanced exclude patterns
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

      // Enhanced coverage thresholds
      thresholds: {
        global: {
          branches: 85,
          functions: 85,
          lines: 85,
          statements: 85,
        },

        // Enhanced thresholds for Islamic content components
        'src/components/QuranText.tsx': {
          branches: 95,
          functions: 95,
          lines: 95,
          statements: 95,
        },
        'src/components/AyahDisplay.tsx': {
          branches: 95,
          functions: 95,
          lines: 95,
          statements: 95,
        },
        'src/components/AudioPlayer.tsx': {
          branches: 90,
          functions: 90,
          lines: 90,
          statements: 90,
        },
        'src/utils/quranApi.ts': {
          branches: 90,
          functions: 90,
          lines: 90,
          statements: 90,
        },
        'src/stores/islamicContentQualityStore.ts': {
          branches: 95,
          functions: 95,
          lines: 95,
          statements: 95,
        },
        'src/services/islamicContentValidationGuardian.ts': {
          branches: 100,
          functions: 100,
          lines: 100,
          statements: 100,
        },
      },
    },

    // Enhanced reporter configuration
    reporter: [
      'default',
      'json',
      'html',
      'verbose',
      'github-actions',
    ],

    // Enhanced output configuration
    outputFile: {
      json: './test-results/enhanced/vitest-results.json',
      html: './test-results/enhanced/vitest-results.html',
    },

    // Enhanced test categorization and environment variables
    env: {
      // Standard test environment variables
      VITE_API_BASE_URL: 'https://api.quran.com/api/v4',
      VITE_APP_ENV: 'test',

      // Enhanced Islamic content testing flags
      VALIDATE_ARABIC_CONTENT: 'true',
      ENFORCE_ISLAMIC_CITATIONS: 'true',
      CHECK_RTL_LAYOUT: 'true',
      VERIFY_CONTENT_AUTHENTICITY: 'true',
      ENABLE_DIACRITICS_VALIDATION: 'true',

      // Enhanced accessibility testing flags
      ENFORCE_WCAG_AA: 'true',
      CHECK_ARABIC_ACCESSIBILITY: 'true',
      VALIDATE_SCREEN_READER_SUPPORT: 'true',

      // Enhanced performance testing flags
      ENABLE_MEMORY_MONITORING: 'true',
      TRACK_PERFORMANCE_METRICS: 'true',
      ENABLE_STRESS_TESTING: 'true',

      // Enhanced compatibility testing flags
      TEST_CROSS_BROWSER: 'true',
      TEST_MOBILE_OPTIMIZATION: 'true',
      VALIDATE_RTL_SUPPORT: 'true',

      // Enhanced security testing flags
      ENABLE_SECURITY_SCANNING: 'true',
      VALIDATE_INPUT_SANITIZATION: 'true',
      CHECK_XSS_PROTECTION: 'true',
    },

    // Enhanced performance monitoring during tests
    logHeapUsage: true,

    // Enhanced retry configuration for flaky tests
    retry: 3,

    // Enhanced parallel execution configuration
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: false,
        isolate: true,
        useAtomics: true,
        maxThreads: 4,
        minThreads: 2,
      },
    },

    // Enhanced watch mode configuration
    watch: {
      ignore: [
        'node_modules/**',
        'dist/**',
        'coverage/**',
        'test-results/**',
        'docs/**',
        '.git/**',
      ],
    },

    // Enhanced snapshot configuration
    snapshotFormat: {
      escapeString: false,
      printBasicPrototype: false,
      callToJSON: true,
    },

    // Enhanced test sequence configuration
    sequence: {
      shuffle: false,
      concurrent: true,
      setupFiles: 'parallel',
    },

    // Enhanced mock configuration
    mockReset: true,
    clearMocks: true,
    restoreMocks: true,

    // Enhanced benchmark configuration
    benchmark: {
      include: ['src/tests/enhanced/**/*.bench.{ts,tsx}'],
      exclude: ['node_modules/**'],
      reporters: ['default', 'json'],
      outputFile: './test-results/enhanced/benchmark-results.json',
    },
  },

  // Enhanced resolve configuration for test imports
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '../../'),
      '@tests': path.resolve(__dirname, '../'),
      '@enhanced': path.resolve(__dirname, './'),
      '@components': path.resolve(__dirname, '../../components'),
      '@utils': path.resolve(__dirname, '../../utils'),
      '@stores': path.resolve(__dirname, '../../stores'),
      '@services': path.resolve(__dirname, '../../services'),
      '@hooks': path.resolve(__dirname, '../../hooks'),
      '@types': path.resolve(__dirname, '../../types'),
      '@assets': path.resolve(__dirname, '../../assets'),
    },
  },

  // Enhanced define configuration for test-specific globals
  define: {
    __TEST_ENV__: true,
    __ENHANCED_TESTING__: true,
    __ISLAMIC_CONTENT_VALIDATION__: true,
    __RTL_TESTING_ENABLED__: true,
    __ARABIC_FONT_TESTING__: true,
    __PERFORMANCE_MONITORING__: true,
    __ACCESSIBILITY_TESTING__: true,
    __CROSS_BROWSER_TESTING__: true,
    __MOBILE_TESTING__: true,
    __SECURITY_TESTING__: true,
  },

  // Enhanced build configuration for tests
  build: {
    target: 'node14',
    lib: {
      entry: './src/tests/enhanced/index.ts',
      name: 'QuranAppEnhancedTests',
      formats: ['es', 'cjs'],
    },
  },
});
