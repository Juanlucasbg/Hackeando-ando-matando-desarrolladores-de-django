import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, MapPin, Clock, Navigation, X, Loader2, Star } from 'lucide-react';
import { useDebounce } from '../../hooks/useDebounce';
import { placesService } from '../../services/placesService';
import {
  AutocompletePrediction,
  PlaceDetails,
  Location,
  SearchFilters
} from '../../types/search.types';

interface PlacesAutocompleteProps {
  onPlaceSelected: (place: AutocompletePrediction, details?: PlaceDetails) => void;
  onLocationSelected: (location: Location) => void;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
  currentLocation?: Location;
  filters?: SearchFilters;
  showFilters?: boolean;
  maxResults?: number;
}

const PlacesAutocomplete: React.FC<PlacesAutocompleteProps> = ({
  onPlaceSelected,
  onLocationSelected,
  placeholder = 'Buscar lugares, direcciones...',
  className = '',
  autoFocus = false,
  currentLocation,
  filters,
  showFilters = false,
  maxResults = 8,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<AutocompletePrediction[]>([]);
  const [selectedResult, setSelectedResult] = useState<AutocompletePrediction | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [popularPlaces, setPopularPlaces] = useState<AutocompletePrediction[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debouncedQuery = useDebounce(query, 300);

  // Load popular places on mount
  useEffect(() => {
    if (currentLocation) {
      loadPopularPlaces();
    }
  }, [currentLocation]);

  // Load popular nearby places
  const loadPopularPlaces = async () => {
    try {
      const popularTypes = ['restaurant', 'park', 'shopping_mall', 'gas_station', 'pharmacy'];
      const allPlaces: AutocompletePrediction[] = [];

      for (const type of popularTypes) {
        try {
          const places = await placesService.searchNearbyPlaces(
            currentLocation!,
            5000, // 5km radius
            type
          );
          allPlaces.push(...places.slice(0, 2)); // Take 2 from each type
        } catch {
          // Continue even if one type fails
        }
      }

      setPopularPlaces(allPlaces.slice(0, 6));
    } catch (error) {
      console.error('Failed to load popular places:', error);
    }
  };

  // Search for places
  const searchPlaces = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const searchResults = await placesService.searchPlaces(searchQuery, currentLocation, filters);
      setResults(searchResults.slice(0, maxResults));
      setShowDropdown(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error en la búsqueda');
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentLocation, filters, maxResults]);

  // Handle debounced search
  useEffect(() => {
    if (debouncedQuery !== query) return;
    searchPlaces(debouncedQuery);
  }, [debouncedQuery, searchPlaces, query]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
        setActiveIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle input change
  const handleInputChange = (value: string) => {
    setQuery(value);
    setActiveIndex(-1);
    if (value.trim()) {
      setShowDropdown(true);
    }
  };

  // Handle place selection
  const handlePlaceSelect = async (place: AutocompletePrediction) => {
    setSelectedResult(place);
    setQuery(place.description);
    setShowDropdown(false);

    try {
      const details = await placesService.getPlaceDetails(place.placeId);
      onPlaceSelected(place, details);
      onLocationSelected(details.location);
    } catch (error) {
      // Fallback to prediction location
      onPlaceSelected(place);
      // Would need to extract location from prediction
      console.error('Failed to get place details:', error);
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    const visibleResults = showDropdown && !query ? popularPlaces : results;
    const itemCount = visibleResults.length;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex((prev) => (prev + 1) % itemCount);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex((prev) => (prev - 1 + itemCount) % itemCount);
        break;
      case 'Enter':
        e.preventDefault();
        if (activeIndex >= 0 && activeIndex < itemCount) {
          handlePlaceSelect(visibleResults[activeIndex]);
        } else if (query.trim()) {
          // Search current query as-is
          searchPlaces(query);
        }
        break;
      case 'Escape':
        setShowDropdown(false);
        setActiveIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  // Handle current location
  const handleCurrentLocation = () => {
    if (currentLocation) {
      setQuery('Ubicación actual');
      setShowDropdown(false);
      onLocationSelected(currentLocation);
    }
  };

  // Clear input
  const handleClear = () => {
    setQuery('');
    setResults([]);
    setSelectedResult(null);
    setError(null);
    setShowDropdown(false);
    inputRef.current?.focus();
  };

  // Get place type display info
  const getPlaceTypeInfo = (types: string[]) => {
    const typeInfo: Record<string, { name: string; icon: string; color: string }> = {
      restaurant: { name: 'Restaurante', icon: '🍽️', color: 'text-orange-600' },
      lodging: { name: 'Hotel', icon: '🏨', color: 'text-blue-600' },
      gas_station: { name: 'Gasolinera', icon: '⛽', color: 'text-green-600' },
      bank: { name: 'Banco', icon: '🏦', color: 'text-purple-600' },
      pharmacy: { name: 'Farmacia', icon: '💊', color: 'text-red-600' },
      hospital: { name: 'Hospital', icon: '🏥', color: 'text-red-600' },
      park: { name: 'Parque', icon: '🌳', color: 'text-green-600' },
      shopping_mall: { name: 'Centro comercial', icon: '🛍️', color: 'text-pink-600' },
      store: { name: 'Tienda', icon: '🏪', color: 'text-blue-600' },
      cafe: { name: 'Café', icon: '☕', color: 'text-yellow-700' },
    };

    for (const type of types) {
      if (typeInfo[type]) {
        return typeInfo[type];
      }
    }

    return { name: 'Lugar', icon: '📍', color: 'text-gray-600' };
  };

  // Format distance
  const formatDistance = (meters?: number): string => {
    if (!meters) return '';
    if (meters < 1000) {
      return `${Math.round(meters)} m`;
    } else {
      return `${(meters / 1000).toFixed(1)} km`;
    }
  };

  const visibleResults = showDropdown && !query ? popularPlaces : results;

  return (
    <div className={`relative w-full max-w-2xl ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <div className="relative flex items-center">
          <Search className="absolute left-3 h-5 w-5 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setShowDropdown(true)}
            placeholder={placeholder}
            autoFocus={autoFocus}
            className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
          />

          {query && (
            <button
              onClick={handleClear}
              className="absolute right-3 p-1 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}

          {isLoading && (
            <div className="absolute right-12 top-1/2 transform -translate-y-1/2">
              <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {currentLocation && (
          <button
            onClick={handleCurrentLocation}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
            title="Usar ubicación actual"
          >
            <Navigation className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {showDropdown && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto"
        >
          {/* Popular Places */}
          {!query && popularPlaces.length > 0 && (
            <div className="p-2">
              <div className="px-3 py-2 text-sm font-semibold text-gray-700 flex items-center">
                <Star className="h-4 w-4 mr-2 text-yellow-500" />
                Lugares populares cerca
              </div>
              {popularPlaces.map((place, index) => {
                const typeInfo = getPlaceTypeInfo(place.types);
                const isActive = activeIndex === index;

                return (
                  <button
                    key={place.placeId}
                    onClick={() => handlePlaceSelect(place)}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded-md transition-colors ${
                      isActive ? 'bg-gray-100' : ''
                    }`}
                  >
                    <div className="flex items-center">
                      <span className="text-lg mr-2">{typeInfo.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 truncate">
                          {place.mainText}
                        </div>
                        {place.secondaryText && (
                          <div className="text-xs text-gray-500 truncate mt-1">
                            {place.secondaryText}
                          </div>
                        )}
                        <div className="flex items-center mt-1 space-x-2">
                          <span className={`text-xs ${typeInfo.color}`}>
                            {typeInfo.name}
                          </span>
                          {place.distanceMeters && (
                            <span className="text-xs text-gray-400">
                              {formatDistance(place.distanceMeters)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Search Results */}
          {results.length > 0 && (
            <div className="p-2">
              <div className="px-3 py-2 text-sm font-semibold text-gray-700">
                Resultados de búsqueda
              </div>
              {results.map((result, index) => {
                const typeInfo = getPlaceTypeInfo(result.types);
                const isActive = activeIndex === (!query ? popularPlaces.length : 0) + index;

                return (
                  <button
                    key={result.placeId}
                    onClick={() => handlePlaceSelect(result)}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded-md transition-colors ${
                      isActive ? 'bg-gray-100' : ''
                    }`}
                  >
                    <div className="flex items-center">
                      <span className="text-lg mr-2">{typeInfo.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 truncate">
                          {result.mainText}
                        </div>
                        {result.secondaryText && (
                          <div className="text-xs text-gray-500 truncate mt-1">
                            {result.secondaryText}
                          </div>
                        )}
                        <div className="flex items-center mt-1 space-x-2">
                          <span className={`text-xs ${typeInfo.color}`}>
                            {typeInfo.name}
                          </span>
                          {result.distanceMeters && (
                            <span className="text-xs text-gray-400">
                              {formatDistance(result.distanceMeters)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border-t border-gray-200">
              {error}
            </div>
          )}

          {/* No Results */}
          {!isLoading && !error && query && results.length === 0 && (
            <div className="p-3 text-sm text-gray-500 text-center">
              No se encontraron resultados para "{query}"
            </div>
          )}

          {/* Empty State */}
          {!query && popularPlaces.length === 0 && (
            <div className="p-6 text-center text-gray-500">
              <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-sm">Comienza a escribir para buscar lugares</p>
              <p className="text-xs text-gray-400 mt-1">
                O haz clic en el ícono de navegación para usar tu ubicación actual
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PlacesAutocomplete;