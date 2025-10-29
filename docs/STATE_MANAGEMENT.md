# State Management System Documentation

## Overview

This document describes the comprehensive Zustand-based state management system implemented for the Google Maps clone application. The system is designed to be scalable, type-safe, and performant with proper TypeScript interfaces, error handling, and debugging capabilities.

## Architecture

### Store Structure

The state management system consists of four main stores:

1. **mapStore** - Manages map state, markers, layers, and street view
2. **searchStore** - Handles search queries, predictions, results, and history
3. **uiStore** - Controls UI state, modals, notifications, and theme
4. **userStore** - Manages user preferences, geolocation, and profile data

### Directory Structure

```
src/
├── stores/
│   ├── index.ts          # Main store integration and utilities
│   ├── mapStore.ts       # Map state management
│   ├── searchStore.ts    # Search state management
│   ├── uiStore.ts        # UI state management
│   └── userStore.ts      # User state management
├── hooks/
│   ├── index.ts          # Hook exports and utilities
│   ├── useGoogleMaps.ts  # Google Maps integration hook
│   ├── useGeolocation.ts # Geolocation hook
│   ├── useSearch.ts      # Search functionality hook
│   ├── useLocalStorage.ts # Local storage utilities
│   └── useDebounce.ts    # Debouncing utilities
├── utils/
│   ├── stateValidation.ts # State validation utilities
│   ├── stateMigration.ts  # State migration utilities
│   ├── stateReset.ts      # State reset utilities
│   └── stateDebug.ts      # State debugging utilities
├── types/
│   └── index.ts          # TypeScript interfaces
└── config/
    └── maps.ts           # Google Maps configuration
```

## Store API Reference

### mapStore

Manages all map-related state including center position, zoom level, markers, layers, and street view functionality.

#### State Interface
```typescript
interface EnhancedMapState {
  center: Coordinates;
  zoom: number;
  bounds: MapBounds | null;
  markers: Marker[];
  selectedLocation: Location | null;
  isLoading: boolean;
  error: string | null;
  streetView: StreetViewState;
  layers: MapLayer[];
  mapType: google.maps.MapTypeId;
  gestureHandling: 'auto' | 'cooperative' | 'greedy' | 'none';
  isFullscreen: boolean;
}
```

#### Key Actions
- `setCenter(center: Coordinates)` - Set map center
- `setZoom(zoom: number)` - Set zoom level (1-20)
- `addMarker(marker: Omit<Marker, 'id'>)` - Add a marker
- `removeMarker(id: string)` - Remove a marker by ID
- `toggleStreetView(position?: Coordinates)` - Toggle street view
- `setMapType(mapType: google.maps.MapTypeId)` - Change map type
- `toggleLayer(layerId: string)` - Toggle map layer visibility

#### Usage Examples
```typescript
import { useMapStore } from '../stores';

// Basic usage
const { center, zoom, markers, setCenter, addMarker } = useMapStore();

// Set map center
setCenter({ lat: 40.7128, lng: -74.0060 });

// Add a marker
addMarker({
  position: { lat: 40.7128, lng: -74.0060 },
  title: 'New York',
  description: 'The Big Apple'
});
```

### searchStore

Handles search functionality including queries, autocomplete predictions, search results, and search history.

#### State Interface
```typescript
interface EnhancedSearchState {
  query: string;
  predictions: SearchPrediction[];
  results: SearchResult[];
  selectedLocation: Location | null;
  isLoading: boolean;
  error: string | null;
  history: SearchHistoryItem[];
  isSearching: boolean;
  lastSearchTime: number | null;
}
```

#### Key Actions
- `setQuery(query: string)` - Set search query with debouncing
- `performSearch(query: string)` - Execute search
- `selectResult(result: SearchResult | null)` - Select search result
- `addToHistory(item: SearchHistoryItem)` - Add to search history
- `clearHistory()` - Clear search history

#### Usage Examples
```typescript
import { useSearchStore } from '../stores';

const { query, results, isLoading, setQuery, performSearch } = useSearchStore();

// Search for a location
setQuery('Times Square');
// Or perform search directly
await performSearch('Times Square, New York');
```

### uiStore

Manages UI state including sidebar, modals, notifications, theme, and responsive breakpoints.

#### State Interface
```typescript
interface UIState {
  sidebarOpen: boolean;
  sidebarTab: 'search' | 'directions' | 'places' | 'settings';
  activeModal: string | null;
  loading: boolean;
  theme: 'light' | 'dark' | 'system';
  notifications: Notification[];
  tooltips: Record<string, boolean>;
  breakpoints: {
    mobile: boolean;
    tablet: boolean;
    desktop: boolean;
  };
}
```

#### Key Actions
- `setSidebarOpen(open: boolean)` - Toggle sidebar
- `setActiveModal(modal: string | null)` - Set active modal
- `addNotification(notification: NotificationData)` - Add notification
- `setTheme(theme: UIState['theme'])` - Set theme
- `setTooltip(tooltip: string, visible: boolean)` - Control tooltip visibility

#### Usage Examples
```typescript
import { useUIStore } from '../stores';

const { sidebarOpen, theme, addNotification, setSidebarOpen } = useUIStore();

// Toggle sidebar
setSidebarOpen(true);

// Add notification
addNotification({
  type: 'success',
  title: 'Location Found',
  message: 'Search completed successfully'
});
```

### userStore

Manages user preferences, geolocation state, profile information, and usage statistics.

#### State Interface
```typescript
interface UserState {
  preferences: UserPreferences;
  geolocation: GeolocationState;
  isLoggedIn: boolean;
  profile: UserProfile | null;
  stats: UserStats;
}
```

#### Key Actions
- `setPreferences(preferences: Partial<UserPreferences>)` - Update preferences
- `watchGeolocation()` - Start watching GPS position
- `getCurrentPosition()` - Get current position
- `setProfile(profile: UserProfile)` - Set user profile
- `updateStats(stats: Partial<UserStats>)` - Update usage statistics

#### Usage Examples
```typescript
import { useUserStore } from '../stores';

const { preferences, geolocation, setPreferences, watchGeolocation } = useUserStore();

// Update preferences
setPreferences({
  theme: 'dark',
  units: 'metric',
  enableLocation: true
});

// Start location tracking
watchGeolocation();
```

## Custom Hooks

### useGoogleMaps

Comprehensive hook for Google Maps integration with state management.

```typescript
const {
  map, isLoaded, loadError,
  MapComponent, MarkerComponent,
  handleMapLoad, handleMapClick
} = useGoogleMaps({
  center: { lat: 40.7128, lng: -74.0060 },
  zoom: 12,
  onMapLoad: (map) => console.log('Map loaded'),
  onMapClick: (event) => console.log('Map clicked', event)
});
```

### useGeolocation

Hook for geolocation functionality with permission handling.

```typescript
const {
  currentPosition, accuracy, isWatching,
  getCurrentPosition, watchPosition,
  centerMapOnCurrentPosition
} = useGeolocation({
  watch: true,
  highAccuracy: true,
  onSuccess: (position) => console.log('Position updated'),
  onError: (error) => console.error('Geolocation error', error)
});
```

### useSearch

Advanced search hook with debouncing and autocomplete.

```typescript
const {
  query, predictions, results, isLoading,
  setQuery, performSearch, selectResult,
  hasQuery, hasResults
} = useSearch({
  debounceMs: 300,
  minQueryLength: 2,
  maxResults: 10,
  onSearchComplete: (results) => console.log('Search complete', results)
});
```

### useLocalStorage

Persistent storage hook with expiration support.

```typescript
const {
  value, setValue, removeValue,
  isLoading, error
} = useLocalStorage('user-preferences', defaultValue, {
  syncAcrossTabs: true,
  serializer: { read: JSON.parse, write: JSON.stringify }
});
```

### useDebounce

Debouncing utilities for performance optimization.

```typescript
// Debounce a value
const { debouncedValue, isPending } = useDebounceValue(searchQuery, 300);

// Debounce a function
const { debouncedFunction, cancel, flush } = useDebounce(
  (query: string) => searchAPI(query),
  500,
  { leading: true, trailing: true }
);
```

## State Utilities

### Validation

Comprehensive state validation with custom rules.

```typescript
import { validateState, StateValidator } from '../utils/stateValidation';

// Validate entire state
const errors = validateState(appState);

// Validate partial state
const partialErrors = StateValidator.getInstance().validatePartial({
  map: { center: invalidCenter }
});
```

### Migration

Automatic state migration for schema updates.

```typescript
import { migrateState, StateMigrationManager } from '../utils/stateMigration';

// Migrate state to latest version
const migratedState = migrateState(oldState, '1.0.0');

// Add custom migration
StateMigrationManager.getInstance().addMigration({
  version: '2.1.0',
  migrate: (state) => ({ ...state, newField: 'defaultValue' })
});
```

### Reset

Flexible state reset with preservation options.

```typescript
import { resetAllStores, useStateReset } from '../utils/stateReset';

// Reset all stores
resetAllStores({
  preserve: {
    user: { preferences: ['theme', 'language'] }
  },
  clearPersisted: true
});

// Use hook for programmatic resets
const { resetAll, resetMap, createPreset } = useStateReset();
resetAll(createPreset('partial'));
```

### Debugging

Advanced debugging and performance monitoring.

```typescript
import { StateDebugger, useStateDebug } from '../utils/stateDebug';

// Use debugging hook
const { exportData, getPerformanceMetrics } = useStateDebug();

// Access global debugger
window.__stateDebugger.compareStates(0, 5);
exportData(); // Downloads debug data
```

## Performance Optimization

### Selectors

Use optimized selectors to prevent unnecessary re-renders:

```typescript
// Good - specific selector
const zoom = useMapStore(state => state.zoom);

// Better - memoized computed selector
const activeLayers = useMapStore(state => state.getActiveLayers());

// Avoid - selecting entire store
const mapState = useMapStore(); // Can cause unnecessary re-renders
```

### Store Partitioning

Leverage Zustand's persist partitioning to optimize storage:

```typescript
// Only persist essential data
persist(
  (set, get) => ({ /* store implementation */ }),
  {
    name: 'map-store',
    partialize: (state) => ({
      center: state.center,
      zoom: state.zoom,
      mapType: state.mapType
    })
  }
)
```

### Debouncing

Use built-in debouncing for performance-critical operations:

```typescript
// Search queries are automatically debounced
const { setQuery } = useSearchStore();
setQuery('Times Square'); // Debounced by 300ms
```

## Best Practices

### 1. Store Design

- Keep stores focused on single responsibilities
- Use TypeScript for type safety
- Implement proper error handling
- Add comprehensive validation

### 2. Action Design

- Make actions atomic and predictable
- Provide meaningful action names
- Include proper error handling
- Document action side effects

### 3. Selector Usage

- Use specific selectors over whole store subscriptions
- Leverage computed selectors for derived state
- Memoize expensive computations
- Avoid selector chaining in render

### 4. Persistence Strategy

- Only persist essential data
- Use partitioning to optimize storage
- Implement proper migration paths
- Handle storage errors gracefully

### 5. Performance

- Debounce expensive operations
- Use lazy loading for heavy computations
- Implement proper cleanup in hooks
- Monitor performance metrics

## Error Handling

### Store Errors

Each store provides built-in error handling:

```typescript
const { error, setError } = useMapStore();

// Handle map loading errors
if (error) {
  console.error('Map error:', error);
  // Show user-friendly error message
}
```

### Async Operation Errors

Hooks provide comprehensive error handling:

```typescript
const { getCurrentPosition } = useGeolocation();

try {
  const position = await getCurrentPosition();
  // Use position
} catch (error) {
  // Handle geolocation errors
  if (error.message.includes('permission')) {
    // Request permission
  }
}
```

## Testing

### Store Testing

Test stores in isolation:

```typescript
import { act, renderHook } from '@testing-library/react';
import { useMapStore } from '../stores';

test('should set map center', () => {
  const { result } = renderHook(() => useMapStore());

  act(() => {
    result.current.setCenter({ lat: 40.7128, lng: -74.0060 });
  });

  expect(result.current.center).toEqual({ lat: 40.7128, lng: -74.0060 });
});
```

### Hook Testing

Test custom hooks with proper cleanup:

```typescript
import { renderHook, act } from '@testing-library/react';
import { useGoogleMaps } from '../hooks';

test('should initialize Google Maps', async () => {
  const { result } = renderHook(() => useGoogleMaps());

  expect(result.current.isLoaded).toBe(false);

  await waitFor(() => {
    expect(result.current.isLoaded).toBe(true);
  });
});
```

## Migration Guide

### From Context API

1. Replace context providers with store providers
2. Convert useContext calls to store selectors
3. Update state update patterns
4. Add persistence where needed

### From Redux

1. Replace reducers with Zustand stores
2. Convert actions to store actions
3. Update middleware usage
4. Simplify async patterns

## Troubleshooting

### Common Issues

1. **State not updating**: Check if you're using proper selectors
2. **Performance issues**: Use specific selectors and debouncing
3. **Persistence errors**: Validate data structure and migrations
4. **Type errors**: Ensure proper TypeScript interfaces

### Debug Tools

- Use StateDebugger for action tracking
- Monitor performance metrics
- Export/import state for analysis
- Use browser dev tools for inspection

## Conclusion

This state management system provides a robust, scalable foundation for the Google Maps clone application. It combines the simplicity of Zustand with powerful features like persistence, validation, migration, and debugging capabilities.

The modular architecture allows for easy extension and maintenance while maintaining type safety and performance optimization throughout the application.