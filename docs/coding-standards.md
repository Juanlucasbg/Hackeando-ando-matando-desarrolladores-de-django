# Coding Standards

This document outlines the coding standards and best practices for the Google Maps Clone application. Following these standards ensures code quality, maintainability, and consistency across the project.

## Table of Contents

1. [General Principles](#general-principles)
2. [TypeScript Standards](#typescript-standards)
3. [React Component Standards](#react-component-standards)
4. [CSS and Styling Standards](#css-and-styling-standards)
5. [File and Folder Structure](#file-and-folder-structure)
6. [Naming Conventions](#naming-conventions)
7. [Error Handling](#error-handling)
8. [Performance Guidelines](#performance-guidelines)
9. [Testing Standards](#testing-standards)
10. [Git and Version Control](#git-and-version-control)

## General Principles

### Code Philosophy

- **Readability First**: Code should be easy to read and understand
- **Consistency**: Follow established patterns throughout the codebase
- **Simplicity**: Prefer simple solutions over complex ones
- **Maintainability**: Write code that future developers can easily modify
- **Performance**: Consider performance implications without premature optimization

### Core Values

1. **Clean Code**: Write self-documenting code with clear intent
2. **DRY Principle**: Don't Repeat Yourself - reuse components and logic
3. **SOLID Principles**: Follow SOLID principles for object-oriented design
4. **Testability**: Write code that's easy to test
5. **Accessibility**: Ensure code is accessible to all users

## TypeScript Standards

### Type Definitions

**Use Interface for Object Shapes:**
```typescript
// Good
interface Location {
  lat: number;
  lng: number;
  address?: string;
  placeId?: string;
}

interface SearchState {
  query: string;
  results: AutocompletePrediction[];
  isLoading: boolean;
  error: string | null;
}

// Avoid
type Location = {
  lat: number;
  lng: number;
  address?: string;
  placeId?: string;
};
```

**Use Type for Primitive or Union Types:**
```typescript
// Good
type Theme = 'light' | 'dark' | 'auto';
type StatusCode = 200 | 201 | 400 | 401 | 404 | 500;

// Avoid
interface Theme {
  type: 'light' | 'dark' | 'auto';
}
```

### Generic Types

**Use Generics for Reusable Components:**
```typescript
// Good
interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}

interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

// Usage
const userResponse: ApiResponse<User> = await api.get('/users');
const paginatedUsers: PaginatedResponse<User> = await api.get('/users?page=1');
```

### Strict Typing

**Enable Strict TypeScript Configuration:**
```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noImplicitReturns": true,
    "noImplicitThis": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

**Type All Function Parameters and Return Types:**
```typescript
// Good
const calculateDistance = (
  origin: Location,
  destination: Location,
  unit: 'km' | 'miles' = 'km'
): number => {
  // Implementation
};

// Avoid
const calculateDistance = (origin, destination, unit = 'km') => {
  // Implementation
};
```

### Utility Types

**Use TypeScript Utility Types:**
```typescript
// Good
interface User {
  id: string;
  name: string;
  email: string;
  password: string;
}

type PublicUser = Omit<User, 'password'>;
type UserUpdate = Partial<Pick<User, 'name' | 'email'>>;

// Usage
const updateUser = async (id: string, updates: UserUpdate): Promise<PublicUser> => {
  // Implementation
};
```

## React Component Standards

### Functional Components

**Use Functional Components with Hooks:**
```typescript
// Good
import React, { useState, useEffect, useCallback } from 'react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  placeholder = 'Search...',
  disabled = false
}) => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setIsLoading(true);
      onSearch(query.trim());
    }
  }, [query, onSearch]);

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
      />
      <button type="submit" disabled={disabled || !query.trim()}>
        Search
      </button>
    </form>
  );
};

export default SearchBar;
```

### Props Interface

**Define Clear Prop Interfaces:**
```typescript
// Good
interface MapContainerProps {
  initialCenter?: Location;
  initialZoom?: number;
  height?: string | number;
  showControls?: boolean;
  onMapLoad?: (map: google.maps.Map) => void;
  onLocationClick?: (location: Location) => void;
  children?: React.ReactNode;
  className?: string;
}

// Include JSDoc comments for complex props
interface MapContainerProps {
  /** Initial map center coordinates */
  initialCenter?: Location;
  /** Initial zoom level (1-20) */
  initialZoom?: number;
  /** Container height in CSS units */
  height?: string | number;
  /** Show built-in map controls */
  showControls?: boolean;
  /** Callback when map finishes loading */
  onMapLoad?: (map: google.maps.Map) => void;
  /** Callback when location is clicked */
  onLocationClick?: (location: Location) => void;
  /** Child components to render on map */
  children?: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
}
```

### Component Structure

**Follow a Consistent Component Structure:**
```typescript
// 1. Imports (external libraries first)
import React, { useState, useEffect, useCallback } from 'react';
import { SomeExternalComponent } from 'external-library';

// 2. Local imports
import { SomeLocalComponent } from '../components';
import { useSomeHook } from '../hooks';
import { SomeType } from '../types';
import { someUtility } from '../utils';

// 3. Types and interfaces
interface ComponentProps {
  // Props definition
}

// 4. Component implementation
const Component: React.FC<ComponentProps> = ({ prop1, prop2 }) => {
  // 5. Hooks (in order of dependency)
  const [state, setState] = useState();
  const { data, loading } = useSomeHook();

  // 6. Event handlers
  const handleClick = useCallback(() => {
    // Handler implementation
  }, [dependency]);

  // 7. Effects
  useEffect(() => {
    // Effect implementation
  }, [dependency]);

  // 8. Derived values
  const derivedValue = useMemo(() => {
    // Calculation
  }, [dependency]);

  // 9. Render
  return (
    <div>
      {/* JSX content */}
    </div>
  );
};

export default Component;
```

### Custom Hooks

**Create Reusable Custom Hooks:**
```typescript
// Good
import { useState, useEffect, useCallback } from 'react';
import { geocodingService } from '../services/geocodingService';

interface UseGeocodingOptions {
  debounceMs?: number;
  minQueryLength?: number;
}

interface UseGeocodingReturn {
  predictions: AutocompletePrediction[];
  isLoading: boolean;
  error: string | null;
  search: (query: string) => void;
  clearResults: () => void;
}

export const useGeocoding = (options: UseGeocodingOptions = {}): UseGeocodingReturn => {
  const { debounceMs = 300, minQueryLength = 2 } = options;

  const [predictions, setPredictions] = useState<AutocompletePrediction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(
    debounce(async (query: string) => {
      if (query.length < minQueryLength) {
        setPredictions([]);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const results = await geocodingService.getAutocompletePredictions({ input: query });
        setPredictions(results);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Search failed');
        setPredictions([]);
      } finally {
        setIsLoading(false);
      }
    }, debounceMs),
    [minQueryLength]
  );

  const clearResults = useCallback(() => {
    setPredictions([]);
    setError(null);
  }, []);

  return { predictions, isLoading, error, search, clearResults };
};

// Utility function
function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
```

## CSS and Styling Standards

### Tailwind CSS Guidelines

**Use Utility Classes for Styling:**
```typescript
// Good
const Button: React.FC<ButtonProps> = ({ variant = 'primary', size = 'md', children }) => {
  const baseClasses = 'font-medium rounded-lg transition-colors focus:outline-none focus:ring-2';

  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      className={clsx(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size]
      )}
    >
      {children}
    </button>
  );
};
```

### Component-Specific Styles

**Use CSS Modules for Complex Components:**
```typescript
// Component.module.css
.mapContainer {
  @apply relative w-full h-full overflow-hidden;
}

.mapControls {
  @apply absolute top-4 right-4 flex flex-col gap-2 z-10;
}

.searchOverlay {
  @apply absolute top-4 left-4 right-4 z-20;
  @apply bg-white rounded-lg shadow-lg p-4;
}

// Component.tsx
import styles from './Component.module.css';

const MapComponent: React.FC = () => {
  return (
    <div className={styles.mapContainer}>
      <div className={styles.mapControls}>
        {/* Controls */}
      </div>
      <div className={styles.searchOverlay}>
        {/* Search */}
      </div>
    </div>
  );
};
```

### Responsive Design

**Mobile-First Approach:**
```typescript
const ResponsiveComponent: React.FC = () => {
  return (
    <div className="w-full p-4 sm:p-6 md:p-8 lg:p-12">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        <div className="text-sm sm:text-base md:text-lg lg:text-xl">
          Responsive text
        </div>
      </div>
    </div>
  );
};
```

### Dark Mode Support

**Implement Dark Mode with Tailwind:**
```typescript
const ThemeAwareComponent: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
        Dark Mode Supported
      </h1>
      <button className="bg-blue-600 dark:bg-blue-500 text-white hover:bg-blue-700 dark:hover:bg-blue-600">
        Interactive Button
      </button>
    </div>
  );
};
```

## File and Folder Structure

### Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Basic UI elements (Button, Input, etc.)
│   ├── map/            # Map-specific components
│   ├── search/         # Search-related components
│   └── features/       # Feature-specific components
├── hooks/              # Custom React hooks
├── services/           # API services and external integrations
├── stores/             # State management (Zustand)
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
├── constants/          # Application constants
├── styles/             # Global styles and CSS
├── assets/             # Static assets (images, icons)
├── pages/              # Page components
├── layouts/            # Layout components
└── test/               # Test utilities and mocks
```

### File Naming Conventions

**Component Files:**
- Use PascalCase for component files: `SearchBar.tsx`
- Use camelCase for utility files: `geocodingService.ts`
- Use kebab-case for documentation: `api-integration.md`

**Index Files:**
- Use index.ts for barrel exports:
```typescript
// components/ui/index.ts
export { Button } from './Button';
export { Input } from './Input';
export { Modal } from './Modal';
```

### Import Organization

**Group Imports Logically:**
```typescript
// 1. React imports
import React, { useState, useEffect } from 'react';

// 2. Third-party library imports
import { GoogleMap, useJsApiLoader } from '@react-google-maps/api';
import axios from 'axios';

// 3. Internal imports (absolute paths)
import { Button } from '@/components/ui';
import { useGeocoding } from '@/hooks';
import { Location } from '@/types';

// 4. Relative imports (for closely related files)
import { MapStyles } from './mapStyles';
import './Component.css';
```

## Naming Conventions

### Variables and Functions

**Use Descriptive Names:**
```typescript
// Good
const isLoading = false;
const searchResults = [];
const calculateDistance = (origin: Location, destination: Location) => {};

// Avoid
const flag = false;
const data = [];
const calc = (a: Location, b: Location) => {};
```

**Use camelCase for Variables and Functions:**
```typescript
const mapCenter = { lat: 40.7128, lng: -74.0060 };
const getUserLocation = () => navigator.geolocation.getCurrentPosition();
const formatAddress = (address: string) => address.trim();
```

### Constants

**Use UPPER_SNAKE_CASE for Constants:**
```typescript
// Good
const API_BASE_URL = 'https://api.example.com';
const MAX_SEARCH_RESULTS = 10;
const DEFAULT_ZOOM_LEVEL = 13;

// For constants that are configuration objects
const MAP_CONFIG = {
  defaultCenter: { lat: 40.7128, lng: -74.0060 },
  defaultZoom: 13,
  minZoom: 3,
  maxZoom: 20,
};
```

### Interfaces and Types

**Use PascalCase for Types and Interfaces:**
```typescript
// Good
interface Location {
  lat: number;
  lng: number;
}

type SearchStatus = 'idle' | 'loading' | 'success' | 'error';

type ApiResponse<T> = {
  data: T;
  status: number;
};

// Avoid generic names
interface Data { /* ... */ }  // Bad
interface LocationData { /* ... */ }  // Good
```

### Enum and Union Types

**Use PascalCase for Enums:**
```typescript
// Good
enum MapType {
  Roadmap = 'roadmap',
  Satellite = 'satellite',
  Terrain = 'terrain',
  Hybrid = 'hybrid',
}

// Or use union types
type MapType = 'roadmap' | 'satellite' | 'terrain' | 'hybrid';
```

## Error Handling

### Error Types

**Create Custom Error Types:**
```typescript
// Good
export class GeocodingError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'GeocodingError';
  }
}

export class NetworkError extends Error {
  constructor(message: string, public originalError?: Error) {
    super(message);
    this.name = 'NetworkError';
  }
}
```

### Error Boundaries

**Implement Error Boundaries:**
```typescript
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);

    // Send to error reporting service
    if (process.env.NODE_ENV === 'production') {
      // Sentry.captureException(error, { extra: errorInfo });
    }
  }

  public render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Something went wrong
              </h1>
              <p className="text-gray-600 mb-4">
                We're sorry, but something unexpected happened.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Reload Page
              </button>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
```

### Async Error Handling

**Handle Async Errors Properly:**
```typescript
// Good
const useGeocoding = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<Location[]>([]);

  const search = async (query: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const results = await geocodingService.search(query);
      setResults(results);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Search failed';
      setError(errorMessage);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  return { search, isLoading, error, results };
};

// Avoid
const search = async (query: string) => {
  setIsLoading(true);
  const results = await geocodingService.search(query); // No error handling
  setResults(results);
  setIsLoading(false);
};
```

## Performance Guidelines

### React Optimization

**Use React.memo for Expensive Components:**
```typescript
// Good
import React, { memo } from 'react';

interface MapMarkerProps {
  position: Location;
  title: string;
  icon: string;
  onClick: (position: Location) => void;
}

const MapMarker: React.FC<MapMarkerProps> = memo(({
  position,
  title,
  icon,
  onClick
}) => {
  return (
    <div onClick={() => onClick(position)}>
      {/* Marker content */}
    </div>
  );
});

MapMarker.displayName = 'MapMarker';

export default MapMarker;
```

**Use useMemo and useCallback:**
```typescript
// Good
const SearchResults: React.FC<SearchResultsProps> = ({
  results,
  onSelect
}) => {
  const filteredResults = useMemo(() => {
    return results.filter(result =>
      result.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [results, searchQuery]);

  const handleSelect = useCallback((result: SearchResult) => {
    onSelect(result);
  }, [onSelect]);

  return (
    <div>
      {filteredResults.map(result => (
        <ResultItem
          key={result.id}
          result={result}
          onSelect={handleSelect}
        />
      ))}
    </div>
  );
};
```

### Code Splitting

**Lazy Load Components:**
```typescript
// Good
import { lazy, Suspense } from 'react';

const MapComponent = lazy(() => import('./MapComponent'));
const StreetView = lazy(() => import('./StreetView'));
const SettingsPanel = lazy(() => import('./SettingsPanel'));

const App: React.FC = () => {
  return (
    <div>
      <Suspense fallback={<div>Loading map...</div>}>
        <MapComponent />
      </Suspense>

      <Suspense fallback={<div>Loading street view...</div>}>
        <StreetView />
      </Suspense>

      <Suspense fallback={<div>Loading settings...</div>}>
        <SettingsPanel />
      </Suspense>
    </div>
  );
};
```

### API Optimization

**Implement Caching:**
```typescript
// Good
class GeocodingService {
  private cache = new Map<string, Promise<Location[]>>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  async search(query: string): Promise<Location[]> {
    const cacheKey = query.toLowerCase().trim();

    // Check cache
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    // Create new request
    const request = this.makeApiRequest(query);

    // Cache the promise
    this.cache.set(cacheKey, request);

    // Clear cache after TTL
    setTimeout(() => {
      this.cache.delete(cacheKey);
    }, this.CACHE_TTL);

    return request;
  }

  private async makeApiRequest(query: string): Promise<Location[]> {
    // Actual API call implementation
  }
}
```

## Testing Standards

### Test Structure

**Follow AAA Pattern (Arrange, Act, Assert):**
```typescript
// Good
describe('SearchBar', () => {
  it('should call onSearch when form is submitted', async () => {
    // Arrange
    const mockOnSearch = jest.fn();
    render(<SearchBar onSearch={mockOnSearch} />);

    const input = screen.getByPlaceholderText(/search/i);
    const form = input.closest('form');

    // Act
    await userEvent.type(input, 'New York');
    await userEvent.click(form!);

    // Assert
    expect(mockOnSearch).toHaveBeenCalledWith('New York');
  });
});
```

### Test Naming

**Use Descriptive Test Names:**
```typescript
// Good
describe('GeocodingService', () => {
  describe('search', () => {
    it('should return location results for valid address', async () => {});
    it('should throw error for invalid address', async () => {});
    it('should cache results for repeated queries', async () => {});
    it('should handle network errors gracefully', async () => {});
  });
});

// Avoid
describe('GeocodingService', () => {
  it('works', async () => {});
  it('handles error', async () => {});
  it('caches', async () => {});
});
```

### Test Coverage

**Test Critical Paths:**
```typescript
// Good - Test happy path and edge cases
describe('useGeocoding', () => {
  it('should return results for successful search', async () => {});
  it('should handle empty search query', async () => {});
  it('should handle API errors', async () => {});
  it('should debounce search requests', async () => {});
  it('should clear results when requested', async () => {});
});
```

## Git and Version Control

### Commit Messages

**Follow Conventional Commits:**
```
feat: add location bookmarking feature
fix: resolve geocoding timeout issue
docs: update API documentation
style: format code with prettier
refactor: extract geocoding logic to service
test: add unit tests for search component
chore: update dependencies
```

### Branch Naming

**Use Descriptive Branch Names:**
```
feature/user-authentication
feature/map-clustering
fix/geocoding-error-handling
fix/mobile-responsive-issues
docs/api-documentation-update
refactor/state-management-migration
```

### Pull Request Guidelines

**PR Template:**
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] E2E tests pass
- [ ] Manual testing completed

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No console errors
- [ ] Performance impact considered
```

## Code Review Standards

### Review Checklist

**Functionality:**
- [ ] Code works as intended
- [ ] Edge cases are handled
- [ ] Error handling is appropriate
- [ ] No memory leaks or performance issues

**Code Quality:**
- [ ] Code is readable and maintainable
- [ ] Follows project conventions
- [ ] No redundant or dead code
- [ ] Proper TypeScript usage

**Security:**
- [ ] No sensitive data exposed
- [ ] Input validation implemented
- [ ] API keys are secure
- [ ] XSS prevention in place

**Testing:**
- [ ] Tests cover critical paths
- [ ] Test names are descriptive
- [ ] Tests are maintainable
- [ ] No test smells

This coding standards document ensures consistency and quality across the Google Maps Clone application. All team members should follow these guidelines when contributing to the codebase.