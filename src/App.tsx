import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useThemeStore } from './stores/themeStore';
import { useOfflineDetection } from './hooks/useOfflineDetection';
import { ErrorBoundary } from './components/ErrorBoundary';
import { LoadingSpinner } from './components/ui/LoadingSpinner';
import { OfflineBanner } from './components/ui/OfflineBanner';

// Lazy load components for code splitting
const HomeScreen = React.lazy(() => import('./screens/HomeScreen'));
const RoutePlanningScreen = React.lazy(() => import('./screens/RoutePlanningScreen'));
const AnalyticsScreen = React.lazy(() => import('./screens/AnalyticsScreen'));
const SettingsScreen = React.lazy(() => import('./screens/SettingsScreen'));
const ProfileScreen = React.lazy(() => import('./screens/ProfileScreen'));
const EmergencyScreen = React.lazy(() => import('./screens/EmergencyScreen'));
const NotFoundScreen = React.lazy(() => import('./screens/NotFoundScreen'));

// App layout component
import AppLayout from './components/layout/AppLayout';

function App() {
  const { theme } = useThemeStore();
  const isOnline = useOfflineDetection();

  // Apply theme to document
  React.useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (theme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      // System theme
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.classList.toggle('dark', prefersDark);
    }
  }, [theme]);

  return (
    <div className={`min-h-screen bg-background text-foreground ${theme}`}>
      <ErrorBoundary>
        {!isOnline && <OfflineBanner />}

        <Suspense
          fallback={
            <div className="min-h-screen flex items-center justify-center">
              <LoadingSpinner size="lg" />
            </div>
          }
        >
          <Routes>
            <Route path="/" element={<AppLayout />}>
              <Route index element={<HomeScreen />} />
              <Route path="route" element={<RoutePlanningScreen />} />
              <Route path="analytics" element={<AnalyticsScreen />} />
              <Route path="settings" element={<SettingsScreen />} />
              <Route path="profile" element={<ProfileScreen />} />
              <Route path="emergency" element={<EmergencyScreen />} />
              <Route path="*" element={<NotFoundScreen />} />
            </Route>
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}

export default App;