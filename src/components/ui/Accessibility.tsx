import React, { useEffect, useRef, useState } from 'react';

interface AccessibilityProps {
  children: React.ReactNode;
  enableHighContrast?: boolean;
  enableReducedMotion?: boolean;
  enableScreenReader?: boolean;
}

/**
 * Accessibility enhancement component
 * Provides high contrast mode, reduced motion, and screen reader optimizations
 */
export const AccessibilityProvider: React.FC<AccessibilityProps> = ({
  children,
  enableHighContrast = true,
  enableReducedMotion = true,
  enableScreenReader = true,
}) => {
  const [highContrast, setHighContrast] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [screenReaderOptimized, setScreenReaderOptimized] = useState(false);
  const skipLinksRef = useRef<HTMLDivElement>(null);

  // Detect system preferences
  useEffect(() => {
    if (enableHighContrast) {
      const mediaQuery = window.matchMedia('(prefers-contrast: high)');
      setHighContrast(mediaQuery.matches);

      const handleChange = (e: MediaQueryListEvent) => {
        setHighContrast(e.matches);
        document.documentElement.setAttribute('data-high-contrast', e.matches.toString());
      };

      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [enableHighContrast]);

  useEffect(() => {
    if (enableReducedMotion) {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setReducedMotion(mediaQuery.matches);

      const handleChange = (e: MediaQueryListEvent) => {
        setReducedMotion(e.matches);
        document.documentElement.setAttribute('data-reduced-motion', e.matches.toString());
      };

      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [enableReducedMotion]);

  useEffect(() => {
    // Detect screen reader usage
    if (enableScreenReader) {
      const detectScreenReader = () => {
        const hasScreenReader = window.speechSynthesis !== undefined;
        setScreenReaderOptimized(hasScreenReader);
        document.documentElement.setAttribute('data-screen-reader', hasScreenReader.toString());
      };

      detectScreenReader();
    }
  }, [enableScreenReader]);

  // Focus management for better keyboard navigation
  useEffect(() => {
    const handleFocus = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (target && target !== document.body) {
        target.setAttribute('data-focused', 'true');

        // Remove focus from previous element
        const previousFocused = document.querySelector('[data-focused="true"]');
        if (previousFocused && previousFocused !== target) {
          previousFocused.removeAttribute('data-focused');
        }
      }
    };

    const handleBlur = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (target) {
        target.removeAttribute('data-focused');
      }
    };

    document.addEventListener('focus', handleFocus, true);
    document.addEventListener('blur', handleBlur, true);

    return () => {
      document.removeEventListener('focus', handleFocus, true);
      document.removeEventListener('blur', handleBlur, true);
    };
  }, []);

  // Announce dynamic content changes to screen readers
  const announceToScreenReader = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;

    document.body.appendChild(announcement);

    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  };

  // Add accessibility helper functions to window for debugging
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      (window as any).accessibility = {
        announce: announceToScreenReader,
        highContrast,
        reducedMotion,
        screenReaderOptimized,
      };
    }
  }, [highContrast, reducedMotion, screenReaderOptimized]);

  return (
    <>
      {children}

      {/* Skip Links */}
      <div ref={skipLinksRef} className="skip-links">
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <a href="#navigation" className="skip-link">
          Skip to navigation
        </a>
        <a href="#search" className="skip-link">
          Skip to search
        </a>
      </div>

      {/* Screen reader only live regions */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        id="screen-reader-announcements"
      />
      <div
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
        id="screen-reader-alerts"
      />
    </>
  );
};

/**
 * Hook for accessibility announcements
 */
export const useAccessibilityAnnouncements = () => {
  const announce = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const regionId = priority === 'assertive'
      ? 'screen-reader-alerts'
      : 'screen-reader-announcements';

    const region = document.getElementById(regionId);
    if (region) {
      region.textContent = message;

      // Clear after announcement
      setTimeout(() => {
        region.textContent = '';
      }, 1000);
    }
  };

  return { announce };
};

/**
 * Focus trap component for modals and dropdowns
 */
export const FocusTrap: React.FC<{
  children: React.ReactNode;
  isActive: boolean;
  onEscape?: () => void;
}> = ({ children, isActive, onEscape }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const firstFocusableRef = useRef<HTMLElement | null>(null);
  const lastFocusableRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;

    // Find all focusable elements
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as NodeListOf<HTMLElement>;

    if (focusableElements.length > 0) {
      firstFocusableRef.current = focusableElements[0];
      lastFocusableRef.current = focusableElements[focusableElements.length - 1];

      // Focus first element
      firstFocusableRef.current?.focus();
    }

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstFocusableRef.current) {
          e.preventDefault();
          lastFocusableRef.current?.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastFocusableRef.current) {
          e.preventDefault();
          firstFocusableRef.current?.focus();
        }
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onEscape?.();
      }
    };

    document.addEventListener('keydown', handleTabKey);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('keydown', handleTabKey);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isActive, onEscape]);

  return <div ref={containerRef}>{children}</div>;
};

export default AccessibilityProvider;