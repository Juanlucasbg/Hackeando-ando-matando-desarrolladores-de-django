# Google Maps Clone

A modern, responsive Google Maps clone built with React, TypeScript, and the Google Maps JavaScript API. This application demonstrates advanced React patterns, state management, and map integration techniques.

## Features

- **Interactive Map Rendering**: Real-time map display with zoom, pan, and navigation controls
- **Location Search**: Search for locations using Google Places Autocomplete
- **Marker Management**: Add, remove, and interact with custom markers
- **Map Controls**: Zoom, map type selector, fullscreen, and compass controls
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Type Safety**: Full TypeScript support with comprehensive type definitions
- **Error Handling**: Robust error boundaries and API error management
- **Performance Optimized**: Code splitting, lazy loading, and efficient rendering

## Technology Stack

- **Frontend**: React 18+ with TypeScript
- **Maps**: @react-google-maps/api and @googlemaps/js-api-loader
- **Styling**: Tailwind CSS with custom design system
- **Build Tool**: Vite
- **Testing**: Vitest, React Testing Library, and Playwright
- **State Management**: Built-in React hooks and context
- **Icons**: Lucide React

## Prerequisites

- Node.js 18+
- npm or yarn
- Google Maps JavaScript API key

## Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd google-maps-clone
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Add your Google Maps API key:

```env
REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

### 4. Get a Google Maps API Key

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - Maps JavaScript API
   - Places API
   - Geocoding API
   - Geolocation API (optional)
4. Create credentials (API key)
5. Restrict your API key for security:
   - HTTP referrers: `localhost:*`, `yourdomain.com`
   - Set appropriate usage quotas

### 5. Start the Development Server

```bash
npm run start
```

The application will be available at `http://localhost:3000`

## Available Scripts

- `npm run start` - Start development server
- `npm run build` - Build for production
- `npm run test` - Run unit tests
- `npm run test:coverage` - Run tests with coverage report
- `npm run test:e2e` - Run end-to-end tests
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix linting issues
- `npm run type-check` - Run TypeScript type checking
- `npm run format` - Format code with Prettier

## Project Structure

```
src/
├── components/           # React components
│   ├── MapContainer/     # Main map container component
│   ├── GoogleMap/        # Core Google Maps component
│   ├── MapControls/      # Map controls (zoom, type selector, etc.)
│   └── __tests__/        # Component tests
├── services/             # API and business logic services
│   ├── mapService.ts     # Google Maps API service
│   └── __tests__/        # Service tests
├── types/                # TypeScript type definitions
├── App.tsx               # Main application component
├── main.tsx              # Application entry point
└── index.css             # Global styles
```

## Core Components

### MapContainer

The main map container that handles map initialization, error states, and integrates all map functionality.

```tsx
<MapContainer
  center={{ lat: 40.7128, lng: -74.0060 }}
  zoom={12}
  markers={markers}
  onMapClick={handleMapClick}
  onMarkerClick={handleMarkerClick}
/>
```

### GoogleMap

Core Google Maps component with advanced features like custom styling, performance optimization, and event handling.

```tsx
<GoogleMap
  center={center}
  zoom={zoom}
  markers={markers}
  options={mapOptions}
  onMapClick={handleMapClick}
/>
```

### MapControls

Comprehensive map controls including zoom, map type selector, compass, fullscreen, and street view toggles.

```tsx
<MapControls
  map={map}
  zoom={zoom}
  mapTypeId={mapTypeId}
  onZoomIn={handleZoomIn}
  onZoomOut={handleZoomOut}
  onMapTypeChange={handleMapTypeChange}
  onFullscreenToggle={handleFullscreenToggle}
/>
```

### MapService

Service class for Google Maps API operations including geocoding, places autocomplete, and distance calculations.

```tsx
const mapService = getMapService();
const result = await mapService.geocodeAddress('New York, NY');
```

## Usage Examples

### Adding Custom Markers

```tsx
const handleMapClick = (event: google.maps.MapMouseEvent) => {
  if (event.latLng) {
    const newMarker: MapMarker = {
      position: {
        lat: event.latLng.lat(),
        lng: event.latLng.lng(),
      },
      title: 'Custom Marker',
      info: 'Click to see more info',
    };
    setMarkers(prev => [...prev, newMarker]);
  }
};
```

### Searching for Locations

```tsx
const handleSearch = async (query: string) => {
  const mapService = getMapService();
  await mapService.initialize();

  const predictions = await mapService.getPlacePredictions(query);
  if (predictions.length > 0) {
    const details = await mapService.getPlaceDetails(predictions[0].place_id);
    // Process results...
  }
};
```

### Custom Map Styling

```tsx
const customStyles = [
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#e9e9e9' }],
  },
];

const mapOptions = {
  styles: customStyles,
  mapTypeId: 'roadmap',
  gestureHandling: 'cooperative',
};
```

## API Reference

### MapService Methods

- `initialize(mapElement?)` - Initialize Google Maps services
- `geocodeAddress(address)` - Convert address to coordinates
- `reverseGeocode(location)` - Convert coordinates to address
- `getPlacePredictions(input, options?)` - Get autocomplete suggestions
- `getPlaceDetails(placeId, fields?)` - Get detailed place information
- `calculateDistance(origin, destination, unit?)` - Calculate distance between points

### Component Props

See `src/types/index.ts` for comprehensive TypeScript interfaces and prop definitions.

## Testing

The project includes comprehensive testing:

- **Unit Tests**: Component logic and service functions
- **Integration Tests**: Component interaction and API integration
- **E2E Tests**: Full user journey testing with Playwright

```bash
# Run all tests
npm run test

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e
```

## Performance Considerations

- **Code Splitting**: Lazy load components and map libraries
- **Debouncing**: Search queries are debounced to optimize API usage
- **Caching**: Geocoding results are cached to reduce API calls
- **Bundle Optimization**: Vite configuration for optimal bundle size

## Security

- **API Key Protection**: Environment variables for sensitive keys
- **Content Security Policy**: CSP headers for XSS prevention
- **Input Validation**: Sanitized user inputs for API calls
- **Error Boundaries**: Graceful error handling and logging

## Deployment

### Vercel (Recommended)

1. Connect your repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Other Platforms

```bash
npm run build
# Deploy the `build` folder to your hosting provider
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Google Maps Platform for the mapping APIs
- React team for the excellent framework
- Vite for the fast build tool
- Tailwind CSS for the utility-first CSS framework 
