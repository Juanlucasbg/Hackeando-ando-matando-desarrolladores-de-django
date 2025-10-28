import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import MapService, { getMapService, createMapService } from '../mapService';
import { Location } from '../../types';

// Mock Google Maps API
const mockGoogle = {
  maps: {
    Geocoder: vi.fn(),
    GeocoderStatus: {
      OK: 'OK',
      ZERO_RESULTS: 'ZERO_RESULTS',
      OVER_QUERY_LIMIT: 'OVER_QUERY_LIMIT',
      REQUEST_DENIED: 'REQUEST_DENIED',
      INVALID_REQUEST: 'INVALID_REQUEST',
      UNKNOWN_ERROR: 'UNKNOWN_ERROR',
    },
    places: {
      PlacesService: vi.fn(),
      PlacesServiceStatus: {
        OK: 'OK',
        ZERO_RESULTS: 'ZERO_RESULTS',
        OVER_QUERY_LIMIT: 'OVER_QUERY_LIMIT',
        REQUEST_DENIED: 'REQUEST_DENIED',
        INVALID_REQUEST: 'INVALID_REQUEST',
        NOT_FOUND: 'NOT_FOUND',
        UNKNOWN_ERROR: 'UNKNOWN_ERROR',
      },
      AutocompleteService: vi.fn(),
    },
    LatLng: vi.fn(),
    LatLngBounds: vi.fn(),
  },
};

// Mock JS API Loader
const mockLoader = {
  load: vi.fn(),
};

vi.mock('@googlemaps/js-api-loader', () => ({
  Loader: vi.fn(() => mockLoader),
}));

// Setup global google object
global.google = mockGoogle as any;

describe('MapService', () => {
  let mapService: MapService;
  const mockConfig = {
    apiKey: 'test-api-key',
    libraries: ['places', 'geometry'],
    language: 'en',
    region: 'US',
  };

  const mockGeocoder = {
    geocode: vi.fn(),
  };

  const mockPlacesService = {
    getDetails: vi.fn(),
  };

  const mockAutocompleteService = {
    getPlacePredictions: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup mock implementations
    mockGoogle.maps.Geocoder.mockImplementation(() => mockGeocoder);
    mockGoogle.maps.places.PlacesService.mockImplementation(() => mockPlacesService);
    mockGoogle.maps.places.AutocompleteService.mockImplementation(() => mockAutocompleteService);

    // Mock successful API loading
    mockLoader.load.mockResolvedValue(mockGoogle);

    // Reset singleton
    vi.doUnmock('../mapService');
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Initialization', () => {
    it('should create MapService instance with config', () => {
      mapService = new MapService(mockConfig);
      expect(mapService).toBeInstanceOf(MapService);
    });

    it('should initialize Google Maps API services', async () => {
      mapService = new MapService(mockConfig);
      await mapService.initialize();

      expect(mockLoader.load).toHaveBeenCalledWith();
      expect(mockGoogle.maps.Geocoder).toHaveBeenCalled();
      expect(mockGoogle.maps.places.AutocompleteService).toHaveBeenCalled();
    });

    it('should not initialize twice', async () => {
      mapService = new MapService(mockConfig);
      await mapService.initialize();
      await mapService.initialize(); // Second call should be ignored

      expect(mockLoader.load).toHaveBeenCalledTimes(1);
    });

    it('should handle initialization error', async () => {
      const errorMessage = 'API load failed';
      mockLoader.load.mockRejectedValue(new Error(errorMessage));

      mapService = new MapService(mockConfig);

      await expect(mapService.initialize()).rejects.toThrow(errorMessage);
    });

    it('should validate API key', () => {
      mapService = new MapService(mockConfig);

      expect(mapService.validateApiKey('valid-key')).toBe(true);
      expect(mapService.validateApiKey('')).toBe(false);
      expect(mapService.validateApiKey('your_api_key_here')).toBe(false);
    });

    it('should check if service is ready', async () => {
      mapService = new MapService(mockConfig);

      expect(mapService.isServiceReady()).toBe(false);

      await mapService.initialize();

      expect(mapService.isServiceReady()).toBe(true);
    });
  });

  describe('Geocoding', () => {
    beforeEach(async () => {
      mapService = new MapService(mockConfig);
      await mapService.initialize();
    });

    it('should geocode address successfully', async () => {
      const mockResult = {
        geometry: {
          location: {
            lat: () => 40.7128,
            lng: () => -74.0060,
          },
        },
        formatted_address: 'New York, NY, USA',
        place_id: 'test-place-id',
        address_components: [],
      };

      mockGeocoder.geocode.mockImplementation((request, callback) => {
        callback([mockResult], mockGoogle.maps.GeocoderStatus.OK);
      });

      const result = await mapService.geocodeAddress('New York');

      expect(result).toEqual({
        lat: 40.7128,
        lng: -74.0060,
        formattedAddress: 'New York, NY, USA',
        placeId: 'test-place-id',
        addressComponents: [],
      });

      expect(mockGeocoder.geocode).toHaveBeenCalledWith(
        { address: 'New York' },
        expect.any(Function)
      );
    });

    it('should handle geocoding errors', async () => {
      mockGeocoder.geocode.mockImplementation((request, callback) => {
        callback([], mockGoogle.maps.GeocoderStatus.ZERO_RESULTS);
      });

      await expect(mapService.geocodeAddress('Invalid Address')).rejects.toThrow(
        'No results found for the provided address'
      );
    });

    it('should handle rate limiting', async () => {
      mockGeocoder.geocode.mockImplementation((request, callback) => {
        callback([], mockGoogle.maps.GeocoderStatus.OVER_QUERY_LIMIT);
      });

      await expect(mapService.geocodeAddress('Test Address')).rejects.toThrow(
        'Too many requests. Please try again later'
      );
    });

    it('should reverse geocode successfully', async () => {
      const mockResult = {
        geometry: {
          location: {
            lat: () => 40.7128,
            lng: () => -74.0060,
          },
        },
        formatted_address: 'New York, NY, USA',
        place_id: 'test-place-id',
        address_components: [],
      };

      mockGeocoder.geocode.mockImplementation((request, callback) => {
        callback([mockResult], mockGoogle.maps.GeocoderStatus.OK);
      });

      const location: Location = { lat: 40.7128, lng: -74.0060 };
      const result = await mapService.reverseGeocode(location);

      expect(result).toEqual({
        lat: 40.7128,
        lng: -74.0060,
        formattedAddress: 'New York, NY, USA',
        placeId: 'test-place-id',
        addressComponents: [],
      });

      expect(mockGeocoder.geocode).toHaveBeenCalledWith(
        { location: expect.any(Object) },
        expect.any(Function)
      );
    });
  });

  describe('Places Autocomplete', () => {
    beforeEach(async () => {
      mapService = new MapService(mockConfig);
      await mapService.initialize();
    });

    it('should get place predictions successfully', async () => {
      const mockPredictions = [
        {
          description: 'New York, NY, USA',
          place_id: 'test-place-id-1',
          structured_formatting: {
            main_text: 'New York',
            secondary_text: 'NY, USA',
          },
        },
        {
          description: 'Newark, NJ, USA',
          place_id: 'test-place-id-2',
          structured_formatting: {
            main_text: 'Newark',
            secondary_text: 'NJ, USA',
          },
        },
      ];

      mockAutocompleteService.getPlacePredictions.mockImplementation((request, callback) => {
        callback(mockPredictions, mockGoogle.maps.places.PlacesServiceStatus.OK);
      });

      const results = await mapService.getPlacePredictions('New');

      expect(results).toEqual(mockPredictions);
      expect(mockAutocompleteService.getPlacePredictions).toHaveBeenCalledWith(
        {
          input: 'New',
          types: ['geocode', 'establishment'],
          componentRestrictions: { country: 'us' },
        },
        expect.any(Function)
      );
    });

    it('should return empty array on autocomplete error', async () => {
      mockAutocompleteService.getPlacePredictions.mockImplementation((request, callback) => {
        callback([], mockGoogle.maps.places.PlacesServiceStatus.ZERO_RESULTS);
      });

      const results = await mapService.getPlacePredictions('Invalid');

      expect(results).toEqual([]);
    });

    it('should use custom options for autocomplete', async () => {
      const customOptions = {
        types: ['cities'],
        componentRestrictions: { country: ['us', 'ca'] },
        location: { lat: 40.7128, lng: -74.0060 },
        radius: 100000,
      };

      mockAutocompleteService.getPlacePredictions.mockImplementation((request, callback) => {
        callback([], mockGoogle.maps.places.PlacesServiceStatus.OK);
      });

      await mapService.getPlacePredictions('New', customOptions);

      expect(mockAutocompleteService.getPlacePredictions).toHaveBeenCalledWith(
        {
          input: 'New',
          types: ['cities'],
          componentRestrictions: { country: ['us', 'ca'] },
          location: { lat: 40.7128, lng: -74.0060 },
          radius: 100000,
        },
        expect.any(Function)
      );
    });
  });

  describe('Places Details', () => {
    const mockMapElement = document.createElement('div');

    beforeEach(async () => {
      mapService = new MapService(mockConfig);
      await mapService.initialize(mockMapElement);
    });

    it('should get place details successfully', async () => {
      const mockPlaceDetails = {
        place_id: 'test-place-id',
        formatted_address: 'Test Address',
        name: 'Test Place',
        rating: 4.5,
        geometry: {
          location: {
            lat: () => 40.7128,
            lng: () => -74.0060,
          },
        },
      };

      mockPlacesService.getDetails.mockImplementation((request, callback) => {
        callback(mockPlaceDetails, mockGoogle.maps.places.PlacesServiceStatus.OK);
      });

      const result = await mapService.getPlaceDetails('test-place-id');

      expect(result).toEqual(mockPlaceDetails);
      expect(mockPlacesService.getDetails).toHaveBeenCalledWith(
        {
          placeId: 'test-place-id',
          fields: [
            'place_id',
            'formatted_address',
            'geometry',
            'name',
            'photos',
            'rating',
            'user_ratings_total',
          ],
        },
        expect.any(Function)
      );
    });

    it('should use custom fields for place details', async () => {
      const customFields = ['name', 'rating', 'opening_hours'];

      mockPlacesService.getDetails.mockImplementation((request, callback) => {
        callback({}, mockGoogle.maps.places.PlacesServiceStatus.OK);
      });

      await mapService.getPlaceDetails('test-place-id', customFields);

      expect(mockPlacesService.getDetails).toHaveBeenCalledWith(
        {
          placeId: 'test-place-id',
          fields: customFields,
        },
        expect.any(Function)
      );
    });

    it('should handle place details error', async () => {
      mockPlacesService.getDetails.mockImplementation((request, callback) => {
        callback(null, mockGoogle.maps.places.PlacesServiceStatus.NOT_FOUND);
      });

      await expect(mapService.getPlaceDetails('invalid-id')).rejects.toThrow(
        'Place not found'
      );
    });
  });

  describe('Distance Calculation', () => {
    beforeEach(async () => {
      mapService = new MapService(mockConfig);
      await mapService.initialize();
    });

    it('should calculate distance in miles', () => {
      const origin: Location = { lat: 40.7128, lng: -74.0060 }; // New York
      const destination: Location = { lat: 40.7589, lng: -73.9851 }; // Times Square

      const distance = mapService.calculateDistance(origin, destination, 'miles');

      expect(distance).toBeGreaterThan(0);
      expect(distance).toBeLessThan(10); // Should be a few miles
    });

    it('should calculate distance in kilometers', () => {
      const origin: Location = { lat: 40.7128, lng: -74.0060 }; // New York
      const destination: Location = { lat: 40.7589, lng: -73.9851 }; // Times Square

      const distance = mapService.calculateDistance(origin, destination, 'kilometers');

      expect(distance).toBeGreaterThan(0);
      expect(distance).toBeLessThan(20); // Should be a few kilometers
    });
  });

  describe('Singleton Pattern', () => {
    it('should return same instance with getMapService', () => {
      const service1 = getMapService(mockConfig);
      const service2 = getMapService();

      expect(service1).toBe(service2);
    });

    it('should throw error when getting singleton without config', () => {
      expect(() => getMapService()).toThrow('MapService config required for first initialization');
    });

    it('should create new instance with createMapService', () => {
      const service1 = createMapService(mockConfig);
      const service2 = createMapService(mockConfig);

      expect(service1).not.toBe(service2);
      expect(service1).toBeInstanceOf(MapService);
      expect(service2).toBeInstanceOf(MapService);
    });
  });

  describe('Error Handling', () => {
    beforeEach(async () => {
      mapService = new MapService(mockConfig);
      await mapService.initialize();
    });

    it('should handle missing geocoder on uninitialized service', async () => {
      const uninitializedService = new MapService(mockConfig);

      await expect(uninitializedService.geocodeAddress('Test')).rejects.toThrow(
        'Geocoder not initialized'
      );
    });

    it('should handle missing places service on uninitialized service', async () => {
      const uninitializedService = new MapService(mockConfig);

      await expect(uninitializedService.getPlaceDetails('test-id')).rejects.toThrow(
        'Places service not initialized'
      );
    });

    it('should handle missing autocomplete service on uninitialized service', async () => {
      const uninitializedService = new MapService(mockConfig);

      await expect(uninitializedService.getPlacePredictions('Test')).rejects.toThrow(
        'Autocomplete service not initialized'
      );
    });

    it('should ensure initialization before operations', async () => {
      const service = new MapService(mockConfig);
      // Don't manually initialize

      const mockResult = {
        geometry: {
          location: {
            lat: () => 40.7128,
            lng: () => -74.0060,
          },
        },
        formatted_address: 'Test Address',
        place_id: 'test-id',
      };

      mockGeocoder.geocode.mockImplementation((request, callback) => {
        callback([mockResult], mockGoogle.maps.GeocoderStatus.OK);
      });

      const result = await service.geocodeAddress('Test');

      expect(result).toEqual({
        lat: 40.7128,
        lng: -74.0060,
        formattedAddress: 'Test Address',
        placeId: 'test-id',
      });
    });
  });
});