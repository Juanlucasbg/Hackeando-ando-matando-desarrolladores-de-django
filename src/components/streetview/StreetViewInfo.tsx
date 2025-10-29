import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Calendar, Camera, Share2, Link, Navigation, Clock, Info } from 'lucide-react';

import { StreetViewPano, StreetViewPosition } from '../../types/streetview.types';
import { StreetViewShare } from './StreetViewShare';

interface StreetViewInfoProps {
  pano: StreetViewPano;
  position: StreetViewPosition;
  onClose?: () => void;
  className?: string;
  showCloseButton?: boolean;
  showShareButton?: boolean;
  showCoordinates?: boolean;
  showAddress?: boolean;
  showDate?: boolean;
}

export const StreetViewInfo: React.FC<StreetViewInfoProps> = {
  pano,
  position,
  onClose,
  className = '',
  showCloseButton = true,
  showShareButton = true,
  showCoordinates = true,
  showAddress = true,
  showDate = true,
}) => {
  const [showSharePanel, setShowSharePanel] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const formatCoordinates = (lat: number, lng: number): string => {
    const latDir = lat >= 0 ? 'N' : 'S';
    const lngDir = lng >= 0 ? 'E' : 'W';

    const latAbs = Math.abs(lat);
    const lngAbs = Math.abs(lng);

    const latDeg = Math.floor(latAbs);
    const latMin = Math.floor((latAbs - latDeg) * 60);
    const latSec = ((latAbs - latDeg) * 60 - latMin) * 60;

    const lngDeg = Math.floor(lngAbs);
    const lngMin = Math.floor((lngAbs - lngDeg) * 60);
    const lngSec = ((lngAbs - lngDeg) * 60 - lngMin) * 60;

    return `${latDeg}°${latMin}'${latSec.toFixed(1)}"${latDir} ${lngDeg}°${lngMin}'${lngSec.toFixed(1)}"${lngDir}`;
  };

  const getCardinalDirection = (heading: number): string => {
    const normalizedAngle = ((heading % 360) + 360) % 360;

    if (normalizedAngle >= 337.5 || normalizedAngle < 22.5) return 'North';
    if (normalizedAngle >= 22.5 && normalizedAngle < 67.5) return 'Northeast';
    if (normalizedAngle >= 67.5 && normalizedAngle < 112.5) return 'East';
    if (normalizedAngle >= 112.5 && normalizedAngle < 157.5) return 'Southeast';
    if (normalizedAngle >= 157.5 && normalizedAngle < 202.5) return 'South';
    if (normalizedAngle >= 202.5 && normalizedAngle < 247.5) return 'Southwest';
    if (normalizedAngle >= 247.5 && normalizedAngle < 292.5) return 'West';
    return 'Northwest';
  };

  const handleShare = () => {
    setShowSharePanel(!showSharePanel);
  };

  return (
    <>
      <motion.div
        className={`bg-white rounded-lg shadow-lg overflow-hidden ${className} ${
          isExpanded ? 'max-w-sm' : 'max-w-xs'
        }`}
        initial={{ opacity: 0, scale: 0.9, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: -10 }}
        transition={{ duration: 0.2 }}
      >
        {/* Header */}
        <div className="relative bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              <h3 className="font-semibold">Location Info</h3>
            </div>

            <div className="flex items-center gap-1">
              {showShareButton && (
                <button
                  onClick={handleShare}
                  className="p-1 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
                  title="Share this location"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              )}

              {showCloseButton && onClose && (
                <button
                  onClick={onClose}
                  className="p-1 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
                  title="Close info panel"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          {/* Location Name */}
          {pano.description && (
            <div>
              <h4 className="font-medium text-gray-900 text-lg">{pano.description}</h4>
              {pano.location.name && pano.location.name !== pano.description && (
                <p className="text-sm text-gray-600">{pano.location.name}</p>
              )}
            </div>
          )}

          {/* Address */}
          {showAddress && pano.location.address && (
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-gray-700">{pano.location.address}</p>
              </div>
            </div>
          )}

          {/* Coordinates */}
          {showCoordinates && pano.location && (
            <div className="flex items-start gap-2">
              <Navigation className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                <div>
                  <span className="text-xs text-gray-500">Decimal:</span>
                  <p className="text-sm text-gray-700 font-mono">
                    {pano.location.lat.toFixed(6)}, {pano.location.lng.toFixed(6)}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-gray-500">DMS:</span>
                  <p className="text-xs text-gray-600 font-mono">
                    {formatCoordinates(pano.location.lat, pano.location.lng)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* POV Information */}
          <div className="flex items-start gap-2">
            <Camera className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Direction:</span>
                <span className="text-sm text-gray-700">
                  {getCardinalDirection(position.heading || 0)}
                </span>
                <span className="text-xs text-gray-500">
                  ({Math.round(position.heading || 0)}°)
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Pitch:</span>
                <span className="text-sm text-gray-700">
                  {Math.round(position.pitch || 0)}°
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Zoom:</span>
                <span className="text-sm text-gray-700">
                  {Math.round((position.zoom || 1) * 100)}%
                </span>
              </div>
            </div>
          </div>

          {/* Date Information */}
          {showDate && (
            <div className="flex items-start gap-2">
              <Calendar className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <span className="text-xs text-gray-500">Image Date:</span>
                {pano.imageDate ? (
                  <p className="text-sm text-gray-700">
                    {new Date(pano.imageDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                ) : (
                  <p className="text-sm text-gray-500">Unknown</p>
                )}
              </div>
            </div>
          )}

          {/* Links */}
          {pano.links && pano.links.length > 0 && (
            <div className="flex items-start gap-2">
              <Link className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <span className="text-xs text-gray-500">Available Paths:</span>
                <p className="text-sm text-gray-700">
                  {pano.links.length} connection{pano.links.length !== 1 ? 's' : ''} available
                </p>
              </div>
            </div>
          )}

          {/* Expand/Collapse Button */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full text-center text-sm text-blue-600 hover:text-blue-700 transition-colors"
          >
            {isExpanded ? 'Show Less' : 'Show More'}
          </button>

          {/* Additional Information (when expanded) */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                className="space-y-3 border-t pt-3"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {/* Pano ID */}
                <div>
                  <span className="text-xs text-gray-500">Panorama ID:</span>
                  <p className="text-xs text-gray-600 font-mono break-all">{pano.id}</p>
                </div>

                {/* Copyright */}
                {pano.copyright && (
                  <div>
                    <span className="text-xs text-gray-500">Copyright:</span>
                    <p className="text-xs text-gray-600">{pano.copyright}</p>
                  </div>
                )}

                {/* Technical Info */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-gray-500">Quality:</span>
                    <p className="text-gray-700">High</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Type:</span>
                    <p className="text-gray-700">Street View</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Share Panel */}
      <AnimatePresence>
        {showSharePanel && (
          <StreetViewShare
            position={position}
            pano={pano}
            onClose={() => setShowSharePanel(false)}
            className="absolute right-full mr-2 top-0"
          />
        )}
      </AnimatePresence>
    </>
  );
};