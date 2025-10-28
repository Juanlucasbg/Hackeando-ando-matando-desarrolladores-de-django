import React, { useState, useRef } from 'react';
import '../styles/responsive.css';

interface CollapsiblePanelProps {
  title: string;
  children: React.ReactNode;
  expanded?: boolean;
  onToggle?: (expanded: boolean) => void;
  icon?: React.ReactNode;
  className?: string;
}

/**
 * Collapsible panel component with smooth animations
 */
export const CollapsiblePanel: React.FC<CollapsiblePanelProps> = ({
  title,
  children,
  expanded: controlledExpanded,
  onToggle,
  icon,
  className = '',
}) => {
  const [internalExpanded, setInternalExpanded] = useState(true);
  const contentRef = useRef<HTMLDivElement>(null);
  const isControlled = controlledExpanded !== undefined;
  const expanded = isControlled ? controlledExpanded : internalExpanded;

  const handleToggle = () => {
    if (isControlled) {
      onToggle?.(!expanded);
    } else {
      setInternalExpanded(!expanded);
      onToggle?.(!expanded);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleToggle();
    }
  };

  const maxHeight = expanded
    ? contentRef.current?.scrollHeight || 'auto'
    : 0;

  return (
    <div className={`collapsible-panel ${expanded ? 'expanded' : 'collapsed'} ${className}`}>
      <div
        className="collapsible-panel-header"
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        role="button"
        tabIndex={0}
        aria-expanded={expanded}
        aria-controls={`panel-content-${title.replace(/\s+/g, '-').toLowerCase()}`}
      >
        <div className="collapsible-panel-title-row">
          {icon && (
            <span className="collapsible-panel-icon" aria-hidden="true">
              {icon}
            </span>
          )}
          <h3 className="collapsible-panel-title">{title}</h3>
        </div>
        <button
          className="collapsible-panel-toggle"
          aria-label={expanded ? 'Collapse panel' : 'Expand panel'}
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleToggle();
          }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className={`collapsible-panel-chevron ${expanded ? 'expanded' : 'collapsed'}`}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
      </div>
      <div
        ref={contentRef}
        id={`panel-content-${title.replace(/\s+/g, '-').toLowerCase()}`}
        className="collapsible-panel-content"
        style={{ maxHeight: `${maxHeight}px` }}
        role="region"
        aria-labelledby={`panel-header-${title.replace(/\s+/g, '-').toLowerCase()}`}
      >
        <div className="collapsible-panel-inner">
          {children}
        </div>
      </div>
    </div>
  );
};

export default CollapsiblePanel;