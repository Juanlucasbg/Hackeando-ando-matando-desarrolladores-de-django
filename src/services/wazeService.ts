import { Location, GeocodeResult, MapServiceConfig } from '../types';
import { WAZE_API_CONFIG } from '../config/maps';

interface WazeRouteRequest {
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

interface WazeRouteResponse {
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

interface WazeLocationResponse {
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

class WazeService {
  private apiKey: string;
  private baseUrl: string;
  private isInitialized = false;

  constructor(config?: MapServiceConfig) {
    this.apiKey = config?.apiKey || WAZE_API_CONFIG.apiKey;
    this.baseUrl = config?.baseUrl || WAZE_API_CONFIG.baseUrl;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      // Test API connection with a simple validation
      await this.validateApiKey();
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize WazeService:', error);
      throw new Error(`WazeService initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async ensureInitialized(): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }
  }

  private async makeRequest(endpoint: string, data: any): Promise<any> {
    await this.ensureInitialized();

    return new Promise((resolve, reject) => {
      const postData = JSON.stringify(data);

      const options = {
        method: 'POST',
        hostname: 'waze-api.p.rapidapi.com',
        port: null,
        path: endpoint,
        headers: {
          'x-rapidapi-key': this.apiKey,
          'x-rapidapi-host': 'waze-api.p.rapidapi.com',
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        }
      };

      const http = require('https');
      const req = http.request(options, (res: any) => {
        const chunks: Buffer[] = [];

        res.on('data', (chunk: Buffer) => {
          chunks.push(chunk);
        });

        res.on('end', () => {
          const body = Buffer.concat(chunks);
          try {
            const response = JSON.parse(body.toString());
            if (res.statusCode >= 200 && res.statusCode < 300) {
              resolve(response);
            } else {
              reject(new Error(`Waze API error: ${res.statusCode} - ${response.message || 'Unknown error'}`));
            }
          } catch (parseError) {
            reject(new Error(`Failed to parse Waze API response: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`));
          }
        });
      });

      req.on('error', (error: Error) => {
        reject(new Error(`Waze API request failed: ${error.message}`));
      });

      req.setTimeout(WAZE_API_CONFIG.timeout, () => {
        req.destroy();
        reject(new Error('Waze API request timeout'));
      });

      req.write(postData);
      req.end();
    });
  }

  async calculateRoute(
    from: Location,
    to: Location,
    options?: {
      avoidTolls?: boolean;
      avoidHighways?: boolean;
      avoidFerries?: boolean;
    }
  ): Promise<{
    distance: number;
    duration: number;
    path: Location[];
    restrictions: string[];
  }> {
    try {
      const request: WazeRouteRequest = {
        from: {
          x: from.lng,
          y: from.lat
        },
        to: {
          x: to.lng,
          y: to.lat
        },
        options
      };

      const response: WazeRouteResponse = await this.makeRequest('/route/danger', request);

      if (!response.response?.results?.[0]) {
        throw new Error('No route found');
      }

      const result = response.response.results[0];

      return {
        distance: result.distance,
        duration: result.duration,
        path: result.path.map(point => ({
          lat: point.y,
          lng: point.x
        })),
        restrictions: result.restrictions || []
      };
    } catch (error) {
      throw new Error(`Route calculation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async geocodeAddress(address: string): Promise<GeocodeResult> {
    // Note: Waze API doesn't have a direct geocoding endpoint
    // This is a fallback implementation using alternative approach
    try {
      // For now, we'll use a basic implementation
      // In production, you might want to integrate with another geocoding service
      throw new Error('Geocoding not directly supported by Waze API. Please use coordinates directly.');
    } catch (error) {
      throw new Error(`Geocoding failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async reverseGeocode(location: Location): Promise<GeocodeResult> {
    // Note: Waze API doesn't have a direct reverse geocoding endpoint
    try {
      throw new Error('Reverse geocoding not directly supported by Waze API.');
    } catch (error) {
      throw new Error(`Reverse geocoding failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async searchPlaces(query: string, location?: Location): Promise<Array<{
    name: string;
    address: string;
    location: Location;
  }>> {
    // Note: Waze API doesn't have a places search endpoint
    // This would need to be implemented with a different service
    try {
      throw new Error('Place search not directly supported by Waze API.');
    } catch (error) {
      throw new Error(`Place search failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
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

  async validateApiKey(): Promise<boolean> {
    try {
      // Test with a simple route request
      await this.calculateRoute(
        { lat: 40.7128, lng: -74.0060 }, // New York
        { lat: 40.7589, lng: -73.9851 }  // Times Square
      );
      return true;
    } catch (error) {
      console.error('API key validation failed:', error);
      return false;
    }
  }

  isServiceReady(): boolean {
    return this.isInitialized;
  }

  getApiKey(): string {
    return this.apiKey;
  }

  getBaseUrl(): string {
    return this.baseUrl;
  }
}

// Singleton instance
let wazeServiceInstance: WazeService | null = null;

export const getWazeService = (config?: MapServiceConfig): WazeService => {
  if (!wazeServiceInstance) {
    wazeServiceInstance = new WazeService(config);
  }
  return wazeServiceInstance;
};

export const createWazeService = (config?: MapServiceConfig): WazeService => {
  return new WazeService(config);
};

export default WazeService;