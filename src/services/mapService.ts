import { Loader } from '@googlemaps/js-api-loader';
import { Location, GeocodeResult, MapServiceConfig } from '../types';

class MapService {
  private loader: Loader;
  private geocoder: google.maps.Geocoder | null = null;
  private placesService: google.maps.places.PlacesService | null = null;
  private autocompleteService: google.maps.places.AutocompleteService | null = null;
  private isInitialized = false;

  constructor(config: MapServiceConfig) {
    this.loader = new Loader({
      apiKey: config.apiKey,
      version: config.version || 'weekly',
      libraries: config.libraries || ['places', 'geometry'],
      language: config.language || 'en',
      region: config.region || 'US',
    });
  }

  async initialize(mapElement?: HTMLElement): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      const google = await this.loader.load();

      this.geocoder = new google.maps.Geocoder();

      if (mapElement) {
        this.placesService = new google.maps.places.PlacesService(mapElement);
      }

      this.autocompleteService = new google.maps.places.AutocompleteService();

      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize MapService:', error);
      throw new Error(`MapService initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async ensureInitialized(): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }
  }

  async geocodeAddress(address: string): Promise<GeocodeResult> {
    await this.ensureInitialized();

    if (!this.geocoder) {
      throw new Error('Geocoder not initialized');
    }

    return new Promise((resolve, reject) => {
      const request: google.maps.GeocoderRequest = {
        address: address.trim(),
      };

      this.geocoder.geocode(request, (results, status) => {
        if (status === google.maps.GeocoderStatus.OK && results && results[0]) {
          const result = results[0];
          resolve({
            lat: result.geometry.location.lat(),
            lng: result.geometry.location.lng(),
            formattedAddress: result.formatted_address,
            placeId: result.place_id,
            addressComponents: result.address_components,
          });
        } else {
          const errorMessage = this.getGeocoderErrorMessage(status);
          reject(new Error(errorMessage));
        }
      });
    });
  }

  async reverseGeocode(location: Location): Promise<GeocodeResult> {
    await this.ensureInitialized();

    if (!this.geocoder) {
      throw new Error('Geocoder not initialized');
    }

    return new Promise((resolve, reject) => {
      const request: google.maps.GeocoderRequest = {
        location: new google.maps.LatLng(location.lat, location.lng),
      };

      this.geocoder.geocode(request, (results, status) => {
        if (status === google.maps.GeocoderStatus.OK && results && results[0]) {
          const result = results[0];
          resolve({
            lat: result.geometry.location.lat(),
            lng: result.geometry.location.lng(),
            formattedAddress: result.formatted_address,
            placeId: result.place_id,
            addressComponents: result.address_components,
          });
        } else {
          const errorMessage = this.getGeocoderErrorMessage(status);
          reject(new Error(errorMessage));
        }
      });
    });
  }

  async getPlacePredictions(
    input: string,
    options?: {
      types?: string[];
      componentRestrictions?: google.maps.places.ComponentRestrictions;
      location?: google.maps.LatLng | google.maps.LatLngLiteral;
      radius?: number;
    }
  ): Promise<google.maps.places.AutocompletePrediction[]> {
    await this.ensureInitialized();

    if (!this.autocompleteService) {
      throw new Error('Autocomplete service not initialized');
    }

    return new Promise((resolve, reject) => {
      const request: google.maps.places.AutocompletionRequest = {
        input: input.trim(),
        types: options?.types || ['geocode', 'establishment'],
        componentRestrictions: options?.componentRestrictions || { country: 'us' },
        ...options,
      };

      this.autocompleteService.getPlacePredictions(request, (predictions, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
          resolve(predictions);
        } else {
          resolve([]); // Return empty array instead of rejecting for better UX
        }
      });
    });
  }

  async getPlaceDetails(
    placeId: string,
    fields?: string[]
  ): Promise<google.maps.places.PlaceResult> {
    await this.ensureInitialized();

    if (!this.placesService) {
      throw new Error('Places service not initialized');
    }

    return new Promise((resolve, reject) => {
      const request: google.maps.places.PlaceDetailsRequest = {
        placeId,
        fields: fields || [
          'place_id',
          'formatted_address',
          'geometry',
          'name',
          'photos',
          'rating',
          'user_ratings_total',
        ],
      };

      this.placesService.getDetails(request, (result, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && result) {
          resolve(result);
        } else {
          const errorMessage = this.getPlacesServiceErrorMessage(status);
          reject(new Error(errorMessage));
        }
      });
    });
  }

  calculateDistance(
    origin: Location,
    destination: Location,
    unit: 'miles' | 'kilometers' = 'miles'
  ): number {
    const R = unit === 'miles' ? 3958.8 : 6371; // Earth's radius in miles or kilometers
    const dLat = this.toRadians(destination.lat - origin.lat);
    const dLng = this.toRadians(destination.lng - origin.lng);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(origin.lat)) *
        Math.cos(this.toRadians(destination.lat)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  private getGeocoderErrorMessage(status: google.maps.GeocoderStatus): string {
    switch (status) {
      case google.maps.GeocoderStatus.ZERO_RESULTS:
        return 'No results found for the provided address';
      case google.maps.GeocoderStatus.OVER_QUERY_LIMIT:
        return 'Too many requests. Please try again later';
      case google.maps.GeocoderStatus.REQUEST_DENIED:
        return 'Geocoding request denied. Check your API key';
      case google.maps.GeocoderStatus.INVALID_REQUEST:
        return 'Invalid geocoding request';
      case google.maps.GeocoderStatus.UNKNOWN_ERROR:
        return 'Server error occurred. Please try again';
      default:
        return `Geocoding failed: ${status}`;
    }
  }

  private getPlacesServiceErrorMessage(status: google.maps.places.PlacesServiceStatus): string {
    switch (status) {
      case google.maps.places.PlacesServiceStatus.ZERO_RESULTS:
        return 'No results found for the provided place';
      case google.maps.places.PlacesServiceStatus.OVER_QUERY_LIMIT:
        return 'Too many requests. Please try again later';
      case google.maps.places.PlacesServiceStatus.REQUEST_DENIED:
        return 'Places request denied. Check your API key';
      case google.maps.places.PlacesServiceStatus.INVALID_REQUEST:
        return 'Invalid places request';
      case google.maps.places.PlacesServiceStatus.NOT_FOUND:
        return 'Place not found';
      case google.maps.places.PlacesServiceStatus.UNKNOWN_ERROR:
        return 'Server error occurred. Please try again';
      default:
        return `Places service failed: ${status}`;
    }
  }

  validateApiKey(apiKey: string): boolean {
    return typeof apiKey === 'string' && apiKey.length > 0 && apiKey !== 'your_api_key_here';
  }

  getLoader(): Loader {
    return this.loader;
  }

  isServiceReady(): boolean {
    return this.isInitialized && !!this.geocoder && !!this.autocompleteService;
  }
}

// Singleton instance
let mapServiceInstance: MapService | null = null;

export const getMapService = (config?: MapServiceConfig): MapService => {
  if (!mapServiceInstance) {
    if (!config) {
      throw new Error('MapService config required for first initialization');
    }
    mapServiceInstance = new MapService(config);
  }
  return mapServiceInstance;
};

export const createMapService = (config: MapServiceConfig): MapService => {
  return new MapService(config);
};

export default MapService;