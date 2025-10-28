import { useRef, useCallback, useEffect } from 'react';

export interface TouchGestureOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onTap?: () => void;
  onLongPress?: () => void;
  threshold?: number;
  longPressDelay?: number;
  disabled?: boolean;
}

export interface TouchGestureState {
  startX: number;
  startY: number;
  startTime: number;
  isLongPress: boolean;
  hasMoved: boolean;
}

/**
 * Custom hook for handling touch gestures on mobile devices
 * Supports: swipe left/right/up/down, tap, long press
 */
export const useTouchGestures = (options: TouchGestureOptions = {}) => {
  const {
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    onTap,
    onLongPress,
    threshold = 50,
    longPressDelay = 500,
    disabled = false,
  } = options;

  const stateRef = useRef<TouchGestureState>({
    startX: 0,
    startY: 0,
    startTime: 0,
    isLongPress: false,
    hasMoved: false,
  });

  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleTouchStart = useCallback((event: TouchEvent) => {
    if (disabled) return;

    const touch = event.touches[0];
    stateRef.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      startTime: Date.now(),
      isLongPress: false,
      hasMoved: false,
    };

    // Set up long press timer
    if (onLongPress) {
      longPressTimerRef.current = setTimeout(() => {
        stateRef.current.isLongPress = true;
        onLongPress();
      }, longPressDelay);
    }
  }, [disabled, onLongPress, longPressDelay]);

  const handleTouchMove = useCallback((event: TouchEvent) => {
    if (disabled) return;

    const touch = event.touches[0];
    const deltaX = Math.abs(touch.clientX - stateRef.current.startX);
    const deltaY = Math.abs(touch.clientY - stateRef.current.startY);

    // Cancel long press if user moved
    if (!stateRef.current.hasMoved && (deltaX > 10 || deltaY > 10)) {
      stateRef.current.hasMoved = true;
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
      }
    }
  }, [disabled]);

  const handleTouchEnd = useCallback((event: TouchEvent) => {
    if (disabled) return;

    // Clear long press timer
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - stateRef.current.startX;
    const deltaY = touch.clientY - stateRef.current.startY;
    const deltaTime = Date.now() - stateRef.current.startTime;
    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);

    // Determine gesture type
    if (!stateRef.current.isLongPress && !stateRef.current.hasMoved) {
      // Tap gesture
      if (onTap && deltaTime < 300) {
        onTap();
      }
    } else if (!stateRef.current.isLongPress) {
      // Swipe gestures
      if (absDeltaX > absDeltaY && absDeltaX > threshold) {
        // Horizontal swipe
        if (deltaX > 0 && onSwipeRight) {
          onSwipeRight();
        } else if (deltaX < 0 && onSwipeLeft) {
          onSwipeLeft();
        }
      } else if (absDeltaY > absDeltaX && absDeltaY > threshold) {
        // Vertical swipe
        if (deltaY > 0 && onSwipeDown) {
          onSwipeDown();
        } else if (deltaY < 0 && onSwipeUp) {
          onSwipeUp();
        }
      }
    }
  }, [disabled, onTap, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, threshold]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
      }
    };
  }, []);

  // Return event handlers
  return {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
  };
};