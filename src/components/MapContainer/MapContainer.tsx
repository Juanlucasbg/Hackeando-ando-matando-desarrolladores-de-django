import React, { useState, useCallback, useRef, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import { MapContainerProps, Location, MapMarker } from '../../types';
import { MapControls } from '../MapControls/MapControls';
import { getMapService } from '../../services/mapService';
import { Loader2, AlertCircle } from 'lucide-react';
import clsx from 'clsx';

const mapContainerStyle = {
  width: '100%',
  height: '100%',
};

const defaultMapOptions: google.maps.MapOptions = {
  zoomControl: false,
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: false,
  gestureHandling: 'cooperative',
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
  ],
};

const defaultCenter: Location = {
  lat: 40.7128,
  lng: -74.0060,
};

const MapContainer: React.FC<MapContainerProps> = ({
  center = defaultCenter,
  zoom = 12,
  markers = [],
  onMapClick,
  onMarkerClick,
  className,
  style,
  children,
}) => {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [selectedMarker, setSelectedMarker] = useState<MapMarker | null>(null);
  const [mapTypeId, setMapTypeId] = useState<google.maps.MapTypeId>(google.maps.MapTypeId.ROADMAP);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const mapRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
    libraries: ['places', 'geometry'],
    language: 'en',
    region: 'US',
  });

  useEffect(() => {
    if (isLoaded && !loadError) {
      try {
        const mapService = getMapService({
          apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
          libraries: ['places', 'geometry'],
        });
        mapService.initialize().catch((err) => {
          console.error('MapService initialization error:', err);
          setError(err.message);
        });
      } catch (err) {
        console.error('MapService configuration error:', err);
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
      }
    }
  }, [isLoaded, loadError]);

  const handleLoad = useCallback((mapInstance: google.maps.Map) => {
    setMap(mapInstance);
    setError(null);
    setRetryCount(0);

    // Add custom event listeners
    mapInstance.addListener('tilesloaded', () => {
      console.log('Map tiles loaded successfully');
    });

    mapInstance.addListener('idle', () => {
      // Map is idle and ready
    });
  }, []);

  const handleUnmount = useCallback(() => {
    setMap(null);
  }, []);

  const handleMapClick = useCallback(
    (event: google.maps.MapMouseEvent) => {
      if (onMapClick) {
        onMapClick(event);
      }
      setSelectedMarker(null);
    },
    [onMapClick]
  );

  const handleMarkerClick = useCallback(
    (marker: MapMarker) => {
      setSelectedMarker(marker);
      if (onMarkerClick) {
        onMarkerClick(marker);
      }
    },
    [onMarkerClick]
  );

  const handleZoomIn = useCallback(() => {
    if (map) {
      const currentZoom = map.getZoom() || 12;
      map.setZoom(currentZoom + 1);
    }
  }, [map]);

  const handleZoomOut = useCallback(() => {
    if (map) {
      const currentZoom = map.getZoom() || 12;
      map.setZoom(Math.max(1, currentZoom - 1));
    }
  }, [map]);

  const handleMapTypeChange = useCallback((newMapTypeId: string) => {
    setMapTypeId(newMapTypeId as google.maps.MapTypeId);
    if (map) {
      map.setMapTypeId(newMapTypeId as google.maps.MapTypeId);
    }
  }, [map]);

  const handleFullscreenToggle = useCallback(() => {
    if (!containerRef.current) return;

    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    setIsFullscreen(!isFullscreen);
  }, [isFullscreen]);

  const handleRetry = useCallback(() => {
    setRetryCount((prev) => prev + 1);
    setError(null);
    // Force re-render by changing a key
    if (mapRef.current) {
      mapRef.current.innerHTML = '';
    }
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Loading state
  if (!isLoaded) {
    return (
      <div
        className={clsx('map-container flex items-center justify-center bg-gray-100', className)}
        style={style}
      >
        <div className="text-center">
          <Loader2 className="loading-spinner mx-auto mb-4 w-8 h-8" />
          <p className="text-gray-600">Loading map...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (loadError || error) {
    const errorMessage = error || loadError?.message || 'Failed to load Google Maps';

    return (
      <div
        className={clsx('map-container flex items-center justify-center bg-gray-100', className)}
        style={style}
      >
        <div className="text-center max-w-md p-6">
          <AlertCircle className="mx-auto mb-4 w-12 h-12 text-red-500" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Map Load Error</h3>
          <p className="text-gray-600 mb-4">{errorMessage}</p>
          {retryCount < 3 && (
            <button
              onClick={handleRetry}
              className="bg-google-blue text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Retry ({retryCount}/3)
            </button>
          )}
          {retryCount >= 3 && (
            <p className="text-sm text-gray-500">
              Please check your internet connection and try again later.
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={clsx('map-container relative', className)}
      style={style}
    >
      <div ref={mapRef} className="absolute inset-0">
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={center}
          zoom={zoom}
          options={defaultMapOptions}
          onLoad={handleLoad}
          onUnmount={handleUnmount}
          onClick={handleMapClick}
          mapTypeId={mapTypeId}
        >
          {/* Render markers */}
          {markers.map((marker, index) => (
            <Marker
              key={`marker-${index}-${marker.position.lat}-${marker.position.lng}`}
              position={{ lat: marker.position.lat, lng: marker.position.lng }}
              title={marker.title}
              icon={marker.icon}
              onClick={() => handleMarkerClick(marker)}
            />
          ))}

          {/* InfoWindow for selected marker */}
          {selectedMarker && (
            <InfoWindow
              position={{ lat: selectedMarker.position.lat, lng: selectedMarker.position.lng }}
              onCloseClick={() => setSelectedMarker(null)}
            >
              <div className="p-2">
                <h3 className="font-semibold text-gray-800">{selectedMarker.title}</h3>
                {selectedMarker.info && (
                  <p className="text-sm text-gray-600 mt-1">{selectedMarker.info}</p>
                )}
              </div>
            </InfoWindow>
          )}

          {/* Render additional children */}
          {children}
        </GoogleMap>
      </div>

      {/* Map Controls */}
      {map && (
        <MapControls
          map={map}
          zoom={map.getZoom() || zoom}
          mapTypeId={mapTypeId}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onMapTypeChange={handleMapTypeChange}
          onFullscreenToggle={handleFullscreenToggle}
          onStreetViewToggle={() => {
            // Street view toggle functionality can be implemented here
          }}
          streetViewVisible={false}
          className="absolute top-4 right-4 z-10"
        />
      )}
    </div>
  );
};

export default MapContainer;