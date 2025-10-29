import { defineConfig, devices } from '@playwright/test';
import path from 'path';

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './e2e',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['json', { outputFile: 'playwright-results.json' }],
    ['junit', { outputFile: 'playwright-results.xml' }],
    process.env.CI ? ['github'] : ['list']
  ],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: process.env.BASE_URL || 'http://localhost:5173',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',

    /* Take screenshot on failure */
    screenshot: 'only-on-failure',

    /* Record video on failure */
    video: 'retain-on-failure',

    /* Global timeout for each action */
    actionTimeout: 10000,

    /* Global timeout for navigation */
    navigationTimeout: 30000,

    /* Ignore HTTPS errors for local development */
    ignoreHTTPSErrors: !process.env.CI,

    /* User agent */
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',

    /* Viewport size */
    viewport: { width: 1280, height: 720 },

    /* Geolocation for map testing */
    geolocation: { latitude: 6.2442, longitude: -75.5812 }, // Medellín coordinates
    permissions: ['geolocation'],

    /* Color scheme preference */
    colorScheme: 'light',

    /* Locale */
    locale: 'en-US',

    /* Timezone */
    timezoneId: 'America/Bogota',

    /* Reduced motion for accessibility testing */
    reducedMotion: 'reduce',
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['setup'],
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
      dependencies: ['setup'],
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
      dependencies: ['setup'],
    },

    /* Test against mobile viewports. */
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
      dependencies: ['setup'],
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
      dependencies: ['setup'],
    },

    /* Test against branded browsers. */
    {
      name: 'Microsoft Edge',
      use: { ...devices['Desktop Edge'], channel: 'msedge' },
      dependencies: ['setup'],
    },

    /* Test against dark mode */
    {
      name: 'Dark Mode',
      use: {
        ...devices['Desktop Chrome'],
        colorScheme: 'dark',
        reducedMotion: 'prefer-reduced'
      },
      dependencies: ['setup'],
      testMatch: '**/*.{dark,theme}.spec.ts',
    },

    /* Accessibility testing project */
    {
      name: 'Accessibility',
      use: {
        ...devices['Desktop Chrome'],
        reducedMotion: 'reduce'
      },
      dependencies: ['setup'],
      testMatch: '**/*.{a11y,accessibility}.spec.ts',
      teardown: 'accessibility-teardown',
    },

    /* Performance testing project */
    {
      name: 'Performance',
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: {
          args: [
            '--disable-web-security',
            '--disable-features=TranslateUI',
            '--disable-ipc-flooding-protection',
            '--enable-automation'
          ]
        }
      },
      dependencies: ['setup'],
      testMatch: '**/*.{perf,performance}.spec.ts',
      fullyParallel: false,
      workers: 1,
    },

    /* Global setup for all projects */
    {
      name: 'setup',
      testMatch: '**/global.setup.ts',
    },
  ],

  /* Global setup and teardown */
  globalSetup: require.resolve('./e2e/global.setup.ts'),
  globalTeardown: require.resolve('./e2e/global.teardown.ts'),

  /* Run your local dev server before starting the tests */
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
    stdout: 'ignore',
    stderr: 'pipe',
  },

  /* Test output directory */
  outputDir: 'test-results',

  /* Global test configuration */
  expect: {
    /* Timeout for expect() assertions */
    timeout: 5000,
  },

  /* Test timeout */
  timeout: 60000,

  /* Global test configuration */
  metadata: {
    'Test Environment': process.env.NODE_ENV || 'test',
    'Browser Versions': 'Latest',
    'Test Suite': 'Google Maps Clone E2E Tests'
  }
});