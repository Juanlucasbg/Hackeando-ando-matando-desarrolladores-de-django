import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { MapContainer } from '../MapContainer'
import { locations, routes } from '@/test/fixtures'

// Mock the Google Maps API
vi.mock('@/hooks/useMap', () => ({
  useMap: vi.fn(() => ({
    mapInstance: {
      setCenter: vi.fn(),
      getCenter: vi.fn().mockReturnValue({ lat: () => 6.2442, lng: () => -75.5812 }),
      setZoom: vi.fn(),
      getZoom: vi.fn().mockReturnValue(13),
      fitBounds: vi.fn(),
      addListener: vi.fn().mockReturnValue({ remove: vi.fn() }),
    },
    panTo: vi.fn(),
    fitBounds: vi.fn(),
    addMarker: vi.fn(),
    clearOverlays: vi.fn(),
  }))
}))

// Mock the map store
vi.mock('@/stores/mapStore', () => ({
  useMapStore: vi.fn(() => ({
    center: locations.medellin.coordinates,
    zoom: 13,
    markers: new Map(),
    activeLayers: new Set(),
    selectedLocation: null,
    setCenter: vi.fn(),
    setZoom: vi.fn(),
    addMarker: vi.fn(),
    removeMarker: vi.fn(),
    toggleLayer: vi.fn(),
    clearOverlays: vi.fn(),
    setSelectedLocation: vi.fn(),
  }))
}))

describe('MapContainer', () => {
  const defaultProps = {}

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders map container with correct test ID', () => {
    render(<MapContainer {...defaultProps} />)

    expect(screen.getByTestId('map-container')).toBeInTheDocument()
  })

  it('initializes map on mount', async () => {
    render(<MapContainer {...defaultProps} />)

    await waitFor(() => {
      expect(screen.getByTestId('map-container')).toBeVisible()
    })
  })

  it('renders map controls', () => {
    render(<MapContainer {...defaultProps} />)

    expect(screen.getByLabelText('Zoom in')).toBeInTheDocument()
    expect(screen.getByLabelText('Zoom out')).toBeInTheDocument()
    expect(screen.getByLabelText('Map type')).toBeInTheDocument()
    expect(screen.getByLabelText('Fullscreen')).toBeInTheDocument()
  })

  it('handles zoom controls interaction', async () => {
    const mockSetZoom = vi.fn()
    vi.mocked(useMapStore).mockReturnValue({
      center: locations.medellin.coordinates,
      zoom: 13,
      markers: new Map(),
      activeLayers: new Set(),
      selectedLocation: null,
      setCenter: vi.fn(),
      setZoom: mockSetZoom,
      addMarker: vi.fn(),
      removeMarker: vi.fn(),
      toggleLayer: vi.fn(),
      clearOverlays: vi.fn(),
      setSelectedLocation: vi.fn(),
    })

    render(<MapContainer {...defaultProps} />)

    const zoomInButton = screen.getByLabelText('Zoom in')
    const zoomOutButton = screen.getByLabelText('Zoom out')

    await act(async () => {
      fireEvent.click(zoomInButton)
    })

    await act(async () => {
      fireEvent.click(zoomOutButton)
    })

    expect(mockSetZoom).toHaveBeenCalledTimes(2)
  })

  it('handles map type selection', async () => {
    render(<MapContainer {...defaultProps} />)

    const mapTypeButton = screen.getByLabelText('Map type')

    await act(async () => {
      fireEvent.click(mapTypeButton)
    })

    expect(screen.getByText('Roadmap')).toBeInTheDocument()
    expect(screen.getByText('Satellite')).toBeInTheDocument()
    expect(screen.getByText('Terrain')).toBeInTheDocument()
  })

  it('handles fullscreen toggle', async () => {
    const mockFullscreenElement = {
      requestFullscreen: vi.fn().mockResolvedValue(undefined),
      webkitRequestFullscreen: vi.fn().mockResolvedValue(undefined),
    }

    Object.defineProperty(document.documentElement, 'requestFullscreen', {
      writable: true,
      value: mockFullscreenElement.requestFullscreen,
    })

    render(<MapContainer {...defaultProps} />)

    const fullscreenButton = screen.getByLabelText('Fullscreen')

    await act(async () => {
      fireEvent.click(fullscreenButton)
    })

    expect(mockFullscreenElement.requestFullscreen).toHaveBeenCalled()
  })

  it('displays loading state during map initialization', () => {
    render(<MapContainer {...defaultProps} loading={true} />)

    expect(screen.getByTestId('map-loading')).toBeInTheDocument()
    expect(screen.getByText('Loading map...')).toBeInTheDocument()
  })

  it('handles map click events', async () => {
    const mockSetSelectedLocation = vi.fn()
    vi.mocked(useMapStore).mockReturnValue({
      center: locations.medellin.coordinates,
      zoom: 13,
      markers: new Map(),
      activeLayers: new Set(),
      selectedLocation: null,
      setCenter: vi.fn(),
      setZoom: vi.fn(),
      addMarker: vi.fn(),
      removeMarker: vi.fn(),
      toggleLayer: vi.fn(),
      clearOverlays: vi.fn(),
      setSelectedLocation: mockSetSelectedLocation,
    })

    render(<MapContainer {...defaultProps} />)

    const mapContainer = screen.getByTestId('map-container')

    await act(async () => {
      fireEvent.click(mapContainer, {
        clientX: 100,
        clientY: 100,
      })
    })

    // The actual implementation would convert client coordinates to lat/lng
    // and call setSelectedLocation with the resulting coordinates
  })

  it('displays error state when map fails to load', () => {
    render(<MapContainer {...defaultProps} error="Failed to load map" />)

    expect(screen.getByTestId('map-error')).toBeInTheDocument()
    expect(screen.getByText('Failed to load map')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const customClass = 'custom-map-class'
    render(<MapContainer {...defaultProps} className={customClass} />)

    const mapContainer = screen.getByTestId('map-container')
    expect(mapContainer).toHaveClass(customClass)
  })

  it('handles keyboard navigation', async () => {
    render(<MapContainer {...defaultProps} />)

    const mapContainer = screen.getByTestId('map-container')

    await act(async () => {
      fireEvent.keyDown(mapContainer, { key: '+' })
    })

    await act(async () => {
      fireEvent.keyDown(mapContainer, { key: '-' })
    })

    // Test arrow key navigation
    await act(async () => {
      fireEvent.keyDown(mapContainer, { key: 'ArrowUp' })
    })

    await act(async () => {
      fireEvent.keyDown(mapContainer, { key: 'ArrowDown' })
    })

    await act(async () => {
      fireEvent.keyDown(mapContainer, { key: 'ArrowLeft' })
    })

    await act(async () => {
      fireEvent.keyDown(mapContainer, { key: 'ArrowRight' })
    })
  })

  it('supports custom map options', () => {
    const customOptions = {
      zoom: 15,
      center: locations.parqueEnvigado.coordinates,
      mapTypeControl: true,
      streetViewControl: false,
      fullscreenControl: false,
    }

    render(<MapContainer {...defaultProps} options={customOptions} />)

    const mapContainer = screen.getByTestId('map-container')
    expect(mapContainer).toBeInTheDocument()
  })

  it('handles marker addition and removal', async () => {
    const mockAddMarker = vi.fn()
    const mockRemoveMarker = vi.fn()

    vi.mocked(useMapStore).mockReturnValue({
      center: locations.medellin.coordinates,
      zoom: 13,
      markers: new Map([
        ['test-marker', { id: 'test-marker', position: locations.parqueEnvigado.coordinates }]
      ]),
      activeLayers: new Set(),
      selectedLocation: locations.parqueEnvigado,
      setCenter: vi.fn(),
      setZoom: vi.fn(),
      addMarker: mockAddMarker,
      removeMarker: mockRemoveMarker,
      toggleLayer: vi.fn(),
      clearOverlays: vi.fn(),
      setSelectedLocation: vi.fn(),
    })

    render(<MapContainer {...defaultProps} />)

    // The component should render the marker
    expect(screen.getByTestId('map-marker')).toBeInTheDocument()
  })

  it('handles layer toggling', async () => {
    const mockToggleLayer = vi.fn()

    vi.mocked(useMapStore).mockReturnValue({
      center: locations.medellin.coordinates,
      zoom: 13,
      markers: new Map(),
      activeLayers: new Set(['traffic', 'transit']),
      selectedLocation: null,
      setCenter: vi.fn(),
      setZoom: vi.fn(),
      addMarker: vi.fn(),
      removeMarker: vi.fn(),
      toggleLayer: mockToggleLayer,
      clearOverlays: vi.fn(),
      setSelectedLocation: vi.fn(),
    })

    render(<MapContainer {...defaultProps} />)

    expect(screen.getByLabelText('Traffic layer')).toBeInTheDocument()
    expect(screen.getByLabelText('Transit layer')).toBeInTheDocument()

    const trafficToggle = screen.getByLabelText('Traffic layer')

    await act(async () => {
      fireEvent.click(trafficToggle)
    })

    expect(mockToggleLayer).toHaveBeenCalledWith('traffic')
  })

  it('is accessible', async () => {
    const { container } = render(<MapContainer {...defaultProps} />)

    // Check for proper ARIA labels
    expect(screen.getByLabelText('Zoom in')).toHaveAttribute('role', 'button')
    expect(screen.getByLabelText('Zoom out')).toHaveAttribute('role', 'button')
    expect(screen.getByLabelText('Map type')).toHaveAttribute('role', 'button')
    expect(screen.getByLabelText('Fullscreen')).toHaveAttribute('role', 'button')

    // Check for keyboard navigation support
    const mapContainer = screen.getByTestId('map-container')
    expect(mapContainer).toHaveAttribute('tabIndex', '0')

    // Check for proper focus management
    await act(async () => {
      mapContainer.focus()
    })
    expect(mapContainer).toHaveFocus()
  })

  it('responds to window resize', async () => {
    render(<MapContainer {...defaultProps} />)

    // Simulate window resize
    await act(async () => {
      global.innerWidth = 1024
      global.innerHeight = 768
      window.dispatchEvent(new Event('resize'))
    })

    // Map should trigger recalculation of bounds/viewport
    expect(screen.getByTestId('map-container')).toBeInTheDocument()
  })

  it('displays user location when available', async () => {
    const mockUserLocation = locations.parqueEnvigado.coordinates

    vi.mocked(useMapStore).mockReturnValue({
      center: mockUserLocation,
      zoom: 15,
      markers: new Map([
        ['user-location', { id: 'user-location', position: mockUserLocation }]
      ]),
      activeLayers: new Set(),
      selectedLocation: null,
      setCenter: vi.fn(),
      setZoom: vi.fn(),
      addMarker: vi.fn(),
      removeMarker: vi.fn(),
      toggleLayer: vi.fn(),
      clearOverlays: vi.fn(),
      setSelectedLocation: vi.fn(),
    })

    render(<MapContainer {...defaultProps} showUserLocation={true} />)

    expect(screen.getByTestId('user-location-marker')).toBeInTheDocument()
  })
})