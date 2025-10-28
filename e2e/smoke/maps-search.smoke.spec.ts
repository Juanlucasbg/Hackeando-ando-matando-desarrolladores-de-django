import { test, expect } from '@playwright/test'

test.describe('Maps Search Smoke Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    // Wait for map to load
    await page.waitForSelector('[data-testid="map-container"]', { timeout: 10000 })
  })

  test('should load the main application', async ({ page }) => {
    // Check that main elements are present
    await expect(page.locator('[data-testid="map-container"]')).toBeVisible()
    await expect(page.locator('[data-testid="search-bar"]')).toBeVisible()
    await expect(page.locator('h1')).toContainText('Google Maps Clone')
  })

  test('should perform basic location search', async ({ page }) => {
    // Enter search query
    await page.fill('[data-testid="search-input"]', 'Parque Envigado')

    // Wait for suggestions to appear
    await page.waitForSelector('[data-testid="search-suggestions"]')

    // Select first suggestion
    await page.click('[data-testid="search-suggestion-0"]')

    // Verify search was processed
    await expect(page.locator('[data-testid="search-input"]')).toHaveValue('Parque Envigado')
  })

  test('should display map controls', async ({ page }) => {
    // Check for zoom controls
    await expect(page.locator('[data-testid="zoom-in"]')).toBeVisible()
    await expect(page.locator('[data-testid="zoom-out"]')).toBeVisible()

    // Check for map type selector
    await expect(page.locator('[data-testid="map-type-selector"]')).toBeVisible()

    // Check for fullscreen button
    await expect(page.locator('[data-testid="fullscreen-button"]')).toBeVisible()
  })

  test('should handle map zoom controls', async ({ page }) => {
    // Get initial zoom level
    const initialZoom = await page.evaluate(() => window.map?.getZoom() || 13)

    // Click zoom in
    await page.click('[data-testid="zoom-in"]')

    // Click zoom out
    await page.click('[data-testid="zoom-out"]')

    // Map should still be responsive
    await expect(page.locator('[data-testid="map-container"]')).toBeVisible()
  })

  test('should support keyboard navigation', async ({ page }) => {
    // Focus search input
    await page.focus('[data-testid="search-input"]')
    await page.keyboard.type('Medellín')

    // Use arrow keys to navigate suggestions
    await page.keyboard.press('ArrowDown')
    await page.keyboard.press('Enter')

    // Verify selection was made
    await expect(page.locator('[data-testid="search-input"]')).toHaveValue('Medellín')
  })

  test('should handle geolocation request', async ({ page }) => {
    // Mock geolocation
    await page.context().grantPermissions(['geolocation'])
    await page.setGeolocation({ latitude: 6.2442, longitude: -75.5812 })

    // Click location button
    await page.click('[data-testid="geolocation-button"]')

    // Should not show error (in smoke test we just check it doesn't crash)
    await expect(page.locator('[data-testid="map-container"]')).toBeVisible()
  })

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })

    // Check mobile-specific elements
    await expect(page.locator('[data-testid="mobile-menu-button"]')).toBeVisible()

    // Test mobile menu toggle
    await page.click('[data-testid="mobile-menu-button"]')
    await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible()
  })

  test('should handle error states gracefully', async ({ page }) => {
    // Enter invalid search
    await page.fill('[data-testid="search-input"]', 'xyz123invalidlocation')
    await page.keyboard.press('Enter')

    // Should not crash - main elements should still be visible
    await expect(page.locator('[data-testid="map-container"]')).toBeVisible()
    await expect(page.locator('[data-testid="search-bar"]')).toBeVisible()
  })

  test('should support map type switching', async ({ page }) => {
    // Open map type selector
    await page.click('[data-testid="map-type-selector"]')

    // Select satellite view
    await page.click('[data-testid="map-type-satellite"]')

    // Map should still be visible
    await expect(page.locator('[data-testid="map-container"]')).toBeVisible()

    // Switch back to roadmap
    await page.click('[data-testid="map-type-selector"]')
    await page.click('[data-testid="map-type-roadmap"]')

    await expect(page.locator('[data-testid="map-container"]')).toBeVisible()
  })

  test('should handle network delays', async ({ page }) => {
    // Simulate slow network
    await page.route('**/*', async route => {
      await new Promise(resolve => setTimeout(resolve, 1000))
      await route.continue()
    })

    // Try to search
    await page.fill('[data-testid="search-input"]', 'Test location')

    // Should show loading state
    await expect(page.locator('[data-testid="search-loading"]')).toBeVisible()

    // Should complete eventually
    await expect(page.locator('[data-testid="map-container"]')).toBeVisible()
  })

  test('should handle browser back navigation', async ({ page }) => {
    // Perform a search
    await page.fill('[data-testid="search-input"]', 'Parque Lleras')
    await page.waitForSelector('[data-testid="search-suggestions"]')
    await page.click('[data-testid="search-suggestion-0"]')

    // Navigate back
    await page.goBack()

    // Should still be functional
    await expect(page.locator('[data-testid="map-container"]')).toBeVisible()
    await expect(page.locator('[data-testid="search-bar"]')).toBeVisible()
  })

  test('should support basic accessibility', async ({ page }) => {
    // Check for proper ARIA labels
    await expect(page.locator('[aria-label*="search"]')).toBeVisible()
    await expect(page.locator('[aria-label*="zoom"]')).toBeVisible()

    // Test tab navigation
    await page.keyboard.press('Tab')
    await expect(page.locator(':focus')).toBeVisible()

    // Test screen reader compatibility
    const landmarks = await page.locator('[role], [aria-label], h1, h2, main, nav').count()
    expect(landmarks).toBeGreaterThan(0)
  })

  test('should load within performance budget', async ({ page }) => {
    // Measure page load time
    const startTime = Date.now()
    await page.goto('/')
    await page.waitForSelector('[data-testid="map-container"]')
    const loadTime = Date.now() - startTime

    // Should load within 5 seconds (adjust based on requirements)
    expect(loadTime).toBeLessThan(5000)
  })
})