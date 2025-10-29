import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from './Button';
import '../styles/responsive.css';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showErrorDetails?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
}

/**
 * Global error boundary component with comprehensive error handling
 * Features:
 * - Error reporting and logging
 * - User-friendly error messages
 * - Retry functionality
 * - Development error details
 * - Accessibility support
 */
export class ErrorBoundary extends Component<Props, State> {
  private retryCount = 0;
  private maxRetries = 3;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: this.generateErrorId(),
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
      errorId: ErrorBoundary.prototype.generateErrorId(),
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    // Call custom error handler
    this.props.onError?.(error, errorInfo);

    // Send error to reporting service (if available)
    this.reportError(error, errorInfo);
  }

  private generateErrorId = (): string => {
    return `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  private reportError = (error: Error, errorInfo: ErrorInfo) => {
    // Send to error reporting service (Sentry, LogRocket, etc.)
    if (window.Sentry) {
      window.Sentry.captureException(error, {
        contexts: {
          react: {
            componentStack: errorInfo.componentStack,
          },
        },
        tags: {
          errorBoundary: true,
          errorId: this.state.errorId,
        },
      });
    }

    // Send to custom logging endpoint
    if (process.env.NODE_ENV === 'production') {
      fetch('/api/errors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          errorId: this.state.errorId,
          message: error.message,
          stack: error.stack,
          componentStack: errorInfo.componentStack,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          url: window.location.href,
        }),
      }).catch(() => {
        // Fail silently for error reporting to avoid infinite loops
      });
    }
  };

  private handleRetry = () => {
    if (this.retryCount < this.maxRetries) {
      this.retryCount++;
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        errorId: this.generateErrorId(),
      });
    }
  };

  private handleReload = () => {
    window.location.reload();
  };

  private getErrorType = (error: Error): string => {
    if (error.name === 'ChunkLoadError') return 'CHUNK_LOAD_ERROR';
    if (error.message.includes('Network')) return 'NETWORK_ERROR';
    if (error.message.includes('API')) return 'API_ERROR';
    if (error.message.includes('Maps')) return 'MAPS_ERROR';
    return 'UNKNOWN_ERROR';
  };

  private getErrorMessage = (error: Error): string => {
    const errorType = this.getErrorType(error);

    switch (errorType) {
      case 'CHUNK_LOAD_ERROR':
        return 'Application failed to load properly. Please refresh the page.';
      case 'NETWORK_ERROR':
        return 'Network connection issue. Please check your internet connection and try again.';
      case 'API_ERROR':
        return 'Unable to connect to the map service. Please try again later.';
      case 'MAPS_ERROR':
        return 'Map service encountered an error. Please refresh the page.';
      default:
        return 'An unexpected error occurred. Please try again.';
    }
  };

  private getErrorIcon = (errorType: string): ReactNode => {
    switch (errorType) {
      case 'CHUNK_LOAD_ERROR':
      case 'NETWORK_ERROR':
        return (
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M1 9l2 2v8a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-8l2-2" />
            <polyline points="3 9 12 2 21 9" />
          </svg>
        );
      case 'API_ERROR':
      case 'MAPS_ERROR':
        return (
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        );
      default:
        return (
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        );
    }
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { error, errorInfo } = this.state;
      if (!error) return null;

      const errorType = this.getErrorType(error);
      const errorMessage = this.getErrorMessage(error);
      const canRetry = this.retryCount < this.maxRetries;

      return (
        <div
          className="error-boundary"
          role="alert"
          aria-live="assertive"
          aria-labelledby="error-title"
          aria-describedby="error-description"
        >
          <div className="error-boundary-content">
            {/* Error Icon */}
            <div className="error-icon">
              {this.getErrorIcon(errorType)}
            </div>

            {/* Error Title */}
            <h1 id="error-title" className="error-title">
              Oops! Something went wrong
            </h1>

            {/* Error Description */}
            <p id="error-description" className="error-description">
              {errorMessage}
            </p>

            {/* Error Actions */}
            <div className="error-actions">
              {canRetry && (
                <Button
                  onClick={this.handleRetry}
                  variant="primary"
                  className="error-retry-btn"
                >
                  Try Again ({this.maxRetries - this.retryCount} attempts left)
                </Button>
              )}

              <Button
                onClick={this.handleReload}
                variant="secondary"
                className="error-reload-btn"
              >
                Refresh Page
              </Button>
            </div>

            {/* Error ID for support */}
            <div className="error-details">
              <p className="error-id">
                Error ID: {this.state.errorId}
              </p>
              <p className="error-support">
                If this problem persists, please contact support with the error ID above.
              </p>
            </div>

            {/* Development Error Details */}
            {process.env.NODE_ENV === 'development' && this.props.showErrorDetails && (
              <details className="error-technical-details">
                <summary className="error-details-toggle">
                  Technical Details (Development Only)
                </summary>
                <div className="error-technical-content">
                  <div className="error-stack">
                    <h4>Error Stack:</h4>
                    <pre className="error-stack-trace">
                      {error.stack}
                    </pre>
                  </div>

                  {errorInfo && (
                    <div className="error-component-stack">
                      <h4>Component Stack:</h4>
                      <pre className="error-component-stack-trace">
                        {errorInfo.componentStack}
                      </pre>
                    </div>
                  )}

                  <div className="error-info">
                    <h4>Error Information:</h4>
                    <ul>
                      <li><strong>Name:</strong> {error.name}</li>
                      <li><strong>Message:</strong> {error.message}</li>
                      <li><strong>Type:</strong> {errorType}</li>
                      <li><strong>Retry Count:</strong> {this.retryCount}/{this.maxRetries}</li>
                    </ul>
                  </div>
                </div>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Functional error boundary wrapper component
 */
export const ErrorBoundaryWrapper: React.FC<Props> = (props) => (
  <ErrorBoundary {...props} />
);

export default ErrorBoundary;