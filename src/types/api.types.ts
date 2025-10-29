import { Location } from './common.types';

// API client configuration
export interface ApiClientConfig {
  baseURL: string;
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
  headers?: Record<string, string>;
  interceptors?: {
    request?: RequestInterceptor[];
    response?: ResponseInterceptor[];
  };
}

export interface RequestInterceptor {
  onFulfilled?: (config: RequestConfig) => RequestConfig;
  onRejected?: (error: any) => any;
}

export interface ResponseInterceptor {
  onFulfilled?: (response: ApiResponse) => ApiResponse;
  onRejected?: (error: ApiError) => any;
}

// HTTP request/response types
export interface RequestConfig {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  params?: Record<string, any>;
  data?: any;
  timeout?: number;
  signal?: AbortSignal;
}

export interface ApiResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  config: RequestConfig;
}

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  config?: RequestConfig;
  response?: ApiResponse;
  isAxiosError?: boolean;
}

// Waze API configuration types
export interface WazeConfig {
  apiKey: string;
  baseUrl?: string;
  language?: string;
  region?: string;
  timeout?: number;
}

// Map service configuration (unified interface)
export interface MapServiceConfig {
  apiKey: string;
  baseUrl?: string;
  version?: string;
  language?: string;
  region?: string;
  libraries?: string[];
  timeout?: number;
}

export interface WazeRouteRequest {
  from: {
    x: number; // longitude
    y: number; // latitude
  };
  to: {
    x: number; // longitude
    y: number; // latitude
  };
  options?: {
    avoidTolls?: boolean;
    avoidHighways?: boolean;
    avoidFerries?: boolean;
    vehicleType?: string;
  };
}

export interface WazeRouteResponse {
  response: {
    results: Array<{
      distance: number;
      duration: number;
      path: Array<{
        x: number;
        y: number;
      }>;
      restrictions?: string[];
      tolls?: boolean;
      highways?: boolean;
    }>;
  };
}

export interface WazeLocationResponse {
  response: {
    results: Array<{
      lat: number;
      lon: number;
      name: string;
      city?: string;
      state?: string;
      country?: string;
      address?: string;
    }>;
  };
}

// Google Maps API wrapper types (kept for backward compatibility)
export interface GoogleMapsConfig {
  apiKey: string;
  version?: string;
  language?: string;
  region?: string;
  libraries?: string[];
  mapId?: string;
  channel?: string;
}

export interface GeocodingRequest {
  address?: string;
  location?: Location;
  placeId?: string;
  language?: string;
  region?: string;
  componentRestrictions?: {
    country?: string;
    postalCode?: string;
    administrativeArea?: string;
    locality?: string;
    sublocality?: string;
  };
}

export interface GeocodingResponse {
  results: google.maps.GeocoderResult[];
  status: google.maps.GeocoderStatus;
}

export interface PlacesAutocompleteRequest {
  input: string;
  location?: Location;
  radius?: number;
  bounds?: google.maps.LatLngBounds;
  types?: string[];
  componentRestrictions?: GeocodingRequest['componentRestrictions'];
  strictBounds?: boolean;
  language?: string;
  region?: string;
}

export interface PlacesAutocompleteResponse {
  predictions: google.maps.places.AutocompletePrediction[];
  status: google.maps.places.PlacesServiceStatus;
}

export interface PlaceDetailsRequest {
  placeId: string;
  fields?: string[];
  language?: string;
  region?: string;
  sessionToken?: google.maps.places.AutocompleteSessionToken;
}

export interface PlaceDetailsResponse {
  result: google.maps.places.PlaceResult;
  status: google.maps.places.PlacesServiceStatus;
}

// Route planning API types
export interface RouteRequest {
  origin: Location;
  destination: Location;
  waypoints?: Location[];
  travelMode: google.maps.TravelMode;
  avoidTolls?: boolean;
  avoidHighways?: boolean;
  avoidFerries?: boolean;
  optimizeWaypoints?: boolean;
  unitSystem?: google.maps.UnitSystem;
  language?: string;
  region?: string;
}

export interface RouteResponse {
  routes: google.maps.DirectionsRoute[];
  status: google.maps.DirectionsStatus;
  availableTravelModes?: google.maps.TravelMode[];
  geocodedWaypoints?: google.maps.DirectionsGeocodedWaypoint[];
  request?: RouteRequest;
}

// Real-time data API types
export interface RealtimeConfig {
  url: string;
  reconnectAttempts: number;
  reconnectDelay: number;
  heartbeatInterval: number;
  timeout: number;
}

export interface RealtimeEvent {
  type: string;
  payload: any;
  timestamp: Date;
  id: string;
}

export interface TrafficDataEvent extends RealtimeEvent {
  type: 'traffic_update';
  payload: {
    location: Location;
    speed?: number;
    congestionLevel: 'low' | 'medium' | 'high';
    incidentType?: string;
    estimatedDelay?: number;
  };
}

export interface TransitDataEvent extends RealtimeEvent {
  type: 'transit_update';
  payload: {
    vehicleId: string;
    routeId: string;
    location: Location;
    heading?: number;
    speed?: number;
    nextStop?: string;
    arrivalTime?: Date;
    occupancyLevel?: 'low' | 'medium' | 'high';
  };
}

export interface IncidentDataEvent extends RealtimeEvent {
  type: 'incident_report';
  payload: {
    id: string;
    type: string;
    severity: 'low' | 'medium' | 'high';
    location: Location;
    affectedArea?: Location[];
    description: string;
    estimatedDuration?: number;
    startTime: Date;
    endTime?: Date;
  };
}

// WebSocket connection types
export interface WebSocketConfig {
  url: string;
  protocols?: string[];
  reconnectAttempts?: number;
  reconnectDelay?: number;
  maxReconnectDelay?: number;
  heartbeatInterval?: number;
  timeout?: number;
  headers?: Record<string, string>;
}

export interface WebSocketState {
  isConnected: boolean;
  isConnecting: boolean;
  reconnectAttempts: number;
  lastConnected?: Date;
  lastError?: string;
  subscriptions: Set<string>;
}

// Analytics API types
export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
  timestamp?: Date;
  userId?: string;
  sessionId?: string;
}

export interface AnalyticsConfig {
  endpoint?: string;
  enabled?: boolean;
  batchSize?: number;
  flushInterval?: number;
  maxRetries?: number;
}

// Error reporting API types
export interface ErrorReport {
  message: string;
  stack?: string;
  name?: string;
  cause?: any;
  metadata?: Record<string, any>;
  timestamp: Date;
  userAgent?: string;
  url?: string;
  userId?: string;
}

export interface ErrorReportingConfig {
  endpoint?: string;
  enabled?: boolean;
  environment?: string;
  release?: string;
  dist?: string;
  maxValueLength?: number;
  debug?: boolean;
}

// Storage API types
export interface StorageConfig {
  driver: 'localStorage' | 'sessionStorage' | 'indexedDB';
  dbName?: string;
  version?: number;
  storeName?: string;
  keyPrefix?: string;
  serialize?: boolean;
  encrypt?: boolean;
}

export interface CacheConfig {
  maxAge?: number; // in milliseconds
  maxSize?: number; // in bytes
  strategy?: 'lru' | 'fifo' | 'lfu';
  compressionEnabled?: boolean;
  encryptionEnabled?: boolean;
}

// Rate limiting API types
export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  message?: string;
  standardHeaders?: boolean;
  legacyHeaders?: boolean;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

export interface RateLimitState {
  remaining: number;
  resetTime: Date;
  isLimited: boolean;
  retryAfter?: number;
}