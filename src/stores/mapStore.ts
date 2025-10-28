import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { EnhancedMapState, Marker, MapBounds, StreetViewState, MapLayer, Coordinates } from '../types';

interface MapStore extends EnhancedMapState {
  // Actions
  setCenter: (center: Coordinates) => void;
  setZoom: (zoom: number) => void;
  setBounds: (bounds: MapBounds) => void;
  addMarker: (marker: Omit<Marker, 'id'>) => void;
  removeMarker: (id: string) => void;
  updateMarker: (id: string, updates: Partial<Marker>) => void;
  clearMarkers: () => void;
  toggleStreetView: (position?: Coordinates) => void;
  setStreetViewPosition: (position: Coordinates) => void;
  setStreetViewPOV: (pov: { heading: number; pitch: number }) => void;
  setStreetViewZoom: (zoom: number) => void;
  toggleLayer: (layerId: string) => void;
  setMapType: (mapType: google.maps.MapTypeId) => void;
  setGestureHandling: (gestureHandling: EnhancedMapState['gestureHandling']) => void;
  setFullscreen: (isFullscreen: boolean) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  resetMap: () => void;

  // Computed getters
  getMarkerById: (id: string) => Marker | undefined;
  getVisibleMarkers: () => Marker[];
  getMarkerCount: () => number;
  getActiveLayers: () => MapLayer[];
  hasStreetViewActive: () => boolean;
}

const defaultLayers: MapLayer[] = [
  {
    id: 'traffic',
    name: 'Traffic',
    type: 'traffic',
    visible: false,
  },
  {
    id: 'transit',
    name: 'Transit',
    type: 'transit',
    visible: false,
  },
  {
    id: 'bicycling',
    name: 'Bicycling',
    type: 'bicycling',
    visible: false,
  },
];

const initialState: EnhancedMapState = {
  center: { lat: 40.7128, lng: -74.0060 }, // New York
  zoom: 12,
  bounds: null,
  markers: [],
  selectedLocation: null,
  isLoading: false,
  error: null,
  streetView: {
    visible: false,
    position: null,
    pov: { heading: 165, pitch: 0 },
    zoom: 1,
  },
  layers: defaultLayers,
  mapType: google.maps.MapTypeId.ROADMAP,
  gestureHandling: 'auto',
  isFullscreen: false,
};

const generateMarkerId = () => `marker_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export const useMapStore = create<MapStore>()(
  devtools(
    persist(
      immer((set, get) => ({
        ...initialState,

        // Actions
        setCenter: (center) =>
          set((state) => {
            state.center = center;
            state.error = null;
          }),

        setZoom: (zoom) =>
          set((state) => {
            state.zoom = Math.max(1, Math.min(20, zoom));
            state.error = null;
          }),

        setBounds: (bounds) =>
          set((state) => {
            state.bounds = bounds;
          }),

        addMarker: (markerData) =>
          set((state) => {
            const marker: Marker = {
              ...markerData,
              id: generateMarkerId(),
              zIndex: state.markers.length + 1,
            };
            state.markers.push(marker);
          }),

        removeMarker: (id) =>
          set((state) => {
            state.markers = state.markers.filter((marker) => marker.id !== id);
          }),

        updateMarker: (id, updates) =>
          set((state) => {
            const markerIndex = state.markers.findIndex((marker) => marker.id === id);
            if (markerIndex !== -1) {
              state.markers[markerIndex] = { ...state.markers[markerIndex], ...updates };
            }
          }),

        clearMarkers: () =>
          set((state) => {
            state.markers = [];
          }),

        toggleStreetView: (position) =>
          set((state) => {
            state.streetView.visible = !state.streetView.visible;
            if (position && state.streetView.visible) {
              state.streetView.position = position;
            }
            if (!state.streetView.visible) {
              state.streetView.position = null;
            }
          }),

        setStreetViewPosition: (position) =>
          set((state) => {
            state.streetView.position = position;
            state.streetView.visible = true;
          }),

        setStreetViewPOV: (pov) =>
          set((state) => {
            state.streetView.pov = { ...state.streetView.pov, ...pov };
          }),

        setStreetViewZoom: (zoom) =>
          set((state) => {
            state.streetView.zoom = Math.max(0, Math.min(5, zoom));
          }),

        toggleLayer: (layerId) =>
          set((state) => {
            const layer = state.layers.find((l) => l.id === layerId);
            if (layer) {
              layer.visible = !layer.visible;
            }
          }),

        setMapType: (mapType) =>
          set((state) => {
            state.mapType = mapType;
          }),

        setGestureHandling: (gestureHandling) =>
          set((state) => {
            state.gestureHandling = gestureHandling;
          }),

        setFullscreen: (isFullscreen) =>
          set((state) => {
            state.isFullscreen = isFullscreen;
          }),

        setLoading: (isLoading) =>
          set((state) => {
            state.isLoading = isLoading;
          }),

        setError: (error) =>
          set((state) => {
            state.error = error;
          }),

        resetMap: () =>
          set(() => ({
            ...initialState,
            layers: defaultLayers, // Keep default layers
          })),

        // Computed getters
        getMarkerById: (id) => {
          return get().markers.find((marker) => marker.id === id);
        },

        getVisibleMarkers: () => {
          return get().markers.filter((marker) => marker.opacity !== 0);
        },

        getMarkerCount: () => {
          return get().markers.length;
        },

        getActiveLayers: () => {
          return get().layers.filter((layer) => layer.visible);
        },

        hasStreetViewActive: () => {
          const streetView = get().streetView;
          return streetView.visible && streetView.position !== null;
        },
      })),
      {
        name: 'map-store',
        version: 1,
        partialize: (state) => ({
          center: state.center,
          zoom: state.zoom,
          mapType: state.mapType,
          gestureHandling: state.gestureHandling,
          layers: state.layers,
        }),
        onRehydrateStorage: () => (state) => {
          console.log('Map store hydrated:', state);
        },
      }
    ),
    {
      name: 'map-store',
      enabled: process.env.NODE_ENV === 'development',
    }
  )
);

// Selectors for optimized re-renders
export const useMapCenter = () => useMapStore((state) => state.center);
export const useMapZoom = () => useMapStore((state) => state.zoom);
export const useMapMarkers = () => useMapStore((state) => state.markers);
export const useMapBounds = () => useMapStore((state) => state.bounds);
export const useStreetViewState = () => useMapStore((state) => state.streetView);
export const useMapLayers = () => useMapStore((state) => state.layers);
export const useMapType = () => useMapStore((state) => state.mapType);
export const useMapLoading = () => useMapStore((state) => state.isLoading);
export const useMapError = () => useMapStore((state) => state.error);
export const useMapFullscreen = () => useMapStore((state) => state.isFullscreen);

// Computed selectors
export const useVisibleMarkers = () => useMapStore((state) => state.getVisibleMarkers());
export const useActiveLayers = () => useMapStore((state) => state.getActiveLayers());
export const useMarkerCount = () => useMapStore((state) => state.getMarkerCount());
export const useStreetViewActive = () => useMapStore((state) => state.hasStreetViewActive());

export default useMapStore;