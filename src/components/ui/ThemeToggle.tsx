import React from 'react';
import { useTheme } from './ThemeProvider';
import '../styles/responsive.css';

interface ThemeToggleProps {
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
  ariaLabel?: string;
}

/**
 * Theme toggle component for switching between light and dark themes
 */
export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  size = 'md',
  showLabel = false,
  className = '',
  ariaLabel = 'Toggle theme',
}) => {
  const { theme, toggleTheme } = useTheme();

  const getIcon = () => {
    switch (theme) {
      case 'light':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="5" />
            <line x1="12" y1="1" x2="12" y2="3" />
            <line x1="12" y1="21" x2="12" y2="23" />
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
            <line x1="1" y1="12" x2="3" y2="12" />
            <line x1="21" y1="12" x2="23" y2="12" />
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
          </svg>
        );
      case 'dark':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        );
      case 'system':
      default:
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <line x1="9" y1="9" x2="15" y2="9" />
            <line x1="9" y1="15" x2="15" y2="15" />
          </svg>
        );
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'theme-toggle-sm';
      case 'md':
        return 'theme-toggle-md';
      case 'lg':
        return 'theme-toggle-lg';
      default:
        return 'theme-toggle-md';
    }
  };

  const getLabel = () => {
    switch (theme) {
      case 'light':
        return 'Light mode';
      case 'dark':
        return 'Dark mode';
      case 'system':
      default:
        return 'System theme';
    }
  };

  return (
    <button
      className={`theme-toggle ${getSizeClasses()} ${className}`}
      onClick={toggleTheme}
      aria-label={ariaLabel}
      title={getLabel()}
      type="button"
    >
      <span className="theme-toggle-icon" aria-hidden="true">
        {getIcon()}
      </span>
      {showLabel && (
        <span className="theme-toggle-label">
          {getLabel()}
        </span>
      )}
    </button>
  );
};

export default ThemeToggle;