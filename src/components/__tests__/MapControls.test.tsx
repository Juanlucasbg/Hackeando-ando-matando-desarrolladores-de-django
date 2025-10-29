import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { MapControls } from '../map';
import { MapControlsProps } from '../../types';

// Mock Google Maps
const mockMap = {
  getHeading: vi.fn().mockReturnValue(0),
  setHeading: vi.fn(),
  setTilt: vi.fn(),
  setCenter: vi.fn(),
  setZoom: vi.fn(),
  addListener: vi.fn((event: string, callback: Function) => {
    if (event === 'heading_changed') {
      callback();
    }
    return vi.fn(); // Return listener remove function
  }),
};

const defaultProps: MapControlsProps = {
  map: mockMap,
  zoom: 12,
  mapTypeId: 'roadmap',
  onZoomIn: vi.fn(),
  onZoomOut: vi.fn(),
  onMapTypeChange: vi.fn(),
  onFullscreenToggle: vi.fn(),
  onStreetViewToggle: vi.fn(),
  streetViewVisible: false,
};

describe('MapControls', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Reset document.fullscreenElement
    Object.defineProperty(document, 'fullscreenElement', {
      writable: true,
      value: null,
    });
  });

  test('renders all control buttons', () => {
    render(<MapControls {...defaultProps} />);

    // Zoom controls
    expect(screen.getByLabelText('Zoom in')).toBeInTheDocument();
    expect(screen.getByLabelText('Zoom out')).toBeInTheDocument();

    // Map type selector
    expect(screen.getByLabelText(/Map type:/)).toBeInTheDocument();

    // Compass
    expect(screen.getByLabelText('Reset heading to north')).toBeInTheDocument();

    // Home button
    expect(screen.getByLabelText('Return to default view')).toBeInTheDocument();

    // Street view toggle
    expect(screen.getByLabelText('Enter Street View')).toBeInTheDocument();

    // Fullscreen toggle
    expect(screen.getByLabelText('Enter fullscreen')).toBeInTheDocument();

    // Location button
    expect(screen.getByLabelText('Center on your location')).toBeInTheDocument();
  });

  test('displays current zoom level', () => {
    render(<MapControls {...defaultProps} zoom={15} />);

    expect(screen.getByText('15')).toBeInTheDocument();
  });

  test('calls onZoomIn when zoom in button is clicked', () => {
    const mockOnZoomIn = vi.fn();
    render(<MapControls {...defaultProps} onZoomIn={mockOnZoomIn} />);

    fireEvent.click(screen.getByLabelText('Zoom in'));

    expect(mockOnZoomIn).toHaveBeenCalledTimes(1);
  });

  test('calls onZoomOut when zoom out button is clicked', () => {
    const mockOnZoomOut = vi.fn();
    render(<MapControls {...defaultProps} onZoomOut={mockOnZoomOut} />);

    fireEvent.click(screen.getByLabelText('Zoom out'));

    expect(mockOnZoomOut).toHaveBeenCalledTimes(1);
  });

  test('opens map type dropdown when map type button is clicked', () => {
    render(<MapControls {...defaultProps} />);

    expect(screen.queryByRole('list')).not.toBeInTheDocument();

    fireEvent.click(screen.getByLabelText(/Map type:/));

    expect(screen.getByRole('list')).toBeInTheDocument();
    expect(screen.getByText('Roadmap')).toBeInTheDocument();
    expect(screen.getByText('Satellite')).toBeInTheDocument();
    expect(screen.getByText('Hybrid')).toBeInTheDocument();
    expect(screen.getByText('Terrain')).toBeInTheDocument();
  });

  test('calls onMapTypeChange when map type is selected', () => {
    const mockOnMapTypeChange = vi.fn();
    render(<MapControls {...defaultProps} onMapTypeChange={mockOnMapTypeChange} />);

    // Open dropdown
    fireEvent.click(screen.getByLabelText(/Map type:/));

    // Select satellite
    fireEvent.click(screen.getByText('Satellite'));

    expect(mockOnMapTypeChange).toHaveBeenCalledWith('satellite');
    expect(screen.queryByRole('list')).not.toBeInTheDocument(); // Dropdown should close
  });

  test('calls onStreetViewToggle when street view button is clicked', () => {
    const mockOnStreetViewToggle = vi.fn();
    render(<MapControls {...defaultProps} onStreetViewToggle={mockOnStreetViewToggle} />);

    fireEvent.click(screen.getByLabelText('Enter Street View'));

    expect(mockOnStreetViewToggle).toHaveBeenCalledTimes(1);
  });

  test('shows correct street view button text based on visibility', () => {
    // Street view not visible
    const { rerender } = render(<MapControls {...defaultProps} streetViewVisible={false} />);
    expect(screen.getByText('Enter Street View')).toBeInTheDocument();
    expect(screen.getByLabelText('Enter Street View')).toBeInTheDocument();

    // Street view visible
    rerender(<MapControls {...defaultProps} streetViewVisible={true} />);
    expect(screen.getByText('Exit')).toBeInTheDocument();
    expect(screen.getByLabelText('Exit Street View')).toBeInTheDocument();
  });

  test('calls onFullscreenToggle when fullscreen button is clicked', () => {
    const mockOnFullscreenToggle = vi.fn();
    render(<MapControls {...defaultProps} onFullscreenToggle={mockOnFullscreenToggle} />);

    fireEvent.click(screen.getByLabelText('Enter fullscreen'));

    expect(mockOnFullscreenToggle).toHaveBeenCalledTimes(1);
  });

  test('updates fullscreen button state based on document fullscreen', async () => {
    render(<MapControls {...defaultProps} />);

    // Initially not in fullscreen
    expect(screen.getByLabelText('Enter fullscreen')).toBeInTheDocument();

    // Simulate entering fullscreen
    Object.defineProperty(document, 'fullscreenElement', {
      writable: true,
      value: document.body,
    });

    // Trigger fullscreen change event
    fireEvent(document, new Event('fullscreenchange'));

    await waitFor(() => {
      expect(screen.getByLabelText('Exit fullscreen')).toBeInTheDocument();
    });
  });

  test('resets map heading when compass is clicked', () => {
    render(<MapControls {...defaultProps} />);

    fireEvent.click(screen.getByLabelText('Reset heading to north'));

    expect(mockMap.setHeading).toHaveBeenCalledWith(0);
    expect(mockMap.setTilt).toHaveBeenCalledWith(0);
  });

  test('returns to default view when home button is clicked', () => {
    render(<MapControls {...defaultProps} />);

    fireEvent.click(screen.getByLabelText('Return to default view'));

    expect(mockMap.setCenter).toHaveBeenCalledWith({ lat: 40.7128, lng: -74.0060 });
    expect(mockMap.setZoom).toHaveBeenCalledWith(12);
    expect(mockMap.setHeading).toHaveBeenCalledWith(0);
    expect(mockMap.setTilt).toHaveBeenCalledWith(0);
  });

  test('requests geolocation when location button is clicked', () => {
    const mockGeolocation = {
      getCurrentPosition: vi.fn(),
    };

    Object.defineProperty(navigator, 'geolocation', {
      writable: true,
      value: mockGeolocation,
    });

    render(<MapControls {...defaultProps} />);

    fireEvent.click(screen.getByLabelText('Center on your location'));

    expect(mockGeolocation.getCurrentPosition).toHaveBeenCalled();
  });

  test('applies custom className', () => {
    const customClass = 'custom-controls-class';
    const { container } = render(<MapControls {...defaultProps} className={customClass} />);

    expect(container.querySelector('.map-controls')).toHaveClass(customClass);
  });

  test('closes map type dropdown when clicking outside', () => {
    render(<MapControls {...defaultProps} />);

    // Open dropdown
    fireEvent.click(screen.getByLabelText(/Map type:/));
    expect(screen.getByRole('list')).toBeInTheDocument();

    // Click outside
    fireEvent.mouseDown(document.body);

    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });

  test('updates compass rotation based on map heading', () => {
    mockMap.getHeading.mockReturnValue(90);

    render(<MapControls {...defaultProps} />);

    const compass = screen.getByLabelText('Reset heading to north').querySelector('.compass-needle');
    expect(compass).toHaveStyle('transform: rotate(-90deg)');
  });

  test('highlights current map type in dropdown', () => {
    render(<MapControls {...defaultProps} mapTypeId="satellite" />);

    fireEvent.click(screen.getByLabelText(/Map type:/));

    const satelliteOption = screen.getByText('Satellite').closest('button');
    expect(satelliteOption).toHaveClass('active');
  });

  test('handles keyboard navigation on map type dropdown', () => {
    render(<MapControls {...defaultProps} />);

    // Open dropdown with Enter key
    fireEvent.keyDown(screen.getByLabelText(/Map type:/), { key: 'Enter' });
    expect(screen.getByRole('list')).toBeInTheDocument();

    // Navigate with arrow keys
    fireEvent.keyDown(screen.getByText('Roadmap'), { key: 'ArrowDown' });
    fireEvent.keyDown(screen.getByText('Satellite'), { key: 'Enter' });

    expect(defaultProps.onMapTypeChange).toHaveBeenCalledWith('satellite');
  });

  test('handles escape key to close dropdown', () => {
    render(<MapControls {...defaultProps} />);

    // Open dropdown
    fireEvent.click(screen.getByLabelText(/Map type:/));
    expect(screen.getByRole('list')).toBeInTheDocument();

    // Press Escape
    fireEvent.keyDown(screen.getByText('Roadmap'), { key: 'Escape' });

    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });

  test('has proper accessibility attributes', () => {
    render(<MapControls {...defaultProps} />);

    // Map type button should have proper aria attributes
    const mapTypeButton = screen.getByLabelText(/Map type:/);
    expect(mapTypeButton).toHaveAttribute('aria-haspopup', 'true');
    expect(mapTypeButton).toHaveAttribute('aria-expanded', 'false');

    // Open dropdown and check expanded state
    fireEvent.click(mapTypeButton);
    expect(mapTypeButton).toHaveAttribute('aria-expanded', 'true');
  });
});