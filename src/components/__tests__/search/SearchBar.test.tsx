import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { SearchBar } from '../../search'
import { locations, searchSuggestions } from '@/test/fixtures'

// Mock the search store
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

// Mock the geocoding service
vi.mock('@/services/geocodingService', () => ({
  geocodingService: {
    autocomplete: vi.fn().mockResolvedValue(searchSuggestions),
    geocode: vi.fn().mockResolvedValue([locations.medellin]),
    reverseGeocode: vi.fn().mockResolvedValue([locations.parqueEnvigado]),
  }
}))

describe('SearchBar', () => {
  const defaultProps = {
    placeholder: 'Search for a location',
    onLocationSelect: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders search input with correct placeholder', () => {
    render(<SearchBar {...defaultProps} />)

    const searchInput = screen.getByPlaceholderText('Search for a location')
    expect(searchInput).toBeInTheDocument()
    expect(searchInput).toBeAccessible()
  })

  it('handles user input', async () => {
    const user = userEvent.setup()
    const mockSetQuery = vi.fn()

    vi.mocked(useSearchStore).mockReturnValue({
      query: '',
      suggestions: [],
      isLoading: false,
      error: null,
      recentSearches: [],
      favorites: [],
      setQuery: mockSetQuery,
      clearQuery: vi.fn(),
      selectSuggestion: vi.fn(),
      addToRecent: vi.fn(),
      addToFavorites: vi.fn(),
      removeFromFavorites: vi.fn(),
    })

    render(<SearchBar {...defaultProps} />)

    const searchInput = screen.getByPlaceholderText('Search for a location')

    await user.type(searchInput, 'Parque')

    expect(mockSetQuery).toHaveBeenCalledWith('Parque')
  })

  it('displays loading state during search', async () => {
    vi.mocked(useSearchStore).mockReturnValue({
      query: 'Parque',
      suggestions: [],
      isLoading: true,
      error: null,
      recentSearches: [],
      favorites: [],
      setQuery: vi.fn(),
      clearQuery: vi.fn(),
      selectSuggestion: vi.fn(),
      addToRecent: vi.fn(),
      addToFavorites: vi.fn(),
      removeFromFavorites: vi.fn(),
    })

    render(<SearchBar {...defaultProps} />)

    expect(screen.getByTestId('search-loading')).toBeInTheDocument()
    expect(screen.getByText('Searching...')).toBeInTheDocument()
  })

  it('displays search suggestions', async () => {
    vi.mocked(useSearchStore).mockReturnValue({
      query: 'Parque',
      suggestions: searchSuggestions,
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
    })

    render(<SearchBar {...defaultProps} />)

    await waitFor(() => {
      expect(screen.getByTestId('search-suggestions')).toBeInTheDocument()
    })

    expect(screen.getByText('Parque Envigado, Envigado, Colombia')).toBeInTheDocument()
    expect(screen.getByText('Parque Lleras, Medellín, Colombia')).toBeInTheDocument()
  })

  it('handles suggestion selection', async () => {
    const user = userEvent.setup()
    const mockSelectSuggestion = vi.fn()
    const mockOnLocationSelect = vi.fn()

    vi.mocked(useSearchStore).mockReturnValue({
      query: 'Parque',
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

    render(<SearchBar {...defaultProps} onLocationSelect={mockOnLocationSelect} />)

    await waitFor(() => {
      expect(screen.getByText('Parque Envigado, Envigado, Colombia')).toBeInTheDocument()
    })

    const firstSuggestion = screen.getByText('Parque Envigado, Envigado, Colombia')
    await user.click(firstSuggestion)

    expect(mockSelectSuggestion).toHaveBeenCalledWith(searchSuggestions[0])
    expect(mockOnLocationSelect).toHaveBeenCalledWith(searchSuggestions[0])
  })

  it('handles keyboard navigation in suggestions', async () => {
    const user = userEvent.setup()
    const mockSelectSuggestion = vi.fn()

    vi.mocked(useSearchStore).mockReturnValue({
      query: 'Parque',
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

    render(<SearchBar {...defaultProps} />)

    const searchInput = screen.getByPlaceholderText('Search for a location')

    await waitFor(() => {
      expect(screen.getByTestId('search-suggestions')).toBeInTheDocument()
    })

    // Navigate down with arrow keys
    await user.keyboard('{ArrowDown}')
    await user.keyboard('{ArrowDown}')

    // Select with Enter
    await user.keyboard('{Enter}')

    expect(mockSelectSuggestion).toHaveBeenCalled()
  })

  it('displays recent searches', async () => {
    const recentSearches = [
      locations.parqueEnvigado,
      locations.plazaMayor,
    ]

    vi.mocked(useSearchStore).mockReturnValue({
      query: '',
      suggestions: [],
      isLoading: false,
      error: null,
      recentSearches,
      favorites: [],
      setQuery: vi.fn(),
      clearQuery: vi.fn(),
      selectSuggestion: vi.fn(),
      addToRecent: vi.fn(),
      addToFavorites: vi.fn(),
      removeFromFavorites: vi.fn(),
    })

    render(<SearchBar {...defaultProps} />)

    expect(screen.getByText('Recent Searches')).toBeInTheDocument()
    expect(screen.getByText('Parque Envigado')).toBeInTheDocument()
    expect(screen.getByText('Plaza Mayor')).toBeInTheDocument()
  })

  it('displays favorite locations', async () => {
    const favorites = [
      locations.parqueEnvigado,
      locations.plazaMayor,
    ]

    vi.mocked(useSearchStore).mockReturnValue({
      query: '',
      suggestions: [],
      isLoading: false,
      error: null,
      recentSearches: [],
      favorites,
      setQuery: vi.fn(),
      clearQuery: vi.fn(),
      selectSuggestion: vi.fn(),
      addToRecent: vi.fn(),
      addToFavorites: vi.fn(),
      removeFromFavorites: vi.fn(),
    })

    render(<SearchBar {...defaultProps} />)

    expect(screen.getByText('Favorites')).toBeInTheDocument()
    expect(screen.getByText('Parque Envigado')).toBeInTheDocument()
    expect(screen.getByText('Plaza Mayor')).toBeInTheDocument()
  })

  it('handles clear button click', async () => {
    const user = userEvent.setup()
    const mockClearQuery = vi.fn()

    vi.mocked(useSearchStore).mockReturnValue({
      query: 'Parque',
      suggestions: [],
      isLoading: false,
      error: null,
      recentSearches: [],
      favorites: [],
      setQuery: vi.fn(),
      clearQuery: mockClearQuery,
      selectSuggestion: vi.fn(),
      addToRecent: vi.fn(),
      addToFavorites: vi.fn(),
      removeFromFavorites: vi.fn(),
    })

    render(<SearchBar {...defaultProps} />)

    const clearButton = screen.getByLabelText('Clear search')
    await user.click(clearButton)

    expect(mockClearQuery).toHaveBeenCalled()
  })

  it('displays error message when search fails', () => {
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

    render(<SearchBar {...defaultProps} />)

    expect(screen.getByText(errorMessage)).toBeInTheDocument()
  })

  it('handles geolocation search', async () => {
    const user = userEvent.setup()
    const mockOnLocationSelect = vi.fn()

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

    render(<SearchBar {...defaultProps} onLocationSelect={mockOnLocationSelect} />)

    const geolocationButton = screen.getByLabelText('Use current location')
    await user.click(geolocationButton)

    expect(mockGeolocation.getCurrentPosition).toHaveBeenCalled()
  })

  it('handles geolocation permission denial', async () => {
    const user = userEvent.setup()

    const mockGeolocation = {
      getCurrentPosition: vi.fn().mockImplementation((success, error) => {
        error({
          code: 1, // PERMISSION_DENIED
          message: 'User denied the request for Geolocation.',
        })
      }),
    }

    Object.defineProperty(navigator, 'geolocation', {
      writable: true,
      value: mockGeolocation,
    })

    render(<SearchBar {...defaultProps} />)

    const geolocationButton = screen.getByLabelText('Use current location')
    await user.click(geolocationButton)

    expect(screen.getByText(/Location access denied/)).toBeInTheDocument()
  })

  it('supports coordinate input', async () => {
    const user = userEvent.setup()
    const mockOnLocationSelect = vi.fn()

    render(<SearchBar {...defaultProps} supportCoordinates={true} onLocationSelect={mockOnLocationSelect} />)

    const searchInput = screen.getByPlaceholderText('Search for a location')

    await user.type(searchInput, '6.2442, -75.5812')
    await user.keyboard('{Enter}')

    expect(mockOnLocationSelect).toHaveBeenCalledWith(
      expect.objectContaining({
        coordinates: { lat: 6.2442, lng: -75.5812 }
      })
    )
  })

  it('validates coordinate format', async () => {
    const user = userEvent.setup()

    render(<SearchBar {...defaultProps} supportCoordinates={true} />)

    const searchInput = screen.getByPlaceholderText('Search for a location')

    await user.type(searchInput, 'invalid coordinates')
    await user.keyboard('{Enter}')

    expect(screen.getByText(/Invalid coordinate format/)).toBeInTheDocument()
  })

  it('adds location to favorites', async () => {
    const user = userEvent.setup()
    const mockAddToFavorites = vi.fn()

    vi.mocked(useSearchStore).mockReturnValue({
      query: 'Parque Envigado',
      suggestions: [],
      isLoading: false,
      error: null,
      recentSearches: [],
      favorites: [],
      setQuery: vi.fn(),
      clearQuery: vi.fn(),
      selectSuggestion: vi.fn(),
      addToRecent: vi.fn(),
      addToFavorites: mockAddToFavorites,
      removeFromFavorites: vi.fn(),
    })

    render(<SearchBar {...defaultProps} />)

    const favoriteButton = screen.getByLabelText('Add to favorites')
    await user.click(favoriteButton)

    expect(mockAddToFavorites).toHaveBeenCalled()
  })

  it('removes location from favorites', async () => {
    const user = userEvent.setup()
    const mockRemoveFromFavorites = vi.fn()

    vi.mocked(useSearchStore).mockReturnValue({
      query: 'Parque Envigado',
      suggestions: [],
      isLoading: false,
      error: null,
      recentSearches: [],
      favorites: [locations.parqueEnvigado],
      setQuery: vi.fn(),
      clearQuery: vi.fn(),
      selectSuggestion: vi.fn(),
      addToRecent: vi.fn(),
      addToFavorites: vi.fn(),
      removeFromFavorites: mockRemoveFromFavorites,
    })

    render(<SearchBar {...defaultProps} />)

    const favoriteButton = screen.getByLabelText('Remove from favorites')
    await user.click(favoriteButton)

    expect(mockRemoveFromFavorites).toHaveBeenCalled()
  })

  it('closes suggestions on escape key', async () => {
    const user = userEvent.setup()

    vi.mocked(useSearchStore).mockReturnValue({
      query: 'Parque',
      suggestions: searchSuggestions,
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
    })

    render(<SearchBar {...defaultProps} />)

    const searchInput = screen.getByPlaceholderText('Search for a location')

    await waitFor(() => {
      expect(screen.getByTestId('search-suggestions')).toBeInTheDocument()
    })

    await user.keyboard('{Escape}')

    expect(screen.queryByTestId('search-suggestions')).not.toBeInTheDocument()
  })

  it('is accessible', async () => {
    const { container } = render(<SearchBar {...defaultProps} />)

    // Check for proper ARIA attributes
    const searchInput = screen.getByPlaceholderText('Search for a location')
    expect(searchInput).toHaveAttribute('role', 'combobox')
    expect(searchInput).toHaveAttribute('aria-autocomplete', 'list')
    expect(searchInput).toHaveAttribute('aria-expanded', 'false')

    // Check for proper form labels
    expect(searchInput).toHaveAccessibleName()
    expect(screen.getByLabelText('Clear search')).toBeInTheDocument()

    // Check for keyboard navigation support
    expect(searchInput).toHaveAttribute('tabIndex', '0')
  })

  it('supports custom styling', () => {
    const customClass = 'custom-search-class'
    render(<SearchBar {...defaultProps} className={customClass} />)

    const searchContainer = screen.getByTestId('search-bar')
    expect(searchContainer).toHaveClass(customClass)
  })

  it('debounces search requests', async () => {
    const user = userEvent.setup()
    const mockSetQuery = vi.fn()

    vi.mocked(useSearchStore).mockReturnValue({
      query: '',
      suggestions: [],
      isLoading: false,
      error: null,
      recentSearches: [],
      favorites: [],
      setQuery: mockSetQuery,
      clearQuery: vi.fn(),
      selectSuggestion: vi.fn(),
      addToRecent: vi.fn(),
      addToFavorites: vi.fn(),
      removeFromFavorites: vi.fn(),
    })

    render(<SearchBar {...defaultProps} debounceMs={300} />)

    const searchInput = screen.getByPlaceholderText('Search for a location')

    await user.type(searchInput, 'P')
    await user.type(searchInput, 'a')
    await user.type(searchInput, 'r')
    await user.type(searchInput, 'q')
    await user.type(searchInput, 'u')
    await user.type(searchInput, 'e')

    // Should only be called once after debounce
    expect(mockSetQuery).toHaveBeenCalledTimes(1)
  })
})