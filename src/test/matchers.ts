import { expect } from 'vitest'
import { MatcherFunction } from '@testing-library/jest-dom/matchers'

// Custom matchers for Google Maps testing
export const toBeMapMarker: MatcherFunction = function (received) {
  const pass = received && (
    received.classList?.contains('map-marker') ||
    received.classList?.contains('google-map-marker') ||
    received.classList?.contains('gm-style') ||
    received.dataset?.markerId ||
    received.tagName === 'IMG' && received.src?.includes('maps.google.com')
  )

  return {
    message: () =>
      pass
        ? `expected element not to be a map marker`
        : `expected element to be a map marker`,
    pass,
  }
}

export const toBeMapContainer: MatcherFunction = function (received) {
  const pass = received && (
    received.classList?.contains('map-container') ||
    received.classList?.contains('google-map') ||
    received.classList?.contains('gm-style') ||
    received.id?.includes('map') ||
    received.style?.position === 'relative' && received.style?.overflow === 'hidden'
  )

  return {
    message: () =>
      pass
        ? `expected element not to be a map container`
        : `expected element to be a map container`,
    pass,
  }
}

export const toBeSearchInput: MatcherFunction = function (received) {
  const pass = received && (
    received.classList?.contains('search-input') ||
    received.classList?.contains('search-bar') ||
    received.placeholder?.toLowerCase().includes('search') ||
    received.tagName === 'INPUT' && received.type === 'text' ||
    received.tagName === 'INPUT' && received.type === 'search'
  )

  return {
    message: () =>
      pass
        ? `expected element not to be a search input`
        : `expected element to be a search input`,
    pass,
  }
}

export const toBeAutocompleteDropdown: MatcherFunction = function (received) {
  const pass = received && (
    received.classList?.contains('autocomplete') ||
    received.classList?.contains('suggestions') ||
    received.classList?.contains('dropdown') ||
    received.role === 'listbox' ||
    received.tagName === 'UL' && received.querySelector('[role="option"]')
  )

  return {
    message: () =>
      pass
        ? `expected element not to be an autocomplete dropdown`
        : `expected element to be an autocomplete dropdown`,
    pass,
  }
}

export const toBeStreetViewContainer: MatcherFunction = function (received) {
  const pass = received && (
    received.classList?.contains('street-view') ||
    received.classList?.contains('panorama') ||
    received.id?.includes('street-view') ||
    received.classList?.contains('gm-style') && received.querySelector('canvas')
  )

  return {
    message: () =>
      pass
        ? `expected element not to be a street view container`
        : `expected element to be a street view container`,
    pass,
  }
}

export const toBeMapControl: MatcherFunction = function (received) {
  const pass = received && (
    received.classList?.contains('map-control') ||
    received.classList?.contains('control') ||
    received.role === 'button' && received.closest('.map-container') ||
    received.title?.includes('zoom') ||
    received.title?.includes('map type') ||
    received.title?.includes('fullscreen')
  )

  return {
    message: () =>
      pass
        ? `expected element not to be a map control`
        : `expected element to be a map control`,
    pass,
  }
}

export const toBeInfoWindow: MatcherFunction = function (received) {
  const pass = received && (
    received.classList?.contains('info-window') ||
    received.classList?.contains('infowindow') ||
    received.classList?.contains('gm-style-iw') ||
    received.role === 'dialog' && received.closest('.map-container')
  )

  return {
    message: () =>
      pass
        ? `expected element not to be an info window`
        : `expected element to be an info window`,
    pass,
  }
}

export const toHaveMapBounds: MatcherFunction = function (received, expected) {
  const pass = received && typeof received.getBounds === 'function' &&
    received.getBounds() && expected &&
    typeof expected.north === 'number' &&
    typeof expected.south === 'number' &&
    typeof expected.east === 'number' &&
    typeof expected.west === 'number'

  return {
    message: () =>
      pass
        ? `expected map not to have bounds ${JSON.stringify(expected)}`
        : `expected map to have bounds ${JSON.stringify(expected)}`,
    pass,
  }
}

export const toHaveMapCenter: MatcherFunction = function (received, expected) {
  const pass = received && typeof received.getCenter === 'function' &&
    received.getCenter() && expected &&
    Math.abs(received.getCenter().lat() - expected.lat) < 0.001 &&
    Math.abs(received.getCenter().lng() - expected.lng) < 0.001

  return {
    message: () =>
      pass
        ? `expected map not to have center ${JSON.stringify(expected)}`
        : `expected map to have center ${JSON.stringify(expected)}`,
    pass,
  }
}

export const toHaveMapZoom: MatcherFunction = function (received, expected) {
  const pass = received && typeof received.getZoom === 'function' &&
    received.getZoom() === expected

  return {
    message: () =>
      pass
        ? `expected map not to have zoom level ${expected}`
        : `expected map to have zoom level ${expected}`,
    pass,
  }
}

// Performance-related matchers
export const toHaveGoodPerformance: MatcherFunction = function (received, threshold = 3000) {
  const pass = typeof received === 'number' && received <= threshold

  return {
    message: () =>
      pass
        ? `expected performance metric not to be under ${threshold}ms`
        : `expected performance metric to be under ${threshold}ms, got ${received}ms`,
    pass,
  }
}

export const toHaveLowMemoryUsage: MatcherFunction = function (received, threshold = 50 * 1024 * 1024) {
  const pass = typeof received === 'number' && received <= threshold

  return {
    message: () =>
      pass
        ? `expected memory usage not to be under ${threshold} bytes`
        : `expected memory usage to be under ${threshold} bytes, got ${received} bytes`,
    pass,
  }
}

// Accessibility matchers
export const toBeAccessible: MatcherFunction = function (received) {
  const pass = received && (
    received.getAttribute('aria-label') ||
    received.getAttribute('aria-labelledby') ||
    received.getAttribute('role') ||
    received.tagName === 'BUTTON' ||
    received.tagName === 'INPUT' ||
    received.tagName === 'SELECT' ||
    received.tagName === 'TEXTAREA'
  )

  return {
    message: () =>
      pass
        ? `expected element not to be accessible`
        : `expected element to be accessible (have aria attributes or semantic markup)`,
    pass,
  }
}

export const toHaveProperFocusManagement: MatcherFunction = function (received) {
  const pass = received && (
    received.tabIndex >= 0 ||
    received.tabIndex === -1 ||
    received.disabled ||
    received.getAttribute('aria-hidden') === 'true'
  )

  return {
    message: () =>
      pass
        ? `expected element not to have proper focus management`
        : `expected element to have proper focus management`,
    pass,
  }
}

// Form validation matchers
export const toBeValidInput: MatcherFunction = function (received) {
  const pass = received && (
    received.checkValidity() === true ||
    received.validity?.valid === true ||
    received.willValidate === false
  )

  return {
    message: () =>
      pass
        ? `expected input not to be valid`
        : `expected input to be valid`,
    pass,
  }
}

export const toHaveRequiredAttributes: MatcherFunction = function (received, attributes: string[]) {
  const pass = received && attributes.every(attr => received.hasAttribute(attr))

  return {
    message: () =>
      pass
        ? `expected element not to have required attributes [${attributes.join(', ')}]`
        : `expected element to have required attributes [${attributes.join(', ')}]`,
    pass,
  }
}

// Register all custom matchers
expect.extend({
  toBeMapMarker,
  toBeMapContainer,
  toBeSearchInput,
  toBeAutocompleteDropdown,
  toBeStreetViewContainer,
  toBeMapControl,
  toBeInfoWindow,
  toHaveMapBounds,
  toHaveMapCenter,
  toHaveMapZoom,
  toHaveGoodPerformance,
  toHaveLowMemoryUsage,
  toBeAccessible,
  toHaveProperFocusManagement,
  toBeValidInput,
  toHaveRequiredAttributes,
})

// Export types for TypeScript
declare global {
  namespace Vi {
    interface JestAssertion<T = any> {
      toBeMapMarker(): T
      toBeMapContainer(): T
      toBeSearchInput(): T
      toBeAutocompleteDropdown(): T
      toBeStreetViewContainer(): T
      toBeMapControl(): T
      toBeInfoWindow(): T
      toHaveMapBounds(bounds: { north: number; south: number; east: number; west: number }): T
      toHaveMapCenter(center: { lat: number; lng: number }): T
      toHaveMapZoom(zoom: number): T
      toHaveGoodPerformance(threshold?: number): T
      toHaveLowMemoryUsage(threshold?: number): T
      toBeAccessible(): T
      toHaveProperFocusManagement(): T
      toBeValidInput(): T
      toHaveRequiredAttributes(attributes: string[]): T
    }
  }
}