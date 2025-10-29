// Health check service for application monitoring
export interface HealthCheckResult {
  status: 'healthy' | 'unhealthy' | 'degraded'
  checks: {
    googleMapsApi: boolean
    browserSupport: boolean
    localStorage: boolean
    sessionStorage: boolean
    geolocation: boolean
    networkConnection: boolean
    performance: boolean
    serviceWorker: boolean
  }
  timestamp: string
  responseTime: number
  version?: string
  buildInfo?: {
    version: string
    buildDate: string
    environment: string
  }
}

export interface HealthCheckOptions {
  timeout?: number
  includeDetailed?: boolean
  checkNetworkLatency?: boolean
}

export const performHealthCheck = async (options: HealthCheckOptions = {}): Promise<HealthCheckResult> => {
  const {
    timeout = 5000,
    includeDetailed = false,
    checkNetworkLatency = true,
  } = options

  const startTime = performance.now()
  const results = {
    googleMapsApi: false,
    browserSupport: false,
    localStorage: false,
    sessionStorage: false,
    geolocation: false,
    networkConnection: false,
    performance: false,
    serviceWorker: false,
  }

  try {
    // Check Google Maps API
    results.googleMapsApi = await checkGoogleMapsApi(timeout)

    // Check browser support
    results.browserSupport = checkBrowserSupport()

    // Check localStorage
    results.localStorage = checkLocalStorage()

    // Check sessionStorage
    results.sessionStorage = checkSessionStorage()

    // Check geolocation
    results.geolocation = await checkGeolocation()

    // Check network connection
    results.networkConnection = checkNetworkConnection()

    // Check performance
    results.performance = checkPerformance()

    // Check service worker
    results.serviceWorker = await checkServiceWorker()
  } catch (error) {
    console.error('Health check error:', error)
  }

  const responseTime = performance.now() - startTime
  const allChecks = Object.values(results)
  const passedChecks = allChecks.filter(Boolean).length
  const totalChecks = allChecks.length
  const successRate = passedChecks / totalChecks

  let status: 'healthy' | 'unhealthy' | 'degraded'
  if (successRate >= 0.9) {
    status = 'healthy'
  } else if (successRate >= 0.7) {
    status = 'degraded'
  } else {
    status = 'unhealthy'
  }

  const healthCheckResult: HealthCheckResult = {
    status,
    checks: results,
    timestamp: new Date().toISOString(),
    responseTime: Math.round(responseTime),
  }

  if (includeDetailed) {
    healthCheckResult.version = process.env.npm_package_version
    healthCheckResult.buildInfo = {
      version: process.env.npm_package_version || 'unknown',
      buildDate: new Date().toISOString(),
      environment: process.env.REACT_APP_ENV || 'unknown',
    }
  }

  return healthCheckResult
}

const checkGoogleMapsApi = async (timeout: number): Promise<boolean> => {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}&libraries=places`,
      {
        method: 'HEAD',
        signal: controller.signal,
      }
    )

    clearTimeout(timeoutId)
    return response.ok
  } catch (error) {
    return false
  }
}

const checkBrowserSupport = (): boolean => {
  const requiredFeatures = [
    'geolocation' in navigator,
    'localStorage' in window,
    'sessionStorage' in window,
    'fetch' in window,
    'Promise' in window,
    'Map' in window,
    'Set' in window,
    'IntersectionObserver' in window,
    'ResizeObserver' in window,
  ]

  return requiredFeatures.every(Boolean)
}

const checkLocalStorage = (): boolean => {
  try {
    const testKey = 'health-check-test'
    localStorage.setItem(testKey, 'test')
    localStorage.removeItem(testKey)
    return true
  } catch (error) {
    return false
  }
}

const checkSessionStorage = (): boolean => {
  try {
    const testKey = 'health-check-test'
    sessionStorage.setItem(testKey, 'test')
    sessionStorage.removeItem(testKey)
    return true
  } catch (error) {
    return false
  }
}

const checkGeolocation = async (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (!('geolocation' in navigator)) {
      resolve(false)
      return
    }

    const timeoutId = setTimeout(() => {
      resolve(false)
    }, 3000)

    navigator.geolocation.getCurrentPosition(
      () => {
        clearTimeout(timeoutId)
        resolve(true)
      },
      () => {
        clearTimeout(timeoutId)
        resolve(false)
      },
      { timeout: 3000, maximumAge: 60000, enableHighAccuracy: false }
    )
  })
}

const checkNetworkConnection = (): boolean => {
  const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection
  if (!connection) return true // Connection API not available, assume online

  return !connection.effectiveType || connection.effectiveType !== 'slow-2g'
}

const checkPerformance = (): boolean => {
  if (!('performance' in window)) return false

  // Check if performance timing is available
  const timing = performance.timing
  if (!timing) return false

  // Check if page load completed
  return timing.loadEventEnd > 0
}

const checkServiceWorker = async (): Promise<boolean> => {
  if (!('serviceWorker' in navigator)) return false

  try {
    const registration = await navigator.serviceWorker.getRegistration()
    return !!registration
  } catch (error) {
    return false
  }
}

// Network latency check
export const checkNetworkLatency = async (url: string = 'https://www.google.com'): Promise<number> => {
  try {
    const startTime = performance.now()
    const response = await fetch(url, { method: 'HEAD', cache: 'no-cache' })
    const endTime = performance.now()

    if (response.ok) {
      return Math.round(endTime - startTime)
    }
    return -1
  } catch (error) {
    return -1
  }
}

// Periodic health monitoring
export class HealthMonitor {
  private intervalId: NodeJS.Timeout | null = null
  private healthCheckInterval: number = 60000 // 1 minute
  private lastHealthCheck: HealthCheckResult | null = null
  private onHealthChange?: (result: HealthCheckResult) => void

  constructor(interval: number = 60000, onHealthChange?: (result: HealthCheckResult) => void) {
    this.healthCheckInterval = interval
    this.onHealthChange = onHealthChange
  }

  start() {
    if (this.intervalId) return

    this.intervalId = setInterval(async () => {
      const result = await performHealthCheck({ includeDetailed: true })

      if (this.onHealthChange && this.lastHealthCheck?.status !== result.status) {
        this.onHealthChange(result)
      }

      this.lastHealthCheck = result
    }, this.healthCheckInterval)
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
  }

  async checkNow(options?: HealthCheckOptions): Promise<HealthCheckResult> {
    const result = await performHealthCheck(options)
    this.lastHealthCheck = result
    return result
  }

  getLastHealthCheck(): HealthCheckResult | null {
    return this.lastHealthCheck
  }

  updateInterval(interval: number) {
    this.healthCheckInterval = interval
    if (this.intervalId) {
      this.stop()
      this.start()
    }
  }
}

// Performance metrics collection
export const collectPerformanceMetrics = () => {
  if (!('performance' in window)) return null

  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
  const paint = performance.getEntriesByType('paint')

  return {
    // Navigation timing
    dnsLookup: Math.round(navigation.domainLookupEnd - navigation.domainLookupStart),
    tcpConnection: Math.round(navigation.connectEnd - navigation.connectStart),
    serverResponse: Math.round(navigation.responseEnd - navigation.requestStart),
    domLoad: Math.round(navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart),
    pageLoad: Math.round(navigation.loadEventEnd - navigation.loadEventStart),
    totalTime: Math.round(navigation.loadEventEnd - navigation.navigationStart),

    // Paint timing
    firstPaint: paint.find(entry => entry.name === 'first-paint')?.startTime || 0,
    firstContentfulPaint: paint.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0,

    // Resource timing
    resourceCount: performance.getEntriesByType('resource').length,

    // Memory usage (if available)
    memory: (performance as any).memory ? {
      usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
      totalJSHeapSize: (performance as any).memory.totalJSHeapSize,
      jsHeapSizeLimit: (performance as any).memory.jsHeapSizeLimit,
    } : null,
  }
}

// Export for use in components
export default {
  performHealthCheck,
  checkNetworkLatency,
  HealthMonitor,
  collectPerformanceMetrics,
}