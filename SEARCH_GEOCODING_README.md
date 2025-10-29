# Google Maps Clone - Search and Geocoding Implementation

This document describes the comprehensive search and geocoding system implemented for the Google Maps clone frontend. The system provides fast, intuitive location search with autocomplete, coordinate input, and intelligent caching strategies.

## 🚀 Features Overview

### Core Functionality
- **Places Autocomplete**: Real-time Google Places API integration with intelligent suggestions
- **Geocoding Service**: Address-to-coordinate and coordinate-to-address conversion
- **Coordinate Input**: Support for decimal and DMS (Degrees, Minutes, Seconds) formats
- **Search History**: LocalStorage-based search history with persistence
- **Bookmark System**: Save and manage favorite locations
- **Rate Limiting**: Intelligent API request management with debouncing
- **Caching**: Multi-level caching for optimal performance

### User Experience Features
- **Keyboard Navigation**: Full keyboard support (Arrow keys, Enter, Escape)
- **Real-time Suggestions**: Smart search suggestions based on user input
- **Location-based Results**: Results prioritized by proximity to user location
- **Multi-format Support**: Handle various coordinate and address formats
- **Error Handling**: Graceful error handling with user-friendly messages
- **Responsive Design**: Optimized for mobile, tablet, and desktop devices

## 📁 Architecture

### Directory Structure
```
src/
├── components/
│   └── search/
│       ├── SearchBar.tsx              # Main search component with autocomplete
│       ├── SearchResults.tsx          # Results display with filtering
│       ├── CoordinateInput.tsx        # Coordinate input with validation
│       ├── PlacesAutocomplete.tsx     # Google Places autocomplete
│       ├── SearchInterface.tsx        # Complete search interface
│       └── index.ts                   # Component exports
├── services/
│   ├── geocodingService.ts            # Google Maps Geocoding API wrapper
│   └── placesService.ts               # Google Places API integration
├── hooks/
│   └── useDebounce.ts                 # Debouncing utilities
├── stores/
│   └── searchStore.ts                 # Zustand state management
├── types/
│   └── search.types.ts                # TypeScript type definitions
└── utils/
    └── searchUtils.ts                 # Search utility functions
```

### Component Hierarchy
```
SearchInterface
├── PlacesAutocomplete
├── CoordinateInput
└── SearchResults
    ├── SearchBar
    └── ResultItems
```

## 🛠️ Installation & Setup

### Prerequisites
- React 18+ with TypeScript
- Google Maps API key with Places API enabled
- Node.js 16+ and npm/pnpm

### Environment Variables
Create a `.env` file in your project root:

```env
REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
REACT_APP_API_BASE_URL=https://api.your-backend.com
```

### Required Dependencies
```json
{
  "dependencies": {
    "@googlemaps/js-api-loader": "^1.16.2",
    "zustand": "^4.4.1",
    "lucide-react": "^0.263.1",
    "clsx": "^2.0.0"
  },
  "devDependencies": {
    "@types/google.maps": "^3.54.0"
  }
}
```

## 📚 Usage Examples

### Basic Search Integration

```tsx
import React, { useState } from 'react';
import { SearchInterface } from './components/search';
import { Location } from './types/search.types';

const MapContainer: React.FC = () => {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [currentLocation] = useState<Location>({
    lat: 6.2442,
    lng: -75.5812, // Medellín
  });

  const handleLocationSelected = (location: Location) => {
    setSelectedLocation(location);
    // Update map center, add marker, etc.
  };

  return (
    <div className="h-screen flex">
      <div className="w-96 p-4">
        <SearchInterface
          onLocationSelected={handleLocationSelected}
          currentLocation={currentLocation}
        />
      </div>
      <div className="flex-1">
        {/* Your map component here */}
        <div className="h-full bg-gray-100 flex items-center justify-center">
          {selectedLocation ? (
            <div>
              <h3>Selected Location:</h3>
              <p>Lat: {selectedLocation.lat}</p>
              <p>Lng: {selectedLocation.lng}</p>
              <p>Address: {selectedLocation.address}</p>
            </div>
          ) : (
            <p>Search for a location to display on map</p>
          )}
        </div>
      </div>
    </div>
  );
};
```

### Using Individual Components

#### SearchBar Component

```tsx
import SearchBar from './components/search/SearchBar';

const MyComponent = () => {
  const handlePlaceSelected = (place) => {
    console.log('Selected place:', place);
  };

  const handleLocationSelected = (location) => {
    console.log('Selected location:', location);
  };

  return (
    <SearchBar
      onPlaceSelected={handlePlaceSelected}
      onLocationSelected={handleLocationSelected}
      placeholder="Search for places..."
      autoFocus={true}
      showFilters={true}
    />
  );
};
```

#### Coordinate Input Component

```tsx
import CoordinateInput from './components/search/CoordinateInput';

const CoordinateExample = () => {
  const handleLocationUpdate = (location) => {
    console.log('Updated location:', location);
  };

  return (
    <CoordinateInput
      onLocationUpdate={handleLocationUpdate}
      showBookmarkButton={true}
      showCurrentLocation={true}
    />
  );
};
```

### Using Services Directly

#### Geocoding Service

```tsx
import { geocodingService } from './services/geocodingService';

// Geocode an address
const geocodeAddress = async () => {
  try {
    const results = await geocodingService.geocode({
      address: 'Parque Envigado, Medellín, Colombia',
      language: 'es',
      region: 'CO'
    });

    console.log('Geocoding results:', results);
  } catch (error) {
    console.error('Geocoding failed:', error);
  }
};

// Reverse geocode coordinates
const reverseGeocode = async () => {
  try {
    const results = await geocodingService.reverseGeocode({
      lat: 6.2442,
      lng: -75.5812
    });

    console.log('Reverse geocoding results:', results);
  } catch (error) {
    console.error('Reverse geocoding failed:', error);
  }
};
```

#### Places Service

```tsx
import { placesService } from './services/placesService';

// Search for places
const searchPlaces = async () => {
  try {
    const results = await placesService.searchPlaces(
      'restaurantes',
      { lat: 6.2442, lng: -75.5812 },
      {
        placeTypes: ['restaurant'],
        radius: 5000,
        openNow: true
      }
    );

    console.log('Place search results:', results);
  } catch (error) {
    console.error('Place search failed:', error);
  }
};

// Get place details
const getPlaceDetails = async (placeId: string) => {
  try {
    const details = await placesService.getPlaceDetails(placeId);
    console.log('Place details:', details);
  } catch (error) {
    console.error('Failed to get place details:', error);
  }
};
```

## 🔧 Advanced Configuration

### Custom Search Filters

```tsx
import { SearchFilters } from './types/search.types';

const customFilters: SearchFilters = {
  placeTypes: ['restaurant', 'cafe'],
  rating: { min: 4 },
  priceLevel: [1, 2],
  openNow: true,
  radius: 3000,
};

<SearchBar
  filters={customFilters}
  onPlaceSelected={handlePlaceSelected}
  onLocationSelected={handleLocationSelected}
/>
```

### Custom Search Store

```tsx
import { useSearchStore } from './stores/searchStore';

const MyComponent = () => {
  const {
    query,
    results,
    isLoading,
    error,
    history,
    addToHistory,
    setQuery
  } = useSearchStore();

  // Use store state and actions
  return (
    <div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search..."
      />
      {isLoading && <div>Loading...</div>}
      {error && <div>Error: {error}</div>}
    </div>
  );
};
```

### Rate Limiting Configuration

The geocoding service includes built-in rate limiting to prevent API quota exhaustion:

```typescript
// Default configuration
const DEFAULT_RATE_LIMIT = {
  maxRequestsPerSecond: 50,
  retryAttempts: 3,
  cacheTimeout: 24 * 60 * 60 * 1000, // 24 hours
};
```

## 🎯 Performance Optimization

### Caching Strategy

1. **Geocoding Results Cache**: 24-hour TTL for address geocoding
2. **Autocomplete Cache**: 1-hour TTL for search predictions
3. **Place Details Cache**: 24-hour TTL for detailed place information
4. **Search History**: Persistent storage in localStorage
5. **Bookmarks**: User-saved locations with categories

### Debouncing

Search queries are debounced by 300ms to reduce API calls:

```tsx
import { useDebounce } from './hooks/useDebounce';

const debouncedQuery = useDebounce(searchQuery, 300);
```

### Bundle Optimization

The search components are optimized for tree-shaking:

```typescript
// Only import what you need
import { SearchBar } from './components/search';
import { geocodingService } from './services/geocodingService';
```

## 🔒 Security Considerations

### API Key Protection

- API keys are stored in environment variables
- Client-side rate limiting prevents abuse
- Input validation prevents injection attacks

### Input Sanitization

```tsx
import { searchUtils } from './utils/searchUtils';

const sanitizedQuery = searchUtils.sanitizeQuery(userInput);
```

### Coordinate Validation

```tsx
import { geocodingService } from './services/geocodingService';

const isValid = geocodingService.isValidCoordinate(lat, lng);
```

## 🌍 Localization

The system supports multiple languages and regions:

```tsx
// Spanish language, Colombia region
const searchRequest = {
  language: 'es',
  region: 'CO',
  componentRestrictions: {
    country: 'CO'
  }
};
```

## 🐛 Troubleshooting

### Common Issues

1. **API Key Not Working**
   - Ensure Google Places API is enabled
   - Check API key restrictions
   - Verify environment variables are set correctly

2. **No Search Results**
   - Check network connectivity
   - Verify API quota hasn't been exceeded
   - Ensure search terms are specific enough

3. **Coordinate Validation Errors**
   - Use proper decimal format (e.g., 6.2442, -75.5812)
   - For DMS format, use proper notation (e.g., 6°14′39″N, 75°34′52″W)

4. **Performance Issues**
   - Check if caching is working properly
   - Monitor API call frequency
   - Consider reducing search radius

### Debug Mode

Enable debug logging:

```tsx
// In development mode
if (process.env.NODE_ENV === 'development') {
  console.log('Search query:', query);
  console.log('Geocoding results:', results);
}
```

## 📈 Monitoring & Analytics

### Performance Metrics

Track search performance:

```tsx
// Custom performance tracking
const trackSearchPerformance = (startTime: number, resultCount: number) => {
  const duration = Date.now() - startTime;
  console.log(`Search completed in ${duration}ms with ${resultCount} results`);
};
```

### Error Tracking

Monitor search errors:

```tsx
const handleSearchError = (error: Error, query: string) => {
  console.error('Search failed:', { error, query });
  // Send to error tracking service
};
```

## 🤝 Contributing

When contributing to the search system:

1. Follow the existing code patterns
2. Add TypeScript types for new features
3. Include error handling for all API calls
4. Test with various coordinate formats
5. Ensure accessibility standards are met
6. Add appropriate documentation

## 📄 License

This search and geocoding implementation is part of the Google Maps Clone project and follows the same license terms.