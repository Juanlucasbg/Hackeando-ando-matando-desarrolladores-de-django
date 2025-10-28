import { useEffect, useState, useCallback } from 'react';
import { StreetViewKeyboardConfig, StreetViewPosition } from '../types/streetview.types';

interface UseStreetViewKeyboardOptions {
  enabled?: boolean;
  config?: Partial<StreetViewKeyboardConfig>;
  onMove?: (direction: 'forward' | 'backward') => void;
  onZoom?: (direction: 'in' | 'out') => void;
  onRotate?: (direction: 'left' | 'right') => void;
  onPan?: (direction: 'up' | 'down' | 'left' | 'right') => void;
  onExit?: () => void;
  onFullscreen?: () => void;
  onToggleControls?: () => void;
}

const defaultConfig: StreetViewKeyboardConfig = {
  forward: ['w', 'W', 'ArrowUp'],
  backward: ['s', 'S', 'ArrowDown'],
  turnLeft: ['a', 'A', 'ArrowLeft'],
  turnRight: ['d', 'D', 'ArrowRight'],
  zoomIn: ['=', '+', 'Equal'],
  zoomOut: ['-', '_', 'Minus'],
  panUp: ['PageUp'],
  panDown: ['PageDown'],
  panLeft: ['Home'],
  panRight: ['End'],
  exit: ['Escape', 'Esc'],
  fullscreen: ['f', 'F'],
  toggleControls: ['c', 'C'],
};

export const useStreetViewKeyboard = ({
  enabled = true,
  config = {},
  onMove,
  onZoom,
  onRotate,
  onPan,
  onExit,
  onFullscreen,
  onToggleControls,
}: UseStreetViewKeyboardOptions) => {
  const [activeKeys, setActiveKeys] = useState<Set<string>>(new Set());
  const [isDisabled, setIsDisabled] = useState(!enabled);

  const mergedConfig = { ...defaultConfig, ...config };

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (isDisabled || !enabled) return;

      // Prevent default behavior for our keys
      const key = event.key;
      const keyWithCode = event.code;

      // Track active keys
      setActiveKeys(prev => new Set(prev).add(key));

      // Find which action this key triggers
      let actionTriggered = false;

      // Movement controls
      if (mergedConfig.forward.includes(key) || mergedConfig.forward.includes(keyWithCode)) {
        event.preventDefault();
        onMove?.('forward');
        actionTriggered = true;
      } else if (mergedConfig.backward.includes(key) || mergedConfig.backward.includes(keyWithCode)) {
        event.preventDefault();
        onMove?.('backward');
        actionTriggered = true;
      } else if (mergedConfig.turnLeft.includes(key) || mergedConfig.turnLeft.includes(keyWithCode)) {
        event.preventDefault();
        onRotate?.('left');
        actionTriggered = true;
      } else if (mergedConfig.turnRight.includes(key) || mergedConfig.turnRight.includes(keyWithCode)) {
        event.preventDefault();
        onRotate?.('right');
        actionTriggered = true;
      }

      // Zoom controls
      else if (mergedConfig.zoomIn.includes(key) || mergedConfig.zoomIn.includes(keyWithCode)) {
        event.preventDefault();
        onZoom?.('in');
        actionTriggered = true;
      } else if (mergedConfig.zoomOut.includes(key) || mergedConfig.zoomOut.includes(keyWithCode)) {
        event.preventDefault();
        onZoom?.('out');
        actionTriggered = true;
      }

      // Pan controls
      else if (mergedConfig.panUp.includes(key) || mergedConfig.panUp.includes(keyWithCode)) {
        event.preventDefault();
        onPan?.('up');
        actionTriggered = true;
      } else if (mergedConfig.panDown.includes(key) || mergedConfig.panDown.includes(keyWithCode)) {
        event.preventDefault();
        onPan?.('down');
        actionTriggered = true;
      } else if (mergedConfig.panLeft.includes(key) || mergedConfig.panLeft.includes(keyWithCode)) {
        event.preventDefault();
        onPan?.('left');
        actionTriggered = true;
      } else if (mergedConfig.panRight.includes(key) || mergedConfig.panRight.includes(keyWithCode)) {
        event.preventDefault();
        onPan?.('right');
        actionTriggered = true;
      }

      // System controls
      else if (mergedConfig.exit.includes(key) || mergedConfig.exit.includes(keyWithCode)) {
        event.preventDefault();
        onExit?.();
        actionTriggered = true;
      } else if (mergedConfig.fullscreen.includes(key) || mergedConfig.fullscreen.includes(keyWithCode)) {
        event.preventDefault();
        onFullscreen?.();
        actionTriggered = true;
      } else if (mergedConfig.toggleControls.includes(key) || mergedConfig.toggleControls.includes(keyWithCode)) {
        event.preventDefault();
        onToggleControls?.();
        actionTriggered = true;
      }

      // Visual feedback for key press
      if (actionTriggered) {
        document.body.classList.add('streetview-keyboard-active');
      }
    },
    [
      isDisabled,
      enabled,
      mergedConfig,
      onMove,
      onZoom,
      onRotate,
      onPan,
      onExit,
      onFullscreen,
      onToggleControls,
    ]
  );

  const handleKeyUp = useCallback(
    (event: KeyboardEvent) => {
      const key = event.key;
      setActiveKeys(prev => {
        const newSet = new Set(prev);
        newSet.delete(key);
        return newSet;
      });

      // Remove visual feedback when all keys are released
      if (activeKeys.size <= 1) {
        document.body.classList.remove('streetview-keyboard-active');
      }
    },
    [activeKeys.size]
  );

  const handleVisibilityChange = useCallback(() => {
    if (document.hidden) {
      setIsDisabled(true);
      setActiveKeys(new Set());
    } else {
      setIsDisabled(!enabled);
    }
  }, [enabled]);

  // Setup event listeners
  useEffect(() => {
    if (!enabled) return;

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.body.classList.remove('streetview-keyboard-active');
    };
  }, [enabled, handleKeyDown, handleKeyUp, handleVisibilityChange]);

  // Enable/disable keyboard controls
  const enableKeyboard = useCallback(() => {
    setIsDisabled(false);
  }, []);

  const disableKeyboard = useCallback(() => {
    setIsDisabled(true);
    setActiveKeys(new Set());
  }, []);

  // Update configuration
  const updateConfig = useCallback((newConfig: Partial<StreetViewKeyboardConfig>) => {
    // This would update the mergedConfig in a real implementation
    // For now, we'll just trigger a re-render
    setIsDisabled(prev => prev);
  }, []);

  // Check if a specific key is currently pressed
  const isKeyPressed = useCallback((key: string) => {
    return activeKeys.has(key);
  }, [activeKeys]);

  // Get currently active actions
  const getActiveActions = useCallback(() => {
    const actions: string[] = [];

    Object.entries(mergedConfig).forEach(([action, keys]) => {
      if (keys.some(key => activeKeys.has(key))) {
        actions.push(action);
      }
    });

    return actions;
  }, [mergedConfig, activeKeys]);

  return {
    enabled: enabled && !isDisabled,
    activeKeys,
    config: mergedConfig,
    enableKeyboard,
    disableKeyboard,
    updateConfig,
    isKeyPressed,
    getActiveActions,
  };
};