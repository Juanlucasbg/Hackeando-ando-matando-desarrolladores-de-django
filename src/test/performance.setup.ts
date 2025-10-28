import { beforeAll, vi } from 'vitest'

beforeAll(() => {
  // Enhanced performance monitoring for performance tests
  Object.defineProperty(window, 'performance', {
    writable: true,
    value: {
      now: vi.fn(() => Date.now()),
      mark: vi.fn(),
      measure: vi.fn(),
      getEntriesByName: vi.fn(() => []),
      getEntriesByType: vi.fn(() => []),
      clearMarks: vi.fn(),
      clearMeasures: vi.fn(),
      // Enhanced performance entries for detailed testing
      getEntries: vi.fn(() => [
        {
          name: 'first-contentful-paint',
          entryType: 'paint',
          startTime: 1000,
          duration: 0,
        },
        {
          name: 'largest-contentful-paint',
          entryType: 'largest-contentful-paint',
          startTime: 2000,
          duration: 0,
          renderTime: 1800,
          loadTime: 1900,
          size: 1024,
        },
        {
          name: 'first-input-delay',
          entryType: 'first-input',
          startTime: 2500,
          duration: 50,
          processingStart: 2550,
          processingEnd: 2600,
        },
        {
          name: 'cumulative-layout-shift',
          entryType: 'layout-shift',
          startTime: 3000,
          duration: 0,
          value: 0.1,
          hadRecentInput: false,
        },
      ]),
      // Memory API
      memory: {
        usedJSHeapSize: 1024 * 1024 * 10, // 10MB
        totalJSHeapSize: 1024 * 1024 * 50, // 50MB
        jsHeapSizeLimit: 1024 * 1024 * 2048, // 2GB
      },
      // Navigation timing
      timing: {
        navigationStart: 0,
        unloadEventStart: 100,
        unloadEventEnd: 150,
        redirectStart: 0,
        redirectEnd: 0,
        fetchStart: 200,
        domainLookupStart: 250,
        domainLookupEnd: 300,
        connectStart: 350,
        connectEnd: 400,
        secureConnectionStart: 380,
        requestStart: 450,
        responseStart: 500,
        responseEnd: 800,
        domLoading: 900,
        domInteractive: 1200,
        domContentLoadedEventStart: 1250,
        domContentLoadedEventEnd: 1300,
        domComplete: 1400,
        loadEventStart: 1450,
        loadEventEnd: 1500,
      },
      // Resource timing
      getEntriesByType: vi.fn((type: string) => {
        if (type === 'navigation') {
          return [{
            name: 'http://localhost:5173',
            entryType: 'navigation',
            startTime: 0,
            duration: 1500,
            initiatorType: 'navigation',
            nextHopProtocol: 'h2',
            transferSize: 50000,
            encodedBodySize: 45000,
            decodedBodySize: 45000,
            serverTiming: [],
          }]
        }
        if (type === 'resource') {
          return [
            {
              name: 'http://localhost:5173/main.js',
              entryType: 'resource',
              startTime: 1600,
              duration: 200,
              initiatorType: 'script',
              transferSize: 100000,
              encodedBodySize: 90000,
              decodedBodySize: 90000,
            },
            {
              name: 'http://localhost:5173/styles.css',
              entryType: 'resource',
              startTime: 1800,
              duration: 100,
              initiatorType: 'link',
              transferSize: 50000,
              encodedBodySize: 45000,
              decodedBodySize: 45000,
            },
          ]
        }
        return []
      }),
    },
  })

  // Mock PerformanceObserver for detailed performance monitoring
  Object.defineProperty(window, 'PerformanceObserver', {
    writable: true,
    value: vi.fn().mockImplementation((callback) => ({
      observe: vi.fn(),
      disconnect: vi.fn(),
      takeRecords: vi.fn(() => [
        {
          name: 'long-task',
          entryType: 'longtask',
          startTime: 2000,
          duration: 60,
          attribution: [
            {
              name: 'unknown',
              entryType: 'longtask',
              startTime: 2000,
              duration: 60,
            },
          ],
        },
      ]),
    })),
  })

  // Mock Web Vitals library
  vi.mock('web-vitals', () => ({
    getCLS: vi.fn((callback) => {
      setTimeout(() => callback({ value: 0.1, id: 'cls-1' }), 100)
    }),
    getFID: vi.fn((callback) => {
      setTimeout(() => callback({ value: 50, id: 'fid-1' }), 200)
    }),
    getFCP: vi.fn((callback) => {
      setTimeout(() => callback({ value: 1000, id: 'fcp-1' }), 300)
    }),
    getLCP: vi.fn((callback) => {
      setTimeout(() => callback({ value: 2000, id: 'lcp-1' }), 400)
    }),
    getTTFB: vi.fn((callback) => {
      setTimeout(() => callback({ value: 500, id: 'ttfb-1' }), 500)
    }),
    onCLS: vi.fn(),
    onFID: vi.fn(),
    onFCP: vi.fn(),
    onLCP: vi.fn(),
    onTTFB: vi.fn(),
    onINP: vi.fn(),
  }))

  // Mock Intersection Observer for performance testing
  Object.defineProperty(window, 'IntersectionObserver', {
    writable: true,
    value: vi.fn().mockImplementation((callback) => ({
      observe: vi.fn((element) => {
        // Simulate intersection after a delay for performance testing
        setTimeout(() => {
          callback([{
            target: element,
            isIntersecting: true,
            intersectionRatio: 1,
            boundingClientRect: { x: 0, y: 0, width: 100, height: 100, top: 0, left: 0, bottom: 100, right: 100 },
            intersectionRect: { x: 0, y: 0, width: 100, height: 100, top: 0, left: 0, bottom: 100, right: 100 },
            rootBounds: { x: 0, y: 0, width: 1000, height: 1000, top: 0, left: 0, bottom: 1000, right: 1000 },
            time: Date.now(),
          }])
        }, 50)
      }),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
      root: null,
      rootMargin: '0px',
      thresholds: [0],
    })),
  })

  // Mock RequestIdleCallback for performance optimization testing
  Object.defineProperty(window, 'requestIdleCallback', {
    writable: true,
    value: vi.fn((callback) => {
      // Simulate idle callback after a short delay
      return setTimeout(() => callback({
        didTimeout: false,
        timeRemaining: () => 50,
      }), 10)
    }),
  })

  Object.defineProperty(window, 'cancelIdleCallback', {
    writable: true,
    value: vi.fn(),
  })

  // Enhanced ResizeObserver for performance testing
  Object.defineProperty(window, 'ResizeObserver', {
    writable: true,
    value: vi.fn().mockImplementation((callback) => ({
      observe: vi.fn((element) => {
        // Simulate resize event for performance testing
        setTimeout(() => {
          callback([{
            target: element,
            contentRect: { x: 0, y: 0, width: 200, height: 200, top: 0, left: 0, bottom: 200, right: 200 },
            borderBoxSize: [{ blockSize: 200, inlineSize: 200 }],
            contentBoxSize: [{ blockSize: 180, inlineSize: 180 }],
            devicePixelContentBoxSize: [{ blockSize: 180, inlineSize: 180 }],
          }])
        }, 25)
      }),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    })),
  })

  // Mock network conditions for performance testing
  Object.defineProperty(navigator, 'connection', {
    writable: true,
    value: {
      effectiveType: '4g',
      downlink: 10,
      rtt: 50,
      saveData: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    },
  })

  // Mock hardware concurrency for performance testing
  Object.defineProperty(navigator, 'hardwareConcurrency', {
    writable: true,
    value: 4,
  })

  // Mock device memory for performance testing
  Object.defineProperty(navigator, 'deviceMemory', {
    writable: true,
    value: 8,
  })
})