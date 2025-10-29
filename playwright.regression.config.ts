import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e/regression',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: process.env.CI ? 1 : 2,
  reporter: [
    ['html', { outputFolder: 'playwright-regression-report' }],
    ['json', { outputFile: 'regression-results.json' }],
    ['junit', { outputFile: 'regression-results.xml' }],
    ['list']
  ],
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:5173',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 15000,
    navigationTimeout: 30000,
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
      name: 'regression-chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'regression-firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'regression-webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'regression-mobile',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'regression-tablet',
      use: { ...devices['iPad Pro'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
  expect: {
    timeout: 8000,
  },
  timeout: 60000,

  // Focus on regression test patterns
  grep: [
    /regression/,
    /integration/,
    /e2e/
  ],

  // Update screenshots if needed
  updateSnapshots: 'missing',
});