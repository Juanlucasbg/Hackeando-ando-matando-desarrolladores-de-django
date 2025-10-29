import React, { useState } from 'react';
import { MapPin, Star, Phone, Globe, Clock, DollarSign, Navigation, X, ChevronDown } from 'lucide-react';
import { AutocompletePrediction, PlaceDetails, Location } from '../../types/search.types';
import { placesService } from '../../services/placesService';
import { useSearchStore } from '../../stores/searchStore';

interface SearchResultsProps {
  results: AutocompletePrediction[];
  onPlaceSelected: (place: AutocompletePrediction, details?: PlaceDetails) => void;
  onLocationSelected: (location: Location) => void;
  onClose?: () => void;
  showDetails?: boolean;
  className?: string;
}

const SearchResults: React.FC<SearchResultsProps> = ({
  results,
  onPlaceSelected,
  onLocationSelected,
  onClose,
  showDetails = true,
  className = '',
}) => {
  const [expandedPlace, setExpandedPlace] = useState<string | null>(null);
  const [placeDetails, setPlaceDetails] = useState<Map<string, PlaceDetails>>(new Map());
  const [loadingDetails, setLoadingDetails] = useState<Set<string>>(new Set());
  const { addToHistory } = useSearchStore();

  // Load place details
  const loadPlaceDetails = async (placeId: string) => {
    if (placeDetails.has(placeId)) {
      return placeDetails.get(placeId);
    }

    setLoadingDetails((prev) => new Set(prev).add(placeId));

    try {
      const details = await placesService.getPlaceDetails(placeId);
      setPlaceDetails((prev) => new Map(prev).set(placeId, details));
      return details;
    } catch (error) {
      console.error('Failed to load place details:', error);
      return null;
    } finally {
      setLoadingDetails((prev) => {
        const next = new Set(prev);
        next.delete(placeId);
        return next;
      });
    }
  };

  // Handle place selection
  const handlePlaceClick = async (place: AutocompletePrediction) => {
    addToHistory({
      query: place.description,
      type: 'place',
    });

    if (showDetails && expandedPlace !== place.placeId) {
      setExpandedPlace(place.placeId);
      const details = await loadPlaceDetails(place.placeId);
      onPlaceSelected(place, details || undefined);
      if (details) {
        onLocationSelected(details.location);
      }
    } else {
      onPlaceSelected(place);
      // Get basic location from prediction (would need to be extracted)
      onLocationSelected({
        lat: 0, // Would need geocoding
        lng: 0,
        address: place.description,
        placeId: place.placeId,
      });
    }
  };

  // Handle navigation to place
  const handleNavigate = (place: AutocompletePrediction, details?: PlaceDetails) => {
    const location = details?.location || {
      lat: 0, // Would need to be extracted
      lng: 0,
      address: place.description,
      placeId: place.placeId,
    };
    onLocationSelected(location);
  };

  // Format rating
  const formatRating = (rating?: number, totalRatings?: number) => {
    if (!rating) return null;

    const stars = Array(5)
      .fill(0)
      .map((_, i) => (
        <Star
          key={i}
          className={`h-3 w-3 ${
            i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
          }`}
        />
      ));

    return (
      <div className="flex items-center space-x-1">
        <div className="flex">{stars}</div>
        <span className="text-xs text-gray-600">
          {rating.toFixed(1)}
          {totalRatings && ` (${totalRatings})`}
        </span>
      </div>
    );
  };

  // Format price level
  const formatPriceLevel = (priceLevel?: number) => {
    if (!priceLevel) return null;

    return (
      <div className="flex items-center space-x-1">
        {Array(priceLevel)
          .fill(0)
          .map((_, i) => (
            <DollarSign key={i} className="h-3 w-3 text-green-600" />
          ))}
      </div>
    );
  };

  // Get place type icon
  const getPlaceTypeIcon = (types: string[]) => {
    const typeIcons: Record<string, string> = {
      restaurant: '🍽️',
      lodging: '🏨',
      gas_station: '⛽',
      bank: '🏦',
      pharmacy: '💊',
      hospital: '🏥',
      school: '🏫',
      park: '🌳',
      shopping_mall: '🛍️',
      supermarket: '🛒',
      atm: '💳',
      parking: '🅿️',
      movie_theater: '🎬',
      museum: '🏛️',
      church: '⛪',
      gym: '💪',
      cafe: '☕',
      store: '🏪',
    };

    for (const type of types) {
      if (typeIcons[type]) return typeIcons[type];
    }

    return '📍';
  };

  // Categorize results
  const categorizeResults = (results: AutocompletePrediction[]) => {
    const categories: Record<string, AutocompletePrediction[]> = {};

    results.forEach((result) => {
      let category = 'Otros';

      // Determine category based on place types
      if (result.types.includes('restaurant') || result.types.includes('food')) {
        category = 'Restaurantes';
      } else if (result.types.includes('lodging')) {
        category = 'Hoteles';
      } else if (result.types.includes('gas_station')) {
        category = 'Gasolineras';
      } else if (result.types.includes('bank') || result.types.includes('atm')) {
        category = 'Bancos';
      } else if (result.types.includes('pharmacy')) {
        category = 'Farmacias';
      } else if (result.types.includes('hospital') || result.types.includes('doctor')) {
        category = 'Salud';
      } else if (result.types.includes('school') || result.types.includes('university')) {
        category = 'Educación';
      } else if (result.types.includes('park') || result.types.includes('tourist_attraction')) {
        category = 'Turismo';
      } else if (result.types.includes('store') || result.types.includes('shopping_mall')) {
        category = 'Compras';
      } else if (result.types.includes('transit_station') || result.types.includes('bus_station')) {
        category = 'Transporte';
      }

      if (!categories[category]) {
        categories[category] = [];
      }
      categories[category].push(result);
    });

    return categories;
  };

  const categories = categorizeResults(results);

  if (results.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500">No se encontraron resultados</p>
        <p className="text-sm text-gray-400 mt-1">
          Intenta con diferentes palabras clave o ubicaciones
        </p>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-lg ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h3 className="font-semibold text-gray-900">
          {results.length} {results.length === 1 ? 'resultado' : 'resultados'}
        </h3>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Results List */}
      <div className="max-h-96 overflow-y-auto">
        {Object.entries(categories).map(([category, categoryResults]) => (
          <div key={category} className="border-b border-gray-100 last:border-b-0">
            {/* Category Header */}
            <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
              <h4 className="text-sm font-medium text-gray-700">{category}</h4>
            </div>

            {/* Category Results */}
            <div className="divide-y divide-gray-100">
              {categoryResults.map((result) => {
                const details = placeDetails.get(result.placeId);
                const isLoading = loadingDetails.has(result.placeId);
                const isExpanded = expandedPlace === result.placeId;

                return (
                  <div key={result.placeId} className="hover:bg-gray-50 transition-colors">
                    {/* Main Result */}
                    <div
                      className="p-4 cursor-pointer"
                      onClick={() => handlePlaceClick(result)}
                    >
                      <div className="flex items-start space-x-3">
                        {/* Icon */}
                        <div className="flex-shrink-0 text-lg">
                          {getPlaceTypeIcon(result.types)}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900 truncate">
                                {result.mainText}
                              </h4>
                              {result.secondaryText && (
                                <p className="text-sm text-gray-600 truncate mt-1">
                                  {result.secondaryText}
                                </p>
                              )}
                            </div>

                            {/* Actions */}
                            <div className="flex items-center space-x-1 ml-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleNavigate(result, details);
                                }}
                                className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                                title="Navegar aquí"
                              >
                                <Navigation className="h-4 w-4" />
                              </button>

                              {showDetails && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setExpandedPlace(isExpanded ? null : result.placeId);
                                  }}
                                  className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                                  title="Ver detalles"
                                >
                                  <ChevronDown
                                    className={`h-4 w-4 transform transition-transform ${
                                      isExpanded ? 'rotate-180' : ''
                                    }`}
                                  />
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Rating and Price */}
                          {(details?.rating || details?.priceLevel) && (
                            <div className="flex items-center space-x-3 mt-2">
                              {formatRating(details.rating, details.userRatingsTotal)}
                              {formatPriceLevel(details.priceLevel)}
                            </div>
                          )}

                          {/* Distance from current location if available */}
                          {result.distanceMeters && (
                            <div className="text-xs text-gray-500 mt-1">
                              A {(result.distanceMeters / 1000).toFixed(1)} km
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Loading indicator */}
                      {isLoading && (
                        <div className="flex items-center justify-center py-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                          <span className="ml-2 text-sm text-gray-500">Cargando...</span>
                        </div>
                      )}
                    </div>

                    {/* Expanded Details */}
                    {isExpanded && details && (
                      <div className="px-4 pb-4 border-t border-gray-100 bg-gray-50">
                        <div className="pt-3 space-y-2">
                          {/* Phone */}
                          {details.phoneNumber && (
                            <div className="flex items-center space-x-2 text-sm">
                              <Phone className="h-4 w-4 text-gray-400" />
                              <a
                                href={`tel:${details.phoneNumber}`}
                                className="text-blue-600 hover:underline"
                              >
                                {details.phoneNumber}
                              </a>
                            </div>
                          )}

                          {/* Website */}
                          {details.website && (
                            <div className="flex items-center space-x-2 text-sm">
                              <Globe className="h-4 w-4 text-gray-400" />
                              <a
                                href={details.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline truncate"
                              >
                                {details.website.replace(/^https?:\/\//, '')}
                              </a>
                            </div>
                          )}

                          {/* Opening Hours */}
                          {details.openingHours && (
                            <div className="flex items-center space-x-2 text-sm">
                              <Clock className="h-4 w-4 text-gray-400" />
                              <span className={details.openingHours.openNow ? 'text-green-600' : 'text-red-600'}>
                                {details.openingHours.openNow ? 'Abierto ahora' : 'Cerrado'}
                              </span>
                            </div>
                          )}

                          {/* Photos */}
                          {details.photos && details.photos.length > 0 && (
                            <div className="flex space-x-2 mt-3">
                              {details.photos.slice(0, 3).map((photo, index) => (
                                <img
                                  key={index}
                                  src={photo.url}
                                  alt={`${details.name} photo ${index + 1}`}
                                  className="w-16 h-16 object-cover rounded-lg"
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SearchResults;