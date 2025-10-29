import { create } from 'zustand';
import type { Route, RouteRequest, TransportMode } from '@/types/map.types';

export interface RouteStore {
  route: Route | null;
  isCalculatingRoute: boolean;
  routeError: string | null;
  routeHistory: Route[];

  // Actions
  calculateRoute: (request: RouteRequest) => Promise<void>;
  clearRoute: () => void;
  saveRouteToHistory: (route: Route) => void;
  setRouteError: (error: string | null) => void;
}

const initialState = {
  route: null,
  isCalculatingRoute: false,
  routeError: null,
  routeHistory: [],
};

export const useRouteStore = create<RouteStore>((set, get) => ({
  ...initialState,

  calculateRoute: async (request: RouteRequest) => {
    set({ isCalculatingRoute: true, routeError: null });

    try {
      // For now, create a mock route. In a real implementation, this would call the Google Maps Directions API
      const mockRoute: Route = {
        id: `route_${Date.now()}`,
        origin: request.origin,
        destination: request.destination,
        waypoints: request.waypoints || [],
        distance: `${(Math.random() * 20 + 5).toFixed(1)} km`,
        duration: `${Math.floor(Math.random() * 60 + 15)} min`,
        transportMode: request.travelMode,
        polyline: 'mock_polyline_data',
        steps: [
          {
            instruction: `Head ${getDirectionCardinal()} on ${getRandomStreetName()}`,
            distance: `${(Math.random() * 2 + 0.5).toFixed(1)} km`,
            duration: `${Math.floor(Math.random() * 10 + 2)} min`,
            maneuver: {
              location: { lat: 40.7128, lng: -74.0060 },
              instruction: `Head ${getDirectionCardinal()}`,
            },
          },
          {
            instruction: `Turn ${getDirectionCardinal()} onto ${getRandomStreetName()}`,
            distance: `${(Math.random() * 3 + 1).toFixed(1)} km`,
            duration: `${Math.floor(Math.random() * 15 + 3)} min`,
            maneuver: {
              location: { lat: 40.7128, lng: -74.0060 },
              instruction: `Turn ${getDirectionCardinal()}`,
            },
          },
          {
            instruction: `Continue on ${getRandomStreetName()}`,
            distance: `${(Math.random() * 2 + 0.5).toFixed(1)} km`,
            duration: `${Math.floor(Math.random() * 10 + 2)} min`,
            maneuver: {
              location: { lat: 40.7128, lng: -74.0060 },
              instruction: 'Continue',
            },
          },
        ],
        bounds: {
          north: 40.7580,
          south: 40.7128,
          east: -73.9352,
          west: -74.0060,
        },
        overviewPolyline: 'mock_overview_polyline',
        warnings: [],
        waypointOrder: [],
        fare: {
          currency: 'USD',
          value: Math.floor(Math.random() * 20 + 5),
          text: `$${Math.floor(Math.random() * 20 + 5)}`,
        },
      };

      set({ route: mockRoute, isCalculatingRoute: false });
      get().saveRouteToHistory(mockRoute);
    } catch (error) {
      set({
        routeError: error instanceof Error ? error.message : 'Failed to calculate route',
        isCalculatingRoute: false,
      });
    }
  },

  clearRoute: () => {
    set({
      route: null,
      routeError: null,
    });
  },

  saveRouteToHistory: (route: Route) => {
    set((state) => ({
      routeHistory: [route, ...state.routeHistory].slice(0, 50), // Keep last 50 routes
    }));
  },

  setRouteError: (error: string | null) => {
    set({ routeError: error });
  },
}));

// Helper functions for mock data generation
function getDirectionCardinal(): string {
  const directions = ['North', 'South', 'East', 'West', 'Northeast', 'Northwest', 'Southeast', 'Southwest'];
  return directions[Math.floor(Math.random() * directions.length)];
}

function getRandomStreetName(): string {
  const streets = [
    'Main Street',
    'Oak Avenue',
    'Pine Road',
    'Maple Drive',
    'Cedar Lane',
    'Elm Street',
    'Park Avenue',
    'First Street',
    'Second Avenue',
    'Broadway',
    'Washington Street',
    'Lincoln Avenue',
    'Madison Street',
    'Jefferson Avenue',
    'Franklin Street',
  ];
  return streets[Math.floor(Math.random() * streets.length)];
}