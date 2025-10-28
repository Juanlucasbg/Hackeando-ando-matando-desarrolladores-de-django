import { useEffect, useCallback, useRef, useState } from 'react';
import { useSearchStore, useMapStore, useUserStore } from '../stores';
import { SearchPrediction, SearchResult, SearchHistoryItem, Location } from '../types';

interface UseSearchOptions {
  debounceMs?: number;
  minQueryLength?: number;
  maxResults?: number;
  enableHistory?: boolean;
  enablePredictions?: boolean;
  onSearchStart?: (query: string) => void;
  onSearchComplete?: (results: SearchResult[]) => void;
  onSearchError?: (error: string) => void;
  onPredictionReceived?: (predictions: SearchPrediction[]) => void;
}

interface UseSearchReturn {
  query: string;
  predictions: SearchPrediction[];
  results: SearchResult[];
  selectedResult: SearchResult | null;
  history: SearchHistoryItem[];
  isLoading: boolean;
  isSearching: boolean;
  error: string | null;

  // Actions
  setQuery: (query: string) => void;
  performSearch: (query: string) => Promise<void>;
  selectResult: (result: SearchResult | null) => void;
  selectPrediction: (prediction: SearchPrediction) => Promise<void>;
  clearSearch: () => void;
  clearHistory: () => void;
  removeFromHistory: (id: string) => void;
  searchHistory: (query?: string) => SearchHistoryItem[];

  // Utilities
  hasQuery: boolean;
  hasResults: boolean;
  hasPredictions: boolean;
  resultCount: number;
  historyCount: number;
}

const defaultOptions: UseSearchOptions = {
  debounceMs: 300,
  minQueryLength: 2,
  maxResults: 10,
  enableHistory: true,
  enablePredictions: true,
};

// Google Places API service instances
let autocompleteService: google.maps.places.AutocompleteService | null = null;
let placesService: google.maps.places.PlacesService | null = null;
let geocoderService: google.maps.Geocoder | null = null;

// Initialize Google Places services
const initializeGoogleServices = () => {
  if (!window.google) return;

  if (!autocompleteService) {
    autocompleteService = new google.maps.places.AutocompleteService();
  }

  if (!geocoderService) {
    geocoderService = new google.maps.Geocoder();
  }
};

// Mock functions for when Google API is not available
const mockGetPlacePredictions = async (query: string): Promise<SearchPrediction[]> => {
  await new Promise(resolve => setTimeout(resolve, 200));

  if (query.length < 2) return [];

  return [
    {
      description: `${query}, New York, NY, USA`,
      placeId: `mock_pred_${Date.now()}`,
      terms: [
        { offset: 0, value: query },
        { offset: query.length + 2, value: 'New York' },
      ],
      types: ['locality', 'political'],
    },
    {
      description: `${query}, Brooklyn, NY, USA`,
      placeId: `mock_pred_${Date.now() + 1}`,
      terms: [
        { offset: 0, value: query },
        { offset: query.length + 2, value: 'Brooklyn' },
      ],
      types: ['locality', 'political'],
    },
  ];
};

const mockGetPlaceDetails = async (placeId: string): Promise<SearchResult> => {
  await new Promise(resolve => setTimeout(resolve, 300));

  return {
    lat: 40.7128 + Math.random() * 0.1,
    lng: -74.0060 + Math.random() * 0.1,
    address: `Address for ${placeId}`,
    placeId,
    formattedAddress: `Formatted Address for ${placeId}`,
    relevance: 0.95,
    rating: 4.5,
    distance: 2.5,
  };
};

const mockGeocodeAddress = async (address: string): Promise<SearchResult[]> => {
  await new Promise(resolve => setTimeout(resolve, 400));

  return [
    {
      lat: 40.7128,
      lng: -74.0060,
      address,
      placeId: `mock_place_${Date.now()}`,
      formattedAddress: `${address}, New York, NY, USA`,
      relevance: 0.95,
      rating: 4.5,
      distance: 2.5,
    },
  ];
};

export const useSearch = (options: UseSearchOptions = {}): UseSearchReturn => {
  const optionsRef = useRef({ ...defaultOptions, ...options });
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Store selectors
  const {
    query,
    predictions,
    results,
    selectedResult,
    history,
    isLoading,
    isSearching,
    error,
    setQuery: setStoreQuery,
    setPredictions,
    setResults,
    setSelectedResult,
    performSearch: performStoreSearch,
    clearSearch: clearStoreSearch,
    addToHistory,
    removeFromHistory: removeFromStoreHistory,
    clearHistory: clearStoreHistory,
    getRecentSearches,
  } = useSearchStore();

  const { setCenter, addMarker, setLoading: setMapLoading } = useMapStore();
  const { preferences } = useUserStore();

  // Initialize Google services
  useEffect(() => {
    if (typeof window !== 'undefined && window.google) {
      initializeGoogleServices();
    }
  }, []);

  // Debounced search function
  const debouncedSearch = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < optionsRef.current.minQueryLength) {
      setPredictions([]);
      return;
    }

    try {
      if (autocompleteService && optionsRef.current.enablePredictions) {
        const response = await new Promise<google.maps.places.AutocompleteResponse>(
          (resolve, reject) => {
            autocompleteService!.getPlacePredictions(
              {
                input: searchQuery,
                componentRestrictions: { country: preferences.language === 'en' ? 'us' : undefined },
                types: ['geocode', 'establishment'],
              },
              (predictions, status) => {
                if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
                  resolve(predictions);
                } else {
                  reject(new Error(`Autocomplete failed: ${status}`));
                }
              }
            );
          }
        );

        const searchPredictions: SearchPrediction[] = response.slice(0, optionsRef.current.maxResults).map(
          prediction => ({
            description: prediction.description,
            placeId: prediction.place_id,
            terms: prediction.terms || [],
            types: prediction.types || [],
          })
        );

        setPredictions(searchPredictions);
        optionsRef.current.onPredictionReceived?.(searchPredictions);
      } else {
        // Use mock predictions when Google API is not available
        const mockPredictions = await mockGetPlacePredictions(searchQuery);
        setPredictions(mockPredictions.slice(0, optionsRef.current.maxResults));
      }
    } catch (error) {
      console.error('Error getting predictions:', error);
      setPredictions([]);
    }
  }, [setPredictions, preferences.language]);

  // Set query with debouncing
  const setQuery = useCallback((newQuery: string) => {
    setStoreQuery(newQuery);

    // Clear previous timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new timer
    if (newQuery.trim()) {
      debounceTimerRef.current = setTimeout(() => {
        debouncedSearch(newQuery);
      }, optionsRef.current.debounceMs);
    } else {
      setPredictions([]);
    }
  }, [setStoreQuery, debouncedSearch, setPredictions]);

  // Perform search
  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    optionsRef.current.onSearchStart?.(searchQuery);

    try {
      let searchResults: SearchResult[] = [];

      // Try Google Places API first
      if (geocoderService) {
        const response = await new Promise<google.maps.GeocoderResponse>(
          (resolve, reject) => {
            geocoderService!.geocode(
              { address: searchQuery },
              (results, status) => {
                if (status === google.maps.GeocoderStatus.OK && results) {
                  resolve(results);
                } else {
                  reject(new Error(`Geocoding failed: ${status}`));
                }
              }
            );
          }
        );

        searchResults = response.slice(0, optionsRef.current.maxResults).map(result => ({
          lat: result.geometry.location.lat(),
          lng: result.geometry.location.lng(),
          address: result.formatted_address,
          placeId: result.place_id,
          formattedAddress: result.formatted_address,
          relevance: 1.0, // Google doesn't provide relevance, so use 1.0
          addressComponents: result.address_components,
        }));
      } else {
        // Use mock search when Google API is not available
        searchResults = await mockGeocodeAddress(searchQuery);
      }

      setResults(searchResults);
      optionsRef.current.onSearchComplete?.(searchResults);

      if (searchResults.length > 0 && optionsRef.current.enableHistory) {
        addToHistory({
          query: searchQuery.trim(),
          location: {
            lat: searchResults[0].lat,
            lng: searchResults[0].lng,
            address: searchResults[0].address,
            placeId: searchResults[0].placeId,
            formattedAddress: searchResults[0].formattedAddress,
          },
          type: 'address',
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Search failed';
      optionsRef.current.onSearchError?.(errorMessage);
    }
  }, [setResults, addToHistory, optionsRef.current.maxResults, optionsRef.current.enableHistory]);

  // Select prediction
  const selectPrediction = useCallback(async (prediction: SearchPrediction) => {
    try {
      let result: SearchResult;

      if (placesService && prediction.placeId.startsWith('mock_')) {
        // Use mock result for mock predictions
        result = await mockGetPlaceDetails(prediction.placeId);
      } else if (placesService) {
        // Get actual place details from Google Places API
        result = await new Promise<SearchResult>((resolve, reject) => {
          placesService!.getDetails(
            { placeId: prediction.placeId },
            (place, status) => {
              if (status === google.maps.places.PlacesServiceStatus.OK && place) {
                resolve({
                  lat: place.geometry!.location!.lat(),
                  lng: place.geometry!.location!.lng(),
                  address: place.formatted_address || prediction.description,
                  placeId: place.place_id!,
                  formattedAddress: place.formatted_address || prediction.description,
                  relevance: 1.0,
                  rating: place.rating,
                  photos: place.photos?.map(photo => photo.getUrl() || ''),
                });
              } else {
                reject(new Error(`Place details failed: ${status}`));
              }
            }
          );
        });
      } else {
        // Use mock result
        result = await mockGetPlaceDetails(prediction.placeId);
      }

      setSelectedResult(result);
      setCenter({ lat: result.lat, lng: result.lng });

      // Add marker for selected location
      addMarker({
        position: { lat: result.lat, lng: result.lng },
        title: result.address || 'Selected Location',
        description: result.formattedAddress,
        animation: google.maps.Animation.DROP,
      });

      if (optionsRef.current.enableHistory) {
        addToHistory({
          query: prediction.description,
          location: {
            lat: result.lat,
            lng: result.lng,
            address: result.address,
            placeId: result.placeId,
            formattedAddress: result.formattedAddress,
          },
          type: 'place',
        });
      }
    } catch (error) {
      console.error('Error selecting prediction:', error);
    }
  }, [setSelectedResult, setCenter, addMarker, addToHistory, optionsRef.current.enableHistory]);

  // Select result
  const selectResult = useCallback((result: SearchResult | null) => {
    setSelectedResult(result);

    if (result) {
      setCenter({ lat: result.lat, lng: result.lng });

      addMarker({
        position: { lat: result.lat, lng: result.lng },
        title: result.address || 'Selected Location',
        description: result.formattedAddress,
        animation: google.maps.Animation.DROP,
      });
    }
  }, [setSelectedResult, setCenter, addMarker]);

  // Clear search
  const clearSearch = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    clearStoreSearch();
  }, [clearStoreSearch]);

  // Search history
  const searchHistory = useCallback((query?: string) => {
    if (!query) return getRecentSearches();

    const lowerQuery = query.toLowerCase();
    return getRecentSearches().filter(
      item =>
        item.query.toLowerCase().includes(lowerQuery) ||
        item.location?.address?.toLowerCase().includes(lowerQuery)
    );
  }, [getRecentSearches]);

  const removeFromHistory = useCallback((id: string) => {
    removeFromStoreHistory(id);
  }, [removeFromStoreHistory]);

  const clearHistory = useCallback(() => {
    clearStoreHistory();
  }, [clearStoreHistory]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // Computed values
  const hasQuery = query.trim().length > 0;
  const hasResults = results.length > 0;
  const hasPredictions = predictions.length > 0;
  const resultCount = results.length;
  const historyCount = history.length;

  return {
    query,
    predictions,
    results,
    selectedResult,
    history,
    isLoading,
    isSearching,
    error,

    // Actions
    setQuery,
    performSearch,
    selectResult,
    selectPrediction,
    clearSearch,
    clearHistory,
    removeFromHistory,
    searchHistory,

    // Utilities
    hasQuery,
    hasResults,
    hasPredictions,
    resultCount,
    historyCount,
  };
};

export default useSearch;