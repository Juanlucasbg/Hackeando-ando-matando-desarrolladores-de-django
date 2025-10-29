import '@testing-library/jest-dom'
import { beforeAll, afterEach, afterAll, vi, expect } from 'vitest'
import { cleanup } from '@testing-library/react'
import { server } from './mocks/server'
import { setupGoogleMapsMocks } from './mocks/googleMaps'
import { setupPerformanceMocks } from './mocks/performance'
import './matchers'

// Setup and teardown for each test
beforeAll(() => {
  // Start mock server
  server.listen({
    onUnhandledRequest: 'warn',
  })

  // Setup Google Maps mocks
  setupGoogleMapsMocks()

  // Setup performance mocks
  setupPerformanceMocks()

  // Mock ResizeObserver
  global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }))

  // Mock IntersectionObserver
  global.IntersectionObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }))

  // Mock window.matchMedia
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(), // deprecated
      removeListener: vi.fn(), // deprecated
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })

  // Mock window.scrollTo
  Object.defineProperty(window, 'scrollTo', {
    writable: true,
    value: vi.fn(),
  })

  // Mock window.getComputedStyle
  Object.defineProperty(window, 'getComputedStyle', {
    writable: true,
    value: vi.fn(() => ({
      getPropertyValue: vi.fn(() => ''),
      zIndex: '0',
    })),
  })

  // Mock HTMLCanvasElement methods
  HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
    fillRect: vi.fn(),
    clearRect: vi.fn(),
    getImageData: vi.fn(() => ({ data: new Array(4) })),
    putImageData: vi.fn(),
    createImageData: vi.fn(() => ({ data: new Array(4) })),
    setTransform: vi.fn(),
    drawImage: vi.fn(),
    save: vi.fn(),
    fillText: vi.fn(),
    restore: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    closePath: vi.fn(),
    stroke: vi.fn(),
    translate: vi.fn(),
    scale: vi.fn(),
    rotate: vi.fn(),
    arc: vi.fn(),
    fill: vi.fn(),
    measureText: vi.fn(() => ({ width: 0 })),
    transform: vi.fn(),
    rect: vi.fn(),
    clip: vi.fn(),
  }))

  // Mock URL.createObjectURL
  Object.defineProperty(URL, 'createObjectURL', {
    writable: true,
    value: vi.fn(() => 'mock-url'),
  })

  // Mock URL.revokeObjectURL
  Object.defineProperty(URL, 'revokeObjectURL', {
    writable: true,
    value: vi.fn(),
  })

  // Mock localStorage
  const localStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
    length: 0,
    key: vi.fn(),
  }
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
  })

  // Mock sessionStorage
  const sessionStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
    length: 0,
    key: vi.fn(),
  }
  Object.defineProperty(window, 'sessionStorage', {
    value: sessionStorageMock,
  })

  // Mock navigator.geolocation
  Object.defineProperty(navigator, 'geolocation', {
    writable: true,
    value: {
      getCurrentPosition: vi.fn(),
      watchPosition: vi.fn(),
      clearWatch: vi.fn(),
    },
  })

  // Mock navigator.credentials
  Object.defineProperty(navigator, 'credentials', {
    writable: true,
    value: {
      get: vi.fn(),
      create: vi.fn(),
      store: vi.fn(),
      preventSilentAccess: vi.fn(),
    },
  })

  // Mock crypto.subtle for WebAuthn
  Object.defineProperty(crypto, 'subtle', {
    writable: true,
    value: {
      encrypt: vi.fn(),
      decrypt: vi.fn(),
      sign: vi.fn(),
      verify: vi.fn(),
      digest: vi.fn(),
      generateKey: vi.fn(),
      deriveKey: vi.fn(),
      deriveBits: vi.fn(),
      importKey: vi.fn(),
      exportKey: vi.fn(),
      wrapKey: vi.fn(),
      unwrapKey: vi.fn(),
    },
  })

  // Mock WebRTC
  Object.defineProperty(window, 'RTCPeerConnection', {
    writable: true,
    value: vi.fn().mockImplementation(() => ({
      createOffer: vi.fn().mockResolvedValue({}),
      createAnswer: vi.fn().mockResolvedValue({}),
      setLocalDescription: vi.fn().mockResolvedValue(undefined),
      setRemoteDescription: vi.fn().mockResolvedValue(undefined),
      addIceCandidate: vi.fn().mockResolvedValue(undefined),
      getConfiguration: vi.fn().mockReturnValue({}),
      addStream: vi.fn(),
      removeStream: vi.fn(),
      close: vi.fn(),
      getStats: vi.fn().mockResolvedValue(new Map()),
      createDataChannel: vi.fn().mockReturnValue({
        close: vi.fn(),
        send: vi.fn(),
        binaryType: 'blob',
        bufferedAmount: 0,
        maxPacketLifeTime: undefined,
      }),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })
})

afterEach(() => {
  // Clean up after each test
  cleanup()
  server.resetHandlers()
})

afterAll(() => {
  // Shut down mock server
  server.close()
})

// Extend Vitest's expect with custom matchers
expect.extend({
  // Custom matcher for map elements
  toBeMapElement(received) {
    const pass = received && (
      received.classList?.contains('map-container') ||
      received.classList?.contains('google-map') ||
      received.tagName === 'DIV' && received.style?.position === 'relative'
    )

    return {
      message: () =>
        pass
          ? `expected element not to be a map element`
          : `expected element to be a map element`,
      pass,
    }
  },

  // Custom matcher for map markers
  toBeMapMarker(received) {
    const pass = received && (
      received.classList?.contains('map-marker') ||
      received.classList?.contains('google-map-marker') ||
      received.dataset?.markerId
    )

    return {
      message: () =>
        pass
          ? `expected element not to be a map marker`
          : `expected element to be a map marker`,
      pass,
    }
  },

  // Custom matcher for search components
  toBeSearchComponent(received) {
    const pass = received && (
      received.classList?.contains('search-input') ||
      received.classList?.contains('search-bar') ||
      received.tagName === 'INPUT' && received.type === 'text'
    )

    return {
      message: () =>
        pass
          ? `expected element not to be a search component`
          : `expected element to be a search component`,
      pass,
    }
  },
})