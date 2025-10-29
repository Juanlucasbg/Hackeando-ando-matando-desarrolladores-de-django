import React, { useState } from 'react';
import '../styles/responsive.css';

interface NavigationItem {
  label: string;
  href: string;
  active?: boolean;
  icon?: React.ReactNode;
  badge?: string | number;
  divider?: boolean;
}

interface NavigationMenuProps {
  items: NavigationItem[];
  variant?: 'horizontal' | 'vertical';
  className?: string;
  onItemClick?: (item: NavigationItem) => void;
}

/**
 * Navigation menu component with horizontal and vertical variants
 */
export const NavigationMenu: React.FC<NavigationMenuProps> = ({
  items,
  variant = 'horizontal',
  className = '',
  onItemClick,
}) => {
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    switch (e.key) {
      case 'ArrowLeft':
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex(Math.max(0, index - 1));
        break;
      case 'ArrowRight':
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex(Math.min(items.length - 1, index + 1));
        break;
      case 'Home':
        e.preventDefault();
        setFocusedIndex(0);
        break;
      case 'End':
        e.preventDefault();
        setFocusedIndex(items.length - 1);
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        const item = items[index];
        if (item && !item.divider) {
          onItemClick?.(item);
        }
        break;
    }
  };

  const getMenuClasses = () => {
    const baseClasses = 'nav-menu';
    const variantClasses = `nav-menu-${variant}`;

    return [baseClasses, variantClasses, className].filter(Boolean).join(' ');
  };

  return (
    <nav
      className={getMenuClasses()}
      role="navigation"
      aria-label={`${variant === 'horizontal' ? 'Main' : 'Secondary'} navigation`}
    >
      <ul className="nav-list" role="menubar">
        {items.map((item, index) => {
          if (item.divider) {
            return (
              <li key={`divider-${index}`} className="nav-divider" role="separator" />
            );
          }

          return (
            <li
              key={item.href}
              className="nav-item"
              role="none"
            >
              <a
                href={item.href}
                className={`nav-link ${item.active ? 'nav-link-active' : ''}`}
                role="menuitem"
                aria-current={item.active ? 'page' : undefined}
                aria-setsize={items.filter(i => !i.divider).length}
                aria-posinset={items.filter((_, i) => i <= index && !items[i].divider).length}
                onKeyDown={(e) => handleKeyDown(e, index)}
                onFocus={() => setFocusedIndex(index)}
                tabIndex={focusedIndex === index ? 0 : -1}
                onClick={(e) => {
                  e.preventDefault();
                  onItemClick?.(item);
                }}
              >
                {item.icon && (
                  <span className="nav-icon" aria-hidden="true">
                    {item.icon}
                  </span>
                )}
                <span className="nav-label">{item.label}</span>
                {item.badge && (
                  <span className="nav-badge" aria-label={`${item.badge} notifications`}>
                    {item.badge}
                  </span>
                )}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default NavigationMenu;