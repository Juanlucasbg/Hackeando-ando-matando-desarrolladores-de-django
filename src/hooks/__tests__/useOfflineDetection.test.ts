import { renderHook, act } from '@testing-library/react';
import { vi } from 'vitest';
import { useOfflineDetection } from '../useOfflineDetection';

// Mock window object for testing
const mockNavigator = {
  onLine: true,
};

Object.defineProperty(window, 'navigator', {
  value: mockNavigator,
  writable: true,
});

describe('useOfflineDetection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigator.onLine = true;
  });

  test('returns true when initially online', () => {
    const { result } = renderHook(() => useOfflineDetection());

    expect(result.current).toBe(true);
  });

  test('returns false when initially offline', () => {
    mockNavigator.onLine = false;

    const { result } = renderHook(() => useOfflineDetection());

    expect(result.current).toBe(false);
  });

  test('handles online event', () => {
    mockNavigator.onLine = false;

    const { result } = renderHook(() => useOfflineDetection());

    expect(result.current).toBe(false);

    act(() => {
      window.dispatchEvent(new Event('online'));
    });

    expect(result.current).toBe(true);
  });

  test('handles offline event', () => {
    const { result } = renderHook(() => useOfflineDetection());

    expect(result.current).toBe(true);

    act(() => {
      window.dispatchEvent(new Event('offline'));
    });

    expect(result.current).toBe(false);
  });

  test('adds and removes event listeners on cleanup', () => {
    const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

    const { unmount } = renderHook(() => useOfflineDetection());

    expect(addEventListenerSpy).toHaveBeenCalledWith('online', expect.any(Function));
    expect(addEventListenerSpy).toHaveBeenCalledWith('offline', expect.any(Function));

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('online', expect.any(Function));
    expect(removeEventListenerSpy).toHaveBeenCalledWith('offline', expect.any(Function));

    addEventListenerSpy.mockRestore();
    removeEventListenerSpy.mockRestore();
  });
});