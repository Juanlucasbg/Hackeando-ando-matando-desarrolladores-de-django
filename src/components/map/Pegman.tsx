import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useGoogleMap } from '@react-google-maps/api';

interface PegmanProps {
  onDrop?: (position: google.maps.LatLng) => void;
  className?: string;
  size?: 'small' | 'medium' | 'large';
}

export const Pegman: React.FC<PegmanProps> = ({
  onDrop,
  className = '',
  size = 'medium',
}) => {
  const map = useGoogleMap();
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const pegmanRef = useRef<HTMLDivElement>(null);

  const sizeClasses = {
    small: 'w-8 h-8',
    medium: 'w-12 h-12',
    large: 'w-16 h-16',
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);

    const startX = e.clientX - position.x;
    const startY = e.clientY - position.y;

    const handleMouseMove = (e: MouseEvent) => {
      setPosition({
        x: e.clientX - startX,
        y: e.clientY - startY,
      });
    };

    const handleMouseUp = (e: MouseEvent) => {
      setIsDragging(false);

      if (map && pegmanRef.current) {
        const rect = pegmanRef.current.getBoundingClientRect();
        const mapElement = map.getDiv();
        const mapRect = mapElement.getBoundingClientRect();

        // Check if pegman was dropped over the map
        if (
          e.clientX >= mapRect.left &&
          e.clientX <= mapRect.right &&
          e.clientY >= mapRect.top &&
          e.clientY <= mapRect.bottom
        ) {
          // Convert screen coordinates to map coordinates
          const mapX = e.clientX - mapRect.left;
          const mapY = e.clientY - mapRect.top;

          const latLng = map.getProjection()?.fromPointToLatLng(
            new google.maps.Point(mapX, mapY)
          );

          if (latLng) {
            onDrop?.(latLng);
          }
        }

        // Reset position
        setPosition({ x: 0, y: 0 });
      }

      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  useEffect(() => {
    if (isDragging) {
      document.body.style.cursor = 'grabbing';
      document.body.style.userSelect = 'none';
    } else {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }

    return () => {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDragging]);

  return (
    <motion.div
      ref={pegmanRef}
      className={`relative ${sizeClasses[size]} ${className}`}
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
        cursor: isDragging ? 'grabbing' : 'grab',
        zIndex: isDragging ? 9999 : 1000,
      }}
      onMouseDown={handleMouseDown}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      animate={{
        scale: isDragging ? 1.1 : isHovering ? 1.05 : 1,
        rotate: isDragging ? 5 : 0,
      }}
      transition={{ duration: 0.2 }}
    >
      {/* Pegman SVG */}
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className="w-full h-full text-yellow-400 drop-shadow-lg"
      >
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
        {/* Pegman body */}
        <circle cx="12" cy="8" r="3" fill="#FFD700" stroke="#FFA500" strokeWidth="1"/>
        <path d="M12 11 L10 16 L14 16 Z" fill="#4169E1" stroke="#1E90FF" strokeWidth="1"/>
        <path d="M10 14 L8 18 L12 18 M14 14 L16 18 L12 18" fill="#4169E1" stroke="#1E90FF" strokeWidth="1"/>
        <circle cx="11" cy="7" r="0.5" fill="#000"/>
        <circle cx="13" cy="7" r="0.5" fill="#000"/>
        <path d="M11 9 Q12 9.5 13 9" fill="none" stroke="#000" strokeWidth="0.5" strokeLinecap="round"/>
      </svg>

      {/* Dragging indicator */}
      <AnimatePresence>
        {isDragging && (
          <motion.div
            className="absolute inset-0 border-2 border-blue-400 rounded-full"
            initial={{ scale: 1, opacity: 0.5 }}
            animate={{ scale: 1.2, opacity: 0 }}
            exit={{ scale: 1, opacity: 0 }}
            transition={{ duration: 0.5, repeat: Infinity }}
          />
        )}
      </AnimatePresence>

      {/* Tooltip */}
      <AnimatePresence>
        {isHovering && !isDragging && (
          <motion.div
            className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
          >
            Drag to Street View
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
              <div className="border-4 border-transparent border-t-gray-900"></div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};