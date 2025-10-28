import { vi } from 'vitest'

export const setupPerformanceMocks = () => {
  // Enhanced performance monitoring mocks
  const mockPerformanceEntries = [
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
      id: 'lcp-123',
      url: 'http://localhost:5173/main-image.jpg',
    },
    {
      name: 'first-input-delay',
      entryType: 'first-input',
      startTime: 2500,
      duration: 50,
      processingStart: 2550,
      processingEnd: 2600,
      inputType: 'pointer',
      name: 'click',
    },
    {
      name: 'cumulative-layout-shift',
      entryType: 'layout-shift',
      startTime: 3000,
      duration: 0,
      value: 0.1,
      hadRecentInput: false,
      sources: [
        {
          node: document.createElement('div'),
          previousRect: { x: 0, y: 0, width: 100, height: 100 },
          currentRect: { x: 0, y: 5, width: 100, height: 100 },
        }
      ],
    },
    {
      name: 'time-to-first-byte',
      entryType: 'navigation',
      startTime: 0,
      duration: 500,
      transferSize: 50000,
      encodedBodySize: 45000,
      decodedBodySize: 45000,
    },
  ]

  // Mock performance observer entries
  const mockPerformanceObserverEntries = {
    getEntries: vi.fn(() => mockPerformanceEntries),
    getEntriesByName: vi.fn((name) =>
      mockPerformanceEntries.filter(entry => entry.name === name)
    ),
    getEntriesByType: vi.fn((type) =>
      mockPerformanceEntries.filter(entry => entry.entryType === type)
    ),
  }

  // Mock PerformanceObserver
  Object.defineProperty(window, 'PerformanceObserver', {
    writable: true,
    value: vi.fn().mockImplementation((callback) => ({
      observe: vi.fn((options) => {
        // Simulate performance entries being observed
        setTimeout(() => {
          if (options.entryTypes?.includes('largest-contentful-paint')) {
            callback([mockPerformanceEntries[1]])
          }
          if (options.entryTypes?.includes('first-input')) {
            callback([mockPerformanceEntries[2]])
          }
          if (options.entryTypes?.includes('layout-shift')) {
            callback([mockPerformanceEntries[3]])
          }
          if (options.entryTypes?.includes('longtask')) {
            callback([{
              name: 'long-task',
              entryType: 'longtask',
              startTime: 4000,
              duration: 60,
              attribution: [
                {
                  name: 'self',
                  entryType: 'longtask',
                  startTime: 4000,
                  duration: 60,
                },
              ],
            }])
          }
        }, 100)
      }),
      disconnect: vi.fn(),
      takeRecords: vi.fn(() => []),
    })),
  })

  // Mock performance with enhanced properties
  Object.defineProperty(window, 'performance', {
    writable: true,
    value: {
      now: vi.fn(() => Date.now()),
      mark: vi.fn(),
      measure: vi.fn(),
      clearMarks: vi.fn(),
      clearMeasures: vi.fn(),
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
            // Enhanced navigation timing
            redirectStart: 0,
            redirectEnd: 0,
            fetchStart: 100,
            domainLookupStart: 200,
            domainLookupEnd: 250,
            connectStart: 300,
            connectEnd: 350,
            secureConnectionStart: 320,
            requestStart: 400,
            responseStart: 500,
            responseEnd: 800,
            domLoading: 900,
            domInteractive: 1200,
            domContentLoadedEventStart: 1250,
            domContentLoadedEventEnd: 1300,
            domComplete: 1400,
            loadEventStart: 1450,
            loadEventEnd: 1500,
            type: 'navigate',
            decodedBodySize: 45000,
            encodedBodySize: 45000,
            transferSize: 50000,
            unloadEventStart: 0,
            unloadEventEnd: 0,
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
              nextHopProtocol: 'h2',
              renderBlockingStatus: 'blocking',
              workerStart: 0,
              redirectStart: 0,
              redirectEnd: 0,
              fetchStart: 1600,
              domainLookupStart: 0,
              domainLookupEnd: 0,
              connectStart: 0,
              connectEnd: 0,
              secureConnectionStart: 0,
              requestStart: 1700,
              responseStart: 1750,
              responseEnd: 1800,
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
              nextHopProtocol: 'h2',
              renderBlockingStatus: 'blocking',
            },
            {
              name: 'https://maps.googleapis.com/maps/api/js',
              entryType: 'resource',
              startTime: 2000,
              duration: 300,
              initiatorType: 'script',
              transferSize: 200000,
              encodedBodySize: 180000,
              decodedBodySize: 180000,
              nextHopProtocol: 'h2',
              renderBlockingStatus: 'non-blocking',
            }
          ]
        }
        if (type === 'paint') {
          return [
            mockPerformanceEntries[0], // first-contentful-paint
          ]
        }
        if (type === 'largest-contentful-paint') {
          return [mockPerformanceEntries[1]]
        }
        if (type === 'first-input') {
          return [mockPerformanceEntries[2]]
        }
        if (type === 'layout-shift') {
          return [mockPerformanceEntries[3]]
        }
        if (type === 'longtask') {
          return [{
            name: 'long-task',
            entryType: 'longtask',
            startTime: 4000,
            duration: 60,
            attribution: [
              {
                name: 'self',
                entryType: 'longtask',
                startTime: 4000,
                duration: 60,
              },
            ],
          }]
        }
        return []
      }),
      getEntriesByName: vi.fn((name: string) => {
        return mockPerformanceEntries.filter(entry => entry.name === name)
      }),
      getEntries: vi.fn(() => mockPerformanceEntries),
      memory: {
        usedJSHeapSize: 1024 * 1024 * 10, // 10MB
        totalJSHeapSize: 1024 * 1024 * 50, // 50MB
        jsHeapSizeLimit: 1024 * 1024 * 2048, // 2GB
      },
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
      navigation: {
        type: 'navigate',
        redirectCount: 0,
      },
      ...mockPerformanceObserverEntries,
    },
  })

  // Mock Navigation Timing API
  Object.defineProperty(performance, 'timing', {
    writable: true,
    value: {
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
  })

  // Mock Resource Timing API
  Object.defineProperty(performance, 'getEntriesByType', {
    writable: true,
    value: vi.fn((type: string) => {
      if (type === 'navigation') {
        return [{
          name: 'http://localhost:5173',
          entryType: 'navigation',
          startTime: 0,
          duration: 1500,
        }]
      }
      if (type === 'resource') {
        return [
          {
            name: 'main.js',
            entryType: 'resource',
            startTime: 1600,
            duration: 200,
            transferSize: 100000,
          },
          {
            name: 'styles.css',
            entryType: 'resource',
            startTime: 1800,
            duration: 100,
            transferSize: 50000,
          }
        ]
      }
      return []
    }),
  })

  // Mock Paint Timing API
  Object.defineProperty(performance, 'getEntriesByType', {
    writable: true,
    value: vi.fn((type: string) => {
      if (type === 'paint') {
        return [
          { name: 'first-paint', entryType: 'paint', startTime: 800, duration: 0 },
          { name: 'first-contentful-paint', entryType: 'paint', startTime: 1000, duration: 0 },
        ]
      }
      return []
    }),
  })

  // Mock Web Vitals library
  vi.mock('web-vitals', () => ({
    getCLS: vi.fn((callback) => {
      setTimeout(() => callback({
        value: 0.1,
        id: 'cls-1',
        name: 'CLS',
        delta: 0.1,
        entries: [mockPerformanceEntries[3]]
      }), 100)
    }),
    getFID: vi.fn((callback) => {
      setTimeout(() => callback({
        value: 50,
        id: 'fid-1',
        name: 'FID',
        delta: 50,
        entries: [mockPerformanceEntries[2]]
      }), 200)
    }),
    getFCP: vi.fn((callback) => {
      setTimeout(() => callback({
        value: 1000,
        id: 'fcp-1',
        name: 'FCP',
        delta: 1000,
        entries: [mockPerformanceEntries[0]]
      }), 300)
    }),
    getLCP: vi.fn((callback) => {
      setTimeout(() => callback({
        value: 2000,
        id: 'lcp-1',
        name: 'LCP',
        delta: 2000,
        entries: [mockPerformanceEntries[1]]
      }), 400)
    }),
    getTTFB: vi.fn((callback) => {
      setTimeout(() => callback({
        value: 500,
        id: 'ttfb-1',
        name: 'TTFB',
        delta: 500,
        entries: []
      }), 500)
    }),
    getINP: vi.fn((callback) => {
      setTimeout(() => callback({
        value: 100,
        id: 'inp-1',
        name: 'INP',
        delta: 100,
        entries: []
      }), 600)
    }),
    onCLS: vi.fn((callback) => {
      setTimeout(() => callback({
        value: 0.1,
        id: 'cls-1',
        name: 'CLS',
        delta: 0.1,
        entries: [mockPerformanceEntries[3]]
      }), 100)
      return { disconnect: vi.fn() }
    }),
    onFID: vi.fn((callback) => {
      setTimeout(() => callback({
        value: 50,
        id: 'fid-1',
        name: 'FID',
        delta: 50,
        entries: [mockPerformanceEntries[2]]
      }), 200)
      return { disconnect: vi.fn() }
    }),
    onFCP: vi.fn((callback) => {
      setTimeout(() => callback({
        value: 1000,
        id: 'fcp-1',
        name: 'FCP',
        delta: 1000,
        entries: [mockPerformanceEntries[0]]
      }), 300)
      return { disconnect: vi.fn() }
    }),
    onLCP: vi.fn((callback) => {
      setTimeout(() => callback({
        value: 2000,
        id: 'lcp-1',
        name: 'LCP',
        delta: 2000,
        entries: [mockPerformanceEntries[1]]
      }), 400)
      return { disconnect: vi.fn() }
    }),
    onTTFB: vi.fn((callback) => {
      setTimeout(() => callback({
        value: 500,
        id: 'ttfb-1',
        name: 'TTFB',
        delta: 500,
        entries: []
      }), 500)
      return { disconnect: vi.fn() }
    }),
    onINP: vi.fn((callback) => {
      setTimeout(() => callback({
        value: 100,
        id: 'inp-1',
        name: 'INP',
        delta: 100,
        entries: []
      }), 600)
      return { disconnect: vi.fn() }
    }),
  }))

  // Mock PerformanceObserver for LCP monitoring
  const mockLCPEntry = {
    element: document.createElement('img'),
    entryType: 'largest-contentful-paint',
    startTime: 2000,
    duration: 0,
    loadTime: 1900,
    renderTime: 1800,
    size: 1024,
    id: 'lcp-123',
    url: 'http://localhost:5173/hero-image.jpg',
    name: '',
    toJSON: () => ({}),
  }

  // Mock PerformanceObserver for CLS monitoring
  const mockCLSEntry = {
    entryType: 'layout-shift',
    startTime: 3000,
    duration: 0,
    value: 0.1,
    hadRecentInput: false,
    sources: [
      {
        node: document.createElement('div'),
        previousRect: { x: 0, y: 0, width: 100, height: 100 },
        currentRect: { x: 0, y: 5, width: 100, height: 100 },
      }
    ],
    name: '',
    toJSON: () => ({}),
  }

  return {
    mockPerformanceEntries,
    mockLCPEntry,
    mockCLSEntry,
  }
}