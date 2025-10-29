import { useEffect, useRef, useCallback, useState } from 'react';
import { useMapStore, useSearchStore, useUserStore } from '../stores';
import { Location, Coordinates, Marker } from '../types';
import { getWazeService } from '../services/wazeService';
import { WAZE_API_CONFIG } from '../config/maps';

interface UseWazeMapOptions {
  center?: Coordinates;
  zoom?: number;
  onMapLoad?: (map: any) => void;
  onMapClick?: (location: Location) => void;
  onMapIdle?: () => void;
  onBoundsChanged?: () => void;
  onMarkerClick?: (marker: Marker) => void;
}

interface UseWazeMapReturn {
  map: any | null;
  isLoaded: boolean;
  loadError: Error | undefined;
  mapContainerStyle: React.CSSProperties;
  handleMapLoad: (map: any) => void;
  handleMapClick: (location: Location) => void;
  handleMapIdle: () => void;
  handleBoundsChanged: () => void;
  handleMarkerClick: (marker: Marker) => void;
  MapComponent: React.ComponentType<React.PropsWithChildren<{}>>;
  MarkerComponent: React.ComponentType<React.PropsWithChildren<{ marker: Marker; onClick?: () => void }>>;
  calculateRoute: (from: Location, to: Location) => Promise<any>;
}

const defaultMapContainerStyle: React.CSSProperties = {
  width: '100%',
  height: '100%',
  minHeight: '400px',
  backgroundColor: '#f0f0f0',
  position: 'relative',
};

export const useWazeMap = (options: UseWazeMapOptions = {}): UseWazeMapReturn => {
  const mapRef = useRef<any | null>(null);
  const [isMapInitialized, setIsMapInitialized] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<Error | undefined>();
  const wazeService = useRef(getWazeService());

  // Store selectors
  const {
    center,
    zoom,
    markers,
    setCenter: setMapCenter,
    setZoom: setMapZoom,
    setBounds: setMapBounds,
    addMarker: addStoreMarker,
    setLoading: setMapLoading,
    setError: setMapError,
  } = useMapStore();

  const { selectedLocation } = useSearchStore();
  const { preferences } = useUserStore();

  // Computed options
  const mapCenter = options.center || center || { lat: 40.7128, lng: -74.0060 };
  const mapZoom = options.zoom || zoom || 12;

  // Initialize Waze service
  useEffect(() => {
    const initializeService = async () => {
      try {
        setMapLoading(true);
        await wazeService.current.initialize();
        setIsLoaded(true);
        setLoadError(undefined);
        setMapLoading(false);
      } catch (error) {
        console.error('Failed to initialize Waze service:', error);
        setLoadError(error instanceof Error ? error : new Error('Unknown error initializing Waze service'));
        setIsLoaded(false);
        setMapLoading(false);
        setMapError('Failed to initialize Waze map service');
      }
    };

    initializeService();
  }, [setMapLoading, setMapError]);

  // Event handlers
  const handleMapLoad = useCallback((map: any) => {
    mapRef.current = map;
    setIsMapInitialized(true);
    setMapLoading(false);

    // Note: Since Waze doesn't provide a JavaScript SDK,
    // this would need to be integrated with a map library like Leaflet
    console.log('Waze map initialized (placeholder)', {
      center: mapCenter,
      zoom: mapZoom,
    });

    options.onMapLoad?.(map);
  }, [mapCenter, mapZoom, setMapLoading, options.onMapLoad]);

  const handleMapClick = useCallback((location: Location) => {
    // Add a marker at the clicked location
    addStoreMarker({
      position: location,
      title: `Marker at ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`,
      description: `Custom marker placed at this location`,
    });

    options.onMapClick?.(location);
  }, [addStoreMarker, options.onMapClick]);

  const handleMapIdle = useCallback(() => {
    // Since we don't have a real map instance, we'll use current state
    setMapBounds({
      north: mapCenter.lat + 0.1,
      south: mapCenter.lat - 0.1,
      east: mapCenter.lng + 0.1,
      west: mapCenter.lng - 0.1,
    });

    options.onMapIdle?.();
  }, [mapCenter, setMapBounds, options.onMapIdle]);

  const handleBoundsChanged = useCallback(() => {
    options.onBoundsChanged?.();
  }, [options.onBoundsChanged]);

  const handleMarkerClick = useCallback((marker: Marker) => {
    // Update map center to marker position
    setMapCenter(marker.position);
    options.onMarkerClick?.(marker);
  }, [setMapCenter, options.onMarkerClick]);

  // Route calculation function
  const calculateRoute = useCallback(async (from: Location, to: Location) => {
    try {
      const route = await wazeService.current.calculateRoute(from, to);
      return route;
    } catch (error) {
      console.error('Route calculation failed:', error);
      throw error;
    }
  }, []);

  // Handle selected location changes
  useEffect(() => {
    if (selectedLocation && isMapInitialized) {
      setMapCenter(selectedLocation);
      setMapZoom(15);

      // Add a marker for the selected location
      addStoreMarker({
        position: selectedLocation,
        title: selectedLocation.address || 'Selected Location',
        description: selectedLocation.formattedAddress,
      });
    }
  }, [selectedLocation, isMapInitialized, setMapCenter, setMapZoom, addStoreMarker]);

  // Simple placeholder MapComponent
  const MapComponent: React.ComponentType<React.PropsWithChildren<{}>> = ({ children }) => {
    const handleMapDivClick = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
      const rect = event.currentTarget.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      // Convert click position to approximate coordinates (simplified)
      const clickedLocation: Location = {
        lat: mapCenter.lat + (y - rect.height / 2) * 0.001,
        lng: mapCenter.lng + (x - rect.width / 2) * 0.001,
      };

      handleMapClick(clickedLocation);
    }, [mapCenter, handleMapClick]);

    if (!isLoaded) {
      return (
        <div style={defaultMapContainerStyle} className="flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-gray-600">Loading Waze map...</p>
          </div>
        </div>
      );
    }

    if (loadError) {
      return (
        <div style={defaultMapContainerStyle} className="flex items-center justify-center bg-red-50">
          <div className="text-center">
            <div className="text-red-600 mb-2">
              <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <p className="text-red-600">Failed to load Waze map</p>
            <p className="text-red-500 text-sm">{loadError.message}</p>
          </div>
        </div>
      );
    }

    return (
      <div
        style={{ ...defaultMapContainerStyle, backgroundImage: 'url(https://via.placeholder.com/800x600/f0f0f0/666666?text=Waze+Map+Placeholder)' }}
        className="relative cursor-pointer"
        onClick={handleMapDivClick}
      >
        <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-2">
          <div className="text-xs font-semibold">Waze Map Integration</div>
          <div className="text-xs text-gray-600">Center: {mapCenter.lat.toFixed(4)}, {mapCenter.lng.toFixed(4)}</div>
          <div className="text-xs text-gray-600">Zoom: {mapZoom}</div>
          <div className="text-xs text-green-600 mt-1">✓ Waze API Connected</div>
        </div>

        {/* Render markers */}
        {markers.map((marker) => (
          <div
            key={marker.id || `${marker.position.lat}-${marker.position.lng}`}
            className="absolute w-6 h-6 bg-red-500 rounded-full border-2 border-white shadow-lg cursor-pointer transform -translate-x-1/2 -translate-y-1/2"
            style={{
              left: `${50 + ((marker.position.lng - mapCenter.lng) * 100)}%`,
              top: `${50 + ((mapCenter.lat - marker.position.lat) * 100)}%`,
            }}
            onClick={(e) => {
              e.stopPropagation();
              handleMarkerClick(marker);
            }}
            title={marker.title}
          >
            <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-red-500"></div>
          </div>
        ))}

        {children}
      </div>
    );
  };

  // Simple MarkerComponent
  const MarkerComponent: React.ComponentType<React.PropsWithChildren<{
    marker: Marker;
    onClick?: () => void;
  }>> = ({ marker, onClick, children }) => {
    const [isInfoWindowOpen, setIsInfoWindowOpen] = useState(false);

    const handleMarkerClick = useCallback(() => {
      setIsInfoWindowOpen(!isInfoWindowOpen);
      onClick?.();
      handleMarkerClick(marker);
    }, [marker, onClick, isInfoWindowOpen, handleMarkerClick]);

    return (
      <div className="relative">
        <div
          className="w-6 h-6 bg-red-500 rounded-full border-2 border-white shadow-lg cursor-pointer transform -translate-x-1/2 -translate-y-1/2"
          onClick={handleMarkerClick}
          title={marker.title}
        >
          <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-red-500"></div>
        </div>

        {isInfoWindowOpen && marker.description && (
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-white rounded-lg shadow-lg p-2 z-50 w-48">
            <h3 className="font-semibold text-sm mb-1">{marker.title}</h3>
            <p className="text-xs text-gray-600">{marker.description}</p>
            <button
              className="absolute top-1 right-1 text-gray-400 hover:text-gray-600"
              onClick={() => setIsInfoWindowOpen(false)}
            >
              ×
            </button>
          </div>
        )}

        {children}
      </div>
    );
  };

  return {
    map: mapRef.current,
    isLoaded,
    loadError,
    mapContainerStyle: defaultMapContainerStyle,
    handleMapLoad,
    handleMapClick,
    handleMapIdle,
    handleBoundsChanged,
    handleMarkerClick,
    MapComponent,
    MarkerComponent,
    calculateRoute,
  };
};

export default useWazeMap;