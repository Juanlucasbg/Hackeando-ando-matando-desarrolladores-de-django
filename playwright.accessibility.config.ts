import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e/accessibility',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 3 : 1,
  workers: 1, // Run sequentially for consistent accessibility testing
  reporter: [
    ['html', { outputFolder: 'playwright-accessibility-report' }],
    ['json', { outputFile: 'accessibility-results.json' }],
    ['list']
  ],
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:5173',
    trace: 'on-first-retry',
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
    // Accessibility-specific settings
    reducedMotion: 'reduce',
    forcedColors: 'none',
    // High contrast mode testing
  },
  projects: [
    {
      name: 'accessibility-chromium',
      use: {
        ...devices['Desktop Chrome'],
        // Enable accessibility testing features
        bypassCSP: true
      },
    },
    {
      name: 'accessibility-firefox',
      use: {
        ...devices['Desktop Firefox'],
      },
    },
    {
      name: 'accessibility-webkit',
      use: {
        ...devices['Desktop Safari'],
      },
    },
    {
      name: 'high-contrast',
      use: {
        ...devices['Desktop Chrome'],
        forcedColors: 'active',
        colorScheme: 'light',
      },
    },
    {
      name: 'screen-reader',
      use: {
        ...devices['Desktop Chrome'],
        // Simulate screen reader environment
        reducedMotion: 'reduce',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 NVDA',
      },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
  expect: {
    timeout: 10000,
  },
  timeout: 90000, // Longer timeout for accessibility tests
});