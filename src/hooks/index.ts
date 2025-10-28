// Core application hooks
export { default as useGoogleMaps } from './useGoogleMaps';
export { default as useGeolocation } from './useGeolocation';
export { default as useSearch } from './useSearch';

// Utility hooks
export {
  useLocalStorage,
  useLocalStorageWithExpiration,
  useSessionStorage,
} from './useLocalStorage';

export {
  useDebounce,
  useDebounceValue,
  useThrottle,
  default as useDebounceValue,
} from './useDebounce';

// Existing debounce exports
export {
  useDebounce as useSimpleDebounce,
  useDebouncedCallback,
  useDebouncedApi,
} from './useDebounce';

// Store hooks (re-export for convenience)
export {
  useMapStore,
  useSearchStore,
  useUIStore,
  useUserStore,
  useDebugStore,
  useAppState,
  useAppLoading,
  useAppErrors,
  useSelectedLocation,
  resetAllStores,
  validateStores,
  exportStoreData,
  importStoreData,
} from '../stores';

// Specific store selectors
export {
  // Map store selectors
  useMapCenter,
  useMapZoom,
  useMapMarkers,
  useMapBounds,
  useStreetViewState,
  useMapLayers,
  useMapType,
  useMapLoading,
  useMapError,
  useMapFullscreen,
  useVisibleMarkers,
  useActiveLayers,
  useMarkerCount,
  useStreetViewActive,
} from '../stores/mapStore';

export {
  // Search store selectors
  useSearchQuery,
  useSearchPredictions,
  useSearchResults,
  useSelectedSearchResult,
  useSelectedLocation as useSelectedSearchLocation,
  useSearchHistory,
  useSearchLoading,
  useSearching,
  useSearchError,
  useRecentSearches,
  useSearchHistoryByType,
  useHasSearchResults,
} from '../stores/searchStore';

export {
  // UI store selectors
  useSidebarOpen,
  useSidebarTab,
  useActiveModal,
  useTheme,
  useNotifications,
  useTooltips,
  useBreakpoints,
  useLoading as useUILoading,
  useVisibleNotifications,
  useDeviceType,
  useHasActiveModal,
  useHasUnreadNotifications,
  useNotificationActions,
  useModalActions,
  useSidebarActions,
  useThemeActions,
} from '../stores/uiStore';

export {
  // User store selectors
  useUserPreferences,
  useGeolocation as useUserGeolocation,
  useUserProfile,
  useUserStats,
  useIsLoggedIn,
  useHasLocationPermission,
  useIsLocationEnabled,
  useHasValidProfile,
  useTotalActivityCount,
  useLastActiveFormatted,
  usePreferenceActions,
  useGeolocationActions,
  useProfileActions,
  useStatsActions,
} from '../stores/userStore';

// Hook types
export type {
  UseGoogleMapsOptions,
  UseGoogleMapsReturn,
} from './useGoogleMaps';

export type {
  UseGeolocationOptions,
  UseGeolocationReturn,
} from './useGeolocation';

export type {
  UseSearchOptions,
  UseSearchReturn,
} from './useSearch';

export type {
  UseLocalStorageOptions,
  UseLocalStorageReturn,
  UseLocalStorageWithExpirationOptions,
} from './useLocalStorage';

export type {
  UseDebounceOptions,
  UseDebounceReturn,
  UseDebounceValueReturn,
  UseThrottleOptions,
  UseThrottleReturn,
} from './useDebounce';

// Utility function exports
export const createHook = <T extends (...args: any[]) => any>(
  hookFn: T,
  name?: string
): T => {
  const wrappedHook = (...args: Parameters<T>) => {
    try {
      return hookFn(...args);
    } catch (error) {
      console.error(`Error in ${name || 'custom hook'}:`, error);
      throw error;
    }
  };

  return wrappedHook as T;
};

// Hook composition utilities
export const combineHooks = <T extends Record<string, (...args: any[]) => any>>(
  hooks: T
): ((...args: any[]) => { [K in keyof T]: ReturnType<T[K]> }) => {
  return (...args: any[]) => {
    const results = {} as { [K in keyof T]: ReturnType<T[K]> };

    for (const key in hooks) {
      if (hooks.hasOwnProperty(key)) {
        results[key] = hooks[key](...args);
      }
    }

    return results;
  };
};

// Hook debugging utilities
export const debugHook = <T extends (...args: any[]) => any>(
  hook: T,
  name: string,
  enabled: boolean = process.env.NODE_ENV === 'development'
): T => {
  if (!enabled) {
    return hook;
  }

  return ((...args: Parameters<T>) => {
    console.group(`🪝 ${name}`);
    console.log('Args:', args);
    const startTime = performance.now();

    try {
      const result = hook(...args);
      const endTime = performance.now();

      console.log('Result:', result);
      console.log(`Execution time: ${(endTime - startTime).toFixed(2)}ms`);
      console.groupEnd();

      return result;
    } catch (error) {
      const endTime = performance.now();
      console.error('Error:', error);
      console.log(`Failed after: ${(endTime - startTime).toFixed(2)}ms`);
      console.groupEnd();
      throw error;
    }
  }) as T;
};

// Hook memoization utilities
export const useMemoizedHook = <T extends (...args: any[]) => any>(
  hook: T,
  getKey?: (...args: Parameters<T>) => string
): T => {
  const cache = new Map<string, ReturnType<T>>();

  return ((...args: Parameters<T>) => {
    const key = getKey ? getKey(...args) : JSON.stringify(args);

    if (cache.has(key)) {
      return cache.get(key);
    }

    const result = hook(...args);
    cache.set(key, result);
    return result;
  }) as T;
};

// Performance monitoring for hooks
export const withPerformanceMonitoring = <T extends (...args: any[]) => any>(
  hook: T,
  name: string,
  threshold: number = 100
): T => {
  return ((...args: Parameters<T>) => {
    const startTime = performance.now();
    const result = hook(...args);
    const endTime = performance.now();
    const duration = endTime - startTime;

    if (duration > threshold) {
      console.warn(`⚠️ Slow hook detected: ${name} took ${duration.toFixed(2)}ms (threshold: ${threshold}ms)`);
    }

    // Send performance data to analytics if available
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'hook_performance', {
        event_category: 'performance',
        event_label: name,
        value: Math.round(duration),
      });
    }

    return result;
  }) as T;
};