import React from 'react';
import '../styles/responsive.css';

interface SkipLink {
  href: string;
  label: string;
}

interface SkipLinksProps {
  links: SkipLink[];
  className?: string;
}

/**
 * Skip links component for accessibility
 * Provides keyboard navigation shortcuts for screen reader users
 */
export const SkipLinks: React.FC<SkipLinksProps> = ({
  links,
  className = '',
}) => {
  return (
    <div className={`skip-links ${className}`}>
      {links.map((link, index) => (
        <a
          key={index}
          href={link.href}
          className="skip-link"
          onClick={(e) => {
            e.preventDefault();
            const target = document.querySelector(link.href);
            if (target) {
              target.setAttribute('tabindex', '-1');
              target.focus();
              target.removeAttribute('tabindex');
            }
          }}
        >
          {link.label}
        </a>
      ))}
    </div>
  );
};

export default SkipLinks;