# Testing Guide

This comprehensive guide covers all aspects of testing for the Google Maps Clone application, including unit tests, component tests, integration tests, and end-to-end testing.

## Testing Strategy Overview

We follow the Testing Pyramid approach:

```
                 E2E Tests (10%)
               ┌─────────────────┐
              │   User Journey   │
             │     Testing      │
            └─────────────────┘
          Integration Tests (20%)
        ┌─────────────────────────────┐
       │     Component Integration     │
      │       API Integration         │
     └─────────────────────────────┘
          Unit Tests (70%)
    ┌─────────────────────────────────────┐
   │     Component Logic Testing          │
  │       Utility Function Testing       │
 │         Hook Testing                  │
└─────────────────────────────────────┘
```

## Testing Stack

### Frameworks and Tools

- **Vitest** - Unit and component testing framework
- **Testing Library** - React component testing utilities
- **Playwright** - End-to-end testing framework
- **MSW (Mock Service Worker)** - API mocking
- **Jest Matchers** - Additional matchers for assertions
- **Storybook** - Component testing and documentation

### Configuration Files

#### Vitest Configuration

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        'dist/',
        'coverage/',
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@components': resolve(__dirname, './src/components'),
      '@hooks': resolve(__dirname, './src/hooks'),
      '@services': resolve(__dirname, './src/services'),
      '@utils': resolve(__dirname, './src/utils'),
      '@types': resolve(__dirname, './src/types'),
    },
  },
});
```

#### Test Setup File

```typescript
// src/test/setup.ts
import '@testing-library/jest-dom';
import { beforeAll, afterEach, afterAll } from 'vitest';
import { cleanup } from '@testing-library/react';
import { server } from './mocks/server';

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Mock Google Maps API
window.google = {
  maps: {
    Map: class Map {
      addListener = jest.fn();
      getCenter = jest.fn();
      getZoom = jest.fn();
      setCenter = jest.fn();
      setZoom = jest.fn();
      fitBounds = jest.fn();
    },
    Geocoder: class Geocoder {
      geocode = jest.fn();
    },
    GeocoderStatus: {
      OK: 'OK',
      ZERO_RESULTS: 'ZERO_RESULTS',
      OVER_QUERY_LIMIT: 'OVER_QUERY_LIMIT',
    },
    places: {
      AutocompleteService: class AutocompleteService {
        getPlacePredictions = jest.fn();
      },
      PlacesServiceStatus: {
        OK: 'OK',
      },
    },
    LatLng: class LatLng {
      constructor(public lat: number, public lng: number) {}
      lat = () => this.lat;
      lng = () => this.lng;
    },
    LatLngBounds: class LatLngBounds {
      constructor() {}
      getCenter = jest.fn();
      getNorthEast = jest.fn();
      getSouthWest = jest.fn();
    },
  },
} as any;

// Setup MSW server
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
  cleanup();
  server.resetHandlers();
});
afterAll(() => server.close());
```

## Unit Testing

### Component Testing

#### Button Component Tests

```typescript
// src/components/ui/__tests__/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '../Button';

describe('Button Component', () => {
  const user = userEvent.setup();

  it('renders with correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  it('applies correct variant styles', () => {
    render(<Button variant="primary">Primary Button</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-blue-600', 'text-white');
  });

  it('applies correct size styles', () => {
    render(<Button size="lg">Large Button</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('px-6', 'py-3', 'text-lg');
  });

  it('calls onClick when clicked', async () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    await user.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled Button</Button>);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('shows loading state', () => {
    render(<Button loading>Loading Button</Button>);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('renders icon correctly', () => {
    const Icon = () => <span data-testid="test-icon">Icon</span>;
    render(<Button icon={<Icon />}>With Icon</Button>);

    expect(screen.getByTestId('test-icon')).toBeInTheDocument();
    expect(screen.getByText('With Icon')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<Button className="custom-class">Custom Button</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('custom-class');
  });

  it('handles keyboard events', async () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    const button = screen.getByRole('button');
    await user.tab(); // Focus the button
    await user.keyboard('{Enter}');

    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

#### Input Component Tests

```typescript
// src/components/ui/__tests__/Input.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from '../Input';

describe('Input Component', () => {
  const user = userEvent.setup();

  it('renders with correct placeholder', () => {
    render(<Input placeholder="Enter text" />);
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
  });

  it('calls onChange when value changes', async () => {
    const handleChange = jest.fn();
    render(<Input value="" onChange={handleChange} />);

    const input = screen.getByRole('textbox');
    await user.type(input, 'Hello');

    expect(handleChange).toHaveBeenCalledWith('Hello');
  });

  it('displays error state', () => {
    render(<Input error="This field is required" />);
    expect(screen.getByText('This field is required')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
  });

  it('shows helper text', () => {
    render(<Input helperText="Enter your email address" />);
    expect(screen.getByText('Enter your email address')).toBeInTheDocument();
  });

  it('is disabled when disabled prop is true', () => {
    render(<Input disabled />);
    expect(screen.getByRole('textbox')).toBeDisabled();
  });

  it('handles different input types', () => {
    render(<Input type="email" />);
    expect(screen.getByRole('textbox')).toHaveAttribute('type', 'email');
  });

  it('applies custom className', () => {
    render(<Input className="custom-input" />);
    expect(screen.getByRole('textbox')).toHaveClass('custom-input');
  });

  it('calls onBlur when focus is lost', async () => {
    const handleBlur = jest.fn();
    render(<Input onBlur={handleBlur} />);

    const input = screen.getByRole('textbox');
    await user.click(input);
    await user.tab(); // Move focus away

    expect(handleBlur).toHaveBeenCalledTimes(1);
  });
});
```

### Hook Testing

#### useGeocoding Hook Tests

```typescript
// src/hooks/__tests__/useGeocoding.test.tsx
import { renderHook, waitFor } from '@testing-library/react';
import { useGeocoding } from '../useGeocoding';
import { geocodingService } from '../../services/geocodingService';
import { GeocodingResult, AutocompletePrediction } from '../../types/search.types';

// Mock the geocoding service
jest.mock('../../services/geocodingService');
const mockGeocodingService = geocodingService as jest.Mocked<typeof geocodingService>;

describe('useGeocoding Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('initializes with correct default state', () => {
    const { result } = renderHook(() => useGeocoding());

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(null);
    expect(result.current.results).toEqual([]);
    expect(result.current.predictions).toEqual([]);
    expect(result.current.placeDetails).toBe(null);
  });

  it('geocodes address successfully', async () => {
    const mockResults: GeocodingResult[] = [{
      location: { lat: 40.7128, lng: -74.0060 },
      formattedAddress: 'New York, NY, USA',
      placeId: 'test-place-id',
      addressComponents: [],
      types: [],
    }];

    mockGeocodingService.geocode.mockResolvedValue(mockResults);

    const { result } = renderHook(() => useGeocoding());

    await waitFor(async () => {
      const results = await result.current.geocode({ address: 'New York' });
      expect(results).toEqual(mockResults);
      expect(result.current.results).toEqual(mockResults);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe(null);
    });

    expect(mockGeocodingService.geocode).toHaveBeenCalledWith({ address: 'New York' });
  });

  it('handles geocoding errors', async () => {
    const mockError = new Error('Geocoding failed');
    mockGeocodingService.geocode.mockRejectedValue(mockError);

    const { result } = renderHook(() => useGeocoding());

    await expect(result.current.geocode({ address: 'Invalid Address' })).rejects.toThrow('Geocoding failed');

    expect(result.current.error).toBe('Geocoding failed');
    expect(result.current.isLoading).toBe(false);
    expect(result.current.results).toEqual([]);
  });

  it('gets autocomplete predictions', async () => {
    const mockPredictions: AutocompletePrediction[] = [{
      placeId: 'test-place-id',
      description: 'New York, NY, USA',
      mainText: 'New York',
      secondaryText: 'NY, USA',
      terms: [],
      types: [],
    }];

    mockGeocodingService.getAutocompletePredictions.mockResolvedValue(mockPredictions);

    const { result } = renderHook(() => useGeocoding());

    await waitFor(async () => {
      const predictions = await result.current.getPredictions('New York');
      expect(predictions).toEqual(mockPredictions);
      expect(result.current.predictions).toEqual(mockPredictions);
    });

    expect(mockGeocodingService.getAutocompletePredictions).toHaveBeenCalledWith({
      input: 'New York',
    });
  });

  it('does not fetch predictions for short input', async () => {
    const { result } = renderHook(() => useGeocoding());

    await result.current.getPredictions('N');

    expect(mockGeocodingService.getAutocompletePredictions).not.toHaveBeenCalled();
    expect(result.current.predictions).toEqual([]);
  });

  it('gets place details', async () => {
    const mockPlaceDetails = {
      placeId: 'test-place-id',
      name: 'Test Place',
      address: 'Test Address',
      location: { lat: 40.7128, lng: -74.0060 },
      types: [],
    };

    mockGeocodingService.getPlaceDetails.mockResolvedValue(mockPlaceDetails);

    const { result } = renderHook(() => useGeocoding());

    await waitFor(async () => {
      const details = await result.current.getPlaceDetails('test-place-id');
      expect(details).toEqual(mockPlaceDetails);
      expect(result.current.placeDetails).toEqual(mockPlaceDetails);
    });

    expect(mockGeocodingService.getPlaceDetails).toHaveBeenCalledWith('test-place-id');
  });

  it('clears results', () => {
    const { result } = renderHook(() => useGeocoding());

    // Set some initial state
    result.current.clearResults();

    expect(result.current.results).toEqual([]);
    expect(result.current.predictions).toEqual([]);
    expect(result.current.placeDetails).toBe(null);
  });

  it('clears errors', () => {
    const { result } = renderHook(() => useGeocoding());

    // Simulate an error state
    result.current.clearError();

    expect(result.current.error).toBe(null);
  });
});
```

### Service Testing

#### Geocoding Service Tests

```typescript
// src/services/__tests__/geocodingService.test.ts
import { GeocodingService } from '../geocodingService';
import { Loader } from '@googlemaps/js-api-loader';

// Mock the Google Maps loader
jest.mock('@googlemaps/js-api-loader');
const MockLoader = Loader as jest.MockedClass<typeof Loader>;

describe('GeocodingService', () => {
  let geocodingService: GeocodingService;
  let mockMaps: any;
  let mockGeocoder: any;
  let mockAutocompleteService: any;
  let mockPlacesService: any;

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup mock Google Maps objects
    mockGeocoder = {
      geocode: jest.fn(),
    };

    mockAutocompleteService = {
      getPlacePredictions: jest.fn(),
    };

    mockPlacesService = {
      getDetails: jest.fn(),
    };

    mockMaps = {
      Geocoder: jest.fn().mockReturnValue(mockGeocoder),
      GeocoderStatus: {
        OK: 'OK',
        ZERO_RESULTS: 'ZERO_RESULTS',
        OVER_QUERY_LIMIT: 'OVER_QUERY_LIMIT',
      },
      places: {
        AutocompleteService: jest.fn().mockReturnValue(mockAutocompleteService),
        PlacesServiceStatus: {
          OK: 'OK',
        },
      },
    };

    MockLoader.mockImplementation(() => ({
      load: jest.fn().mockResolvedValue({ maps: mockMaps }),
    }));

    geocodingService = GeocodingService.getInstance();
  });

  describe('geocode', () => {
    it('geocodes address successfully', async () => {
      const mockResponse = [{
        geometry: { location: { lat: () => 40.7128, lng: () => -74.0060 } },
        formatted_address: 'New York, NY, USA',
        place_id: 'test-place-id',
        address_components: [],
        types: [],
      }];

      mockGeocoder.geocode.mockImplementation((request, callback) => {
        callback(mockResponse, 'OK');
      });

      const result = await geocodingService.geocode({ address: 'New York' });

      expect(result).toHaveLength(1);
      expect(result[0].location).toEqual({ lat: 40.7128, lng: -74.0060 });
      expect(result[0].formattedAddress).toBe('New York, NY, USA');
      expect(result[0].placeId).toBe('test-place-id');
    });

    it('handles geocoding errors', async () => {
      mockGeocoder.geocode.mockImplementation((request, callback) => {
        callback([], 'ZERO_RESULTS');
      });

      await expect(geocodingService.geocode({ address: 'Invalid Address' })).rejects.toThrow('No se encontraron resultados');
    });

    it('caches geocoding results', async () => {
      const mockResponse = [{
        geometry: { location: { lat: () => 40.7128, lng: () => -74.0060 } },
        formatted_address: 'New York, NY, USA',
        place_id: 'test-place-id',
        address_components: [],
        types: [],
      }];

      mockGeocoder.geocode.mockImplementation((request, callback) => {
        callback(mockResponse, 'OK');
      });

      // First call
      const result1 = await geocodingService.geocode({ address: 'New York' });

      // Second call should use cache
      const result2 = await geocodingService.geocode({ address: 'New York' });

      expect(mockGeocoder.geocode).toHaveBeenCalledTimes(1);
      expect(result1).toEqual(result2);
    });
  });

  describe('getAutocompletePredictions', () => {
    it('gets predictions successfully', async () => {
      const mockPredictions = [{
        place_id: 'test-place-id',
        description: 'New York, NY, USA',
        structured_formatting: {
          main_text: 'New York',
          secondary_text: 'NY, USA',
        },
        terms: [],
        types: [],
      }];

      mockAutocompleteService.getPlacePredictions.mockImplementation((request, callback) => {
        callback(mockPredictions, 'OK');
      });

      const result = await geocodingService.getAutocompletePredictions({ input: 'New York' });

      expect(result).toHaveLength(1);
      expect(result[0].placeId).toBe('test-place-id');
      expect(result[0].description).toBe('New York, NY, USA');
      expect(result[0].mainText).toBe('New York');
      expect(result[0].secondaryText).toBe('NY, USA');
    });

    it('caches autocomplete predictions', async () => {
      const mockPredictions = [{
        place_id: 'test-place-id',
        description: 'New York, NY, USA',
        structured_formatting: {
          main_text: 'New York',
          secondary_text: 'NY, USA',
        },
        terms: [],
        types: [],
      }];

      mockAutocompleteService.getPlacePredictions.mockImplementation((request, callback) => {
        callback(mockPredictions, 'OK');
      });

      // First call
      const result1 = await geocodingService.getAutocompletePredictions({ input: 'New York' });

      // Second call should use cache
      const result2 = await geocodingService.getAutocompletePredictions({ input: 'New York' });

      expect(mockAutocompleteService.getPlacePredictions).toHaveBeenCalledTimes(1);
      expect(result1).toEqual(result2);
    });
  });

  describe('rate limiting', () => {
    it('limits requests to maximum per second', async () => {
      const mockResponse = [{
        geometry: { location: { lat: () => 40.7128, lng: () => -74.0060 } },
        formatted_address: 'New York, NY, USA',
        place_id: 'test-place-id',
        address_components: [],
        types: [],
      }];

      mockGeocoder.geocode.mockImplementation((request, callback) => {
        callback(mockResponse, 'OK');
      });

      // Make multiple requests quickly
      const promises = Array(60).fill(null).map((_, i) =>
        geocodingService.geocode({ address: `Address ${i}` })
      );

      const results = await Promise.all(promises);

      // Should have made all requests but rate limited them
      expect(results).toHaveLength(60);
      expect(mockGeocoder.geocode).toHaveBeenCalledTimes(60);
    });
  });
});
```

## Component Testing with Storybook

### Button Stories

```typescript
// src/components/ui/Button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'UI/Button',
  component: Button,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A reusable button component with multiple variants and sizes.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'outline', 'ghost', 'danger'],
      description: 'Button style variant',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Button size',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the button is disabled',
    },
    loading: {
      control: 'boolean',
      description: 'Whether to show loading state',
    },
    children: {
      control: 'text',
      description: 'Button content',
    },
  },
  args: {
    onClick: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Default story
export const Default: Story = {
  args: {
    children: 'Button',
  },
};

// Variants
export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Primary Button',
  },
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Secondary Button',
  },
};

export const Outline: Story = {
  args: {
    variant: 'outline',
    children: 'Outline Button',
  },
};

export const Ghost: Story = {
  args: {
    variant: 'ghost',
    children: 'Ghost Button',
  },
};

export const Danger: Story = {
  args: {
    variant: 'danger',
    children: 'Danger Button',
  },
};

// Sizes
export const Small: Story = {
  args: {
    size: 'sm',
    children: 'Small Button',
  },
};

export const Medium: Story = {
  args: {
    size: 'md',
    children: 'Medium Button',
  },
};

export const Large: Story = {
  args: {
    size: 'lg',
    children: 'Large Button',
  },
};

// States
export const Disabled: Story = {
  args: {
    disabled: true,
    children: 'Disabled Button',
  },
};

export const Loading: Story = {
  args: {
    loading: true,
    children: 'Loading Button',
  },
};

// With Icons
export const WithLeftIcon: Story = {
  args: {
    icon: <span>🔍</span>,
    iconPosition: 'left',
    children: 'Search',
  },
};

export const WithRightIcon: Story = {
  args: {
    icon: <span>→</span>,
    iconPosition: 'right',
    children: 'Next',
  },
};

// Interactive example
export const Interactive: Story = {
  args: {
    children: 'Click me!',
    onClick: () => alert('Button clicked!'),
  },
};

// Component testing example
export const ComponentTesting: Story = {
  args: {
    children: 'Test Button',
    'data-testid': 'test-button',
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByTestId('test-button');

    await expect(button).toBeInTheDocument();
    await userEvent.click(button);
    await expect(args.onClick).toHaveBeenCalled();
  },
};
```

## Integration Testing

### API Integration Tests

```typescript
// src/integration/__tests__/geocoding.integration.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SearchBar } from '../../components/search/SearchBar';
import { server } from '../../test/mocks/server';
import { rest } from 'msw';

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

const renderWithQueryClient = (ui: React.ReactElement) => {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      {ui}
    </QueryClientProvider>
  );
};

describe('Geocoding Integration', () => {
  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('performs full search flow', async () => {
    renderWithQueryClient(<SearchBar onLocationSelect={jest.fn()} />);

    const searchInput = screen.getByPlaceholderText(/search/i);
    await userEvent.type(searchInput, 'New York');

    // Wait for autocomplete predictions
    await waitFor(() => {
      expect(screen.getByText('New York, NY, USA')).toBeInTheDocument();
    });

    // Click on a prediction
    await userEvent.click(screen.getByText('New York, NY, USA'));

    // Verify that the search was successful
    await waitFor(() => {
      expect(searchInput).toHaveValue('New York, NY, USA');
    });
  });

  it('handles API errors gracefully', async () => {
    // Mock API error
    server.use(
      rest.get('https://maps.googleapis.com/maps/api/js', (req, res, ctx) => {
        return res(ctx.status(500));
      })
    );

    renderWithQueryClient(<SearchBar onLocationSelect={jest.fn()} />);

    const searchInput = screen.getByPlaceholderText(/search/i);
    await userEvent.type(searchInput, 'New York');

    // Should show error message
    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });
  });
});
```

## End-to-End Testing

### Playwright Configuration

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['json', { outputFile: 'playwright-report/results.json' }],
    ['junit', { outputFile: 'playwright-report/results.xml' }],
  ],
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
});
```

### E2E Test Examples

#### Map Interaction Tests

```typescript
// e2e/maps.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Map Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="map-container"]');
  });

  test('loads map successfully', async ({ page }) => {
    const mapContainer = page.getByTestId('map-container');
    await expect(mapContainer).toBeVisible();

    // Check if Google Maps is loaded
    const mapElement = page.locator('.gm-style');
    await expect(mapElement).toBeVisible();
  });

  test('searches for location', async ({ page }) => {
    const searchInput = page.getByPlaceholderText(/search/i);
    await searchInput.fill('New York');

    // Wait for autocomplete suggestions
    await page.waitForSelector('[data-testid="autocomplete-suggestions"]');

    // Click on first suggestion
    await page.locator('[data-testid="autocomplete-suggestion"]').first().click();

    // Verify map center changed (wait for map to update)
    await page.waitForTimeout(2000);

    // Check if map updated (you can verify by checking map bounds or markers)
    const mapContainer = page.getByTestId('map-container');
    await expect(mapContainer).toBeVisible();
  });

  test('zooms in and out', async ({ page }) => {
    const mapContainer = page.getByTestId('map-container');

    // Get initial zoom level (you'll need to expose this via a data attribute or API)
    const initialZoom = await page.getAttribute(mapContainer, 'data-zoom');

    // Click zoom in button
    await page.click('[data-testid="zoom-in-button"]');
    await page.waitForTimeout(1000);

    const zoomedIn = await page.getAttribute(mapContainer, 'data-zoom');
    expect(parseInt(zoomedIn || '0')).toBeGreaterThan(parseInt(initialZoom || '0'));

    // Click zoom out button
    await page.click('[data-testid="zoom-out-button"]');
    await page.waitForTimeout(1000);

    const zoomedOut = await page.getAttribute(mapContainer, 'data-zoom');
    expect(parseInt(zoomedOut || '0')).toBeLessThanOrEqual(parseInt(initialZoom || '0'));
  });

  test('adds markers on map click', async ({ page }) => {
    const mapContainer = page.getByTestId('map-container');

    // Click on the map
    await mapContainer.click({ position: { x: 400, y: 300 } });

    // Check if marker was added
    const marker = page.locator('[data-testid="map-marker"]');
    await expect(marker).toBeVisible();
  });

  test('opens info window on marker click', async ({ page }) => {
    const mapContainer = page.getByTestId('map-container');

    // Add a marker first
    await mapContainer.click({ position: { x: 400, y: 300 } });

    // Click on the marker
    const marker = page.locator('[data-testid="map-marker"]');
    await marker.click();

    // Check if info window opened
    const infoWindow = page.locator('[data-testid="info-window"]');
    await expect(infoWindow).toBeVisible();
  });
});
```

#### Search Functionality Tests

```typescript
// e2e/search.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Search Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('searches and navigates to location', async ({ page }) => {
    const searchInput = page.getByPlaceholderText(/search/i);

    // Type search query
    await searchInput.fill('Times Square');

    // Wait for autocomplete
    await page.waitForSelector('[data-testid="autocomplete-suggestion"]');

    // Click on first suggestion
    await page.locator('[data-testid="autocomplete-suggestion"]').first().click();

    // Verify navigation (check URL or map center)
    await page.waitForTimeout(2000);

    // Should show location info
    const locationInfo = page.locator('[data-testid="location-info"]');
    await expect(locationInfo).toBeVisible();
  });

  test('searches by coordinates', async ({ page }) => {
    // Open coordinate input
    await page.click('[data-testid="coordinate-search-toggle"]');

    // Enter coordinates
    await page.fill('[data-testid="latitude-input"]', '40.7128');
    await page.fill('[data-testid="longitude-input"]', '-74.0060');

    // Submit search
    await page.click('[data-testid="coordinate-search-button"]');

    // Verify navigation to coordinates
    await page.waitForTimeout(2000);

    // Should show location info
    const locationInfo = page.locator('[data-testid="location-info"]');
    await expect(locationInfo).toBeVisible();
  });

  test('shows search history', async ({ page }) => {
    const searchInput = page.getByPlaceholderText(/search/i);

    // Perform a search
    await searchInput.fill('Central Park');
    await page.waitForSelector('[data-testid="autocomplete-suggestion"]');
    await page.locator('[data-testid="autocomplete-suggestion"]').first().click();
    await page.waitForTimeout(1000);

    // Clear search
    await searchInput.clear();

    // Focus search input to show history
    await searchInput.focus();

    // Should show search history
    const historyItem = page.locator('[data-testid="search-history-item"]');
    await expect(historyItem).toBeVisible();

    // Click on history item
    await historyItem.first().click();

    // Should navigate to previous search
    await page.waitForTimeout(2000);
  });

  test('handles no results gracefully', async ({ page }) => {
    const searchInput = page.getByPlaceholderText(/search/i);

    // Search for something that doesn't exist
    await searchInput.fill('NonexistentPlace12345');

    // Wait for search to complete
    await page.waitForTimeout(1000);

    // Should show no results message
    const noResults = page.locator('[data-testid="no-results"]');
    await expect(noResults).toBeVisible();
  });
});
```

#### Responsive Design Tests

```typescript
// e2e/responsive.spec.ts
import { test, expect, devices } from '@playwright/test';

test.describe('Responsive Design', () => {
  test('works on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.goto('/');

    // Check desktop layout
    const sidebar = page.locator('[data-testid="sidebar"]');
    await expect(sidebar).toBeVisible();

    const mapContainer = page.locator('[data-testid="map-container"]');
    await expect(mapContainer).toBeVisible();
  });

  test('works on tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');

    // Check tablet layout
    const sidebar = page.locator('[data-testid="sidebar"]');
    await expect(sidebar).toBeVisible();

    // Might be collapsed or repositioned
    expect(await sidebar.isVisible()).toBeTruthy();
  });

  test('works on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Check mobile layout
    const sidebar = page.locator('[data-testid="sidebar"]');

    // Sidebar might be hidden or overlay on mobile
    const mobileMenuButton = page.locator('[data-testid="mobile-menu-button"]');
    if (await mobileMenuButton.isVisible()) {
      await mobileMenuButton.click();
      await expect(sidebar).toBeVisible();
    }

    const mapContainer = page.locator('[data-testid="map-container"]');
    await expect(mapContainer).toBeVisible();
  });

  test('search works on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Open mobile search
    const mobileSearchButton = page.locator('[data-testid="mobile-search-button"]');
    if (await mobileSearchButton.isVisible()) {
      await mobileSearchButton.click();
    }

    const searchInput = page.getByPlaceholderText(/search/i);
    await expect(searchInput).toBeVisible();

    // Perform search
    await searchInput.fill('New York');
    await page.waitForSelector('[data-testid="autocomplete-suggestion"]');
    await page.locator('[data-testid="autocomplete-suggestion"]').first().click();

    // Should work on mobile
    await page.waitForTimeout(2000);
    const mapContainer = page.locator('[data-testid="map-container"]');
    await expect(mapContainer).toBeVisible();
  });
});
```

#### Accessibility Tests

```typescript
// e2e/accessibility.spec.ts
import { test, expect } from '@playwright/test';
import { injectAxe, checkA11y } from 'axe-playwright';

test.describe('Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await injectAxe(page);
  });

  test('home page should be accessible', async ({ page }) => {
    await checkA11y(page);
  });

  test('search should be accessible', async ({ page }) => {
    const searchInput = page.getByPlaceholderText(/search/i);
    await searchInput.focus();

    // Check search accessibility
    await checkA11y(page, null, {
      detailedReport: true,
      detailedReportOptions: { html: true },
    });
  });

  test('keyboard navigation works', async ({ page }) => {
    // Tab through interactive elements
    await page.keyboard.press('Tab');

    // Should focus on first interactive element
    const focusedElement = await page.locator(':focus');
    await expect(focusedElement).toBeVisible();

    // Continue tabbing
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab');
      const currentFocus = await page.locator(':focus');
      await expect(currentFocus).toBeVisible();
    }
  });

  test('screen reader labels are present', async ({ page }) => {
    const searchInput = page.getByPlaceholderText(/search/i);
    await expect(searchInput).toHaveAttribute('aria-label');

    const mapContainer = page.locator('[data-testid="map-container"]');
    await expect(mapContainer).toHaveAttribute('aria-label');

    const zoomButtons = page.locator('[data-testid^="zoom-"]');
    const count = await zoomButtons.count();
    for (let i = 0; i < count; i++) {
      await expect(zoomButtons.nth(i)).toHaveAttribute('aria-label');
    }
  });
});
```

## Performance Testing

### Performance Tests with Playwright

```typescript
// e2e/performance.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Performance', () => {
  test('page loads within performance budget', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/');

    // Wait for map to be fully loaded
    await page.waitForSelector('[data-testid="map-container"]');
    await page.waitForSelector('.gm-style');

    const loadTime = Date.now() - startTime;

    // Should load within 3 seconds
    expect(loadTime).toBeLessThan(3000);

    // Check Core Web Vitals
    const metrics = await page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const vitals = {
            lcp: 0,
            fid: 0,
            cls: 0,
          };

          entries.forEach((entry) => {
            if (entry.entryType === 'largest-contentful-paint') {
              vitals.lcp = entry.startTime;
            } else if (entry.entryType === 'first-input') {
              vitals.fid = entry.processingStart - entry.startTime;
            } else if (entry.entryType === 'layout-shift') {
              vitals.cls += entry.value;
            }
          });

          resolve(vitals);
        }).observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] });
      });
    });

    // Performance thresholds
    expect(metrics.lcp).toBeLessThan(2500); // Largest Contentful Paint < 2.5s
    expect(metrics.fid).toBeLessThan(100);  // First Input Delay < 100ms
    expect(metrics.cls).toBeLessThan(0.1);  // Cumulative Layout Shift < 0.1
  });

  test('search performs well', async ({ page }) => {
    await page.goto('/');

    const searchInput = page.getByPlaceholderText(/search/i);

    // Measure search performance
    const startTime = Date.now();

    await searchInput.fill('New York');
    await page.waitForSelector('[data-testid="autocomplete-suggestion"]');

    const searchTime = Date.now() - startTime;

    // Search should be fast (< 500ms)
    expect(searchTime).toBeLessThan(500);
  });

  test('map interactions are smooth', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="map-container"]');

    const mapContainer = page.locator('[data-testid="map-container"]');

    // Test pan performance
    const startTime = Date.now();

    await mapContainer.hover();
    await page.mouse.down();
    await page.mouse.move(500, 500);
    await page.mouse.up();

    const panTime = Date.now() - startTime;

    // Pan should be smooth (< 100ms)
    expect(panTime).toBeLessThan(100);

    // Test zoom performance
    const zoomStartTime = Date.now();

    await page.click('[data-testid="zoom-in-button"]');

    const zoomTime = Date.now() - zoomStartTime;

    // Zoom should be responsive (< 200ms)
    expect(zoomTime).toBeLessThan(200);
  });
});
```

## Visual Testing

### Visual Regression Tests

```typescript
// e2e/visual.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Visual Testing', () => {
  test('homepage looks correct', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="map-container"]');

    // Take a screenshot and compare with baseline
    await expect(page).toHaveScreenshot('homepage.png');
  });

  test('search results look correct', async ({ page }) => {
    await page.goto('/');

    const searchInput = page.getByPlaceholderText(/search/i);
    await searchInput.fill('New York');
    await page.waitForSelector('[data-testid="autocomplete-suggestion"]');

    // Take screenshot of search results
    const searchResults = page.locator('[data-testid="autocomplete-suggestions"]');
    await expect(searchResults).toHaveScreenshot('search-results.png');
  });

  test('map markers look correct', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="map-container"]');

    // Add a marker
    const mapContainer = page.locator('[data-testid="map-container"]');
    await mapContainer.click({ position: { x: 400, y: 300 } });

    // Take screenshot of map with marker
    await expect(page).toHaveScreenshot('map-with-marker.png');
  });

  test('mobile layout looks correct', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForSelector('[data-testid="map-container"]');

    // Take screenshot of mobile layout
    await expect(page).toHaveScreenshot('mobile-layout.png');
  });
});
```

## Test Scripts and Commands

### Package.json Test Scripts

```json
{
  "scripts": {
    "test": "vitest",
    "test:unit": "vitest run --coverage",
    "test:component": "vitest run --environment jsdom",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:debug": "playwright test --debug",
    "test:e2e:codegen": "playwright codegen",
    "test:performance": "vitest run --config vitest.performance.config.ts",
    "test:watch": "vitest --watch",
    "test:coverage": "vitest run --coverage",
    "test:coverage:ui": "vitest run --coverage --ui",
    "test:ci": "vitest run --coverage --reporter=junit --outputFile=test-results.xml",
    "test:accessibility": "playwright test --config playwright.accessibility.config.ts",
    "test:smoke": "playwright test --config playwright.smoke.config.ts",
    "test:regression": "playwright test --config playwright.regression.config.ts",
    "test:visual": "playwright test --config playwright.visual.config.ts"
  }
}
```

### GitHub Actions CI Configuration

```yaml
# .github/workflows/test.yml
name: Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  unit-tests:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v4

    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Run unit tests
      run: npm run test:coverage

    - name: Upload coverage to Codecov
      uses: codecov/codecov-action@v3
      with:
        file: ./coverage/lcov.info

  e2e-tests:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v4

    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Install Playwright browsers
      run: npx playwright install --with-deps

    - name: Build application
      run: npm run build

    - name: Run E2E tests
      run: npm run test:e2e

    - name: Upload test results
      uses: actions/upload-artifact@v3
      if: failure()
      with:
        name: playwright-report
        path: playwright-report/

  accessibility-tests:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v4

    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Install Playwright browsers
      run: npx playwright install --with-deps

    - name: Run accessibility tests
      run: npm run test:accessibility
```

## Best Practices

### Testing Guidelines

1. **Test User Behavior**: Test what users actually do, not implementation details
2. **Use Meaningful Assertions**: Assert outcomes that matter to users
3. **Keep Tests Isolated**: Each test should be independent
4. **Use Realistic Data**: Use data that resembles real-world usage
5. **Mock External Dependencies**: Mock APIs and external services
6. **Test Error Scenarios**: Don't just test happy paths
7. **Maintain Test Coverage**: Aim for high coverage but focus on critical paths
8. **Review Test Code**: Apply the same standards to test code as production code

### Common Testing Patterns

```typescript
// Custom render function for testing with providers
const customRender = (ui: React.ReactElement, options = {}) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      {ui}
    </QueryClientProvider>,
    options
  );
};

// Re-export testing utilities
export * from '@testing-library/react';
export { customRender as render };
```

### Test Data Management

```typescript
// src/test/fixtures/data.ts
export const mockLocations = {
  newYork: {
    lat: 40.7128,
    lng: -74.0060,
    address: 'New York, NY, USA',
    placeId: 'ChIJDwgkCEWAhYAR_A7_FfwHjOo',
  },
  sanFrancisco: {
    lat: 37.7749,
    lng: -122.4194,
    address: 'San Francisco, CA, USA',
    placeId: 'ChIJIQBpAG2ahYAR_6128GcTUEo',
  },
};

export const mockAutocompletePredictions = [
  {
    placeId: 'test-place-1',
    description: 'Times Square, New York, NY, USA',
    mainText: 'Times Square',
    secondaryText: 'New York, NY, USA',
    terms: [],
    types: [],
  },
  // ... more predictions
];
```

This comprehensive testing guide provides everything needed to implement thorough testing for the Google Maps Clone application, covering unit tests, integration tests, E2E tests, and specialized testing approaches.