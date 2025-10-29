import React from 'react';
import { motion } from 'framer-motion';
import { Loader2, MapPin, Camera, Navigation } from 'lucide-react';

interface StreetViewLoadingProps {
  message?: string;
  showProgress?: boolean;
  progress?: number;
  className?: string;
}

export const StreetViewLoading: React.FC<StreetViewLoadingProps> = ({
  message = 'Loading Street View...',
  showProgress = false,
  progress = 0,
  className = '',
}) => {
  return (
    <motion.div
      className={`absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="bg-white rounded-lg p-8 max-w-sm w-full mx-4 shadow-xl"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.2 }}
      >
        {/* Loading Animation */}
        <div className="flex flex-col items-center space-y-4">
          {/* Main Loader */}
          <div className="relative">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            >
              <Navigation className="w-12 h-12 text-blue-500" />
            </motion.div>

            {/* Pulse effect */}
            <motion.div
              className="absolute inset-0 border-2 border-blue-300 rounded-full"
              animate={{ scale: [1, 1.5, 1], opacity: [1, 0, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>

          {/* Loading Text */}
          <div className="text-center space-y-2">
            <h3 className="text-lg font-semibold text-gray-900">
              {message}
            </h3>

            <p className="text-sm text-gray-600">
              Preparing panoramic imagery...
            </p>
          </div>

          {/* Progress Bar */}
          {showProgress && (
            <div className="w-full space-y-2">
              <div className="flex justify-between text-xs text-gray-500">
                <span>Loading progress</span>
                <span>{Math.round(progress)}%</span>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
          )}

          {/* Loading Steps */}
          <div className="w-full space-y-2">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                <motion.div
                  className="absolute inset-0 bg-blue-500 rounded-full"
                  animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              </div>
              <span className="text-sm text-gray-700">Connecting to Street View service</span>
            </div>

            <div className="flex items-center gap-3">
              <MapPin className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600">Locating panorama</span>
            </div>

            <div className="flex items-center gap-3">
              <Camera className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600">Loading imagery</span>
            </div>
          </div>

          {/* Loading Tips */}
          <motion.div
            className="bg-blue-50 rounded-lg p-3 w-full"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-medium text-blue-900 mb-1">
                  Tip: Navigation
                </p>
                <p className="text-xs text-blue-700">
                  Use arrow keys or WASD to move, drag to look around, and scroll to zoom.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
};