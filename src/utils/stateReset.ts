import { AppState, UserPreferences, GeolocationState, UIState } from '../types';
import { useMapStore, useSearchStore, useUIStore, useUserStore } from '../stores';

// Default state values
export const DEFAULT_MAP_STATE = {
  center: { lat: 40.7128, lng: -74.0060 }, // New York
  zoom: 12,
  bounds: null,
  markers: [],
  selectedLocation: null,
  isLoading: false,
  error: null,
  streetView: {
    visible: false,
    position: null,
    pov: { heading: 165, pitch: 0 },
    zoom: 1,
  },
  layers: [
    { id: 'traffic', name: 'Traffic', type: 'traffic', visible: false },
    { id: 'transit', name: 'Transit', type: 'transit', visible: false },
    { id: 'bicycling', name: 'Bicycling', type: 'bicycling', visible: false },
  ],
  mapType: google.maps.MapTypeId.ROADMAP,
  gestureHandling: 'auto',
  isFullscreen: false,
};

export const DEFAULT_SEARCH_STATE = {
  query: '',
  predictions: [],
  results: [],
  selectedLocation: null,
  isLoading: false,
  error: null,
  history: [],
  isSearching: false,
  lastSearchTime: null,
};

export const DEFAULT_UI_STATE: UIState = {
  sidebarOpen: true,
  sidebarTab: 'search',
  activeModal: null,
  loading: false,
  theme: 'system',
  notifications: [],
  tooltips: {},
  breakpoints: {
    mobile: false,
    tablet: false,
    desktop: true,
  },
};

export const DEFAULT_USER_PREFERENCES: UserPreferences = {
  theme: 'system',
  language: 'en',
  units: 'metric',
  mapType: google.maps.MapTypeId.ROADMAP,
  defaultZoom: 12,
  enableLocation: true,
  enableNotifications: true,
  autoSaveSearch: true,
  showTraffic: false,
  showTransit: false,
  gestureHandling: 'auto',
};

export const DEFAULT_GEOLOCATION_STATE: GeolocationState = {
  currentPosition: null,
  accuracy: null,
  heading: null,
  speed: null,
  timestamp: null,
  isWatching: false,
  error: null,
  permission: 'prompt',
};

export const DEFAULT_USER_STATE = {
  preferences: DEFAULT_USER_PREFERENCES,
  geolocation: DEFAULT_GEOLOCATION_STATE,
  isLoggedIn: false,
  profile: null,
  stats: {
    totalSearches: 0,
    totalMarkers: 0,
    favoritePlaces: 0,
    lastActive: null,
  },
};

export const DEFAULT_APP_STATE: AppState = {
  map: DEFAULT_MAP_STATE,
  search: DEFAULT_SEARCH_STATE,
  ui: DEFAULT_UI_STATE,
  user: DEFAULT_USER_STATE,
};

// Reset configuration
interface ResetConfig {
  preserve?: {
    map?: (keyof typeof DEFAULT_MAP_STATE)[];
    search?: (keyof typeof DEFAULT_SEARCH_STATE)[];
    ui?: (keyof typeof DEFAULT_UI_STATE)[];
    user?: {
      preferences?: (keyof UserPreferences)[];
      geolocation?: (keyof GeolocationState)[];
      profile?: boolean;
      stats?: boolean;
      isLoggedIn?: boolean;
    };
  };
  clearPersisted?: boolean;
  onReset?: (store: string) => void;
  onResetComplete?: () => void;
}

// State reset manager
export class StateResetManager {
  private static instance: StateResetManager;
  private resetHistory: Array<{
    timestamp: Date;
    store: string;
    config: ResetConfig;
  }> = [];

  private constructor() {}

  public static getInstance(): StateResetManager {
    if (!StateResetManager.instance) {
      StateResetManager.instance = new StateResetManager();
    }
    return StateResetManager.instance;
  }

  public resetAll(config: ResetConfig = {}): void {
    const { preserve = {}, clearPersisted = false, onReset, onResetComplete } = config;

    console.log('Resetting all application state');

    // Reset map store
    this.resetMapStore(preserve.map, onReset);

    // Reset search store
    this.resetSearchStore(preserve.search, onReset);

    // Reset UI store
    this.resetUIStore(preserve.ui, onReset);

    // Reset user store
    this.resetUserStore(preserve.user, onReset);

    // Clear persisted data if requested
    if (clearPersisted) {
      this.clearPersistedData();
    }

    // Record reset in history
    this.resetHistory.push({
      timestamp: new Date(),
      store: 'all',
      config,
    });

    // Limit history size
    if (this.resetHistory.length > 50) {
      this.resetHistory = this.resetHistory.slice(-50);
    }

    onResetComplete?.();
  }

  public resetMapStore(preserve: (keyof typeof DEFAULT_MAP_STATE)[] = [], onReset?: (store: string) => void): void {
    const mapStore = useMapStore.getState();
    const defaultState = { ...DEFAULT_MAP_STATE };

    // Preserve specified fields
    preserve.forEach((key) => {
      if (key in mapStore) {
        (defaultState as any)[key] = (mapStore as any)[key];
      }
    });

    // Reset map state
    mapStore.resetMap();
    Object.keys(defaultState).forEach((key) => {
      if (!(preserve as string[]).includes(key)) {
        (mapStore as any)[key] = (defaultState as any)[key];
      }
    });

    onReset?.('map');
    console.log('Map store reset');
  }

  public resetSearchStore(preserve: (keyof typeof DEFAULT_SEARCH_STATE)[] = [], onReset?: (store: string) => void): void {
    const searchStore = useSearchStore.getState();
    const defaultState = { ...DEFAULT_SEARCH_STATE };

    // Preserve specified fields
    preserve.forEach((key) => {
      if (key in searchStore) {
        (defaultState as any)[key] = (searchStore as any)[key];
      }
    });

    // Reset search state
    searchStore.clearSearch();
    Object.keys(defaultState).forEach((key) => {
      if (!(preserve as string[]).includes(key)) {
        (searchStore as any)[key] = (defaultState as any)[key];
      }
    });

    onReset?.('search');
    console.log('Search store reset');
  }

  public resetUIStore(preserve: (keyof typeof DEFAULT_UI_STATE)[] = [], onReset?: (store: string) => void): void {
    const uiStore = useUIStore.getState();
    const defaultState = { ...DEFAULT_UI_STATE };

    // Preserve specified fields
    preserve.forEach((key) => {
      if (key in uiStore) {
        (defaultState as any)[key] = (uiStore as any)[key];
      }
    });

    // Reset UI state
    uiStore.clearNotifications();
    Object.keys(defaultState).forEach((key) => {
      if (!(preserve as string[]).includes(key)) {
        (uiStore as any)[key] = (defaultState as any)[key];
      }
    });

    onReset?.('ui');
    console.log('UI store reset');
  }

  public resetUserStore(preserve: ResetConfig['preserve']['user'] = {}, onReset?: (store: string) => void): void {
    const userStore = useUserStore.getState();
    const defaultState = { ...DEFAULT_USER_STATE };

    if (!preserve) return;

    // Preserve preferences
    if (preserve.preferences) {
      preserve.preferences.forEach((key) => {
        if (key in userStore.preferences) {
          (defaultState.preferences as any)[key] = (userStore.preferences as any)[key];
        }
      });
    }

    // Preserve geolocation
    if (preserve.geolocation) {
      preserve.geolocation.forEach((key) => {
        if (key in userStore.geolocation) {
          (defaultState.geolocation as any)[key] = (userStore.geolocation as any)[key];
        }
      });
    }

    // Preserve profile
    if (preserve.profile && userStore.profile) {
      defaultState.profile = userStore.profile;
    }

    // Preserve stats
    if (preserve.stats && userStore.stats) {
      defaultState.stats = userStore.stats;
    }

    // Preserve login status
    if (preserve.isLoggedIn !== undefined) {
      defaultState.isLoggedIn = preserve.isLoggedIn;
    }

    // Reset user state
    Object.keys(defaultState).forEach((key) => {
      (userStore as any)[key] = (defaultState as any)[key];
    });

    onReset?.('user');
    console.log('User store reset');
  }

  public clearPersistedData(): void {
    try {
      // Clear localStorage
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.includes('-store') || key.includes('persist:'))) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));

      // Clear sessionStorage
      const sessionKeysToRemove: string[] = [];
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && (key.includes('-store') || key.includes('persist:'))) {
          sessionKeysToRemove.push(key);
        }
      }
      sessionKeysToRemove.forEach(key => sessionStorage.removeItem(key));

      console.log('Persisted data cleared');
    } catch (error) {
      console.error('Error clearing persisted data:', error);
    }
  }

  public getResetHistory(): typeof this.resetHistory {
    return [...this.resetHistory];
  }

  public clearResetHistory(): void {
    this.resetHistory = [];
  }

  public exportResetConfiguration(): ResetConfig {
    return {
      preserve: {
        map: [],
        search: [],
        ui: [],
        user: {
          preferences: [],
          geolocation: [],
          profile: false,
          stats: false,
          isLoggedIn: false,
        },
      },
      clearPersisted: false,
    };
  }

  public createPresetConfig(preset: 'minimal' | 'partial' | 'full'): ResetConfig {
    switch (preset) {
      case 'minimal':
        return {
          preserve: {
            user: {
              preferences: ['theme', 'language', 'units'],
              profile: true,
              isLoggedIn: true,
            },
          },
          clearPersisted: false,
        };

      case 'partial':
        return {
          preserve: {
            map: ['center', 'zoom', 'mapType'],
            search: ['history'],
            ui: ['theme', 'sidebarOpen'],
            user: {
              preferences: ['theme', 'language', 'units', 'mapType', 'defaultZoom'],
              geolocation: ['permission'],
              profile: true,
              stats: true,
            },
          },
          clearPersisted: false,
        };

      case 'full':
        return {
          preserve: {
            map: ['center', 'zoom', 'mapType', 'gestureHandling'],
            search: ['history'],
            ui: ['theme', 'sidebarOpen', 'sidebarTab'],
            user: {
              preferences: Object.keys(DEFAULT_USER_PREFERENCES) as (keyof UserPreferences)[],
              geolocation: ['permission'],
              profile: true,
              stats: true,
              isLoggedIn: true,
            },
          },
          clearPersisted: false,
        };

      default:
        return this.exportResetConfiguration();
    }
  }
}

// Convenience functions
export const resetAllStores = (config: ResetConfig = {}): void => {
  StateResetManager.getInstance().resetAll(config);
};

export const resetMapStore = (preserve: (keyof typeof DEFAULT_MAP_STATE)[] = []): void => {
  StateResetManager.getInstance().resetMapStore(preserve);
};

export const resetSearchStore = (preserve: (keyof typeof DEFAULT_SEARCH_STATE)[] = []): void => {
  StateResetManager.getInstance().resetSearchStore(preserve);
};

export const resetUIStore = (preserve: (keyof typeof DEFAULT_UI_STATE)[] = []): void => {
  StateResetManager.getInstance().resetUIStore(preserve);
};

export const resetUserStore = (preserve: ResetConfig['preserve']['user'] = {}): void => {
  StateResetManager.getInstance().resetUserStore(preserve);
};

export const clearPersistedData = (): void => {
  StateResetManager.getInstance().clearPersistedData();
};

// Hook for programmatic resets
export const useStateReset = () => {
  const resetManager = StateResetManager.getInstance();

  return {
    resetAll: resetManager.resetAll.bind(resetManager),
    resetMap: resetManager.resetMapStore.bind(resetManager),
    resetSearch: resetManager.resetSearchStore.bind(resetManager),
    resetUI: resetManager.resetUIStore.bind(resetManager),
    resetUser: resetManager.resetUserStore.bind(resetManager),
    clearPersisted: resetManager.clearPersistedData.bind(resetManager),
    getHistory: resetManager.getResetHistory.bind(resetManager),
    clearHistory: resetManager.clearResetHistory.bind(resetManager),
    createPreset: resetManager.createPresetConfig.bind(resetManager),
  };
};

export default StateResetManager;