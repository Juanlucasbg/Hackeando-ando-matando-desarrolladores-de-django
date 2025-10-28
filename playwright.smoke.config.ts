import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e/smoke',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : 4,
  reporter: [
    ['html', { outputFolder: 'playwright-smoke-report' }],
    ['json', { outputFile: 'smoke-results.json' }],
    ['junit', { outputFile: 'smoke-results.xml' }],
    ['line']
  ],
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'off', // Disable video for smoke tests to speed them up
    actionTimeout: 8000,
    navigationTimeout: 15000,
    ignoreHTTPSErrors: !process.env.CI,
    viewport: { width: 1280, height: 720 },
    geolocation: { latitude: 6.2442, longitude: -75.5812 },
    permissions: ['geolocation'],
    colorScheme: 'light',
    locale: 'en-US',
    timezoneId: 'America/Bogota',
    reducedMotion: 'reduce',
  },
  projects: [
    {
      name: 'smoke-chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'smoke-mobile',
      use: { ...devices['Pixel 5'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 60 * 1000,
  },
  expect: {
    timeout: 5000,
  },
  timeout: 30000, // Shorter timeout for smoke tests

  // Test grep patterns to focus on critical functionality
  grepInvert: [
    /performance/,
    /load/,
    /stress/,
    /integration/,
    /regression/
  ],
  grep: [
    /smoke/,
    /critical/,
    /core/
  ]
});