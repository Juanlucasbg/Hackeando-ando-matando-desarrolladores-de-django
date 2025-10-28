// Export all types from a central location
export * from './common.types';
export * from './map.types';
export * from './search.types';
export * from './api.types';

// Re-export commonly used Google Maps types
export type {
  LatLng,
  LatLngLiteral,
  MapOptions,
  MapTypeId,
  ControlPosition,
  GestureHandlingOptions,
  TravelMode,
  UnitSystem,
  DirectionsRequest,
  DirectionsResult,
  GeocoderRequest,
  GeocoderResult,
  GeocoderStatus,
  AutocompleteRequest,
  AutocompleteResponse,
  PlaceResult,
  PlacesServiceStatus,
} from 'google.maps';

// Re-export commonly used Google Places types
export type {
  AutocompletePrediction,
  AutocompleteSessionToken,
  PlaceDetailsRequest,
  PlacePhoto,
  PlaceOpeningHours,
} from 'google.maps.places';