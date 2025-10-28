import { Location, MapBounds, MapViewport } from './common.types';

// Map configuration types
export interface MapConfig {
  center: Location;
  zoom: number;
  mapTypeId: google.maps.MapTypeId;
  styles?: google.maps.MapTypeStyle[];
  disableDefaultUI?: boolean;
  zoomControl?: boolean;
  mapTypeControl?: boolean;
  scaleControl?: boolean;
  streetViewControl?: boolean;
  rotateControl?: boolean;
  fullscreenControl?: boolean;
  gestureHandling?: google.maps.GestureHandlingOptions;
  clickableIcons?: boolean;
}

// Map state types
export interface MapState {
  mapInstance: google.maps.Map | null;
  isLoaded: boolean;
  isLoading: boolean;
  error: string | null;

  // Viewport state
  center: Location;
  zoom: number;
  bounds: MapBounds | null;

  // Layers and overlays
  activeLayers: Set<MapLayer>;
  layerVisibility: Record<MapLayer, boolean>;

  // Markers and overlays
  markers: Map<string, google.maps.Marker>;
  polylines: Map<string, google.maps.Polyline>;
  polygons: Map<string, google.maps.Polygon>;
  circles: Map<string, google.maps.Circle>;
  infoWindows: Map<string, google.maps.InfoWindow>;

  // User interaction state
  selectedLocation: Location | null;
  isDrawingMode: boolean;
  drawingTools: DrawingTool[];

  // UI state
  showTraffic: boolean;
  showTransit: boolean;
  showBicycling: boolean;
  mapType: google.maps.MapTypeId;
}

export type MapLayer =
  | 'traffic'
  | 'transit'
  | 'bicycling'
  | 'markers'
  | 'routes'
  | 'places'
  | 'custom';

export type DrawingTool =
  | 'marker'
  | 'polyline'
  | 'polygon'
  | 'rectangle'
  | 'circle';

// Marker types
export interface MarkerOptions {
  position: Location;
  title?: string;
  icon?: string | google.maps.Icon | google.maps.Symbol;
  animation?: google.maps.Animation;
  draggable?: boolean;
  clickable?: boolean;
  opacity?: number;
  zIndex?: number;
}

export interface CustomMarker extends MarkerOptions {
  id: string;
  type: MarkerType;
  data?: Record<string, any>;
  isVisible: boolean;
}

export type MarkerType =
  | 'default'
  | 'place'
  | 'route-start'
  | 'route-end'
  | 'transit-station'
  | 'bike-station'
  | 'poi'
  | 'user-location';

// Street View types
export interface StreetViewConfig {
  position: Location;
  pov?: PointOfView;
  zoom?: number;
  visible?: boolean;
  linksControl?: boolean;
  panControl?: boolean;
  zoomControl?: boolean;
  addressControl?: boolean;
  motionTracking?: boolean;
  motionTrackingControl?: boolean;
}

export interface PointOfView {
  heading: number; // 0-360 degrees
  pitch: number;   // -90 to 90 degrees
  zoom?: number;  // 0-3
}

export interface StreetViewState {
  isVisible: boolean;
  position: Location;
  pov: PointOfView;
  zoom: number;
  isLoading: boolean;
  error: string | null;
  isAvailable: boolean;
}

// Map controls types
export interface MapControlsConfig {
  showZoomControls: boolean;
  showMapTypeControl: boolean;
  showStreetViewControl: boolean;
  showFullscreenControl: boolean;
  showRotateControl: boolean;
  showScaleControl: boolean;
  customControls?: CustomControl[];
}

export interface CustomControl {
  id: string;
  position: google.maps.ControlPosition;
  element: HTMLElement;
  visible: boolean;
}

// Map styles and themes
export interface MapTheme {
  id: string;
  name: string;
  styles: google.maps.MapTypeStyle[];
  preview?: string;
}

export interface MapStyleConfig {
  defaultTheme: string;
  availableThemes: MapTheme[];
  customStyles?: google.maps.MapTypeStyle[];
}

// Map events types
export interface MapEventHandlers {
  onClick?: (event: MapClickEvent) => void;
  onRightClick?: (event: MapClickEvent) => void;
  onDoubleClick?: (event: MapClickEvent) => void;
  onDragStart?: (event: google.maps.MapMouseEvent) => void;
  onDrag?: (event: google.maps.MapMouseEvent) => void;
  onDragEnd?: (event: google.maps.MapMouseEvent) => void;
  onZoomChanged?: () => void;
  onCenterChanged?: () => void;
  onBoundsChanged?: () => void;
  onMapTypeChanged?: () => void;
  onProjectionChanged?: () => void;
  onTilesLoaded?: () => void;
}

// Map utility types
export interface GeocoderResult {
  location: Location;
  formattedAddress: string;
  addressComponents: google.maps.GeocoderAddressComponent[];
  placeId: string;
  types: string[];
  isPartialMatch: boolean;
}

export interface DirectionsRequest {
  origin: Location;
  destination: Location;
  waypoints?: Location[];
  travelMode: google.maps.TravelMode;
  avoidTolls?: boolean;
  avoidHighways?: boolean;
  avoidFerries?: boolean;
  unitSystem?: google.maps.UnitSystem;
  optimizeWaypoints?: boolean;
}

export interface DirectionsResult {
  routes: google.maps.DirectionsRoute[];
  status: google.maps.DirectionsStatus;
  availableTravelModes: google.maps.TravelMode[];
}

// Map measurement tools
export interface DistanceMeasurement {
  id: string;
  points: Location[];
  totalDistance: number; // in meters
  unitSystem: google.maps.UnitSystem;
  isVisible: boolean;
  color: string;
  lineWidth: number;
}

export interface AreaMeasurement {
  id: string;
  path: Location[];
  totalArea: number; // in square meters
  unitSystem: google.maps.UnitSystem;
  isVisible: boolean;
  fillColor: string;
  strokeColor: string;
  strokeWidth: number;
}

// Map performance types
export interface MapPerformanceMetrics {
  tileLoadTime: number;
  markerRenderTime: number;
  overlayRenderTime: number;
  totalRenderTime: number;
  memoryUsage: number;
  markerCount: number;
  overlayCount: number;
  timestamp: Date;
}