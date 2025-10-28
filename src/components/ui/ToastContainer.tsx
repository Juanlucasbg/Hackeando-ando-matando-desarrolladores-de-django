import React, { useState, useEffect, createContext, useContext } from 'react';
import { Button } from './Button';
import '../styles/responsive.css';

// Types
export interface Toast {
  id: string;
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  persistent?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
  onDismiss?: () => void;
}

interface ToastContextType {
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  clearAllToasts: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

interface ToastProviderProps {
  children: React.ReactNode;
  maxToasts?: number;
}

/**
 * Toast context provider for managing notifications
 */
export const ToastProvider: React.FC<ToastProviderProps> = ({
  children,
  maxToasts = 5,
}) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (toast: Omit<Toast, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newToast: Toast = { id, ...toast };

    setToasts(prev => {
      const updated = [...prev, newToast];
      // Remove oldest toasts if we exceed maxToasts
      return updated.slice(-maxToasts);
    });

    // Auto-dismiss after duration (if not persistent)
    if (!toast.persistent && toast.duration !== 0) {
      setTimeout(() => {
        removeToast(id);
      }, toast.duration || 5000);
    }
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const clearAllToasts = () => {
    setToasts([]);
  };

  return (
    <ToastContext.Provider value={{ addToast, removeToast, clearAllToasts }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
};

interface ToastContainerProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
  className?: string;
}

/**
 * Toast container component that displays notifications
 */
export const ToastContainer: React.FC<ToastContainerProps> = ({
  toasts,
  onRemove,
  position = 'top-right',
  className = '',
}) => {
  return (
    <div
      className={`toast-container toast-container-${position} ${className}`}
      role="region"
      aria-label="Notifications"
      aria-live="polite"
    >
      {toasts.map(toast => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onRemove={onRemove}
        />
      ))}
    </div>
  );
};

interface ToastItemProps {
  toast: Toast;
  onRemove: (id: string) => void;
}

/**
 * Individual toast item component
 */
const ToastItem: React.FC<ToastItemProps> = ({ toast, onRemove }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    setTimeout(() => setIsVisible(true), 10);
  }, []);

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => {
      onRemove(toast.id);
      toast.onDismiss?.();
    }, 300);
  };

  const handleAction = () => {
    toast.action?.onClick();
    handleDismiss();
  };

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        );
      case 'error':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
        );
      case 'warning':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        );
      case 'info':
      default:
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
        );
    }
  };

  const getToastClasses = () => {
    const baseClasses = 'toast';
    const typeClasses = `toast-${toast.type || 'info'}`;
    const visibilityClasses = isVisible ? 'toast-visible' : '';
    const exitingClasses = isExiting ? 'toast-exiting' : '';

    return [baseClasses, typeClasses, visibilityClasses, exitingClasses].filter(Boolean).join(' ');
  };

  return (
    <div
      className={getToastClasses()}
      role="alert"
      aria-live={toast.type === 'error' ? 'assertive' : 'polite'}
      aria-atomic="true"
    >
      {/* Toast Icon */}
      <div className="toast-icon">
        {getIcon()}
      </div>

      {/* Toast Content */}
      <div className="toast-content">
        <p className="toast-message">
          {toast.message}
        </p>

        {toast.action && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleAction}
            className="toast-action"
          >
            {toast.action.label}
          </Button>
        )}
      </div>

      {/* Dismiss Button */}
      {!toast.persistent && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDismiss}
          aria-label="Dismiss notification"
          className="toast-dismiss"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </Button>
      )}
    </div>
  );
};

/**
 * Hook for showing toast notifications
 */
export const useToastNotification = () => {
  const { addToast, removeToast, clearAllToasts } = useToast();

  const showSuccess = (message: string, options?: Partial<Omit<Toast, 'id' | 'type' | 'message'>>) => {
    addToast({ message, type: 'success', ...options });
  };

  const showError = (message: string, options?: Partial<Omit<Toast, 'id' | 'type' | 'message'>>) => {
    addToast({ message, type: 'error', persistent: true, ...options });
  };

  const showWarning = (message: string, options?: Partial<Omit<Toast, 'id' | 'type' | 'message'>>) => {
    addToast({ message, type: 'warning', ...options });
  };

  const showInfo = (message: string, options?: Partial<Omit<Toast, 'id' | 'type' | 'message'>>) => {
    addToast({ message, type: 'info', ...options });
  };

  return {
    addToast,
    removeToast,
    clearAllToasts,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };
};

export default ToastProvider;