import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, AlertCircle, X, Maximize2, Minimize2, MapPin } from 'lucide-react';

import {
  StreetViewOptions,
  StreetViewPosition,
  StreetViewState,
  StreetViewError,
  StreetViewEventHandlers,
  StreetViewPano,
  StreetViewLink,
} from '../../types/streetview.types';
import { StreetViewControls } from './StreetViewControls';
import { StreetViewInfo } from './StreetViewInfo';
import { StreetViewErrorDisplay } from './StreetViewErrorDisplay';
import { StreetViewLoading } from './StreetViewLoading';
import { useStreetViewKeyboard } from '../../hooks/useStreetViewKeyboard';
import { useStreetViewPerformance } from '../../hooks/useStreetViewPerformance';

interface StreetViewProps {
  google: typeof google;
  options?: StreetViewOptions;
  eventHandlers?: StreetViewEventHandlers;
  className?: string;
  style?: React.CSSProperties;
  showControls?: boolean;
  showInfoPanel?: boolean;
  enableKeyboardNavigation?: boolean;
  onError?: (error: StreetViewError) => void;
  onPositionChange?: (position: StreetViewPosition) => void;
  onPovChange?: (pov: google.maps.StreetViewPov) => void;
  onVisibilityChange?: (visible: boolean) => void;
}

export const StreetView: React.FC<StreetViewProps> = ({
  google,
  options = {},
  eventHandlers = {},
  className = '',
  style = {},
  showControls = true,
  showInfoPanel = true,
  enableKeyboardNavigation = true,
  onError,
  onPositionChange,
  onPovChange,
  onVisibilityChange,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const panoramaRef = useRef<google.maps.StreetViewPanorama | null>(null);
  const serviceRef = useRef<google.maps.StreetViewService | null>(null);

  const [state, setState] = useState<StreetViewState>({
    isVisible: true,
    isLoading: true,
    hasError: false,
    currentPosition: null,
    currentPano: null,
    history: [],
    historyIndex: -1,
    isFullscreen: false,
    showControls: true,
    measurementMode: false,
    measurementPoints: [],
    isMoving: false,
    isTransitioning: false,
  });

  const [error, setError] = useState<StreetViewError | null>(null);

  // Performance optimization hooks
  const { optimizeForPerformance } = useStreetViewPerformance();
  const { enableKeyboard, disableKeyboard } = useStreetViewKeyboard({
    enabled: enableKeyboardNavigation,
    onMove: handleKeyboardNavigation,
    onZoom: handleKeyboardZoom,
    onRotate: handleKeyboardRotate,
    onExit: handleExit,
  });

  // Initialize Street View service
  useEffect(() => {
    if (!google || !containerRef.current) return;

    try {
      serviceRef.current = new google.maps.StreetViewService();

      const panoramaOptions: google.maps.StreetViewPanoramaOptions = {
        ...options,
        addressControl: false, // We'll use custom controls
        panControl: false,     // We'll use custom controls
        zoomControl: false,    // We'll use custom controls
        linksControl: false,   // We'll use custom links
        clickToGo: true,
        scrollwheel: true,
        disableDefaultUI: true,
        enableCloseButton: false,
        fullscreenControl: false,
        motionTrackingControl: false,
      };

      panoramaRef.current = new google.maps.StreetViewPanorama(
        containerRef.current,
        panoramaOptions
      );

      setupEventListeners();

    } catch (err) {
      handleError({
        code: 'INITIALIZATION_ERROR',
        message: 'Failed to initialize Street View',
        details: err,
        timestamp: Date.now(),
      });
    }
  }, [google]);

  // Setup event listeners
  const setupEventListeners = useCallback(() => {
    if (!panoramaRef.current) return;

    const panorama = panoramaRef.current;

    panorama.addListener('pano_changed', () => {
      const panoId = panorama.getPano();
      handlePanoChange(panoId);
    });

    panorama.addListener('position_changed', () => {
      const position = panorama.getPosition();
      if (position) {
        const newPosition: StreetViewPosition = {
          lat: position.lat(),
          lng: position.lng(),
          heading: panorama.getPov().heading,
          pitch: panorama.getPov().pitch,
          zoom: panorama.getZoom(),
        };
        handlePositionChange(newPosition);
      }
    });

    panorama.addListener('pov_changed', () => {
      const pov = panorama.getPov();
      handlePovChange(pov);
    });

    panorama.addListener('zoom_changed', () => {
      const zoom = panorama.getZoom();
      handleZoomChange(zoom);
    });

    panorama.addListener('links_changed', () => {
      const links = panorama.getLinks();
      handleLinksChange(links || []);
    });

    panorama.addListener('visible_changed', () => {
      const visible = panorama.getVisible();
      handleVisibilityChange(visible);
    });
  }, []);

  // Event handlers
  const handlePanoChange = useCallback((panoId: string) => {
    eventHandlers.onPanoChanged?.(panoId);

    if (panoramaRef.current) {
      const location = panoramaRef.current.getLocation();
      if (location) {
        const newPano: StreetViewPano = {
          id: panoId,
          location: {
            lat: location.latLng.lat(),
            lng: location.latLng.lng(),
            address: location.description,
            placeId: location.pano,
            name: location.shortDescription,
          },
          heading: panoramaRef.current.getPov().heading,
          pitch: panoramaRef.current.getPov().pitch,
          zoom: panoramaRef.current.getZoom(),
          description: location.description,
          copyright: location.copyright,
          imageDate: location.imageDate,
          links: (panoramaRef.current.getLinks() || []).map(link => ({
            heading: link.heading,
            description: link.description,
            pano: link.pano,
            roadColor: link.roadColor,
            roadOpacity: link.roadOpacity,
          })),
        };

        setState(prev => ({
          ...prev,
          currentPano: newPano,
          isTransitioning: false,
        }));
      }
    }
  }, [eventHandlers]);

  const handlePositionChange = useCallback((position: StreetViewPosition) => {
    eventHandlers.onPositionChanged?.(position);
    onPositionChange?.(position);

    setState(prev => {
      const newHistory = [...prev.history.slice(0, prev.historyIndex + 1), position];
      return {
        ...prev,
        currentPosition: position,
        history: newHistory,
        historyIndex: newHistory.length - 1,
      };
    });
  }, [eventHandlers, onPositionChange]);

  const handlePovChange = useCallback((pov: google.maps.StreetViewPov) => {
    eventHandlers.onPovChanged?.(pov);
    onPovChange?.(pov);

    setState(prev => ({
      ...prev,
      currentPosition: prev.currentPosition ? {
        ...prev.currentPosition,
        heading: pov.heading,
        pitch: pov.pitch,
      } : null,
    }));
  }, [eventHandlers, onPovChange]);

  const handleZoomChange = useCallback((zoom: number) => {
    eventHandlers.onZoomChanged?.(zoom);

    setState(prev => ({
      ...prev,
      currentPosition: prev.currentPosition ? {
        ...prev.currentPosition,
        zoom,
      } : null,
    }));
  }, [eventHandlers]);

  const handleLinksChange = useCallback((links: StreetViewLink[]) => {
    eventHandlers.onLinksChanged?.(links);
  }, [eventHandlers]);

  const handleVisibilityChange = useCallback((visible: boolean) => {
    eventHandlers.onVisibleChanged?.(visible);
    onVisibilityChange?.(visible);

    setState(prev => ({
      ...prev,
      isVisible: visible,
    }));
  }, [eventHandlers, onVisibilityChange]);

  // Keyboard navigation handlers
  const handleKeyboardNavigation = useCallback((direction: 'forward' | 'backward') => {
    if (direction === 'forward') {
      moveForward();
    } else {
      moveBackward();
    }
  }, []);

  const handleKeyboardZoom = useCallback((direction: 'in' | 'out') => {
    if (direction === 'in') {
      zoomIn();
    } else {
      zoomOut();
    }
  }, []);

  const handleKeyboardRotate = useCallback((direction: 'left' | 'right') => {
    if (direction === 'left') {
      turnLeft();
    } else {
      turnRight();
    }
  }, []);

  const handleExit = useCallback(() => {
    hideStreetView();
  }, []);

  // Navigation methods
  const setPosition = useCallback((position: StreetViewPosition, options?: { animate?: boolean }) => {
    if (!panoramaRef.current) return;

    setState(prev => ({ ...prev, isMoving: true, isTransitioning: true }));

    if (options?.animate) {
      panoramaRef.current.setPosition(
        new google.maps.LatLng(position.lat, position.lng)
      );
      panoramaRef.current.setPov({
        heading: position.heading || 0,
        pitch: position.pitch || 0,
      });
      if (position.zoom !== undefined) {
        panoramaRef.current.setZoom(position.zoom);
      }
    } else {
      panoramaRef.current.setPosition(
        new google.maps.LatLng(position.lat, position.lng)
      );
    }
  }, []);

  const moveForward = useCallback(() => {
    if (!panoramaRef.current) return;

    const pov = panoramaRef.current.getPov();
    const newHeading = pov.heading;
    const distance = 10; // meters

    const currentPos = panoramaRef.current.getPosition();
    if (currentPos) {
      const lat = currentPos.lat();
      const lng = currentPos.lng();

      // Calculate new position based on heading
      const newLat = lat + (distance * Math.cos(newHeading * Math.PI / 180)) / 111320;
      const newLng = lng + (distance * Math.sin(newHeading * Math.PI / 180)) / (111320 * Math.cos(lat * Math.PI / 180));

      setPosition({
        lat: newLat,
        lng: newLng,
        heading: newHeading,
        pitch: pov.pitch,
        zoom: panoramaRef.current.getZoom(),
      });
    }
  }, []);

  const moveBackward = useCallback(() => {
    if (!panoramaRef.current) return;

    const pov = panoramaRef.current.getPov();
    const newHeading = (pov.heading + 180) % 360;

    moveForward();
    // The forward movement will automatically adjust based on the new heading
  }, [moveForward]);

  const turnLeft = useCallback(() => {
    if (!panoramaRef.current) return;

    const pov = panoramaRef.current.getPov();
    panoramaRef.current.setPov({
      heading: (pov.heading - 30 + 360) % 360,
      pitch: pov.pitch,
    });
  }, []);

  const turnRight = useCallback(() => {
    if (!panoramaRef.current) return;

    const pov = panoramaRef.current.getPov();
    panoramaRef.current.setPov({
      heading: (pov.heading + 30) % 360,
      pitch: pov.pitch,
    });
  }, []);

  const zoomIn = useCallback(() => {
    if (!panoramaRef.current) return;

    const currentZoom = panoramaRef.current.getZoom();
    panoramaRef.current.setZoom(Math.min(currentZoom + 1, 5));
  }, []);

  const zoomOut = useCallback(() => {
    if (!panoramaRef.current) return;

    const currentZoom = panoramaRef.current.getZoom();
    panoramaRef.current.setZoom(Math.max(currentZoom - 1, 0));
  }, []);

  const toggleFullscreen = useCallback(() => {
    setState(prev => ({ ...prev, isFullscreen: !prev.isFullscreen }));

    if (!document.fullscreenElement && containerRef.current) {
      containerRef.current.requestFullscreen();
    } else if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  }, []);

  const toggleControls = useCallback(() => {
    setState(prev => ({ ...prev, showControls: !prev.showControls }));
  }, []);

  const hideStreetView = useCallback(() => {
    if (panoramaRef.current) {
      panoramaRef.current.setVisible(false);
    }
    setState(prev => ({ ...prev, isVisible: false }));
  }, []);

  // Error handling
  const handleError = useCallback((error: StreetViewError) => {
    setState(prev => ({
      ...prev,
      hasError: true,
      isLoading: false,
    }));
    setError(error);
    onError?.(error);
    eventHandlers.onError?.(error);
  }, [onError, eventHandlers]);

  const clearError = useCallback(() => {
    setState(prev => ({
      ...prev,
      hasError: false,
    }));
    setError(null);
  }, []);

  // Check Street View availability
  const checkStreetViewAvailability = useCallback((position: StreetViewPosition): Promise<boolean> => {
    return new Promise((resolve) => {
      if (!serviceRef.current) {
        resolve(false);
        return;
      }

      serviceRef.current.getPanorama(
        {
          location: new google.maps.LatLng(position.lat, position.lng),
          radius: 50,
        },
        (result, status) => {
          resolve(status === google.maps.StreetViewStatus.OK);
        }
      );
    });
  }, []);

  // Performance optimization
  useEffect(() => {
    if (panoramaRef.current) {
      optimizeForPerformance(panoramaRef.current);
    }
  }, [optimizeForPerformance]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (enableKeyboardNavigation) {
        disableKeyboard();
      }
    };
  }, [enableKeyboardNavigation, disableKeyboard]);

  return (
    <motion.div
      ref={containerRef}
      className={`relative w-full h-full overflow-hidden ${className}`}
      style={style}
      initial={{ opacity: 0 }}
      animate={{ opacity: state.isVisible ? 1 : 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Loading State */}
      <AnimatePresence>
        {state.isLoading && (
          <StreetViewLoading />
        )}
      </AnimatePresence>

      {/* Error State */}
      <AnimatePresence>
        {state.hasError && error && (
          <StreetViewErrorDisplay
            error={error}
            onRetry={() => clearError()}
            onClose={() => clearError()}
          />
        )}
      </AnimatePresence>

      {/* Street View Controls */}
      {showControls && state.showControls && !state.isLoading && !state.hasError && (
        <StreetViewControls
          onMoveForward={moveForward}
          onMoveBackward={moveBackward}
          onTurnLeft={turnLeft}
          onTurnRight={turnRight}
          onZoomIn={zoomIn}
          onZoomOut={zoomOut}
          onToggleFullscreen={toggleFullscreen}
          onToggleControls={toggleControls}
          onExit={hideStreetView}
          isFullscreen={state.isFullscreen}
          currentZoom={state.currentPosition?.zoom || 1}
          className="absolute bottom-4 left-4 z-10"
        />
      )}

      {/* Info Panel */}
      {showInfoPanel && state.currentPano && !state.isLoading && !state.hasError && (
        <StreetViewInfo
          pano={state.currentPano}
          position={state.currentPosition}
          onClose={() => setState(prev => ({ ...prev, showInfoPanel: false }))}
          className="absolute top-4 right-4 z-10"
        />
      )}

      {/* Measurement Mode Indicator */}
      {state.measurementMode && (
        <div className="absolute top-4 left-4 z-10 bg-blue-500 text-white px-3 py-2 rounded-lg shadow-lg flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          <span className="text-sm font-medium">Measurement Mode</span>
        </div>
      )}

      {/* Exit Button */}
      {!state.isLoading && !state.hasError && (
        <button
          onClick={hideStreetView}
          className="absolute top-4 left-4 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5 text-gray-700" />
        </button>
      )}

      {/* Fullscreen Button */}
      {!state.isLoading && !state.hasError && (
        <button
          onClick={toggleFullscreen}
          className="absolute top-4 right-4 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors"
        >
          {state.isFullscreen ? (
            <Minimize2 className="w-5 h-5 text-gray-700" />
          ) : (
            <Maximize2 className="w-5 h-5 text-gray-700" />
          )}
        </button>
      )}

      {/* Movement Indicator */}
      {state.isMoving && (
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-10">
          <Loader2 className="w-6 h-6 text-white animate-spin" />
        </div>
      )}
    </motion.div>
  );
};