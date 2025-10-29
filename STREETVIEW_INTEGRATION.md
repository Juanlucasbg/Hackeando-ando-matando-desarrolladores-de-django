# Google Maps Street View Integration

A comprehensive Street View integration for React applications using Google Maps API. This package provides a fully-featured Street View experience with smooth animations, intuitive controls, and seamless map integration.

## Features

### Core Features
- **Full Street View Panorama**: Complete Google Street View integration with all standard features
- **Custom Controls**: Intuitive navigation controls with zoom, pan, and movement options
- **Keyboard Navigation**: Full keyboard support (WASD, arrow keys, shortcuts)
- **Map Integration**: Seamless synchronization between map and Street View views
- **Pegman Integration**: Drag-and-drop pegman for entering Street View
- **Split View Mode**: Simultaneous map and Street View display

### Advanced Features
- **Measurement Tools**: Distance measurement within Street View
- **Navigation History**: Track and navigate through movement history
- **Location Sharing**: Share Street View locations via URL or social media
- **Time Travel Support**: Historical imagery (where available)
- **Performance Optimization**: Adaptive quality based on device capabilities
- **Accessibility Features**: Screen reader support, keyboard navigation, high contrast mode
- **Responsive Design**: Works on desktop, tablet, and mobile devices

### UI/UX Features
- **Smooth Animations**: Fluid transitions between locations and views
- **Loading States**: Elegant loading indicators and error handling
- **Custom Overlays**: Add custom markers and information within Street View
- **Compass Control**: Interactive compass for orientation
- **Info Panels**: Detailed location information and metadata
- **Fullscreen Mode**: Immersive full-screen Street View experience

## Installation

Make sure you have the required dependencies installed:

```bash
npm install @react-google-maps/api @googlemaps/js-api-loader
npm install framer-motion lucide-react zustand
npm install @types/google.maps
```

## Quick Start

### 1. Map Integration (Recommended)

The easiest way to use Street View is with the integrated map component:

```tsx
import { MapStreetViewIntegration } from './components/map/MapStreetViewIntegration';

function App() {
  return (
    <MapStreetViewIntegration
      googleMapsApiKey="YOUR_API_KEY"
      initialPosition={{
        lat: 37.7749,
        lng: -122.4194,
        heading: 0,
        pitch: 0,
        zoom: 1
      }}
      showPegman={true}
      showCoverage={true}
      syncMapAndStreetView={true}
      onStreetViewPositionChange={(position) => {
        console.log('Street View position:', position);
      }}
      className="w-full h-screen"
    />
  );
}
```

### 2. Standalone Street View

For more control, use the standalone Street View component:

```tsx
import { StreetView } from './components/streetview/StreetView';

function App() {
  const [google, setGoogle] = useState(null);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=streetview';
    script.onload = () => setGoogle(window.google);
    document.body.appendChild(script);
  }, []);

  if (!google) return <div>Loading...</div>;

  return (
    <StreetView
      google={google}
      options={{
        position: {
          lat: 37.7749,
          lng: -122.4194,
          heading: 0,
          pitch: 0,
          zoom: 1
        }
      }}
      showControls={true}
      showInfoPanel={true}
      enableKeyboardNavigation={true}
      onPositionChange={(position) => {
        console.log('Position changed:', position);
      }}
      className="w-full h-screen"
    />
  );
}
```

## Components

### MapStreetViewIntegration

The main component that combines Google Maps with Street View functionality.

**Props:**
- `googleMapsApiKey` (string): Your Google Maps API key
- `initialPosition` (StreetViewPosition): Starting coordinates and POV
- `showPegman` (boolean): Show draggable pegman icon
- `showCoverage` (boolean): Show Street View coverage layer
- `syncMapAndStreetView` (boolean): Sync positions between map and Street View
- `onStreetViewPositionChange` (function): Callback for position changes

### StreetView

The core Street View panorama component.

**Props:**
- `google` (object): Google Maps API object
- `options` (StreetViewOptions): Street View configuration options
- `showControls` (boolean): Show custom controls
- `showInfoPanel` (boolean): Show location information panel
- `enableKeyboardNavigation` (boolean): Enable keyboard controls
- `eventHandlers` (object): Event handler functions

### StreetViewControls

Custom control panel for Street View navigation.

**Features:**
- Movement controls (forward, backward, turn left/right)
- Zoom controls
- Pan controls
- Compass
- Advanced tools (measurement, history, share)
- Fullscreen toggle

### StreetViewPano

Panoramic display component with overlay support.

**Features:**
- Panoramic image rendering
- Custom overlays and markers
- Time travel support
- Performance optimization
- Click-to-move functionality

## Keyboard Shortcuts

| Action | Keys |
|--------|------|
| Move Forward | W, ↑ |
| Move Backward | S, ↓ |
| Turn Left | A, ← |
| Turn Right | D, → |
| Zoom In | =, + |
| Zoom Out | - |
| Pan Up | PageUp |
| Pan Down | PageDown |
| Pan Left | Home |
| Pan Right | End |
| Exit | Escape |
| Toggle Fullscreen | F |
| Toggle Controls | C |

## State Management

The integration uses Zustand for state management. You can access the Street View state:

```tsx
import { useStreetViewStore } from './stores/streetViewStore';

function MyComponent() {
  const state = useStreetViewStore((state) => state.state);
  const actions = useStreetViewStore((state) => state.actions);

  return (
    <div>
      <p>Current position: {state.currentPosition?.lat}, {state.currentPosition?.lng}</p>
      <button onClick={() => actions.goForward()}>Move Forward</button>
    </div>
  );
}
```

## Performance Optimization

The Street View integration includes automatic performance optimization:

- **Adaptive Quality**: Automatically adjusts rendering quality based on device performance
- **WebGL Support**: Uses WebGL for better performance on supported devices
- **Memory Management**: Intelligent caching and memory usage optimization
- **Lazy Loading**: Loads panoramic imagery on demand

You can customize performance options:

```tsx
const performanceOptions = {
  quality: 'auto', // 'low', 'medium', 'high', 'auto'
  enableWebGL: true,
  hardwareAcceleration: true,
  preloadAdjacent: false,
  cacheSize: 50
};

<StreetView
  performanceOptions={performanceOptions}
  // ... other props
/>
```

## Accessibility

The Street View integration includes comprehensive accessibility features:

- **Screen Reader Support**: Full ARIA labels and descriptions
- **Keyboard Navigation**: Complete keyboard control
- **High Contrast Mode**: Adjustable contrast settings
- **Visual Indicators**: Clear focus indicators and visual feedback
- **Reduced Motion**: Respects user's motion preferences

```tsx
const accessibilityOptions = {
  highContrast: false,
  largeText: false,
  reducedMotion: true,
  screenReader: true,
  keyboardNavigation: true,
  visualIndicators: true
};

<StreetView
  accessibilityOptions={accessibilityOptions}
  // ... other props
/>
```

## Error Handling

The components include comprehensive error handling:

```tsx
<StreetView
  onError={(error) => {
    console.error('Street View error:', error);
    // Handle different error types:
    // - NETWORK_ERROR
    // - IMAGES_NOT_AVAILABLE
    // - LOCATION_NOT_FOUND
    // - INITIALIZATION_ERROR
  }}
  // ... other props
/>
```

## Customization

### Custom Controls

You can create custom control components:

```tsx
import { useStreetViewStore } from './stores/streetViewStore';

function CustomControls() {
  const actions = useStreetViewStore((state) => state.actions);

  return (
    <div className="my-custom-controls">
      <button onClick={() => actions.goForward()}>Forward</button>
      <button onClick={() => actions.turnLeft()}>Left</button>
      <button onClick={() => actions.turnRight()}>Right</button>
      <button onClick={() => actions.zoomIn()}>Zoom In</button>
    </div>
  );
}
```

### Custom Overlays

Add custom markers and information within Street View:

```tsx
const overlays = [
  {
    id: 'marker-1',
    position: { lat: 37.7749, lng: -122.4194, heading: 90 },
    type: 'marker',
    content: 'Interesting Location',
    onClick: () => console.log('Marker clicked')
  }
];

<StreetViewPano
  overlays={overlays}
  onOverlayClick={(overlay) => console.log('Overlay clicked:', overlay)}
  // ... other props
/>
```

## Demo

Run the demo to see all features in action:

```tsx
import { StreetViewDemo } from './components/demo/StreetViewDemo';

function App() {
  return (
    <StreetViewDemo
      googleMapsApiKey="YOUR_API_KEY"
      className="w-full h-screen"
    />
  );
}
```

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## API Requirements

You'll need a Google Maps API key with the following APIs enabled:
- Maps JavaScript API
- Street View Static API
- Geocoding API
- Places API (optional, for search functionality)

## TypeScript

The package includes comprehensive TypeScript definitions:

```tsx
import type {
  StreetViewPosition,
  StreetViewOptions,
  StreetViewState,
  StreetViewEventHandlers
} from './types/streetview.types';

const position: StreetViewPosition = {
  lat: 37.7749,
  lng: -122.4194,
  heading: 0,
  pitch: 0,
  zoom: 1
};
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests and documentation
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For issues and questions:
- Create an issue on GitHub
- Check the demo examples
- Review the TypeScript definitions for available options

## Changelog

### v1.0.0
- Initial release
- Full Street View integration
- Map synchronization
- Custom controls
- Performance optimization
- Accessibility features
- Comprehensive documentation