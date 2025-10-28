import { Location } from './common.types';

// Search state types
export interface SearchState {
  query: string;
  predictions: PlacePrediction[];
  selectedLocation: Location | null;
  recentSearches: RecentSearch[];
  favorites: FavoriteLocation[];
  isLoading: boolean;
  error: string | null;
  debounceTimer?: NodeJS.Timeout;
}

// Google Places Autocomplete types
export interface PlacePrediction {
  placeId: string;
  description: string;
  mainText: string;
  secondaryText: string;
  types: string[];
  matchedSubstrings?: google.maps.places.PredictionSubstring[];
  terms?: google.maps.places.PredictionTerm[];
  distanceMeters?: number;
}

export interface PlaceDetails {
  placeId: string;
  name: string;
  formattedAddress: string;
  addressComponents: google.maps.GeocoderAddressComponent[];
  location: Location;
  geometry: {
    location: Location;
    viewport: google.maps.LatLngBounds;
  };
  types: string[];
  rating?: number;
  userRatingsTotal?: number;
  priceLevel?: number;
  photos?: google.maps.places.PlacePhoto[];
  openingHours?: google.maps.places.PlaceOpeningHours;
  website?: string;
  phoneNumber?: string;
  internationalPhoneNumber?: string;
  reviews?: google.maps.places.PlaceReview[];
}

// Search configuration types
export interface SearchConfig {
  debounceDelay: number;
  minQueryLength: number;
  maxResults: number;
  searchRadius: number; // in meters
  searchTypes: string[];
  language: string;
  region: string;
  strictBounds: boolean;
}

// Recent searches and favorites
export interface RecentSearch {
  id: string;
  query: string;
  location: Location;
  timestamp: Date;
  placeId?: string;
}

export interface FavoriteLocation {
  id: string;
  name: string;
  location: Location;
  address: string;
  category: FavoriteCategory;
  icon?: string;
  color?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type FavoriteCategory =
  | 'home'
  | 'work'
  | 'restaurant'
  | 'shopping'
  | 'entertainment'
  | 'travel'
  | 'other';

// Search filters and options
export interface SearchFilters {
  types?: string[];
  priceLevel?: number[];
  rating?: number;
  isOpen?: boolean;
  radius?: number;
  region?: string;
  language?: string;
}

export interface SearchOptions {
  location?: Location;
  radius?: number;
  bounds?: google.maps.LatLngBounds;
  types?: string[];
  componentRestrictions?: {
    country?: string;
    postalCode?: string;
    administrativeArea?: string;
    locality?: string;
    sublocality?: string;
  };
  strictBounds?: boolean;
  language?: string;
  region?: string;
}

// Search result types
export interface SearchResult {
  id: string;
  type: SearchResultType;
  location: Location;
  title: string;
  description: string;
  address?: string;
  distance?: number;
  rating?: number;
  priceLevel?: number;
  isOpen?: boolean;
  photos?: string[];
  categories?: string[];
  metadata?: Record<string, any>;
}

export type SearchResultType =
  | 'place'
  | 'address'
  | 'establishment'
  | 'geocode'
  | 'transit_station'
  | 'favorite'
  | 'recent';

// Search analytics
export interface SearchAnalytics {
  query: string;
  resultsCount: number;
  selectedResult?: string;
  timeTaken: number;
  timestamp: Date;
  userId?: string;
  sessionId: string;
}

// Search errors
export interface SearchError {
  code: SearchErrorCode;
  message: string;
  query: string;
  timestamp: Date;
}

export type SearchErrorCode =
  | 'ZERO_RESULTS'
  | 'OVER_QUERY_LIMIT'
  | 'REQUEST_DENIED'
  | 'INVALID_REQUEST'
  | 'UNKNOWN_ERROR'
  | 'NETWORK_ERROR'
  | 'TIMEOUT';

// Search suggestions
export interface SearchSuggestion {
  id: string;
  text: string;
  type: SuggestionType;
  data?: any;
  icon?: string;
  action?: SuggestionAction;
}

export type SuggestionType =
  | 'query'
  | 'place'
  | 'address'
  | 'category'
  | 'recent'
  | 'favorite';

export interface SuggestionAction {
  type: 'navigate' | 'search' | 'filter' | 'custom';
  payload?: any;
}

// Search history management
export interface SearchHistory {
  id: string;
  searches: RecentSearch[];
  favorites: FavoriteLocation[];
  settings: SearchSettings;
  lastUpdated: Date;
}

export interface SearchSettings {
  maxHistoryItems: number;
  enableLocationTracking: boolean;
  defaultSearchRadius: number;
  preferredLanguage: string;
  enableSearchAnalytics: boolean;
  customFilters: SearchFilters[];
}