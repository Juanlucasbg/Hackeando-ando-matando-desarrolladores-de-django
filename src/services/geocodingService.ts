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

  // Cache for geocoding results
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

  private async getGeocoder(): Promise<google.maps.Geocoder> {
    if (!this.geocoder) {
      const google = await this.loadMaps();
      this.geocoder = new google.maps.Geocoder();
    }
    return this.geocoder;
  }

  private async getAutocompleteService(): Promise<google.maps.places.AutocompleteService> {
    if (!this.autocompleteService) {
      const google = await this.loadMaps();
      this.autocompleteService = new google.maps.places.AutocompleteService();
    }
    return this.autocompleteService;
  }

  private async getPlacesService(): Promise<google.maps.places.PlacesService> {
    if (!this.placesService) {
      const google = await this.loadMaps();
      // PlacesService needs a map or element as argument
      const dummyElement = document.createElement('div');
      this.placesService = new google.maps.places.PlacesService(dummyElement);
    }
    return this.placesService;
  }

  private generateCacheKey(request: GeocodingRequest): string {
    if (request.address) return `address:${request.address}:${request.region || ''}:${request.language || ''}`;
    if (request.location) return `coords:${request.location.lat},${request.location.lng}:${request.language || ''}`;
    if (request.placeId) return `place:${request.placeId}:${request.language || ''}`;
    return JSON.stringify(request);
  }

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

              // Set cache expiry (24 hours)
              setTimeout(() => {
                this.cache.delete(cacheKey);
              }, 24 * 60 * 60 * 1000);
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

  async reverseGeocode(location: Location): Promise<GeocodingResult[]> {
    return this.geocode({ location });
  }

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

            // Set cache expiry (1 hour)
            setTimeout(() => {
              this.autocompleteCache.delete(cacheKey);
            }, 60 * 60 * 1000);

            resolve(results);
          } else {
            reject(new Error(`Autocomplete failed: ${status}`));
          }
        });
      });
    });
  }

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

            // Set cache expiry (24 hours)
            setTimeout(() => {
              this.placeDetailsCache.delete(placeId);
            }, 24 * 60 * 60 * 1000);

            resolve(result);
          } else {
            reject(new Error(`Place details failed: ${status}`));
          }
        });
      });
    });
  }

  private getGeocodingErrorMessage(status: google.maps.GeocoderStatus): string {
    switch (status) {
      case google.maps.GeocoderStatus.ZERO_RESULTS:
        return 'No se encontraron resultados para la dirección proporcionada';
      case google.maps.GeocoderStatus.OVER_QUERY_LIMIT:
        return 'Se ha excedido el límite de solicitudes. Por favor, inténtelo más tarde';
      case google.maps.GeocoderStatus.REQUEST_DENIED:
        return 'El servicio de geocodificación ha sido denegado';
      case google.maps.GeocoderStatus.INVALID_REQUEST:
        return 'La solicitud de geocodificación no es válida';
      case google.maps.GeocoderStatus.UNKNOWN_ERROR:
        return 'Error desconocido en el servidor. Por favor, inténtelo de nuevo';
      default:
        return `Error de geocodificación: ${status}`;
    }
  }

  // Clear cache methods
  clearCache(): void {
    this.cache.clear();
    this.autocompleteCache.clear();
    this.placeDetailsCache.clear();
  }

  clearExpiredCache(): void {
    // Cache expiry is handled automatically with setTimeout
    // This method can be used to force cleanup if needed
    const currentTime = Date.now();
    // Implementation for manual cleanup if needed
  }

  // Utility methods
  isValidCoordinate(lat: number, lng: number): boolean {
    return (
      typeof lat === 'number' &&
      typeof lng === 'number' &&
      lat >= -90 &&
      lat <= 90 &&
      lng >= -180 &&
      lng <= 180 &&
      !isNaN(lat) &&
      !isNaN(lng)
    );
  }

  formatCoordinates(location: Location, format: 'decimal' | 'dms' = 'decimal'): { lat: string; lng: string } {
    if (format === 'decimal') {
      return {
        lat: location.lat.toFixed(6),
        lng: location.lng.toFixed(6),
      };
    }

    // DMS format
    return {
      lat: this.decimalToDMS(location.lat, true),
      lng: this.decimalToDMS(location.lng, false),
    };
  }

  private decimalToDMS(decimal: number, isLatitude: boolean): string {
    const absolute = Math.abs(decimal);
    const degrees = Math.floor(absolute);
    const minutesNotTruncated = (absolute - degrees) * 60;
    const minutes = Math.floor(minutesNotTruncated);
    const seconds = Math.floor((minutesNotTruncated - minutes) * 60);

    const direction = isLatitude
      ? (decimal >= 0 ? 'N' : 'S')
      : (decimal >= 0 ? 'E' : 'W');

    return `${degrees}°${minutes}'${seconds}"${direction}`;
  }

  parseCoordinates(latStr: string, lngStr: string): Location | null {
    try {
      let lat: number;
      let lng: number;

      // Try decimal format first
      const latDecimal = parseFloat(latStr);
      const lngDecimal = parseFloat(lngStr);

      if (!isNaN(latDecimal) && !isNaN(lngDecimal) &&
          this.isValidCoordinate(latDecimal, lngDecimal)) {
        return { lat: latDecimal, lng: lngDecimal };
      }

      // Try DMS format
      lat = this.parseDMSToDecimal(latStr);
      lng = this.parseDMSToDecimal(lngStr);

      if (this.isValidCoordinate(lat, lng)) {
        return { lat, lng };
      }

      return null;
    } catch (error) {
      return null;
    }
  }

  private parseDMSToDecimal(dms: string): number {
    const dmsRegex = /(\d+)°(\d+)'([\d.]+)"?([NSEWO])/i;
    const match = dms.match(dmsRegex);

    if (!match) {
      throw new Error('Invalid DMS format');
    }

    const [_, degrees, minutes, seconds, direction] = match;
    const decimal = parseFloat(degrees) + (parseFloat(minutes) / 60) + (parseFloat(seconds) / 3600);

    const multiplier = /[SW]/i.test(direction) ? -1 : 1;
    return decimal * multiplier;
  }
}

export const geocodingService = GeocodingService.getInstance();