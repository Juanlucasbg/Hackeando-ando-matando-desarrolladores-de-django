import React, { useState, useEffect } from 'react';
import { MapStreetViewIntegration } from '../map/MapStreetViewIntegration';
import { StreetView } from '../streetview/StreetView';
import { StreetViewPosition } from '../../types/streetview.types';

interface StreetViewDemoProps {
  googleMapsApiKey: string;
  className?: string;
}

// Famous locations with Street View availability
const demoLocations = [
  {
    name: 'Golden Gate Bridge',
    position: { lat: 37.8199, lng: -122.4783, heading: 0, pitch: 0, zoom: 1 },
    description: 'Iconic suspension bridge in San Francisco',
  },
  {
    name: 'Times Square',
    position: { lat: 40.7580, lng: -73.9855, heading: 0, pitch: 0, zoom: 1 },
    description: 'Busy commercial intersection in New York City',
  },
  {
    name: 'Eiffel Tower',
    position: { lat: 48.8584, lng: 2.2945, heading: 0, pitch: 0, zoom: 1 },
    description: 'Iron lattice tower in Paris, France',
  },
  {
    name: 'Tokyo Crossing',
    position: { lat: 35.6762, lng: 139.6503, heading: 0, pitch: 0, zoom: 1 },
    description: 'Shibuya Crossing in Tokyo, Japan',
  },
  {
    name: 'Grand Canyon',
    position: { lat: 36.0544, lng: -112.1401, heading: 0, pitch: 0, zoom: 1 },
    description: 'Natural wonder in Arizona, USA',
  },
];

export const StreetViewDemo: React.FC<StreetViewDemoProps> = ({
  googleMapsApiKey,
  className = '',
}) => {
  const [currentMode, setCurrentMode] = useState<'integration' | 'standalone'>('integration');
  const [currentPosition, setCurrentPosition] = useState<StreetViewPosition>(demoLocations[0].position);
  const [showCode, setShowCode] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(0);

  const handleLocationSelect = (index: number) => {
    setSelectedLocation(index);
    setCurrentPosition(demoLocations[index].position);
  };

  const handleStreetViewPositionChange = (position: StreetViewPosition) => {
    setCurrentPosition(position);
  };

  const integrationCode = `
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
        console.log('Street View position changed:', position);
      }}
      className="w-full h-screen"
    />
  );
}
  `.trim();

  const standaloneCode = `
import { StreetView } from './components/streetview/StreetView';

function App() {
  const [google, setGoogle] = useState(null);

  useEffect(() => {
    // Load Google Maps API
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
      className="w-full h-screen"
    />
  );
}
  `.trim();

  return (
    <div className={`min-h-screen bg-gray-100 ${className}`}>
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Street View Demo</h1>
              <p className="text-sm text-gray-600 mt-1">
                Interactive Street View integration with Google Maps
              </p>
            </div>

            <div className="flex items-center gap-4">
              {/* Mode Toggle */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setCurrentMode('integration')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    currentMode === 'integration'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Map Integration
                </button>
                <button
                  onClick={() => setCurrentMode('standalone')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    currentMode === 'standalone'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Standalone
                </button>
              </div>

              {/* Code Toggle */}
              <button
                onClick={() => setShowCode(!showCode)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  showCode
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {showCode ? 'Hide Code' : 'Show Code'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Location Selector */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-700">Quick Locations:</span>
            <div className="flex gap-2 flex-wrap">
              {demoLocations.map((location, index) => (
                <button
                  key={index}
                  onClick={() => handleLocationSelect(index)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    selectedLocation === index
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {location.name}
                </button>
              ))}
            </div>
          </div>

          {demoLocations[selectedLocation] && (
            <div className="mt-2 text-sm text-gray-600">
              {demoLocations[selectedLocation].description}
            </div>
          )}
        </div>
      </div>

      {/* Code Display */}
      {showCode && (
        <div className="bg-gray-900 text-white">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium">
                {currentMode === 'integration' ? 'Map Integration' : 'Standalone'} Code
              </h3>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(
                    currentMode === 'integration' ? integrationCode : standaloneCode
                  );
                }}
                className="text-xs bg-gray-800 hover:bg-gray-700 px-2 py-1 rounded"
              >
                Copy Code
              </button>
            </div>
            <pre className="text-xs overflow-x-auto">
              <code>{currentMode === 'integration' ? integrationCode : standaloneCode}</code>
            </pre>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1" style={{ height: showCode ? 'calc(100vh - 280px)' : 'calc(100vh - 180px)' }}>
        {currentMode === 'integration' ? (
          <MapStreetViewIntegration
            googleMapsApiKey={googleMapsApiKey}
            initialPosition={currentPosition}
            onStreetViewPositionChange={handleStreetViewPositionChange}
            showPegman={true}
            showCoverage={true}
            syncMapAndStreetView={true}
            className="w-full h-full"
            onError={(error) => {
              console.error('Map error:', error);
            }}
          />
        ) : (
          <StreetViewDemoStandalone
            googleMapsApiKey={googleMapsApiKey}
            position={currentPosition}
            onPositionChange={handleStreetViewPositionChange}
            className="w-full h-full"
          />
        )}
      </div>

      {/* Feature Info */}
      <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-4 max-w-sm">
        <h3 className="font-semibold text-gray-900 mb-2">Features</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Click map to enter Street View</li>
          <li>• Drag pegman to specific locations</li>
          <li>• Keyboard navigation (WASD, Arrow keys)</li>
          <li>• Measurement tools</li>
          <li>• Navigation history</li>
          <li>• Location sharing</li>
          <li>• Fullscreen mode</li>
          <li>• Split view mode</li>
        </ul>
      </div>

      {/* Current Position Info */}
      <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-2">Current Position</h3>
        <div className="text-sm text-gray-600 space-y-1">
          <div>Lat: {currentPosition.lat.toFixed(6)}</div>
          <div>Lng: {currentPosition.lng.toFixed(6)}</div>
          <div>Heading: {Math.round(currentPosition.heading || 0)}°</div>
          <div>Pitch: {Math.round(currentPosition.pitch || 0)}°</div>
          <div>Zoom: {Math.round((currentPosition.zoom || 1) * 100)}%</div>
        </div>
      </div>
    </div>
  );
};

// Standalone Street View component for demo
const StreetViewDemoStandalone: React.FC<{
  googleMapsApiKey: string;
  position: StreetViewPosition;
  onPositionChange: (position: StreetViewPosition) => void;
  className?: string;
}> = ({ googleMapsApiKey, position, onPositionChange, className }) => {
  const [google, setGoogle] = useState<typeof google | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load Google Maps API
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${googleMapsApiKey}&libraries=streetview`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      setGoogle(window.google);
      setLoading(false);
    };

    script.onerror = () => {
      setError('Failed to load Google Maps API');
      setLoading(false);
    };

    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, [googleMapsApiKey]);

  if (loading) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Google Maps...</p>
        </div>
      </div>
    );
  }

  if (error || !google) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 ${className}`}>
        <div className="text-center p-8">
          <div className="text-red-500 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load Street View</h3>
          <p className="text-gray-600">{error || 'Unable to load Google Maps API'}</p>
        </div>
      </div>
    );
  }

  return (
    <StreetView
      google={google}
      options={{
        position,
        visible: true,
      }}
      eventHandlers={{
        onPositionChanged: onPositionChange,
      }}
      showControls={true}
      showInfoPanel={true}
      enableKeyboardNavigation={true}
      className={className}
    />
  );
};