# Waze API Integration Guide

This document outlines the integration of the Waze API into the Google Maps clone application, replacing Google Maps services with Waze's routing and navigation capabilities.

## Overview

The integration replaces Google Maps API with Waze API for route calculation and navigation features. The implementation includes:

- **Waze Service**: Core API integration for route calculation
- **Waze Map Container**: React component for map display
- **Waze Hook**: Custom React hook for state management
- **Demo Page**: Interactive demonstration of Waze features

## Key Changes

### 1. Configuration Updates

**File: `src/config/maps.ts`**
- Added `WAZE_API_CONFIG` with API key and endpoints
- Replaced Google Maps configuration with Waze settings

**File: `.env.example`**
- Added `VITE_WAZE_API_KEY` environment variable
- Updated API configuration variables

### 2. New Services

**File: `src/services/wazeService.ts`**
- `WazeService` class with route calculation
- API key validation and error handling
- Distance calculation utilities
- Singleton pattern for service management

**Key Methods:**
- `calculateRoute(from, to, options)` - Calculate route between two points
- `validateApiKey()` - Validate API key
- `calculateDistance()` - Calculate direct distance between points

### 3. React Components

**File: `src/components/WazeMapContainer/WazeMapContainer.tsx`**
- Interactive map component with Waze branding
- Click-to-add-marker functionality
- Route visualization
- Zoom controls and fullscreen support
- Responsive design with loading states

**File: `src/hooks/useWazeMap.ts`**
- Custom hook for Waze map state management
- Event handlers for map interactions
- Integration with existing store system

### 4. Type Definitions

**Files:**
- `src/types/api.types.ts` - Added Waze API types
- `src/types/common.types.ts` - Added map-related types

**New Types:**
- `WazeConfig` - Waze API configuration
- `WazeRouteRequest` - Route request format
- `WazeRouteResponse` - Route response format
- `MapContainerProps` - Map component props

## Usage

### Basic Setup

```typescript
import { WazeMapContainer, getWazeService } from '@/components';

// Initialize the service
const wazeService = getWazeService();
await wazeService.initialize();

// Use the map component
<WazeMapContainer
  center={{ lat: 40.7128, lng: -74.0060 }}
  zoom={12}
  onMapClick={handleMapClick}
  onMarkerClick={handleMarkerClick}
/>
```

### Route Calculation

```typescript
import { getWazeService } from '@/services/wazeService';

const wazeService = getWazeService();

const from = { lat: 40.7128, lng: -74.0060 };
const to = { lat: 40.7589, lng: -73.9851 };

try {
  const route = await wazeService.calculateRoute(from, to);
  console.log(`Distance: ${route.distance / 1000} km`);
  console.log(`Duration: ${route.duration / 60} minutes`);
} catch (error) {
  console.error('Route calculation failed:', error);
}
```

## API Reference

### Waze API Configuration

```typescript
interface WazeConfig {
  apiKey: string;
  baseUrl?: string;
  language?: string;
  region?: string;
  timeout?: number;
}
```

### Route Request

```typescript
interface WazeRouteRequest {
  from: {
    x: number; // longitude
    y: number; // latitude
  };
  to: {
    x: number; // longitude
    y: number; // latitude
  };
  options?: {
    avoidTolls?: boolean;
    avoidHighways?: boolean;
    avoidFerries?: boolean;
    vehicleType?: string;
  };
}
```

### Route Response

```typescript
interface WazeRouteResponse {
  response: {
    results: Array<{
      distance: number;        // in meters
      duration: number;        // in seconds
      path: Array<{           // route path coordinates
        x: number;
        y: number;
      }>;
      restrictions?: string[]; // route restrictions
      tolls?: boolean;
      highways?: boolean;
    }>;
  };
}
```

## Demo Page

Visit `/waze-demo` to see the Waze API integration in action.

**Features:**
- Interactive map with click-to-add markers
- Route calculation between coordinates
- Real-time route information display
- Error handling and loading states
- API status indicators

## Testing

### Console Testing

In development mode, you can test the Waze API directly from the browser console:

```javascript
// Test the Waze API
testWazeApi()
```

This will run a comprehensive test of:
- Service initialization
- API key validation
- Route calculation
- Distance calculation
- Service readiness

### Manual Testing

1. Navigate to `/waze-demo`
2. Click on the map to add markers
3. Use the coordinate inputs to set start/end points
4. Click "Calculate Route" to test the API
5. Verify route information displays correctly

## Error Handling

The integration includes comprehensive error handling:

### Common Errors

1. **API Key Invalid**
   - Error: "Waze API error: 401 - Unauthorized"
   - Solution: Verify API key in environment variables

2. **Network Issues**
   - Error: "Waze API request timeout"
   - Solution: Check internet connection and API availability

3. **Invalid Coordinates**
   - Error: "No route found"
   - Solution: Ensure coordinates are valid and accessible

### Error Recovery

- Automatic retry mechanism (up to 3 attempts)
- User-friendly error messages
- Fallback to default state
- Graceful degradation

## Limitations

### Current Limitations

1. **No Direct Map Rendering**
   - Waze doesn't provide a JavaScript SDK for map rendering
   - Current implementation uses placeholder with overlay
   - Future integration may require Leaflet or Mapbox

2. **Limited Geocoding**
   - Waze API doesn't provide geocoding services
   - Would need integration with other services for address search

3. **Rate Limiting**
   - API rate limits apply based on subscription
   - Implement caching for frequently used routes

### Future Enhancements

1. **Real-time Traffic**
   - Integration with Waze traffic data
   - Live traffic layer on map

2. **Alternative Routes**
   - Multiple route options
   - Route comparison features

3. **Voice Navigation**
   - Turn-by-turn voice guidance
   - Audio route instructions

## Migration Notes

### From Google Maps

The migration maintains backward compatibility:

- Google Maps components remain available
- Gradual migration possible
- Feature parity for core functionality

### Configuration Changes

Update environment variables:

```bash
# Remove
VITE_GOOGLE_MAPS_API_KEY=your_key

# Add
VITE_WAZE_API_KEY=34eb67fbcbmshaacbf8071455e49p16c350jsn9723b6d54d91
```

## Troubleshooting

### Common Issues

1. **API Connection Failed**
   - Check API key validity
   - Verify network connectivity
   - Check API service status

2. **Route Not Found**
   - Verify coordinate format
   - Check location accessibility
   - Try different route options

3. **Performance Issues**
   - Implement route caching
   - Optimize API calls
   - Use debouncing for real-time updates

### Debug Mode

Enable debug logging:

```typescript
// In development
console.log('Waze API Debug:', wazeService.isServiceReady());
```

## Support

For issues related to:
- **Waze API**: Check RapidAPI documentation
- **Integration**: Review this guide and code comments
- **Bugs**: Create an issue in the project repository

## License

This integration follows the same license as the parent project. Ensure compliance with Waze API terms of service.