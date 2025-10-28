import React from 'react';
import '../styles/responsive.css';

interface LogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  href?: string;
  className?: string;
  ariaLabel?: string;
}

/**
 * Application logo component with responsive sizing
 */
export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  href = '/',
  className = '',
  ariaLabel = 'Google Maps Clone - Home',
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'xs':
        return 'logo-xs';
      case 'sm':
        return 'logo-sm';
      case 'md':
        return 'logo-md';
      case 'lg':
        return 'logo-lg';
      case 'xl':
        return 'logo-xl';
      default:
        return 'logo-md';
    }
  };

  const logoContent = (
    <div className={`logo ${getSizeClasses()} ${className}`}>
      <svg
        width="40"
        height="40"
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="logo-icon"
        aria-hidden="true"
      >
        {/* Map pin/location marker icon */}
        <path
          d="M20 2C12.268 2 6 8.268 6 16C6 26 20 38 20 38S34 26 34 16C34 8.268 27.732 2 20 2Z"
          fill="currentColor"
          className="logo-marker"
        />
        <circle cx="20" cy="16" r="6" fill="white" className="logo-center" />
        <circle cx="20" cy="16" r="3" fill="currentColor" className="logo-dot" />
      </svg>
      <span className="logo-text">MapsClone</span>
    </div>
  );

  if (href) {
    return (
      <a
        href={href}
        className="logo-link"
        aria-label={ariaLabel}
      >
        {logoContent}
      </a>
    );
  }

  return logoContent;
};

export default Logo;