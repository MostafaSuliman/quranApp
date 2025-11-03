import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright Configuration for QuranApp E2E Testing
 * Comprehensive testing across browsers, devices, and scenarios
 */

export default defineConfig({
  // Test directory
  testDir: './tests/e2e',

  // Folder for test artifacts
  outputDir: './test-results',

  // Run tests in files in parallel
  fullyParallel: true,

  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,

  // Retry on CI only
  retries: process.env.CI ? 2 : 0,

  // Opt out of parallel tests on CI
  workers: process.env.CI ? 1 : undefined,

  // Global setup and teardown
  globalSetup: require.resolve('./tests/e2e/global-setup.ts'),
  globalTeardown: require.resolve('./tests/e2e/global-teardown.ts'),

  // Reporter configuration
  reporter: [
    ['html', { outputFolder: './playwright-report' }],
    ['json', { outputFile: './test-results/results.json' }],
    ['junit', { outputFile: './test-results/results.xml' }],
    ['github'], // GitHub Actions annotations
    ['list'],
    ['allure-playwright', {
      outputFolder: './allure-results',
      environmentInfo: {
        Framework: 'React',
        Language: 'TypeScript',
        App: 'QuranApp',
        Environment: process.env.NODE_ENV || 'test',
      },
    }],
  ],

  // Configure global test settings
  use: {
    // Base URL for the app
    baseURL: process.env.BASE_URL || 'http://localhost:5173',

    // Take screenshot on failure
    screenshot: 'only-on-failure',

    // Record video on failure
    video: 'retain-on-failure',

    // Record traces on failure
    trace: 'retain-on-failure',

    // Global timeout for actions
    actionTimeout: 30000,

    // Global timeout for navigation
    navigationTimeout: 30000,

    // Ignore HTTPS errors
    ignoreHTTPSErrors: true,

    // Accept downloads
    acceptDownloads: true,

    // Locale for testing
    locale: 'en-US',

    // Timezone
    timezoneId: 'UTC',

    // Color scheme
    colorScheme: 'light',

    // Emulate prefers-reduced-motion
    reducedMotion: 'reduce',

    // Force prefers-color-scheme
    forcedColors: 'none',
  },

  // Test timeout
  timeout: 60000,

  // Expect timeout
  expect: {
    // Timeout for expect() assertions
    timeout: 10000,

    // Configure image comparison threshold
    threshold: 0.2,

    // Configure screenshot comparison mode
    mode: 'default',
  },

  // Configure projects for major browsers and devices
  projects: [
    // Setup project - runs first to prepare test environment
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
      teardown: 'cleanup',
    },

    // Cleanup project - runs after all tests
    {
      name: 'cleanup',
      testMatch: /.*\.teardown\.ts/,
    },

    // Desktop Browsers
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 },
        // Additional Chrome-specific settings
        channel: 'chrome',
        launchOptions: {
          args: [
            '--disable-web-security',
            '--disable-features=VizDisplayCompositor',
            '--enable-precise-memory-info',
            '--enable-logging',
            '--log-level=0',
          ],
        },
      },
      dependencies: ['setup'],
    },

    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
        viewport: { width: 1920, height: 1080 },
        // Firefox-specific settings
        launchOptions: {
          firefoxUserPrefs: {
            'media.navigator.streams.fake': true,
            'media.navigator.permission.disabled': true,
            'permissions.default.microphone': 1,
            'permissions.default.camera': 1,
          },
        },
      },
      dependencies: ['setup'],
    },

    {
      name: 'webkit',
      use: {
        ...devices['Desktop Safari'],
        viewport: { width: 1920, height: 1080 },
      },
      dependencies: ['setup'],
    },

    {
      name: 'edge',
      use: {
        ...devices['Desktop Edge'],
        viewport: { width: 1920, height: 1080 },
        channel: 'msedge',
      },
      dependencies: ['setup'],
    },

    // Mobile devices
    {
      name: 'Mobile Chrome',
      use: {
        ...devices['Pixel 5'],
        // Additional mobile settings
        hasTouch: true,
        isMobile: true,
        deviceScaleFactor: 3,
      },
      dependencies: ['setup'],
    },

    {
      name: 'Mobile Safari',
      use: {
        ...devices['iPhone 12'],
        // iOS-specific settings
        hasTouch: true,
        isMobile: true,
        deviceScaleFactor: 3,
      },
      dependencies: ['setup'],
    },

    {
      name: 'Samsung Galaxy',
      use: {
        ...devices['Galaxy S9+'],
        hasTouch: true,
        isMobile: true,
        deviceScaleFactor: 4,
      },
      dependencies: ['setup'],
    },

    // Tablet devices
    {
      name: 'iPad',
      use: {
        ...devices['iPad Pro'],
        hasTouch: true,
        isMobile: false, // iPad is not considered mobile for layout purposes
        deviceScaleFactor: 2,
      },
      dependencies: ['setup'],
    },

    // Dark mode testing
    {
      name: 'Dark Mode - Chrome',
      use: {
        ...devices['Desktop Chrome'],
        colorScheme: 'dark',
        viewport: { width: 1920, height: 1080 },
      },
      dependencies: ['setup'],
    },

    // RTL testing for Arabic content
    {
      name: 'RTL - Arabic',
      use: {
        ...devices['Desktop Chrome'],
        locale: 'ar-SA',
        viewport: { width: 1920, height: 1080 },
        // Set document direction to RTL
        extraHTTPHeaders: {
          'Accept-Language': 'ar-SA,ar;q=0.9',
        },
      },
      dependencies: ['setup'],
    },

    // Accessibility testing
    {
      name: 'Accessibility',
      use: {
        ...devices['Desktop Chrome'],
        reducedMotion: 'reduce',
        forcedColors: 'active', // High contrast mode
        viewport: { width: 1920, height: 1080 },
      },
      dependencies: ['setup'],
    },

    // Performance testing
    {
      name: 'Performance',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 },
        // Throttle CPU and network for performance testing
        launchOptions: {
          args: [
            '--enable-precise-memory-info',
            '--memory-pressure-off',
            '--disable-background-timer-throttling',
            '--disable-backgrounding-occluded-windows',
            '--disable-renderer-backgrounding',
          ],
        },
      },
      dependencies: ['setup'],
    },

    // Offline testing
    {
      name: 'Offline',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 },
        // Will be configured in individual tests to go offline
      },
      dependencies: ['setup'],
    },

    // PWA testing
    {
      name: 'PWA',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 },
        launchOptions: {
          args: [
            '--enable-features=WebAppInstalls',
            '--disable-web-security',
          ],
        },
      },
      dependencies: ['setup'],
    },
  ],

  // Configure local dev server
  webServer: {
    command: process.env.CI ? 'npm run preview' : 'npm run dev',
    url: 'http://127.0.0.1:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
    env: {
      NODE_ENV: 'test',
    },
  },
});
