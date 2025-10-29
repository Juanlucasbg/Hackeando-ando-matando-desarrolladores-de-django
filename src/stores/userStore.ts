import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { UserState, UserPreferences, GeolocationState, Coordinates } from '../types';

interface UserStore extends UserState {
  // Actions
  setPreferences: (preferences: Partial<UserPreferences>) => void;
  setGeolocation: (geolocation: Partial<GeolocationState>) => void;
  watchGeolocation: () => void;
  stopWatchingGeolocation: () => void;
  requestGeolocationPermission: () => Promise<boolean>;
  getCurrentPosition: () => Promise<Coordinates | null>;
  setLoggedIn: (isLoggedIn: boolean) => void;
  setProfile: (profile: UserState['profile']) => void;
  updateProfile: (updates: Partial<UserState['profile']>) => void;
  updateStats: (stats: Partial<UserState['stats']>) => void;
  resetStats: () => void;

  // Computed getters
  hasLocationPermission: () => boolean;
  isLocationEnabled: () => boolean;
  hasValidProfile: () => boolean;
  getTotalActivityCount: () => number;
  getLastActiveFormatted: () => string;
}

const defaultPreferences: UserPreferences = {
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

const defaultGeolocation: GeolocationState = {
  currentPosition: null,
  accuracy: null,
  heading: null,
  speed: null,
  timestamp: null,
  isWatching: false,
  error: null,
  permission: 'prompt',
};

const defaultStats: UserState['stats'] = {
  totalSearches: 0,
  totalMarkers: 0,
  favoritePlaces: 0,
  lastActive: null,
};

const initialState: UserState = {
  preferences: defaultPreferences,
  geolocation: defaultGeolocation,
  isLoggedIn: false,
  profile: null,
  stats: defaultStats,
};

// Geolocation utility functions
const requestGeolocationPermission = async (): Promise<boolean> => {
  if (!navigator.geolocation) {
    return false;
  }

  try {
    const permission = await navigator.permissions.query({ name: 'geolocation' });
    return permission.state === 'granted';
  } catch (error) {
    console.error('Error checking geolocation permission:', error);
    return false;
  }
};

const getCurrentPosition = (): Promise<Coordinates | null> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      }
    );
  });
};

let watchId: number | null = null;

export const useUserStore = create<UserStore>()(
  devtools(
    persist(
      immer((set, get) => ({
        ...initialState,

        // Actions
        setPreferences: (preferences) =>
          set((state) => {
            state.preferences = { ...state.preferences, ...preferences };
          }),

        setGeolocation: (geolocation) =>
          set((state) => {
            state.geolocation = { ...state.geolocation, ...geolocation };
          }),

        watchGeolocation: () => {
          if (!navigator.geolocation) {
            get().setGeolocation({
              error: 'Geolocation is not supported',
              permission: 'denied',
            });
            return;
          }

          if (get().geolocation.isWatching) {
            return; // Already watching
          }

          watchId = navigator.geolocation.watchPosition(
            (position) => {
              set((state) => {
                state.geolocation = {
                  ...state.geolocation,
                  currentPosition: {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                  },
                  accuracy: position.coords.accuracy,
                  heading: position.coords.heading,
                  speed: position.coords.speed,
                  timestamp: position.timestamp,
                  error: null,
                  isWatching: true,
                  permission: 'granted',
                };
              });
            },
            (error) => {
              set((state) => {
                state.geolocation.error = error.message;
                state.geolocation.permission = 'denied';
                state.geolocation.isWatching = false;
              });
            },
            {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 60000, // 1 minute
            }
          );
        },

        stopWatchingGeolocation: () => {
          if (watchId !== null) {
            navigator.geolocation.clearWatch(watchId);
            watchId = null;
          }

          set((state) => {
            state.geolocation.isWatching = false;
          });
        },

        requestGeolocationPermission: async () => {
          const hasPermission = await requestGeolocationPermission();
          set((state) => {
            state.geolocation.permission = hasPermission ? 'granted' : 'denied';
          });
          return hasPermission;
        },

        getCurrentPosition: async () => {
          try {
            const position = await getCurrentPosition();
            set((state) => {
              state.geolocation.currentPosition = position;
              state.geolocation.timestamp = Date.now();
              state.geolocation.error = null;
              state.geolocation.permission = 'granted';
            });
            return position;
          } catch (error) {
            set((state) => {
              state.geolocation.error = error instanceof Error ? error.message : 'Unknown error';
              state.geolocation.permission = 'denied';
            });
            return null;
          }
        },

        setLoggedIn: (isLoggedIn) =>
          set((state) => {
            state.isLoggedIn = isLoggedIn;
            if (!isLoggedIn) {
              state.profile = null;
            }
          }),

        setProfile: (profile) =>
          set((state) => {
            state.profile = profile;
          }),

        updateProfile: (updates) =>
          set((state) => {
            if (state.profile) {
              state.profile = { ...state.profile, ...updates };
            } else {
              state.profile = updates;
            }
          }),

        updateStats: (stats) =>
          set((state) => {
            state.stats = {
              ...state.stats,
              ...stats,
              lastActive: stats.lastActive || new Date(),
            };
          }),

        resetStats: () =>
          set((state) => {
            state.stats = defaultStats;
          }),

        // Computed getters
        hasLocationPermission: () => {
          return get().geolocation.permission === 'granted';
        },

        isLocationEnabled: () => {
          return get().preferences.enableLocation && get().geolocation.permission === 'granted';
        },

        hasValidProfile: () => {
          const profile = get().profile;
          return profile !== null && !!profile.id && !!profile.name;
        },

        getTotalActivityCount: () => {
          const stats = get().stats;
          return stats.totalSearches + stats.totalMarkers + stats.favoritePlaces;
        },

        getLastActiveFormatted: () => {
          const lastActive = get().stats.lastActive;
          if (!lastActive) return 'Never';

          const now = new Date();
          const diff = now.getTime() - lastActive.getTime();
          const days = Math.floor(diff / (1000 * 60 * 60 * 24));

          if (days === 0) return 'Today';
          if (days === 1) return 'Yesterday';
          if (days < 7) return `${days} days ago`;
          if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
          return `${Math.floor(days / 30)} months ago`;
        },
      })),
      {
        name: 'user-store',
        version: 1,
        partialize: (state) => ({
          preferences: state.preferences,
          geolocation: {
            permission: state.geolocation.permission,
          },
          stats: state.stats,
        }),
        onRehydrateStorage: () => (state) => {
          console.log('User store hydrated:', state);

          // Request geolocation permission if enabled
          if (state?.preferences.enableLocation && state?.geolocation.permission === 'prompt') {
            requestGeolocationPermission().then((hasPermission) => {
              if (state) {
                state.geolocation.permission = hasPermission ? 'granted' : 'denied';
              }
            });
          }
        },
      }
    ),
    {
      name: 'user-store',
      enabled: process.env.NODE_ENV === 'development',
    }
  )
);

// Selectors for optimized re-renders
export const useUserPreferences = () => useUserStore((state) => state.preferences);
export const useGeolocation = () => useUserStore((state) => state.geolocation);
export const useUserProfile = () => useUserStore((state) => state.profile);
export const useUserStats = () => useUserStore((state) => state.stats);
export const useIsLoggedIn = () => useUserStore((state) => state.isLoggedIn);

// Computed selectors
export const useHasLocationPermission = () => useUserStore((state) => state.hasLocationPermission());
export const useIsLocationEnabled = () => useUserStore((state) => state.isLocationEnabled());
export const useHasValidProfile = () => useUserStore((state) => state.hasValidProfile());
export const useTotalActivityCount = () => useUserStore((state) => state.getTotalActivityCount());
export const useLastActiveFormatted = () => useUserStore((state) => state.getLastActiveFormatted());

// Preference hooks
export const usePreferenceActions = () => useUserStore((state) => ({
  setPreferences: state.setPreferences,
  preferences: state.preferences,
}));

// Geolocation hooks
export const useGeolocationActions = () => useUserStore((state) => ({
  watchGeolocation: state.watchGeolocation,
  stopWatchingGeolocation: state.stopWatchingGeolocation,
  requestGeolocationPermission: state.requestGeolocationPermission,
  getCurrentPosition: state.getCurrentPosition,
  setGeolocation: state.setGeolocation,
}));

// Profile hooks
export const useProfileActions = () => useUserStore((state) => ({
  setProfile: state.setProfile,
  updateProfile: state.updateProfile,
  setLoggedIn: state.setLoggedIn,
}));

// Stats hooks
export const useStatsActions = () => useUserStore((state) => ({
  updateStats: state.updateStats,
  resetStats: state.resetStats,
}));

export default useUserStore;