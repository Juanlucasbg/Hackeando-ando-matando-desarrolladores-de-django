import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import MapContainer from '../MapContainer/MapContainer';
import { Location } from '../../types';

// Mock the Google Maps API
vi.mock('@react-google-maps/api', () => ({
  GoogleMap: ({ children, onClick, onLoad }: any) => (
    <div data-testid="google-map" onClick={onClick}>
      {children}
      <button onClick={() => onLoad({ mockMap: true })}>Load Map</button>
    </div>
  ),
  useJsApiLoader: () => ({ isLoaded: true, loadError: null }),
  Marker: ({ title, onClick }: any) => (
    <div data-testid="marker" onClick={onClick}>
      {title}
    </div>
  ),
  InfoWindow: ({ children, onCloseClick }: any) => (
    <div data-testid="info-window">
      {children}
      <button onClick={onCloseClick}>Close</button>
    </div>
  ),
}));

// Mock MapControls
vi.mock('../MapControls/MapControls', () => ({
  MapControls: ({ onZoomIn, onZoomOut, onMapTypeChange }: any) => (
    <div data-testid="map-controls">
      <button onClick={onZoomIn}>Zoom In</button>
      <button onClick={onZoomOut}>Zoom Out</button>
      <button onClick={() => onMapTypeChange('satellite')}>Change Map Type</button>
    </div>
  ),
}));

// Mock MapService
vi.mock('../../services/mapService', () => ({
  getMapService: () => ({
    initialize: vi.fn().mockResolvedValue(undefined),
  }),
}));

describe('MapContainer', () => {
  const defaultProps = {
    center: { lat: 40.7128, lng: -74.0060 } as Location,
    zoom: 12,
    markers: [],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders map container correctly', () => {
    render(<MapContainer {...defaultProps} />);

    expect(screen.getByTestId('google-map')).toBeInTheDocument();
  });

  test('renders map controls', () => {
    render(<MapContainer {...defaultProps} />);

    expect(screen.getByTestId('map-controls')).toBeInTheDocument();
    expect(screen.getByText('Zoom In')).toBeInTheDocument();
    expect(screen.getByText('Zoom Out')).toBeInTheDocument();
  });

  test('calls onMapClick when map is clicked', () => {
    const mockOnMapClick = vi.fn();
    render(<MapContainer {...defaultProps} onMapClick={mockOnMapClick} />);

    fireEvent.click(screen.getByTestId('google-map'));

    expect(mockOnMapClick).toHaveBeenCalled();
  });

  test('renders markers correctly', () => {
    const markers = [
      {
        position: { lat: 40.7128, lng: -74.0060 },
        title: 'Test Marker 1',
      },
      {
        position: { lat: 40.7589, lng: -73.9851 },
        title: 'Test Marker 2',
      },
    ];

    render(<MapContainer {...defaultProps} markers={markers} />);

    const markerElements = screen.getAllByTestId('marker');
    expect(markerElements).toHaveLength(2);
    expect(screen.getByText('Test Marker 1')).toBeInTheDocument();
    expect(screen.getByText('Test Marker 2')).toBeInTheDocument();
  });

  test('handles marker click', async () => {
    const mockOnMarkerClick = vi.fn();
    const markers = [
      {
        position: { lat: 40.7128, lng: -74.0060 },
        title: 'Test Marker',
        info: 'Test Info',
      },
    ];

    render(<MapContainer {...defaultProps} markers={markers} onMarkerClick={mockOnMarkerClick} />);

    fireEvent.click(screen.getByText('Test Marker'));

    await waitFor(() => {
      expect(mockOnMarkerClick).toHaveBeenCalledWith(markers[0]);
    });
  });

  test('shows info window when marker is clicked', async () => {
    const markers = [
      {
        position: { lat: 40.7128, lng: -74.0060 },
        title: 'Test Marker',
        info: 'Test Info',
      },
    ];

    render(<MapContainer {...defaultProps} markers={markers} />);

    fireEvent.click(screen.getByText('Test Marker'));

    await waitFor(() => {
      expect(screen.getByTestId('info-window')).toBeInTheDocument();
      expect(screen.getByText('Test Marker')).toBeInTheDocument();
      expect(screen.getByText('Test Info')).toBeInTheDocument();
    });
  });

  test('closes info window when close button is clicked', async () => {
    const markers = [
      {
        position: { lat: 40.7128, lng: -74.0060 },
        title: 'Test Marker',
        info: 'Test Info',
      },
    ];

    render(<MapContainer {...defaultProps} markers={markers} />);

    // Open info window
    fireEvent.click(screen.getByText('Test Marker'));

    await waitFor(() => {
      expect(screen.getByTestId('info-window')).toBeInTheDocument();
    });

    // Close info window
    fireEvent.click(screen.getByText('Close'));

    await waitFor(() => {
      expect(screen.queryByTestId('info-window')).not.toBeInTheDocument();
    });
  });

  test('handles zoom controls', () => {
    render(<MapContainer {...defaultProps} />);

    fireEvent.click(screen.getByText('Zoom In'));
    // Zoom in functionality would be tested through map instance

    fireEvent.click(screen.getByText('Zoom Out'));
    // Zoom out functionality would be tested through map instance
  });

  test('handles map type change', () => {
    render(<MapContainer {...defaultProps} />);

    fireEvent.click(screen.getByText('Change Map Type'));
    // Map type change functionality would be tested through map instance
  });

  test('applies custom className', () => {
    const customClass = 'custom-map-class';
    const { container } = render(<MapContainer {...defaultProps} className={customClass} />);

    expect(container.querySelector('.map-container')).toHaveClass(customClass);
  });

  test('applies custom style', () => {
    const customStyle = { height: '500px' };
    const { container } = render(<MapContainer {...defaultProps} style={customStyle} />);

    const mapContainer = container.querySelector('.map-container');
    expect(mapContainer).toHaveStyle('height: 500px');
  });

  test('renders children correctly', () => {
    const customChildren = <div data-testid="custom-children">Custom Content</div>;

    render(<MapContainer {...defaultProps}>{customChildren}</MapContainer>);

    expect(screen.getByTestId('custom-children')).toBeInTheDocument();
    expect(screen.getByText('Custom Content')).toBeInTheDocument();
  });

  test('shows loading state when map is not loaded', () => {
    vi.mocked(require('@react-google-maps/api').useJsApiLoader).mockReturnValue({
      isLoaded: false,
      loadError: null,
    });

    render(<MapContainer {...defaultProps} />);

    expect(screen.getByText('Loading map...')).toBeInTheDocument();
  });

  test('shows error state when map fails to load', () => {
    vi.mocked(require('@react-google-maps/api').useJsApiLoader).mockReturnValue({
      isLoaded: true,
      loadError: new Error('API load failed'),
    });

    render(<MapContainer {...defaultProps} />);

    expect(screen.getByText('Map Load Error')).toBeInTheDocument();
    expect(screen.getByText('API load failed')).toBeInTheDocument();
  });
});