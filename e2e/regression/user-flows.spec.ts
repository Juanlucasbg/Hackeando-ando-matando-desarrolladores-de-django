import { test, expect } from '@playwright/test'

test.describe('User Flow Regression Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForSelector('[data-testid="map-container"]', { timeout: 15000 })
  })

  test('complete search and navigation flow', async ({ page }) => {
    // Step 1: Search for origin
    await page.fill('[data-testid="origin-input"]', 'Parque Envigado')
    await page.waitForSelector('[data-testid="search-suggestions"]')
    await page.click('[data-testid="search-suggestion-0"]')

    // Verify origin is set
    await expect(page.locator('[data-testid="origin-input"]')).toHaveValue('Parque Envigado')

    // Step 2: Search for destination
    await page.fill('[data-testid="destination-input"]', 'Plaza Mayor')
    await page.waitForSelector('[data-testid="search-suggestions"]')
    await page.click('[data-testid="search-suggestion-0"]')

    // Verify destination is set
    await expect(page.locator('[data-testid="destination-input"]')).toHaveValue('Plaza Mayor')

    // Step 3: Plan route
    await page.click('[data-testid="plan-route-button"]')

    // Wait for route results
    await page.waitForSelector('[data-testid="route-results"]')
    await expect(page.locator('[data-testid="route-results"]')).toBeVisible()

    // Step 4: Select a route
    await page.click('[data-testid="route-option-0"]')

    // Verify route details are displayed
    await expect(page.locator('[data-testid="route-details"]')).toBeVisible()
    await expect(page.locator('[data-testid="route-duration"]')).toBeVisible()
    await expect(page.locator('[data-testid="route-distance"]')).toBeVisible()

    // Step 5: Start navigation
    await page.click('[data-testid="start-navigation"]')

    // Verify navigation mode is active
    await expect(page.locator('[data-testid="navigation-view"]')).toBeVisible()
  })

  test('explore map with various interactions', async ({ page }) => {
    // Step 1: Pan the map
    const mapContainer = page.locator('[data-testid="map-container"]')
    await mapContainer.hover()
    await page.mouse.down()
    await page.mouse.move(200, 200)
    await page.mouse.up()

    // Step 2: Zoom in and out
    await page.click('[data-testid="zoom-in"]')
    await page.waitForTimeout(500)
    await page.click('[data-testid="zoom-out"]')
    await page.waitForTimeout(500)

    // Step 3: Try different map types
    await page.click('[data-testid="map-type-selector"]')
    await page.click('[data-testid="map-type-satellite"]')
    await page.waitForTimeout(1000)

    await page.click('[data-testid="map-type-selector"]')
    await page.click('[data-testid="map-type-terrain"]')
    await page.waitForTimeout(1000)

    await page.click('[data-testid="map-type-selector"]')
    await page.click('[data-testid="map-type-roadmap"]')
    await page.waitForTimeout(1000)

    // Step 4: Click on map to get location info
    await mapContainer.click({ position: { x: 400, y: 300 } })

    // Should show location info or marker
    await expect(page.locator('[data-testid="location-info"], [data-testid="map-marker"]')).toBeVisible({ timeout: 5000 })
  })

  test('search with filters and preferences', async ({ page }) => {
    // Step 1: Open search filters
    await page.click('[data-testid="search-filters"]')

    // Step 2: Set search preferences
    await page.check('[data-testid="filter-parks"]')
    await page.check('[data-testid="filter-restaurants"]')
    await page.uncheck('[data-testid="filter-hotels"]')

    // Step 3: Apply filters
    await page.click('[data-testid="apply-filters"]')

    // Step 4: Search with filters
    await page.fill('[data-testid="search-input"]', 'places near me')
    await page.keyboard.press('Enter')

    // Wait for filtered results
    await page.waitForSelector('[data-testid="search-results"]')

    // Step 5: Verify filtered results
    const results = page.locator('[data-testid="search-result-item"]')
    await expect(results.first()).toBeVisible()

    // Step 6: Clear filters
    await page.click('[data-testid="clear-filters"]')
    await expect(page.locator('[data-testid="filter-parks"]')).not.toBeChecked()
  })

  test('save and manage favorite locations', async ({ page }) => {
    // Step 1: Search for a location
    await page.fill('[data-testid="search-input"]', 'Parque Lleras')
    await page.waitForSelector('[data-testid="search-suggestions"]')
    await page.click('[data-testid="search-suggestion-0"]')

    // Step 2: Save as favorite
    await page.click('[data-testid="add-to-favorites"]')
    await page.fill('[data-testid="favorite-name"]', 'Favorite Spot')
    await page.click('[data-testid="save-favorite"]')

    // Step 3: Verify favorite is saved
    await expect(page.locator('[data-testid="success-message"]')).toContainText('saved')

    // Step 4: View favorites list
    await page.click('[data-testid="favorites-button"]')
    await expect(page.locator('[data-testid="favorites-list"]')).toBeVisible()
    await expect(page.locator('[data-testid="favorite-item"]:has-text("Favorite Spot")')).toBeVisible()

    // Step 5: Navigate to favorite location
    await page.click('[data-testid="favorite-item"]:has-text("Favorite Spot")')
    await expect(page.locator('[data-testid="search-input"]')).toHaveValue('Parque Lleras')

    // Step 6: Remove favorite
    await page.click('[data-testid="favorites-button"]')
    await page.click('[data-testid="remove-favorite"]')
    await expect(page.locator('[data-testid="confirmation-dialog"]')).toBeVisible()
    await page.click('[data-testid="confirm-remove"]')
  })

  test('traffic and transportation layers', async ({ page }) => {
    // Step 1: Enable traffic layer
    await page.click('[data-testid="layer-traffic"]')
    await expect(page.locator('[data-testid="traffic-overlay"]')).toBeVisible({ timeout: 5000 })

    // Step 2: Enable transit layer
    await page.click('[data-testid="layer-transit"]')
    await expect(page.locator('[data-testid="transit-overlay"]')).toBeVisible({ timeout: 5000 })

    // Step 3: Enable bike layer
    await page.click('[data-testid="layer-bike"]')
    await expect(page.locator('[data-testid="bike-overlay"]')).toBeVisible({ timeout: 5000 })

    // Step 4: View transportation information
    await page.click('[data-testid="transit-station"]')
    await expect(page.locator('[data-testid="station-info"]')).toBeVisible()

    // Step 5: Check real-time updates
    await expect(page.locator('[data-testid="live-traffic-indicator"]')).toBeVisible()
  })

  test('route planning with multiple waypoints', async ({ page }) => {
    // Step 1: Set origin
    await page.fill('[data-testid="origin-input"]', 'Parque Envigado')
    await page.waitForSelector('[data-testid="search-suggestions"]')
    await page.click('[data-testid="search-suggestion-0"]')

    // Step 2: Add first stop
    await page.click('[data-testid="add-stop"]')
    await page.fill('[data-testid="stop-1-input"]', 'Parque Lleras')
    await page.waitForSelector('[data-testid="search-suggestions"]')
    await page.click('[data-testid="search-suggestion-0"]')

    // Step 3: Set destination
    await page.fill('[data-testid="destination-input"]', 'Plaza Mayor')
    await page.waitForSelector('[data-testid="search-suggestions"]')
    await page.click('[data-testid="search-suggestion-0"]')

    // Step 4: Plan multi-stop route
    await page.click('[data-testid="plan-route-button"]')
    await page.waitForSelector('[data-testid="route-results"]')

    // Step 5: Verify multi-stop route
    await expect(page.locator('[data-testid="route-stops"]')).toBeVisible()
    const stops = page.locator('[data-testid="route-stop"]')
    await expect(stops).toHaveCount(3) // origin + 1 stop + destination

    // Step 6: Remove a stop
    await page.click('[data-testid="remove-stop-1"]')
    await expect(page.locator('[data-testid="route-stops"]')).toHaveCount(2)
  })

  test('street view integration', async ({ page }) => {
    // Step 1: Search for a location with street view
    await page.fill('[data-testid="search-input"]', 'Plaza Mayor Medellín')
    await page.waitForSelector('[data-testid="search-suggestions"]')
    await page.click('[data-testid="search-suggestion-0"]')

    // Step 2: Enter street view
    await page.click('[data-testid="street-view-button"]')
    await expect(page.locator('[data-testid="street-view-container"]')).toBeVisible({ timeout: 10000 })

    // Step 3: Navigate in street view
    await page.click('[data-testid="street-view-move-forward"]')
    await page.waitForTimeout(1000)

    await page.click('[data-testid="street-view-turn-left"]')
    await page.waitForTimeout(1000)

    // Step 4: Exit street view
    await page.click('[data-testid="exit-street-view"]')
    await expect(page.locator('[data-testid="map-container"]')).toBeVisible()
  })

  test('offline functionality simulation', async ({ page }) => {
    // Step 1: Enable offline mode
    await page.context().setOffline(true)

    // Step 2: Try to search
    await page.fill('[data-testid="search-input"]', 'Test location')
    await page.keyboard.press('Enter')

    // Step 3: Verify offline message
    await expect(page.locator('[data-testid="offline-message"]')).toBeVisible()

    // Step 4: Check cached content availability
    await expect(page.locator('[data-testid="cached-content"]')).toBeVisible()

    // Step 5: Restore online mode
    await page.context().setOffline(false)
    await page.reload()
    await page.waitForSelector('[data-testid="map-container"]')
  })

  test('dark mode and accessibility preferences', async ({ page }) => {
    // Step 1: Enable dark mode
    await page.click('[data-testid="theme-toggle"]')
    await expect(page.locator('[data-theme="dark"]')).toBeVisible()

    // Step 2: Increase text size
    await page.click('[data-testid="accessibility-menu"]')
    await page.click('[data-testid="increase-text-size"]')

    // Step 3: Enable high contrast
    await page.click('[data-testid="high-contrast-toggle"]')

    // Step 4: Verify accessibility features
    await expect(page.locator('[data-testid="accessibility-indicator"]')).toBeVisible()

    // Step 5: Test keyboard navigation
    await page.keyboard.press('Tab')
    await expect(page.locator(':focus')).toBeVisible()

    // Step 6: Reset preferences
    await page.click('[data-testid="reset-preferences"]')
  })

  test('error handling and recovery', async ({ page }) => {
    // Step 1: Simulate network error
    await page.route('**/maps/api/**', route => route.abort())

    // Step 2: Try to search
    await page.fill('[data-testid="search-input"]', 'Test location')
    await page.keyboard.press('Enter')

    // Step 3: Verify error handling
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible()

    // Step 4: Try retry mechanism
    await page.click('[data-testid="retry-button"]')

    // Step 5: Restore normal operation
    await page.unroute('**/maps/api/**')
    await page.reload()
    await page.waitForSelector('[data-testid="map-container"]')
  })

  test('performance and memory management', async ({ page }) => {
    // Step 1: Monitor memory usage
    const initialMemory = await page.evaluate(() => (performance as any).memory?.usedJSHeapSize || 0)

    // Step 2: Perform memory-intensive operations
    for (let i = 0; i < 10; i++) {
      await page.fill('[data-testid="search-input"]', `Test location ${i}`)
      await page.keyboard.press('Enter')
      await page.waitForTimeout(500)
      await page.fill('[data-testid="search-input"]', '')
    }

    // Step 3: Check memory usage after operations
    const finalMemory = await page.evaluate(() => (performance as any).memory?.usedJSHeapSize || 0)
    const memoryIncrease = finalMemory - initialMemory

    // Memory increase should be reasonable (less than 50MB)
    expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024)

    // Step 4: Test garbage collection hint
    await page.evaluate(() => {
      if (window.gc) window.gc()
    })

    // Step 5: Verify performance metrics
    const metrics = await page.evaluate(() => ({
      loadTime: performance.timing.loadEventEnd - performance.timing.navigationStart,
      domContentLoaded: performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart
    }))

    expect(metrics.loadTime).toBeLessThan(5000)
    expect(metrics.domContentLoaded).toBeLessThan(3000)
  })
})