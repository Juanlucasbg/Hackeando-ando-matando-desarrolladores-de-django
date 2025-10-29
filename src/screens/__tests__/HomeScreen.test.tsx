import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { HomeScreen } from '../HomeScreen';

// Mock the stores
vi.mock('@/stores/mapStore', () => ({
  useMapStore: vi.fn(() => ({
    isMapLoaded: true,
    center: { lat: 40.7128, lng: -74.0060 },
    zoom: 12,
  })),
}));

vi.mock('@/stores/searchStore', () => ({
  useSearchStore: vi.fn(() => ({
    searchResults: [],
    isSearching: false,
  })),
}));

// Mock the components
vi.mock('@/components/map', () => ({
  MapContainer: vi.fn(() => <div data-testid="map-container">Map Container</div>),
  MapControls: vi.fn(() => <div data-testid="map-controls">Map Controls</div>),
}));

vi.mock('@/components/search', () => ({
  SearchBar: vi.fn(() => <div data-testid="search-bar">Search Bar</div>),
}));

describe('HomeScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders main components', () => {
    render(<HomeScreen />);

    expect(screen.getByTestId('search-bar')).toBeInTheDocument();
    expect(screen.getByTestId('map-container')).toBeInTheDocument();
    expect(screen.getByTestId('map-controls')).toBeInTheDocument();
  });

  test('displays search results when available', () => {
    vi.mocked(require('@/stores/searchStore').useSearchStore).mockReturnValue({
      searchResults: [
        { name: 'Test Location', address: '123 Test St' },
        { name: 'Another Place', address: '456 Other Ave' },
      ],
      isSearching: false,
    });

    render(<HomeScreen />);

    expect(screen.getByText('Search Results')).toBeInTheDocument();
    expect(screen.getByText('Test Location')).toBeInTheDocument();
    expect(screen.getByText('123 Test St')).toBeInTheDocument();
    expect(screen.getByText('Another Place')).toBeInTheDocument();
    expect(screen.getByText('456 Other Ave')).toBeInTheDocument();
  });

  test('shows loading state during search', () => {
    vi.mocked(require('@/stores/searchStore').useSearchStore).mockReturnValue({
      searchResults: [],
      isSearching: true,
    });

    render(<HomeScreen />);

    expect(screen.getByText('Searching...')).toBeInTheDocument();
  });

  test('hides map controls when map is not loaded', () => {
    vi.mocked(require('@/stores/mapStore').useMapStore).mockReturnValue({
      isMapLoaded: false,
      center: { lat: 40.7128, lng: -74.0060 },
      zoom: 12,
    });

    render(<HomeScreen />);

    expect(screen.queryByTestId('map-controls')).not.toBeInTheDocument();
  });
});