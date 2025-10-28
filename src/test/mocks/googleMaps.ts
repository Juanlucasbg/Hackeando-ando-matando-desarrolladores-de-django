import { vi } from 'vitest'

// Mock Google Maps API objects and functions
export const mockGoogleMaps = {
  // Core Google Maps classes
  Map: vi.fn().mockImplementation((element, options) => ({
    setCenter: vi.fn(),
    getCenter: vi.fn().mockReturnValue({ lat: () => 6.2442, lng: () => -75.5812 }),
    setZoom: vi.fn(),
    getZoom: vi.fn().mockReturnValue(13),
    setMapTypeId: vi.fn(),
    getMapTypeId: vi.fn().mockReturnValue('roadmap'),
    setTilt: vi.fn(),
    getTilt: vi.fn().mockReturnValue(0),
    setHeading: vi.fn(),
    getHeading: vi.fn().mockReturnValue(0),
    setOptions: vi.fn(),
    getBounds: vi.fn().mockReturnValue({
      getNorthEast: () => ({ lat: () => 6.3, lng: () => -75.5 }),
      getSouthWest: () => ({ lat: () => 6.2, lng: () => -75.6 }),
      contains: vi.fn().mockReturnValue(true),
      extend: vi.fn(),
      intersects: vi.fn().mockReturnValue(true),
      isEmpty: vi.fn().mockReturnValue(false),
      toSpan: vi.fn().mockReturnValue({ lat: () => 0.1, lng: () => 0.1 }),
      toUrlValue: vi.fn().mockReturnValue('6.2442000,-75.5812000'),
      getCenter: vi.fn().mockReturnValue({ lat: () => 6.2442, lng: () => -75.5812 }),
    }),
    fitBounds: vi.fn(),
    panTo: vi.fn(),
    panBy: vi.fn(),
    panToBounds: vi.fn(),
    setHeading: vi.fn(),
    setTilt: vi.fn(),
    getProjection: vi.fn().mockReturnValue({
      fromLatLngToPoint: vi.fn().mockReturnValue({ x: 100, y: 100 }),
      fromPointToLatLng: vi.fn().mockReturnValue({ lat: () => 6.2442, lng: () => -75.5812 }),
    }),
    getDiv: vi.fn().mockReturnValue(element),
    getPanes: vi.fn().mockReturnValue({
      floatPane: document.createElement('div'),
      mapPane: document.createElement('div'),
      markerLayer: document.createElement('div'),
      overlayLayer: document.createElement('div'),
      overlayMouseTarget: document.createElement('div'),
    }),
    getFeatures: vi.fn().mockReturnValue([]),
    getStreetView: vi.fn().mockReturnValue({
      getPosition: vi.fn().mockReturnValue({ lat: () => 6.2442, lng: () => -75.5812 }),
      getPov: vi.fn().mockReturnValue({ heading: 0, pitch: 0, zoom: 1 }),
      setVisible: vi.fn(),
      getVisible: vi.fn().mockReturnValue(false),
      setPano: vi.fn(),
      getPano: vi.fn().mockReturnValue('test-pano'),
      setLinks: vi.fn(),
      getLinks: vi.fn().mockReturnValue([]),
      setPov: vi.fn(),
      setOptions: vi.fn(),
      setZoom: vi.fn(),
      getZoom: vi.fn().mockReturnValue(1),
    }),
    addListener: vi.fn().mockReturnValue({
      remove: vi.fn(),
    }),
    bindTo: vi.fn(),
    get: vi.fn(),
    notify: vi.fn(),
    set: vi.fn(),
    setValues: vi.fn(),
    unbind: vi.fn(),
    unbindAll: vi.fn(),
  })),

  Marker: vi.fn().mockImplementation((options) => ({
    setAnimation: vi.fn(),
    getAnimation: vi.fn().mockReturnValue(null),
    setClickable: vi.fn(),
    getClickable: vi.fn().mockReturnValue(true),
    setCursor: vi.fn(),
    getCursor: vi.fn().mockReturnValue('pointer'),
    setDraggable: vi.fn(),
    getDraggable: vi.fn().mockReturnValue(false),
    setIcon: vi.fn(),
    getIcon: vi.fn().mockReturnValue({}),
    setLabel: vi.fn(),
    getLabel: vi.fn().mockReturnValue(null),
    setMap: vi.fn(),
    getMap: vi.fn().mockReturnValue(null),
    setOpacity: vi.fn(),
    getOpacity: vi.fn().mockReturnValue(1),
    setOptions: vi.fn(),
    getPosition: vi.fn().mockReturnValue(options.position || { lat: () => 6.2442, lng: () => -75.5812 }),
    setPosition: vi.fn(),
    setShape: vi.fn(),
    getShape: vi.fn().mockReturnValue(null),
    setTitle: vi.fn(),
    getTitle: vi.fn().mockReturnValue(options.title || ''),
    setVisible: vi.fn(),
    getVisible: vi.fn().mockReturnValue(true),
    setZIndex: vi.fn(),
    getZIndex: vi.fn().mockReturnValue(0),
    addListener: vi.fn().mockReturnValue({ remove: vi.fn() }),
    bindTo: vi.fn(),
    get: vi.fn(),
    notify: vi.fn(),
    set: vi.fn(),
    setValues: vi.fn(),
    unbind: vi.fn(),
    unbindAll: vi.fn(),
  })),

  InfoWindow: vi.fn().mockImplementation((options) => ({
    close: vi.fn(),
    getContent: vi.fn().mockReturnValue(options.content || ''),
    getPosition: vi.fn().mockReturnValue(options.position || null),
    getZIndex: vi.fn().mockReturnValue(0),
    open: vi.fn(),
    setContent: vi.fn(),
    setOptions: vi.fn(),
    setPosition: vi.fn(),
    setZIndex: vi.fn(),
    addListener: vi.fn().mockReturnValue({ remove: vi.fn() }),
    bindTo: vi.fn(),
    get: vi.fn(),
    notify: vi.fn(),
    set: vi.fn(),
    setValues: vi.fn(),
    unbind: vi.fn(),
    unbindAll: vi.fn(),
  })),

  Polygon: vi.fn().mockImplementation((options) => ({
    getDraggable: vi.fn().mockReturnValue(false),
    getEditable: vi.fn().mockReturnValue(false),
    getMap: vi.fn().mockReturnValue(null),
    getPath: vi.fn().mockReturnValue([]),
    getPaths: vi.fn().mockReturnValue([]),
    getVisible: vi.fn().mockReturnValue(true),
    setDraggable: vi.fn(),
    setEditable: vi.fn(),
    setMap: vi.fn(),
    setOptions: vi.fn(),
    setPath: vi.fn(),
    setPaths: vi.fn(),
    setVisible: vi.fn(),
    addListener: vi.fn().mockReturnValue({ remove: vi.fn() }),
    bindTo: vi.fn(),
    get: vi.fn(),
    notify: vi.fn(),
    set: vi.fn(),
    setValues: vi.fn(),
    unbind: vi.fn(),
    unbindAll: vi.fn(),
  })),

  Polyline: vi.fn().mockImplementation((options) => ({
    getDraggable: vi.fn().mockReturnValue(false),
    getEditable: vi.fn().mockReturnValue(false),
    getMap: vi.fn().mockReturnValue(null),
    getPath: vi.fn().mockReturnValue([]),
    getVisible: vi.fn().mockReturnValue(true),
    setDraggable: vi.fn(),
    setEditable: vi.fn(),
    setMap: vi.fn(),
    setOptions: vi.fn(),
    setPath: vi.fn(),
    setVisible: vi.fn(),
    addListener: vi.fn().mockReturnValue({ remove: vi.fn() }),
    bindTo: vi.fn(),
    get: vi.fn(),
    notify: vi.fn(),
    set: vi.fn(),
    setValues: vi.fn(),
    unbind: vi.fn(),
    unbindAll: vi.fn(),
  })),

  Circle: vi.fn().mockImplementation((options) => ({
    getCenter: vi.fn().mockReturnValue(options.center || { lat: () => 6.2442, lng: () => -75.5812 }),
    getDraggable: vi.fn().mockReturnValue(false),
    getEditable: vi.fn().mockReturnValue(false),
    getMap: vi.fn().mockReturnValue(null),
    getRadius: vi.fn().mockReturnValue(options.radius || 100),
    getVisible: vi.fn().mockReturnValue(true),
    setCenter: vi.fn(),
    setDraggable: vi.fn(),
    setEditable: vi.fn(),
    setMap: vi.fn(),
    setOptions: vi.fn(),
    setRadius: vi.fn(),
    setVisible: vi.fn(),
    addListener: vi.fn().mockReturnValue({ remove: vi.fn() }),
    bindTo: vi.fn(),
    get: vi.fn(),
    notify: vi.fn(),
    set: vi.fn(),
    setValues: vi.fn(),
    unbind: vi.fn(),
    unbindAll: vi.fn(),
  })),

  // Google Maps services
  Geocoder: vi.fn().mockImplementation(() => ({
    geocode: vi.fn().mockImplementation((request, callback) => {
      const mockResults = [
        {
          address_components: [
            { long_name: 'Medellín', short_name: 'Medellín', types: ['locality'] },
            { long_name: 'Antioquia', short_name: 'Antioquia', types: ['administrative_area_level_1'] },
            { long_name: 'Colombia', short_name: 'CO', types: ['country'] }
          ],
          formatted_address: 'Medellín, Antioquia, Colombia',
          geometry: {
            location: { lat: () => 6.2442, lng: () => -75.5812 },
            location_type: 'APPROXIMATE',
            viewport: {
              northeast: { lat: () => 6.3, lng: () => -75.5 },
              southwest: { lat: () => 6.2, lng: () => -75.6 }
            }
          },
          place_id: 'ChIJJ4yLJ2BvoI4RqB2V8f1hG0M',
          types: ['locality', 'political']
        }
      ]
      callback(mockResults, 'OK')
    })
  })),

  DirectionsService: vi.fn().mockImplementation(() => ({
    route: vi.fn().mockImplementation((request, callback) => {
      const mockResult = {
        routes: [
          {
            bounds: {
              northeast: { lat: 6.3, lng: -75.5 },
              southwest: { lat: 6.2, lng: -75.6 }
            },
            copyrights: 'Map data ©2023 Google',
            legs: [
              {
                distance: { text: '5.2 km', value: 5200 },
                duration: { text: '15 mins', value: 900 },
                end_address: 'Plaza Mayor, Medellín, Colombia',
                end_location: { lat: 6.2094, lng: -75.5671 },
                start_address: 'Parque Envigado, Envigado, Colombia',
                start_location: { lat: 6.1700, lng: -75.5850 },
                steps: [],
                traffic_speed_entry: [],
                via_waypoints: []
              }
            ],
            overview_path: [
              { lat: 6.1700, lng: -75.5850 },
              { lat: 6.2094, lng: -75.5671 }
            ],
            overview_polyline: {
              points: 'mock_encoded_polyline'
            },
            summary: 'Calle 30',
            warnings: [],
            waypoint_order: [],
            fare: {
              currency: 'COP',
              value: 8500,
              text: '$8,500'
            }
          }
        ],
        status: 'OK'
      }
      callback(mockResult, 'OK')
    })
  })),

  PlacesService: vi.fn().mockImplementation(() => ({
    textSearch: vi.fn().mockImplementation((request, callback) => {
      const mockResults = [
        {
          formatted_address: 'Parque Envigado, Envigado, Colombia',
          geometry: {
            location: { lat: () => 6.1700, lng: () => -75.5850 },
            viewport: {
              northeast: { lat: 6.18, lng: -75.57 },
              southwest: { lat: 6.16, lng: -75.60 }
            }
          },
          icon: 'https://maps.gstatic.com/mapfiles/place_api/icons/v1/png_71/park-71.png',
          name: 'Parque Envigado',
          opening_hours: {
            open_now: true,
            periods: [],
            weekday_text: []
          },
          photos: [
            {
              height: 4032,
              html_attributions: [],
              photo_reference: 'mock_photo_reference',
              width: 3024
            }
          ],
          place_id: 'ChIJR1J7xZVvoI4R0B2V8f1hG0M',
          rating: 4.5,
          reference: 'mock_reference',
          types: ['park', 'point_of_interest', 'establishment'],
          user_ratings_total: 1250
        }
      ]
      callback(mockResults, 'OK')
    }),
    nearbySearch: vi.fn().mockImplementation((request, callback) => {
      const mockResults = [
        {
          name: 'Parque Envigado',
          rating: 4.5,
          types: ['park', 'point_of_interest', 'establishment'],
          user_ratings_total: 1250,
          vicinity: 'Envigado',
          geometry: {
            location: { lat: () => 6.1700, lng: () => -75.5850 }
          },
          place_id: 'ChIJR1J7xZVvoI4R0B2V8f1hG0M'
        }
      ]
      callback(mockResults, 'OK')
    }),
    getDetails: vi.fn().mockImplementation((request, callback) => {
      const mockResult = {
        address_components: [
          { long_name: 'Parque Envigado', short_name: 'Parque Envigado', types: ['point_of_interest'] }
        ],
        formatted_address: 'Parque Envigado, Envigado, Colombia',
        formatted_phone_number: '+57 4 3331234',
        geometry: {
          location: { lat: () => 6.1700, lng: () => -75.5850 },
          viewport: {
            northeast: { lat: 6.18, lng: -75.57 },
            southwest: { lat: 6.16, lng: -75.60 }
          }
        },
        icon: 'https://maps.gstatic.com/mapfiles/place_api/icons/v1/png_71/park-71.png',
        international_phone_number: '+57 4 3331234',
        name: 'Parque Envigado',
        opening_hours: {
          open_now: true,
          periods: [
            {
              open: { day: 0, time: '0600' },
              close: { day: 0, time: '1800' }
            }
          ],
          weekday_text: ['Monday: 6:00 AM – 6:00 PM']
        },
        photos: [
          {
            height: 4032,
            html_attributions: ['<a href="https://maps.google.com/maps/contrib/123456789">John Doe</a>'],
            photo_reference: 'mock_photo_reference',
            width: 3024
          }
        ],
        place_id: 'ChIJR1J7xZVvoI4R0B2V8f1hG0M',
        rating: 4.5,
        reference: 'mock_reference',
        reviews: [],
        types: ['park', 'point_of_interest', 'establishment'],
        url: 'https://maps.google.com/place/ChIJR1J7xZVvoI4R0B2V8f1hG0M',
        user_ratings_total: 1250,
        website: 'http://www.parqueenvigado.gov.co',
        utc_offset: -300
      }
      callback(mockResult, 'OK')
    })
  })),

  // Google Maps layers
  TrafficLayer: vi.fn().mockImplementation(() => ({
    setMap: vi.fn(),
    getMap: vi.fn().mockReturnValue(null),
  })),

  TransitLayer: vi.fn().mockImplementation(() => ({
    setMap: vi.fn(),
    getMap: vi.fn().mockReturnValue(null),
  })),

  BicyclingLayer: vi.fn().mockImplementation(() => ({
    setMap: vi.fn(),
    getMap: vi.fn().mockReturnValue(null),
  })),

  // Google Maps events
  event: {
    addListener: vi.fn().mockReturnValue({ remove: vi.fn() }),
    addListenerOnce: vi.fn().mockReturnValue({ remove: vi.fn() }),
    clearInstanceListeners: vi.fn(),
    clearListeners: vi.fn(),
    trigger: vi.fn(),
  },

  // Google Maps constants
  MapTypeId: {
    ROADMAP: 'roadmap',
    SATELLITE: 'satellite',
    HYBRID: 'hybrid',
    TERRAIN: 'terrain',
  },

  Animation: {
    DROP: 1,
    BOUNCE: 2,
  },

  ControlPosition: {
    TOP_LEFT: 1,
    TOP_CENTER: 2,
    TOP_RIGHT: 3,
    LEFT_TOP: 4,
    LEFT_CENTER: 5,
    LEFT_BOTTOM: 6,
    RIGHT_TOP: 7,
    RIGHT_CENTER: 8,
    RIGHT_BOTTOM: 9,
    BOTTOM_LEFT: 10,
    BOTTOM_CENTER: 11,
    BOTTOM_RIGHT: 12,
  },

  // Street View
  StreetViewPanorama: vi.fn().mockImplementation((element, options) => ({
    getPosition: vi.fn().mockReturnValue(options?.position || { lat: () => 6.2442, lng: () => -75.5812 }),
    getPov: vi.fn().mockReturnValue(options?.pov || { heading: 0, pitch: 0, zoom: 1 }),
    getZoom: vi.fn().mockReturnValue(options?.zoom || 1),
    getVisible: vi.fn().mockReturnValue(options?.visible || false),
    getPano: vi.fn().mockReturnValue(options?.pano || 'test-pano'),
    getLinks: vi.fn().mockReturnValue([]),
    setPosition: vi.fn(),
    setPov: vi.fn(),
    setZoom: vi.fn(),
    setVisible: vi.fn(),
    setPano: vi.fn(),
    setLinks: vi.fn(),
    setOptions: vi.fn(),
    registerPanoProvider: vi.fn(),
    addListener: vi.fn().mockReturnValue({ remove: vi.fn() }),
    bindTo: vi.fn(),
    get: vi.fn(),
    notify: vi.fn(),
    set: vi.fn(),
    setValues: vi.fn(),
    unbind: vi.fn(),
    unbindAll: vi.fn(),
  })),

  // Geometry library
  geometry: {
    spherical: {
      computeDistanceBetween: vi.fn().mockReturnValue(1000),
      computeHeading: vi.fn().mockReturnValue(45),
      computeOffset: vi.fn().mockReturnValue({ lat: () => 6.25, lng: () => -75.57 }),
      interpolate: vi.fn().mockReturnValue({ lat: () => 6.245, lng: () => -75.5805 }),
    },
    encoding: {
      decodePath: vi.fn().mockReturnValue([
        { lat: () => 6.1700, lng: () => -75.5850 },
        { lat: () => 6.2094, lng: () => -75.5671 }
      ]),
      encodePath: vi.fn().mockReturnValue('mock_encoded_path'),
    },
  },

  // Geocoder status constants
  GeocoderStatus: {
    ERROR: 'ERROR',
    INVALID_REQUEST: 'INVALID_REQUEST',
    OK: 'OK',
    OVER_QUERY_LIMIT: 'OVER_QUERY_LIMIT',
    REQUEST_DENIED: 'REQUEST_DENIED',
    UNKNOWN_ERROR: 'UNKNOWN_ERROR',
    ZERO_RESULTS: 'ZERO_RESULTS',
  },

  // Directions status constants
  DirectionsStatus: {
    INVALID_REQUEST: 'INVALID_REQUEST',
    MAX_WAYPOINTS_EXCEEDED: 'MAX_WAYPOINTS_EXCEEDED',
    NOT_FOUND: 'NOT_FOUND',
    OK: 'OK',
    OVER_QUERY_LIMIT: 'OVER_QUERY_LIMIT',
    REQUEST_DENIED: 'REQUEST_DENIED',
    UNKNOWN_ERROR: 'UNKNOWN_ERROR',
    ZERO_RESULTS: 'ZERO_RESULTS',
  },

  // Places status constants
  PlacesServiceStatus: {
    INVALID_REQUEST: 'INVALID_REQUEST',
    NOT_FOUND: 'NOT_FOUND',
    OK: 'OK',
    OVER_QUERY_LIMIT: 'OVER_QUERY_LIMIT',
    REQUEST_DENIED: 'REQUEST_DENIED',
    UNKNOWN_ERROR: 'UNKNOWN_ERROR',
    ZERO_RESULTS: 'ZERO_RESULTS',
  },
}

export const setupGoogleMapsMocks = () => {
  // Mock the Google Maps API loader
  vi.mock('@googlemaps/js-api-loader', () => ({
    Loader: vi.fn().mockImplementation(() => ({
      load: vi.fn().mockResolvedValue(mockGoogleMaps),
    })),
  }))

  // Mock the @react-google-maps/api library
  vi.mock('@react-google-maps/api', () => ({
    GoogleMap: vi.fn(({ children, ...props }) => (
      <div data-testid="google-map" {...props}>
        {children}
      </div>
    )),
    Marker: vi.fn(({ children, ...props }) => (
      <div data-testid="map-marker" {...props}>
        {children}
      </div>
    )),
    InfoWindow: vi.fn(({ children, ...props }) => (
      <div data-testid="info-window" {...props}>
        {children}
      </div>
    )),
    Polyline: vi.fn(({ children, ...props }) => (
      <div data-testid="polyline" {...props}>
        {children}
      </div>
    )),
    Polygon: vi.fn(({ children, ...props }) => (
      <div data-testid="polygon" {...props}>
        {children}
      </div>
    )),
    Circle: vi.fn(({ children, ...props }) => (
      <div data-testid="circle" {...props}>
        {children}
      </div>
    )),
    useJsApiLoader: vi.fn().mockReturnValue({
      isLoad: true,
      loadError: null,
    }),
  }))

  // Set up global google object
  global.google = mockGoogleMaps

  return mockGoogleMaps
}