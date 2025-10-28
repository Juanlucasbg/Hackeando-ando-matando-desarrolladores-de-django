import React from 'react';
import { LoadingSpinner } from './LoadingStates';
import '../styles/responsive.css';

interface LoadingOverlayProps {
  show?: boolean;
  message?: string;
  showProgress?: boolean;
  progress?: number;
  spinnerSize?: 'sm' | 'md' | 'lg';
  className?: string;
  children?: React.ReactNode;
}

/**
 * Loading overlay component for covering other content
 */
export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  show = true,
  message = 'Loading...',
  showProgress = false,
  progress,
  spinnerSize = 'md',
  className = '',
  children,
}) => {
  if (!show) {
    return <>{children}</>;
  }

  return (
    <div className={`loading-overlay ${className}`}>
      <div className="loading-overlay-backdrop" />
      <div className="loading-overlay-content">
        <LoadingSpinner size={spinnerSize} label={message} />
        {message && (
          <p className="loading-overlay-message" role="status">
            {message}
          </p>
        )}
        {showProgress && (
          <div className="loading-overlay-progress">
            <div className="progress-bar">
              <div
                className="progress-bar-fill"
                style={{ width: `${progress || 0}%` }}
                role="progressbar"
                aria-valuenow={progress}
                aria-valuemin={0}
                aria-valuemax={100}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoadingOverlay;