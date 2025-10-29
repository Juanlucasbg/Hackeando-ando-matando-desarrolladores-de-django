import React, { useState, useRef, useEffect } from 'react';
import { Button } from './Button';
import '../styles/responsive.css';

interface UserMenuItem {
  label: string;
  href?: string;
  icon?: string;
  onClick?: () => void;
  type?: 'divider';
}

interface UserMenuProps {
  trigger: React.ReactNode;
  items: UserMenuItem[];
  className?: string;
}

/**
 * User menu dropdown component with keyboard navigation
 */
export const UserMenu: React.FC<UserMenuProps> = ({
  trigger,
  items,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setFocusedIndex(-1);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        setIsOpen(true);
        setFocusedIndex(0);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex(prev => {
          const nextIndex = prev + 1;
          while (nextIndex < items.length && items[nextIndex].type === 'divider') {
            return nextIndex + 1;
          }
          return Math.min(nextIndex, items.length - 1);
        });
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex(prev => {
          const nextIndex = prev - 1;
          while (nextIndex >= 0 && items[nextIndex].type === 'divider') {
            return nextIndex - 1;
          }
          return Math.max(nextIndex, 0);
        });
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
        const item = items[focusedIndex];
        if (item && item.type !== 'divider') {
          handleItemClick(item);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        triggerRef.current?.focus();
        break;
    }
  };

  const handleItemClick = (item: UserMenuItem) => {
    if (item.onClick) {
      item.onClick();
    } else if (item.href) {
      window.location.href = item.href;
    }
    setIsOpen(false);
    setFocusedIndex(-1);
  };

  const handleTriggerClick = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setFocusedIndex(0);
    }
  };

  const getIcon = (iconName: string) => {
    const icons: Record<string, React.ReactNode> = {
      user: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      ),
      settings: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="3" />
          <path d="M12 1v6m0 6v6m4.22-13.22l4.24 4.24M1.54 9.96l4.24 4.24M20.46 14.04l-4.24 4.24M7.46 6.04L3.22 1.8" />
        </svg>
      ),
      'help-circle': (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      ),
      'log-out': (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
      ),
    };

    return icons[iconName] || null;
  };

  return (
    <div
      ref={menuRef}
      className={`user-menu ${isOpen ? 'open' : 'closed'} ${className}`}
      onKeyDown={handleKeyDown}
    >
      <Button
        ref={triggerRef}
        variant="ghost"
        size="sm"
        onClick={handleTriggerClick}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        className="user-menu-trigger"
      >
        {trigger}
      </Button>

      {isOpen && (
        <div
          className="user-menu-dropdown"
          role="menu"
          aria-labelledby="user-menu-trigger"
        >
          {items.map((item, index) => {
            if (item.type === 'divider') {
              return (
                <div
                  key={`divider-${index}`}
                  className="user-menu-divider"
                  role="separator"
                />
              );
            }

            return (
              <button
                key={item.label}
                className={`user-menu-item ${focusedIndex === index ? 'focused' : ''}`}
                role="menuitem"
                onClick={() => handleItemClick(item)}
                tabIndex={focusedIndex === index ? 0 : -1}
              >
                {item.icon && (
                  <span className="user-menu-item-icon" aria-hidden="true">
                    {getIcon(item.icon)}
                  </span>
                )}
                <span className="user-menu-item-label">{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default UserMenu;