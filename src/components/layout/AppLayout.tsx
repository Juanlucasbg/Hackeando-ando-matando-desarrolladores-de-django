import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTheme } from '../ui/ThemeProvider';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import { useTouchGestures } from '../../hooks/useTouchGestures';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import { SkipLinks } from '../ui/SkipLinks';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { ErrorBoundary } from '../ui/ErrorBoundary';
import { LoadingOverlay } from '../ui/LoadingOverlay';
import { ToastContainer } from '../ui/ToastContainer';
import '../styles/responsive.css';

interface AppLayoutProps {
  children: React.ReactNode;
  sidebarContent?: React.ReactNode;
  headerContent?: React.ReactNode;
  showSidebar?: boolean;
  sidebarPosition?: 'left' | 'right';
  loading?: boolean;
  className?: string;
}

/**
 * Main application layout component with responsive design
 * Features:
 * - Mobile-first responsive layout
 * - Collapsible sidebar with swipe gestures
 * - Keyboard navigation support
 * - Accessibility features
 * - Dark mode support
 * - Loading states
 * - Error boundaries
 */
export const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  sidebarContent,
  headerContent,
  showSidebar = true,
  sidebarPosition = 'left',
  loading = false,
  className = '',
}) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const appRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const { theme, toggleTheme } = useTheme();
  const breakpoint = useBreakpoint();

  // Handle responsive behavior
  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth;
      setIsMobile(width < 640);
      setIsTablet(width >= 640 && width < 1024);

      // Auto-collapse sidebar on mobile
      if (width < 640 && showSidebar) {
        setSidebarCollapsed(true);
      } else if (width >= 1024 && showSidebar) {
        setSidebarCollapsed(false);
      }
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, [showSidebar]);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    'Ctrl+b': () => setSidebarCollapsed(!sidebarCollapsed),
    'Ctrl+Shift+d': toggleTheme,
    'Escape': () => {
      if (!sidebarCollapsed && isMobile) {
        setSidebarCollapsed(true);
      }
    },
  });

  // Touch gestures for mobile
  const sidebarGestureHandlers = useTouchGestures({
    onSwipeLeft: () => {
      if (sidebarPosition === 'left' && !sidebarCollapsed && isMobile) {
        setSidebarCollapsed(true);
      }
    },
    onSwipeRight: () => {
      if (sidebarPosition === 'left' && sidebarCollapsed && isMobile) {
        setSidebarCollapsed(false);
      }
    },
    threshold: 50,
  });

  // Focus management
  const focusFirstInteractiveElement = useCallback(() => {
    if (!sidebarCollapsed && sidebarRef.current) {
      const firstInteractive = sidebarRef.current.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      ) as HTMLElement;

      if (firstInteractive) {
        firstInteractive.focus();
      }
    }
  }, [sidebarCollapsed]);

  // Handle sidebar toggle
  const handleSidebarToggle = useCallback(() => {
    setSidebarCollapsed(prev => !prev);

    // Focus management after animation
    if (!sidebarCollapsed) {
      setTimeout(focusFirstInteractiveElement, 300);
    }
  }, [sidebarCollapsed, focusFirstInteractiveElement]);

  // Handle overlay click (mobile only)
  const handleOverlayClick = useCallback(() => {
    if (isMobile && !sidebarCollapsed) {
      setSidebarCollapsed(true);
    }
  }, [isMobile, sidebarCollapsed]);

  // Generate ARIA labels
  const sidebarAriaLabel = sidebarCollapsed
    ? 'Show sidebar navigation'
    : 'Hide sidebar navigation';

  const getSidebarClasses = () => {
    const baseClasses = 'app-sidebar';
    const positionClasses = sidebarPosition === 'right' ? 'sidebar-right' : 'sidebar-left';
    const collapseClasses = sidebarCollapsed ? 'collapsed' : '';
    const mobileClasses = isMobile ? 'mobile-sidebar' : '';

    return [baseClasses, positionClasses, collapseClasses, mobileClasses].filter(Boolean).join(' ');
  };

  const getMainClasses = () => {
    const baseClasses = 'app-main';
    const sidebarOffsetClasses = showSidebar && !sidebarCollapsed && !isMobile
      ? `sidebar-offset-${sidebarPosition}`
      : '';

    return [baseClasses, sidebarOffsetClasses, className].filter(Boolean).join(' ');
  };

  return (
    <ErrorBoundary>
      <div
        ref={appRef}
        className={`app-container ${theme}`}
        data-theme={theme}
        role="application"
        aria-label="Google Maps Clone Application"
      >
        {/* Skip Links for Accessibility */}
        <SkipLinks
          links={[
            { href: '#main-content', label: 'Skip to main content' },
            { href: '#search-input', label: 'Skip to search' },
            { href: '#map-container', label: 'Skip to map' },
            ...(showSidebar ? [{ href: '#sidebar', label: 'Skip to sidebar' }] : []),
          ]}
        />

        {/* Application Header */}
        <Header
          onSidebarToggle={handleSidebarToggle}
          sidebarCollapsed={sidebarCollapsed}
          showSidebarToggle={showSidebar}
          isMobile={isMobile}
          onThemeToggle={toggleTheme}
          currentTheme={theme}
        >
          {headerContent}
        </Header>

        {/* Main Application Area */}
        <div className={getMainClasses()}>
          {/* Sidebar */}
          {showSidebar && (
            <>
              <aside
                ref={sidebarRef}
                id="sidebar"
                className={getSidebarClasses()}
                role="complementary"
                aria-label="Application sidebar"
                aria-hidden={sidebarCollapsed}
                {...(isMobile ? sidebarGestureHandlers : {})}
              >
                <div className="sidebar-content">
                  {sidebarContent}
                </div>
              </aside>

              {/* Mobile Overlay */}
              {isMobile && !sidebarCollapsed && (
                <div
                  className="sidebar-overlay"
                  onClick={handleOverlayClick}
                  role="presentation"
                  aria-hidden="true"
                />
              )}
            </>
          )}

          {/* Main Content Area */}
          <main
            id="main-content"
            className="map-container"
            role="main"
            aria-label="Map and main content area"
          >
            {loading ? (
              <LoadingOverlay
                message="Loading application..."
                showProgress={true}
              />
            ) : (
              <ErrorBoundary fallback="Error loading main content">
                {children}
              </ErrorBoundary>
            )}
          </main>
        </div>

        {/* Toast Container for Notifications */}
        <ToastContainer
          position={isMobile ? 'bottom-center' : 'top-right'}
          limit={3}
        />

        {/* Responsive Breakpoint Indicator (for development) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="breakpoint-indicator">
            {breakpoint}
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default AppLayout;