import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../ui/ThemeProvider';
import { useResponsive } from '../../hooks/useResponsive';
import { Button } from '../ui/Button';
import { Logo } from '../ui/Logo';
import { NavigationMenu } from '../ui/NavigationMenu';
import { SearchBar } from '../search/SearchBar';
import { UserMenu } from '../ui/UserMenu';
import { ThemeToggle } from '../ui/ThemeToggle';
import '../styles/responsive.css';

interface HeaderProps {
  children?: React.ReactNode;
  onSidebarToggle: () => void;
  sidebarCollapsed: boolean;
  showSidebarToggle: boolean;
  isMobile: boolean;
  onThemeToggle: () => void;
  currentTheme: 'light' | 'dark';
  className?: string;
}

/**
 * Application header component with responsive design
 * Features:
 * - Mobile hamburger menu
 * - Responsive navigation
 * - Search integration
 * - User controls
 * - Theme toggle
 * - Accessibility features
 */
export const Header: React.FC<HeaderProps> = ({
  children,
  onSidebarToggle,
  sidebarCollapsed,
  showSidebarToggle,
  isMobile,
  onThemeToggle,
  currentTheme,
  className = '',
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const { isTablet, isDesktop } = useResponsive();

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  // Handle search focus
  const handleSearchFocus = () => {
    setSearchFocused(true);
    if (isMobile) {
      setIsMenuOpen(false);
    }
  };

  const handleSearchBlur = () => {
    setSearchFocused(false);
  };

  // Generate ARIA labels
  const sidebarToggleAriaLabel = sidebarCollapsed
    ? 'Open sidebar navigation'
    : 'Close sidebar navigation';

  const mobileMenuAriaLabel = isMenuOpen
    ? 'Close navigation menu'
    : 'Open navigation menu';

  const getHeaderClasses = () => {
    const baseClasses = 'app-header';
    const stateClasses = searchFocused ? 'search-focused' : '';
    const responsiveClasses = isMobile ? 'mobile-header' : isTablet ? 'tablet-header' : 'desktop-header';

    return [baseClasses, stateClasses, responsiveClasses, className].filter(Boolean).join(' ');
  };

  const getHeaderContentClasses = () => {
    const baseClasses = 'app-header-content';
    const searchStateClasses = searchFocused ? 'search-expanded' : '';

    return [baseClasses, searchStateClasses].filter(Boolean).join(' ');
  };

  return (
    <header
      ref={headerRef}
      className={getHeaderClasses()}
      role="banner"
      aria-label="Application header"
    >
      <div className={getHeaderContentClasses()}>
        {/* Left Section */}
        <div className="header-left">
          {/* Sidebar Toggle (Mobile/Tablet) */}
          {showSidebarToggle && (isMobile || isTablet) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onSidebarToggle}
              aria-label={sidebarToggleAriaLabel}
              className="sidebar-toggle"
              data-testid="sidebar-toggle"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`hamburger-icon ${sidebarCollapsed ? 'collapsed' : ''}`}
              >
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </Button>
          )}

          {/* Logo */}
          <Logo
            size={isMobile ? 'sm' : 'md'}
            href="/"
            aria-label="Google Maps Clone - Home"
            className="header-logo"
          />

          {/* Navigation Menu (Desktop) */}
          {isDesktop && (
            <nav
              className="header-nav"
              role="navigation"
              aria-label="Main navigation"
            >
              <NavigationMenu
                variant="horizontal"
                items={[
                  { label: 'Map', href: '/', active: true },
                  { label: 'Routes', href: '/routes' },
                  { label: 'Places', href: '/places' },
                  { label: 'Saved', href: '/saved' },
                ]}
              />
            </nav>
          )}
        </div>

        {/* Center Section - Search */}
        <div className="header-center">
          <div className={`search-container ${searchFocused ? 'focused' : ''}`}>
            <SearchBar
              id="search-input"
              placeholder="Search places, addresses, coordinates..."
              onFocus={handleSearchFocus}
              onBlur={handleSearchBlur}
              className="header-search"
              expanded={searchFocused || !isMobile}
              showSuggestions={searchFocused}
              autoFocus={false}
              aria-label="Search locations and places"
            />
          </div>
        </div>

        {/* Right Section - Controls */}
        <div className="header-right">
          {/* Mobile Menu Toggle */}
          {isMobile && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={mobileMenuAriaLabel}
              aria-expanded={isMenuOpen}
              className="mobile-menu-toggle"
              data-testid="mobile-menu-toggle"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </Button>
          )}

          {/* Theme Toggle */}
          <ThemeToggle
            theme={currentTheme}
            onToggle={onThemeToggle}
            size="sm"
            aria-label="Toggle dark mode"
            className="theme-toggle"
          />

          {/* User Menu */}
          <UserMenu
            trigger={
              <Button
                variant="ghost"
                size="sm"
                aria-label="User menu"
                className="user-menu-trigger"
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
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </Button>
            }
            items={[
              { label: 'Profile', href: '/profile', icon: 'user' },
              { label: 'Settings', href: '/settings', icon: 'settings' },
              { label: 'Help', href: '/help', icon: 'help-circle' },
              { type: 'divider' },
              { label: 'Sign out', href: '/logout', icon: 'log-out' },
            ]}
          />

          {/* Custom Header Content */}
          {children}
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobile && isMenuOpen && (
        <div className="mobile-menu">
          <nav
            className="mobile-nav"
            role="navigation"
            aria-label="Mobile navigation"
          >
            <NavigationMenu
              variant="vertical"
              items={[
                { label: 'Map', href: '/', active: true },
                { label: 'Routes', href: '/routes' },
                { label: 'Places', href: '/places' },
                { label: 'Saved', href: '/saved' },
                { type: 'divider' },
                { label: 'Settings', href: '/settings' },
                { label: 'Help', href: '/help' },
              ]}
              onItemClick={() => setIsMenuOpen(false)}
            />
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;