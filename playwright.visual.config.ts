import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e/visual',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1, // Run sequentially for visual consistency
  reporter: [
    ['html', { outputFolder: 'playwright-visual-report' }],
    ['json', { outputFile: 'visual-results.json' }],
    ['line']
  ],
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'off',
    actionTimeout: 10000,
    navigationTimeout: 20000,
    ignoreHTTPSErrors: !process.env.CI,
    viewport: { width: 1280, height: 720 },
    geolocation: { latitude: 6.2442, longitude: -75.5812 },
    permissions: ['geolocation'],
    colorScheme: 'light',
    locale: 'en-US',
    timezoneId: 'America/Bogota',
    reducedMotion: 'reduce',
    // Visual testing specific settings
    deviceScaleFactor: 1,
    hasTouch: false,
    isMobile: false,
  },
  projects: [
    {
      name: 'visual-chromium',
      use: {
        ...devices['Desktop Chrome'],
        // Ensure consistent rendering
        launchOptions: {
          args: [
            '--disable-dev-shm-usage',
            '--disable-gpu',
            '--disable-software-rasterizer',
            '--disable-background-timer-throttling',
            '--disable-backgrounding-occluded-windows',
            '--disable-renderer-backgrounding',
            '--disable-features=TranslateUI',
            '--disable-ipc-flooding-protection'
          ]
        }
      },
    },
    {
      name: 'visual-dark-mode',
      use: {
        ...devices['Desktop Chrome'],
        colorScheme: 'dark',
      },
    },
    {
      name: 'visual-mobile',
      use: {
        ...devices['Pixel 5'],
        deviceScaleFactor: 2,
      },
    },
    {
      name: 'visual-tablet',
      use: {
        ...devices['iPad Pro'],
        deviceScaleFactor: 2,
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
    timeout: 5000,
    // Visual testing-specific expect options
    toHaveScreenshot: {
      threshold: 0.2,
      maxDiffPixels: 1000,
      animationHandling: 'disabled',
    },
  },
  timeout: 45000,

  // Focus on visual test patterns
  grep: [
    /visual/,
    /screenshot/,
    /screenshot/
  ],

  // Visual testing configuration
  updateSnapshots: process.env.CI ? 'missing' : 'all',
});