import React from 'react';
import { AppLayout } from './components/layout/AppLayout';
import { ThemeProvider } from './components/ui/ThemeProvider';
import { ToastProvider } from './components/ui/ToastContainer';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { SidebarSection } from './components/layout/Sidebar';
import { SearchBar } from './components/search/SearchBar';
import { Button } from './components/ui/Button';
import './styles/responsive.css';

/**
 * Demo App component showcasing the complete UI/UX implementation
 */
const AppDemo: React.FC = () => {
  const handleSearch = (query: string) => {
    console.log('Searching for:', query);
    // In a real app, this would trigger location search
  };

  const handleThemeToggle = () => {
    console.log('Theme toggled');
  };

  const handleSidebarToggle = () => {
    console.log('Sidebar toggled');
  };

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <ToastProvider>
          <AppLayout
            sidebarContent={
              <div className="sidebar-content-demo">
                <SidebarSection
                  title="Search"
                  icon={
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="11" cy="11" r="8" />
                      <path d="m21 21-4.35-4.35" />
                    </svg>
                  }
                >
                  <SearchBar
                    placeholder="Search locations..."
                    onSubmit={handleSearch}
                    showSuggestions={true}
                  />
                </SidebarSection>

                <SidebarSection
                  title="Map Layers"
                  icon={
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polygon points="1 6 1 22 8 18 16 22 16 6" />
                      <polyline points="8 2 8 18 16 22 16 6" />
                    </svg>
                  }
                >
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" defaultChecked className="form-checkbox" />
                      <span>Traffic</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" defaultChecked className="form-checkbox" />
                      <span>Transit</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" className="form-checkbox" />
                      <span>Bicycle</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" className="form-checkbox" />
                      <span>Terrain</span>
                    </label>
                  </div>
                </SidebarSection>

                <SidebarSection
                  title="Quick Actions"
                  icon={
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  }
                >
                  <div className="space-y-2">
                    <Button variant="ghost" size="sm" className="w-full justify-start">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-2">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                      Get Directions
                    </Button>
                    <Button variant="ghost" size="sm" className="w-full justify-start">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-2">
                        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                      </svg>
                      Save Place
                    </Button>
                    <Button variant="ghost" size="sm" className="w-full justify-start">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-2">
                        <circle cx="12" cy="12" r="3" />
                        <path d="M12 1v6m0 6v6m4.22-13.22l4.24 4.24M1.54 9.96l4.24 4.24M20.46 14.04l-4.24 4.24M7.46 6.04L3.22 1.8" />
                      </svg>
                      Share Location
                    </Button>
                  </div>
                </SidebarSection>

                <SidebarSection
                  title="Settings"
                  defaultExpanded={false}
                  icon={
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="3" />
                      <path d="M12 1v6m0 6v6m4.22-13.22l4.24 4.24M1.54 9.96l4.24 4.24M20.46 14.04l-4.24 4.24M7.46 6.04L3.22 1.8" />
                    </svg>
                  }
                >
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium">Map Type</label>
                      <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                        <option>Roadmap</option>
                        <option>Satellite</option>
                        <option>Terrain</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Units</label>
                      <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                        <option>Metric</option>
                        <option>Imperial</option>
                      </select>
                    </div>
                    <div>
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" defaultChecked className="form-checkbox" />
                        <span className="text-sm">Enable gestures</span>
                      </label>
                    </div>
                  </div>
                </SidebarSection>
              </div>
            }
            onSidebarToggle={handleSidebarToggle}
            loading={false}
            className="app-demo"
          >
            {/* Map Container */}
            <div className="map-demo">
              <div className="map-placeholder">
                <div className="map-header">
                  <h2>Google Maps Clone UI/UX</h2>
                  <p>Comprehensive responsive design with accessibility features</p>
                </div>
                <div className="map-features">
                  <div className="feature-grid">
                    <div className="feature-card">
                      <h3>✅ Responsive Design</h3>
                      <p>Mobile-first layout that adapts to all screen sizes</p>
                    </div>
                    <div className="feature-card">
                      <h3>✅ Touch Gestures</h3>
                      <p>Swipe, pinch, and tap support for mobile devices</p>
                    </div>
                    <div className="feature-card">
                      <h3>✅ Accessibility</h3>
                      <p>WCAG compliant with keyboard navigation and screen reader support</p>
                    </div>
                    <div className="feature-card">
                      <h3>✅ Dark Mode</h3>
                      <p>Seamless theme switching with system preference detection</p>
                    </div>
                    <div className="feature-card">
                      <h3>✅ Error Handling</h3>
                      <p>Graceful error states with user-friendly messages</p>
                    </div>
                    <div className="feature-card">
                      <h3>✅ Loading States</h3>
                      <p>Skeleton loaders and smooth animations</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </AppLayout>
        </ToastProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default AppDemo;