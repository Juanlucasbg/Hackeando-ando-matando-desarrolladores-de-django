import React, { useState, useRef, useEffect } from 'react';
import { CollapsiblePanel } from '../ui/CollapsiblePanel';
import { Button } from '../ui/Button';
import { useResponsive } from '../../hooks/useResponsive';
import { useTouchGestures } from '../../hooks/useTouchGestures';
import '../styles/responsive.css';

interface SidebarProps {
  children?: React.ReactNode;
  className?: string;
  position?: 'left' | 'right';
  width?: number;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  overlay?: boolean;
  onCollapse?: (collapsed: boolean) => void;
}

interface SidebarSectionProps {
  title: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  icon?: React.ReactNode;
  className?: string;
}

/**
 * Sidebar section component with collapsible functionality
 */
export const SidebarSection: React.FC<SidebarSectionProps> = ({
  title,
  children,
  defaultExpanded = true,
  icon,
  className = '',
}) => {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <CollapsiblePanel
      title={title}
      expanded={expanded}
      onToggle={setExpanded}
      icon={icon}
      className={`sidebar-section ${className}`}
    >
      <div className="sidebar-section-content">
        {children}
      </div>
    </CollapsiblePanel>
  );
};

/**
 * Main sidebar component with responsive design and swipe gestures
 * Features:
 * - Responsive collapse behavior
 * - Touch gesture support
 * - Smooth animations
 * - Accessibility features
 * - Customizable width
 */
export const Sidebar: React.FC<SidebarProps> = ({
  children,
  className = '',
  position = 'left',
  width = 320,
  collapsible = true,
  defaultCollapsed = false,
  overlay = true,
  onCollapse,
}) => {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const [isAnimating, setIsAnimating] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const { isMobile, isTablet } = useResponsive();

  // Handle collapse changes
  const handleCollapseChange = (newCollapsed: boolean) => {
    if (newCollapsed !== collapsed) {
      setIsAnimating(true);
      setCollapsed(newCollapsed);
      onCollapse?.(newCollapsed);

      // Reset animation state
      setTimeout(() => setIsAnimating(false), 300);
    }
  };

  // Touch gesture handlers for mobile
  const gestureHandlers = useTouchGestures({
    onSwipeLeft: () => {
      if (position === 'left' && !collapsed && isMobile) {
        handleCollapseChange(true);
      }
    },
    onSwipeRight: () => {
      if (position === 'left' && collapsed && isMobile) {
        handleCollapseChange(false);
      }
    },
    threshold: 50,
    disabled: !collapsible || !isMobile,
  });

  // Handle overlay click
  const handleOverlayClick = () => {
    if (overlay && !collapsed && isMobile) {
      handleCollapseChange(true);
    }
  };

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !collapsed && isMobile) {
        handleCollapseChange(true);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [collapsed, isMobile]);

  // Generate CSS custom properties for dynamic styling
  const sidebarStyle = {
    '--sidebar-width': `${width}px`,
    '--sidebar-position': position,
  } as React.CSSProperties;

  const getSidebarClasses = () => {
    const baseClasses = 'app-sidebar';
    const positionClasses = `sidebar-${position}`;
    const stateClasses = collapsed ? 'collapsed' : 'expanded';
    const animatingClasses = isAnimating ? 'animating' : '';
    const deviceClasses = isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop';
    const collapsibleClasses = collapsible ? 'collapsible' : 'fixed';

    return [
      baseClasses,
      positionClasses,
      stateClasses,
      animatingClasses,
      deviceClasses,
      collapsibleClasses,
      className,
    ].filter(Boolean).join(' ');
  };

  const getOverlayClasses = () => {
    const baseClasses = 'sidebar-overlay';
    const visibleClasses = !collapsed && isMobile ? 'visible' : '';

    return [baseClasses, visibleClasses].filter(Boolean).join(' ');
  };

  return (
    <>
      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        className={getSidebarClasses()}
        style={sidebarStyle}
        role="complementary"
        aria-label="Application sidebar"
        aria-hidden={collapsed}
        {...(isMobile && collapsible ? gestureHandlers : {})}
        data-testid="sidebar"
      >
        {/* Collapse Toggle */}
        {collapsible && (
          <div className="sidebar-header">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleCollapseChange(!collapsed)}
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              className="sidebar-toggle-btn"
              data-testid="sidebar-collapse-toggle"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`collapse-icon ${collapsed ? 'collapsed' : ''}`}
              >
                {position === 'left' ? (
                  collapsed ? (
                    <>
                      <polyline points="9 18 15 12 9 6" />
                    </>
                  ) : (
                    <>
                      <polyline points="15 18 9 12 15 6" />
                    </>
                  )
                ) : (
                  collapsed ? (
                    <>
                      <polyline points="15 18 9 12 15 6" />
                    </>
                  ) : (
                    <>
                      <polyline points="9 18 15 12 9 6" />
                    </>
                  )
                )}
              </svg>
            </Button>
          </div>
        )}

        {/* Sidebar Content */}
        <div className="sidebar-content">
          {collapsed && !isMobile ? (
            // Collapsed state - show only icons
            <div className="sidebar-collapsed-content">
              {/* Mini navigation */}
              <nav className="sidebar-mini-nav" role="navigation">
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label="Expand sidebar"
                  className="sidebar-expand-btn"
                  onClick={() => handleCollapseChange(false)}
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    {position === 'left' ? (
                      <polyline points="9 18 15 12 9 6" />
                    ) : (
                      <polyline points="15 18 9 12 15 6" />
                    )}
                  </svg>
                </Button>
              </nav>
            </div>
          ) : (
            // Expanded state - show full content
            <div className="sidebar-expanded-content">
              {children}
            </div>
          )}
        </div>

        {/* Resize Handle (Desktop) */}
        {!isMobile && collapsible && (
          <div
            className="sidebar-resize-handle"
            role="separator"
            aria-label="Resize sidebar"
            aria-orientation="vertical"
            tabIndex={0}
          />
        )}
      </aside>

      {/* Mobile Overlay */}
      {overlay && isMobile && (
        <div
          className={getOverlayClasses()}
          onClick={handleOverlayClick}
          role="presentation"
          aria-hidden="true"
          data-testid="sidebar-overlay"
        />
      )}
    </>
  );
};

export default Sidebar;