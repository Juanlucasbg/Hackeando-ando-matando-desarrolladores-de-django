import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Compass, Navigation } from 'lucide-react';

import { StreetViewPosition } from '../../types/streetview.types';

interface StreetViewCompassProps {
  heading?: number;
  pitch?: number;
  showHeading?: boolean;
  showPitch?: boolean;
  size?: 'small' | 'medium' | 'large';
  className?: string;
  onHeadingChange?: (heading: number) => void;
  interactive?: boolean;
}

export const StreetViewCompass: React.FC<StreetViewCompassProps> = ({
  heading = 0,
  pitch = 0,
  showHeading = true,
  showPitch = false,
  size = 'medium',
  className = '',
  onHeadingChange,
  interactive = false,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [currentHeading, setCurrentHeading] = useState(heading);
  const [dragStartAngle, setDragStartAngle] = useState(0);

  const sizeClasses = {
    small: 'w-12 h-12',
    medium: 'w-16 h-16',
    large: 'w-20 h-20',
  };

  const iconSizes = {
    small: 'w-4 h-4',
    medium: 'w-5 h-5',
    large: 'w-6 h-6',
  };

  useEffect(() => {
    setCurrentHeading(heading);
  }, [heading]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!interactive) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI);
    const normalizedAngle = (angle + 90 + 360) % 360;

    setIsDragging(true);
    setDragStartAngle(normalizedAngle - currentHeading);
    e.preventDefault();
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !interactive) return;

    const compassElement = document.getElementById('streetview-compass');
    if (!compassElement) return;

    const rect = compassElement.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI);
    const normalizedAngle = (angle + 90 + 360) % 360;
    const newHeading = (normalizedAngle - dragStartAngle + 360) % 360;

    setCurrentHeading(newHeading);
    onHeadingChange?.(newHeading);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragStartAngle]);

  const getCardinalDirection = (angle: number): string => {
    const normalizedAngle = ((angle % 360) + 360) % 360;

    if (normalizedAngle >= 337.5 || normalizedAngle < 22.5) return 'N';
    if (normalizedAngle >= 22.5 && normalizedAngle < 67.5) return 'NE';
    if (normalizedAngle >= 67.5 && normalizedAngle < 112.5) return 'E';
    if (normalizedAngle >= 112.5 && normalizedAngle < 157.5) return 'SE';
    if (normalizedAngle >= 157.5 && normalizedAngle < 202.5) return 'S';
    if (normalizedAngle >= 202.5 && normalizedAngle < 247.5) return 'SW';
    if (normalizedAngle >= 247.5 && normalizedAngle < 292.5) return 'W';
    return 'NW';
  };

  return (
    <div className={`relative ${sizeClasses[size]} ${className}`}>
      {/* Compass Background */}
      <motion.div
        id="streetview-compass"
        className={`absolute inset-0 bg-white rounded-full shadow-lg border-2 border-gray-300 flex items-center justify-center ${
          interactive ? 'cursor-pointer' : ''
        }`}
        style={{
          transform: `rotate(${-currentHeading}deg)`,
          transition: isDragging ? 'none' : 'transform 0.3s ease-out',
        }}
        onMouseDown={handleMouseDown}
        whileHover={interactive ? { scale: 1.05 } : {}}
        whileTap={interactive ? { scale: 0.95 } : {}}
      >
        {/* Compass Rose */}
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 100 100"
        >
          {/* Outer circle */}
          <circle
            cx="50"
            cy="50"
            r="48"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            className="text-gray-300"
          />

          {/* Cardinal direction markers */}
          <g className="text-gray-700">
            {/* North */}
            <text x="50" y="15" textAnchor="middle" className="text-xs font-bold fill-current">
              N
            </text>
            <polygon points="50,5 47,12 53,12" className="fill-current text-red-500" />

            {/* East */}
            <text x="85" y="54" textAnchor="middle" className="text-xs fill-current">
              E
            </text>

            {/* South */}
            <text x="50" y="92" textAnchor="middle" className="text-xs fill-current">
              S
            </text>

            {/* West */}
            <text x="15" y="54" textAnchor="middle" className="text-xs fill-current">
              W
            </text>
          </g>

          {/* Intermediate direction markers */}
          <g className="text-gray-400">
            <text x="78" y="25" textAnchor="middle" className="text-xs fill-current">
              NE
            </text>
            <text x="78" y="78" textAnchor="middle" className="text-xs fill-current">
              SE
            </text>
            <text x="22" y="78" textAnchor="middle" className="text-xs fill-current">
              SW
            </text>
            <text x="22" y="25" textAnchor="middle" className="text-xs fill-current">
              NW
            </text>
          </g>

          {/* Degree markings */}
          <g className="text-gray-300">
            {[30, 60, 120, 150, 210, 240, 300, 330].map((degree) => {
              const angle = (degree - 90) * (Math.PI / 180);
              const x1 = 50 + 42 * Math.cos(angle);
              const y1 = 50 + 42 * Math.sin(angle);
              const x2 = 50 + 46 * Math.cos(angle);
              const y2 = 50 + 46 * Math.sin(angle);

              return (
                <line
                  key={degree}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="currentColor"
                  strokeWidth="1"
                />
              );
            })}
          </g>
        </svg>

        {/* Center Pointer */}
        <motion.div
          className="relative z-10"
          animate={{
            rotate: isDragging ? 0 : currentHeading,
          }}
          transition={{
            duration: isDragging ? 0 : 0.3,
            ease: 'easeOut',
          }}
        >
          <Navigation
            className={`${iconSizes[size]} text-red-500 drop-shadow-lg`}
            style={{
              transform: `rotate(${isDragging ? -currentHeading : 0}deg)`,
            }}
          />
        </motion.div>
      </motion.div>

      {/* Direction Indicator */}
      {showHeading && (
        <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs whitespace-nowrap">
          {getCardinalDirection(currentHeading)} {Math.round(currentHeading)}°
        </div>
      )}

      {/* Pitch Indicator */}
      {showPitch && (
        <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs whitespace-nowrap">
          Pitch: {Math.round(pitch)}°
        </div>
      )}

      {/* Interactive hint */}
      {interactive && (
        <div className="absolute -right-2 -top-2 bg-blue-500 rounded-full p-1">
          <Compass className="w-3 h-3 text-white" />
        </div>
      )}
    </div>
  );
};