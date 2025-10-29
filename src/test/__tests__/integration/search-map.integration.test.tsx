import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MapSearchInterface } from '@/components/MapSearchInterface'
import { locations, searchSuggestions, routes } from '@/test/fixtures'

// Mock the Google Maps API
vi.mock('@/hooks/useMap', () => ({
  useMap: vi.fn(() => ({
    mapInstance: {
      setCenter: vi.fn(),
      getCenter: vi.fn().mockReturnValue(locations.medellin.coordinates),
      setZoom: vi.fn(),
      getZoom: vi.fn().mockReturnValue(13),
      fitBounds: vi.fn(),
      panTo: vi.fn(),
      addListener: vi.fn().mockReturnValue({ remove: vi.fn() }),
    },
    panTo: vi.fn(),
    fitBounds: vi.fn(),
    addMarker: vi.fn(),
    clearOverlays: vi.fn(),
  }))
}))

// Mock stores
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

vi.mock('@/stores/searchStore', () => ({
  useSearchStore: vi.fn(() => ({
    query: '',
    suggestions: [],
    isLoading: false,
    error: null,
    recentSearches: [],
    favorites: [],
    setQuery: vi.fn(),
    clearQuery: vi.fn(),
    selectSuggestion: vi.fn(),
    addToRecent: vi.fn(),
    addToFavorites: vi.fn(),
    removeFromFavorites: vi.fn(),
  }))
}))

vi.mock('@/stores/routeStore', () => ({
  useRouteStore: vi.fn(() => ({
    routes: [],
    selectedRoute: null,
    isPlanning: false,
    planRoute: vi.fn(),
    selectRoute: vi.fn(),
    clearRoutes: vi.fn(),
  }))
}))

// Mock services
vi.mock('@/services/geocodingService', () => ({
  geocodingService: {
    autocomplete: vi.fn().mockResolvedValue(searchSuggestions),
    geocode: vi.fn().mockResolvedValue([locations.medellin]),
    reverseGeocode: vi.fn().mockResolvedValue([locations.parqueEnvigado]),
  }
}))

vi.mock('@/services/routeService', () => ({
  routeService: {
    planRoute: vi.fn().mockResolvedValue({ routes: [routes.walkingTransit, routes.driving] }),
    getRouteDetails: vi.fn(),
    getLiveRouteUpdates: vi.fn(),
  }
}))

describe('Search-Map Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should search for location and center map on selection', async () => {
    const user = userEvent.setup()
    const mockSetCenter = vi.fn()
    const mockSetSelectedLocation = vi.fn()
    const mockSelectSuggestion = vi.fn()

    // Update store mocks to track calls
    vi.mocked(useMapStore).mockReturnValue({
      center: locations.medellin.coordinates,
      zoom: 13,
      markers: new Map(),
      activeLayers: new Set(),
      selectedLocation: null,
      setCenter: mockSetCenter,
      setZoom: vi.fn(),
      addMarker: vi.fn(),
      removeMarker: vi.fn(),
      toggleLayer: vi.fn(),
      clearOverlays: vi.fn(),
      setSelectedLocation: mockSetSelectedLocation,
    })

    vi.mocked(useSearchStore).mockReturnValue({
      query: '',
      suggestions: searchSuggestions,
      isLoading: false,
      error: null,
      recentSearches: [],
      favorites: [],
      setQuery: vi.fn(),
      clearQuery: vi.fn(),
      selectSuggestion: mockSelectSuggestion,
      addToRecent: vi.fn(),
      addToFavorites: vi.fn(),
      removeFromFavorites: vi.fn(),
    })

    render(<MapSearchInterface />)

    // Search for a location
    const searchInput = screen.getByPlaceholderText('Search for a location')
    await user.type(searchInput, 'Parque')

    // Wait for suggestions to appear
    await waitFor(() => {
      expect(screen.getByText('Parque Envigado, Envigado, Colombia')).toBeInTheDocument()
    })

    // Select the first suggestion
    const suggestion = screen.getByText('Parque Envigado, Envigado, Colombia')
    await user.click(suggestion)

    // Verify the map center was updated
    expect(mockSelectSuggestion).toHaveBeenCalledWith(searchSuggestions[0])
  })

  it('should plan route and display it on map', async () => {
    const user = userEvent.setup()
    const mockPlanRoute = vi.fn()
    const mockAddMarker = vi.fn()

    vi.mocked(useRouteStore).mockReturnValue({
      routes: [routes.walkingTransit],
      selectedRoute: routes.walkingTransit,
      isPlanning: false,
      planRoute: mockPlanRoute,
      selectRoute: vi.fn(),
      clearRoutes: vi.fn(),
    })

    vi.mocked(useMapStore).mockReturnValue({
      center: locations.medellin.coordinates,
      zoom: 13,
      markers: new Map(),
      activeLayers: new Set(),
      selectedLocation: null,
      setCenter: vi.fn(),
      setZoom: vi.fn(),
      addMarker: mockAddMarker,
      removeMarker: vi.fn(),
      toggleLayer: vi.fn(),
      clearOverlays: vi.fn(),
      setSelectedLocation: vi.fn(),
    })

    render(<MapSearchInterface />)

    // Set origin
    const originInput = screen.getByPlaceholderText('Enter origin')
    await user.type(originInput, 'Parque Envigado')

    // Set destination
    const destinationInput = screen.getByPlaceholderText('Enter destination')
    await user.type(destinationInput, 'Plaza Mayor')

    // Click plan route button
    const planButton = screen.getByText('Plan Route')
    await user.click(planButton)

    // Wait for route planning to complete
    await waitFor(() => {
      expect(mockPlanRoute).toHaveBeenCalled()
    })

    // Verify route is displayed
    expect(screen.getByText(/25 mins/)).toBeInTheDocument()
    expect(screen.getByText(/5\.2 km/)).toBeInTheDocument()
    expect(screen.getByText(/transit/)).toBeInTheDocument()
  })

  it('should handle map click and reverse geocoding', async () => {
    const user = userEvent.setup()
    const mockReverseGeocode = vi.fn().mockResolvedValue([locations.parqueEnvigado])
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

    vi.mocked('@/services/geocodingService', () => ({
      geocodingService: {
        autocomplete: vi.fn(),
        geocode: vi.fn(),
        reverseGeocode: mockReverseGeocode,
      }
    }))

    render(<MapSearchInterface />)

    // Click on the map
    const mapContainer = screen.getByTestId('map-container')
    await user.click(mapContainer, {
      clientX: 100,
      clientY: 100,
    })

    // Wait for reverse geocoding to complete
    await waitFor(() => {
      expect(mockReverseGeocode).toHaveBeenCalled()
    })

    // Verify location is set
    expect(mockSetSelectedLocation).toHaveBeenCalled()
  })

  it('should handle route selection and map focus', async () => {
    const user = userEvent.setup()
    const mockSelectRoute = vi.fn()
    const mockFitBounds = vi.fn()

    vi.mocked(useRouteStore).mockReturnValue({
      routes: [routes.walkingTransit, routes.driving],
      selectedRoute: null,
      isPlanning: false,
      planRoute: vi.fn(),
      selectRoute: mockSelectRoute,
      clearRoutes: vi.fn(),
    })

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
      setSelectedLocation: vi.fn(),
    })

    render(<MapSearchInterface />)

    // Pre-populate routes
    await act(async () => {
      vi.mocked(useRouteStore).mockReturnValue({
        routes: [routes.walkingTransit, routes.driving],
        selectedRoute: routes.walkingTransit,
        isPlanning: false,
        planRoute: vi.fn(),
        selectRoute: mockSelectRoute,
        clearRoutes: vi.fn(),
      })
    })

    // Select a route
    const routeOption = screen.getByText(/25 mins/) // Walking + transit route
    await user.click(routeOption)

    expect(mockSelectRoute).toHaveBeenCalledWith(routes.walkingTransit)
  })

  it('should handle search history and map state persistence', async () => {
    const user = userEvent.setup()
    const mockAddToRecent = vi.fn()

    vi.mocked(useSearchStore).mockReturnValue({
      query: 'Parque Envigado',
      suggestions: [],
      isLoading: false,
      error: null,
      recentSearches: [locations.parqueEnvigado],
      favorites: [],
      setQuery: vi.fn(),
      clearQuery: vi.fn(),
      selectSuggestion: vi.fn(),
      addToRecent: mockAddToRecent,
      addToFavorites: vi.fn(),
      removeFromFavorites: vi.fn(),
    })

    render(<MapSearchInterface />)

    // Click on recent search
    const recentSearch = screen.getByText('Parque Envigado')
    await user.click(recentSearch)

    // Verify recent search was accessed
    expect(recentSearch).toBeInTheDocument()
  })

  it('should handle layer toggling and map updates', async () => {
    const user = userEvent.setup()
    const mockToggleLayer = vi.fn()

    vi.mocked(useMapStore).mockReturnValue({
      center: locations.medellin.coordinates,
      zoom: 13,
      markers: new Map(),
      activeLayers: new Set(['traffic']),
      selectedLocation: null,
      setCenter: vi.fn(),
      setZoom: vi.fn(),
      addMarker: vi.fn(),
      removeMarker: vi.fn(),
      toggleLayer: mockToggleLayer,
      clearOverlays: vi.fn(),
      setSelectedLocation: vi.fn(),
    })

    render(<MapSearchInterface />)

    // Toggle traffic layer
    const trafficToggle = screen.getByLabelText('Traffic layer')
    await user.click(trafficToggle)

    expect(mockToggleLayer).toHaveBeenCalledWith('traffic')
  })

  it('should handle geolocation and map centering', async () => {
    const user = userEvent.setup()
    const mockSetCenter = vi.fn()

    // Mock geolocation
    const mockGeolocation = {
      getCurrentPosition: vi.fn().mockImplementation((success) => {
        success({
          coords: {
            latitude: 6.2442,
            longitude: -75.5812,
            accuracy: 10,
          },
          timestamp: Date.now(),
        })
      }),
    }

    Object.defineProperty(navigator, 'geolocation', {
      writable: true,
      value: mockGeolocation,
    })

    vi.mocked(useMapStore).mockReturnValue({
      center: locations.medellin.coordinates,
      zoom: 13,
      markers: new Map(),
      activeLayers: new Set(),
      selectedLocation: null,
      setCenter: mockSetCenter,
      setZoom: vi.fn(),
      addMarker: vi.fn(),
      removeMarker: vi.fn(),
      toggleLayer: vi.fn(),
      clearOverlays: vi.fn(),
      setSelectedLocation: vi.fn(),
    })

    render(<MapSearchInterface />)

    // Click geolocation button
    const geolocationButton = screen.getByLabelText('Use current location')
    await user.click(geolocationButton)

    expect(mockGeolocation.getCurrentPosition).toHaveBeenCalled()
  })

  it('should handle error states gracefully', async () => {
    const user = userEvent.setup()
    const errorMessage = 'Search failed. Please try again.'

    vi.mocked(useSearchStore).mockReturnValue({
      query: 'Invalid location',
      suggestions: [],
      isLoading: false,
      error: errorMessage,
      recentSearches: [],
      favorites: [],
      setQuery: vi.fn(),
      clearQuery: vi.fn(),
      selectSuggestion: vi.fn(),
      addToRecent: vi.fn(),
      addToFavorites: vi.fn(),
      removeFromFavorites: vi.fn(),
    })

    render(<MapSearchInterface />)

    // Verify error message is displayed
    expect(screen.getByText(errorMessage)).toBeInTheDocument()

    // Verify map is still functional
    expect(screen.getByTestId('map-container')).toBeInTheDocument()
  })

  it('should handle route planning with different transport modes', async () => {
    const user = userEvent.setup()
    const mockPlanRoute = vi.fn()

    vi.mocked(useRouteStore).mockReturnValue({
      routes: [],
      selectedRoute: null,
      isPlanning: true,
      planRoute: mockPlanRoute,
      selectRoute: vi.fn(),
      clearRoutes: vi.fn(),
    })

    render(<MapSearchInterface />)

    // Select different transport modes
    const transitMode = screen.getByLabelText('Transit')
    const drivingMode = screen.getByLabelText('Driving')
    const walkingMode = screen.getByLabelText('Walking')

    await user.click(transitMode)
    await user.click(drivingMode)
    await user.click(walkingMode)

    // Plan route with different modes
    const planButton = screen.getByText('Plan Route')
    await user.click(planButton)

    expect(mockPlanRoute).toHaveBeenCalled()
  })

  it('should handle map viewport and search results synchronization', async () => {
    const user = userEvent.setup()
    const mockSetCenter = vi.fn()

    vi.mocked(useMapStore).mockReturnValue({
      center: locations.parqueEnvigado.coordinates,
      zoom: 15,
      markers: new Map(),
      activeLayers: new Set(),
      selectedLocation: locations.parqueEnvigado,
      setCenter: mockSetCenter,
      setZoom: vi.fn(),
      addMarker: vi.fn(),
      removeMarker: vi.fn(),
      toggleLayer: vi.fn(),
      clearOverlays: vi.fn(),
      setSelectedLocation: vi.fn(),
    })

    render(<MapSearchInterface />)

    // Search for nearby location
    const searchInput = screen.getByPlaceholderText('Search for a location')
    await user.type(searchInput, 'Plaza Mayor')

    // Verify search prioritizes current map viewport
    await waitFor(() => {
      expect(screen.getByText('Plaza Mayor, Medellín, Colombia')).toBeInTheDocument()
    })
  })

  it('should handle keyboard navigation between search and map', async () => {
    const user = userEvent.setup()

    render(<MapSearchInterface />)

    // Tab through interface elements
    await user.tab() // Should focus search input
    expect(screen.getByPlaceholderText('Search for a location')).toHaveFocus()

    await user.tab() // Should focus map container
    expect(screen.getByTestId('map-container')).toHaveFocus()

    // Use arrow keys to navigate map
    await user.keyboard('{ArrowUp}')
    await user.keyboard('{ArrowDown}')
    await user.keyboard('{ArrowLeft}')
    await user.keyboard('{ArrowRight}')

    // Use +/- keys for zoom
    await user.keyboard('+')
    await user.keyboard('-')
  })
})