// Core location and coordinate types
export interface Location {
  lat: number;
  lng: number;
  address?: string;
  placeId?: string;
  formattedAddress?: string;
}

export interface Coordinate {
  lat: number;
  lng: number;
}

// Map related types
export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface MapViewport {
  center: Location;
  zoom: number;
  bounds?: MapBounds;
}

// API response types
export interface ApiResponse<T = any> {
  data: T;
  success: boolean;
  message?: string;
  errors?: string[];
}

export interface PaginatedResponse<T = any> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Error types
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: string;
}

export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

// Loading and async states
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface AsyncState<T = any> {
  data?: T;
  loading: boolean;
  error?: string | null;
  lastUpdated?: Date;
}

// Theme and UI types
export type Theme = 'light' | 'dark' | 'system';

export interface ThemeConfig {
  mode: Theme;
  primaryColor?: string;
  customCSS?: string;
}

// Component prop types
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
  'data-testid'?: string;
}

export interface ModalProps extends BaseComponentProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

// Event types
export interface MapClickEvent {
  location: Location;
  coordinate: Coordinate;
  originalEvent: google.maps.MapMouseEvent;
}

export interface MarkerClickEvent {
  marker: google.maps.Marker;
  position: Location;
  originalEvent: google.maps.MouseEvent;
}

// Performance and analytics types
export interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  apiResponseTime: number;
  memoryUsage: number;
  timestamp: Date;
}

export interface UserInteraction {
  type: string;
  target: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

// Utility types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredBy<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};