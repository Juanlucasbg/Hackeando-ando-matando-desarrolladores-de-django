// Google Analytics 4 implementation
declare global {
  interface Window {
    gtag: (command: string, ...args: any[]) => void
    dataLayer: any[]
  }
}

export const initGA = (measurementId: string) => {
  if (process.env.NODE_ENV === 'production' && measurementId) {
    // Load Google Analytics script
    const script = document.createElement('script')
    script.async = true
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`
    document.head.appendChild(script)

    // Initialize gtag
    window.dataLayer = window.dataLayer || []
    window.gtag = function () {
      window.dataLayer.push(arguments)
    }

    window.gtag('js', new Date())
    window.gtag('config', measurementId, {
      page_title: document.title,
      page_location: window.location.href,
      send_page_view: false, // We'll send page views manually
      // Custom configuration
      anonymize_ip: true,
      allow_google_signals: true,
      allow_ad_personalization_signals: false,
      custom_map: {
        custom_map_1: 'map_interaction',
        custom_map_2: 'search_query',
        custom_map_3: 'location_type',
      },
    })

    console.log('Google Analytics initialized')
  }
}

export const trackPageView = (path?: string) => {
  if (process.env.NODE_ENV === 'production' && window.gtag) {
    window.gtag('config', process.env.REACT_APP_GA_TRACKING_ID, {
      page_path: path || window.location.pathname,
      page_title: document.title,
      page_location: window.location.href,
    })
  }
}

export const trackEvent = (eventName: string, parameters?: Record<string, any>) => {
  if (process.env.NODE_ENV === 'production' && window.gtag) {
    window.gtag('event', eventName, {
      event_category: parameters?.category || 'general',
      event_label: parameters?.label || '',
      value: parameters?.value || 0,
      custom_parameter_1: parameters?.custom_map_1 || '',
      custom_parameter_2: parameters?.custom_map_2 || '',
      custom_parameter_3: parameters?.custom_map_3 || '',
      non_interaction: parameters?.non_interaction || false,
    })
  } else if (process.env.REACT_APP_DEBUG === 'true') {
    console.log('Analytics Event:', eventName, parameters)
  }
}

// Map-specific tracking events
export const trackMapInteraction = (action: string, details?: Record<string, any>) => {
  trackEvent('map_interaction', {
    category: 'map',
    label: action,
    custom_map_1: action,
    ...details,
  })
}

export const trackSearchEvent = (query: string, resultsCount?: number) => {
  trackEvent('search', {
    category: 'search',
    label: query,
    custom_map_2: query,
    value: resultsCount,
  })
}

export const trackLocationSelection = (locationType: string, locationName: string) => {
  trackEvent('location_select', {
    category: 'map',
    label: locationName,
    custom_map_3: locationType,
  })
}

export const trackStreetViewUsage = (action: string) => {
  trackEvent('street_view', {
    category: 'street_view',
    label: action,
  })
}

export const trackGeolocationUsage = (status: 'granted' | 'denied' | 'error') => {
  trackEvent('geolocation', {
    category: 'user_location',
    label: status,
  })
}

export const trackError = (errorType: string, errorMessage: string) => {
  trackEvent('error', {
    category: 'error',
    label: errorType,
    non_interaction: true,
  })
}

export const trackPerformance = (metricName: string, value: number) => {
  trackEvent('performance_metric', {
    category: 'performance',
    label: metricName,
    value: Math.round(value),
    non_interaction: true,
  })
}

export const trackUserEngagement = (duration: number) => {
  trackEvent('user_engagement', {
    category: 'engagement',
    label: 'session_duration',
    value: Math.round(duration / 1000), // Convert to seconds
    non_interaction: true,
  })
}

export const trackFeatureUsage = (featureName: string, action: string) => {
  trackEvent('feature_usage', {
    category: 'feature',
    label: `${featureName}_${action}`,
  })
}

export const trackDeviceInfo = () => {
  const deviceInfo = {
    screen_width: window.screen.width,
    screen_height: window.screen.height,
    viewport_width: window.innerWidth,
    viewport_height: window.innerHeight,
    pixel_ratio: window.devicePixelRatio,
    user_agent: navigator.userAgent,
    language: navigator.language,
  }

  trackEvent('device_info', {
    category: 'device',
    label: 'device_specifications',
    ...deviceInfo,
    non_interaction: true,
  })
}

export const trackGoogleMapsAPI = (apiCall: string, status: 'success' | 'error', responseTime?: number) {
  trackEvent('google_maps_api', {
    category: 'api',
    label: apiCall,
    custom_map_1: status,
    value: responseTime ? Math.round(responseTime) : undefined,
    non_interaction: true,
  })
}

// Core Web Vitals tracking
export const trackWebVitals = (metric: { name: string; value: number; id: string }) => {
  trackEvent(`web_vital_${metric.name}`, {
    category: 'web_vitals',
    label: metric.id,
    value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
    non_interaction: true,
  })
}

export const setUserProperties = (properties: Record<string, any>) => {
  if (process.env.NODE_ENV === 'production' && window.gtag) {
    window.gtag('set', 'user_properties', properties)
  }
}

export const setUserId = (userId: string) => {
  if (process.env.NODE_ENV === 'production' && window.gtag) {
    window.gtag('set', 'user_id', userId)
  }
}

// Enhanced ecommerce events (if applicable)
export const trackEcommerceEvent = (eventName: string, parameters: Record<string, any>) => {
  if (process.env.NODE_ENV === 'production' && window.gtag) {
    window.gtag('event', eventName, {
      currency: 'USD',
      value: parameters.value || 0,
      items: parameters.items || [],
      ...parameters,
    })
  }
}

// Custom dimensions and metrics
export const trackCustomDimension = (dimension: string, value: string) => {
  if (process.env.NODE_ENV === 'production' && window.gtag) {
    window.gtag('config', process.env.REACT_APP_GA_TRACKING_ID, {
      [dimension]: value,
    })
  }
}

// Consent management
export const updateConsent = (analyticsConsent: 'granted' | 'denied') => {
  if (process.env.NODE_ENV === 'production' && window.gtag) {
    window.gtag('consent', 'update', {
      analytics_storage: analyticsConsent,
    })
  }
}