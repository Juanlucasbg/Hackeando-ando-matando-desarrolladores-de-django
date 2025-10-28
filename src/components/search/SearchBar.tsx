import React, { useState, useRef, useEffect } from 'react';
import { Button } from '../ui/Button';
import '../styles/responsive.css';

interface SearchBarProps {
  id?: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  onSubmit?: (value: string) => void;
  expanded?: boolean;
  showSuggestions?: boolean;
  autoFocus?: boolean;
  className?: string;
  ariaLabel?: string;
}

interface SearchSuggestion {
  id: string;
  text: string;
  type: 'address' | 'place' | 'recent';
  icon?: React.ReactNode;
}

/**
 * Search bar component with autocomplete functionality
 */
export const SearchBar: React.FC<SearchBarProps> = ({
  id = 'search-input',
  placeholder = 'Search places, addresses, coordinates...',
  value,
  onChange,
  onFocus,
  onBlur,
  onSubmit,
  expanded = false,
  showSuggestions = true,
  autoFocus = false,
  className = '',
  ariaLabel = 'Search locations',
}) => {
  const [internalValue, setInternalValue] = useState('');
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [focusedSuggestion, setFocusedSuggestion] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentValue = value !== undefined ? value : internalValue;

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  // Mock suggestions - in real implementation, this would use Google Places API
  const generateSuggestions = (query: string): SearchSuggestion[] => {
    if (!query.trim()) return [];

    const mockSuggestions: SearchSuggestion[] = [
      {
        id: '1',
        text: `${query} - New York, NY`,
        type: 'address',
        icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>,
      },
      {
        id: '2',
        text: `${query} - San Francisco, CA`,
        type: 'address',
        icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>,
      },
      {
        id: '3',
        text: `${query} Restaurant`,
        type: 'place',
        icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z" />
          <line x1="9" y1="9" x2="15" y2="9" />
          <line x1="9" y1="15" x2="15" y2="15" />
        </svg>,
      },
    ];

    return mockSuggestions.slice(0, 5);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInternalValue(newValue);
    onChange?.(newValue);

    if (newValue.trim()) {
      const newSuggestions = generateSuggestions(newValue);
      setSuggestions(newSuggestions);
      setShowDropdown(showSuggestions && newSuggestions.length > 0);
      setFocusedSuggestion(-1);
    } else {
      setSuggestions([]);
      setShowDropdown(false);
    }
  };

  const handleInputFocus = () => {
    onFocus?.();
    if (currentValue.trim()) {
      const newSuggestions = generateSuggestions(currentValue);
      setSuggestions(newSuggestions);
      setShowDropdown(showSuggestions && newSuggestions.length > 0);
    }
  };

  const handleInputBlur = () => {
    // Delay hiding dropdown to allow clicking on suggestions
    setTimeout(() => {
      setShowDropdown(false);
      setFocusedSuggestion(-1);
    }, 200);
    onBlur?.();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentValue.trim()) {
      onSubmit?.(currentValue.trim());
      setShowDropdown(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedSuggestion(prev => {
          const next = prev + 1;
          return next < suggestions.length ? next : prev;
        });
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedSuggestion(prev => {
          const next = prev - 1;
          return next >= -1 ? next : -1;
        });
        break;
      case 'Enter':
        e.preventDefault();
        if (focusedSuggestion >= 0 && suggestions[focusedSuggestion]) {
          handleSuggestionClick(suggestions[focusedSuggestion]);
        } else {
          handleSubmit(e);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setShowDropdown(false);
        setFocusedSuggestion(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setInternalValue(suggestion.text);
    onChange?.(suggestion.text);
    onSubmit?.(suggestion.text);
    setShowDropdown(false);
    setFocusedSuggestion(-1);
    inputRef.current?.focus();
  };

  const handleClear = () => {
    setInternalValue('');
    onChange?.('');
    setSuggestions([]);
    setShowDropdown(false);
    inputRef.current?.focus();
  };

  const getSearchBarClasses = () => {
    const baseClasses = 'search-bar';
    const stateClasses = expanded ? 'search-bar-expanded' : '';
    const focusClasses = showDropdown ? 'search-bar-focused' : '';

    return [baseClasses, stateClasses, focusClasses, className].filter(Boolean).join(' ');
  };

  return (
    <div className={getSearchBarClasses()}>
      <form onSubmit={handleSubmit} className="search-form">
        <div className="search-input-wrapper">
          {/* Search Icon */}
          <div className="search-icon" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </div>

          {/* Input */}
          <input
            ref={inputRef}
            id={id}
            type="text"
            value={currentValue}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="search-input"
            aria-label={ariaLabel}
            aria-expanded={showDropdown}
            aria-autocomplete="list"
            aria-controls="search-suggestions"
            aria-activedescendant={
              focusedSuggestion >= 0 ? `suggestion-${focusedSuggestion}` : undefined
            }
            autoComplete="off"
            role="combobox"
          />

          {/* Clear Button */}
          {currentValue && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              aria-label="Clear search"
              className="search-clear"
              type="button"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </Button>
          )}

          {/* Submit Button (hidden, for form submission) */}
          <button type="submit" className="sr-only" aria-label="Search">
            Search
          </button>
        </div>
      </form>

      {/* Suggestions Dropdown */}
      {showDropdown && suggestions.length > 0 && (
        <div
          ref={dropdownRef}
          id="search-suggestions"
          className="search-suggestions"
          role="listbox"
          aria-label="Search suggestions"
        >
          {suggestions.map((suggestion, index) => (
            <button
              key={suggestion.id}
              id={`suggestion-${index}`}
              className={`search-suggestion ${focusedSuggestion === index ? 'focused' : ''}`}
              role="option"
              aria-selected={focusedSuggestion === index}
              onClick={() => handleSuggestionClick(suggestion)}
              onMouseEnter={() => setFocusedSuggestion(index)}
              type="button"
            >
              <span className="suggestion-icon" aria-hidden="true">
                {suggestion.icon}
              </span>
              <span className="suggestion-text">{suggestion.text}</span>
              <span className="suggestion-type" aria-hidden="true">
                {suggestion.type}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar;