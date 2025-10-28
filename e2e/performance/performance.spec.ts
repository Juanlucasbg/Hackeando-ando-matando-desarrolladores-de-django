import { test, expect } from '@playwright/test'
import { performance } from 'perf_hooks'

test.describe('Performance Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Enable performance monitoring
    await page.goto('/')
    await page.waitForSelector('[data-testid="map-container"]', { timeout: 15000 })
  })

  test('should load initial page within performance budget', async ({ page }) => {
    const startTime = performance.now()
    await page.goto('/')
    await page.waitForSelector('[data-testid="map-container"]')
    const loadTime = performance.now() - startTime

    // Page should load within 3 seconds
    expect(loadTime).toBeLessThan(3000)

    // Check Core Web Vitals
    const vitals = await page.evaluate(() => {
      return new Promise((resolve) => {
        const vitals: any = {}

        // LCP (Largest Contentful Paint)
        new PerformanceObserver((list) => {
          const entries = list.getEntries()
          const lastEntry = entries[entries.length - 1]
          vitals.lcp = lastEntry.startTime
        }).observe({ entryTypes: ['largest-contentful-paint'] })

        // FID (First Input Delay)
        new PerformanceObserver((list) => {
          const entries = list.getEntries()
          vitals.fid = entries[0].processingStart - entries[0].startTime
        }).observe({ entryTypes: ['first-input'] })

        // CLS (Cumulative Layout Shift)
        let clsValue = 0
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!(entry as any).hadRecentInput) {
              clsValue += (entry as any).value
            }
          }
          vitals.cls = clsValue
        }).observe({ entryTypes: ['layout-shift'] })

        // Resolve after a short delay to capture metrics
        setTimeout(() => resolve(vitals), 2000)
      })
    })

    // Verify performance metrics
    expect(vitals.lcp).toBeLessThan(2500) // LCP should be under 2.5s
    expect(vitals.fid).toBeLessThan(100) // FID should be under 100ms
    expect(vitals.cls).toBeLessThan(0.1) // CLS should be under 0.1
  })

  test('should handle rapid search queries efficiently', async ({ page }) => {
    const startTime = performance.now()

    // Perform 10 rapid searches
    for (let i = 0; i < 10; i++) {
      await page.fill('[data-testid="search-input"]', `Test location ${i}`)
      await page.keyboard.press('Enter')
      await page.waitForTimeout(100) // Small delay to simulate typing
    }

    const searchTime = performance.now() - startTime

    // All searches should complete within 5 seconds
    expect(searchTime).toBeLessThan(5000)

    // Check for memory leaks
    const memoryUsage = await page.evaluate(() => {
      return (performance as any).memory?.usedJSHeapSize || 0
    })

    // Memory usage should be reasonable (less than 100MB)
    expect(memoryUsage).toBeLessThan(100 * 1024 * 1024)
  })

  test('should render map zoom operations smoothly', async ({ page }) => {
    const frameRates: number[] = []

    // Monitor frame rate during zoom operations
    await page.evaluateOnNewDocument(() => {
      let lastTime = performance.now()
      let frames = 0

      function measureFrameRate() {
        frames++
        const currentTime = performance.now()
        if (currentTime - lastTime >= 1000) {
          window.frameRate = frames
          frames = 0
          lastTime = currentTime
        }
        requestAnimationFrame(measureFrameRate)
      }

      requestAnimationFrame(measureFrameRate)
    })

    // Perform multiple zoom operations
    for (let i = 0; i < 20; i++) {
      await page.click('[data-testid="zoom-in"]')
      await page.waitForTimeout(50)

      const frameRate = await page.evaluate(() => (window as any).frameRate || 60)
      frameRates.push(frameRate)

      await page.click('[data-testid="zoom-out"]')
      await page.waitForTimeout(50)
    }

    // Average frame rate should be above 30 FPS
    const averageFrameRate = frameRates.reduce((a, b) => a + b, 0) / frameRates.length
    expect(averageFrameRate).toBeGreaterThan(30)
  })

  test('should handle large number of markers efficiently', async ({ page }) => {
    const startTime = performance.now()

    // Simulate adding many markers
    await page.evaluate(() => {
      // Add 100 markers to test performance
      for (let i = 0; i < 100; i++) {
        const marker = document.createElement('div')
        marker.setAttribute('data-testid', 'map-marker')
        marker.style.position = 'absolute'
        marker.style.left = `${Math.random() * 1000}px`
        marker.style.top = `${Math.random() * 800}px`
        marker.textContent = `Marker ${i}`
        document.querySelector('[data-testid="map-container"]')?.appendChild(marker)
      }
    })

    const renderTime = performance.now() - startTime

    // Should render 100 markers within 1 second
    expect(renderTime).toBeLessThan(1000)

    // Check that all markers are visible
    const markerCount = await page.locator('[data-testid="map-marker"]').count()
    expect(markerCount).toBe(100)

    // Test interaction performance with many markers
    const interactionStart = performance.now()
    await page.click('[data-testid="map-marker"]:first-child')
    const interactionTime = performance.now() - interactionStart

    // Click interaction should be fast
    expect(interactionTime).toBeLessThan(100)
  })

  test('should maintain performance with route calculations', async ({ page }) => {
    const routeCalculationTimes: number[] = []

    // Calculate multiple routes
    for (let i = 0; i < 5; i++) {
      const startTime = performance.now()

      // Set origin and destination
      await page.fill('[data-testid="origin-input"]', `Origin ${i}`)
      await page.fill('[data-testid="destination-input']', `Destination ${i}`)

      // Plan route
      await page.click('[data-testid="plan-route-button"]')
      await page.waitForSelector('[data-testid="route-results"]', { timeout: 10000 })

      const calculationTime = performance.now() - startTime
      routeCalculationTimes.push(calculationTime)

      // Clear route for next iteration
      await page.click('[data-testid="clear-route"]')
    }

    // Route calculations should be fast (under 2 seconds average)
    const averageCalculationTime = routeCalculationTimes.reduce((a, b) => a + b, 0) / routeCalculationTimes.length
    expect(averageCalculationTime).toBeLessThan(2000)
  })

  test('should handle memory pressure during extended use', async ({ page }) => {
    const memorySnapshots: number[] = []

    // Simulate extended use (5 minutes of activity)
    for (let cycle = 0; cycle < 10; cycle++) {
      // Perform various operations
      await page.fill('[data-testid="search-input"]', `Test search ${cycle}`)
      await page.keyboard.press('Enter')
      await page.waitForTimeout(500)

      await page.click('[data-testid="zoom-in"]')
      await page.waitForTimeout(200)

      await page.click('[data-testid="map-type-selector"]')
      await page.click('[data-testid="map-type-satellite"]')
      await page.waitForTimeout(200)

      await page.click('[data-testid="map-type-selector"]')
      await page.click('[data-testid="map-type-roadmap"]')
      await page.waitForTimeout(200)

      // Take memory snapshot
      const memoryUsage = await page.evaluate(() => {
        return (performance as any).memory?.usedJSHeapSize || 0
      })
      memorySnapshots.push(memoryUsage)
    }

    // Memory should not grow excessively (less than 50MB growth)
    const memoryGrowth = memorySnapshots[memorySnapshots.length - 1] - memorySnapshots[0]
    expect(memoryGrowth).toBeLessThan(50 * 1024 * 1024)

    // Memory should be stable (no major spikes)
    const maxMemory = Math.max(...memorySnapshots)
    const minMemory = Math.min(...memorySnapshots)
    const memoryVariation = maxMemory - minMemory
    expect(memoryVariation).toBeLessThan(20 * 1024 * 1024) // Less than 20MB variation
  })

  test('should load external resources efficiently', async ({ page }) => {
    const resourceTiming: any[] = []

    // Monitor resource loading
    page.on('response', async (response) => {
      const url = response.url()
      if (url.includes('maps.googleapis.com') || url.includes('maps.gstatic.com')) {
        const timing = await response.timing()
        resourceTiming.push({
          url,
          duration: timing?.responseEnd - timing?.requestStart || 0,
          size: timing?.transferSize || 0
        })
      }
    })

    // Trigger map loading
    await page.reload()
    await page.waitForSelector('[data-testid="map-container"]')

    // External resources should load quickly
    const mapResources = resourceTiming.filter(r => r.url.includes('maps.googleapis.com'))
    const averageLoadTime = mapResources.reduce((sum, r) => sum + r.duration, 0) / mapResources.length

    expect(averageLoadTime).toBeLessThan(1000) // Under 1 second average

    // Total resource size should be reasonable
    const totalSize = resourceTiming.reduce((sum, r) => sum + r.size, 0)
    expect(totalSize).toBeLessThan(5 * 1024 * 1024) // Less than 5MB
  })

  test('should maintain responsive UI during heavy operations', async ({ page }) => {
    const interactionResponseTimes: number[] = []

    // Start a heavy operation in background
    const heavyOperation = page.evaluate(() => {
      return new Promise(resolve => {
        // Simulate heavy computation
        setTimeout(() => {
          let sum = 0
          for (let i = 0; i < 1000000; i++) {
            sum += Math.random()
          }
          resolve(sum)
        }, 3000)
      })
    })

    // Test UI responsiveness during heavy operation
    for (let i = 0; i < 10; i++) {
      const startTime = performance.now()

      await page.click('[data-testid="zoom-in"]')
      await page.waitForSelector('[data-testid="zoom-in"]', { state: 'visible' })

      const responseTime = performance.now() - startTime
      interactionResponseTimes.push(responseTime)

      await page.waitForTimeout(200)
    }

    // UI should remain responsive (interactions under 100ms)
    const averageResponseTime = interactionResponseTimes.reduce((a, b) => a + b, 0) / interactionResponseTimes.length
    expect(averageResponseTime).toBeLessThan(100)

    // Wait for heavy operation to complete
    await heavyOperation
  })

  test('should handle concurrent operations efficiently', async ({ page }) => {
    const startTime = performance.now()

    // Start multiple concurrent operations
    const operations = [
      page.fill('[data-testid="search-input"]', 'Concurrent search 1'),
      page.click('[data-testid="zoom-in"]'),
      page.click('[data-testid="layer-traffic"]'),
      page.fill('[data-testid="origin-input"]', 'Concurrent origin'),
      page.fill('[data-testid="destination-input"]', 'Concurrent destination')
    ]

    await Promise.all(operations)

    const concurrentTime = performance.now() - startTime

    // Concurrent operations should complete efficiently
    expect(concurrentTime).toBeLessThan(2000)

    // All operations should complete successfully
    await expect(page.locator('[data-testid="search-input"]')).toHaveValue('Concurrent search 1')
    await expect(page.locator('[data-testid="origin-input"]')).toHaveValue('Concurrent origin')
    await expect(page.locator('[data-testid="destination-input"]')).toHaveValue('Concurrent destination')
  })

  test('should optimize bundle size and loading', async ({ page }) => {
    // Monitor JavaScript bundle loading
    const bundleTiming: any[] = []

    page.on('response', async (response) => {
      const url = response.url()
      if (url.endsWith('.js') || url.endsWith('.css')) {
        const timing = await response.timing()
        bundleTiming.push({
          url,
          duration: timing?.responseEnd - timing?.requestStart || 0,
          size: timing?.transferSize || 0
        })
      }
    })

    await page.goto('/')
    await page.waitForSelector('[data-testid="map-container"]')

    // Calculate total bundle size
    const totalBundleSize = bundleTiming.reduce((sum, bundle) => sum + bundle.size, 0)

    // Bundle should be optimized (less than 2MB total)
    expect(totalBundleSize).toBeLessThan(2 * 1024 * 1024)

    // Critical bundles should load quickly
    const criticalBundles = bundleTiming.filter(b => b.url.includes('main') || b.url.includes('vendor'))
    const averageCriticalLoadTime = criticalBundles.reduce((sum, b) => sum + b.duration, 0) / criticalBundles.length

    expect(averageCriticalLoadTime).toBeLessThan(500)
  })
})