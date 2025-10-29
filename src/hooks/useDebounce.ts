import { useState, useEffect } from 'react';

/**
 * Custom hook to debounce a value
 * @param value The value to debounce
 * @param delay The delay in milliseconds
 * @returns The debounced value
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Custom hook to debounce a function
 * @param func The function to debounce
 * @param delay The delay in milliseconds
 * @param deps Dependencies array
 * @returns The debounced function
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  func: T,
  delay: number,
  deps: React.DependencyList = []
): T {
  const [debouncedFunc, setDebouncedFunc] = useState<T>(() => func);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const debouncedFn = ((...args: Parameters<T>) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        func(...args);
      }, delay);
    }) as T;

    setDebouncedFunc(() => debouncedFn);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [func, delay, ...deps]);

  return debouncedFunc;
}

/**
 * Custom hook to handle debounced API calls with loading state
 * @param apiCall The API function to call
 * @param delay The delay in milliseconds
 * @returns An object with the debounced function, loading state, and error
 */
export function useDebouncedApi<T extends any[], R>(
  apiCall: (...args: T) => Promise<R>,
  delay: number
) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [result, setResult] = useState<R | null>(null);

  const execute = useDebouncedCallback(
    async (...args: T) => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await apiCall(...args);
        setResult(response);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
        setResult(null);
      } finally {
        setIsLoading(false);
      }
    },
    delay,
    [apiCall]
  );

  const reset = () => {
    setIsLoading(false);
    setError(null);
    setResult(null);
  };

  return {
    execute,
    isLoading,
    error,
    result,
    reset,
  };
}