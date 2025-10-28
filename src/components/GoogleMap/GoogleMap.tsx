import React, { useCallback, useRef, useEffect, useState } from 'react';
import { GoogleMap as GoogleMapComponent, useJsApiLoader } from '@react-google-maps/api';
import { GoogleMapProps, Location, MapMarker, MapOptions } from '../../types';
import { getMapService } from '../../services/mapService';
import { Loader2, AlertTriangle } from 'lucide-react';
import clsx from 'clsx';

const mapContainerStyle = {
  width: '100%',
  height: '100%',
};

const defaultMapOptions: MapOptions = {
  zoomControl: true,
  streetViewControl: true,
  mapTypeControl: true,
  fullscreenControl: true,
  gestureHandling: 'cooperative',
  mapTypeId: 'roadmap',
  disableDefaultUI: false,
  styles: [
    {
      featureType: 'poi',
      elementType: 'labels',
      stylers: [{ visibility: 'off' }],
    },
    {
      featureType: 'transit',
      elementType: 'labels',
      stylers: [{ visibility: 'off' }],
    },
    {
      featureType: 'administrative.land_parcel',
      elementType: 'labels',
      stylers: [{ visibility: 'off' }],
    },
  ],
};

const customMapStyles: { [key: string]: google.maps.MapTypeStyle[] } = {
  minimal: [
    {
      featureType: 'all',
      elementType: 'labels',
      stylers: [{ visibility: 'off' }],
    },
    {
      featureType: 'road',
      elementType: 'geometry',
      stylers: [{ visibility: 'on' }],
    },
    {
      featureType: 'road',
      elementType: 'labels',
      stylers: [{ visibility: 'on' }],
    },
  ],
  dark: [
    {
      elementType: 'geometry',
      stylers: [{ color: '#212121' }],
    },
    {
      elementType: 'labels.icon',
      stylers: [{ visibility: 'off' }],
    },
    {
      elementType: 'labels.text.fill',
      stylers: [{ color: '#757575' }],
    },
    {
      elementType: 'labels.text.stroke',
      stylers: [{ color: '#212121' }],
    },
    {
      featureType: 'administrative',
      elementType: 'geometry',
      stylers: [{ color: '#757575' }],
    },
    {
      featureType: 'road',
      elementType: 'geometry.fill',
      stylers: [{ color: '#2c2c2c' }],
    },
    {
      featureType: 'road',
      elementType: 'geometry.stroke',
      stylers: [{ color: '#2c2c2c' }],
    },
    {
      featureType: 'water',
      elementType: 'geometry',
      stylers: [{ color: '#000000' }],
    },
  ],
};

const GoogleMap: React.FC<GoogleMapProps> = ({
  center,
  zoom,
  markers,
  options = {},
  onMapClick,
  onMarkerClick,
  onLoad,
  onUnmount,
}) => {
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mapStyle, setMapStyle] = useState<string>('default');

  const mapRef = useRef<HTMLDivElement>(null);

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-core',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
    libraries: ['places', 'geometry', 'drawing'],
    language: 'en',
    region: 'US',
    version: 'weekly',
  });

  // Merge default options with provided options
  const mapOptions: google.maps.MapOptions = {
    ...defaultMapOptions,
    ...options,
    styles: options.styles || defaultMapOptions.styles,
  };

  const handleMapLoad = useCallback(
    (map: google.maps.Map) => {
      setMapInstance(map);
      setIsMapReady(true);
      setError(null);

      // Initialize MapService if not already done
      try {
        const mapService = getMapService({
          apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
          libraries: ['places', 'geometry'],
        });
        mapService.initialize().catch((err) => {
          console.error('MapService initialization failed:', err);
          setError(err.message);
        });
      } catch (err) {
        console.error('MapService configuration error:', err);
        setError(err instanceof Error ? err.message : 'MapService configuration failed');
      }

      // Add map event listeners
      map.addListener('bounds_changed', () => {
        // Map bounds changed
      });

      map.addListener('center_changed', () => {
        // Map center changed
      });

      map.addListener('zoom_changed', () => {
        // Map zoom changed
      });

      map.addListener('maptypeid_changed', () => {
        // Map type changed
      });

      map.addListener('tilesloaded', () => {
        console.log('Map tiles loaded successfully');
      });

      // Call onLoad callback if provided
      if (onLoad) {
        onLoad(map);
      }
    },
    [onLoad]
  );

  const handleMapUnmount = useCallback(() => {
    setMapInstance(null);
    setIsMapReady(false);

    if (onUnmount) {
      onUnmount();
    }
  }, [onUnmount]);

  const handleMapClick = useCallback(
    (event: google.maps.MapMouseEvent) => {
      if (onMapClick) {
        onMapClick(event);
      }
    },
    [onMapClick]
  );

  const handleMapStyleChange = useCallback((styleName: string) => {
    setMapStyle(styleName);

    if (mapInstance) {
      const styles = styleName === 'default' ? defaultMapOptions.styles : customMapStyles[styleName];
      if (styles) {
        mapInstance.setOptions({ styles });
      }
    }
  }, [mapInstance]);

  // Pan to marker when clicked
  const panToMarker = useCallback((marker: MapMarker) => {
    if (mapInstance) {
      mapInstance.panTo({ lat: marker.position.lat, lng: marker.position.lng });
      mapInstance.setZoom(16);
    }
  }, [mapInstance]);

  // Fit map to bounds of all markers
  const fitMapToMarkers = useCallback(() => {
    if (mapInstance && markers.length > 0) {
      const bounds = new google.maps.LatLngBounds();

      markers.forEach((marker) => {
        bounds.extend({ lat: marker.position.lat, lng: marker.position.lng });
      });

      mapInstance.fitBounds(bounds);
    }
  }, [mapInstance, markers]);

  // Center map on user's location
  const centerOnUserLocation = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };

          if (mapInstance) {
            mapInstance.setCenter(userLocation);
            mapInstance.setZoom(15);
          }
        },
        (error) => {
          console.error('Geolocation error:', error);
          setError('Unable to get your location');
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0,
        }
      );
    } else {
      setError('Geolocation is not supported by your browser');
    }
  }, [mapInstance]);

  // Get current map bounds
  const getMapBounds = useCallback((): google.maps.LatLngBounds | null => {
    if (mapInstance) {
      return mapInstance.getBounds();
    }
    return null;
  }, [mapInstance]);

  // Get current map center
  const getMapCenter = useCallback((): Location | null => {
    if (mapInstance) {
      const center = mapInstance.getCenter();
      if (center) {
        return {
          lat: center.lat(),
          lng: center.lng(),
        };
      }
    }
    return null;
  }, [mapInstance]);

  // Get current map zoom
  const getMapZoom = useCallback((): number => {
    if (mapInstance) {
      return mapInstance.getZoom() || 0;
    }
    return 0;
  }, [mapInstance]);

  // Set map bounds with padding
  const setMapBoundsWithPadding = useCallback(
    (bounds: google.maps.LatLngBounds, padding?: number | google.maps.Padding) => {
      if (mapInstance) {
        mapInstance.fitBounds(bounds, padding);
      }
    },
    [mapInstance]
  );

  // Export map methods for parent component
  useEffect(() => {
    if (mapInstance && isMapReady) {
      // Attach custom methods to map instance for external access
      (mapInstance as any).panToMarker = panToMarker;
      (mapInstance as any).fitMapToMarkers = fitMapToMarkers;
      (mapInstance as any).centerOnUserLocation = centerOnUserLocation;
      (mapInstance as any).getMapBounds = getMapBounds;
      (mapInstance as any).getMapCenter = getMapCenter;
      (mapInstance as any).getMapZoom = getMapZoom;
      (mapInstance as any).setMapBoundsWithPadding = setMapBoundsWithPadding;
      (mapInstance as any).setMapStyle = handleMapStyleChange;
    }
  }, [
    mapInstance,
    isMapReady,
    panToMarker,
    fitMapToMarkers,
    centerOnUserLocation,
    getMapBounds,
    getMapCenter,
    getMapZoom,
    setMapBoundsWithPadding,
    handleMapStyleChange,
  ]);

  // Loading state
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center w-full h-full bg-gray-100">
        <div className="text-center">
          <Loader2 className="loading-spinner mx-auto mb-4 w-8 h-8" />
          <p className="text-gray-600">Loading Google Maps...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (loadError) {
    return (
      <div className="flex items-center justify-center w-full h-full bg-gray-100">
        <div className="text-center max-w-md p-6">
          <AlertTriangle className="mx-auto mb-4 w-12 h-12 text-red-500" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Map Load Error</h3>
          <p className="text-gray-600 mb-4">
            {loadError.message || 'Failed to load Google Maps. Please check your API key.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <GoogleMapComponent
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={zoom}
        options={mapOptions}
        onLoad={handleMapLoad}
        onUnmount={handleMapUnmount}
        onClick={handleMapClick}
      >
        {/* Map style selector - hidden by default, can be shown via prop */}
        <div className="absolute top-4 left-4 z-10">
          <select
            value={mapStyle}
            onChange={(e) => handleMapStyleChange(e.target.value)}
            className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm shadow-md hover:shadow-lg transition-shadow"
          >
            <option value="default">Default</option>
            <option value="minimal">Minimal</option>
            <option value="dark">Dark</option>
          </select>
        </div>

        {/* Error display */}
        {error && (
          <div className="absolute bottom-4 left-4 right-4 z-10">
            <div className="error-message">
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Map ready indicator (for development) */}
        {import.meta.env.DEV && isMapReady && (
          <div className="absolute bottom-4 right-4 z-10">
            <div className="bg-green-500 text-white px-2 py-1 rounded text-xs">
              Map Ready
            </div>
          </div>
        )}
      </GoogleMapComponent>
    </div>
  );
};

export default GoogleMap;