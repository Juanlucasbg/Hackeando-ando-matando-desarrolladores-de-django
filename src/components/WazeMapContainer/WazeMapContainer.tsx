import React, { useState, useCallback, useRef, useEffect } from 'react';
import { MapContainerProps, Location, MapMarker } from '../../types';
import { getWazeService } from '../../services/wazeService';
import { WAZE_API_CONFIG } from '../../config/maps';
import { Loader2, AlertCircle, Navigation, MapPin } from 'lucide-react';
import clsx from 'clsx';

const mapContainerStyle = {
  width: '100%',
  height: '100%',
  minHeight: '400px',
};

const defaultCenter: Location = {
  lat: 40.7128,
  lng: -74.0060,
};

const WazeMapContainer: React.FC<MapContainerProps> = ({
  center = defaultCenter,
  zoom = 12,
  markers = [],
  onMapClick,
  onMarkerClick,
  className,
  style,
  children,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedMarker, setSelectedMarker] = useState<MapMarker | null>(null);
  const [currentZoom, setCurrentZoom] = useState(zoom);
  const [currentCenter, setCurrentCenter] = useState(center);
  const [wazeService, setWazeService] = useState(getWazeService());
  const [retryCount, setRetryCount] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);

  // Initialize Waze service
  useEffect(() => {
    const initializeWazeService = async () => {
      try {
        setIsLoaded(false);
        setError(null);

        const service = getWazeService({
          apiKey: import.meta.env.VITE_WAZE_API_KEY || WAZE_API_CONFIG.apiKey,
          baseUrl: WAZE_API_CONFIG.baseUrl,
        });

        await service.initialize();
        setWazeService(service);
        setIsLoaded(true);

        console.log('Waze service initialized successfully');
      } catch (err) {
        console.error('Failed to initialize Waze service:', err);
        setError(err instanceof Error ? err.message : 'Failed to initialize Waze service');
        setIsLoaded(false);
      }
    };

    initializeWazeService();
  }, []);

  // Update center when prop changes
  useEffect(() => {
    setCurrentCenter(center);
  }, [center]);

  // Update zoom when prop changes
  useEffect(() => {
    setCurrentZoom(zoom);
  }, [zoom]);

  const handleMapClick = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    if (!mapRef.current) return;

    const rect = mapRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Convert click position to approximate coordinates
    const clickedLocation: Location = {
      lat: currentCenter.lat + ((rect.height / 2 - y) / rect.height) * (0.5 / Math.pow(2, currentZoom - 8)),
      lng: currentCenter.lng + ((x - rect.width / 2) / rect.width) * (0.5 / Math.pow(2, currentZoom - 8)),
    };

    // Create a mock event similar to Google Maps event
    const mockEvent = {
      latLng: {
        lat: () => clickedLocation.lat,
        lng: () => clickedLocation.lng,
      },
      stop: () => {},
    };

    if (onMapClick) {
      onMapClick(mockEvent);
    }
  }, [currentCenter, currentZoom, onMapClick]);

  const handleMarkerClick = useCallback((marker: MapMarker, event: React.MouseEvent) => {
    event.stopPropagation();
    setSelectedMarker(marker);
    if (onMarkerClick) {
      onMarkerClick(marker);
    }
  }, [onMarkerClick]);

  const handleZoomIn = useCallback(() => {
    setCurrentZoom((prev) => Math.min(20, prev + 1));
  }, []);

  const handleZoomOut = useCallback(() => {
    setCurrentZoom((prev) => Math.max(1, prev - 1));
  }, []);

  const handleRetry = useCallback(() => {
    setRetryCount((prev) => prev + 1);
    setError(null);
    // Re-initialize the service
    const initializeWazeService = async () => {
      try {
        const service = getWazeService();
        await service.initialize();
        setWazeService(service);
        setIsLoaded(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to initialize Waze service');
      }
    };
    initializeWazeService();
  }, []);

  // Calculate marker position on the map
  const getMarkerStyle = useCallback((marker: MapMarker) => {
    if (!mapRef.current) return { left: '50%', top: '50%' };

    const rect = mapRef.current.getBoundingClientRect();
    const latDiff = marker.position.lat - currentCenter.lat;
    const lngDiff = marker.position.lng - currentCenter.lng;

    const x = rect.width / 2 + (lngDiff * rect.width * Math.pow(2, currentZoom - 8)) / 0.5;
    const y = rect.height / 2 - (latDiff * rect.height * Math.pow(2, currentZoom - 8)) / 0.5;

    return {
      left: `${x}px`,
      top: `${y}px`,
      transform: 'translate(-50%, -50%)',
    };
  }, [currentCenter, currentZoom]);

  // Loading state
  if (!isLoaded) {
    return (
      <div
        className={clsx('waze-map-container flex items-center justify-center bg-gray-100', className)}
        style={{ ...mapContainerStyle, ...style }}
      >
        <div className="text-center">
          <Loader2 className="animate-spin mx-auto mb-4 w-8 h-8 text-blue-600" />
          <p className="text-gray-600">Initializing Waze map...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div
        className={clsx('waze-map-container flex items-center justify-center bg-gray-100', className)}
        style={{ ...mapContainerStyle, ...style }}
      >
        <div className="text-center max-w-md p-6">
          <AlertCircle className="mx-auto mb-4 w-12 h-12 text-red-500" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Waze Map Error</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          {retryCount < 3 && (
            <button
              onClick={handleRetry}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Retry ({retryCount}/3)
            </button>
          )}
          {retryCount >= 3 && (
            <p className="text-sm text-gray-500">
              Please check your API key and internet connection.
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={clsx('waze-map-container relative overflow-hidden', className)}
      style={{ ...mapContainerStyle, ...style }}
    >
      {/* Map Container */}
      <div
        ref={mapRef}
        className="absolute inset-0 bg-gradient-to-br from-blue-50 to-green-50 cursor-crosshair"
        onClick={handleMapClick}
        style={{
          backgroundImage: 'url(https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/pin-l+FF0000(-74.0060,40.7128)/-74.0060,40.7120,12/600x400@2x?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Waze Header */}
        <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-3 z-10">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Navigation className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-800">Waze Maps</div>
              <div className="text-xs text-green-600">● Connected</div>
            </div>
          </div>
          <div className="mt-2 text-xs text-gray-600">
            <div>Lat: {currentCenter.lat.toFixed(4)}</div>
            <div>Lng: {currentCenter.lng.toFixed(4)}</div>
            <div>Zoom: {currentZoom}</div>
          </div>
        </div>

        {/* Render markers */}
        {markers.map((marker, index) => (
          <div
            key={`marker-${index}-${marker.position.lat}-${marker.position.lng}`}
            className="absolute z-20"
            style={getMarkerStyle(marker)}
          >
            <div
              className="relative cursor-pointer group"
              onClick={(e) => handleMarkerClick(marker, e)}
            >
              {/* Marker pin */}
              <div className="relative">
                <MapPin className="w-8 h-8 text-red-600 drop-shadow-lg" />
                <div className="absolute inset-0 bg-red-600 rounded-full opacity-20 animate-ping"></div>
              </div>

              {/* Marker tooltip */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-white rounded-lg shadow-lg p-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-30">
                <div className="text-sm font-semibold text-gray-800">{marker.title}</div>
                {marker.description && (
                  <div className="text-xs text-gray-600">{marker.description}</div>
                )}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white"></div>
              </div>
            </div>
          </div>
        ))}

        {/* Selected marker info window */}
        {selectedMarker && (
          <div
            className="absolute z-30 bg-white rounded-lg shadow-xl p-3 max-w-xs"
            style={{
              ...getMarkerStyle(selectedMarker),
              top: 'auto',
              bottom: '20px',
              transform: 'translateX(-50%)',
            }}
          >
            <button
              className="absolute top-1 right-1 text-gray-400 hover:text-gray-600"
              onClick={() => setSelectedMarker(null)}
            >
              ×
            </button>
            <h3 className="font-semibold text-gray-800 mb-1">{selectedMarker.title}</h3>
            {selectedMarker.description && (
              <p className="text-sm text-gray-600">{selectedMarker.description}</p>
            )}
            {selectedMarker.info && (
              <p className="text-xs text-gray-500 mt-1">{selectedMarker.info}</p>
            )}
          </div>
        )}

        {/* Map Controls */}
        <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-lg p-1 z-10">
          <button
            className="p-2 hover:bg-gray-100 rounded transition-colors"
            onClick={handleZoomIn}
            title="Zoom in"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </button>
          <div className="border-t border-gray-200"></div>
          <button
            className="p-2 hover:bg-gray-100 rounded transition-colors"
            onClick={handleZoomOut}
            title="Zoom out"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 12H6" />
            </svg>
          </button>
        </div>

        {/* Waze branding */}
        <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg">
          <div className="text-xs text-gray-600">Powered by</div>
          <div className="text-sm font-bold text-blue-600">Waze API</div>
        </div>

        {/* Render additional children */}
        {children}
      </div>
    </div>
  );
};

export default WazeMapContainer;