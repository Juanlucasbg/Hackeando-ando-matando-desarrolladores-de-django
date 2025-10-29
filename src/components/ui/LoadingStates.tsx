import React from 'react';
import '../styles/responsive.css';

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  className?: string;
  variant?: 'text' | 'rectangular' | 'circular';
  animation?: 'pulse' | 'wave' | 'none';
}

/**
 * Skeleton loader component for showing loading states
 * Supports different variants and animations
 */
export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = '1em',
  className = '',
  variant = 'text',
  animation = 'pulse',
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'text':
        return 'skeleton-text';
      case 'rectangular':
        return 'skeleton-rectangular';
      case 'circular':
        return 'skeleton-circular';
      default:
        return 'skeleton-text';
    }
  };

  const getAnimationClasses = () => {
    switch (animation) {
      case 'pulse':
        return 'skeleton-pulse';
      case 'wave':
        return 'skeleton-wave';
      case 'none':
        return 'skeleton-no-animation';
      default:
        return 'skeleton-pulse';
    }
  };

  const style = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
  };

  return (
    <div
      className={`skeleton ${getVariantClasses()} ${getAnimationClasses()} ${className}`}
      style={style}
      role="status"
      aria-label="Loading content"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
};

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'current';
  className?: string;
  label?: string;
}

/**
 * Loading spinner component
 * Different sizes and colors with accessibility support
 */
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'primary',
  className = '',
  label = 'Loading...',
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'spinner-sm';
      case 'md':
        return 'spinner-md';
      case 'lg':
        return 'spinner-lg';
      default:
        return 'spinner-md';
    }
  };

  const getColorClasses = () => {
    switch (color) {
      case 'primary':
        return 'spinner-primary';
      case 'secondary':
        return 'spinner-secondary';
      case 'current':
        return 'spinner-current';
      default:
        return 'spinner-primary';
    }
  };

  return (
    <div
      className={`loading-spinner ${getSizeClasses()} ${getColorClasses()} ${className}`}
      role="status"
      aria-label={label}
    >
      <svg
        className="spinner-svg"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          className="spinner-circle"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray="62.83"
          strokeDashoffset="62.83"
        />
      </svg>
      <span className="sr-only">{label}</span>
    </div>
  );
};

interface ProgressBarProps {
  value?: number;
  max?: number;
  showLabel?: boolean;
  label?: string;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  className?: string;
}

/**
 * Progress bar component for showing loading progress
 * Supports different colors, sizes, and animations
 */
export const ProgressBar: React.FC<ProgressBarProps> = ({
  value = 0,
  max = 100,
  showLabel = false,
  label,
  color = 'primary',
  size = 'md',
  animated = true,
  className = '',
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const getColorClasses = () => {
    switch (color) {
      case 'primary':
        return 'progress-primary';
      case 'secondary':
        return 'progress-secondary';
      case 'success':
        return 'progress-success';
      case 'warning':
        return 'progress-warning';
      case 'error':
        return 'progress-error';
      default:
        return 'progress-primary';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'progress-sm';
      case 'md':
        return 'progress-md';
      case 'lg':
        return 'progress-lg';
      default:
        return 'progress-md';
    }
  };

  return (
    <div className={`progress-container ${getSizeClasses()} ${className}`}>
      {showLabel && (
        <div className="progress-label">
          {label || `${Math.round(percentage)}%`}
        </div>
      )}
      <div
        className={`progress-bar ${getColorClasses()}`}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label}
      >
        <div
          className={`progress-fill ${animated ? 'progress-animated' : ''}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

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
 * Can show spinner, message, and progress bar
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
            <ProgressBar
              value={progress}
              max={100}
              color="primary"
              size="sm"
              animated
            />
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Specialized skeleton components for common UI patterns
 */
export const MapSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`map-skeleton ${className}`}>
    <div className="map-skeleton-header">
      <Skeleton width="200px" height="32px" variant="text" />
      <Skeleton width="100px" height="32px" variant="rectangular" />
    </div>
    <div className="map-skeleton-content">
      <Skeleton height="100%" variant="rectangular" animation="wave" />
    </div>
  </div>
);

export const SearchSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`search-skeleton ${className}`}>
    <Skeleton height="48px" variant="rectangular" className="search-skeleton-input" />
    <div className="search-skeleton-suggestions">
      {[1, 2, 3].map((i) => (
        <div key={i} className="search-skeleton-suggestion">
          <Skeleton width="20px" height="20px" variant="circular" />
          <Skeleton width="100%" height="16px" variant="text" />
        </div>
      ))}
    </div>
  </div>
);

export const CardSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`card-skeleton ${className}`}>
    <Skeleton height="200px" variant="rectangular" className="card-skeleton-image" />
    <div className="card-skeleton-content">
      <Skeleton width="60%" height="24px" variant="text" />
      <Skeleton width="100%" height="16px" variant="text" />
      <Skeleton width="80%" height="16px" variant="text" />
    </div>
  </div>
);

export default {
  Skeleton,
  LoadingSpinner,
  ProgressBar,
  LoadingOverlay,
  MapSkeleton,
  SearchSkeleton,
  CardSkeleton,
};