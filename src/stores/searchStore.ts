interface SearchStore extends EnhancedSearchState {
  // Actions
  setQuery: (query: string) => void;
  setPredictions: (predictions: SearchPrediction[]) => void;
  setResults: (results: SearchResult[]) => void;
  setSelectedResult: (result: SearchResult | null) => void;
  setSelectedLocation: (location: Location | null) => void;
  addToHistory: (item: Omit<SearchHistoryItem, 'id' | 'timestamp'>) => void;
  removeFromHistory: (id: string) => void;
  clearHistory: () => void;
  setLoading: (isLoading: boolean) => void;
  setSearching: (isSearching: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  performSearch: (query: string) => Promise<void>;
  clearSearch: () => void;

  // Computed getters
  getRecentSearches: (limit?: number) => SearchHistoryItem[];
  getSearchHistoryByType: (type: SearchHistoryItem['type']) => SearchHistoryItem[];
  hasSearchResults: () => boolean;
  getSearchResultById: (id: string) => SearchResult | undefined;
}

const MAX_HISTORY_ITEMS = 50;
const RECENT_SEARCHES_LIMIT = 10;

const generateHistoryId = () => `history_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const initialState: EnhancedSearchState = {
  query: '',
  predictions: [],
  results: [],
  selectedLocation: null,
  isLoading: false,
  error: null,
  history: [],
  isSearching: false,
  lastSearchTime: null,
};

// Mock search function - replace with actual Google Places API implementation
const performGeocodingSearch = async (query: string): Promise<SearchResult[]> => {
  if (!query.trim()) return [];

  try {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 300));

    // Mock search results - replace with actual Google Places API
    const mockResults: SearchResult[] = [
      {
        lat: 40.7128,
        lng: -74.0060,
        address: `${query}, New York, NY, USA`,
        placeId: `place_${Date.now()}`,
        formattedAddress: `${query}, New York, NY, USA`,
        relevance: 0.95,
        rating: 4.5,
        distance: 2.5,
      },
      {
        lat: 40.7589,
        lng: -73.9851,
        address: `${query}, Times Square, New York, NY, USA`,
        placeId: `place_${Date.now() + 1}`,
        formattedAddress: `${query}, Times Square, New York, NY, USA`,
        relevance: 0.87,
        rating: 4.2,
        distance: 3.1,
      },
    ];

    return mockResults.filter(result =>
      result.address?.toLowerCase().includes(query.toLowerCase())
    );
  } catch (error) {
    console.error('Search error:', error);
    throw new Error('Failed to perform search');
  }
};

// Mock autocomplete function - replace with actual Google Places Autocomplete
const getPlacePredictions = async (query: string): Promise<SearchPrediction[]> => {
  if (query.length < 2) return [];

  try {
    await new Promise(resolve => setTimeout(resolve, 200));

    const mockPredictions: SearchPrediction[] = [
      {
        description: `${query}, New York, NY, USA`,
        placeId: `pred_${Date.now()}`,
        terms: [
          { offset: 0, value: query },
          { offset: query.length + 2, value: 'New York' },
        ],
        types: ['locality', 'political'],
      },
      {
        description: `${query}, Brooklyn, NY, USA`,
        placeId: `pred_${Date.now() + 1}`,
        terms: [
          { offset: 0, value: query },
          { offset: query.length + 2, value: 'Brooklyn' },
        ],
        types: ['locality', 'political'],
      },
    ];

    return mockPredictions.filter(pred =>
      pred.description.toLowerCase().includes(query.toLowerCase())
    );
  } catch (error) {
    console.error('Autocomplete error:', error);
    return [];
  }
};

export const useSearchStore = create<SearchStore>()(
  devtools(
    persist(
      immer((set, get) => ({
        ...initialState,

        // Actions
        setQuery: (query) =>
          set((state) => {
            state.query = query;
            state.error = null;

            // Auto-trigger predictions if query is long enough
            if (query.length >= 2) {
              get().fetchPredictions(query);
            } else {
              state.predictions = [];
            }
          }),

        setPredictions: (predictions) =>
          set((state) => {
            state.predictions = predictions;
          }),

        setResults: (results) =>
          set((state) => {
            state.results = results;
            state.lastSearchTime = Date.now();
          }),

        setSelectedResult: (result) =>
          set((state) => {
            state.selectedResult = result;
            if (result) {
              state.selectedLocation = {
                lat: result.lat,
                lng: result.lng,
                address: result.address,
                placeId: result.placeId,
                formattedAddress: result.formattedAddress,
              };
            }
          }),

        setSelectedLocation: (location) =>
          set((state) => {
            state.selectedLocation = location;
          }),

        addToHistory: (itemData) =>
          set((state) => {
            const historyItem: SearchHistoryItem = {
              ...itemData,
              id: generateHistoryId(),
              timestamp: new Date(),
            };

            // Remove existing item with same query to avoid duplicates
            state.history = state.history.filter(
              (item) => item.query.toLowerCase() !== historyItem.query.toLowerCase()
            );

            // Add new item to beginning
            state.history.unshift(historyItem);

            // Limit history size
            if (state.history.length > MAX_HISTORY_ITEMS) {
              state.history = state.history.slice(0, MAX_HISTORY_ITEMS);
            }
          }),

        removeFromHistory: (id) =>
          set((state) => {
            state.history = state.history.filter((item) => item.id !== id);
          }),

        clearHistory: () =>
          set((state) => {
            state.history = [];
          }),

        setLoading: (isLoading) =>
          set((state) => {
            state.isLoading = isLoading;
          }),

        setSearching: (isSearching) =>
          set((state) => {
            state.isSearching = isSearching;
          }),

        setError: (error) =>
          set((state) => {
            state.error = error;
            state.isLoading = false;
            state.isSearching = false;
          }),

        clearError: () =>
          set((state) => {
            state.error = null;
          }),

        performSearch: async (query) => {
          const state = get();

          if (!query.trim()) {
            state.setResults([]);
            state.setError('Please enter a search query');
            return;
          }

          state.setLoading(true);
          state.setSearching(true);
          state.clearError();

          try {
            const results = await performGeocodingSearch(query);
            state.setResults(results);

            if (results.length > 0 && results[0]) {
              state.setSelectedResult(results[0]);

              // Add to history
              state.addToHistory({
                query: query.trim(),
                location: {
                  lat: results[0].lat,
                  lng: results[0].lng,
                  address: results[0].address,
                  placeId: results[0].placeId,
                  formattedAddress: results[0].formattedAddress,
                },
                type: 'address',
              });
            } else {
              state.setError('No results found');
            }
          } catch (error) {
            state.setError(error instanceof Error ? error.message : 'Search failed');
          } finally {
            state.setLoading(false);
            state.setSearching(false);
          }
        },

        clearSearch: () =>
          set((state) => {
            state.query = '';
            state.predictions = [];
            state.results = [];
            state.selectedResult = null;
            state.selectedLocation = null;
            state.error = null;
          }),

        // Helper method for fetching predictions
        fetchPredictions: async (query: string) => {
          try {
            const predictions = await getPlacePredictions(query);
            get().setPredictions(predictions);
          } catch (error) {
            console.error('Failed to fetch predictions:', error);
          }
        },

        // Computed getters
        getRecentSearches: (limit = RECENT_SEARCHES_LIMIT) => {
          return get().history.slice(0, limit);
        },

        getSearchHistoryByType: (type) => {
          return get().history.filter((item) => item.type === type);
        },

        hasSearchResults: () => {
          return get().results.length > 0;
        },

        getSearchResultById: (id) => {
          return get().results.find((result) => result.placeId === id);
        },
      })),
      {
        name: 'search-store',
        version: 1,
        partialize: (state) => ({
          history: state.history,
        }),
        onRehydrateStorage: () => (state) => {
          console.log('Search store hydrated:', state);
        },
      }
    ),
    {
      name: 'search-store',
      enabled: process.env.NODE_ENV === 'development',
    }
  )
);

// Selectors for optimized re-renders
export const useSearchQuery = () => useSearchStore((state) => state.query);
export const useSearchPredictions = () => useSearchStore((state) => state.predictions);
export const useSearchResults = () => useSearchStore((state) => state.results);
export const useSelectedSearchResult = () => useSearchStore((state) => state.selectedResult);
export const useSelectedLocation = () => useSearchStore((state) => state.selectedLocation);
export const useSearchHistory = () => useSearchStore((state) => state.history);
export const useSearchLoading = () => useSearchStore((state) => state.isLoading);
export const useSearching = () => useSearchStore((state) => state.isSearching);
export const useSearchError = () => useSearchStore((state) => state.error);

// Computed selectors
export const useRecentSearches = (limit?: number) =>
  useSearchStore((state) => state.getRecentSearches(limit));
export const useSearchHistoryByType = (type: SearchHistoryItem['type']) =>
  useSearchStore((state) => state.getSearchHistoryByType(type));
export const useHasSearchResults = () => useSearchStore((state) => state.hasSearchResults());

export default useSearchStore;