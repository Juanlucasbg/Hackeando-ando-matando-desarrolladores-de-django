import { Location, AutocompletePrediction } from '../types/search.types';

// Search utility functions
export const searchUtils = {
  // Extract location from autocomplete prediction
  extractLocationFromPrediction: async (prediction: AutocompletePrediction): Promise<Location | null> => {
    try {
      // This would typically use the Google Maps Geocoding service
      // For now, return a placeholder
      return {
        lat: 0,
        lng: 0,
        address: prediction.description,
        placeId: prediction.placeId,
      };
    } catch (error) {
      console.error('Failed to extract location from prediction:', error);
      return null;
    }
  },

  // Calculate distance between two points in kilometers
  calculateDistance: (from: Location, to: Location): number => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = toRadians(to.lat - from.lat);
    const dLng = toRadians(to.lng - from.lng);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRadians(from.lat)) *
      Math.cos(toRadians(to.lat)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  },

  // Format distance for display
  formatDistance: (meters: number): string => {
    if (meters < 1000) {
      return `${Math.round(meters)} m`;
    } else {
      return `${(meters / 1000).toFixed(1)} km`;
    }
  },

  // Get place type display name
  getPlaceTypeDisplayName: (types: string[]): string => {
    const typeNames: Record<string, string> = {
      restaurant: 'Restaurante',
      lodging: 'Hotel',
      gas_station: 'Gasolinera',
      bank: 'Banco',
      pharmacy: 'Farmacia',
      hospital: 'Hospital',
      school: 'Escuela',
      university: 'Universidad',
      park: 'Parque',
      shopping_mall: 'Centro comercial',
      store: 'Tienda',
      supermarket: 'Supermercado',
      atm: 'Cajero automático',
      parking: 'Parqueadero',
      movie_theater: 'Cine',
      museum: 'Museo',
      church: 'Iglesia',
      gym: 'Gimnasio',
      cafe: 'Café',
      bakery: 'Panadería',
      bar: 'Bar',
      night_club: 'Discoteca',
      bus_station: 'Estación de bus',
      subway_station: 'Estación de metro',
      train_station: 'Estación de tren',
      airport: 'Aeropuerto',
      library: 'Biblioteca',
      post_office: 'Oficina de correo',
      police: 'Estación de policía',
      fire_station: 'Estación de bomberos',
      doctor: 'Médico',
      dentist: 'Dentista',
      veterinary_care: 'Veterinaria',
      pet_store: 'Tienda de mascotas',
      car_rental: 'Alquiler de carros',
      travel_agency: 'Agencia de viajes',
      tourist_attraction: 'Atracción turística',
      art_gallery: 'Galería de arte',
      zoo: 'Zoológico',
      aquarium: 'Acuario',
      amusement_park: 'Parque de diversiones',
      stadium: 'Estadio',
      courthouse: 'Juzgado',
      local_government_office: 'Oficina del gobierno',
      synagogue: 'Sinagoga',
      mosque: 'Mezquita',
      hindu_temple: 'Templo hindú',
    };

    for (const type of types) {
      if (typeNames[type]) {
        return typeNames[type];
      }
    }

    return 'Lugar';
  },

  // Get place type icon
  getPlaceTypeIcon: (types: string[]): string => {
    const typeIcons: Record<string, string> = {
      restaurant: '🍽️',
      lodging: '🏨',
      gas_station: '⛽',
      bank: '🏦',
      pharmacy: '💊',
      hospital: '🏥',
      school: '🏫',
      university: '🎓',
      park: '🌳',
      shopping_mall: '🛍️',
      store: '🏪',
      supermarket: '🛒',
      atm: '💳',
      parking: '🅿️',
      movie_theater: '🎬',
      museum: '🏛️',
      church: '⛪',
      gym: '💪',
      cafe: '☕',
      bakery: '🥖',
      bar: '🍺',
      night_club: '🎵',
      bus_station: '🚌',
      subway_station: '🚇',
      train_station: '🚂',
      airport: '✈️',
      library: '📚',
      post_office: '📮',
      police: '👮',
      fire_station: '🚒',
      doctor: '👨‍⚕️',
      dentist: '🦷',
      veterinary_care: '🐕',
      pet_store: '🐾',
      car_rental: '🚗',
      travel_agency: '✈️',
      tourist_attraction: '📸',
      art_gallery: '🎨',
      zoo: '🦁',
      aquarium: '🐠',
      amusement_park: '🎢',
      stadium: '🏟️',
      courthouse: '⚖️',
      local_government_office: '🏛️',
      synagogue: '🕍',
      mosque: '🕌',
      hindu_temple: '🕉️',
    };

    for (const type of types) {
      if (typeIcons[type]) {
        return typeIcons[type];
      }
    }

    return '📍';
  },

  // Highlight matching text in search results
  highlightMatch: (text: string, query: string): string => {
    if (!query) return text;

    const regex = new RegExp(`(${escapeRegExp(query)})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  },

  // Sanitize search query
  sanitizeQuery: (query: string): string => {
    return query
      .trim()
      .replace(/[<>]/g, '') // Remove HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .substring(0, 200); // Limit length
  },

  // Check if query is a coordinate
  isCoordinateQuery: (query: string): boolean => {
    // Check for decimal coordinates (e.g., "6.2442, -75.5812")
    const decimalRegex = /^-?\d+\.?\d*,\s*-?\d+\.?\d*$/;
    if (decimalRegex.test(query.trim())) {
      return true;
    }

    // Check for DMS coordinates (e.g., "6°14′39″N, 75°34′52″W")
    const dmsRegex = /^\d+°\d+'[\d.]+"[NSEW],\s*\d+°\d+'[\d.]+"[NSEW]$/;
    return dmsRegex.test(query.trim());
  },

  // Parse coordinate query
  parseCoordinateQuery: (query: string): Location | null => {
    const trimmed = query.trim();

    // Try decimal format first
    const decimalRegex = /^(-?\d+\.?\d*),\s*(-?\d+\.?\d*)$/;
    const decimalMatch = trimmed.match(decimalRegex);
    if (decimalMatch) {
      const lat = parseFloat(decimalMatch[1]);
      const lng = parseFloat(decimalMatch[2]);
      if (isValidCoordinate(lat, lng)) {
        return { lat, lng, address: trimmed };
      }
    }

    // Try DMS format
    const dmsRegex = /(\d+)°(\d+)'([\d.]+)"?([NSEW]),\s*(\d+)°(\d+)'([\d.]+)"?([NSEW])/i;
    const dmsMatch = trimmed.match(dmsRegex);
    if (dmsMatch) {
      try {
        const lat = parseDMSToDecimal(
          `${dmsMatch[1]}°${dmsMatch[2]}'${dmsMatch[3]}"${dmsMatch[4]}`
        );
        const lng = parseDMSToDecimal(
          `${dmsMatch[5]}°${dmsMatch[6]}'${dmsMatch[7]}"${dmsMatch[8]}`
        );
        if (isValidCoordinate(lat, lng)) {
          return { lat, lng, address: trimmed };
        }
      } catch {
        // Invalid DMS format
      }
    }

    return null;
  },

  // Generate search suggestions
  generateSuggestions: (query: string, location?: Location): string[] => {
    const suggestions: string[] = [];
    const lowerQuery = query.toLowerCase();

    // Popular searches in Colombia
    const popularSearches = [
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

    // Location-specific suggestions
    const locationSuggestions = location && isInMedellin(location) ? [
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
    ] : [];

    // Filter suggestions by query
    popularSearches.forEach(search => {
      if (search.includes(lowerQuery)) {
        suggestions.push(search);
      }
    });

    locationSuggestions.forEach(search => {
      if (search.toLowerCase().includes(lowerQuery)) {
        suggestions.push(search);
      }
    });

    return suggestions.slice(0, 10);
  },

  // Sort search results by relevance
  sortResultsByRelevance: (
    results: AutocompletePrediction[],
    query: string,
    userLocation?: Location
  ): AutocompletePrediction[] => {
    const lowerQuery = query.toLowerCase();

    return results
      .map(result => ({
        ...result,
        score: calculateRelevanceScore(result, lowerQuery, userLocation),
      }))
      .sort((a, b) => b.score - a.score);
  },
};

// Helper functions
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

function isValidCoordinate(lat: number, lng: number): boolean {
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

function parseDMSToDecimal(dms: string): number {
  const dmsRegex = /(\d+)°(\d+)'([\d.]+)"?([NSEW])/i;
  const match = dms.match(dmsRegex);

  if (!match) {
    throw new Error('Invalid DMS format');
  }

  const [_, degrees, minutes, seconds, direction] = match;
  const decimal = parseFloat(degrees) + (parseFloat(minutes) / 60) + (parseFloat(seconds) / 3600);

  const multiplier = /[SW]/i.test(direction) ? -1 : 1;
  return decimal * multiplier;
}

function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function isInMedellin(location: Location): boolean {
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

function calculateRelevanceScore(
  result: AutocompletePrediction,
  query: string,
  userLocation?: Location
): number {
  let score = 0;

  // Exact match bonus
  if (result.description.toLowerCase() === query) {
    score += 100;
  }

  // Startswith bonus
  if (result.description.toLowerCase().startsWith(query)) {
    score += 50;
  }

  // Contains bonus
  if (result.description.toLowerCase().includes(query)) {
    score += 25;
  }

  // Word match bonus
  const queryWords = query.split(' ');
  const resultWords = result.description.toLowerCase().split(' ');
  queryWords.forEach(queryWord => {
    if (resultWords.some(resultWord => resultWord.includes(queryWord))) {
      score += 10;
    }
  });

  // Distance bonus (if user location is available)
  if (userLocation && result.distanceMeters) {
    const distanceBonus = Math.max(0, 20 - (result.distanceMeters / 1000));
    score += distanceBonus;
  }

  // Type bonus (prioritize certain types)
  const priorityTypes = ['restaurant', 'lodging', 'gas_station', 'bank', 'pharmacy'];
  if (result.types.some(type => priorityTypes.includes(type))) {
    score += 5;
  }

  return score;
}