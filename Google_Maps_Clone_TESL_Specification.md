# Google Maps Clone - Technical End-to-System Specification (TESL)
## Comprehensive Frontend Architecture and Integration Blueprint

### Executive Summary

This Technical End-to-System Specification (TESL) outlines the comprehensive architecture for a Google Maps clone frontend that integrates with the MovilityAI backend services. The specification covers the complete frontend implementation using React, TypeScript, and modern web technologies to deliver a performant, scalable, and feature-rich mapping application with real-time data visualization, intelligent route planning, and multi-modal transportation integration.

**Primary Objectives:**
1. Deliver a Google Maps-like web experience with enhanced mobility features
2. Integrate real-time traffic data and public transportation information
3. Provide seamless AI-powered route optimization and predictive analytics
4. Ensure optimal performance across devices and network conditions
5. Implement robust state management for complex geospatial data

---

## 1. System Architecture Overview

### 1.1 High-Level Frontend Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Google Maps Clone Frontend                   │
│                      (React + TypeScript)                      │
└─────────────────────┬───────────────────────────────────────────┘
                      │ HTTP/WebSocket/GraphQL
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Backend API Gateway                          │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌────────┐ │
│  │ Route       │ │ Traffic     │ │ Contingency  │ │ User   │ │
│  │ Planning    │ │ Analytics   │ │ Management   │ │ Auth   │ │
│  │ Service     │ │ Service     │ │ Service      │ │ Service│ │
│  └─────────────┘ └─────────────┘ └─────────────┘ └────────┘ │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                   Google Agent Kit Layer                   │ │
│  └─────────────────────────────────────────────────────────────┘ │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                    External APIs & Services                    │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌────────┐ │
│  │ Google      │ │ Metro       │ │ EnCicla     │ │ Weather│ │
│  │ Maps API    │ │ API         │ │ Bike Share  │ │ API    │ │
│  └─────────────┘ └─────────────┘ └─────────────┘ └────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 Technology Stack Specification

**Core Framework & Language:**
- **Frontend Framework**: React 18+ with functional components and hooks
- **Language**: TypeScript 5.0+ with strict type checking
- **Build Tool**: Vite 4+ for fast development and optimized builds
- **Package Manager**: pnpm for efficient dependency management

**Mapping & Visualization:**
- **Map Library**: Google Maps JavaScript API v3 (Advanced Plan)
- **Alternative**: Mapbox GL JS with custom style integration
- **Vector Tiles**: Mapbox Vector Tiles or Google Vector Tiles
- **Data Visualization**: D3.js, Chart.js for analytics overlays

**State Management:**
- **Global State**: Zustand for lightweight state management
- **Server State**: TanStack Query (React Query) for API caching
- **Form State**: React Hook Form with Zod validation
- **Local Storage**: IndexedDB via Dexie.js for offline data

**Styling & UI:**
- **Styling**: Tailwind CSS with custom map-focused components
- **Component Library**: Headless UI for accessible components
- **Icons**: Lucide React for consistent iconography
- **Animation**: Framer Motion for smooth transitions

**Development & Testing:**
- **Testing**: Vitest + React Testing Library
- **E2E Testing**: Playwright for critical user flows
- **Type Checking**: ESLint + TypeScript strict mode
- **Code Quality**: Prettier + Husky pre-commit hooks

---

## 2. Frontend Architecture Deep Dive

### 2.1 Component Architecture

```
src/
├── components/
│   ├── map/
│   │   ├── MapContainer.tsx          # Main map component wrapper
│   │   ├── MapControls.tsx           # Zoom, tilt, compass controls
│   │   ├── LayersPanel.tsx           # Layer management UI
│   │   ├── SearchBox.tsx             # Location search with autocomplete
│   │   ├── RouteOverlay.tsx          # Route visualization
│   │   ├── TrafficLayer.tsx          # Real-time traffic overlay
│   │   ├── PublicTransportLayer.tsx  # Metro/bus visualization
│   │   ├── LocationMarkers.tsx       # Custom markers and POIs
│   │   ├── InfoWindow.tsx            # Popup information panels
│   │   └── MapToolbar.tsx            # Drawing and measurement tools
│   ├── ui/
│   │   ├── Button.tsx                # Reusable button component
│   │   ├── Input.tsx                 # Input field with validation
│   │   ├── Modal.tsx                 # Modal overlay system
│   │   ├── Sidebar.tsx               # Collapsible sidebar
│   │   ├── Card.tsx                  # Content card component
│   │   ├── Badge.tsx                 # Status badges and indicators
│   │   ├── Tabs.tsx                  # Tab navigation
│   │   ├── Spinner.tsx               # Loading states
│   │   └── Toast.tsx                 # Notification system
│   ├── route/
│   │   ├── RoutePlanner.tsx          # Main route planning interface
│   │   ├── RouteOptions.tsx          # Route comparison cards
│   │   ├── TransportModeSelector.tsx # Mode selection (walk, bike, metro)
│   │   ├── TimePreference.tsx        # Departure/arrival preferences
│   │   ├── RouteSummary.tsx          # Detailed route information
│   │   └── WaypointManager.tsx       # Multi-stop route planning
│   ├── analytics/
│   │   ├── Dashboard.tsx             # Analytics dashboard
│   │   ├── TravelChart.tsx           # Travel time visualizations
│   │   ├── CarbonFootprint.tsx       # Environmental impact metrics
│   │   ├── UsageStats.tsx            # Personal usage statistics
│   │   └── InsightsPanel.tsx         # AI-powered insights
│   └── realtime/
│       ├── AlertBanner.tsx           # Real-time alerts display
│       ├── IncidentOverlay.tsx       # Traffic incident visualization
│       ├── LiveUpdates.tsx           # Live status updates
│       └── NotificationPanel.tsx     # Notification management
├── screens/
│   ├── HomeScreen.tsx                # Main application screen
│   ├── RoutePlanningScreen.tsx       # Dedicated route planning view
│   ├── AnalyticsScreen.tsx           # Analytics and insights view
│   ├── SettingsScreen.tsx            # User preferences
│   ├── ProfileScreen.tsx             # User profile management
│   └── EmergencyScreen.tsx           # Emergency information
├── hooks/
│   ├── useMap.ts                     # Map instance and utilities
│   ├── useGeolocation.ts             # GPS location tracking
│   ├── useRoutePlanning.ts           # Route planning logic
│   ├── useRealTimeData.ts            # Real-time data subscriptions
│   ├── useLocalStorage.ts            # Local storage management
│   ├── useDebounce.ts                # Debounced API calls
│   ├── useKeyboardShortcuts.ts       # Keyboard navigation
│   └── useOfflineDetection.ts        # Network status monitoring
├── services/
│   ├── mapService.ts                 # Google Maps API wrapper
│   ├── routeService.ts               # Route planning API client
│   ├── geocodingService.ts           # Address geocoding
│   ├── trafficService.ts             # Real-time traffic data
│   ├── transportService.ts           # Public transport APIs
│   ├── analyticsService.ts           # Analytics data collection
│   ├── notificationService.ts        # Push notifications
│   └── storageService.ts             # IndexedDB operations
├── stores/
│   ├── mapStore.ts                   # Map state management
│   ├── routeStore.ts                 # Route planning state
│   ├── userStore.ts                  # User preferences
│   ├── realtimeStore.ts              # Real-time data state
│   └── uiStore.ts                    # UI state management
├── types/
│   ├── map.types.ts                  # Map-related type definitions
│   ├── route.types.ts                # Route planning types
│   ├── api.types.ts                  # API response types
│   ├── user.types.ts                 # User data types
│   └── common.types.ts               # Shared type definitions
└── utils/
    ├── constants.ts                  # Application constants
    ├── helpers.ts                    # Utility functions
    ├── formatters.ts                 # Data formatting utilities
    ├── validators.ts                 # Form validation schemas
    └── calculations.ts               # Geographic calculations
```

### 2.2 State Management Architecture

**Zustand Store Structure:**

```typescript
// Map Store - Central map state management
interface MapStore {
  // Map State
  mapInstance: google.maps.Map | null;
  center: google.maps.LatLngLiteral;
  zoom: number;
  bounds: google.maps.LatLngBounds | null;

  // Layers State
  activeLayers: Set<MapLayer>;
  layerVisibility: Record<MapLayer, boolean>;

  // Markers and Overlays
  markers: Map<string, google.maps.Marker>;
  polylines: Map<string, google.maps.Polyline>;
  infoWindows: Map<string, google.maps.InfoWindow>;

  // User Interactions
  selectedLocation: Location | null;
  isDrawingMode: boolean;
  drawingTools: DrawingTool[];

  // Actions
  initializeMap: (container: HTMLElement) => void;
  setCenter: (center: google.maps.LatLngLiteral) => void;
  setZoom: (zoom: number) => void;
  addMarker: (id: string, marker: google.maps.Marker) => void;
  removeMarker: (id: string) => void;
  toggleLayer: (layer: MapLayer) => void;
  clearOverlays: () => void;
}

// Route Store - Route planning state
interface RouteStore {
  // Route Data
  routes: OptimizedRoute[];
  selectedRoute: OptimizedRoute | null;
  routeRequest: RouteRequest | null;

  // Preferences
  transportModes: TransportMode[];
  preferences: RoutePreferences;

  // Waypoints
  waypoints: Waypoint[];
  activeWaypoint: Waypoint | null;

  // Actions
  planRoute: (request: RouteRequest) => Promise<void>;
  selectRoute: (route: OptimizedRoute) => void;
  updatePreferences: (preferences: Partial<RoutePreferences>) => void;
  addWaypoint: (waypoint: Waypoint) => void;
  removeWaypoint: (id: string) => void;
}

// Real-time Store - Live data management
interface RealtimeStore {
  // Live Data
  trafficData: TrafficData[];
  incidents: TrafficIncident[];
  publicTransportStatus: TransportStatus[];

  // Subscriptions
  isSubscribed: boolean;
  lastUpdate: Date | null;

  // Actions
  subscribeToRealtimeUpdates: () => void;
  unsubscribeFromRealtimeUpdates: () => void;
  updateTrafficData: (data: TrafficData[]) => void;
  addIncident: (incident: TrafficIncident) => void;
}
```

### 2.3 React Hook Patterns

**useMap Hook - Map Instance Management:**

```typescript
import { useEffect, useRef, useCallback } from 'react';
import { useMapStore } from '../stores/mapStore';
import { googleMapsLoader } from '../services/mapService';

export const useMap = (containerId: string) => {
  const mapRef = useRef<google.maps.Map | null>(null);
  const {
    mapInstance,
    initializeMap,
    setCenter,
    setZoom,
    addMarker,
    clearOverlays
  } = useMapStore();

  // Initialize map
  useEffect(() => {
    if (!mapInstance && containerId) {
      const initialize = async () => {
        const container = document.getElementById(containerId);
        if (container) {
          await googleMapsLoader.load();
          const map = new google.maps.Map(container, {
            center: { lat: 6.2442, lng: -75.5812 }, // Medellín
            zoom: 13,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
            styles: mapStyles, // Custom map styling
          });

          initializeMap(map);
          mapRef.current = map;

          // Add event listeners
          map.addListener('center_changed', () => {
            const center = map.getCenter();
            if (center) {
              setCenter({ lat: center.lat(), lng: center.lng() });
            }
          });

          map.addListener('zoom_changed', () => {
            setZoom(map.getZoom() || 13);
          });
        }
      };

      initialize();
    }
  }, [containerId, mapInstance, initializeMap, setCenter, setZoom]);

  // Map interaction methods
  const panTo = useCallback((location: google.maps.LatLngLiteral) => {
    if (mapRef.current) {
      mapRef.current.panTo(location);
    }
  }, []);

  const fitBounds = useCallback((bounds: google.maps.LatLngBounds) => {
    if (mapRef.current) {
      mapRef.current.fitBounds(bounds);
    }
  }, []);

  return {
    mapInstance: mapRef.current,
    panTo,
    fitBounds,
    addMarker,
    clearOverlays,
  };
};
```

**useRoutePlanning Hook - Route Management:**

```typescript
import { useState, useCallback } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { routeService } from '../services/routeService';
import { useRouteStore } from '../stores/routeStore';

export const useRoutePlanning = () => {
  const [isPlanning, setIsPlanning] = useState(false);
  const {
    routes,
    selectedRoute,
    routeRequest,
    planRoute: storePlanRoute
  } = useRouteStore();

  // Route planning mutation
  const routePlanningMutation = useMutation({
    mutationFn: routeService.planRoute,
    onMutate: () => {
      setIsPlanning(true);
    },
    onSuccess: (data) => {
      storePlanRoute(data);
      setIsPlanning(false);
    },
    onError: (error) => {
      setIsPlanning(false);
      console.error('Route planning failed:', error);
    },
  });

  // Real-time route updates
  const { data: liveRouteUpdates } = useQuery({
    queryKey: ['live-route-updates', selectedRoute?.id],
    queryFn: () => routeService.getLiveRouteUpdates(selectedRoute?.id),
    enabled: !!selectedRoute?.id,
    refetchInterval: 30000, // Update every 30 seconds
  });

  const planRoute = useCallback(async (request: RouteRequest) => {
    await routePlanningMutation.mutateAsync(request);
  }, [routePlanningMutation]);

  const cancelRoutePlanning = useCallback(() => {
    routePlanningMutation.reset();
    setIsPlanning(false);
  }, [routePlanningMutation]);

  return {
    routes,
    selectedRoute,
    isPlanning,
    liveRouteUpdates,
    planRoute,
    cancelRoutePlanning,
  };
};
```

---

## 3. Map Implementation and Integration

### 3.1 Google Maps API Integration

**Map Service Implementation:**

```typescript
// services/mapService.ts
import { Loader } from '@googlemaps/js-api-loader';

class MapService {
  private loader: Loader;
  private maps: typeof google.maps | null = null;

  constructor() {
    this.loader = new Loader({
      apiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY!,
      version: 'weekly',
      libraries: ['places', 'geometry', 'drawing'],
      language: 'es',
      region: 'CO',
    });
  }

  async loadMaps(): Promise<typeof google.maps> {
    if (!this.maps) {
      this.maps = await this.loader.load();
    }
    return this.maps;
  }

  async createMap(container: HTMLElement, options: google.maps.MapOptions): Promise<google.maps.Map> {
    const google = await this.loadMaps();
    return new google.maps.Map(container, {
      ...options,
      mapId: process.env.REACT_APP_GOOGLE_MAP_ID, // For advanced styling
      gestureHandling: 'cooperative',
      zoomControl: true,
      mapTypeControl: false,
      scaleControl: true,
      streetViewControl: false,
      rotateControl: false,
      fullscreenControl: false,
    });
  }

  async geocodeAddress(address: string): Promise<google.maps.GeocoderResult[]> {
    const google = await this.loadMaps();
    const geocoder = new google.maps.Geocoder();

    return new Promise((resolve, reject) => {
      geocoder.geocode({ address, region: 'CO' }, (results, status) => {
        if (status === google.maps.GeocoderStatus.OK && results) {
          resolve(results);
        } else {
          reject(new Error(`Geocoding failed: ${status}`));
        }
      });
    });
  }

  async calculateRoute(request: google.maps.DirectionsRequest): Promise<google.maps.DirectionsResult> {
    const google = await this.loadMaps();
    const directionsService = new google.maps.DirectionsService();

    return new Promise((resolve, reject) => {
      directionsService.route(request, (result, status) => {
        if (status === google.maps.DirectionsStatus.OK && result) {
          resolve(result);
        } else {
          reject(new Error(`Directions failed: ${status}`));
        }
      });
    });
  }

  createCustomMarker(options: google.maps.MarkerOptions): google.maps.Marker {
    const marker = new google.maps.Marker({
      ...options,
      animation: google.maps.Animation.DROP,
      optimized: true,
    });

    return marker;
  }

  createTrafficLayer(): google.maps.TrafficLayer {
    const google = this.maps!;
    return new google.maps.TrafficLayer();
  }

  createTransitLayer(): google.maps.TransitLayer {
    const google = this.maps!;
    return new google.maps.TransitLayer();
  }
}

export const mapService = new MapService();
```

### 3.2 Custom Map Styling and Theming

**Map Styles Configuration:**

```typescript
// utils/mapStyles.ts
export const mapStyles: google.maps.MapTypeStyle[] = [
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#e9e9e9' }, { lightness: 17 }]
  },
  {
    featureType: 'landscape',
    elementType: 'geometry',
    stylers: [{ color: '#f5f5f5' }, { lightness: 20 }]
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.fill',
    stylers: [{ color: '#ffffff' }, { lightness: 17 }]
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#ffffff' }, { lightness: 29 }, { weight: 0.2 }]
  },
  {
    featureType: 'road.arterial',
    elementType: 'geometry',
    stylers: [{ color: '#ffffff' }, { lightness: 18 }]
  },
  {
    featureType: 'road.local',
    elementType: 'geometry',
    stylers: [{ color: '#ffffff' }, { lightness: 16 }]
  },
  {
    featureType: 'poi',
    elementType: 'geometry',
    stylers: [{ color: '#f5f5f5' }, { lightness: 21 }]
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ color: '#dedede' }, { lightness: 21 }]
  }
];

// Themed map styles for different use cases
export const mapThemes = {
  default: mapStyles,
  night: [
    ...mapStyles,
    { elementType: 'geometry', stylers: [{ color: '#212121' }] },
    { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
    { elementType: 'labels.text.fill', stylers: [{ color: '#757575' }] },
    { elementType: 'labels.text.stroke', stylers: [{ color: '#212121' }] },
  ],
  accessibility: [
    ...mapStyles,
    {
      featureType: 'transit.line',
      elementType: 'geometry',
      stylers: [{ visibility: 'on' }, { weight: 4 }]
    },
    {
      featureType: 'transit.station',
      elementType: 'all',
      stylers: [{ visibility: 'on' }, { saturation: 100 }]
    }
  ]
};
```

### 3.3 Advanced Map Features

**Custom Overlay for Public Transportation:**

```typescript
// components/map/TransportOverlay.tsx
import { useEffect, useRef } from 'react';
import { useMap } from '../../hooks/useMap';

interface TransportOverlayProps {
  stations: TransportStation[];
  routes: TransportRoute[];
  selectedLine?: string;
}

export const TransportOverlay: React.FC<TransportOverlayProps> = ({
  stations,
  routes,
  selectedLine
}) => {
  const { mapInstance } = useMap();
  const overlayRef = useRef<google.maps.OverlayView | null>(null);

  useEffect(() => {
    if (!mapInstance) return;

    class TransportOverlay extends google.maps.OverlayView {
      private div: HTMLDivElement | null = null;
      private stations: TransportStation[];
      private routes: TransportRoute[];

      constructor(stations: TransportStation[], routes: TransportRoute[]) {
        super();
        this.stations = stations;
        this.routes = routes;
      }

      onAdd() {
        this.div = document.createElement('div');
        this.div.style.position = 'absolute';
        this.div.style.borderStyle = 'none';
        this.div.style.borderWidth = '0px';
        this.div.style.zIndex = '1000';

        const panes = this.getPanes()!;
        panes.overlayLayer.appendChild(this.div);
      }

      draw() {
        if (!this.div) return;

        const projection = this.getProjection()!;

        // Draw metro lines
        this.routes.forEach(route => {
          if (selectedLine && route.id !== selectedLine) return;

          const path = route.stations.map(station => {
            const point = projection.fromLatLngToDivPixel(
              new google.maps.LatLng(station.lat, station.lng)
            );
            return `${point!.x},${point!.y}`;
          }).join(' ');

          const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
          svg.style.position = 'absolute';
          svg.style.left = '0px';
          svg.style.top = '0px';
          svg.style.width = '100%';
          svg.style.height = '100%';
          svg.style.pointerEvents = 'none';

          const polyline = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
          polyline.setAttribute('points', path);
          polyline.setAttribute('stroke', route.color);
          polyline.setAttribute('stroke-width', '4');
          polyline.setAttribute('fill', 'none');

          svg.appendChild(polyline);
          this.div!.appendChild(svg);
        });

        // Draw stations
        this.stations.forEach(station => {
          const point = projection.fromLatLngToDivPixel(
            new google.maps.LatLng(station.lat, station.lng)
          );

          const marker = document.createElement('div');
          marker.style.position = 'absolute';
          marker.style.left = `${point!.x - 8}px`;
          marker.style.top = `${point!.y - 8}px`;
          marker.style.width = '16px';
          marker.style.height = '16px';
          marker.style.backgroundColor = station.lines[0]?.color || '#ff0000';
          marker.style.borderRadius = '50%';
          marker.style.border = '2px solid white';
          marker.style.cursor = 'pointer';
          marker.title = station.name;

          marker.addEventListener('click', () => {
            // Handle station click
            this.handleStationClick(station);
          });

          this.div!.appendChild(marker);
        });
      }

      onRemove() {
        if (this.div) {
          this.div.parentNode?.removeChild(this.div);
          this.div = null;
        }
      }

      private handleStationClick(station: TransportStation) {
        // Emit station click event or open info window
        window.dispatchEvent(new CustomEvent('stationSelected', {
          detail: station
        }));
      }
    }

    overlayRef.current = new TransportOverlay(stations, routes);
    overlayRef.current.setMap(mapInstance);

    return () => {
      if (overlayRef.current) {
        overlayRef.current.setMap(null);
      }
    };
  }, [mapInstance, stations, routes, selectedLine]);

  return null;
};
```

---

## 4. Real-Time Data Integration

### 4.1 WebSocket Integration for Live Updates

**Real-time Service Implementation:**

```typescript
// services/realtimeService.ts
import { io, Socket } from 'socket.io-client';

class RealtimeService {
  private socket: Socket | null = null;
  private subscriptions: Map<string, (data: any) => void> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.socket?.connected) {
        resolve();
        return;
      }

      this.socket = io(process.env.REACT_APP_WEBSOCKET_URL!, {
        transports: ['websocket', 'polling'],
        timeout: 10000,
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: 1000,
      });

      this.socket.on('connect', () => {
        console.log('Connected to real-time service');
        this.reconnectAttempts = 0;
        resolve();
      });

      this.socket.on('disconnect', (reason) => {
        console.log('Disconnected from real-time service:', reason);
        if (reason === 'io server disconnect') {
          // Server disconnected, reconnect manually
          this.connect();
        }
      });

      this.socket.on('connect_error', (error) => {
        console.error('Connection error:', error);
        this.reconnectAttempts++;
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          reject(new Error('Failed to connect to real-time service'));
        }
      });

      // Set up default event handlers
      this.setupDefaultHandlers();
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.subscriptions.clear();
  }

  subscribeToTrafficUpdates(callback: (data: TrafficData[]) => void): () => void {
    const subscriptionId = 'traffic-updates';
    this.subscriptions.set(subscriptionId, callback);

    if (this.socket?.connected) {
      this.socket.emit('subscribe:traffic');
    }

    this.socket?.on('traffic:update', callback);

    return () => {
      this.subscriptions.delete(subscriptionId);
      this.socket?.off('traffic:update', callback);
      this.socket?.emit('unsubscribe:traffic');
    };
  }

  subscribeToIncidentAlerts(callback: (data: TrafficIncident) => void): () => void {
    const subscriptionId = 'incident-alerts';
    this.subscriptions.set(subscriptionId, callback);

    if (this.socket?.connected) {
      this.socket.emit('subscribe:incidents');
    }

    this.socket?.on('incident:new', callback);

    return () => {
      this.subscriptions.delete(subscriptionId);
      this.socket?.off('incident:new', callback);
      this.socket?.emit('unsubscribe:incidents');
    };
  }

  subscribeToRouteUpdates(routeId: string, callback: (data: RouteUpdate) => void): () => void {
    const subscriptionId = `route-updates-${routeId}`;
    this.subscriptions.set(subscriptionId, callback);

    if (this.socket?.connected) {
      this.socket.emit('subscribe:route', { routeId });
    }

    this.socket?.on(`route:update:${routeId}`, callback);

    return () => {
      this.subscriptions.delete(subscriptionId);
      this.socket?.off(`route:update:${routeId}`, callback);
      this.socket?.emit('unsubscribe:route', { routeId });
    };
  }

  private setupDefaultHandlers(): void {
    if (!this.socket) return;

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log(`Reconnected after ${attemptNumber} attempts`);
      // Resubscribe to all active subscriptions
      this.resubscribeAll();
    });
  }

  private resubscribeAll(): void {
    // Resubscribe to all active subscriptions after reconnection
    this.subscriptions.forEach((callback, subscriptionId) => {
      if (subscriptionId.startsWith('route-updates-')) {
        const routeId = subscriptionId.replace('route-updates-', '');
        this.socket?.emit('subscribe:route', { routeId });
      } else if (subscriptionId === 'traffic-updates') {
        this.socket?.emit('subscribe:traffic');
      } else if (subscriptionId === 'incident-alerts') {
        this.socket?.emit('subscribe:incidents');
      }
    });
  }
}

export const realtimeService = new RealtimeService();
```

### 4.2 Live Traffic Data Integration

**Traffic Layer Component:**

```typescript
// components/map/TrafficLayer.tsx
import { useEffect, useState } from 'react';
import { useMap } from '../../hooks/useMap';
import { useRealtimeStore } from '../../stores/realtimeStore';
import { realtimeService } from '../../services/realtimeService';

export const TrafficLayer: React.FC = () => {
  const { mapInstance } = useMap();
  const [trafficLayer, setTrafficLayer] = useState<google.maps.TrafficLayer | null>(null);
  const { trafficData, updateTrafficData } = useRealtimeStore();

  useEffect(() => {
    if (!mapInstance) return;

    // Initialize Google Maps traffic layer
    const layer = new google.maps.TrafficLayer();
    layer.setMap(mapInstance);
    setTrafficLayer(layer);

    // Subscribe to real-time traffic updates
    const unsubscribe = realtimeService.subscribeToTrafficUpdates((data) => {
      updateTrafficData(data);
    });

    return () => {
      layer.setMap(null);
      unsubscribe();
    };
  }, [mapInstance, updateTrafficData]);

  useEffect(() => {
    // Toggle traffic layer visibility based on data availability
    if (trafficLayer) {
      trafficLayer.setMap(trafficData.length > 0 ? mapInstance : null);
    }
  }, [trafficLayer, trafficData, mapInstance]);

  return null;
};
```

### 4.3 Offline Data Caching

**Offline Service Implementation:**

```typescript
// services/offlineService.ts
import Dexie, { Table } from 'dexie';
import { RouteData, TrafficData, LocationData } from '../types/common';

interface CachedRoute {
  id?: number;
  routeId: string;
  data: RouteData;
  timestamp: number;
  expiresAt: number;
}

interface CachedTrafficData {
  id?: number;
  location: string;
  data: TrafficData;
  timestamp: number;
  expiresAt: number;
}

class OfflineDatabase extends Dexie {
  routes!: Table<CachedRoute>;
  trafficData!: Table<CachedTrafficData>;
  locations!: Table<LocationData>;

  constructor() {
    super('MovilityOfflineDB');
    this.version(1).stores({
      routes: '++id, routeId, timestamp, expiresAt',
      trafficData: '++id, location, timestamp, expiresAt',
      locations: '++id, lat, lng, name',
    });
  }
}

class OfflineService {
  private db: OfflineDatabase;
  private isOnline: boolean = navigator.onLine;

  constructor() {
    this.db = new OfflineDatabase();
    this.setupOnlineStatusListeners();
  }

  async cacheRoute(routeId: string, routeData: RouteData): Promise<void> {
    const expiresAt = Date.now() + (24 * 60 * 60 * 1000); // 24 hours
    await this.db.routes.put({
      routeId,
      data: routeData,
      timestamp: Date.now(),
      expiresAt,
    });
  }

  async getCachedRoute(routeId: string): Promise<RouteData | null> {
    const cached = await this.db.routes
      .where('routeId')
      .equals(routeId)
      .and(item => item.expiresAt > Date.now())
      .first();

    return cached?.data || null;
  }

  async cacheTrafficData(location: string, data: TrafficData): Promise<void> {
    const expiresAt = Date.now() + (30 * 60 * 1000); // 30 minutes
    await this.db.trafficData.put({
      location,
      data,
      timestamp: Date.now(),
      expiresAt,
    });
  }

  async getCachedTrafficData(location: string): Promise<TrafficData | null> {
    const cached = await this.db.trafficData
      .where('location')
      .equals(location)
      .and(item => item.expiresAt > Date.now())
      .first();

    return cached?.data || null;
  }

  async clearExpiredCache(): Promise<void> {
    const now = Date.now();
    await this.db.routes.where('expiresAt').below(now).delete();
    await this.db.trafficData.where('expiresAt').below(now).delete();
  }

  async prefetchEssentialData(location: { lat: number; lng: number }): Promise<void> {
    // Pre-cache nearby routes and traffic data for offline use
    try {
      const nearbyRoutes = await this.fetchNearbyRoutes(location);
      await Promise.all(
        nearbyRoutes.map(route => this.cacheRoute(route.id, route))
      );

      const trafficData = await this.fetchTrafficData(location);
      await this.cacheTrafficData(`${location.lat},${location.lng}`, trafficData);
    } catch (error) {
      console.error('Failed to prefetch offline data:', error);
    }
  }

  private setupOnlineStatusListeners(): void {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.syncPendingData();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  private async syncPendingData(): Promise<void> {
    // Sync data that was modified while offline
    // Implementation depends on specific requirements
  }

  private async fetchNearbyRoutes(location: { lat: number; lng: number }): Promise<RouteData[]> {
    // Fetch nearby routes from API
    // This would integrate with the route service
    return [];
  }

  private async fetchTrafficData(location: { lat: number; lng: number }): Promise<TrafficData> {
    // Fetch traffic data from API
    // This would integrate with the traffic service
    return {} as TrafficData;
  }
}

export const offlineService = new OfflineService();
```

---

## 5. API Integration Layer

### 5.1 API Client Configuration

**HTTP Client with React Query:**

```typescript
// services/apiClient.ts
import { QueryClient, QueryFunctionContext } from '@tanstack/react-query';

class ApiClient {
  private baseURL: string;
  private queryClient: QueryClient;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 5 * 60 * 1000, // 5 minutes
          cacheTime: 10 * 60 * 1000, // 10 minutes
          retry: (failureCount, error: any) => {
            // Don't retry on 4xx errors
            if (error?.response?.status >= 400 && error?.response?.status < 500) {
              return false;
            }
            return failureCount < 3;
          },
        },
      },
    });
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add authentication token if available
    const token = this.getAuthToken();
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        throw new ApiError(response.status, await response.text());
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(0, 'Network error occurred');
    }
  }

  getQueryClient(): QueryClient {
    return this.queryClient;
  }

  private getAuthToken(): string | null {
    return localStorage.getItem('auth_token');
  }
}

class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export const apiClient = new ApiClient(process.env.REACT_APP_API_BASE_URL!);
```

### 5.2 Route Planning API Integration

**Route Service Implementation:**

```typescript
// services/routeService.ts
import { apiClient } from './apiClient';
import { RouteRequest, RouteResponse, OptimizedRoute } from '../types/route.types';

export class RouteService {
  async planRoute(request: RouteRequest): Promise<RouteResponse> {
    return apiClient.request<RouteResponse>('/routes/plan', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async getRouteDetails(routeId: string): Promise<OptimizedRoute> {
    return apiClient.request<OptimizedRoute>(`/routes/${routeId}`);
  }

  async getLiveRouteUpdates(routeId: string): Promise<RouteUpdate[]> {
    return apiClient.request<RouteUpdate[]>(`/routes/${routeId}/updates`);
  }

  async saveRoute(route: OptimizedRoute): Promise<void> {
    return apiClient.request<void>('/routes/saved', {
      method: 'POST',
      body: JSON.stringify(route),
    });
  }

  async getSavedRoutes(): Promise<OptimizedRoute[]> {
    return apiClient.request<OptimizedRoute[]>('/routes/saved');
  }

  async deleteSavedRoute(routeId: string): Promise<void> {
    return apiClient.request<void>(`/routes/saved/${routeId}`, {
      method: 'DELETE',
    });
  }

  // React Query integration
  static useRouteQuery(request: RouteRequest) {
    return apiClient.getQueryClient().useQuery({
      queryKey: ['route', request],
      queryFn: () => new RouteService().planRoute(request),
      enabled: !!request.origin && !!request.destination,
      staleTime: 2 * 60 * 1000, // 2 minutes for route data
    });
  }

  static useLiveRouteUpdatesQuery(routeId: string) {
    return apiClient.getQueryClient().useQuery({
      queryKey: ['route-updates', routeId],
      queryFn: () => new RouteService().getLiveRouteUpdates(routeId),
      enabled: !!routeId,
      refetchInterval: 30000, // Update every 30 seconds
    });
  }
}

export const routeService = new RouteService();
```

### 5.3 Public Transportation API Integration

**Transport Service Implementation:**

```typescript
// services/transportService.ts
import { apiClient } from './apiClient';
import {
  TransportStation,
  TransportRoute,
  TransportStatus,
  StationSchedule
} from '../types/transport.types';

export class TransportService {
  async getMetroStations(): Promise<TransportStation[]> {
    return apiClient.request<TransportStation[]>('/transport/metro/stations');
  }

  async getMetroRoutes(): Promise<TransportRoute[]> {
    return apiClient.request<TransportRoute[]>('/transport/metro/routes');
  }

  async getMetroStatus(): Promise<TransportStatus> {
    return apiClient.request<TransportStatus>('/transport/metro/status');
  }

  async getStationSchedule(stationId: string): Promise<StationSchedule> {
    return apiClient.request<StationSchedule>(`/transport/stations/${stationId}/schedule`);
  }

  async getMioBusLocations(routeId: string): Promise<BusLocation[]> {
    return apiClient.request<BusLocation[]>(`/transport/mio/buses/${routeId}/locations`);
  }

  async getEnCiclaStations(): Promise<BikeStation[]> {
    return apiClient.request<BikeStation[]>('/transport/encicla/stations');
  }

  async getEnCiclaStationStatus(stationId: string): Promise<BikeStationStatus> {
    return apiClient.request<BikeStationStatus>(`/transport/encicla/stations/${stationId}/status`);
  }

  // React Query hooks
  static useMetroStationsQuery() {
    return apiClient.getQueryClient().useQuery({
      queryKey: ['metro-stations'],
      queryFn: () => new TransportService().getMetroStations(),
      staleTime: 60 * 60 * 1000, // 1 hour for station data
    });
  }

  static useMetroStatusQuery() {
    return apiClient.getQueryClient().useQuery({
      queryKey: ['metro-status'],
      queryFn: () => new TransportService().getMetroStatus(),
      staleTime: 2 * 60 * 1000, // 2 minutes for status data
      refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
    });
  }

  static useEnCiclaStationsQuery() {
    return apiClient.getQueryClient().useQuery({
      queryKey: ['encicla-stations'],
      queryFn: () => new TransportService().getEnCiclaStations(),
      staleTime: 10 * 60 * 1000, // 10 minutes for bike station data
      refetchInterval: 2 * 60 * 1000, // Refresh every 2 minutes
    });
  }
}

export const transportService = new TransportService();
```

---

## 6. Performance Optimization Strategies

### 6.1 Map Performance Optimization

**Map Rendering Optimizations:**

```typescript
// hooks/useMapOptimization.ts
import { useCallback, useEffect, useRef } from 'react';
import { debounce } from 'lodash';

export const useMapOptimization = (mapInstance: google.maps.Map | null) => {
  const markerClusterRef = useRef<MarkerClusterer | null>(null);
  const visibilityRef = useRef<boolean>(true);

  // Debounced marker updates to prevent excessive re-rendering
  const updateMarkers = useCallback(
    debounce((markers: google.maps.Marker[]) => {
      if (!mapInstance || !visibilityRef.current) return;

      // Implement marker clustering for performance
      if (!markerClusterRef.current) {
        markerClusterRef.current = new MarkerClusterer({
          map: mapInstance,
          markers: [],
          renderer: {
            render: ({ count, position }) => {
              return new google.maps.Marker({
                position,
                label: { text: String(count), color: 'white' },
                icon: {
                  path: google.maps.SymbolPath.CIRCLE,
                  scale: Math.min(count * 2, 30),
                  fillColor: '#4285F4',
                  fillOpacity: 0.8,
                  strokeColor: 'white',
                  strokeWeight: 2,
                },
              });
            },
          },
        });
      }

      markerClusterRef.current.clearMarkers();
      markerClusterRef.current.addMarkers(markers);
    }, 300),
    [mapInstance]
  );

  // Implement viewport-based marker loading
  const loadMarkersInViewport = useCallback(() => {
    if (!mapInstance) return;

    const bounds = mapInstance.getBounds();
    if (!bounds) return;

    const zoom = mapInstance.getZoom() || 13;

    // Only load markers that are visible in current viewport
    // and adjust marker density based on zoom level
    const markerDensity = calculateMarkerDensity(zoom);

    // Fetch markers for current viewport
    fetchMarkersInBounds(bounds, markerDensity)
      .then(markers => updateMarkers(markers));
  }, [mapInstance, updateMarkers]);

  // Intersection Observer for tab visibility
  useEffect(() => {
    const handleVisibilityChange = () => {
      visibilityRef.current = !document.hidden;

      if (visibilityRef.current && mapInstance) {
        // Resume map interactions when tab becomes visible
        mapInstance.setOptions({ gestureHandling: 'cooperative' });
        loadMarkersInViewport();
      } else if (mapInstance) {
        // Pause map interactions when tab is hidden
        mapInstance.setOptions({ gestureHandling: 'none' });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [mapInstance, loadMarkersInViewport]);

  // Optimize map rendering for different zoom levels
  useEffect(() => {
    if (!mapInstance) return;

    const handleZoomChanged = debounce(() => {
      const zoom = mapInstance.getZoom() || 13;

      // Adjust map features based on zoom level
      if (zoom < 10) {
        // Hide detailed features at low zoom
        mapInstance.setOptions({
          styles: mapStylesLowZoom,
        });
      } else if (zoom < 14) {
        // Show moderate detail
        mapInstance.setOptions({
          styles: mapStylesMediumZoom,
        });
      } else {
        // Show full detail at high zoom
        mapInstance.setOptions({
          styles: mapStylesHighZoom,
        });
      }

      loadMarkersInViewport();
    }, 200);

    mapInstance.addListener('zoom_changed', handleZoomChanged);

    return () => {
      google.maps.event.clearListeners(mapInstance, 'zoom_changed');
    };
  }, [mapInstance, loadMarkersInViewport]);

  return {
    updateMarkers,
    loadMarkersInViewport,
  };
};

function calculateMarkerDensity(zoom: number): number {
  // Return appropriate marker density based on zoom level
  if (zoom < 12) return 0.1; // Show 10% of markers
  if (zoom < 14) return 0.3; // Show 30% of markers
  if (zoom < 16) return 0.6; // Show 60% of markers
  return 1.0; // Show all markers at high zoom
}

async function fetchMarkersInBounds(
  bounds: google.maps.LatLngBounds,
  density: number
): Promise<google.maps.Marker[]> {
  // Implementation to fetch markers within bounds
  // respecting the density parameter
  return [];
}
```

### 6.2 Bundle Optimization

**Code Splitting and Lazy Loading:**

```typescript
// utils/lazyImports.ts
import { lazy } from 'react';

// Lazy load heavy components
export const RoutePlanner = lazy(() => import('../components/route/RoutePlanner'));
export const AnalyticsDashboard = lazy(() => import('../components/analytics/Dashboard'));
export const EmergencyScreen = lazy(() => import('../components/emergency/EmergencyScreen'));

// Lazy load map-related features
export const AdvancedMapControls = lazy(() => import('../components/map/AdvancedMapControls'));
export const MapDrawingTools = lazy(() => import('../components/map/MapDrawingTools'));

// Dynamic import for map libraries
export const loadMapLibraries = async () => {
  const [drawing, geometry] = await Promise.all([
    import('../utils/mapDrawing'),
    import('../utils/mapGeometry'),
  ]);

  return { drawing, geometry };
};

// Preload critical components
export const preloadCriticalComponents = () => {
  import('../components/map/MapContainer');
  import('../components/map/SearchBox');
  import('../components/route/RouteOptions');
};
```

**Service Worker for Caching:**

```typescript
// public/service-worker.js
const CACHE_NAME = 'movility-map-v1';
const STATIC_CACHE = 'movility-static-v1';
const DYNAMIC_CACHE = 'movility-dynamic-v1';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  // Critical CSS and JS files
  '/assets/main.css',
  '/assets/main.js',
  // Map-related assets
  '/assets/map-icons.svg',
  '/assets/transport-icons.svg',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => cache.addAll(STATIC_ASSETS))
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle different request types
  if (url.origin === location.origin) {
    // Static assets - cache first strategy
    if (request.destination === 'script' ||
        request.destination === 'style' ||
        request.destination === 'image') {
      event.respondWith(cacheFirst(request));
    } else {
      // Dynamic content - network first strategy
      event.respondWith(networkFirst(request));
    }
  } else if (url.hostname.includes('maps.googleapis.com') ||
             url.hostname.includes('maps.gstatic.com')) {
    // Google Maps API responses - cache with short TTL
    event.respondWith(cacheWithTTL(request, 5 * 60 * 1000)); // 5 minutes
  } else {
    // Other external requests - network only
    event.respondWith(fetch(request));
  }
});

async function cacheFirst(request) {
  const cached = await caches.match(request);
  return cached || fetch(request);
}

async function networkFirst(request) {
  try {
    const response = await fetch(request);

    // Cache successful responses
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    // Fallback to cache if network fails
    const cached = await caches.match(request);
    if (cached) return cached;

    // Return offline page for navigation requests
    if (request.destination === 'document') {
      return caches.match('/offline.html');
    }

    throw error;
  }
}

async function cacheWithTTL(request, ttl) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);

  if (cached) {
    const cachedDate = cached.headers.get('cached-at');
    if (cachedDate && (Date.now() - parseInt(cachedDate)) < ttl) {
      return cached;
    }
  }

  const response = await fetch(request);

  if (response.ok) {
    const responseToCache = response.clone();
    const headers = new Headers(responseToCache.headers);
    headers.set('cached-at', Date.now().toString());

    const cachedResponse = new Response(responseToCache.body, {
      status: responseToCache.status,
      statusText: responseToCache.statusText,
      headers,
    });

    cache.put(request, cachedResponse);
  }

  return response;
}
```

---

## 7. Security Implementation

### 7.1 Authentication and Authorization

**Auth Service Implementation:**

```typescript
// services/authService.ts
import { apiClient } from './apiClient';

interface AuthUser {
  id: string;
  email: string;
  name: string;
  preferences: UserPreferences;
}

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

class AuthService {
  private static instance: AuthService;
  private currentUser: AuthUser | null = null;
  private tokens: AuthTokens | null = null;

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  async login(email: string, password: string): Promise<AuthUser> {
    const response = await apiClient.request<AuthTokens>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    this.setTokens(response);

    // Fetch user profile
    const user = await this.getCurrentUser();
    this.currentUser = user;

    return user;
  }

  async logout(): Promise<void> {
    try {
      await apiClient.request('/auth/logout', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.tokens?.accessToken}`,
        },
      });
    } finally {
      this.clearTokens();
      this.currentUser = null;
    }
  }

  async getCurrentUser(): Promise<AuthUser> {
    if (this.currentUser) {
      return this.currentUser;
    }

    const tokens = this.getStoredTokens();
    if (!tokens || this.isTokenExpired(tokens)) {
      throw new Error('No valid authentication tokens');
    }

    this.tokens = tokens;

    try {
      const user = await apiClient.request<AuthUser>('/auth/me', {
        headers: {
          Authorization: `Bearer ${tokens.accessToken}`,
        },
      });

      this.currentUser = user;
      return user;
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        // Token might be expired, try to refresh
        await this.refreshToken();
        return this.getCurrentUser();
      }
      throw error;
    }
  }

  async refreshToken(): Promise<void> {
    const tokens = this.getStoredTokens();
    if (!tokens) {
      throw new Error('No refresh token available');
    }

    try {
      const newTokens = await apiClient.request<AuthTokens>('/auth/refresh', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${tokens.refreshToken}`,
        },
      });

      this.setTokens(newTokens);
    } catch (error) {
      // Refresh failed, clear tokens and redirect to login
      this.clearTokens();
      throw error;
    }
  }

  getAccessToken(): string | null {
    const tokens = this.getStoredTokens();
    if (!tokens || this.isTokenExpired(tokens)) {
      return null;
    }
    return tokens.accessToken;
  }

  isAuthenticated(): boolean {
    const tokens = this.getStoredTokens();
    return !!(tokens && !this.isTokenExpired(tokens));
  }

  private setTokens(tokens: AuthTokens): void {
    this.tokens = tokens;
    localStorage.setItem('auth_tokens', JSON.stringify(tokens));
  }

  private getStoredTokens(): AuthTokens | null {
    try {
      const stored = localStorage.getItem('auth_tokens');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  private clearTokens(): void {
    this.tokens = null;
    localStorage.removeItem('auth_tokens');
  }

  private isTokenExpired(tokens: AuthTokens): boolean {
    return Date.now() >= tokens.expiresAt;
  }
}

export const authService = AuthService.getInstance();
```

### 7.2 Data Security and Privacy

**Secure Data Handling:**

```typescript
// utils/security.ts
import CryptoJS from 'crypto-js';

export class SecurityUtils {
  private static readonly ENCRYPTION_KEY = process.env.REACT_APP_ENCRYPTION_KEY!;

  // Encrypt sensitive data before storing
  static encrypt(data: string): string {
    return CryptoJS.AES.encrypt(data, this.ENCRYPTION_KEY).toString();
  }

  // Decrypt stored sensitive data
  static decrypt(encryptedData: string): string {
    const bytes = CryptoJS.AES.decrypt(encryptedData, this.ENCRYPTION_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  }

  // Sanitize location data to prevent precise tracking
  static sanitizeLocation(location: { lat: number; lng: number }): { lat: number; lng: number } {
    // Round coordinates to 4 decimal places (~11m precision)
    return {
      lat: Math.round(location.lat * 10000) / 10000,
      lng: Math.round(location.lng * 10000) / 10000,
    };
  }

  // Validate and sanitize API responses
  static sanitizeApiResponse<T>(data: any, schema: ZodSchema<T>): T {
    return schema.parse(data);
  }

  // Generate secure random IDs
  static generateSecureId(): string {
    return CryptoJS.lib.WordArray.random(16).toString();
  }

  // Check for XSS attempts
  static sanitizeInput(input: string): string {
    return input
      .replace(/[<>]/g, '') // Remove HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .trim();
  }

  // Content Security Policy helper
  static getCSPHeaders(): Record<string, string> {
    return {
      'Content-Security-Policy': [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' https://maps.googleapis.com https://maps.gstatic.com",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com",
        "img-src 'self' data: https://maps.googleapis.com https://maps.gstatic.com",
        "connect-src 'self' https://api.movility.ai wss://realtime.movility.ai",
        "frame-src 'none'",
        "object-src 'none'",
      ].join('; '),
    };
  }
}

// Rate limiting for API calls
export class RateLimiter {
  private static instances = new Map<string, RateLimiter>();
  private requests: number[] = [];
  private readonly maxRequests: number;
  private readonly windowMs: number;

  constructor(maxRequests: number = 100, windowMs: number = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  static getInstance(key: string, maxRequests?: number, windowMs?: number): RateLimiter {
    if (!this.instances.has(key)) {
      this.instances.set(key, new RateLimiter(maxRequests, windowMs));
    }
    return this.instances.get(key)!;
  }

  async checkLimit(): Promise<boolean> {
    const now = Date.now();
    this.requests = this.requests.filter(timestamp => now - timestamp < this.windowMs);

    if (this.requests.length >= this.maxRequests) {
      const oldestRequest = Math.min(...this.requests);
      const waitTime = this.windowMs - (now - oldestRequest);

      throw new Error(`Rate limit exceeded. Try again in ${Math.ceil(waitTime / 1000)} seconds.`);
    }

    this.requests.push(now);
    return true;
  }
}
```

---

## 8. Testing Strategy

### 8.1 Unit Testing Implementation

**Component Testing Examples:**

```typescript
// __tests__/components/map/MapContainer.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import { MapContainer } from '../../../components/map/MapContainer';
import { useMap } from '../../../hooks/useMap';

// Mock the Google Maps API
jest.mock('@googlemaps/js-api-loader', () => ({
  Loader: jest.fn().mockImplementation(() => ({
    load: jest.fn().mockResolvedValue({
      maps: {
        Map: jest.fn().mockImplementation(() => ({
          addListener: jest.fn(),
          getCenter: jest.fn().mockReturnValue({ lat: () => 6.2442, lng: () => -75.5812 }),
          getZoom: jest.fn().mockReturnValue(13),
        })),
      },
    }),
  })),
}));

jest.mock('../../../hooks/useMap');

describe('MapContainer', () => {
  const mockUseMap = useMap as jest.MockedFunction<typeof useMap>;

  beforeEach(() => {
    mockUseMap.mockReturnValue({
      mapInstance: null,
      panTo: jest.fn(),
      fitBounds: jest.fn(),
      addMarker: jest.fn(),
      clearOverlays: jest.fn(),
    });
  });

  it('renders map container with correct ID', () => {
    render(<MapContainer />);
    expect(screen.getByTestId('map-container')).toBeInTheDocument();
  });

  it('initializes map on mount', async () => {
    render(<MapContainer />);

    await waitFor(() => {
      expect(mockUseMap).toHaveBeenCalled();
    });
  });

  it('handles map controls interaction', async () => {
    const { container } = render(<MapContainer />);

    // Test zoom controls
    const zoomInButton = screen.getByLabelText('Zoom in');
    const zoomOutButton = screen.getByLabelText('Zoom out');

    expect(zoomInButton).toBeInTheDocument();
    expect(zoomOutButton).toBeInTheDocument();
  });
});

// __tests__/services/routeService.test.ts
import { routeService } from '../../../services/routeService';
import { apiClient } from '../../../services/apiClient';

jest.mock('../../../services/apiClient');

describe('RouteService', () => {
  const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('planRoute', () => {
    it('should call API with correct parameters', async () => {
      const mockRouteRequest = {
        origin: { lat: 6.2442, lng: -75.5812 },
        destination: { lat: 6.2094, lng: -75.5671 },
        preferences: { modes: ['metro', 'walking'] },
      };

      const mockResponse = {
        routes: [
          {
            id: 'route-1',
            duration: 25,
            distance: 5.2,
            modes: ['walking', 'metro'],
          },
        ],
      };

      mockApiClient.request.mockResolvedValue(mockResponse);

      const result = await routeService.planRoute(mockRouteRequest);

      expect(mockApiClient.request).toHaveBeenCalledWith('/routes/plan', {
        method: 'POST',
        body: JSON.stringify(mockRouteRequest),
      });
      expect(result).toEqual(mockResponse);
    });

    it('should handle API errors gracefully', async () => {
      const mockRouteRequest = {
        origin: { lat: 6.2442, lng: -75.5812 },
        destination: { lat: 6.2094, lng: -75.5671 },
        preferences: { modes: ['metro', 'walking'] },
      };

      mockApiClient.request.mockRejectedValue(new Error('Network error'));

      await expect(routeService.planRoute(mockRouteRequest)).rejects.toThrow('Network error');
    });
  });
});
```

### 8.2 Integration Testing

**E2E Testing with Playwright:**

```typescript
// e2e/tests/route-planning.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Route Planning Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for map to load
    await page.waitForSelector('[data-testid="map-container"]');
  });

  test('should plan a route from origin to destination', async ({ page }) => {
    // Enter origin
    await page.fill('[data-testid="origin-input"]', 'Parque Envigado');
    await page.waitForSelector('[data-testid="origin-suggestions"]');
    await page.click('[data-testid="origin-suggestion-0"]');

    // Enter destination
    await page.fill('[data-testid="destination-input"]', 'Plaza Mayor');
    await page.waitForSelector('[data-testid="destination-suggestions"]');
    await page.click('[data-testid="destination-suggestion-0"]');

    // Click plan route button
    await page.click('[data-testid="plan-route-button"]');

    // Wait for route results
    await page.waitForSelector('[data-testid="route-results"]');

    // Verify route options are displayed
    const routeOptions = await page.locator('[data-testid="route-option"]');
    await expect(routeOptions).toHaveCount.greaterThan(0);

    // Verify route details
    const firstRoute = routeOptions.first();
    await expect(firstRoute.locator('[data-testid="route-duration"]')).toBeVisible();
    await expect(firstRoute.locator('[data-testid="route-modes"]')).toBeVisible();
    await expect(firstRoute.locator('[data-testid="route-carbon-footprint"]')).toBeVisible();
  });

  test('should display real-time traffic updates', async ({ page }) => {
    // Enable traffic layer
    await page.click('[data-testid="traffic-layer-toggle"]');

    // Wait for traffic data to load
    await page.waitForSelector('[data-testid="traffic-overlay"]');

    // Verify traffic colors are displayed
    const trafficElements = await page.locator('[data-testid="traffic-segment"]');
    await expect(trafficElements).toHaveCount.greaterThan(0);
  });

  test('should handle offline scenario gracefully', async ({ page }) => {
    // Simulate offline mode
    await page.context().setOffline(true);

    // Try to plan a route
    await page.fill('[data-testid="origin-input"]', 'Parque Envigado');
    await page.fill('[data-testid="destination-input"]', 'Plaza Mayor');
    await page.click('[data-testid="plan-route-button"]');

    // Should show offline message
    await expect(page.locator('[data-testid="offline-message"]')).toBeVisible();

    // Should offer cached routes if available
    const cachedRoutes = await page.locator('[data-testid="cached-route"]');
    if (await cachedRoutes.count() > 0) {
      await expect(cachedRoutes.first()).toBeVisible();
    }
  });
});
```

---

## 9. Performance Monitoring and Analytics

### 9.1 Performance Metrics Collection

**Performance Monitoring Service:**

```typescript
// services/performanceService.ts
export class PerformanceService {
  private static instance: PerformanceService;
  private metrics: Map<string, number[]> = new Map();
  private observers: PerformanceObserver[] = [];

  static getInstance(): PerformanceService {
    if (!PerformanceService.instance) {
      PerformanceService.instance = new PerformanceService();
    }
    return PerformanceService.instance;
  }

  initialize(): void {
    this.observeNavigationTiming();
    this.observeResourceTiming();
    this.observeLongTasks();
    this.observeLCP();
    this.observeFID();
    this.observeCLS();
  }

  private observeNavigationTiming(): void {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'navigation') {
          const navEntry = entry as PerformanceNavigationTiming;

          this.recordMetric('dom-content-loaded', navEntry.domContentLoadedEventEnd - navEntry.domContentLoadedEventStart);
          this.recordMetric('page-load', navEntry.loadEventEnd - navEntry.loadEventStart);
          this.recordMetric('time-to-first-byte', navEntry.responseStart - navEntry.requestStart);
        }
      }
    });

    observer.observe({ entryTypes: ['navigation'] });
    this.observers.push(observer);
  }

  private observeResourceTiming(): void {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'resource') {
          const resourceEntry = entry as PerformanceResourceTiming;
          const resourceName = this.getResourceName(resourceEntry.name);

          this.recordMetric(`resource-${resourceName}`, resourceEntry.duration);
        }
      }
    });

    observer.observe({ entryTypes: ['resource'] });
    this.observers.push(observer);
  }

  private observeLongTasks(): void {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'longtask') {
          this.recordMetric('long-task', entry.duration);
        }
      }
    });

    observer.observe({ entryTypes: ['longtask'] });
    this.observers.push(observer);
  }

  private observeLCP(): void {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      this.recordMetric('largest-contentful-paint', lastEntry.startTime);
    });

    observer.observe({ entryTypes: ['largest-contentful-paint'] });
    this.observers.push(observer);
  }

  private observeFID(): void {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'first-input') {
          this.recordMetric('first-input-delay', (entry as any).processingStart - entry.startTime);
        }
      }
    });

    observer.observe({ entryTypes: ['first-input'] });
    this.observers.push(observer);
  }

  private observeCLS(): void {
    let clsValue = 0;

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!(entry as any).hadRecentInput) {
          clsValue += (entry as any).value;
        }
      }

      this.recordMetric('cumulative-layout-shift', clsValue);
    });

    observer.observe({ entryTypes: ['layout-shift'] });
    this.observers.push(observer);
  }

  recordCustomMetric(name: string, value: number): void {
    this.recordMetric(name, value);
  }

  private recordMetric(name: string, value: number): void {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }

    const values = this.metrics.get(name)!;
    values.push(value);

    // Keep only last 100 values
    if (values.length > 100) {
      values.shift();
    }
  }

  getMetrics(): Record<string, { avg: number; min: number; max: number; count: number }> {
    const result: Record<string, { avg: number; min: number; max: number; count: number }> = {};

    for (const [name, values] of this.metrics.entries()) {
      if (values.length === 0) continue;

      const sum = values.reduce((a, b) => a + b, 0);
      result[name] = {
        avg: sum / values.length,
        min: Math.min(...values),
        max: Math.max(...values),
        count: values.length,
      };
    }

    return result;
  }

  private getResourceName(url: string): string {
    if (url.includes('maps.googleapis.com')) return 'google-maps-api';
    if (url.includes('maps.gstatic.com')) return 'google-maps-static';
    if (url.includes('api.movility.ai')) return 'movility-api';
    if (url.includes('.js')) return 'javascript';
    if (url.includes('.css')) return 'stylesheet';
    if (url.includes('.png') || url.includes('.jpg') || url.includes('.svg')) return 'image';
    return 'other';
  }

  destroy(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    this.metrics.clear();
  }
}

export const performanceService = PerformanceService.getInstance();
```

### 9.2 User Analytics Integration

**Analytics Service Implementation:**

```typescript
// services/analyticsService.ts
interface AnalyticsEvent {
  event: string;
  properties: Record<string, any>;
  timestamp: number;
  userId?: string;
  sessionId: string;
}

class AnalyticsService {
  private static instance: AnalyticsService;
  private sessionId: string;
  private userId: string | null = null;
  private eventQueue: AnalyticsEvent[] = [];
  private isOnline: boolean = navigator.onLine;

  private constructor() {
    this.sessionId = this.generateSessionId();
    this.setupEventListeners();
    this.startBatchProcessing();
  }

  static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  track(event: string, properties: Record<string, any> = {}): void {
    const analyticsEvent: AnalyticsEvent = {
      event,
      properties,
      timestamp: Date.now(),
      userId: this.userId || undefined,
      sessionId: this.sessionId,
    };

    this.eventQueue.push(analyticsEvent);

    // Flush immediately for critical events
    if (this.isCriticalEvent(event)) {
      this.flushEvents();
    }
  }

  identify(userId: string, traits: Record<string, any> = {}): void {
    this.userId = userId;
    this.track('user_identified', { ...traits, userId });
  }

  trackPageView(path: string, title?: string): void {
    this.track('page_view', {
      path,
      title: title || document.title,
      referrer: document.referrer,
      userAgent: navigator.userAgent,
    });
  }

  trackRouteSearch(origin: string, destination: string, filters: Record<string, any>): void {
    this.track('route_search', {
      origin,
      destination,
      filters,
      timestamp: Date.now(),
    });
  }

  trackRouteSelected(routeId: string, routeData: any): void {
    this.track('route_selected', {
      routeId,
      duration: routeData.duration,
      modes: routeData.modes,
      carbonFootprint: routeData.carbonFootprint,
      cost: routeData.cost,
    });
  }

  trackMapInteraction(interaction: string, location?: { lat: number; lng: number }): void {
    this.track('map_interaction', {
      interaction,
      location,
      zoom: this.getCurrentZoom(),
    });
  }

  trackPerformanceMetric(metric: string, value: number): void {
    this.track('performance_metric', {
      metric,
      value,
      userAgent: navigator.userAgent,
      connection: this.getConnectionInfo(),
    });
  }

  trackError(error: Error, context: Record<string, any> = {}): void {
    this.track('error_occurred', {
      message: error.message,
      stack: error.stack,
      context,
      url: window.location.href,
    });
  }

  private async flushEvents(): Promise<void> {
    if (this.eventQueue.length === 0 || !this.isOnline) return;

    const eventsToSend = [...this.eventQueue];
    this.eventQueue = [];

    try {
      await fetch(`${process.env.REACT_APP_ANALYTICS_ENDPOINT}/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          events: eventsToSend,
          metadata: {
            version: process.env.REACT_APP_VERSION,
            build: process.env.REACT_APP_BUILD_NUMBER,
          },
        }),
      });
    } catch (error) {
      // Re-queue events if send fails
      this.eventQueue.unshift(...eventsToSend);
      console.error('Failed to send analytics events:', error);
    }
  }

  private startBatchProcessing(): void {
    setInterval(() => {
      this.flushEvents();
    }, 30000); // Flush every 30 seconds
  }

  private setupEventListeners(): void {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.flushEvents();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });

    // Track page visibility changes
    document.addEventListener('visibilitychange', () => {
      this.track('page_visibility_changed', {
        isVisible: !document.hidden,
      });
    });

    // Track beforeunload for session end
    window.addEventListener('beforeunload', () => {
      this.track('session_end', {
        duration: Date.now() - parseInt(this.sessionId),
      });
      this.flushEvents();
    });
  }

  private isCriticalEvent(event: string): boolean {
    const criticalEvents = [
      'route_selected',
      'error_occurred',
      'user_identified',
      'conversion',
    ];
    return criticalEvents.includes(event);
  }

  private generateSessionId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private getCurrentZoom(): number {
    // Implementation depends on map library integration
    return 13;
  }

  private getConnectionInfo(): string {
    const connection = (navigator as any).connection;
    if (!connection) return 'unknown';
    return `${connection.effectiveType}-${connection.downlink}`;
  }
}

export const analyticsService = AnalyticsService.getInstance();
```

---

## 10. Deployment and DevOps Configuration

### 10.1 Build Configuration

**Vite Configuration:**

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { compression } from 'vite-plugin-compression2';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/maps\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-maps-api',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
            },
          },
          {
            urlPattern: /^https:\/\/api\.movility\.ai\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'movility-api',
              networkTimeoutSeconds: 3,
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 5, // 5 minutes
              },
            },
          },
        ],
      },
    }),
    compression({
      algorithm: 'gzip',
      ext: '.gz',
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          map: ['@googlemaps/js-api-loader'],
          charts: ['chart.js', 'd3'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
    sourcemap: true,
  },
  optimizeDeps: {
    include: ['react', 'react-dom', '@googlemaps/js-api-loader'],
  },
  server: {
    headers: {
      ...SecurityUtils.getCSPHeaders(),
    },
  },
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
    __BUILD_DATE__: JSON.stringify(new Date().toISOString()),
  },
});
```

### 10.2 Docker Configuration

**Dockerfile for Frontend:**

```dockerfile
# Dockerfile
# Multi-stage build for optimized production image

# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install pnpm and dependencies
RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build application
RUN pnpm build

# Production stage
FROM nginx:alpine AS production

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy built application
COPY --from=builder /app/dist /usr/share/nginx/html

# Add non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Change ownership of nginx directories
RUN chown -R nextjs:nodejs /var/cache/nginx && \
    chown -R nextjs:nodejs /var/log/nginx && \
    chown -R nextjs:nodejs /etc/nginx/conf.d
RUN touch /var/run/nginx.pid && \
    chown -R nextjs:nodejs /var/run/nginx.pid

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
```

**Nginx Configuration:**

```nginx
# nginx.conf
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Referrer-Policy strict-origin-when-cross-origin;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=general:10m rate=30r/s;

    server {
        listen 3000;
        server_name _;
        root /usr/share/nginx/html;
        index index.html;

        # Security headers
        add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' https://maps.googleapis.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https://maps.googleapis.com https://maps.gstatic.com; connect-src 'self' https://api.movility.ai wss://realtime.movility.ai;";

        # Rate limiting
        limit_req zone=general burst=50 nodelay;

        # Static asset caching
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
            add_header Vary Accept-Encoding;
        }

        # API rate limiting
        location /api/ {
            limit_req zone=api burst=20 nodelay;
            proxy_pass https://api.movility.ai;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Service worker
        location /sw.js {
            expires off;
            add_header Cache-Control "no-cache, no-store, must-revalidate";
            add_header Pragma "no-cache";
        }

        # HTML files - no caching
        location ~* \.html$ {
            expires off;
            add_header Cache-Control "no-cache, no-store, must-revalidate";
            add_header Pragma "no-cache";
        }

        # SPA fallback
        location / {
            try_files $uri $uri/ /index.html;
        }

        # Health check endpoint
        location /health {
            access_log off;
            return 200 "healthy\n";
            add_header Content-Type text/plain;
        }
    }
}
```

### 10.3 CI/CD Pipeline

**GitHub Actions Workflow:**

```yaml
# .github/workflows/deploy.yml
name: Build and Deploy Frontend

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v4

    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '20'
        cache: 'npm'

    - name: Install pnpm
      run: npm install -g pnpm

    - name: Install dependencies
      run: pnpm install --frozen-lockfile

    - name: Run linting
      run: pnpm lint

    - name: Run type checking
      run: pnpm type-check

    - name: Run unit tests
      run: pnpm test:unit

    - name: Run component tests
      run: pnpm test:component

    - name: Build application
      run: pnpm build
      env:
        VITE_GOOGLE_MAPS_API_KEY: ${{ secrets.GOOGLE_MAPS_API_KEY }}
        VITE_API_BASE_URL: ${{ secrets.API_BASE_URL }}

  e2e-test:
    runs-on: ubuntu-latest
    needs: test

    steps:
    - uses: actions/checkout@v4

    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '20'
        cache: 'npm'

    - name: Install pnpm
      run: npm install -g pnpm

    - name: Install dependencies
      run: pnpm install --frozen-lockfile

    - name: Install Playwright
      run: pnpm exec playwright install --with-deps

    - name: Build application
      run: pnpm build
      env:
        VITE_GOOGLE_MAPS_API_KEY: ${{ secrets.GOOGLE_MAPS_API_KEY }}
        VITE_API_BASE_URL: ${{ secrets.API_BASE_URL }}

    - name: Run E2E tests
      run: pnpm test:e2e

    - name: Upload test results
      uses: actions/upload-artifact@v3
      if: failure()
      with:
        name: playwright-report
        path: playwright-report/

  security-scan:
    runs-on: ubuntu-latest
    needs: test

    steps:
    - uses: actions/checkout@v4

    - name: Run Trivy vulnerability scanner
      uses: aquasecurity/trivy-action@master
      with:
        scan-type: 'fs'
        scan-ref: '.'
        format: 'sarif'
        output: 'trivy-results.sarif'

    - name: Upload Trivy scan results
      uses: github/codeql-action/upload-sarif@v2
      if: always()
      with:
        sarif_file: 'trivy-results.sarif'

  build-and-deploy:
    runs-on: ubuntu-latest
    needs: [test, e2e-test, security-scan]
    if: github.ref == 'refs/heads/main'

    permissions:
      contents: read
      packages: write

    steps:
    - uses: actions/checkout@v4

    - name: Log in to Container Registry
      uses: docker/login-action@v3
      with:
        registry: ${{ env.REGISTRY }}
        username: ${{ github.actor }}
        password: ${{ secrets.GITHUB_TOKEN }}

    - name: Extract metadata
      id: meta
      uses: docker/metadata-action@v5
      with:
        images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
        tags: |
          type=ref,event=branch
          type=ref,event=pr
          type=sha,prefix={{branch}}-
          type=raw,value=latest,enable={{is_default_branch}}

    - name: Build and push Docker image
      uses: docker/build-push-action@v5
      with:
        context: .
        push: true
        tags: ${{ steps.meta.outputs.tags }}
        labels: ${{ steps.meta.outputs.labels }}
        cache-from: type=gha
        cache-to: type=gha,mode=max

    - name: Deploy to staging
      if: github.ref == 'refs/heads/develop'
      run: |
        echo "Deploying to staging environment"
        # Add deployment commands here

    - name: Deploy to production
      if: github.ref == 'refs/heads/main'
      run: |
        echo "Deploying to production environment"
        # Add deployment commands here
```

---

## 11. Conclusion

This Technical End-to-System Specification provides a comprehensive blueprint for implementing a Google Maps clone frontend that seamlessly integrates with the MovilityAI backend services. The specification covers:

### Key Architectural Highlights

1. **Component-Based Architecture**: Modular React components with clear separation of concerns
2. **Advanced Map Integration**: Deep Google Maps API integration with custom overlays and real-time data
3. **Performance Optimization**: Code splitting, lazy loading, and efficient data management
4. **Real-Time Capabilities**: WebSocket integration for live traffic and route updates
5. **Offline Support**: Comprehensive offline functionality with intelligent caching
6. **Security Implementation**: Robust authentication, data encryption, and privacy protection
7. **Testing Strategy**: Comprehensive unit, integration, and E2E testing coverage
8. **Performance Monitoring**: Detailed metrics collection and analytics integration

### Implementation Success Factors

1. **Progressive Enhancement**: Core functionality works without JavaScript, with enhanced features added progressively
2. **Accessibility First**: WCAG 2.1 AA compliance with keyboard navigation and screen reader support
3. **Mobile Responsive**: Optimized for all device sizes and touch interactions
4. **Performance Budget**: Strict performance budgets to ensure fast load times
5. **Error Handling**: Graceful degradation and comprehensive error reporting
6. **Internationalization**: Multi-language support with proper localization

### Next Steps for Implementation

1. **Phase 1 (Weeks 1-4)**: Core map functionality and basic routing
2. **Phase 2 (Weeks 5-8)**: Real-time data integration and advanced features
3. **Phase 3 (Weeks 9-12)**: Performance optimization and polish
4. **Phase 4 (Weeks 13-16)**: Testing, deployment, and monitoring setup

This specification serves as the foundation for building a world-class mapping application that addresses Medellín's mobility challenges while providing an exceptional user experience. The modular architecture ensures maintainability and scalability as the platform evolves and user needs change.