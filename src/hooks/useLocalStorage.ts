import { useState, useEffect, useCallback } from 'react';

interface UseLocalStorageOptions<T> {
  serializer?: {
    read: (value: string) => T;
    write: (value: T) => string;
  };
  syncAcrossTabs?: boolean;
  onError?: (error: Error) => void;
}

interface UseLocalStorageReturn<T> {
  value: T;
  setValue: (value: T | ((prev: T) => T)) => void;
  removeValue: () => void;
  isLoading: boolean;
  error: Error | null;
}

const defaultSerializer = {
  read: <T>(value: string): T => {
    try {
      return JSON.parse(value);
    } catch (error) {
      console.error('Error parsing localStorage value:', error);
      return value as T;
    }
  },
  write: <T>(value: T): string => {
    try {
      return JSON.stringify(value);
    } catch (error) {
      console.error('Error stringifying localStorage value:', error);
      return String(value);
    }
  },
};

export const useLocalStorage = <T>(
  key: string,
  initialValue: T,
  options: UseLocalStorageOptions<T> = {}
): UseLocalStorageReturn<T> => {
  const {
    serializer = defaultSerializer,
    syncAcrossTabs = true,
    onError,
  } = options;

  const [value, setValueState] = useState<T>(initialValue);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Get value from localStorage
  const getValue = useCallback((): T => {
    try {
      const item = window.localStorage.getItem(key);
      if (item === null) {
        return initialValue;
      }
      return serializer.read(item);
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Unknown error reading localStorage');
      setError(err);
      onError?.(err);
      return initialValue;
    }
  }, [key, initialValue, serializer, onError]);

  // Set value to localStorage
  const setValue = useCallback((newValue: T | ((prev: T) => T)) => {
    try {
      const valueToStore = newValue instanceof Function ? newValue(value) : newValue;
      setValueState(valueToStore);
      window.localStorage.setItem(key, serializer.write(valueToStore));
      setError(null);
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Unknown error writing to localStorage');
      setError(err);
      onError?.(err);
    }
  }, [key, value, serializer, onError]);

  // Remove value from localStorage
  const removeValue = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
      setValueState(initialValue);
      setError(null);
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Unknown error removing from localStorage');
      setError(err);
      onError?.(err);
    }
  }, [key, initialValue, onError]);

  // Initialize value
  useEffect(() => {
    try {
      setValueState(getValue());
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Unknown error initializing localStorage');
      setError(err);
      onError?.(err);
    } finally {
      setIsLoading(false);
    }
  }, [getValue, onError]);

  // Sync across tabs
  useEffect(() => {
    if (!syncAcrossTabs) return;

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === key && event.newValue !== null) {
        try {
          setValueState(serializer.read(event.newValue));
          setError(null);
        } catch (error) {
          const err = error instanceof Error ? error : new Error('Unknown error syncing localStorage');
          setError(err);
          onError?.(err);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key, serializer, syncAcrossTabs, onError]);

  return {
    value,
    setValue,
    removeValue,
    isLoading,
    error,
  };
};

// Advanced localStorage hook with expiration
interface UseLocalStorageWithExpirationOptions<T> extends UseLocalStorageOptions<T> {
  expirationMs?: number;
  onExpire?: (key: string, value: T) => void;
}

interface StoredValueWithExpiration<T> {
  value: T;
  timestamp: number;
  expiration: number;
}

export const useLocalStorageWithExpiration = <T>(
  key: string,
  initialValue: T,
  options: UseLocalStorageWithExpirationOptions<T> = {}
): UseLocalStorageReturn<T> => {
  const { expirationMs, onExpire, ...localStorageOptions } = options;

  const expirationSerializer = {
    read: (storedValue: string): T => {
      try {
        const parsed: StoredValueWithExpiration<T> = JSON.parse(storedValue);
        const now = Date.now();

        if (parsed.expiration > 0 && now > parsed.expiration) {
          onExpire?.(key, parsed.value);
          window.localStorage.removeItem(key);
          return initialValue;
        }

        return parsed.value;
      } catch (error) {
        console.error('Error parsing localStorage with expiration:', error);
        return initialValue;
      }
    },
    write: (value: T): string => {
      const now = Date.now();
      const expiration = expirationMs ? now + expirationMs : 0;

      return JSON.stringify({
        value,
        timestamp: now,
        expiration,
      } as StoredValueWithExpiration<T>);
    },
  };

  return useLocalStorage(key, initialValue, {
    ...localStorageOptions,
    serializer: expirationSerializer,
  });
};

// Session storage hook
export const useSessionStorage = <T>(
  key: string,
  initialValue: T,
  options: UseLocalStorageOptions<T> = {}
): UseLocalStorageReturn<T> => {
  const [value, setValueState] = useState<T>(initialValue);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const { serializer = defaultSerializer, onError } = options;

  // Get value from sessionStorage
  const getValue = useCallback((): T => {
    try {
      const item = window.sessionStorage.getItem(key);
      if (item === null) {
        return initialValue;
      }
      return serializer.read(item);
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Unknown error reading sessionStorage');
      setError(err);
      onError?.(err);
      return initialValue;
    }
  }, [key, initialValue, serializer, onError]);

  // Set value to sessionStorage
  const setValue = useCallback((newValue: T | ((prev: T) => T)) => {
    try {
      const valueToStore = newValue instanceof Function ? newValue(value) : newValue;
      setValueState(valueToStore);
      window.sessionStorage.setItem(key, serializer.write(valueToStore));
      setError(null);
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Unknown error writing to sessionStorage');
      setError(err);
      onError?.(err);
    }
  }, [key, value, serializer, onError]);

  // Remove value from sessionStorage
  const removeValue = useCallback(() => {
    try {
      window.sessionStorage.removeItem(key);
      setValueState(initialValue);
      setError(null);
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Unknown error removing from sessionStorage');
      setError(err);
      onError?.(err);
    }
  }, [key, initialValue, onError]);

  // Initialize value
  useEffect(() => {
    try {
      setValueState(getValue());
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Unknown error initializing sessionStorage');
      setError(err);
      onError?.(err);
    } finally {
      setIsLoading(false);
    }
  }, [getValue, onError]);

  return {
    value,
    setValue,
    removeValue,
    isLoading,
    error,
  };
};

export default useLocalStorage;