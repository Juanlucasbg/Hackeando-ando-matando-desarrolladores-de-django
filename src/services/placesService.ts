import {
  AutocompletePrediction,
  AutocompleteRequest,
  PlaceDetails,
  SearchFilters,
  Location
} from '../types/search.types';
import { geocodingService } from './geocodingService';

class PlacesService {
  private static instance: PlacesService;

  private constructor() {}

  static getInstance(): PlacesService {
    if (!PlacesService.instance) {
      PlacesService.instance = new PlacesService();
    }
    return PlacesService.instance;
  }

  async searchPlaces(input: string, location?: Location, filters?: SearchFilters): Promise<AutocompletePrediction[]> {
    const request: AutocompleteRequest = {
      input: input.trim(),
      language: 'es',
      region: 'CO',
    };

    // Add location bias if provided
    if (location) {
      request.location = location;
      request.radius = filters?.radius || 50000; // 50km default
    }

    // Apply filters
    if (filters) {
      if (filters.placeTypes && filters.placeTypes.length > 0) {
        request.types = filters.placeTypes.join('|');
      }

      if (filters.strictBounds && location) {
        request.strictBounds = true;
      }
    }

    try {
      const predictions = await geocodingService.getAutocompletePredictions(request);

      // Apply additional client-side filtering
      return this.filterPredictions(predictions, filters);
    } catch (error) {
      console.error('Places search failed:', error);
      throw error;
    }
  }

  async searchNearbyPlaces(location: Location, radius: number, type?: string): Promise<AutocompletePrediction[]> {
    // Use a generic search term with location bias to find nearby places
    const searchTerms = type ? this.getTypeSearchTerm(type) : 'restaurantes tiendas';

    const request: AutocompleteRequest = {
      input: searchTerms,
      location,
      radius,
      language: 'es',
      region: 'CO',
      types: type ? [type] : undefined,
    };

    try {
      return await geocodingService.getAutocompletePredictions(request);
    } catch (error) {
      console.error('Nearby places search failed:', error);
      return [];
    }
  }

  async getPlaceDetails(placeId: string): Promise<PlaceDetails> {
    try {
      return await geocodingService.getPlaceDetails(
        placeId,
        [
          'place_id',
          'name',
          'formatted_address',
          'geometry',
          'formatted_phone_number',
          'website',
          'rating',
          'user_ratings_total',
          'photos',
          'opening_hours',
          'price_level',
          'types',
          'vicinity',
        ]
      );
    } catch (error) {
      console.error('Get place details failed:', error);
      throw error;
    }
  }

  async searchByAddress(address: string): Promise<AutocompletePrediction[]> {
    const request: AutocompleteRequest = {
      input: address,
      language: 'es',
      region: 'CO',
      types: ['address'],
    };

    try {
      return await geocodingService.getAutocompletePredictions(request);
    } catch (error) {
      console.error('Address search failed:', error);
      throw error;
    }
  }

  async searchByType(type: string, location?: Location): Promise<AutocompletePrediction[]> {
    const searchTerm = this.getTypeSearchTerm(type);

    const request: AutocompleteRequest = {
      input: searchTerm,
      language: 'es',
      region: 'CO',
      types: type === 'address' ? ['address'] : [type],
      location,
      radius: location ? 50000 : undefined,
    };

    try {
      return await geocodingService.getAutocompletePredictions(request);
    } catch (error) {
      console.error('Type search failed:', error);
      throw error;
    }
  }

  private filterPredictions(predictions: AutocompletePrediction[], filters?: SearchFilters): AutocompletePrediction[] {
    if (!filters) return predictions;

    return predictions.filter(prediction => {
      // Filter by place types if specified
      if (filters.placeTypes && filters.placeTypes.length > 0) {
        const hasMatchingType = prediction.types.some(type =>
          filters.placeTypes!.includes(type)
        );
        if (!hasMatchingType) return false;
      }

      // Additional filtering can be added here
      // Note: Some filters like rating, price level, and open_now require place details
      // These would need to be fetched individually, which can be expensive

      return true;
    });
  }

  private getTypeSearchTerm(type: string): string {
    const typeSearchTerms: Record<string, string> = {
      'restaurant': 'restaurantes',
      'food': 'restaurantes comida',
      'lodging': 'hoteles hospedaje',
      'tourist_attraction': 'atracciones turísticas',
      'museum': 'museos',
      'park': 'parques',
      'shopping_mall': 'centros comerciales',
      'store': 'tiendas',
      'gas_station': 'gasolineras',
      'bank': 'bancos',
      'atm': 'cajeros automáticos',
      'pharmacy': 'farmacias',
      'hospital': 'hospitales',
      'doctor': 'médicos',
      'police': 'estación de policía',
      'fire_station': 'estación de bomberos',
      'school': 'colegios escuelas',
      'university': 'universidades',
      'library': 'bibliotecas',
      'post_office': 'oficinas de correo',
      'church': 'iglesias',
      'gym': 'gimnasios',
      'movie_theater': 'cines teatros',
      'night_club': 'discotecas bares',
      'bus_station': 'estaciones de bus',
      'subway_station': 'estaciones de metro',
      'train_station': 'estaciones de tren',
      'airport': 'aeropuertos',
      'parking': 'parqueaderos',
      'car_rental': 'alquiler de carros',
      'travel_agency': 'agencias de viajes',
      'accounting': 'contabilidad',
      'lawyer': 'abogados',
      'real_estate_agency': 'inmobiliarias',
      'hardware_store': 'ferreterías',
      'electronics_store': 'tiendas de electrónica',
      'clothing_store': 'tiendas de ropa',
      'supermarket': 'supermercados',
      'bakery': 'panaderías',
      'cafe': 'cafés',
      'bar': 'bares',
      'beauty_salon': 'salones de belleza',
      'hair_care': 'peluquerías',
      'dentist': 'dentistas',
      'veterinary_care': 'veterinarias',
      'pet_store': 'tiendas de mascotas',
    };

    return typeSearchTerms[type] || type;
  }

  // Get popular place types for the region (Colombia)
  getPopularPlaceTypes(): Array<{ id: string; name: string; icon: string }> {
    return [
      { id: 'restaurant', name: 'Restaurantes', icon: '🍽️' },
      { id: 'lodging', name: 'Hoteles', icon: '🏨' },
      { id: 'gas_station', name: 'Gasolineras', icon: '⛽' },
      { id: 'bank', name: 'Bancos', icon: '🏦' },
      { id: 'pharmacy', name: 'Farmacias', icon: '💊' },
      { id: 'hospital', name: 'Hospitales', icon: '🏥' },
      { id: 'school', name: 'Colegios', icon: '🏫' },
      { id: 'park', name: 'Parques', icon: '🌳' },
      { id: 'shopping_mall', name: 'Centros Comerciales', icon: '🛍️' },
      { id: 'supermarket', name: 'Supermercados', icon: '🛒' },
      { id: 'atm', name: 'Cajeros', icon: '💳' },
      { id: 'parking', name: 'Parqueaderos', icon: '🅿️' },
      { id: 'movie_theater', name: 'Cines', icon: '🎬' },
      { id: 'museum', name: 'Museos', icon: '🏛️' },
      { id: 'church', name: 'Iglesias', icon: '⛪' },
      { id: 'bus_station', name: 'Estaciones de Bus', icon: '🚌' },
      { id: 'subway_station', name: 'Estaciones de Metro', icon: '🚇' },
      { id: 'gym', name: 'Gimnasios', icon: '💪' },
      { id: 'cafe', name: 'Cafés', icon: '☕' },
      { id: 'bakery', name: 'Panaderías', icon: '🥖' },
    ];
  }

  // Get suggested search terms based on current location or popular searches
  getSuggestedSearches(location?: Location): string[] {
    if (location && this.isInMedellin(location)) {
      return [
        'Parque Envigado',
        'Plaza Mayor Medellín',
        'Metrocable Medellín',
        'Poblado Medellín',
        'Centro Comercial Oviedo',
        'Parque Lleras',
        'Estadio Atanasio Girardot',
        'Jardín Botánico Medellín',
        'Museo de Antioquia',
        'Comuna 13 Medellín',
        'Terminal del Sur Medellín',
        'Aeropuerto Olaya Herrera',
        'Unidad Deportiva Belén',
        'Centro Comercial Santafé',
      ];
    }

    return [
      'restaurantes cerca',
      'hoteles',
      'gasolineras',
      'hospitales',
      'parques',
      'centros comerciales',
      'farmacias',
      'colegios',
      'cajeros automáticos',
      'panaderías',
      'museos',
      'iglesias',
      'gimnasios',
      'cines',
      'banco',
      'supermercados',
    ];
  }

  private isInMedellin(location: Location): boolean {
    // Approximate bounds for Medellín metropolitan area
    const MED_ELLIN_BOUNDS = {
      north: 6.35,
      south: 6.10,
      east: -75.45,
      west: -75.65,
    };

    return (
      location.lat >= MED_ELLIN_BOUNDS.south &&
      location.lat <= MED_ELLIN_BOUNDS.north &&
      location.lng >= MED_ELLIN_BOUNDS.west &&
      location.lng <= MED_ELLIN_BOUNDS.east
    );
  }

  // Get search suggestions based on partial input
  async getSearchSuggestions(input: string, location?: Location): Promise<string[]> {
    const suggestions: string[] = [];
    const lowerInput = input.toLowerCase();

    // Get suggested searches that match the input
    const suggestedSearches = this.getSuggestedSearches(location);
    suggestions.push(...suggestedSearches.filter(search =>
      search.toLowerCase().includes(lowerInput)
    ));

    // Get place type suggestions
    const placeTypes = this.getPopularPlaceTypes();
    suggestions.push(...placeTypes
      .filter(type => type.name.toLowerCase().includes(lowerInput))
      .map(type => type.name)
    );

    // Get actual autocomplete suggestions if input is long enough
    if (input.length >= 3) {
      try {
        const predictions = await this.searchPlaces(input, location);
        suggestions.push(...predictions.slice(0, 5).map(p => p.description));
      } catch (error) {
        // Silently fail for suggestions
      }
    }

    // Remove duplicates and limit to 10 suggestions
    return [...new Set(suggestions)].slice(0, 10);
  }

  // Format place details for display
  formatPlaceDetails(details: PlaceDetails): string {
    let formatted = `${details.name}\n${details.address}`;

    if (details.phoneNumber) {
      formatted += `\n📞 ${details.phoneNumber}`;
    }

    if (details.rating) {
      const stars = '⭐'.repeat(Math.round(details.rating));
      formatted += `\n${stars} ${details.rating} (${details.userRatingsTotal} reseñas)`;
    }

    if (details.openingHours?.openNow !== undefined) {
      formatted += `\n${details.openingHours.openNow ? '🟢 Abierto ahora' : '🔴 Cerrado'}`;
    }

    if (details.priceLevel) {
      const priceSymbols = '$'.repeat(details.priceLevel);
      formatted += `\n${priceSymbols}`;
    }

    return formatted;
  }

  // Calculate distance between two points (in kilometers)
  calculateDistance(from: Location, to: Location): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(to.lat - from.lat);
    const dLng = this.toRadians(to.lng - from.lng);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(from.lat)) *
      Math.cos(this.toRadians(to.lat)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}

export const placesService = PlacesService.getInstance();