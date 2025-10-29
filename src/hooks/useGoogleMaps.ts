import { useEffect, useRef, useCallback, useState } from 'react';
import { GoogleMap, useJsApiLoader, MarkerF, InfoWindowF } from '@react-google-maps/api';
import { useMapStore, useSearchStore, useUserStore } from '../stores';
import { Location, Coordinates, Marker } from '../types';
import { GOOGLE_MAPS_CONFIG } from '../config/maps';

interface UseGoogleMapsOptions {
  center?: Coordinates;
  zoom?: number;
  mapTypeId?: google.maps.MapTypeId;
  options?: google.maps.MapOptions;
  onMapLoad?: (map: google.maps.Map) => void;
  onMapClick?: (event: google.maps.MapMouseEvent) => void;
  onMapIdle?: () => void;
  onBoundsChanged?: () => void;
  onMarkerClick?: (marker: Marker, event: google.maps.MapMouseEvent) => void;
}

interface UseGoogleMapsReturn {
  map: google.maps.Map | null;
  isLoaded: boolean;
  loadError: Error | undefined;
  mapContainerStyle: React.CSSProperties;
  mapOptions: google.maps.MapOptions;
  handleMapLoad: (map: google.maps.Map) => void;
  handleMapClick: (event: google.maps.MapMouseEvent) => void;
  handleMapIdle: () => void;
  handleBoundsChanged: () => void;
  handleMarkerClick: (marker: Marker) => (event: google.maps.MapMouseEvent) => void;
  MapComponent: React.ComponentType<React.PropsWithChildren<{}>>;
  MarkerComponent: React.ComponentType<React.PropsWithChildren<{ marker: Marker; onClick?: () => void }>>;
}

const defaultMapContainerStyle: React.CSSProperties = {
  width: '100%',
  height: '100%',
  minHeight: '400px',
};

const defaultMapOptions: google.maps.MapOptions = {
  zoomControl: true,
  streetViewControl: true,
  mapTypeControl: true,
  fullscreenControl: false,
  gestureHandling: 'auto',
  clickableIcons: true,
  scrollwheel: true,
  disableDoubleClickZoom: false,
  keyboardShortcuts: true,
  draggable: true,
  draggableCursor: 'grab',
  draggingCursor: 'grabbing',
  styles: [], // Custom styles can be added here
};

export const useGoogleMaps = (options: UseGoogleMapsOptions = {}): UseGoogleMapsReturn => {
  const mapRef = useRef<google.maps.Map | null>(null);
  const [isMapInitialized, setIsMapInitialized] = useState(false);

  // Store selectors
  const {
    center,
    zoom,
    mapType,
    gestureHandling,
    markers,
    streetView,
    isFullscreen,
    bounds,
    setCenter: setMapCenter,
    setZoom: setMapZoom,
    setBounds: setMapBounds,
    setMapType: setStoreMapType,
    setFullscreen: setStoreFullscreen,
    addMarker: addStoreMarker,
    setLoading: setMapLoading,
    setError: setMapError,
  } = useMapStore();

  const { selectedLocation, performSearch } = useSearchStore();
  const { preferences, geolocation, getCurrentPosition } = useUserStore();

  // Google Maps API loader
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '',
    version: 'weekly',
    libraries: ['places', 'geometry', 'drawing'],
    language: preferences.language || 'en',
    region: 'US',
    preventGoogleFontsLoading: false,
    retries: 3,
  });

  // Computed options
  const mapCenter = options.center || center;
  const mapZoom = options.zoom || zoom;
  const mapMapTypeId = options.mapTypeId || mapType;
  const mapGestureHandling = options.options?.gestureHandling || gestureHandling;

  const mapContainerStyle = options.options?.styles
    ? { ...defaultMapContainerStyle, ...options.options }
    : defaultMapContainerStyle;

  const mapOptions: google.maps.MapOptions = {
    ...defaultMapOptions,
    ...options.options,
    center: mapCenter,
    zoom: mapZoom,
    mapTypeId: mapMapTypeId,
    gestureHandling: mapGestureHandling,
  };

  // Event handlers
  const handleMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
    setIsMapInitialized(true);
    setMapLoading(false);

    // Add event listeners
    map.addListener('idle', handleMapIdle);
    map.addListener('bounds_changed', handleBoundsChanged);

    // Apply user preferences
    if (preferences.showTraffic) {
      map.setMapTypeId(google.maps.MapTypeId.TRAFFIC);
    }

    options.onMapLoad?.(map);

    // Log map initialization in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Google Maps initialized successfully', {
        center: mapCenter,
        zoom: mapZoom,
        mapType: mapMapTypeId,
      });
    }
  }, [center, zoom, preferences, options.onMapLoad]);

  const handleMapClick = useCallback((event: google.maps.MapMouseEvent) => {
    if (!event.latLng) return;

    const clickedLocation: Location = {
      lat: event.latLng.lat(),
      lng: event.latLng.lng(),
    };

    // Add a marker at the clicked location
    addStoreMarker({
      position: clickedLocation,
      title: `Marker at ${clickedLocation.lat.toFixed(4)}, ${clickedLocation.lng.toFixed(4)}`,
      description: `Custom marker placed at this location`,
    });

    options.onMapClick?.(event);
  }, [addStoreMarker, options.onMapClick]);

  const handleMapIdle = useCallback(() => {
    if (!mapRef.current) return;

    const mapCenter = mapRef.current.getCenter();
    const mapZoom = mapRef.current.getZoom();
    const mapBounds = mapRef.current.getBounds();

    if (mapCenter && mapZoom !== undefined) {
      setMapCenter({
        lat: mapCenter.lat(),
        lng: mapCenter.lng(),
      });
      setMapZoom(mapZoom);
    }

    if (mapBounds) {
      setMapBounds({
        north: mapBounds.getNorthEast().lat(),
        south: mapBounds.getSouthWest().lat(),
        east: mapBounds.getNorthEast().lng(),
        west: mapBounds.getSouthWest().lng(),
      });
    }

    options.onMapIdle?.();
  }, [setMapCenter, setMapZoom, setMapBounds, options.onMapIdle]);

  const handleBoundsChanged = useCallback(() => {
    options.onBoundsChanged?.();
  }, [options.onBoundsChanged]);

  const handleMarkerClick = useCallback((marker: Marker) => {
    return (event: google.maps.MapMouseEvent) => {
      event.stop();
      options.onMarkerClick?.(marker, event);

      // Update map center to marker position
      setMapCenter(marker.position);

      // You could also show info window or perform other actions
    };
  }, [setMapCenter, options.onMarkerClick]);

  // Handle selected location changes
  useEffect(() => {
    if (selectedLocation && isMapInitialized && mapRef.current) {
      setMapCenter(selectedLocation);
      setMapZoom(15);

      // Add a marker for the selected location
      addStoreMarker({
        position: selectedLocation,
        title: selectedLocation.address || 'Selected Location',
        description: selectedLocation.formattedAddress,
        animation: google.maps.Animation.DROP,
      });
    }
  }, [selectedLocation, isMapInitialized, setMapCenter, addStoreMarker]);

  // Handle geolocation
  useEffect(() => {
    if (preferences.enableLocation && geolocation.permission === 'granted' && isMapInitialized) {
      getCurrentPosition().then((position) => {
        if (position && mapRef.current) {
          setMapCenter(position);
          setMapZoom(13);

          // Add current location marker
          addStoreMarker({
            position,
            title: 'Your Location',
            description: 'Current GPS location',
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              scale: 8,
              fillColor: '#4285F4',
              fillOpacity: 1,
              strokeColor: '#ffffff',
              strokeWeight: 2,
            },
            zIndex: 1000,
          });
        }
      });
    }
  }, [preferences.enableLocation, geolocation.permission, isMapInitialized]);

  // Handle fullscreen changes
  useEffect(() => {
    if (mapRef.current) {
      if (isFullscreen) {
        mapRef.current.getDiv().requestFullscreen?.();
      } else {
        document.exitFullscreen?.();
      }
    }
  }, [isFullscreen]);

  // Handle loading and error states
  useEffect(() => {
    if (loadError) {
      setMapError(`Failed to load Google Maps: ${loadError.message}`);
      setMapLoading(false);
    } else if (!isLoaded) {
      setMapLoading(true);
    }
  }, [isLoaded, loadError]);

  // Map component
  const MapComponent: React.ComponentType<React.PropsWithChildren<{}>> = ({ children }) => {
    if (!isLoaded) {
      return (
        <div style={mapContainerStyle} className="flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-gray-600">Loading map...</p>
          </div>
        </div>
      );
    }

    if (loadError) {
      return (
        <div style={mapContainerStyle} className="flex items-center justify-center bg-red-50">
          <div className="text-center">
            <div className="text-red-600 mb-2">
              <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <p className="text-red-600">Failed to load map</p>
            <p className="text-red-500 text-sm">{loadError.message}</p>
          </div>
        </div>
      );
    }

    return (
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={mapCenter}
        zoom={mapZoom}
        options={mapOptions}
        onLoad={handleMapLoad}
        onClick={handleMapClick}
        onIdle={handleMapIdle}
      >
        {children}
      </GoogleMap>
    );
  };

  // Marker component
  const MarkerComponent: React.ComponentType<React.PropsWithChildren<{
    marker: Marker;
    onClick?: () => void;
  }>> = ({ marker, onClick, children }) => {
    const [isInfoWindowOpen, setIsInfoWindowOpen] = useState(false);

    const handleMarkerClick = useCallback((event: google.maps.MapMouseEvent) => {
      setIsInfoWindowOpen(!isInfoWindowOpen);
      onClick?.();
      handleMarkerClick(marker)(event);
    }, [marker, onClick, isInfoWindowOpen]);

    return (
      <>
        <MarkerF
          position={marker.position}
          title={marker.title}
          label={marker.title[0]?.toUpperCase()}
          icon={marker.icon}
          zIndex={marker.zIndex}
          opacity={marker.opacity}
          animation={marker.animation}
          onClick={handleMarkerClick}
        />
        {isInfoWindowOpen && marker.description && (
          <InfoWindowF
            position={marker.position}
            onCloseClick={() => setIsInfoWindowOpen(false)}
          >
            <div className="p-2 max-w-xs">
              <h3 className="font-semibold text-sm mb-1">{marker.title}</h3>
              <p className="text-xs text-gray-600">{marker.description}</p>
            </div>
          </InfoWindowF>
        )}
        {children}
      </>
    );
  };

  return {
    map: mapRef.current,
    isLoaded,
    loadError,
    mapContainerStyle,
    mapOptions,
    handleMapLoad,
    handleMapClick,
    handleMapIdle,
    handleBoundsChanged,
    handleMarkerClick,
    MapComponent,
    MarkerComponent,
  };
};

export default useGoogleMaps;