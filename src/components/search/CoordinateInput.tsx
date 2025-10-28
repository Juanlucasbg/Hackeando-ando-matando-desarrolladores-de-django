import React, { useState, useRef } from 'react';
import { MapPin, Navigation, Bookmark, AlertCircle, Check, X } from 'lucide-react';
import { geocodingService } from '../../services/geocodingService';
import { useSearchStore } from '../../stores/searchStore';
import {
  Location,
  CoordinateFormat,
  ValidationErrors,
  CoordinateBookmark
} from '../../types/search.types';

interface CoordinateInputProps {
  onLocationUpdate: (location: Location) => void;
  initialLocation?: Location;
  showBookmarkButton?: boolean;
  showCurrentLocation?: boolean;
  className?: string;
}

const CoordinateInput: React.FC<CoordinateInputProps> = ({
  onLocationUpdate,
  initialLocation,
  showBookmarkButton = true,
  showCurrentLocation = true,
  className = '',
}) => {
  const { addBookmark } = useSearchStore();

  const [latitude, setLatitude] = useState(initialLocation?.lat.toString() || '');
  const [longitude, setLongitude] = useState(initialLocation?.lng.toString() || '');
  const [format, setFormat] = useState<'decimal' | 'dms'>('decimal');
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isValid, setIsValid] = useState(false);
  const [isBookmarking, setIsBookmarking] = useState(false);
  const [bookmarkName, setBookmarkName] = useState('');
  const [showBookmarkDialog, setShowBookmarkDialog] = useState(false);

  const latInputRef = useRef<HTMLInputElement>(null);
  const lngInputRef = useRef<HTMLInputElement>(null);

  // Validate coordinates
  const validateCoordinates = (lat: string, lng: string): ValidationErrors => {
    const newErrors: ValidationErrors = {};

    // Parse coordinates
    const parsedLocation = geocodingService.parseCoordinates(lat, lng);

    if (!parsedLocation) {
      if (!lat.trim()) {
        newErrors.latitude = 'La latitud es requerida';
      } else {
        newErrors.latitude = 'Latitud inválida. Use formato decimal (ej: 6.2442) o DMS (ej: 6°14′39″N)';
      }

      if (!lng.trim()) {
        newErrors.longitude = 'La longitud es requerida';
      } else {
        newErrors.longitude = 'Longitud inválida. Use formato decimal (ej: -75.5812) o DMS (ej: 75°34′52″W)';
      }

      newErrors.general = 'Coordenadas inválidas';
    } else if (!geocodingService.isValidCoordinate(parsedLocation.lat, parsedLocation.lng)) {
      newErrors.general = 'Las coordenadas están fuera del rango válido';
    }

    return newErrors;
  };

  // Handle coordinate input changes
  const handleCoordinateChange = (lat: string, lng: string) => {
    setLatitude(lat);
    setLongitude(lng);

    const newErrors = validateCoordinates(lat, lng);
    setErrors(newErrors);
    setIsValid(Object.keys(newErrors).length === 0);

    // If valid, update location
    if (Object.keys(newErrors).length === 0) {
      const location = geocodingService.parseCoordinates(lat, lng);
      if (location) {
        onLocationUpdate({
          ...location,
          address: `${lat}, ${lng}`,
        });
      }
    }
  };

  // Format coordinates
  const formatCoordinates = (format: 'decimal' | 'dms') => {
    if (!latitude || !longitude) return;

    const location = geocodingService.parseCoordinates(latitude, longitude);
    if (!location) return;

    const formatted = geocodingService.formatCoordinates(location, format);
    setLatitude(formatted.lat);
    setLongitude(formatted.lng);
    setFormat(format);
  };

  // Get current location
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setErrors({ general: 'La geolocalización no está disponible en tu navegador' });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude: lat, longitude: lng } = position.coords;
        const formatted = geocodingService.formatCoordinates({ lat, lng }, format);

        setLatitude(formatted.lat);
        setLongitude(formatted.lng);
        setErrors({});
        setIsValid(true);

        onLocationUpdate({
          lat,
          lng,
          address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
        });
      },
      (error) => {
        let errorMessage = 'No se pudo obtener la ubicación actual';

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Permiso de ubicación denegado. Por favor, habilita el acceso a la ubicación.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'La información de ubicación no está disponible.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Tiempo de espera agotado al obtener la ubicación.';
            break;
        }

        setErrors({ general: errorMessage });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      }
    );
  };

  // Handle bookmark
  const handleBookmark = () => {
    const location = geocodingService.parseCoordinates(latitude, longitude);
    if (!location || !isValid) return;

    setShowBookmarkDialog(true);
    setBookmarkName(`Coordenadas ${latitude}, ${longitude}`);
  };

  const saveBookmark = () => {
    const location = geocodingService.parseCoordinates(latitude, longitude);
    if (!location || !bookmarkName.trim()) return;

    addBookmark({
      name: bookmarkName.trim(),
      location: {
        ...location,
        address: `${latitude}, ${longitude}`,
      },
      description: `Coordenadas: ${latitude}, ${longitude}`,
      category: 'Coordinates',
    });

    setShowBookmarkDialog(false);
    setBookmarkName('');
    setIsBookmarking(false);
  };

  // Clear inputs
  const clearInputs = () => {
    setLatitude('');
    setLongitude('');
    setErrors({});
    setIsValid(false);
  };

  // Helper to parse DMS input
  const parseDMSInput = (input: string): number | null => {
    try {
      return geocodingService.parseDMSToDecimal(input);
    } catch {
      return null;
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Format Toggle */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Coordenadas</h3>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => formatCoordinates('decimal')}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              format === 'decimal'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Decimal
          </button>
          <button
            onClick={() => formatCoordinates('dms')}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              format === 'dms'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            DMS
          </button>
        </div>
      </div>

      {/* Coordinate Inputs */}
      <div className="space-y-3">
        {/* Latitude */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Latitud {format === 'dms' ? '(DMS)' : '(Decimal)'}
          </label>
          <div className="relative">
            <input
              ref={latInputRef}
              type="text"
              value={latitude}
              onChange={(e) => handleCoordinateChange(e.target.value, longitude)}
              placeholder={format === 'dms' ? '6°14′39″N' : '6.2442'}
              className={`w-full px-3 py-2 pr-10 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors ${
                errors.latitude ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              {isValid && !errors.latitude ? (
                <Check className="h-5 w-5 text-green-500" />
              ) : errors.latitude ? (
                <AlertCircle className="h-5 w-5 text-red-500" />
              ) : null}
            </div>
          </div>
          {errors.latitude && (
            <p className="mt-1 text-xs text-red-600">{errors.latitude}</p>
          )}
        </div>

        {/* Longitude */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Longitud {format === 'dms' ? '(DMS)' : '(Decimal)'}
          </label>
          <div className="relative">
            <input
              ref={lngInputRef}
              type="text"
              value={longitude}
              onChange={(e) => handleCoordinateChange(latitude, e.target.value)}
              placeholder={format === 'dms' ? '75°34′52″W' : '-75.5812'}
              className={`w-full px-3 py-2 pr-10 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors ${
                errors.longitude ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              {isValid && !errors.longitude ? (
                <Check className="h-5 w-5 text-green-500" />
              ) : errors.longitude ? (
                <AlertCircle className="h-5 w-5 text-red-500" />
              ) : null}
            </div>
          </div>
          {errors.longitude && (
            <p className="mt-1 text-xs text-red-600">{errors.longitude}</p>
          )}
        </div>

        {/* General Error */}
        {errors.general && (
          <div className="flex items-start space-x-2 p-3 bg-red-50 border border-red-200 rounded-md">
            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-red-700">{errors.general}</p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {showCurrentLocation && (
            <button
              onClick={getCurrentLocation}
              className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Navigation className="h-4 w-4" />
              <span className="text-sm font-medium">Ubicación actual</span>
            </button>
          )}

          {showBookmarkButton && isValid && (
            <button
              onClick={handleBookmark}
              disabled={isBookmarking}
              className="flex items-center space-x-2 px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              <Bookmark className="h-4 w-4" />
              <span className="text-sm font-medium">Guardar</span>
            </button>
          )}
        </div>

        {(latitude || longitude) && (
          <button
            onClick={clearInputs}
            className="flex items-center space-x-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
          >
            <X className="h-4 w-4" />
            <span className="text-sm font-medium">Limpiar</span>
          </button>
        )}
      </div>

      {/* Coordinate Format Examples */}
      <div className="text-xs text-gray-500 space-y-1">
        <p className="font-medium text-gray-700">Ejemplos:</p>
        {format === 'decimal' ? (
          <>
            <p>• Medellín: 6.2442, -75.5812</p>
            <p>• Bogotá: 4.7110, -74.0721</p>
            <p>• Cali: 3.4516, -76.5319</p>
          </>
        ) : (
          <>
            <p>• Medellín: 6°14′39″N, 75°34′52″W</p>
            <p>• Bogotá: 4°42′40″N, 74°4′19″W</p>
            <p>• Cali: 3°27′6″N, 76°31′55″W</p>
          </>
        )}
      </div>

      {/* Bookmark Dialog */}
      {showBookmarkDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Guardar Coordenadas
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre del marcador
                </label>
                <input
                  type="text"
                  value={bookmarkName}
                  onChange={(e) => setBookmarkName(e.target.value)}
                  placeholder="Ej: Mi ubicación favorita"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>

              <div className="text-sm text-gray-600">
                <p>Coordenadas:</p>
                <p className="font-mono">{latitude}, {longitude}</p>
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => setShowBookmarkDialog(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={saveBookmark}
                disabled={!bookmarkName.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoordinateInput;