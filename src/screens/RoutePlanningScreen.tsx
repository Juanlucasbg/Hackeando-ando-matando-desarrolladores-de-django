import React, { useState } from 'react';
import { MapContainer, MapControls } from '../components/map';
import { useRouteStore } from '../stores/routeStore';

export const RoutePlanningScreen: React.FC = () => {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [transportMode, setTransportMode] = useState<'driving' | 'walking' | 'transit' | 'bicycling'>('driving');

  const {
    route,
    isCalculatingRoute,
    calculateRoute,
    clearRoute
  } = useRouteStore();

  const handleCalculateRoute = () => {
    if (origin && destination) {
      calculateRoute({
        origin,
        destination,
        travelMode: transportMode
      });
    }
  };

  return (
    <div className="h-screen w-full flex">
      {/* Route Planning Sidebar */}
      <div className="w-96 bg-white shadow-lg z-10 flex flex-col">
        <div className="p-6 border-b">
          <h1 className="text-2xl font-bold text-gray-900">Route Planning</h1>
          <p className="text-gray-600 mt-1">Plan your journey with multiple transport options</p>
        </div>

        <div className="flex-1 p-6 space-y-4">
          {/* Origin Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Starting Point
            </label>
            <input
              type="text"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              placeholder="Enter starting location"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Destination Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Destination
            </label>
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="Enter destination"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Transport Mode Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Transport Mode
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { mode: 'driving' as const, icon: '🚗', label: 'Driving' },
                { mode: 'walking' as const, icon: '🚶', label: 'Walking' },
                { mode: 'transit' as const, icon: '🚌', label: 'Transit' },
                { mode: 'bicycling' as const, icon: '🚴', label: 'Cycling' }
              ].map(({ mode, icon, label }) => (
                <button
                  key={mode}
                  onClick={() => setTransportMode(mode)}
                  className={`px-3 py-2 rounded-md border transition-colors ${
                    transportMode === mode
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <span className="mr-2">{icon}</span>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleCalculateRoute}
              disabled={!origin || !destination || isCalculatingRoute}
              className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {isCalculatingRoute ? 'Calculating...' : 'Calculate Route'}
            </button>
            <button
              onClick={clearRoute}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Clear
            </button>
          </div>

          {/* Route Information */}
          {route && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold mb-2">Route Information</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Distance:</span>
                  <span className="font-medium">{route.distance}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-medium">{route.duration}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Transport:</span>
                  <span className="font-medium capitalize">{transportMode}</span>
                </div>
              </div>
            </div>
          )}

          {/* Route Instructions */}
          {route?.instructions && (
            <div className="mt-4">
              <h3 className="font-semibold mb-2">Turn-by-Turn Directions</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {route.instructions.map((instruction, index) => (
                  <div key={index} className="flex items-start space-x-3 text-sm p-2 bg-gray-50 rounded">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs">
                      {index + 1}
                    </span>
                    <span>{instruction}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Map Container */}
      <div className="flex-1 relative">
        <MapContainer />
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10">
          <MapControls />
        </div>
      </div>
    </div>
  );
};

export default RoutePlanningScreen;