import { chromium, FullConfig } from '@playwright/test'
import path from 'path'

async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting global Playwright setup...')

  // Set up browser for pre-warming
  const browser = await chromium.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--disable-software-rasterizer',
      '--disable-background-timer-throttling',
      '--disable-backgrounding-occluded-windows',
      '--disable-renderer-backgrounding',
      '--disable-features=TranslateUI',
      '--disable-ipc-flooding-protection'
    ]
  })

  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
    permissions: ['geolocation'],
    geolocation: { latitude: 6.2442, longitude: -75.5812 }, // Medellín coordinates
    locale: 'en-US',
    timezoneId: 'America/Bogota',
  })

  const page = await context.newPage()

  try {
    // Pre-warm the application
    console.log('🔄 Pre-warming application...')

    // Wait for application to be ready
    await page.goto(process.env.BASE_URL || 'http://localhost:5173', {
      waitUntil: 'networkidle',
      timeout: 30000
    })

    // Wait for critical elements to load
    await page.waitForSelector('[data-testid="map-container"]', {
      state: 'visible',
      timeout: 15000
    })

    await page.waitForSelector('[data-testid="search-bar"]', {
      state: 'visible',
      timeout: 10000
    })

    // Check if Google Maps API loaded
    await page.waitForFunction(() => {
      return typeof window.google !== 'undefined' && window.google.maps
    }, { timeout: 20000 })

    console.log('✅ Application pre-warmed successfully')

    // Take screenshot for visual verification
    await page.screenshot({
      path: path.join(config.projects?.[0]?.outputDir || 'test-results', 'setup-screenshot.png'),
      fullPage: true
    })

    // Store performance metrics
    const performanceMetrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      const paint = performance.getEntriesByType('paint')

      return {
        loadTime: navigation.loadEventEnd - navigation.navigationStart,
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.navigationStart,
        firstPaint: paint.find(p => p.name === 'first-paint')?.startTime || 0,
        firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0,
        memoryUsage: (performance as any).memory?.usedJSHeapSize || 0
      }
    })

    console.log('📊 Performance metrics:', performanceMetrics)

    // Store metrics for later analysis
    await context.addInitScript(() => {
      window.testMetrics = performanceMetrics
    })

    // Set up global error handlers
    page.on('pageerror', (error) => {
      console.error('🚨 Page error during setup:', error.message)
    })

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        console.error('🚨 Console error during setup:', msg.text())
      }
    })

    // Cache authentication or session data if needed
    const cookies = await context.cookies()
    if (cookies.length > 0) {
      console.log('🍪 Session cookies cached:', cookies.length)
    }

    // Store browser context state for reuse
    const storageState = await context.storageState()
    await context.storageState(storageState)

    console.log('💾 Browser state saved')

  } catch (error) {
    console.error('❌ Global setup failed:', error)
    throw error
  } finally {
    await context.close()
    await browser.close()
  }

  // Set up global test data or fixtures
  console.log('🔧 Setting up test fixtures...')

  // Create test data directory if it doesn't exist
  const fs = require('fs')
  const testDir = path.join(process.cwd(), 'test-data')

  if (!fs.existsSync(testDir)) {
    fs.mkdirSync(testDir, { recursive: true })
  }

  // Store test configuration
  const testConfig = {
    baseUrl: process.env.BASE_URL || 'http://localhost:5173',
    testTimeout: 30000,
    viewport: { width: 1280, height: 720 },
    userAgent: 'Playwright Test Runner',
    timestamp: new Date().toISOString()
  }

  fs.writeFileSync(
    path.join(testDir, 'test-config.json'),
    JSON.stringify(testConfig, null, 2)
  )

  console.log('✅ Global setup completed successfully')
}

export default globalSetup