import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, RefreshCw, X, MapPin, WifiOff, ImageOff } from 'lucide-react';

import { StreetViewError } from '../../types/streetview.types';

interface StreetViewErrorDisplayProps {
  error: StreetViewError;
  onRetry?: () => void;
  onClose?: () => void;
  className?: string;
}

export const StreetViewErrorDisplay: React.FC<StreetViewErrorDisplayProps> = ({
  error,
  onRetry,
  onClose,
  className = '',
}) => {
  const getErrorIcon = (code: string) => {
    switch (code) {
      case 'NETWORK_ERROR':
        return <WifiOff className="w-8 h-8 text-red-500" />;
      case 'IMAGES_NOT_AVAILABLE':
        return <ImageOff className="w-8 h-8 text-orange-500" />;
      case 'LOCATION_NOT_FOUND':
        return <MapPin className="w-8 h-8 text-red-500" />;
      case 'INITIALIZATION_ERROR':
        return <AlertCircle className="w-8 h-8 text-red-500" />;
      default:
        return <AlertCircle className="w-8 h-8 text-red-500" />;
    }
  };

  const getErrorTitle = (code: string) => {
    switch (code) {
      case 'NETWORK_ERROR':
        return 'Network Connection Error';
      case 'IMAGES_NOT_AVAILABLE':
        return 'Street View Unavailable';
      case 'LOCATION_NOT_FOUND':
        return 'Location Not Found';
      case 'INITIALIZATION_ERROR':
        return 'Initialization Failed';
      case 'API_QUOTA_EXCEEDED':
        return 'API Limit Reached';
      case 'INVALID_API_KEY':
        return 'Invalid API Key';
      case 'PERMISSION_DENIED':
        return 'Permission Denied';
      default:
        return 'Street View Error';
    }
  };

  const getErrorMessage = (code: string, message?: string) => {
    if (message) return message;

    switch (code) {
      case 'NETWORK_ERROR':
        return 'Unable to connect to Street View service. Please check your internet connection.';
      case 'IMAGES_NOT_AVAILABLE':
        return 'Street View imagery is not available for this location. Try moving to a nearby area.';
      case 'LOCATION_NOT_FOUND':
        return 'The requested location could not be found. Please verify the address or coordinates.';
      case 'INITIALIZATION_ERROR':
        return 'Failed to initialize Street View. Please refresh the page and try again.';
      case 'API_QUOTA_EXCEEDED':
        return 'Street View service quota has been exceeded. Please try again later.';
      case 'INVALID_API_KEY':
        return 'Invalid Google Maps API key. Please contact the administrator.';
      case 'PERMISSION_DENIED':
        return 'Permission denied to access Street View service.';
      default:
        return 'An unexpected error occurred while loading Street View.';
    }
  };

  const getErrorSolution = (code: string) => {
    switch (code) {
      case 'NETWORK_ERROR':
        return [
          'Check your internet connection',
          'Try refreshing the page',
          'Disable any VPN or proxy services',
        ];
      case 'IMAGES_NOT_AVAILABLE':
        return [
          'Try a nearby location',
          'Check if this area has Street View coverage',
          'Use the map to find nearby covered areas',
        ];
      case 'LOCATION_NOT_FOUND':
        return [
          'Verify the address spelling',
          'Try using coordinates instead',
          'Search for a nearby landmark',
        ];
      case 'INITIALIZATION_ERROR':
        return [
          'Refresh the page',
          'Clear browser cache',
          'Try a different browser',
        ];
      default:
        return [
          'Try refreshing the page',
          'Check your internet connection',
          'Contact support if the issue persists',
        ];
    }
  };

  const errorSolutions = getErrorSolution(error.code);

  return (
    <motion.div
      className={`absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.2 }}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {getErrorIcon(error.code)}
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {getErrorTitle(error.code)}
              </h3>
              <p className="text-sm text-gray-500">
                Error Code: {error.code}
              </p>
            </div>
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          )}
        </div>

        {/* Error Message */}
        <div className="mb-6">
          <p className="text-gray-700 leading-relaxed">
            {getErrorMessage(error.code, error.message)}
          </p>
        </div>

        {/* Solutions */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-900 mb-2">
            What you can try:
          </h4>
          <ul className="space-y-2">
            {errorSolutions.map((solution, index) => (
              <li key={index} className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 flex-shrink-0" />
                <span className="text-sm text-gray-600">{solution}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          {onRetry && (
            <button
              onClick={onRetry}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
          )}

          {onClose && (
            <button
              onClick={onClose}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg transition-colors"
            >
              Close
            </button>
          )}
        </div>

        {/* Error Details (for development) */}
        {process.env.NODE_ENV === 'development' && error.details && (
          <details className="mt-4 pt-4 border-t">
            <summary className="text-sm font-medium text-gray-700 cursor-pointer">
              Error Details
            </summary>
            <pre className="mt-2 text-xs text-gray-600 bg-gray-100 p-2 rounded overflow-auto">
              {JSON.stringify(error.details, null, 2)}
            </pre>
          </details>
        )}
      </motion.div>
    </motion.div>
  );
};