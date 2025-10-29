import React from 'react';
import { WifiOff, RefreshCw, AlertCircle } from 'lucide-react';

interface OfflineBannerProps {
  onRetry?: () => void;
  isRetrying?: boolean;
  message?: string;
  showRetry?: boolean;
  className?: string;
}

export const OfflineBanner: React.FC<OfflineBannerProps> = ({
  onRetry,
  isRetrying = false,
  message = 'You are currently offline. Some features may not be available.',
  showRetry = true,
  className = ''
}) => {
  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      // Default retry behavior - reload the page
      window.location.reload();
    }
  };

  return (
    <div
      className={`offline-banner bg-amber-50 border-b border-amber-200 px-4 py-3 ${className}`}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center space-x-3">
          <WifiOff className="w-5 h-5 text-amber-600 flex-shrink-0" />
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            <span className="text-sm font-medium text-amber-800">
              {message}
            </span>
          </div>
        </div>

        {showRetry && (
          <button
            onClick={handleRetry}
            disabled={isRetrying}
            className="flex items-center space-x-2 px-3 py-1 text-sm font-medium text-amber-700 bg-amber-100 rounded hover:bg-amber-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Retry connection"
          >
            <RefreshCw
              className={`w-4 h-4 ${isRetrying ? 'animate-spin' : ''}`}
              aria-hidden="true"
            />
            <span>{isRetrying ? 'Retrying...' : 'Retry'}</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default OfflineBanner;