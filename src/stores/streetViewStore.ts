import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import {
  StreetViewState,
  StreetViewStore,
  StreetViewPosition,
  StreetViewControlOptions,
  StreetViewPerformanceOptions,
  StreetViewAccessibilityOptions,
  StreetViewError,
  StreetViewKeyboardConfig,
} from '../types/streetview.types';

// Default configurations
const defaultControlOptions: StreetViewControlOptions = {
  showZoomControls: true,
  showPanControls: true,
  showMovementControls: true,
  showCompass: true,
  showInfoPanel: true,
  showMeasurementTools: true,
  position: 'bottom-left',
};

const defaultPerformanceOptions: StreetViewPerformanceOptions = {
  preloadAdjacent: false,
  cacheSize: 50,
  quality: 'auto',
  enableWebGL: true,
  hardwareAcceleration: true,
};

const defaultAccessibilityOptions: StreetViewAccessibilityOptions = {
  highContrast: false,
  largeText: false,
  reducedMotion: false,
  screenReader: false,
  keyboardNavigation: true,
  visualIndicators: true,
};

const defaultKeyboardConfig: StreetViewKeyboardConfig = {
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

const initialState: StreetViewState = {
  isVisible: false,
  isLoading: false,
  hasError: false,
  currentPosition: null,
  currentPano: null,
  history: [],
  historyIndex: -1,
  isFullscreen: false,
  showControls: true,
  measurementMode: false,
  measurementPoints: [],
  isMoving: false,
  isTransitioning: false,
};

export const useStreetViewStore = create<StreetViewStore>()(
  devtools(
    subscribeWithSelector((set, get) => ({
      state: initialState,
      options: defaultControlOptions,
      keyboard: {
        enabled: true,
        config: defaultKeyboardConfig,
        activeKeys: new Set(),
      },
      performance: defaultPerformanceOptions,
      accessibility: defaultAccessibilityOptions,

      actions: {
        // View control actions
        showStreetView: (position: StreetViewPosition) => {
          const state = get().state;
          const newPosition = {
            ...position,
            timestamp: Date.now(),
          };

          set((prev) => ({
            state: {
              ...prev.state,
              isVisible: true,
              currentPosition: newPosition,
              history: [...prev.state.history, newPosition],
              historyIndex: prev.state.history.length,
              hasError: false,
              errorMessage: undefined,
            },
          }));
        },

        hideStreetView: () => {
          set((prev) => ({
            state: {
              ...prev.state,
              isVisible: false,
              isFullscreen: false,
            },
          }));
        },

        // Position and POV actions
        setPosition: (position: StreetViewPosition) => {
          const state = get().state;
          const newPosition = {
            ...position,
            timestamp: Date.now(),
          };

          set((prev) => ({
            state: {
              ...prev.state,
              currentPosition: newPosition,
              history: [...prev.state.history.slice(0, prev.state.historyIndex + 1), newPosition],
              historyIndex: prev.state.historyIndex + 1,
            },
          }));
        },

        setPOV: (pov: { heading: number; pitch: number }) => {
          const state = get().state;
          if (state.currentPosition) {
            set((prev) => ({
              state: {
                ...prev.state,
                currentPosition: {
                  ...prev.state.currentPosition!,
                  heading: pov.heading,
                  pitch: pov.pitch,
                },
              },
            }));
          }
        },

        setZoom: (zoom: number) => {
          const state = get().state;
          if (state.currentPosition) {
            set((prev) => ({
              state: {
                ...prev.state,
                currentPosition: {
                  ...prev.state.currentPosition!,
                  zoom,
                },
              },
            }));
          }
        },

        // Navigation actions
        moveToPosition: (position: StreetViewPosition, options = { animate: true }) => {
          set((prev) => ({
            state: {
              ...prev.state,
              isMoving: true,
              isTransitioning: options.animate || false,
            },
          }));

          // In a real implementation, this would animate the movement
          setTimeout(() => {
            get().actions.setPosition(position);
            set((prev) => ({
              state: {
                ...prev.state,
                isMoving: false,
                isTransitioning: false,
              },
            }));
          }, options.animate ? 500 : 0);
        },

        goForward: () => {
          const state = get().state;
          if (state.currentPosition) {
            const heading = state.currentPosition.heading || 0;
            const distance = 10; // meters
            const lat = state.currentPosition.lat;
            const lng = state.currentPosition.lng;

            // Calculate new position based on heading
            const newLat = lat + (distance * Math.cos(heading * Math.PI / 180)) / 111320;
            const newLng = lng + (distance * Math.sin(heading * Math.PI / 180)) / (111320 * Math.cos(lat * Math.PI / 180));

            get().actions.setPosition({
              lat: newLat,
              lng: newLng,
              heading,
              pitch: state.currentPosition.pitch,
              zoom: state.currentPosition.zoom,
            });
          }
        },

        goBackward: () => {
          const state = get().state;
          if (state.currentPosition) {
            const heading = ((state.currentPosition.heading || 0) + 180) % 360;
            get().actions.goForward(); // This will use the current heading, then we can adjust
          }
        },

        turnLeft: () => {
          const state = get().state;
          if (state.currentPosition) {
            const newHeading = ((state.currentPosition.heading || 0) - 30 + 360) % 360;
            get().actions.setPOV({
              heading: newHeading,
              pitch: state.currentPosition.pitch || 0,
            });
          }
        },

        turnRight: () => {
          const state = get().state;
          if (state.currentPosition) {
            const newHeading = ((state.currentPosition.heading || 0) + 30) % 360;
            get().actions.setPOV({
              heading: newHeading,
              pitch: state.currentPosition.pitch || 0,
            });
          }
        },

        zoomIn: () => {
          const state = get().state;
          const currentZoom = state.currentPosition?.zoom || 1;
          const newZoom = Math.min(currentZoom + 0.5, 5);
          get().actions.setZoom(newZoom);
        },

        zoomOut: () => {
          const state = get().state;
          const currentZoom = state.currentPosition?.zoom || 1;
          const newZoom = Math.max(currentZoom - 0.5, 0);
          get().actions.setZoom(newZoom);
        },

        // UI control actions
        toggleFullscreen: () => {
          set((prev) => ({
            state: {
              ...prev.state,
              isFullscreen: !prev.state.isFullscreen,
            },
          }));
        },

        toggleControls: () => {
          set((prev) => ({
            state: {
              ...prev.state,
              showControls: !prev.state.showControls,
            },
          }));
        },

        toggleMeasurementMode: () => {
          set((prev) => ({
            state: {
              ...prev.state,
              measurementMode: !prev.state.measurementMode,
            },
          }));
        },

        // Measurement actions
        addMeasurementPoint: (point) => {
          set((prev) => ({
            state: {
              ...prev.state,
              measurementPoints: [...prev.state.measurementPoints, point],
            },
          }));
        },

        clearMeasurements: () => {
          set((prev) => ({
            state: {
              ...prev.state,
              measurementPoints: [],
            },
          }));
        },

        // History actions
        goToHistoryIndex: (index: number) => {
          const state = get().state;
          if (index >= 0 && index < state.history.length) {
            const position = state.history[index];
            get().actions.setPosition(position);
            set((prev) => ({
              state: {
                ...prev.state,
                historyIndex: index,
              },
            }));
          }
        },

        clearHistory: () => {
          set((prev) => ({
            state: {
              ...prev.state,
              history: prev.state.currentPosition ? [prev.state.currentPosition] : [],
              historyIndex: prev.state.currentPosition ? 0 : -1,
            },
          }));
        },

        // Error handling actions
        setError: (error: StreetViewError) => {
          set((prev) => ({
            state: {
              ...prev.state,
              hasError: true,
              errorMessage: error.message,
              isLoading: false,
            },
          }));
        },

        clearError: () => {
          set((prev) => ({
            state: {
              ...prev.state,
              hasError: false,
              errorMessage: undefined,
            },
          }));
        },

        // Configuration actions
        updatePerformance: (options: Partial<StreetViewPerformanceOptions>) => {
          set((prev) => ({
            performance: {
              ...prev.performance,
              ...options,
            },
          }));
        },

        updateAccessibility: (options: Partial<StreetViewAccessibilityOptions>) => {
          set((prev) => ({
            accessibility: {
              ...prev.accessibility,
              ...options,
            },
          }));
        },

        updateKeyboardConfig: (config: Partial<StreetViewKeyboardConfig>) => {
          set((prev) => ({
            keyboard: {
              ...prev.keyboard,
              config: {
                ...prev.keyboard.config,
                ...config,
              },
            },
          }));
        },

        // Loading state actions
        setLoading: (isLoading: boolean) => {
          set((prev) => ({
            state: {
              ...prev.state,
              isLoading,
            },
          }));
        },

        // Update current panorama
        setCurrentPano: (pano) => {
          set((prev) => ({
            state: {
              ...prev.state,
              currentPano: pano,
            },
          }));
        },
      },
    })),
    {
      name: 'street-view-store',
    }
  )
);

// Selectors for commonly used state combinations
export const useStreetViewState = () => useStreetViewStore((state) => state.state);
export const useStreetViewActions = () => useStreetViewStore((state) => state.actions);
export const useStreetViewPosition = () => useStreetViewStore((state) => state.state.currentPosition);
export const useStreetViewOptions = () => useStreetViewStore((state) => state.options);
export const useStreetViewPerformance = () => useStreetViewStore((state) => state.performance);
export const useStreetViewAccessibility = () => useStreetViewStore((state) => state.accessibility);
export const useStreetViewKeyboard = () => useStreetViewStore((state) => state.keyboard);