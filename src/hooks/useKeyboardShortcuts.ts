import { useEffect, useCallback } from 'react';

export type KeyboardShortcut = {
  [key: string]: () => void;
};

/**
 * Custom hook for handling keyboard shortcuts
 * Supports modifier keys (Ctrl, Shift, Alt) and combinations
 */
export const useKeyboardShortcuts = (shortcuts: KeyboardShortcut) => {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Build shortcut key string
    const parts: string[] = [];

    if (event.ctrlKey || event.metaKey) parts.push('ctrl');
    if (event.shiftKey) parts.push('shift');
    if (event.altKey) parts.push('alt');

    // Add the key (lowercase for consistency)
    parts.push(event.key.toLowerCase());

    const shortcut = parts.join('+');

    // Find and execute matching shortcut
    const handler = shortcuts[shortcut];
    if (handler) {
      // Prevent default behavior for shortcuts
      event.preventDefault();
      event.stopPropagation();
      handler();
    }
  }, [shortcuts]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
};