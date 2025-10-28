import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Camera, Calendar, MapPin, Clock, AlertCircle } from 'lucide-react';

import {
  StreetViewPano as StreetViewPanoType,
  StreetViewPosition,
  StreetViewOverlay,
  StreetViewTimeTravelOptions,
  StreetViewPerformanceOptions,
} from '../../types/streetview.types';

interface StreetViewPanoProps {
  google: typeof google;
  panorama: google.maps.StreetViewPanorama;
  pano: StreetViewPanoType;
  position: StreetViewPosition;
  overlays?: StreetViewOverlay[];
  timeTravelOptions?: StreetViewTimeTravelOptions;
  performanceOptions?: StreetViewPerformanceOptions;
  className?: string;
  style?: React.CSSProperties;
  showTimeTravel?: boolean;
  showOverlays?: boolean;
  showInfo?: boolean;
  enableClickToMove?: boolean;
  enableDragToRotate?: boolean;
  onOverlayClick?: (overlay: StreetViewOverlay) => void;
  onPositionChange?: (position: StreetViewPosition) => void;
  onPovChange?: (pov: google.maps.StreetViewPov) => void;
}

export const StreetViewPano: React.FC<StreetViewPanoProps> = ({
  google,
  panorama,
  pano,
  position,
  overlays = [],
  timeTravelOptions = { showHistoricalImages: false },
  performanceOptions = { quality: 'auto', enableWebGL: true },
  className = '',
  style = {},
  showTimeTravel = false,
  showOverlays = true,
  showInfo = true,
  enableClickToMove = true,
  enableDragToRotate = true,
  onOverlayClick,
  onPositionChange,
  onPovChange,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const overlayContainerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedHistoricalDate, setSelectedHistoricalDate] = useState<Date | null>(null);
  const [showTimeTravelPanel, setShowTimeTravelPanel] = useState(false);
  const [activeOverlays, setActiveOverlays] = useState<StreetViewOverlay[]>([]);
  const [clickPosition, setClickPosition] = useState<{ x: number; y: number } | null>(null);

  // Panorama event handlers
  useEffect(() => {
    if (!panorama) return;

    const handlePovChange = () => {
      const pov = panorama.getPov();
      onPovChange?.(pov);
    };

    const handlePositionChange = () => {
      const pos = panorama.getPosition();
      if (pos) {
        const newPosition: StreetViewPosition = {
          lat: pos.lat(),
          lng: pos.lng(),
          heading: panorama.getPov().heading,
          pitch: panorama.getPov().pitch,
          zoom: panorama.getZoom(),
        };
        onPositionChange?.(newPosition);
      }
    };

    panorama.addListener('pov_changed', handlePovChange);
    panorama.addListener('position_changed', handlePositionChange);

    return () => {
      google.maps.event.clearListeners(panorama, 'pov_changed');
      google.maps.event.clearListeners(panorama, 'position_changed');
    };
  }, [panorama, google, onPovChange, onPositionChange]);

  // Handle click-to-move functionality
  const handlePanoramaClick = useCallback((event: google.maps.MouseEvent) => {
    if (!enableClickToMove || !panorama) return;

    const clickPoint = event.pixel;
    setClickPosition({ x: clickPoint.x, y: clickPoint.y });

    // Check if click is on an overlay
    const clickedOverlay = overlays.find(overlay => {
      const overlayElement = document.getElementById(`overlay-${overlay.id}`);
      if (overlayElement) {
        const rect = overlayElement.getBoundingClientRect();
        return (
          clickPoint.x >= rect.left &&
          clickPoint.x <= rect.right &&
          clickPoint.y >= rect.top &&
          clickPoint.y <= rect.bottom
        );
      }
      return false;
    });

    if (clickedOverlay) {
      onOverlayClick?.(clickedOverlay);
    } else {
      // Move to clicked position
      panorama.setPosition(event.latLng);
    }

    // Clear click position after animation
    setTimeout(() => setClickPosition(null), 500);
  }, [enableClickToMove, panorama, overlays, onOverlayClick]);

  // Setup click handler
  useEffect(() => {
    if (!panorama || !enableClickToMove) return;

    panorama.addListener('click', handlePanoramaClick);

    return () => {
      google.maps.event.clearListeners(panorama, 'click');
    };
  }, [panorama, google, handlePanoramaClick, enableClickToMove]);

  // Handle time travel
  const handleTimeTravel = useCallback((date: Date) => {
    if (!panorama) return;

    setIsLoading(true);
    setSelectedHistoricalDate(date);

    // Note: Google Maps API doesn't directly support historical street view
    // This is a placeholder for future implementation
    // In a real implementation, you would need to use the Google Street View Image API
    // with historical imagery support

    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, [panorama]);

  // Render overlays
  const renderOverlays = useCallback(() => {
    if (!showOverlays || !overlayContainerRef.current) return;

    // Clear existing overlays
    overlayContainerRef.current.innerHTML = '';

    overlays.forEach(overlay => {
      const overlayElement = document.createElement('div');
      overlayElement.id = `overlay-${overlay.id}`;
      overlayElement.className = `absolute cursor-pointer transition-all duration-200 hover:scale-110 ${overlay.className || ''}`;

      // Calculate position based on POV and overlay position
      const pov = panorama.getPov();
      const overlayPosition = calculateOverlayPosition(overlay.position, pov);

      overlayElement.style.left = `${overlayPosition.x}%`;
      overlayElement.style.top = `${overlayPosition.y}%`;
      overlayElement.style.transform = 'translate(-50%, -50%)';

      // Set content based on overlay type
      switch (overlay.type) {
        case 'marker':
          overlayElement.innerHTML = `
            <div class="bg-red-500 rounded-full w-8 h-8 flex items-center justify-center shadow-lg">
              ${overlay.icon || '<div class="w-2 h-2 bg-white rounded-full"></div>'}
            </div>
          `;
          break;
        case 'info':
          overlayElement.innerHTML = `
            <div class="bg-blue-500 text-white px-3 py-2 rounded-lg shadow-lg max-w-xs">
              <div class="text-sm font-medium">${overlay.content || 'Info'}</div>
            </div>
          `;
          break;
        case 'poi':
          overlayElement.innerHTML = `
            <div class="bg-green-500 text-white px-3 py-2 rounded-lg shadow-lg max-w-xs">
              <div class="text-sm font-medium">${overlay.content || 'Point of Interest'}</div>
            </div>
          `;
          break;
        case 'custom':
          overlayElement.innerHTML = overlay.content || '';
          break;
      }

      overlayElement.onclick = () => onOverlayClick?.(overlay);
      overlayContainerRef.current.appendChild(overlayElement);
    });

    setActiveOverlays(overlays);
  }, [overlays, showOverlays, panorama, onOverlayClick]);

  // Calculate overlay position based on POV
  const calculateOverlayPosition = (
    overlayPos: StreetViewPosition,
    pov: google.maps.StreetViewPov
  ): { x: number; y: number } => {
    // This is a simplified calculation - in reality you'd need more complex
    // spherical coordinate transformations
    const headingDiff = (overlayPos.heading || 0) - pov.heading;
    const pitchDiff = (overlayPos.pitch || 0) - pov.pitch;

    // Convert to screen coordinates (simplified)
    const x = 50 + (headingDiff / 360) * 100;
    const y = 50 - (pitchDiff / 180) * 100;

    return {
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y)),
    };
  };

  // Update overlays when POV changes
  useEffect(() => {
    renderOverlays();
  }, [renderOverlays]);

  // Performance optimization
  useEffect(() => {
    if (!panorama) return;

    // Apply performance settings
    if (performanceOptions.enableWebGL) {
      // Enable WebGL rendering (if available)
      try {
        (panorama as any).setOptions({
          mode: 'webgl',
        });
      } catch (error) {
        console.warn('WebGL not available, falling back to HTML5');
      }
    }

    // Set quality based on performance options
    switch (performanceOptions.quality) {
      case 'low':
        (panorama as any).setOptions({
          zoomControlOptions: { position: google.maps.ControlPosition.TOP_LEFT },
        });
        break;
      case 'high':
        (panorama as any).setOptions({
          imageDateControl: true,
        });
        break;
      case 'auto':
      default:
        // Let the API decide based on device capabilities
        break;
    }
  }, [panorama, performanceOptions, google]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full overflow-hidden ${className}`}
      style={style}
    >
      {/* Loading Overlay */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="bg-white rounded-lg p-4 flex flex-col items-center gap-3">
              <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
              <span className="text-sm text-gray-700">Loading street view...</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Click Indicator */}
      <AnimatePresence>
        {clickPosition && (
          <motion.div
            className="absolute w-8 h-8 border-2 border-white rounded-full pointer-events-none z-40"
            style={{
              left: clickPosition.x - 16,
              top: clickPosition.y - 16,
            }}
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: 2, opacity: 0 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.5 }}
          />
        )}
      </AnimatePresence>

      {/* Overlay Container */}
      {showOverlays && (
        <div
          ref={overlayContainerRef}
          className="absolute inset-0 pointer-events-none z-30"
        />
      )}

      {/* Time Travel Panel */}
      {showTimeTravel && timeTravelOptions.showHistoricalImages && (
        <motion.div
          className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-4 z-20"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="w-5 h-5 text-gray-700" />
            <span className="font-medium text-gray-900">Time Travel</span>
          </div>

          {timeTravelOptions.availableDates && timeTravelOptions.availableDates.length > 0 ? (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {timeTravelOptions.availableDates.map((date, index) => (
                <button
                  key={index}
                  onClick={() => handleTimeTravel(date)}
                  className={`w-full text-left px-3 py-2 rounded transition-colors ${
                    selectedHistoricalDate?.getTime() === date.getTime()
                      ? 'bg-blue-100 text-blue-700'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <div className="text-sm font-medium">
                    {date.toLocaleDateString()}
                  </div>
                  <div className="text-xs text-gray-500">
                    {date.getFullYear()}
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-sm text-gray-500 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              No historical imagery available
            </div>
          )}

          <button
            onClick={() => setShowTimeTravelPanel(false)}
            className="w-full mt-3 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded transition-colors text-sm text-gray-700"
          >
            Close
          </button>
        </motion.div>
      )}

      {/* Info Panel */}
      {showInfo && pano && (
        <motion.div
          className="absolute bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 z-20 max-w-xs"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
        >
          <div className="space-y-2">
            {pano.description && (
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {pano.description}
                  </div>
                  {pano.location.address && (
                    <div className="text-xs text-gray-500">
                      {pano.location.address}
                    </div>
                  )}
                </div>
              </div>
            )}

            {pano.imageDate && (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-500" />
                <div className="text-sm text-gray-600">
                  Image captured: {new Date(pano.imageDate).toLocaleDateString()}
                </div>
              </div>
            )}

            {pano.copyright && (
              <div className="text-xs text-gray-500 border-t pt-2">
                © {pano.copyright}
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Time Travel Toggle Button */}
      {showTimeTravel && timeTravelOptions.showHistoricalImages && (
        <button
          onClick={() => setShowTimeTravelPanel(!showTimeTravelPanel)}
          className="absolute top-4 left-4 bg-white rounded-full p-3 shadow-lg hover:bg-gray-100 transition-colors z-20"
        >
          <Calendar className="w-5 h-5 text-gray-700" />
        </button>
      )}

      {/* Camera Info */}
      {showInfo && (
        <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white px-3 py-2 rounded-lg z-20">
          <div className="text-xs space-y-1">
            <div>Heading: {Math.round(position.heading || 0)}°</div>
            <div>Pitch: {Math.round(position.pitch || 0)}°</div>
            <div>Zoom: {Math.round((position.zoom || 1) * 100)}%</div>
          </div>
        </div>
      )}
    </div>
  );
};