import { useEffect, useCallback, useRef } from 'react';
import { useUserStore, useMapStore, useSearchStore } from '../stores';
import { Coordinates } from '../types';

interface UseGeolocationOptions {
  watch?: boolean;
  highAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
  enableHighAccuracy?: boolean;
  onSuccess?: (position: GeolocationPosition) => void;
  onError?: (error: GeolocationPositionError) => void;
  onPermissionChanged?: (permission: GeolocationPermissionState) => void;
}

interface UseGeolocationReturn {
  currentPosition: Coordinates | null;
  accuracy: number | null;
  heading: number | null;
  speed: number | null;
  timestamp: number | null;
  isWatching: boolean;
  error: string | null;
  permission: GeolocationPermissionState;
  loading: boolean;
  isSupported: boolean;
  getCurrentPosition: () => Promise<Coordinates | null>;
  watchPosition: () => void;
  stopWatching: () => void;
  requestPermission: () => Promise<boolean>;
  centerMapOnCurrentPosition: () => Promise<void>;
  searchNearCurrentPosition: (query: string) => Promise<void>;
}

const defaultOptions: UseGeolocationOptions = {
  watch: false,
  highAccuracy: true,
  timeout: 10000,
  maximumAge: 300000, // 5 minutes
  enableHighAccuracy: true,
};

export const useGeolocation = (options: UseGeolocationOptions = {}): UseGeolocationReturn => {
  const optionsRef = useRef({ ...defaultOptions, ...options });
  const watchIdRef = useRef<number | null>(null);

  // Store selectors
  const {
    currentPosition,
    accuracy,
    heading,
    speed,
    timestamp,
    isWatching,
    error,
    permission,
    setGeolocation,
    watchGeolocation,
    stopWatchingGeolocation,
    requestGeolocationPermission,
    getCurrentPosition: getStoreCurrentPosition,
  } = useUserStore();

  const { setCenter: setMapCenter, addMarker, setLoading: setMapLoading } = useMapStore();
  const { performSearch } = useSearchStore();

  // Check if geolocation is supported
  const isSupported = 'geolocation' in navigator;

  // Get current position
  const getCurrentPosition = useCallback(async (): Promise<Coordinates | null> => {
    if (!isSupported) {
      setGeolocation({
        error: 'Geolocation is not supported by this browser',
        permission: 'denied',
      });
      return null;
    }

    setGeolocation({ loading: true, error: null });

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          {
            enableHighAccuracy: optionsRef.current.enableHighAccuracy,
            timeout: optionsRef.current.timeout,
            maximumAge: optionsRef.current.maximumAge,
          }
        );
      });

      const coordinates: Coordinates = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };

      setGeolocation({
        currentPosition: coordinates,
        accuracy: position.coords.accuracy,
        heading: position.coords.heading,
        speed: position.coords.speed,
        timestamp: position.timestamp,
        loading: false,
        error: null,
        permission: 'granted',
      });

      optionsRef.current.onSuccess?.(position);
      return coordinates;
    } catch (error) {
      const errorMessage = error instanceof GeolocationPositionError ? error.message : 'Unknown error';
      const errorCode = error instanceof GeolocationPositionError ? error.code : 0;

      setGeolocation({
        loading: false,
        error: errorMessage,
        permission: errorCode === GeolocationPositionError.PERMISSION_DENIED ? 'denied' : 'prompt',
      });

      optionsRef.current.onError?.(error as GeolocationPositionError);
      return null;
    }
  }, [isSupported, setGeolocation]);

  // Watch position
  const watchPosition = useCallback(() => {
    if (!isSupported) {
      setGeolocation({
        error: 'Geolocation is not supported by this browser',
        permission: 'denied',
      });
      return;
    }

    if (watchIdRef.current !== null) {
      return; // Already watching
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const coordinates: Coordinates = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        setGeolocation({
          currentPosition: coordinates,
          accuracy: position.coords.accuracy,
          heading: position.coords.heading,
          speed: position.coords.speed,
          timestamp: position.timestamp,
          loading: false,
          error: null,
          isWatching: true,
          permission: 'granted',
        });

        optionsRef.current.onSuccess?.(position);
      },
      (error) => {
        const errorMessage = error instanceof GeolocationPositionError ? error.message : 'Unknown error';
        const errorCode = error instanceof GeolocationPositionError ? error.code : 0;

        setGeolocation({
          loading: false,
          error: errorMessage,
          permission: errorCode === GeolocationPositionError.PERMISSION_DENIED ? 'denied' : 'prompt',
          isWatching: false,
        });

        optionsRef.current.onError?.(error as GeolocationPositionError);
      },
      {
        enableHighAccuracy: optionsRef.current.enableHighAccuracy,
        timeout: optionsRef.current.timeout,
        maximumAge: optionsRef.current.maximumAge,
      }
    );

    setGeolocation({ isWatching: true });
  }, [isSupported, setGeolocation]);

  // Stop watching position
  const stopWatching = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    setGeolocation({ isWatching: false });
  }, [setGeolocation]);

  // Request permission
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isSupported) return false;

    try {
      const permissionResult = await requestGeolocationPermission();
      optionsRef.current.onPermissionChanged?.(permissionResult ? 'granted' : 'denied');
      return permissionResult;
    } catch (error) {
      console.error('Error requesting geolocation permission:', error);
      return false;
    }
  }, [isSupported, requestGeolocationPermission]);

  // Center map on current position
  const centerMapOnCurrentPosition = useCallback(async (): Promise<void> => {
    const position = currentPosition || (await getCurrentPosition());

    if (position) {
      setMapCenter(position);
      setMapLoading(true);

      // Add current location marker
      addMarker({
        position,
        title: 'Your Location',
        description: 'Current GPS location',
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: '#4285F4',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2,
        },
        zIndex: 1000,
        animation: google.maps.Animation.DROP,
      });

      setMapLoading(false);
    }
  }, [currentPosition, getCurrentPosition, setMapCenter, addMarker, setMapLoading]);

  // Search near current position
  const searchNearCurrentPosition = useCallback(async (query: string): Promise<void> => {
    const position = currentPosition || (await getCurrentPosition());

    if (position) {
      const searchQuery = `${query} near ${position.lat.toFixed(6)},${position.lng.toFixed(6)}`;
      await performSearch(searchQuery);
    }
  }, [currentPosition, getCurrentPosition, performSearch]);

  // Initialize geolocation
  useEffect(() => {
    if (optionsRef.current.watch && isSupported && permission === 'granted') {
      watchPosition();
    }

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [optionsRef.current.watch, isSupported, permission, watchPosition]);

  // Monitor permission changes
  useEffect(() => {
    if (!isSupported) return;

    const checkPermission = async () => {
      try {
        const permissionStatus = await navigator.permissions.query({ name: 'geolocation' });
        optionsRef.current.onPermissionChanged?.(permissionStatus.state as GeolocationPermissionState);

        permissionStatus.addEventListener('change', () => {
          optionsRef.current.onPermissionChanged?.(permissionStatus.state as GeolocationPermissionState);
        });
      } catch (error) {
        console.error('Error checking geolocation permission:', error);
      }
    };

    checkPermission();
  }, [isSupported]);

  return {
    currentPosition,
    accuracy,
    heading,
    speed,
    timestamp,
    isWatching,
    error,
    permission,
    loading: useUserStore.getState().geolocation.loading ?? false,
    isSupported,
    getCurrentPosition,
    watchPosition,
    stopWatching,
    requestPermission,
    centerMapOnCurrentPosition,
    searchNearCurrentPosition,
  };
};

export default useGeolocation;