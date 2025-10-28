import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleMap, useJsApiLoader, Marker, OverlayView } from '@react-google-maps/api';
import { StreetView, StreetViewControls } from '../streetview';
import { Pegman } from './Pegman';
import { StreetViewPosition } from '../../types/streetview.types';

interface MapStreetViewIntegrationProps {
  googleMapsApiKey: string;
  initialPosition?: StreetViewPosition;
  initialZoom?: number;
  className?: string;
  mapStyle?: React.CSSProperties;
  streetViewStyle?: React.CSSProperties;
  showPegman?: boolean;
  showCoverage?: boolean;
  syncMapAndStreetView?: boolean;
  onMapClick?: (position: google.maps.LatLng) => void;
  onStreetViewPositionChange?: (position: StreetViewPosition) => void;
  onError?: (error: Error) => void;
}

const mapContainerStyle = {
  width: '100%',
  height: '100%',
};

const streetViewContainerStyle = {
  width: '100%',
  height: '100%',
};

export const MapStreetViewIntegration: React.FC<MapStreetViewIntegrationProps> = ({
  googleMapsApiKey,
  initialPosition = { lat: 37.7749, lng: -122.4194, heading: 0, pitch: 0, zoom: 1 },
  initialZoom = 15,
  className = '',
  mapStyle = {},
  streetViewStyle = {},
  showPegman = true,
  showCoverage = true,
  syncMapAndStreetView = true,
  onMapClick,
  onStreetViewPositionChange,
  onError,
}) => {
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey,
    libraries: ['geometry', 'streetview'],
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [streetViewPosition, setStreetViewPosition] = useState<StreetViewPosition>(initialPosition);
  const [isStreetViewVisible, setIsStreetViewVisible] = useState(false);
  const [isSplitView, setIsSplitView] = useState(false);
  const [pegmanPosition, setPegmanPosition] = useState<google.maps.LatLng | null>(null);
  const [streetViewCoverage, setStreetViewCoverage] = useState<google.maps.StreetViewCoverageLayer | null>(null);
  const [isDraggingPegman, setIsDraggingPegman] = useState(false);

  const mapRef = useRef<google.maps.Map>(null);
  const streetViewServiceRef = useRef<google.maps.StreetViewService | null>(null);
  const markerRef = useRef<Marker>(null);

  // Initialize Street View service
  useEffect(() => {
    if (isLoaded && !streetViewServiceRef.current) {
      streetViewServiceRef.current = new google.maps.StreetViewService();
    }
  }, [isLoaded]);

  // Initialize map
  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
    mapRef.current = map;

    // Set up street view coverage layer
    if (showCoverage) {
      const coverageLayer = new google.maps.StreetViewCoverageLayer();
      coverageLayer.setMap(map);
      setStreetViewCoverage(coverageLayer);
    }

    // Add click handler for Street View
    if (onMapClick) {
      map.addListener('click', (e: google.maps.MapMouseEvent) => {
        handleMapClick(e.latLng!);
      });
    }
  }, [showCoverage, onMapClick]);

  // Handle map click to enter Street View
  const handleMapClick = useCallback(async (latLng: google.maps.LatLng) => {
    if (!streetViewServiceRef.current || !syncMapAndStreetView) {
      onMapClick?.(latLng);
      return;
    }

    const position: StreetViewPosition = {
      lat: latLng.lat(),
      lng: latLng.lng(),
      heading: 0,
      pitch: 0,
      zoom: 1,
    };

    // Check if Street View is available at this location
    streetViewServiceRef.current.getPanorama(
      {
        location: latLng,
        radius: 50,
      },
      (result, status) => {
        if (status === google.maps.StreetViewStatus.OK) {
          setStreetViewPosition({
            ...position,
            lat: result.location?.latLng?.lat() || position.lat,
            lng: result.location?.latLng?.lng() || position.lng,
          });
          setIsStreetViewVisible(true);
          setPegmanPosition(latLng);
        } else {
          // Street View not available, show error or message
          console.warn('Street View not available at this location');
          onMapClick?.(latLng);
        }
      }
    );
  }, [syncMapAndStreetView, onMapClick]);

  // Handle Street View position change
  const handleStreetViewPositionChange = useCallback((position: StreetViewPosition) => {
    setStreetViewPosition(position);
    onStreetViewPositionChange?.(position);

    // Sync map marker with Street View position
    if (syncMapAndStreetView && mapRef.current) {
      const newLatLng = new google.maps.LatLng(position.lat, position.lng);
      setPegmanPosition(newLatLng);

      // Center map on Street View position
      mapRef.current.panTo(newLatLng);
    }
  }, [syncMapAndStreetView, onStreetViewPositionChange]);

  // Handle Pegman drag
  const handlePegmanDragStart = useCallback(() => {
    setIsDraggingPegman(true);
  }, []);

  const handlePegmanDragEnd = useCallback((e: google.maps.MapMouseEvent) => {
    if (!e.latLng) return;

    setIsDraggingPegman(false);
    handleMapClick(e.latLng);
  }, [handleMapClick]);

  // Toggle Street View visibility
  const toggleStreetView = useCallback(() => {
    setIsStreetViewVisible(!isStreetViewVisible);
  }, [isStreetViewVisible]);

  // Toggle split view mode
  const toggleSplitView = useCallback(() => {
    setIsSplitView(!isSplitView);
  }, [isSplitView]);

  // Exit Street View
  const exitStreetView = useCallback(() => {
    setIsStreetViewVisible(false);
    setPegmanPosition(null);
  }, []);

  // Handle errors
  useEffect(() => {
    if (loadError) {
      onError?.(loadError);
    }
  }, [loadError, onError]);

  if (loadError) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 ${className}`} style={mapStyle}>
        <div className="text-center p-8">
          <div className="text-red-500 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load maps</h3>
          <p className="text-gray-600">Unable to load Google Maps. Please check your API key.</p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 ${className}`} style={mapStyle}>
        <div className="text-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading maps...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* Map */}
      <GoogleMap
        mapContainerStyle={isSplitView ? { ...mapContainerStyle, width: '50%' } : mapContainerStyle}
        center={{ lat: streetViewPosition.lat, lng: streetViewPosition.lng }}
        zoom={initialZoom}
        onLoad={onLoad}
        onClick={handleMapClick}
        options={{
          mapTypeControl: true,
          streetViewControl: false, // We use custom Street View
          fullscreenControl: true,
          zoomControl: true,
          gestureHandling: 'greedy',
        }}
      >
        {/* Pegman marker */}
        {showPegman && pegmanPosition && (
          <Marker
            position={pegmanPosition}
            icon={{
              url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="16" cy="16" r="14" fill="#4285F4" stroke="white" stroke-width="2"/>
                  <circle cx="16" cy="12" r="4" fill="white"/>
                  <path d="M12 18 Q16 22 20 18" fill="none" stroke="white" stroke-width="2" stroke-linecap="round"/>
                  <circle cx="12" cy="14" r="1" fill="#4285F4"/>
                  <circle cx="20" cy="14" r="1" fill="#4285F4"/>
                </svg>
              `),
              scaledSize: new google.maps.Size(32, 32),
              anchor: new google.maps.Point(16, 16),
            }}
            draggable={true}
            onDragStart={handlePegmanDragStart}
            onDragEnd={handlePegmanDragEnd}
          />
        )}
      </GoogleMap>

      {/* Street View */}
      <AnimatePresence>
        {isStreetViewVisible && (
          <motion.div
            className={isSplitView ? 'absolute right-0 top-0 w-1/2 h-full' : 'absolute inset-0'}
            initial={{ opacity: 0, x: isSplitView ? 100 : 0 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: isSplitView ? 100 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <StreetView
              google={window.google}
              options={{
                position: {
                  lat: streetViewPosition.lat,
                  lng: streetViewPosition.lng,
                  heading: streetViewPosition.heading,
                  pitch: streetViewPosition.pitch,
                  zoom: streetViewPosition.zoom,
                },
                visible: true,
              }}
              eventHandlers={{
                onPositionChanged: handleStreetViewPositionChange,
              }}
              style={streetViewStyle}
              onVisibilityChange={(visible) => {
                if (!visible) exitStreetView();
              }}
              showControls={!isSplitView}
              className="w-full h-full"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Control Buttons */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
        {!isStreetViewVisible && (
          <button
            onClick={toggleStreetView}
            className="bg-white rounded-lg shadow-lg p-3 hover:bg-gray-100 transition-colors"
            title="Enter Street View"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
          </button>
        )}

        {isStreetViewVisible && (
          <>
            <button
              onClick={toggleSplitView}
              className={`rounded-lg shadow-lg p-3 transition-colors ${
                isSplitView ? 'bg-blue-500 text-white' : 'bg-white hover:bg-gray-100'
              }`}
              title="Toggle split view"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V4z" />
              </svg>
            </button>

            <button
              onClick={exitStreetView}
              className="bg-white rounded-lg shadow-lg p-3 hover:bg-gray-100 transition-colors"
              title="Exit Street View"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </>
        )}
      </div>

      {/* Instructions */}
      {!isStreetViewVisible && (
        <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-4 max-w-xs">
          <h3 className="font-semibold text-gray-900 mb-2">Navigate with Street View</h3>
          <p className="text-sm text-gray-600">
            Click anywhere on the map to enter Street View mode, or drag the pegman icon to a specific location.
          </p>
        </div>
      )}
    </div>
  );
};