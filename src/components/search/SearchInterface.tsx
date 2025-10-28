import React, { useState } from 'react';
import { MapPin, Search, Settings, Layers, BookOpen } from 'lucide-react';
import SearchBar from './SearchBar';
import SearchResults from './SearchResults';
import CoordinateInput from './CoordinateInput';
import PlacesAutocomplete from './PlacesAutocomplete';
import { AutocompletePrediction, PlaceDetails, Location, SearchFilters } from '../../types/search.types';

interface SearchInterfaceProps {
  onLocationSelected: (location: Location) => void;
  currentLocation?: Location;
  className?: string;
}

const SearchInterface: React.FC<SearchInterfaceProps> = ({
  onLocationSelected,
  currentLocation,
  className = '',
}) => {
  const [activeTab, setActiveTab] = useState<'search' | 'coordinates' | 'results'>('search');
  const [selectedPlace, setSelectedPlace] = useState<AutocompletePrediction | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    placeTypes: [],
    radius: 5000,
    openNow: false,
  });

  // Handle place selection
  const handlePlaceSelected = (place: AutocompletePrediction, details?: PlaceDetails) => {
    setSelectedPlace(place);
    if (details) {
      setSelectedLocation(details.location);
      onLocationSelected(details.location);
    }
    setActiveTab('results');
  };

  // Handle location selection
  const handleLocationSelected = (location: Location) => {
    setSelectedLocation(location);
    onLocationSelected(location);
  };

  // Handle coordinate update
  const handleCoordinateUpdate = (location: Location) => {
    setSelectedLocation(location);
    onLocationSelected(location);
    setActiveTab('results');
  };

  // Clear search
  const handleClearSearch = () => {
    setSelectedPlace(null);
    setSelectedLocation(null);
    setActiveTab('search');
  };

  // Get available place types for filters
  const placeTypes = [
    { id: 'restaurant', name: 'Restaurantes' },
    { id: 'lodging', name: 'Hoteles' },
    { id: 'gas_station', name: 'Gasolineras' },
    { id: 'bank', name: 'Bancos' },
    { id: 'pharmacy', name: 'Farmacias' },
    { id: 'hospital', name: 'Hospitales' },
    { id: 'park', name: 'Parques' },
    { id: 'shopping_mall', name: 'Centros comerciales' },
    { id: 'supermarket', name: 'Supermercados' },
    { id: 'cafe', name: 'Cafés' },
  ];

  return (
    <div className={`bg-white rounded-lg shadow-lg ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center">
          <Search className="h-5 w-5 mr-2" />
          Búsqueda de Lugares
        </h2>

        <div className="flex items-center space-x-2">
          {/* Filters Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2 rounded-md transition-colors ${
              showFilters ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'
            }`}
            title="Filtros de búsqueda"
          >
            <Settings className="h-4 w-4" />
          </button>

          {/* Clear Button */}
          {(selectedPlace || selectedLocation) && (
            <button
              onClick={handleClearSearch}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              title="Limpiar búsqueda"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Filtros de búsqueda</h3>

          <div className="space-y-3">
            {/* Place Types */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Tipo de lugar
              </label>
              <div className="flex flex-wrap gap-2">
                {placeTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => {
                      setFilters((prev) => ({
                        ...prev,
                        placeTypes: prev.placeTypes.includes(type.id)
                          ? prev.placeTypes.filter((t) => t !== type.id)
                          : [...prev.placeTypes, type.id],
                      }));
                    }}
                    className={`px-2 py-1 text-xs rounded-full transition-colors ${
                      filters.placeTypes.includes(type.id)
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {type.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Radius */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Radio de búsqueda: {filters.radius}m
              </label>
              <input
                type="range"
                min="500"
                max="20000"
                step="500"
                value={filters.radius}
                onChange={(e) => setFilters((prev) => ({ ...prev, radius: parseInt(e.target.value) }))}
                className="w-full"
              />
            </div>

            {/* Open Now */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="openNow"
                checked={filters.openNow || false}
                onChange={(e) => setFilters((prev) => ({ ...prev, openNow: e.target.checked }))}
                className="mr-2"
              />
              <label htmlFor="openNow" className="text-xs text-gray-600">
                Abierto ahora
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('search')}
          className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'search'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Search className="h-4 w-4 inline mr-1" />
          Búsqueda
        </button>
        <button
          onClick={() => setActiveTab('coordinates')}
          className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'coordinates'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <MapPin className="h-4 w-4 inline mr-1" />
          Coordenadas
        </button>
        {(selectedPlace || selectedLocation) && (
          <button
            onClick={() => setActiveTab('results')}
            className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'results'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Layers className="h-4 w-4 inline mr-1" />
            Resultados
          </button>
        )}
      </div>

      {/* Tab Content */}
      <div className="p-4">
        {/* Search Tab */}
        {activeTab === 'search' && (
          <div className="space-y-4">
            <PlacesAutocomplete
              onPlaceSelected={handlePlaceSelected}
              onLocationSelected={handleLocationSelected}
              currentLocation={currentLocation}
              filters={filters}
              showFilters={false}
              placeholder="Buscar restaurantes, hoteles, direcciones..."
            />

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  setFilters({ ...filters, placeTypes: ['restaurant'] });
                }}
                className="flex items-center justify-center px-3 py-2 bg-orange-50 text-orange-700 rounded-md hover:bg-orange-100 transition-colors text-sm"
              >
                🍽️ Restaurantes
              </button>
              <button
                onClick={() => {
                  setFilters({ ...filters, placeTypes: ['gas_station'] });
                }}
                className="flex items-center justify-center px-3 py-2 bg-green-50 text-green-700 rounded-md hover:bg-green-100 transition-colors text-sm"
              >
                ⛽ Gasolineras
              </button>
              <button
                onClick={() => {
                  setFilters({ ...filters, placeTypes: ['park'] });
                }}
                className="flex items-center justify-center px-3 py-2 bg-emerald-50 text-emerald-700 rounded-md hover:bg-emerald-100 transition-colors text-sm"
              >
                🌳 Parques
              </button>
              <button
                onClick={() => {
                  setFilters({ ...filters, placeTypes: ['shopping_mall'] });
                }}
                className="flex items-center justify-center px-3 py-2 bg-pink-50 text-pink-700 rounded-md hover:bg-pink-100 transition-colors text-sm"
              >
                🛍️ Compras
              </button>
            </div>
          </div>
        )}

        {/* Coordinates Tab */}
        {activeTab === 'coordinates' && (
          <CoordinateInput
            onLocationUpdate={handleCoordinateUpdate}
            initialLocation={selectedLocation || undefined}
            showBookmarkButton={true}
            showCurrentLocation={true}
          />
        )}

        {/* Results Tab */}
        {activeTab === 'results' && selectedPlace && (
          <div className="space-y-4">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-1">
                {selectedPlace.mainText}
              </h3>
              {selectedPlace.secondaryText && (
                <p className="text-sm text-blue-700">{selectedPlace.secondaryText}</p>
              )}
            </div>

            <div className="text-sm text-gray-600">
              <p>Coordenadas seleccionadas:</p>
              <p className="font-mono text-xs mt-1">
                {selectedLocation?.lat.toFixed(6)}, {selectedLocation?.lng.toFixed(6)}
              </p>
            </div>

            {/* Additional place details could be shown here */}
            {selectedLocation?.address && (
              <div className="text-sm text-gray-600">
                <p>Dirección:</p>
                <p className="mt-1">{selectedLocation.address}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Quick Help */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
        <div className="flex items-start space-x-2">
          <BookOpen className="h-4 w-4 text-gray-400 mt-0.5" />
          <div className="text-xs text-gray-500">
            <p className="font-medium">Consejos de búsqueda:</p>
            <ul className="mt-1 space-y-1">
              <li>• Usa términos específicos como "restaurantes italianos" o "hoteles económicos"</li>
              <li>• Escribe coordenadas直接 como "6.2442, -75.5812"</li>
              <li>• Usa filtros para refinar tu búsqueda por tipo de lugar o distancia</li>
              <li>• Haz clic en el ícono de navegación para usar tu ubicación actual</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchInterface;