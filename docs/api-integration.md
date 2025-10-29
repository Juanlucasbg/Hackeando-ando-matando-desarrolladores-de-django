# API Integration Documentation

This guide covers all API integrations used in the Google Maps Clone application, with detailed implementation examples and best practices.

## Overview

The application integrates with several Google Maps Platform APIs:

- **Google Maps JavaScript API** - Interactive maps and visualization
- **Geocoding API** - Address to coordinate conversion
- **Places API** - Location search and autocomplete
- **Street View API** - 360-degree imagery (optional)

## Google Maps JavaScript API

### API Setup

```typescript
// src/services/mapService.ts
import { Loader } from '@googlemaps/js-api-loader';

class MapService {
  private loader: Loader;
  private maps: typeof google.maps | null = null;

  constructor() {
    this.loader = new Loader({
      apiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY!,
      version: 'weekly',
      libraries: ['places', 'geometry'],
      language: 'es',
      region: 'CO',
    });
  }

  async loadMaps(): Promise<typeof google.maps> {
    if (!this.maps) {
      this.maps = await this.loader.load();
    }
    return this.maps;
  }
}
```

### Map Initialization

```typescript
// src/hooks/useMap.ts
import { useCallback, useEffect, useRef } from 'react';
import { useMapStore } from '../stores/mapStore';

export const useMap = (containerId: string) => {
  const mapRef = useRef<google.maps.Map | null>(null);
  const { initializeMap, setCenter, setZoom } = useMapStore();

  useEffect(() => {
    if (!containerId) return;

    const initialize = async () => {
      try {
        const container = document.getElementById(containerId);
        if (!container) return;

        const google = await mapService.loadMaps();
        const map = new google.maps.Map(container, {
          center: { lat: 6.2442, lng: -75.5812 }, // Medellín
          zoom: 13,
          mapTypeControl: false,
          streetViewControl: true,
          fullscreenControl: false,
          styles: mapStyles.default,
          gestureHandling: 'cooperative',
        });

        mapRef.current = map;
        initializeMap(map);

        // Add event listeners
        map.addListener('center_changed', () => {
          const center = map.getCenter();
          if (center) {
            setCenter({ lat: center.lat(), lng: center.lng() });
          }
        });

        map.addListener('zoom_changed', () => {
          setZoom(map.getZoom() || 13);
        });

      } catch (error) {
        console.error('Failed to initialize map:', error);
      }
    };

    initialize();
  }, [containerId, initializeMap, setCenter, setZoom]);

  return {
    map: mapRef.current,
  };
};
```

### Custom Map Styles

```typescript
// src/utils/mapStyles.ts
export const mapStyles = {
  default: [
    {
      featureType: 'water',
      elementType: 'geometry',
      stylers: [{ color: '#e9e9e9' }, { lightness: 17 }]
    },
    {
      featureType: 'landscape',
      elementType: 'geometry',
      stylers: [{ color: '#f5f5f5' }, { lightness: 20 }]
    },
    // ... more style rules
  ],

  dark: [
    {
      elementType: 'geometry',
      stylers: [{ color: '#212121' }]
    },
    {
      elementType: 'labels.icon',
      stylers: [{ visibility: 'off' }]
    },
    {
      elementType: 'labels.text.fill',
      stylers: [{ color: '#757575' }]
    },
    // ... dark mode styles
  ],

  minimal: [
    {
      featureType: 'poi',
      stylers: [{ visibility: 'off' }]
    },
    {
      featureType: 'transit',
      stylers: [{ visibility: 'off' }]
    }
  ]
};
```

### Map Controls Implementation

```typescript
// src/components/map/MapControls.tsx
import { useCallback } from 'react';
import { useMap } from '../../hooks/useMap';

const MapControls: React.FC = () => {
  const { map } = useMap();

  const handleZoomIn = useCallback(() => {
    if (map) {
      const currentZoom = map.getZoom() || 13;
      map.setZoom(currentZoom + 1);
    }
  }, [map]);

  const handleZoomOut = useCallback(() => {
    if (map) {
      const currentZoom = map.getZoom() || 13;
      map.setZoom(currentZoom - 1);
    }
  }, [map]);

  const handleToggleTraffic = useCallback(() => {
    if (map) {
      const trafficLayer = new google.maps.TrafficLayer();
      trafficLayer.setMap(trafficLayer.getMap() ? null : map);
    }
  }, [map]);

  return (
    <div className="absolute top-4 right-4 flex flex-col gap-2">
      <button onClick={handleZoomIn} className="map-control-btn">
        <ZoomInIcon />
      </button>
      <button onClick={handleZoomOut} className="map-control-btn">
        <ZoomOutIcon />
      </button>
      <button onClick={handleToggleTraffic} className="map-control-btn">
        <TrafficIcon />
      </button>
    </div>
  );
};
```

## Geocoding API Integration

### Geocoding Service

```typescript
// src/services/geocodingService.ts
import { Loader } from '@googlemaps/js-api-loader';
import {
  GeocodingResult,
  GeocodingRequest,
  GeocodingError,
  AutocompletePrediction,
  AutocompleteRequest,
  PlaceDetails,
  Location
} from '../types/search.types';

class GeocodingService {
  private static instance: GeocodingService;
  private loader: Loader;
  private maps: typeof google.maps | null = null;
  private geocoder: google.maps.Geocoder | null = null;
  private autocompleteService: google.maps.places.AutocompleteService | null = null;
  private placesService: google.maps.places.PlacesService | null = null;

  // Cache implementation
  private cache: Map<string, GeocodingResult> = new Map();
  private autocompleteCache: Map<string, AutocompletePrediction[]> = new Map();
  private placeDetailsCache: Map<string, PlaceDetails> = new Map();

  // Rate limiting
  private requestQueue: Array<() => Promise<any>> = [];
  private isProcessingQueue = false;
  private readonly MAX_REQUESTS_PER_SECOND = 50;
  private requestCount = 0;
  private lastRequestTime = 0;

  private constructor() {
    this.loader = new Loader({
      apiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY!,
      version: 'weekly',
      libraries: ['places', 'geometry'],
      language: 'es',
      region: 'CO',
    });
  }

  static getInstance(): GeocodingService {
    if (!GeocodingService.instance) {
      GeocodingService.instance = new GeocodingService();
    }
    return GeocodingService.instance;
  }

  private async loadMaps(): Promise<typeof google.maps> {
    if (!this.maps) {
      this.maps = await this.loader.load();
    }
    return this.maps;
  }

  // Forward Geocoding
  async geocode(request: GeocodingRequest): Promise<GeocodingResult[]> {
    const cacheKey = this.generateCacheKey(request);

    // Check cache first
    if (this.cache.has(cacheKey)) {
      return [this.cache.get(cacheKey)!];
    }

    return this.rateLimitRequest(async () => {
      const geocoder = await this.getGeocoder();
      const google = await this.loadMaps();

      return new Promise((resolve, reject) => {
        const geocoderRequest: google.maps.GeocoderRequest = {
          ...request,
          region: request.region || 'CO',
          language: request.language || 'es',
        };

        geocoder.geocode(geocoderRequest, (results, status) => {
          if (status === google.maps.GeocoderStatus.OK && results && results.length > 0) {
            const geocodingResults: GeocodingResult[] = results.map(result => ({
              location: {
                lat: result.geometry.location.lat(),
                lng: result.geometry.location.lng(),
                address: result.formatted_address,
                placeId: result.place_id,
              },
              formattedAddress: result.formatted_address,
              addressComponents: result.address_components.map(component => ({
                longName: component.long_name,
                shortName: component.short_name,
                types: component.types,
              })),
              placeId: result.place_id,
              types: result.types,
              viewport: result.geometry.viewport,
            }));

            // Cache the first result
            if (geocodingResults.length > 0) {
              this.cache.set(cacheKey, geocodingResults[0]);
              this.setCacheExpiry(cacheKey, 'geocode');
            }

            resolve(geocodingResults);
          } else {
            const error: GeocodingError = {
              code: status,
              message: this.getGeocodingErrorMessage(status),
              status,
            };
            reject(error);
          }
        });
      });
    });
  }

  // Reverse Geocoding
  async reverseGeocode(location: Location): Promise<GeocodingResult[]> {
    return this.geocode({ location });
  }

  // Autocomplete Service
  async getAutocompletePredictions(request: AutocompleteRequest): Promise<AutocompletePrediction[]> {
    const cacheKey = JSON.stringify(request);

    // Check cache first
    if (this.autocompleteCache.has(cacheKey)) {
      return this.autocompleteCache.get(cacheKey)!;
    }

    return this.rateLimitRequest(async () => {
      const autocompleteService = await this.getAutocompleteService();

      return new Promise((resolve, reject) => {
        const autocompleteRequest: google.maps.places.AutocompletionRequest = {
          input: request.input,
          location: request.location ? new google.maps.LatLng(request.location.lat, request.location.lng) : undefined,
          radius: request.radius || 50000, // 50km default
          language: request.language || 'es',
          region: request.region || 'CO',
          types: request.types,
          strictBounds: request.strictBounds || false,
          componentRestrictions: request.componentRestrictions,
        };

        autocompleteService.getPlacePredictions(autocompleteRequest, (predictions, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
            const results: AutocompletePrediction[] = predictions.map(prediction => ({
              placeId: prediction.place_id,
              description: prediction.description,
              mainText: prediction.structured_formatting?.main_text || prediction.description,
              secondaryText: prediction.structured_formatting?.secondary_text,
              terms: prediction.terms?.map(term => ({
                offset: term.offset,
                value: term.value,
              })) || [],
              types: prediction.types,
            }));

            // Cache results
            this.autocompleteCache.set(cacheKey, results);
            this.setCacheExpiry(cacheKey, 'autocomplete');

            resolve(results);
          } else {
            reject(new Error(`Autocomplete failed: ${status}`));
          }
        });
      });
    });
  }

  // Place Details
  async getPlaceDetails(placeId: string, fields: string[] = ['place_id', 'name', 'formatted_address', 'geometry']): Promise<PlaceDetails> {
    if (this.placeDetailsCache.has(placeId)) {
      return this.placeDetailsCache.get(placeId)!;
    }

    return this.rateLimitRequest(async () => {
      const placesService = await this.getPlacesService();

      return new Promise((resolve, reject) => {
        const request: google.maps.places.PlaceDetailsRequest = {
          placeId,
          fields: fields as google.maps.places.PlaceDetailsField[],
          language: 'es',
        };

        placesService.getDetails(request, (place, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && place) {
            const result: PlaceDetails = {
              placeId: place.place_id!,
              name: place.name!,
              address: place.formatted_address!,
              location: {
                lat: place.geometry!.location!.lat(),
                lng: place.geometry!.location!.lng(),
              },
              phoneNumber: place.formatted_phone_number,
              website: place.website,
              rating: place.rating,
              userRatingsTotal: place.user_ratings_total,
              photos: place.photos?.map(photo => ({
                url: photo.getUrl({ maxWidth: 800, maxHeight: 600 })!,
                width: photo.width!,
                height: photo.height!,
                htmlAttributions: photo.html_attributions,
              })),
              openingHours: place.opening_hours ? {
                openNow: place.opening_hours.open_now!,
                periods: place.opening_hours.periods?.map(period => ({
                  open: {
                    day: period.open.day,
                    hours: period.open.hours,
                    minutes: period.open.minutes,
                  },
                  close: period.close ? {
                    day: period.close.day,
                    hours: period.close.hours,
                    minutes: period.close.minutes,
                  } : undefined,
                })) || [],
                weekdayText: place.opening_hours.weekday_text || [],
              } : undefined,
              priceLevel: place.price_level,
              types: place.types || [],
              vicinity: place.vicinity,
            };

            // Cache result
            this.placeDetailsCache.set(placeId, result);
            this.setCacheExpiry(placeId, 'place-details');

            resolve(result);
          } else {
            reject(new Error(`Place details failed: ${status}`));
          }
        });
      });
    });
  }

  // Rate limiting implementation
  private async rateLimitRequest<T>(requestFn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.requestQueue.push(async () => {
        try {
          const result = await requestFn();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });

      this.processQueue();
    });
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessingQueue || this.requestQueue.length === 0) {
      return;
    }

    this.isProcessingQueue = true;

    while (this.requestQueue.length > 0) {
      const now = Date.now();

      // Reset request count if more than a second has passed
      if (now - this.lastRequestTime > 1000) {
        this.requestCount = 0;
        this.lastRequestTime = now;
      }

      // Wait if we've exceeded the rate limit
      if (this.requestCount >= this.MAX_REQUESTS_PER_SECOND) {
        const waitTime = 1000 - (now - this.lastRequestTime);
        if (waitTime > 0) {
          await new Promise(resolve => setTimeout(resolve, waitTime));
          continue;
        }
      }

      const request = this.requestQueue.shift();
      if (request) {
        this.requestCount++;
        try {
          await request();
        } catch (error) {
          console.error('Geocoding request failed:', error);
        }
      }
    }

    this.isProcessingQueue = false;
  }

  // Helper methods
  private generateCacheKey(request: GeocodingRequest): string {
    if (request.address) return `address:${request.address}:${request.region || ''}:${request.language || ''}`;
    if (request.location) return `coords:${request.location.lat},${request.location.lng}:${request.language || ''}`;
    if (request.placeId) return `place:${request.placeId}:${request.language || ''}`;
    return JSON.stringify(request);
  }

  private setCacheExpiry(key: string, type: 'geocode' | 'autocomplete' | 'place-details'): void {
    const expiryTime = type === 'geocode' ? 24 * 60 * 60 * 1000 : // 24 hours
                       type === 'place-details' ? 24 * 60 * 60 * 1000 : // 24 hours
                       60 * 60 * 1000; // 1 hour for autocomplete

    setTimeout(() => {
      if (type === 'geocode') this.cache.delete(key);
      else if (type === 'autocomplete') this.autocompleteCache.delete(key);
      else if (type === 'place-details') this.placeDetailsCache.delete(key);
    }, expiryTime);
  }

  private getGeocodingErrorMessage(status: google.maps.GeocoderStatus): string {
    const errorMessages = {
      [google.maps.GeocoderStatus.ZERO_RESULTS]: 'No se encontraron resultados para la dirección proporcionada',
      [google.maps.GeocoderStatus.OVER_QUERY_LIMIT]: 'Se ha excedido el límite de solicitudes. Por favor, inténtelo más tarde',
      [google.maps.GeocoderStatus.REQUEST_DENIED]: 'El servicio de geocodificación ha sido denegado',
      [google.maps.GeocoderStatus.INVALID_REQUEST]: 'La solicitud de geocodificación no es válida',
      [google.maps.GeocoderStatus.UNKNOWN_ERROR]: 'Error desconocido en el servidor. Por favor, inténtelo de nuevo',
    };

    return errorMessages[status] || `Error de geocodificación: ${status}`;
  }
}

export const geocodingService = GeocodingService.getInstance();
```

## React Hook Integration

### useGeocoding Hook

```typescript
// src/hooks/useGeocoding.ts
import { useState, useCallback, useRef } from 'react';
import { geocodingService } from '../services/geocodingService';
import {
  GeocodingResult,
  AutocompletePrediction,
  PlaceDetails,
  Location,
  GeocodingError
} from '../types/search.types';

interface UseGeocodingState {
  isLoading: boolean;
  error: string | null;
  results: GeocodingResult[];
  predictions: AutocompletePrediction[];
  placeDetails: PlaceDetails | null;
}

interface UseGeocodingReturn extends UseGeocodingState {
  geocode: (request: { address?: string; location?: Location; placeId?: string }) => Promise<GeocodingResult[]>;
  reverseGeocode: (location: Location) => Promise<GeocodingResult[]>;
  getPredictions: (input: string, options?: { location?: Location; radius?: number }) => Promise<AutocompletePrediction[]>;
  getPlaceDetails: (placeId: string) => Promise<PlaceDetails>;
  clearResults: () => void;
  clearError: () => void;
}

export const useGeocoding = (): UseGeocodingReturn => {
  const [state, setState] = useState<UseGeocodingState>({
    isLoading: false,
    error: null,
    results: [],
    predictions: [],
    placeDetails: null,
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, isLoading: loading }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error }));
  }, []);

  const setResults = useCallback((results: GeocodingResult[]) => {
    setState(prev => ({ ...prev, results }));
  }, []);

  const setPredictions = useCallback((predictions: AutocompletePrediction[]) => {
    setState(prev => ({ ...prev, predictions }));
  }, []);

  const setPlaceDetails = useCallback((details: PlaceDetails | null) => {
    setState(prev => ({ ...prev, placeDetails: details }));
  }, []);

  const geocode = useCallback(async (request: { address?: string; location?: Location; placeId?: string }) => {
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    setLoading(true);
    setError(null);

    try {
      const results = await geocodingService.geocode(request);
      setResults(results);
      return results;
    } catch (error) {
      const errorMessage = error instanceof GeocodingError ? error.message : 'Geocoding failed';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError, setResults]);

  const reverseGeocode = useCallback(async (location: Location) => {
    setLoading(true);
    setError(null);

    try {
      const results = await geocodingService.reverseGeocode(location);
      setResults(results);
      return results;
    } catch (error) {
      const errorMessage = error instanceof GeocodingError ? error.message : 'Reverse geocoding failed';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError, setResults]);

  const getPredictions = useCallback(async (input: string, options?: { location?: Location; radius?: number }) => {
    if (input.length < 2) {
      setPredictions([]);
      return [];
    }

    setLoading(true);
    setError(null);

    try {
      const predictions = await geocodingService.getAutocompletePredictions({
        input,
        location: options?.location,
        radius: options?.radius,
      });
      setPredictions(predictions);
      return predictions;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Autocomplete failed';
      setError(errorMessage);
      setPredictions([]);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError, setPredictions]);

  const getPlaceDetails = useCallback(async (placeId: string) => {
    setLoading(true);
    setError(null);

    try {
      const details = await geocodingService.getPlaceDetails(placeId);
      setPlaceDetails(details);
      return details;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get place details';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError, setPlaceDetails]);

  const clearResults = useCallback(() => {
    setResults([]);
    setPredictions([]);
    setPlaceDetails(null);
  }, [setResults, setPredictions, setPlaceDetails]);

  const clearError = useCallback(() => {
    setError(null);
  }, [setError]);

  return {
    ...state,
    geocode,
    reverseGeocode,
    getPredictions,
    getPlaceDetails,
    clearResults,
    clearError,
  };
};
```

## React Query Integration

```typescript
// src/hooks/useGeocodingQuery.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { geocodingService } from '../services/geocodingService';
import {
  GeocodingResult,
  AutocompletePrediction,
  PlaceDetails,
  Location
} from '../types/search.types';

// Query keys
export const geocodingKeys = {
  geocode: ['geocoding', 'geocode'],
  reverseGeocode: ['geocoding', 'reverse-geocode'],
  autocomplete: ['geocoding', 'autocomplete'],
  placeDetails: ['geocoding', 'place-details'],
};

// Hooks for geocoding queries
export const useGeocodeQuery = (request: { address?: string; location?: Location; placeId?: string }) => {
  return useQuery({
    queryKey: [...geocodingKeys.geocode, request],
    queryFn: () => geocodingService.geocode(request),
    enabled: !!request.address || !!request.location || !!request.placeId,
    staleTime: 30 * 60 * 1000, // 30 minutes
    cacheTime: 60 * 60 * 1000, // 1 hour
  });
};

export const useReverseGeocodeQuery = (location: Location) => {
  return useQuery({
    queryKey: [...geocodingKeys.reverseGeocode, location],
    queryFn: () => geocodingService.reverseGeocode(location),
    enabled: !!location,
    staleTime: 30 * 60 * 1000,
    cacheTime: 60 * 60 * 1000,
  });
};

export const useAutocompleteQuery = (input: string, options?: { location?: Location; radius?: number }) => {
  return useQuery({
    queryKey: [...geocodingKeys.autocomplete, input, options],
    queryFn: () => geocodingService.getAutocompletePredictions({ input, ...options }),
    enabled: input.length >= 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const usePlaceDetailsQuery = (placeId: string) => {
  return useQuery({
    queryKey: [...geocodingKeys.placeDetails, placeId],
    queryFn: () => geocodingService.getPlaceDetails(placeId),
    enabled: !!placeId,
    staleTime: 60 * 60 * 1000, // 1 hour
    cacheTime: 24 * 60 * 60 * 1000, // 24 hours
  });
};

// Mutations for geocoding operations
export const useGeocodeMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: { address?: string; location?: Location; placeId?: string }) =>
      geocodingService.geocode(request),
    onSuccess: (data, variables) => {
      // Update cache
      queryClient.setQueryData([...geocodingKeys.geocode, variables], data);
    },
    onError: (error) => {
      console.error('Geocoding mutation failed:', error);
    },
  });
};
```

## Error Handling and Retry Logic

```typescript
// src/utils/apiErrorHandler.ts
export class APIError extends Error {
  constructor(
    message: string,
    public code: string,
    public status?: number,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export const handleAPIError = (error: unknown): APIError => {
  if (error instanceof APIError) {
    return error;
  }

  if (error instanceof Error) {
    // Google Maps API errors
    if (error.message.includes('Google Maps API')) {
      return new APIError(
        'Google Maps API error occurred',
        'GOOGLE_MAPS_API_ERROR',
        undefined,
        error
      );
    }

    // Network errors
    if (error.message.includes('Network') || error.message.includes('fetch')) {
      return new APIError(
        'Network error. Please check your connection.',
        'NETWORK_ERROR',
        undefined,
        error
      );
    }

    // Rate limiting errors
    if (error.message.includes('OVER_QUERY_LIMIT')) {
      return new APIError(
        'API rate limit exceeded. Please try again later.',
        'RATE_LIMIT_ERROR',
        429,
        error
      );
    }
  }

  return new APIError(
    'An unexpected error occurred',
    'UNKNOWN_ERROR',
    undefined,
    error instanceof Error ? error : new Error(String(error))
  );
};

// Retry configuration
export const retryConfig = {
  retry: (failureCount: number, error: APIError) => {
    // Don't retry on rate limit errors
    if (error.code === 'RATE_LIMIT_ERROR') {
      return false;
    }

    // Don't retry on authentication errors
    if (error.code === 'REQUEST_DENIED') {
      return false;
    }

    // Retry up to 3 times for other errors
    return failureCount < 3;
  },
  retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
};
```

## API Usage Examples

### Search Component Integration

```typescript
// src/components/search/SearchBar.tsx
import { useState, useCallback, useRef } from 'react';
import { useGeocoding } from '../../hooks/useGeocoding';
import { AutocompletePrediction } from '../../types/search.types';

const SearchBar: React.FC = () => {
  const [query, setQuery] = useState('');
  const [showPredictions, setShowPredictions] = useState(false);
  const {
    geocode,
    getPredictions,
    predictions,
    isLoading,
    error,
    clearResults,
  } = useGeocoding();

  const debouncedGetPredictions = useCallback(
    debounce((input: string) => {
      if (input.length >= 2) {
        getPredictions(input);
      }
    }, 300),
    [getPredictions]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setShowPredictions(true);

    if (value.length >= 2) {
      debouncedGetPredictions(value);
    } else {
      clearResults();
    }
  };

  const handlePredictionClick = async (prediction: AutocompletePrediction) => {
    try {
      const results = await geocode({ placeId: prediction.placeId });
      if (results.length > 0) {
        // Handle selected location
        onLocationSelect(results[0].location);
        setShowPredictions(false);
        setQuery(prediction.description);
      }
    } catch (error) {
      console.error('Failed to geocode prediction:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      try {
        const results = await geocode({ address: query });
        if (results.length > 0) {
          onLocationSelect(results[0].location);
          setShowPredictions(false);
        }
      } catch (error) {
        console.error('Search failed:', error);
      }
    }
  };

  return (
    <div className="relative">
      <form onSubmit={handleSubmit} className="relative">
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          placeholder="Search for a location..."
          className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <LoadingSpinner size="sm" />
          </div>
        )}
      </form>

      {showPredictions && predictions.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {predictions.map((prediction, index) => (
            <div
              key={prediction.placeId}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => handlePredictionClick(prediction)}
            >
              <div className="font-medium">{prediction.mainText}</div>
              {prediction.secondaryText && (
                <div className="text-sm text-gray-600">{prediction.secondaryText}</div>
              )}
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="mt-2 text-sm text-red-600">
          {error}
        </div>
      )}
    </div>
  );
};

// Utility function
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
```

### Coordinate Input Component

```typescript
// src/components/features/CoordinateInput.tsx
import { useState, useCallback } from 'react';
import { useGeocoding } from '../../hooks/useGeocoding';

const CoordinateInput: React.FC = () => {
  const [coordinates, setCoordinates] = useState({ lat: '', lng: '' });
  const [errors, setErrors] = useState({ lat: '', lng: '' });
  const { reverseGeocode, isLoading } = useGeocoding();

  const validateCoordinates = useCallback((lat: string, lng: string) => {
    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);

    const latError = isNaN(latNum) || latNum < -90 || latNum > 90
      ? 'Latitude must be between -90 and 90'
      : '';

    const lngError = isNaN(lngNum) || lngNum < -180 || lngNum > 180
      ? 'Longitude must be between -180 and 180'
      : '';

    return { lat: latError, lng: lngError };
  }, []);

  const handleCoordinateChange = useCallback((field: 'lat' | 'lng', value: string) => {
    const newCoordinates = { ...coordinates, [field]: value };
    setCoordinates(newCoordinates);

    const newErrors = validateCoordinates(newCoordinates.lat, newCoordinates.lng);
    setErrors(newErrors);

    // If both coordinates are valid, perform reverse geocoding
    if (!newErrors.lat && !newErrors.lng && newCoordinates.lat && newCoordinates.lng) {
      const location = {
        lat: parseFloat(newCoordinates.lat),
        lng: parseFloat(newCoordinates.lng),
      };
      reverseGeocode(location)
        .then(results => {
          if (results.length > 0) {
            onLocationSelect(results[0].location);
          }
        })
        .catch(error => {
          console.error('Reverse geocoding failed:', error);
        });
    }
  }, [coordinates, validateCoordinates, reverseGeocode]);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Enter Coordinates</h3>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="latitude" className="block text-sm font-medium text-gray-700 mb-1">
            Latitude
          </label>
          <input
            id="latitude"
            type="text"
            value={coordinates.lat}
            onChange={(e) => handleCoordinateChange('lat', e.target.value)}
            placeholder="e.g., 40.7128"
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.lat ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.lat && (
            <p className="mt-1 text-sm text-red-600">{errors.lat}</p>
          )}
        </div>

        <div>
          <label htmlFor="longitude" className="block text-sm font-medium text-gray-700 mb-1">
            Longitude
          </label>
          <input
            id="longitude"
            type="text"
            value={coordinates.lng}
            onChange={(e) => handleCoordinateChange('lng', e.target.value)}
            placeholder="e.g., -74.0060"
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.lng ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.lng && (
            <p className="mt-1 text-sm text-red-600">{errors.lng}</p>
          )}
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center">
          <LoadingSpinner size="sm" />
          <span className="ml-2 text-sm text-gray-600">Finding location...</span>
        </div>
      )}
    </div>
  );
};
```

## Performance Optimization

### API Request Debouncing

```typescript
// src/hooks/useDebounce.ts
import { useState, useEffect } from 'react';

export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Usage in search component
const SearchComponent = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedQuery = useDebounce(searchQuery, 300);

  useEffect(() => {
    if (debouncedQuery.length >= 2) {
      getPredictions(debouncedQuery);
    }
  }, [debouncedQuery]);

  return (
    <input
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      placeholder="Search location..."
    />
  );
};
```

### Request Caching Strategy

```typescript
// src/utils/cache.ts
class APICache {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

  set(key: string, data: any, ttl: number = 5 * 60 * 1000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  get(key: string): any | null {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  clear(): void {
    this.cache.clear();
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  // Clean up expired entries
  cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key);
      }
    }
  }
}

export const apiCache = new APICache();

// Cleanup expired cache entries periodically
setInterval(() => {
  apiCache.cleanup();
}, 60 * 60 * 1000); // Every hour
```

## Testing API Integration

### Mocking Google Maps API

```typescript
// src/__mocks__/@googlemaps/js-api-loader.ts
export const Loader = jest.fn().mockImplementation(() => ({
  load: jest.fn().mockResolvedValue({
    maps: {
      Map: jest.fn().mockImplementation(() => ({
        addListener: jest.fn(),
        getCenter: jest.fn().mockReturnValue({ lat: () => 40.7128, lng: () => -74.0060 }),
        getZoom: jest.fn().mockReturnValue(13),
        setCenter: jest.fn(),
        setZoom: jest.fn(),
        fitBounds: jest.fn(),
      })),
      Geocoder: jest.fn().mockImplementation(() => ({
        geocode: jest.fn().mockImplementation((request, callback) => {
          callback(
            [{
              geometry: { location: { lat: () => 40.7128, lng: () => -74.0060 } },
              formatted_address: 'New York, NY, USA',
              place_id: 'test-place-id',
            }],
            'OK'
          );
        }),
      })),
      GeocoderStatus: {
        OK: 'OK',
        ZERO_RESULTS: 'ZERO_RESULTS',
        OVER_QUERY_LIMIT: 'OVER_QUERY_LIMIT',
      },
      places: {
        AutocompleteService: jest.fn().mockImplementation(() => ({
          getPlacePredictions: jest.fn().mockImplementation((request, callback) => {
            callback(
              [{
                place_id: 'test-place-id',
                description: 'Test Location',
                structured_formatting: {
                  main_text: 'Test Location',
                  secondary_text: 'New York, NY',
                },
              }],
              'OK'
            );
          }),
        })),
        PlacesServiceStatus: {
          OK: 'OK',
        },
      },
    },
  }),
}));

// src/__mocks__/googlemaps.ts
export const google = {
  maps: {
    Map: jest.fn(),
    Geocoder: jest.fn(),
    places: {
      AutocompleteService: jest.fn(),
    },
  },
};
```

### Component Testing Example

```typescript
// src/components/search/__tests__/SearchBar.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SearchBar } from '../SearchBar';
import { geocodingService } from '../../../services/geocodingService';

// Mock the geocoding service
jest.mock('../../../services/geocodingService');
const mockGeocodingService = geocodingService as jest.Mocked<typeof geocodingService>;

describe('SearchBar', () => {
  const mockOnLocationSelect = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders search input', () => {
    render(<SearchBar onLocationSelect={mockOnLocationSelect} />);

    expect(screen.getByPlaceholderText('Search for a location...')).toBeInTheDocument();
  });

  it('calls geocoding service when form is submitted', async () => {
    const mockResults = [{
      location: { lat: 40.7128, lng: -74.0060 },
      formattedAddress: 'New York, NY, USA',
      placeId: 'test-place-id',
    }];

    mockGeocodingService.geocode.mockResolvedValue(mockResults);

    render(<SearchBar onLocationSelect={mockOnLocationSelect} />);

    const input = screen.getByPlaceholderText('Search for a location...');
    const form = input.closest('form');

    await userEvent.type(input, 'New York');
    fireEvent.submit(form!);

    await waitFor(() => {
      expect(mockGeocodingService.geocode).toHaveBeenCalledWith({ address: 'New York' });
      expect(mockOnLocationSelect).toHaveBeenCalledWith({ lat: 40.7128, lng: -74.0060 });
    });
  });

  it('displays autocomplete predictions', async () => {
    const mockPredictions = [{
      placeId: 'test-place-id',
      description: 'New York, NY, USA',
      mainText: 'New York',
      secondaryText: 'NY, USA',
    }];

    mockGeocodingService.getAutocompletePredictions.mockResolvedValue(mockPredictions);

    render(<SearchBar onLocationSelect={mockOnLocationSelect} />);

    const input = screen.getByPlaceholderText('Search for a location...');

    await userEvent.type(input, 'New York');

    await waitFor(() => {
      expect(screen.getByText('New York')).toBeInTheDocument();
      expect(screen.getByText('NY, USA')).toBeInTheDocument();
    });
  });

  it('handles API errors gracefully', async () => {
    mockGeocodingService.geocode.mockRejectedValue(new Error('API Error'));

    render(<SearchBar onLocationSelect={mockOnLocationSelect} />);

    const input = screen.getByPlaceholderText('Search for a location...');
    const form = input.closest('form');

    await userEvent.type(input, 'Invalid Address');
    fireEvent.submit(form!);

    await waitFor(() => {
      expect(screen.getByText(/API Error/)).toBeInTheDocument();
    });
  });
});
```

This comprehensive API integration documentation covers all aspects of working with Google Maps APIs in the application, from basic setup to advanced optimization and testing strategies.