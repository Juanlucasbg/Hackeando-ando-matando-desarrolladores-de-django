// Street View related type definitions

import { Location } from './search.types';

export interface StreetViewPosition {
  lat: number;
  lng: number;
  heading?: number;
  pitch?: number;
  zoom?: number;
}

export interface StreetViewPano {
  id: string;
  location: Location;
  heading: number;
  pitch: number;
  zoom: number;
  description?: string;
  links: StreetViewLink[];
  copyright?: string;
  imageDate?: string;
}

export interface StreetViewLink {
  heading: number;
  description: string;
  pano: string;
  roadColor?: string;
  roadOpacity?: number;
}

export interface StreetViewOptions {
  position?: StreetViewPosition;
  pano?: string;
  pov?: StreetViewPOV;
  zoom?: number;
  motionTracking?: boolean;
  motionTrackingControl?: boolean;
  panControl?: boolean;
  zoomControl?: boolean;
  addressControl?: boolean;
  addressControlOptions?: google.maps.StreetViewAddressControlOptions;
  linksControl?: boolean;
  clickToGo?: boolean;
  disableDefaultUI?: boolean;
  fullscreenControl?: boolean;
  fullscreenControlOptions?: google.maps.FullscreenControlOptions;
  enableCloseButton?: boolean;
  imageDateControl?: boolean;
  scrollwheel?: boolean;
  visible?: boolean;
  mode?: 'html5' | 'webgl';
}

export interface StreetViewPOV {
  heading: number;
  pitch: number;
}

export interface StreetViewLocation {
  latLng: google.maps.LatLng;
  description?: string;
  pano?: string;
  shortDescription?: string;
}

export interface StreetViewState {
  isVisible: boolean;
  isLoading: boolean;
  hasError: boolean;
  errorMessage?: string;
  currentPosition: StreetViewPosition | null;
  currentPano: StreetViewPano | null;
  history: StreetViewPosition[];
  historyIndex: number;
  isFullscreen: boolean;
  showControls: boolean;
  measurementMode: boolean;
  measurementPoints: StreetViewMeasurementPoint[];
  isMoving: boolean;
  isTransitioning: boolean;
}

export interface StreetViewMeasurementPoint {
  id: string;
  position: StreetViewPosition;
  description?: string;
  distance?: number;
}

export interface StreetViewControlOptions {
  showZoomControls: boolean;
  showPanControls: boolean;
  showMovementControls: boolean;
  showCompass: boolean;
  showInfoPanel: boolean;
  showMeasurementTools: boolean;
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

export interface StreetViewAnimation {
  from: StreetViewPosition;
  to: StreetViewPosition;
  duration: number;
  easing: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out';
}

export interface StreetViewCoverage {
  lat: number;
  lng: number;
  level: number;
  region?: string;
  best?: boolean;
}

export interface StreetViewServiceStatus {
  status: google.maps.StreetViewStatus;
  message?: string;
}

export interface StreetViewNavigationOptions {
  animate: boolean;
  duration?: number;
  callback?: () => void;
}

export interface StreetViewKeyboardConfig {
  forward: string[];
  backward: string[];
  turnLeft: string[];
  turnRight: string[];
  zoomIn: string[];
  zoomOut: string[];
  panUp: string[];
  panDown: string[];
  panLeft: string[];
  panRight: string[];
  exit: string[];
  fullscreen: string[];
  toggleControls: string[];
}

export interface StreetViewPegmanPosition {
  lat: number;
  lng: number;
  heading?: number;
  elevation?: number;
}

export interface StreetViewTimeTravelOptions {
  date?: Date;
  showHistoricalImages: boolean;
  availableDates?: Date[];
}

export interface StreetViewOverlay {
  id: string;
  position: StreetViewPosition;
  type: 'marker' | 'info' | 'poi' | 'custom';
  content?: string;
  icon?: string;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}

export interface StreetViewShareOptions {
  url: string;
  title: string;
  description?: string;
  includePosition: boolean;
  includePov: boolean;
}

export interface StreetViewAccessibilityOptions {
  highContrast: boolean;
  largeText: boolean;
  reducedMotion: boolean;
  screenReader: boolean;
  keyboardNavigation: boolean;
  visualIndicators: boolean;
}

export interface StreetViewPerformanceOptions {
  preloadAdjacent: boolean;
  cacheSize: number;
  quality: 'low' | 'medium' | 'high' | 'auto';
  enableWebGL: boolean;
  hardwareAcceleration: boolean;
}

export interface StreetViewError {
  code: string;
  message: string;
  details?: any;
  timestamp: number;
}

export interface StreetViewEventHandlers {
  onPanoChanged?: (pano: string) => void;
  onPositionChanged?: (position: StreetViewPosition) => void;
  onPovChanged?: (pov: StreetViewPOV) => void;
  onLinksChanged?: (links: StreetViewLink[]) => void;
  onZoomChanged?: (zoom: number) => void;
  onVisibleChanged?: (visible: boolean) => void;
  onError?: (error: StreetViewError) => void;
  onLoading?: (isLoading: boolean) => void;
  onFullscreenChanged?: (isFullscreen: boolean) => void;
}

export interface StreetViewKeyboardState {
  enabled: boolean;
  config: StreetViewKeyboardConfig;
  activeKeys: Set<string>;
}

export interface StreetViewStore {
  state: StreetViewState;
  options: StreetViewControlOptions;
  keyboard: StreetViewKeyboardState;
  performance: StreetViewPerformanceOptions;
  accessibility: StreetViewAccessibilityOptions;
  actions: {
    showStreetView: (position: StreetViewPosition) => void;
    hideStreetView: () => void;
    setPosition: (position: StreetViewPosition) => void;
    setPOV: (pov: StreetViewPOV) => void;
    setZoom: (zoom: number) => void;
    moveToPosition: (position: StreetViewPosition, options?: StreetViewNavigationOptions) => void;
    goForward: () => void;
    goBackward: () => void;
    turnLeft: () => void;
    turnRight: () => void;
    zoomIn: () => void;
    zoomOut: () => void;
    toggleFullscreen: () => void;
    toggleControls: () => void;
    toggleMeasurementMode: () => void;
    addMeasurementPoint: (point: StreetViewMeasurementPoint) => void;
    clearMeasurements: () => void;
    goToHistoryIndex: (index: number) => void;
    clearHistory: () => void;
    setError: (error: StreetViewError) => void;
    clearError: () => void;
    updatePerformance: (options: Partial<StreetViewPerformanceOptions>) => void;
    updateAccessibility: (options: Partial<StreetViewAccessibilityOptions>) => void;
    updateKeyboardConfig: (config: Partial<StreetViewKeyboardConfig>) => void;
  };
}