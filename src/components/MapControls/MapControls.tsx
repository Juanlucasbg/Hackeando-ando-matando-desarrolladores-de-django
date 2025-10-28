import React, { useState, useCallback, useRef, useEffect } from 'react';
import { MapControlsProps } from '../../types';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  MapPin,
  Layers,
  Navigation,
  Eye,
  EyeOff,
  RotateCw,
  Home,
  Map,
  Satellite,
  Mountain,
  MapIcon,
} from 'lucide-react';
import clsx from 'clsx';

const MapControls: React.FC<MapControlsProps> = ({
  map,
  zoom,
  mapTypeId,
  onZoomIn,
  onZoomOut,
  onMapTypeChange,
  onFullscreenToggle,
  onStreetViewToggle,
  streetViewVisible,
  className,
}) => {
  const [isMapTypeOpen, setIsMapTypeOpen] = useState(false);
  const [compassRotation, setCompassRotation] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentMapTypeId, setCurrentMapTypeId] = useState(mapTypeId);

  const mapTypeRef = useRef<HTMLDivElement>(null);
  const compassRef = useRef<HTMLDivElement>(null);

  const mapTypes = [
    { id: 'roadmap', name: 'Roadmap', icon: Map },
    { id: 'satellite', name: 'Satellite', icon: Satellite },
    { id: 'hybrid', name: 'Hybrid', icon: Layers },
    { id: 'terrain', name: 'Terrain', icon: Mountain },
  ];

  useEffect(() => {
    setCurrentMapTypeId(mapTypeId);
  }, [mapTypeId]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  useEffect(() => {
    // Update compass rotation based on map heading
    if (map) {
      const updateCompass = () => {
        const heading = map.getHeading() || 0;
        setCompassRotation(heading);
      };

      map.addListener('heading_changed', updateCompass);
      updateCompass();
    }
  }, [map]);

  // Close map type dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (mapTypeRef.current && !mapTypeRef.current.contains(event.target as Node)) {
        setIsMapTypeOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleMapTypeSelect = useCallback(
    (typeId: string) => {
      setCurrentMapTypeId(typeId);
      onMapTypeChange(typeId);
      setIsMapTypeOpen(false);
    },
    [onMapTypeChange]
  );

  const handleZoomInClick = useCallback(() => {
    onZoomIn();
  }, [onZoomIn]);

  const handleZoomOutClick = useCallback(() => {
    onZoomOut();
  }, [onZoomOut]);

  const handleFullscreenClick = useCallback(() => {
    onFullscreenToggle();
  }, [onFullscreenToggle]);

  const handleStreetViewToggle = useCallback(() => {
    onStreetViewToggle();
  }, [onStreetViewToggle]);

  const handleCompassClick = useCallback(() => {
    if (map) {
      map.setHeading(0); // Reset heading to north
      map.setTilt(0); // Reset tilt to top-down view
      setCompassRotation(0);
    }
  }, [map]);

  const handleHomeClick = useCallback(() => {
    if (map) {
      // Reset to default view
      map.setCenter({ lat: 40.7128, lng: -74.0060 }); // New York
      map.setZoom(12);
      map.setHeading(0);
      map.setTilt(0);
      setCompassRotation(0);
    }
  }, [map]);

  const handleMapTypeToggle = useCallback(() => {
    setIsMapTypeOpen(!isMapTypeOpen);
  }, [isMapTypeOpen]);

  const getCurrentMapTypeIcon = () => {
    const currentType = mapTypes.find((type) => type.id === currentMapTypeId);
    return currentType ? currentType.icon : Map;
  };

  const getCurrentMapTypeName = () => {
    const currentType = mapTypes.find((type) => type.id === currentMapTypeId);
    return currentType ? currentType.name : 'Roadmap';
  };

  return (
    <div className={clsx('map-controls', className)}>
      {/* Zoom Controls */}
      <div className="flex flex-col gap-1">
        <button
          onClick={handleZoomInClick}
          className="control-button"
          title="Zoom in"
          aria-label="Zoom in"
        >
          <ZoomIn className="w-5 h-5" />
        </button>
        <div className="bg-white rounded-lg shadow-md border border-gray-200 px-3 py-1 text-center">
          <span className="text-sm font-medium text-gray-700">{zoom}</span>
        </div>
        <button
          onClick={handleZoomOutClick}
          className="control-button"
          title="Zoom out"
          aria-label="Zoom out"
        >
          <ZoomOut className="w-5 h-5" />
        </button>
      </div>

      {/* Map Type Selector */}
      <div className="relative" ref={mapTypeRef}>
        <button
          onClick={handleMapTypeToggle}
          className={clsx('control-button', isMapTypeOpen && 'active')}
          title={`Map type: ${getCurrentMapTypeName()}`}
          aria-label={`Map type: ${getCurrentMapTypeName()}`}
          aria-expanded={isMapTypeOpen}
          aria-haspopup="true"
        >
          {React.createElement(getCurrentMapTypeIcon(), { className: 'w-5 h-5' })}
        </button>

        {isMapTypeOpen && (
          <div className="map-type-selector absolute top-full right-0 mt-1 min-w-[120px] z-50">
            {mapTypes.map((type) => {
              const IconComponent = type.icon;
              return (
                <button
                  key={type.id}
                  onClick={() => handleMapTypeSelect(type.id)}
                  className={clsx(
                    'map-type-option flex items-center gap-2 w-full',
                    currentMapTypeId === type.id && 'active'
                  )}
                  title={type.name}
                >
                  <IconComponent className="w-4 h-4" />
                  <span>{type.name}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Compass Control */}
      <button
        onClick={handleCompassClick}
        className="compass-control"
        title="Reset heading to north"
        aria-label="Reset heading to north"
        ref={compassRef}
      >
        <div
          className="compass-needle"
          style={{
            transform: `rotate(${-compassRotation}deg)`,
          }}
        >
          <Navigation className="w-5 h-5" />
        </div>
      </button>

      {/* Home Button */}
      <button
        onClick={handleHomeClick}
        className="control-button"
        title="Return to default view"
        aria-label="Return to default view"
      >
        <Home className="w-5 h-5" />
      </button>

      {/* Street View Toggle */}
      <button
        onClick={handleStreetViewToggle}
        className={clsx('street-view-toggle', streetViewVisible && 'active')}
        title={streetViewVisible ? 'Exit Street View' : 'Enter Street View'}
        aria-label={streetViewVisible ? 'Exit Street View' : 'Enter Street View'}
      >
        {streetViewVisible ? (
          <EyeOff className="w-4 h-4" />
        ) : (
          <Eye className="w-4 h-4" />
        )}
        <span className="ml-2 text-sm">
          {streetViewVisible ? 'Exit' : 'Street View'}
        </span>
      </button>

      {/* Fullscreen Toggle */}
      <button
        onClick={handleFullscreenClick}
        className="fullscreen-button"
        title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
        aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
      >
        {isFullscreen ? (
          <Minimize2 className="w-5 h-5" />
        ) : (
          <Maximize2 className="w-5 h-5" />
        )}
      </button>

      {/* Location Button (for future use) */}
      <button
        className="control-button"
        title="Center on your location"
        aria-label="Center on your location"
        onClick={() => {
          // This would trigger geolocation functionality
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
              (position) => {
                if (map) {
                  map.setCenter({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                  });
                  map.setZoom(15);
                }
              },
              (error) => {
                console.error('Geolocation error:', error);
              }
            );
          }
        }}
      >
        <MapPin className="w-5 h-5" />
      </button>
    </div>
  );
};

export { MapControls };