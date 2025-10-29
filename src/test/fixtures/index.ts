// Test fixtures for Google Maps Clone application

export const locations = {
  medellin: {
    name: 'Medellín, Colombia',
    address: 'Medellín, Antioquia, Colombia',
    coordinates: { lat: 6.2442, lng: -75.5812 },
    placeId: 'ChIJJ4yLJ2BvoI4RqB2V8f1hG0M',
    types: ['locality', 'political']
  },
  parqueEnvigado: {
    name: 'Parque Envigado',
    address: 'Parque Envigado, Envigado, Colombia',
    coordinates: { lat: 6.1700, lng: -75.5850 },
    placeId: 'ChIJR1J7xZVvoI4R0B2V8f1hG0M',
    types: ['park', 'point_of_interest', 'establishment'],
    rating: 4.5,
    userRatingsTotal: 1250
  },
  plazaMayor: {
    name: 'Plaza Mayor',
    address: 'Plaza Mayor, Medellín, Colombia',
    coordinates: { lat: 6.2094, lng: -75.5671 },
    placeId: 'ChIJL5yLJ2BvoI4RqB2V8f1hG0M',
    types: ['point_of_interest', 'establishment']
  },
  parqueLleras: {
    name: 'Parque Lleras',
    address: 'Parque Lleras, Medellín, Colombia',
    coordinates: { lat: 6.2080, lng: -75.5680 },
    placeId: 'ChIJM5yLJ2BvoI4RqB2V8f1hG0M',
    types: ['park', 'point_of_interest', 'establishment'],
    rating: 4.2,
    userRatingsTotal: 890
  },
  elPoblado: {
    name: 'El Poblado',
    address: 'El Poblado, Medellín, Colombia',
    coordinates: { lat: 6.2096, lng: -75.5655 },
    placeId: 'ChIJK5yLJ2BvoI4RqB2V8f1hG0M',
    types: ['neighborhood', 'political']
  }
}

export const routes = {
  walkingTransit: {
    id: 'route-1',
    origin: locations.parqueEnvigado.coordinates,
    destination: locations.plazaMayor.coordinates,
    duration: 25,
    distance: 5.2,
    modes: ['walking', 'metro'],
    carbonFootprint: 0.8,
    cost: 2800,
    steps: [
      {
        mode: 'walking',
        duration: 8,
        distance: 1.0,
        instructions: 'Walk to Envigado Metro Station',
        coordinates: [
          locations.parqueEnvigado.coordinates,
          { lat: 6.1800, lng: -75.5750 }
        ]
      },
      {
        mode: 'metro',
        duration: 14,
        distance: 4.2,
        instructions: 'Take Metro Line A to Plaza Mayor',
        coordinates: [
          { lat: 6.1800, lng: -75.5750 },
          locations.plazaMayor.coordinates
        ],
        transitDetails: {
          line: {
            name: 'Line A',
            shortName: 'A',
            color: '#ffffff',
            agency: 'Metro de Medellín'
          },
          departureStop: {
            name: 'Envigado',
            location: { lat: 6.1800, lng: -75.5750 }
          },
          arrivalStop: {
            name: 'Plaza Mayor',
            location: locations.plazaMayor.coordinates
          },
          numStops: 4
        }
      },
      {
        mode: 'walking',
        duration: 3,
        distance: 0.5,
        instructions: 'Walk to destination',
        coordinates: [
          locations.plazaMayor.coordinates,
          locations.plazaMayor.coordinates
        ]
      }
    ],
    polyline: 'mock_encoded_polyline_walking_transit'
  },
  driving: {
    id: 'route-2',
    origin: locations.parqueEnvigado.coordinates,
    destination: locations.plazaMayor.coordinates,
    duration: 15,
    distance: 5.2,
    modes: ['driving'],
    carbonFootprint: 2.5,
    cost: 8500,
    steps: [
      {
        mode: 'driving',
        duration: 15,
        distance: 5.2,
        instructions: 'Drive via Calle 30 and Autopista Sur',
        coordinates: [
          locations.parqueEnvigado.coordinates,
          { lat: 6.1750, lng: -75.5820 },
          locations.plazaMayor.coordinates
        ],
        maneuver: {
          bearing: 45,
          location: locations.parqueEnvigado.coordinates
        }
      }
    ],
    polyline: 'mock_encoded_polyline_driving'
  },
  cycling: {
    id: 'route-3',
    origin: locations.parqueEnvigado.coordinates,
    destination: locations.plazaMayor.coordinates,
    duration: 22,
    distance: 5.8,
    modes: ['cycling'],
    carbonFootprint: 0.2,
    cost: 0,
    steps: [
      {
        mode: 'cycling',
        duration: 22,
        distance: 5.8,
        instructions: 'Cycle via bike-friendly routes',
        coordinates: [
          locations.parqueEnvigado.coordinates,
          { lat: 6.1850, lng: -75.5800 },
          locations.plazaMayor.coordinates
        ]
      }
    ],
    polyline: 'mock_encoded_polyline_cycling'
  }
}

export const transportStations = [
  {
    id: 'envigado',
    name: 'Envigado',
    location: { lat: 6.1800, lng: -75.5750 },
    lines: [
      {
        id: 'A',
        name: 'Line A',
        color: '#ffffff',
        shortName: 'A'
      }
    ],
    accessibility: true,
    facilities: ['elevator', 'escalator', 'parking', 'restrooms'],
    status: 'active',
    openingHours: {
      monday: '5:00 AM - 11:00 PM',
      tuesday: '5:00 AM - 11:00 PM',
      wednesday: '5:00 AM - 11:00 PM',
      thursday: '5:00 AM - 11:00 PM',
      friday: '5:00 AM - 11:00 PM',
      saturday: '6:00 AM - 11:00 PM',
      sunday: '6:00 AM - 10:00 PM'
    }
  },
  {
    id: 'plaza-mayor',
    name: 'Plaza Mayor',
    location: locations.plazaMayor.coordinates,
    lines: [
      {
        id: 'A',
        name: 'Line A',
        color: '#ffffff',
        shortName: 'A'
      }
    ],
    accessibility: true,
    facilities: ['elevator', 'escalator', 'restrooms', 'info_desk'],
    status: 'active',
    openingHours: {
      monday: '5:00 AM - 11:00 PM',
      tuesday: '5:00 AM - 11:00 PM',
      wednesday: '5:00 AM - 11:00 PM',
      thursday: '5:00 AM - 11:00 PM',
      friday: '5:00 AM - 11:00 PM',
      saturday: '6:00 AM - 11:00 PM',
      sunday: '6:00 AM - 10:00 PM'
    }
  },
  {
    id: 'poblado',
    name: 'Poblado',
    location: locations.elPoblado.coordinates,
    lines: [
      {
        id: 'A',
        name: 'Line A',
        color: '#ffffff',
        shortName: 'A'
      }
    ],
    accessibility: true,
    facilities: ['elevator', 'escalator', 'parking'],
    status: 'active',
    openingHours: {
      monday: '5:00 AM - 11:00 PM',
      tuesday: '5:00 AM - 11:00 PM',
      wednesday: '5:00 AM - 11:00 PM',
      thursday: '5:00 AM - 11:00 PM',
      friday: '5:00 AM - 11:00 PM',
      saturday: '6:00 AM - 11:00 PM',
      sunday: '6:00 AM - 10:00 PM'
    }
  }
]

export const trafficData = {
  location: locations.medellin.coordinates,
  data: [
    {
      id: 'segment-1',
      road: 'Calle 30',
      speed: 25,
      speedLimit: 40,
      congestion: 'moderate',
      delay: 3,
      coordinates: [
        locations.parqueEnvigado.coordinates,
        { lat: 6.1750, lng: -75.5820 }
      ],
      timestamp: new Date().toISOString()
    },
    {
      id: 'segment-2',
      road: 'Autopista Sur',
      speed: 35,
      speedLimit: 60,
      congestion: 'light',
      delay: 1,
      coordinates: [
        { lat: 6.1750, lng: -75.5820 },
        locations.plazaMayor.coordinates
      ],
      timestamp: new Date().toISOString()
    },
    {
      id: 'segment-3',
      road: 'Carrera 43',
      speed: 15,
      speedLimit: 30,
      congestion: 'heavy',
      delay: 8,
      coordinates: [
        { lat: 6.2000, lng: -75.5700 },
        { lat: 6.2100, lng: -75.5650 }
      ],
      timestamp: new Date().toISOString()
    }
  ],
  lastUpdate: new Date().toISOString()
}

export const incidents = [
  {
    id: 'incident-1',
    type: 'construction',
    severity: 'moderate',
    title: 'Road construction on Calle 30',
    description: 'Lane restrictions due to road work between Envigado and Poblado',
    location: {
      coordinates: { lat: 6.1850, lng: -75.5800 },
      address: 'Calle 30, Envigado'
    },
    affectedRoutes: ['Calle 30'],
    startTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    estimatedEndTime: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(), // 4 hours from now
    impact: {
      delay: 5,
      detourRequired: true
    },
    source: 'traffic_management'
  },
  {
    id: 'incident-2',
    type: 'accident',
    severity: 'minor',
    title: 'Minor accident near Plaza Mayor',
    description: 'Two-vehicle accident causing minor delays',
    location: {
      coordinates: { lat: 6.2070, lng: -75.5660 },
      address: 'Carrera 50, Medellín'
    },
    affectedRoutes: ['Carrera 50'],
    startTime: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
    estimatedEndTime: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes from now
    impact: {
      delay: 2,
      detourRequired: false
    },
    source: 'traffic_report'
  }
]

export const bikeStations = [
  {
    id: 'bike-station-1',
    name: 'Parque Envigado',
    location: locations.parqueEnvigado.coordinates,
    capacity: 20,
    availableBikes: 12,
    availableDocks: 8,
    status: 'active',
    lastUpdate: new Date().toISOString(),
    address: 'Parque Envigado, Envigado'
  },
  {
    id: 'bike-station-2',
    name: 'Plaza Mayor',
    location: locations.plazaMayor.coordinates,
    capacity: 15,
    availableBikes: 5,
    availableDocks: 10,
    status: 'active',
    lastUpdate: new Date().toISOString(),
    address: 'Plaza Mayor, Medellín'
  },
  {
    id: 'bike-station-3',
    name: 'El Poblado',
    location: locations.elPoblado.coordinates,
    capacity: 25,
    availableBikes: 3,
    availableDocks: 22,
    status: 'maintenance',
    lastUpdate: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    address: 'El Poblado, Medellín'
  }
]

export const searchSuggestions = [
  {
    description: 'Parque Envigado, Envigado, Colombia',
    id: 'suggestion-1',
    matched_substrings: [{ offset: 0, length: 6 }],
    place_id: locations.parqueEnvigado.placeId,
    reference: 'test-reference-1',
    structured_formatting: {
      main_text: 'Parque Envigado',
      main_text_matched_substrings: [{ offset: 0, length: 6 }],
      secondary_text: 'Envigado, Colombia'
    },
    terms: [
      { offset: 0, value: 'Parque Envigado' },
      { offset: 16, value: 'Envigado' },
      { offset: 26, value: 'Colombia' }
    ],
    types: ['park', 'point_of_interest', 'establishment']
  },
  {
    description: 'Parque Lleras, Medellín, Colombia',
    id: 'suggestion-2',
    matched_substrings: [{ offset: 0, length: 6 }],
    place_id: locations.parqueLleras.placeId,
    reference: 'test-reference-2',
    structured_formatting: {
      main_text: 'Parque Lleras',
      main_text_matched_substrings: [{ offset: 0, length: 6 }],
      secondary_text: 'Medellín, Colombia'
    },
    terms: [
      { offset: 0, value: 'Parque Lleras' },
      { offset: 14, value: 'Medellín' },
      { offset: 24, value: 'Colombia' }
    ],
    types: ['park', 'point_of_interest', 'establishment']
  }
]

export const userPreferences = {
  mapType: 'roadmap' as 'roadmap' | 'satellite' | 'terrain' | 'hybrid',
  theme: 'light' as 'light' | 'dark',
  language: 'es',
  units: 'metric' as 'metric' | 'imperial',
  avoidTolls: false,
  avoidHighways: false,
  preferredTransportModes: ['transit', 'walking'],
  homeLocation: locations.parqueEnvigado,
  workLocation: locations.plazaMayor,
  savedLocations: [locations.parqueEnvigado, locations.plazaMayor],
  notifications: {
    traffic: true,
    incidents: true,
    routeUpdates: false
  }
}

export const performanceMetrics = {
  loadTime: 2500,
  firstContentfulPaint: 1200,
  largestContentfulPaint: 2000,
  firstInputDelay: 50,
  cumulativeLayoutShift: 0.1,
  timeToInteractive: 3000,
  memoryUsage: 1024 * 1024 * 10, // 10MB
  bundleSize: 1024 * 500, // 500KB
  apiResponseTime: 300,
  mapRenderTime: 800,
  searchResponseTime: 150
}

export const errorScenarios = {
  networkError: {
    status: 0,
    message: 'Network error occurred',
    type: 'NETWORK_ERROR'
  },
  apiError: {
    status: 500,
    message: 'Internal server error',
    type: 'API_ERROR'
  },
  geocodingError: {
    status: 'ZERO_RESULTS',
    message: 'No results found',
    type: 'GEOCODING_ERROR'
  },
  directionsError: {
    status: 'NOT_FOUND',
    message: 'Route not found',
    type: 'DIRECTIONS_ERROR'
  },
  permissionError: {
    status: 'PERMISSION_DENIED',
    message: 'Location permission denied',
    type: 'PERMISSION_ERROR'
  }
}

export const accessibilityData = {
  keyboardNavigation: {
    tabOrder: ['search-input', 'map-container', 'zoom-in', 'zoom-out', 'menu-button'],
    focusVisible: true,
    skipLinks: ['skip-to-main', 'skip-to-search']
  },
  screenReader: {
    labels: true,
    descriptions: true,
    announcements: ['map-updated', 'route-found', 'error-occurred']
  },
  colorContrast: {
    wcagAA: true,
    wcagAAA: false,
    ratio: 4.5
  },
  reducedMotion: {
    enabled: true,
    animations: ['fade', 'slide'],
    transitions: true
  }
}