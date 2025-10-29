// Waze API configuration
export const WAZE_API_CONFIG = {
  apiKey: process.env.REACT_APP_WAZE_API_KEY || '34eb67fbcbmshaacbf8071455e49p16c350jsn9723b6d54d91',
  baseUrl: 'https://waze-api.p.rapidapi.com',
  language: 'en',
  region: 'US',
  timeout: 10000,
};

// Map styling configuration
export const MAP_STYLES = {
  default: [] as google.maps.MapTypeStyle[],
  silver: [
    {
      elementType: 'geometry',
      stylers: [{ color: '#f5f5f5' }],
    },
    {
      elementType: 'labels.icon',
      stylers: [{ visibility: 'off' }],
    },
    {
      elementType: 'labels.text.fill',
      stylers: [{ color: '#616161' }],
    },
    {
      elementType: 'labels.text.stroke',
      stylers: [{ color: '#f5f5f5' }],
    },
    {
      featureType: 'administrative.land_parcel',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#bdbdbd' }],
    },
    {
      featureType: 'poi',
      elementType: 'geometry',
      stylers: [{ color: '#eeeeee' }],
    },
    {
      featureType: 'poi',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#757575' }],
    },
    {
      featureType: 'poi.park',
      elementType: 'geometry',
      stylers: [{ color: '#e5e5e5' }],
    },
    {
      featureType: 'poi.park',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#9e9e9e' }],
    },
    {
      featureType: 'road',
      elementType: 'geometry',
      stylers: [{ color: '#ffffff' }],
    },
    {
      featureType: 'road.arterial',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#757575' }],
    },
    {
      featureType: 'road.highway',
      elementType: 'geometry',
      stylers: [{ color: '#dadada' }],
    },
    {
      featureType: 'road.highway',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#616161' }],
    },
    {
      featureType: 'road.local',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#9e9e9e' }],
    },
    {
      featureType: 'transit.line',
      elementType: 'geometry',
      stylers: [{ color: '#e5e5e5' }],
    },
    {
      featureType: 'transit.station',
      elementType: 'geometry',
      stylers: [{ color: '#eeeeee' }],
    },
    {
      featureType: 'water',
      elementType: 'geometry',
      stylers: [{ color: '#c9c9c9' }],
    },
    {
      featureType: 'water',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#9e9e9e' }],
    },
  ] as google.maps.MapTypeStyle[],

  dark: [
    { elementType: 'geometry', stylers: [{ color: '#212121' }] },
    { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
    { elementType: 'labels.text.fill', stylers: [{ color: '#757575' }] },
    { elementType: 'labels.text.stroke', stylers: [{ color: '#212121' }] },
    {
      featureType: 'administrative',
      elementType: 'geometry',
      stylers: [{ color: '#757575' }],
    },
    {
      featureType: 'administrative.country',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#9e9e9e' }],
    },
    {
      featureType: 'administrative.land_parcel',
      stylers: [{ visibility: 'off' }],
    },
    {
      featureType: 'administrative.locality',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#bdbdbd' }],
    },
    {
      featureType: 'poi',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#757575' }],
    },
    {
      featureType: 'poi.park',
      elementType: 'geometry',
      stylers: [{ color: '#181818' }],
    },
    {
      featureType: 'poi.park',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#616161' }],
    },
    {
      featureType: 'poi.park',
      elementType: 'labels.text.stroke',
      stylers: [{ color: '#1b1b1b' }],
    },
    {
      featureType: 'road',
      elementType: 'geometry.fill',
      stylers: [{ color: '#2c2c2c' }],
    },
    {
      featureType: 'road',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#8a8a8a' }],
    },
    {
      featureType: 'road.arterial',
      elementType: 'geometry',
      stylers: [{ color: '#373737' }],
    },
    {
      featureType: 'road.highway',
      elementType: 'geometry',
      stylers: [{ color: '#3c3c3c' }],
    },
    {
      featureType: 'road.highway.controlled_access',
      elementType: 'geometry',
      stylers: [{ color: '#4e4e4e' }],
    },
    {
      featureType: 'road.local',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#616161' }],
    },
    {
      featureType: 'transit',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#757575' }],
    },
    {
      featureType: 'water',
      elementType: 'geometry',
      stylers: [{ color: '#000000' }],
    },
    {
      featureType: 'water',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#3d3d3d' }],
    },
  ] as google.maps.MapTypeStyle[],

  night: [
    { elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
    { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
    { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
    {
      featureType: 'administrative.locality',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#d59563' }],
    },
    {
      featureType: 'poi',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#d59563' }],
    },
    {
      featureType: 'poi.park',
      elementType: 'geometry',
      stylers: [{ color: '#263c3f' }],
    },
    {
      featureType: 'poi.park',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#6b9a76' }],
    },
    {
      featureType: 'road',
      elementType: 'geometry',
      stylers: [{ color: '#38414e' }],
    },
    {
      featureType: 'road.highway',
      elementType: 'geometry',
      stylers: [{ color: '#746855' }],
    },
    {
      featureType: 'road.highway',
      elementType: 'geometry.stroke',
      stylers: [{ color: '#1f2835' }],
    },
    {
      featureType: 'road.highway.controlled_access',
      elementType: 'geometry',
      stylers: [{ color: '#4e4e4e' }],
    },
    {
      featureType: 'road.local',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#9e9e9e' }],
    },
    {
      featureType: 'transit.line',
      elementType: 'geometry',
      stylers: [{ color: '#3f474e' }],
    },
    {
      featureType: 'transit.station',
      elementType: 'geometry',
      stylers: [{ color: '#3f474e' }],
    },
    {
      featureType: 'water',
      elementType: 'geometry',
      stylers: [{ color: '#17263c' }],
    },
    {
      featureType: 'water',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#515c6d' }],
    },
    {
      featureType: 'water',
      elementType: 'labels.text.stroke',
      stylers: [{ color: '#17263c' }],
    },
  ] as google.maps.MapTypeStyle[],
};

// Map controls configuration
export const MAP_CONTROLS = {
  default: {
    zoomControl: true,
    streetViewControl: true,
    mapTypeControl: true,
    fullscreenControl: false,
    scaleControl: true,
    rotateControl: true,
    panControl: false,
    overviewMapControl: false,
  },
  minimal: {
    zoomControl: true,
    streetViewControl: false,
    mapTypeControl: false,
    fullscreenControl: false,
    scaleControl: false,
    rotateControl: false,
    panControl: false,
    overviewMapControl: false,
  },
  full: {
    zoomControl: true,
    streetViewControl: true,
    mapTypeControl: true,
    fullscreenControl: true,
    scaleControl: true,
    rotateControl: true,
    panControl: true,
    overviewMapControl: true,
  },
};

// Map bounds for different regions
export const MAP_BOUNDS = {
  continental: {
    north: 71.5388001,
    south: 14.5486996,
    east: -66.8854175,
    west: -179.2310865,
  },
  usa: {
    north: 71.5388001,
    south: 14.5486996,
    east: -66.8854175,
    west: -179.2310865,
  },
  europe: {
    north: 71.185,
    south: 34.553,
    east: 69.034,
    west: -25.421,
  },
  world: {
    north: 85,
    south: -85,
    east: 180,
    west: -180,
  },
};

// Default map configurations
export const DEFAULT_MAP_CONFIGS = {
  default: {
    center: { lat: 40.7128, lng: -74.0060 }, // New York
    zoom: 12,
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    styles: MAP_STYLES.default,
    controls: MAP_CONTROLS.default,
  },
  satellite: {
    center: { lat: 40.7128, lng: -74.0060 },
    zoom: 12,
    mapTypeId: google.maps.MapTypeId.SATELLITE,
    styles: MAP_STYLES.default,
    controls: MAP_CONTROLS.default,
  },
  terrain: {
    center: { lat: 40.7128, lng: -74.0060 },
    zoom: 12,
    mapTypeId: google.maps.MapTypeId.TERRAIN,
    styles: MAP_STYLES.default,
    controls: MAP_CONTROLS.default,
  },
  dark: {
    center: { lat: 40.7128, lng: -74.0060 },
    zoom: 12,
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    styles: MAP_STYLES.dark,
    controls: MAP_CONTROLS.default,
  },
  minimal: {
    center: { lat: 40.7128, lng: -74.0060 },
    zoom: 12,
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    styles: MAP_STYLES.default,
    controls: MAP_CONTROLS.minimal,
  },
};

// Marker icons
export const MARKER_ICONS = {
  default: {
    url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
    scaledSize: { width: 32, height: 32 },
    anchor: { x: 16, y: 32 },
  },
  blue: {
    url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
    scaledSize: { width: 32, height: 32 },
    anchor: { x: 16, y: 32 },
  },
  green: {
    url: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
    scaledSize: { width: 32, height: 32 },
    anchor: { x: 16, y: 32 },
  },
  currentLocation: {
    path: google.maps.SymbolPath.CIRCLE,
    scale: 8,
    fillColor: '#4285F4',
    fillOpacity: 1,
    strokeColor: '#ffffff',
    strokeWeight: 2,
  },
  searchResult: {
    url: 'https://maps.google.com/mapfiles/ms/icons/red-pushpin.png',
    scaledSize: { width: 32, height: 32 },
    anchor: { x: 16, y: 32 },
  },
};

// Map utilities
export const MAP_UTILS = {
  // Calculate distance between two points in kilometers
  calculateDistance: (point1: google.maps.LatLng, point2: google.maps.LatLng): number => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(point2.lat() - point1.lat());
    const dLng = this.toRadians(point2.lng() - point1.lng());
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(point1.lat())) * Math.cos(this.toRadians(point2.lat())) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  },

  // Convert degrees to radians
  toRadians: (degrees: number): number => {
    return degrees * (Math.PI / 180);
  },

  // Convert radians to degrees
  toDegrees: (radians: number): number => {
    return radians * (180 / Math.PI);
  },

  // Create bounds from array of points
  createBounds: (points: google.maps.LatLng[]): google.maps.LatLngBounds => {
    const bounds = new google.maps.LatLngBounds();
    points.forEach(point => bounds.extend(point));
    return bounds;
  },

  // Fit map to bounds with padding
  fitToBounds: (map: google.maps.Map, bounds: google.maps.LatLngBounds, padding?: number | google.maps.Padding): void => {
    map.fitBounds(bounds, padding);
  },

  // Get center point of bounds
  getBoundsCenter: (bounds: google.maps.LatLngBounds): google.maps.LatLng => {
    return bounds.getCenter();
  },

  // Check if point is within bounds
  isPointInBounds: (point: google.maps.LatLng, bounds: google.maps.LatLngBounds): boolean => {
    return bounds.contains(point);
  },

  // Extend bounds to include point
  extendBounds: (bounds: google.maps.LatLngBounds, point: google.maps.LatLng): google.maps.LatLngBounds => {
    return bounds.extend(point);
  },

  // Get map bounds
  getMapBounds: (map: google.maps.Map): google.maps.LatLngBounds | null => {
    return map.getBounds();
  },

  // Get map center
  getMapCenter: (map: google.maps.Map): google.maps.LatLng => {
    return map.getCenter();
  },

  // Get map zoom
  getMapZoom: (map: google.maps.Map): number => {
    return map.getZoom();
  },

  // Set map center
  setMapCenter: (map: google.maps.Map, center: google.maps.LatLng | google.maps.LatLngLiteral): void => {
    map.setCenter(center);
  },

  // Set map zoom
  setMapZoom: (map: google.maps.Map, zoom: number): void => {
    map.setZoom(zoom);
  },

  // Pan map to position
  panTo: (map: google.maps.Map, position: google.maps.LatLng | google.maps.LatLngLiteral): void => {
    map.panTo(position);
  },
};

export default {
  GOOGLE_MAPS_CONFIG,
  MAP_STYLES,
  MAP_CONTROLS,
  MAP_BOUNDS,
  DEFAULT_MAP_CONFIGS,
  MARKER_ICONS,
  MAP_UTILS,
};