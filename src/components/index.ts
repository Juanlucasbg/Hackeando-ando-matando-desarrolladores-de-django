// Waze Components (NEW)
export { default as WazeMapContainer } from './WazeMapContainer/WazeMapContainer';

// Component exports for clean imports
export * from './ui';
export * from './map';
export * from './search';
export * from './layout';

// Lazy load heavy components
export { lazy } from 'react';

// Lazy loaded components
export const RoutePlanner = lazy(() => import('./route/RoutePlanner'));
export const AnalyticsDashboard = lazy(() => import('./analytics/Dashboard'));
export const EmergencyScreen = lazy(() => import('./realtime/EmergencyScreen'));

// Re-export commonly used components
export { default as Button } from './ui/Button';
export { default as Input } from './ui/Input';
export { default as Modal } from './ui/Modal';
export { default as Spinner } from './ui/Spinner';
export { default as Toast } from './ui/Toast';