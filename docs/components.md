# Component Documentation

This section provides comprehensive documentation for all components in the Google Maps Clone application.

## Component Architecture

The application follows a hierarchical component structure with clear separation of concerns:

```
App
├── Layout Components
│   ├── Header
│   ├── Sidebar
│   └── Footer
├── Map Components
│   ├── MapContainer
│   ├── GoogleMap
│   ├── MapControls
│   ├── MarkerLayer
│   └── StreetView
├── Search Components
│   ├── SearchBar
│   ├── Autocomplete
│   ├── SearchResults
│   └── SearchHistory
├── UI Components
│   ├── Button
│   ├── Input
│   ├── Modal
│   ├── Tooltip
│   └── Loading
└── Feature Components
    ├── CoordinateInput
    ├── LocationInfo
    ├── RoutePlanner
    └── BookmarkManager
```

## Core Components

### App Component

**Location**: `src/App.tsx`

The root component that manages global state, routing, and theme.

```typescript
interface AppProps {
  // No props - uses global state management
}

const App: React.FC<AppProps> = () => {
  // Global state setup
  // Theme provider
  // Error boundaries
  // Router setup
};
```

**Features**:
- Global state management with Zustand
- Error boundary implementation
- Theme provider (light/dark mode)
- Router configuration
- Authentication wrapper

**Usage Example**:
```typescript
// Entry point (main.tsx)
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

## Map Components

### MapContainer

**Location**: `src/components/map/MapContainer.tsx`

The main map container component that manages map state and interactions.

```typescript
interface MapContainerProps {
  initialCenter?: { lat: number; lng: number };
  initialZoom?: number;
  height?: string | number;
  showControls?: boolean;
  onMapLoad?: (map: google.maps.Map) => void;
  onLocationClick?: (location: Location) => void;
}

const MapContainer: React.FC<MapContainerProps> = ({
  initialCenter = { lat: 6.2442, lng: -75.5812 }, // Medellín
  initialZoom = 13,
  height = '100%',
  showControls = true,
  onMapLoad,
  onLocationClick
}) => {
  // Component implementation
};
```

**Features**:
- Google Maps initialization
- Map state management
- Event handling (click, zoom, pan)
- Responsive sizing
- Loading states

**Usage Example**:
```typescript
<MapContainer
  initialCenter={{ lat: 40.7128, lng: -74.0060 }}
  initialZoom={12}
  height="600px"
  onMapLoad={(map) => console.log('Map loaded:', map)}
  onLocationClick={(location) => setSelectedLocation(location)}
/>
```

### GoogleMap

**Location**: `src/components/map/GoogleMap.tsx`

The core Google Maps component using @react-google-maps/api.

```typescript
interface GoogleMapProps {
  center: google.maps.LatLngLiteral;
  zoom: number;
  options?: google.maps.MapOptions;
  onMapClick?: (event: google.maps.MapMouseEvent) => void;
  onIdle?: (map: google.maps.Map) => void;
  children?: React.ReactNode;
}

const GoogleMap: React.FC<GoogleMapProps> = ({
  center,
  zoom,
  options,
  onMapClick,
  onIdle,
  children
}) => {
  // Map implementation
};
```

**Features**:
- Google Maps integration
- Custom map options
- Event handling
- Marker and overlay rendering
- Street view integration

**Usage Example**:
```typescript
<GoogleMap
  center={{ lat: 40.7128, lng: -74.0060 }}
  zoom={12}
  options={{
    mapTypeControl: true,
    streetViewControl: true,
    fullscreenControl: false,
    styles: mapStyles.darkMode
  }}
  onMapClick={handleMapClick}
>
  <Marker position={selectedLocation} />
  {markers.map(marker => (
    <CustomMarker key={marker.id} {...marker} />
  ))}
</GoogleMap>
```

### MapControls

**Location**: `src/components/map/MapControls.tsx`

Map control buttons and UI elements.

```typescript
interface MapControlsProps {
  map: google.maps.Map | null;
  showZoom?: boolean;
  showMapType?: boolean;
  showStreetView?: boolean;
  showFullscreen?: boolean;
  customControls?: React.ReactNode;
  className?: string;
}

const MapControls: React.FC<MapControlsProps> = ({
  map,
  showZoom = true,
  showMapType = true,
  showStreetView = true,
  showFullscreen = true,
  customControls,
  className
}) => {
  // Controls implementation
};
```

**Features**:
- Zoom controls
- Map type selector
- Street view toggle
- Fullscreen mode
- Custom control slots

**Usage Example**:
```typescript
<MapControls
  map={mapInstance}
  showZoom={true}
  showMapType={true}
  showStreetView={true}
  customControls={
    <button onClick={toggleTraffic}>
      Toggle Traffic
    </button>
  }
/>
```

### MarkerLayer

**Location**: `src/components/map/MarkerLayer.tsx`

Component for managing and rendering map markers.

```typescript
interface MarkerLayerProps {
  markers: Array<{
    id: string;
    position: google.maps.LatLngLiteral;
    title?: string;
    icon?: string | google.maps.Icon;
    animation?: google.maps.Animation;
    info?: string;
  }>;
  onMarkerClick?: (marker: MarkerData) => void;
  onMarkerHover?: (marker: MarkerData | null) => void;
  clustering?: boolean;
  clusterOptions?: MarkerClustererOptions;
}

const MarkerLayer: React.FC<MarkerLayerProps> = ({
  markers,
  onMarkerClick,
  onMarkerHover,
  clustering = true,
  clusterOptions
}) => {
  // Marker layer implementation
};
```

**Features**:
- Marker rendering
- Marker clustering
- Custom icons
- Event handling
- Info window integration

**Usage Example**:
```typescript
<MarkerLayer
  markers={locations.map(loc => ({
    id: loc.id,
    position: { lat: loc.lat, lng: loc.lng },
    title: loc.name,
    icon: getCustomIcon(loc.type),
    info: loc.description
  }))}
  onMarkerClick={handleMarkerClick}
  clustering={true}
  clusterOptions={{
    gridSize: 60,
    minimumClusterSize: 2
  }}
/>
```

## Search Components

### SearchBar

**Location**: `src/components/search/SearchBar.tsx`

Main search component with autocomplete functionality.

```typescript
interface SearchBarProps {
  onSearch: (query: string) => void;
  onLocationSelect: (location: Location) => void;
  placeholder?: string;
  disabled?: boolean;
  autoFocus?: boolean;
  showHistory?: boolean;
  maxResults?: number;
  className?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  onLocationSelect,
  placeholder = "Search for a location...",
  disabled = false,
  autoFocus = false,
  showHistory = true,
  maxResults = 5,
  className
}) => {
  // Search bar implementation
};
```

**Features**:
- Autocomplete suggestions
- Search history
- Keyboard navigation
- Debounced input
- Loading states
- Error handling

**Usage Example**:
```typescript
<SearchBar
  onSearch={handleSearch}
  onLocationSelect={handleLocationSelect}
  placeholder="Enter address or coordinates"
  showHistory={true}
  maxResults={8}
/>
```

### Autocomplete

**Location**: `src/components/search/Autocomplete.tsx`

Autocomplete dropdown for search suggestions.

```typescript
interface AutocompleteProps {
  predictions: AutocompletePrediction[];
  onSelect: (prediction: AutocompletePrediction) => void;
  isLoading?: boolean;
  highlightedIndex?: number;
  onHighlightChange?: (index: number) => void;
  className?: string;
}

const Autocomplete: React.FC<AutocompleteProps> = ({
  predictions,
  onSelect,
  isLoading = false,
  highlightedIndex,
  onHighlightChange,
  className
}) => {
  // Autocomplete implementation
};
```

**Features**:
- Dropdown suggestions
- Keyboard navigation
- Highlighted selection
- Loading indicators
- Empty states

**Usage Example**:
```typescript
<Autocomplete
  predictions={searchResults}
  onSelect={handlePredictionSelect}
  isLoading={isSearching}
  highlightedIndex={highlightedIndex}
  onHighlightChange={setHighlightedIndex}
/>
```

### SearchResults

**Location**: `src/components/search/SearchResults.tsx`

Component for displaying search results and suggestions.

```typescript
interface SearchResultsProps {
  results: AutocompletePrediction[];
  onResultClick: (prediction: AutocompletePrediction) => void;
  loading?: boolean;
  error?: string | null;
  showNoResults?: boolean;
  className?: string;
}

const SearchResults: React.FC<SearchResultsProps> = ({
  results,
  onResultClick,
  loading = false,
  error = null,
  showNoResults = true,
  className
}) => {
  // Search results implementation
};
```

**Features**:
- Results list
- Loading states
- Error messages
- No results state
- Result highlighting

**Usage Example**:
```typescript
<SearchResults
  results={searchPredictions}
  onResultClick={handleResultClick}
  loading={isSearching}
  error={searchError}
  showNoResults={true}
/>
```

## UI Components

### Button

**Location**: `src/components/ui/Button.tsx`

Reusable button component with multiple variants.

```typescript
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  children: React.ReactNode;
  className?: string;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  onClick,
  children,
  className
}) => {
  // Button implementation
};
```

**Features**:
- Multiple variants
- Size options
- Loading states
- Icon support
- Accessibility features

**Usage Example**:
```typescript
<Button
  variant="primary"
  size="lg"
  loading={isSubmitting}
  icon={<SearchIcon />}
  onClick={handleSubmit}
>
  Search Location
</Button>

<Button
  variant="outline"
  size="sm"
  iconPosition="right"
  icon={<ArrowIcon />}
>
  Next
</Button>
```

### Input

**Location**: `src/components/ui/Input.tsx`

Reusable input component with validation support.

```typescript
interface InputProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'search';
  value?: string;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  helperText?: string;
  required?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  onChange?: (value: string) => void;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
  onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void;
  className?: string;
}

const Input: React.FC<InputProps> = ({
  type = 'text',
  value,
  placeholder,
  disabled = false,
  error,
  helperText,
  required = false,
  icon,
  iconPosition = 'left',
  onChange,
  onBlur,
  onFocus,
  className
}) => {
  // Input implementation
};
```

**Features**:
- Input validation
- Error states
- Helper text
- Icon support
- Accessibility

**Usage Example**:
```typescript
<Input
  type="text"
  placeholder="Enter latitude"
  value={latitude}
  error={latitudeError}
  helperText="Enter decimal degrees (-90 to 90)"
  onChange={setLatitude}
  icon={<MapPinIcon />}
/>

<Input
  type="email"
  placeholder="Email address"
  value={email}
  required={true}
  onChange={setEmail}
  onBlur={validateEmail}
/>
```

### Modal

**Location**: `src/components/ui/Modal.tsx`

Modal component for overlays and dialogs.

```typescript
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  children: React.ReactNode;
  className?: string;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  size = 'md',
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  children,
  className
}) => {
  // Modal implementation
};
```

**Features**:
- Multiple sizes
- Close methods
- Focus management
- Accessibility
- Animation support

**Usage Example**:
```typescript
<Modal
  isOpen={isModalOpen}
  onClose={closeModal}
  title="Location Details"
  size="lg"
  closeOnOverlayClick={true}
>
  <LocationInfo location={selectedLocation} />
  <div className="flex justify-end gap-2 mt-4">
    <Button variant="outline" onClick={closeModal}>
      Cancel
    </Button>
    <Button onClick={saveLocation}>
      Save Location
    </Button>
  </div>
</Modal>
```

### Loading

**Location**: `src/components/ui/Loading.tsx`

Loading indicator component.

```typescript
interface LoadingProps {
  variant?: 'spinner' | 'dots' | 'pulse' | 'skeleton';
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  overlay?: boolean;
  className?: string;
}

const Loading: React.FC<LoadingProps> = ({
  variant = 'spinner',
  size = 'md',
  text,
  overlay = false,
  className
}) => {
  // Loading implementation
};
```

**Features**:
- Multiple variants
- Size options
- Text labels
- Overlay mode
- Custom styling

**Usage Example**:
```typescript
<Loading
  variant="spinner"
  size="lg"
  text="Loading map..."
  overlay={true}
/>

<Loading
  variant="skeleton"
  size="md"
  className="h-4 w-32"
/>
```

## Feature Components

### CoordinateInput

**Location**: `src/components/features/CoordinateInput.tsx`

Component for entering latitude/longitude coordinates.

```typescript
interface CoordinateInputProps {
  value?: { lat: string; lng: string };
  onChange?: (coordinates: { lat: string; lng: string }) => void;
  format?: 'decimal' | 'dms';
  validateOnChange?: boolean;
  showConversion?: boolean;
  disabled?: boolean;
  className?: string;
}

const CoordinateInput: React.FC<CoordinateInputProps> = ({
  value,
  onChange,
  format = 'decimal',
  validateOnChange = true,
  showConversion = true,
  disabled = false,
  className
}) => {
  // Coordinate input implementation
};
```

**Features**:
- Multiple coordinate formats
- Real-time validation
- Format conversion
- Error handling
- Accessibility

**Usage Example**:
```typescript
<CoordinateInput
  value={{ lat: '40.7128', lng: '-74.0060' }}
  onChange={handleCoordinateChange}
  format="decimal"
  validateOnChange={true}
  showConversion={true}
/>
```

### LocationInfo

**Location**: `src/components/features/LocationInfo.tsx`

Component for displaying detailed location information.

```typescript
interface LocationInfoProps {
  location: Location;
  showCoordinates?: boolean;
  showAddress?: boolean;
  showActions?: boolean;
  compact?: boolean;
  className?: string;
}

const LocationInfo: React.FC<LocationInfoProps> = ({
  location,
  showCoordinates = true,
  showAddress = true,
  showActions = true,
  compact = false,
  className
}) => {
  // Location info implementation
};
```

**Features**:
- Location details display
- Coordinate formats
- Action buttons
- Compact mode
- Customizable sections

**Usage Example**:
```typescript
<LocationInfo
  location={selectedLocation}
  showCoordinates={true}
  showAddress={true}
  showActions={true}
/>
```

## Custom Hooks

### useMap

**Location**: `src/hooks/useMap.ts`

Hook for managing Google Maps instance and state.

```typescript
interface UseMapOptions {
  center?: google.maps.LatLngLiteral;
  zoom?: number;
  options?: google.maps.MapOptions;
}

interface UseMapReturn {
  map: google.maps.Map | null;
  isLoaded: boolean;
  error: string | null;
  setCenter: (center: google.maps.LatLngLiteral) => void;
  setZoom: (zoom: number) => void;
  fitBounds: (bounds: google.maps.LatLngBounds) => void;
  panTo: (position: google.maps.LatLngLiteral) => void;
}

const useMap = (options: UseMapOptions = {}): UseMapReturn => {
  // Hook implementation
};
```

**Usage Example**:
```typescript
const MapComponent = () => {
  const {
    map,
    isLoaded,
    error,
    setCenter,
    setZoom,
    fitBounds
  } = useMap({
    center: { lat: 40.7128, lng: -74.0060 },
    zoom: 12
  });

  if (!isLoaded) return <Loading />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <GoogleMap
      map={map}
      onMapClick={handleMapClick}
    />
  );
};
```

### useGeocoding

**Location**: `src/hooks/useGeocoding.ts`

Hook for geocoding operations with caching and error handling.

```typescript
interface UseGeocodingReturn {
  geocode: (address: string) => Promise<GeocodingResult[]>;
  reverseGeocode: (location: Location) => Promise<GeocodingResult[]>;
  getPredictions: (input: string) => Promise<AutocompletePrediction[]>;
  getPlaceDetails: (placeId: string) => Promise<PlaceDetails>;
  isLoading: boolean;
  error: string | null;
  clearCache: () => void;
}

const useGeocoding = (): UseGeocodingReturn => {
  // Hook implementation
};
```

**Usage Example**:
```typescript
const SearchComponent = () => {
  const {
    geocode,
    getPredictions,
    isLoading,
    error
  } = useGeocoding();

  const handleSearch = async (address: string) => {
    try {
      const results = await geocode(address);
      setLocations(results);
    } catch (err) {
      console.error('Search failed:', err);
    }
  };

  return (
    <SearchBar
      onSearch={handleSearch}
      loading={isLoading}
      error={error}
    />
  );
};
```

## Component Testing

### Unit Testing Example

```typescript
// src/components/ui/__tests__/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../Button';

describe('Button Component', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('shows loading state', () => {
    render(<Button loading>Click me</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('applies correct variant styles', () => {
    render(<Button variant="primary">Primary Button</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-blue-600');
  });
});
```

### Component Testing with Storybook

```typescript
// src/components/ui/Button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'UI/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Primary Button',
  },
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Secondary Button',
  },
};

export const WithIcon: Story = {
  args: {
    icon: <span>🔍</span>,
    children: 'Search',
  },
};

export const Loading: Story = {
  args: {
    loading: true,
    children: 'Loading',
  },
};
```

## Best Practices

### Component Design Principles

1. **Single Responsibility**: Each component should have one clear purpose
2. **Composition over Inheritance**: Favor composition patterns
3. **Props Interface**: Clear, typed props for all components
4. **Default Props**: Provide sensible defaults for optional props
5. **Accessibility**: Include proper ARIA labels and keyboard navigation

### Performance Considerations

1. **Memoization**: Use React.memo for expensive components
2. **Callback Optimization**: Use useCallback for event handlers
3. **Lazy Loading**: Load components on demand when possible
4. **State Colocation**: Keep state close to where it's used

### Styling Guidelines

1. **Tailwind Classes**: Use utility classes for styling
2. **Responsive Design**: Include responsive variants
3. **Component Variants**: Use props for style variations
4. **CSS Custom Properties**: For theme-based styling

This component documentation provides a comprehensive guide for understanding and using all components in the Google Maps Clone application.