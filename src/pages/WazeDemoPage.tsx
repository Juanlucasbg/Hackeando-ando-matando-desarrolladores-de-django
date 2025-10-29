import React, { useState } from 'react';
import { WazeMapContainer, MapMarker, Location } from '../components';
import { getWazeService } from '../services/wazeService';
import { MapPin, Navigation, Route } from 'lucide-react';

const WazeDemoPage: React.FC = () => {
  const [markers, setMarkers] = useState<MapMarker[]>([]);
  const [startPoint, setStartPoint] = useState<Location>({ lat: 40.7128, lng: -74.0060 });
  const [endPoint, setEndPoint] = useState<Location>({ lat: 40.7589, lng: -73.9851 });
  const [routeInfo, setRouteInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const wazeService = getWazeService();

  const handleMapClick = (event: any) => {
    if (event.latLng) {
      const location: Location = {
        lat: event.latLng.lat(),
        lng: event.latLng.lng(),
      };

      const newMarker: MapMarker = {
        id: `marker-${Date.now()}`,
        position: location,
        title: `Location ${markers.length + 1}`,
        description: `Lat: ${location.lat.toFixed(4)}, Lng: ${location.lng.toFixed(4)}`,
      };

      setMarkers([...markers, newMarker]);
    }
  };

  const handleMarkerClick = (marker: MapMarker) => {
    console.log('Marker clicked:', marker);
  };

  const calculateRoute = async () => {
    setLoading(true);
    setError(null);
    setRouteInfo(null);

    try {
      const route = await wazeService.calculateRoute(startPoint, endPoint);
      setRouteInfo(route);

      // Add route markers
      const routeMarkers: MapMarker[] = [
        {
          id: 'start',
          position: startPoint,
          title: 'Start Point',
          description: 'Route starting location',
          icon: {
            path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z',
            fillColor: '#22c55e',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 2,
            scale: 2,
          },
        },
        {
          id: 'end',
          position: endPoint,
          title: 'End Point',
          description: 'Route destination',
          icon: {
            path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z',
            fillColor: '#ef4444',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 2,
            scale: 2,
          },
        },
      ];

      setMarkers(routeMarkers);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to calculate route');
    } finally {
      setLoading(false);
    }
  };

  const clearMarkers = () => {
    setMarkers([]);
    setRouteInfo(null);
    setError(null);
  };

  const updateStartPoint = (field: 'lat' | 'lng', value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      setStartPoint({ ...startPoint, [field]: numValue });
    }
  };

  const updateEndPoint = (field: 'lat' | 'lng', value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      setEndPoint({ ...endPoint, [field]: numValue });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Navigation className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Waze API Demo</h1>
                <p className="text-sm text-gray-500">Real-time routing and navigation</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-sm text-green-600">
              <div className="w-2 h-2 bg-green-600 rounded-full"></div>
              API Connected
            </div>
          </div>
        </div>
      </div>

      {/* Control Panel */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Route Calculation */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Route className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-900">Route Calculation</h2>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Point
                  </label>
                  <div className="space-y-2">
                    <input
                      type="number"
                      value={startPoint.lat}
                      onChange={(e) => updateStartPoint('lat', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Latitude"
                      step="0.0001"
                    />
                    <input
                      type="number"
                      value={startPoint.lng}
                      onChange={(e) => updateStartPoint('lng', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Longitude"
                      step="0.0001"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Point
                  </label>
                  <div className="space-y-2">
                    <input
                      type="number"
                      value={endPoint.lat}
                      onChange={(e) => updateEndPoint('lat', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Latitude"
                      step="0.0001"
                    />
                    <input
                      type="number"
                      value={endPoint.lng}
                      onChange={(e) => updateEndPoint('lng', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Longitude"
                      step="0.0001"
                    />
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={calculateRoute}
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Calculating...' : 'Calculate Route'}
                </button>
                <button
                  onClick={clearMarkers}
                  className="bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors"
                >
                  Clear All
                </button>
              </div>
            </div>

            {/* Route Info */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <MapPin className="w-5 h-5 text-green-600" />
                <h2 className="text-lg font-semibold text-gray-900">Route Information</h2>
              </div>

              {routeInfo && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-600">Distance</div>
                      <div className="text-lg font-semibold text-gray-900">
                        {(routeInfo.distance / 1000).toFixed(2)} km
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Duration</div>
                      <div className="text-lg font-semibold text-gray-900">
                        {Math.round(routeInfo.duration / 60)} min
                      </div>
                    </div>
                  </div>
                  {routeInfo.restrictions && routeInfo.restrictions.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-green-200">
                      <div className="text-sm text-gray-600">Route Restrictions</div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {routeInfo.restrictions.map((restriction: string, index: number) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full"
                          >
                            {restriction}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="text-sm text-red-800">{error}</div>
                </div>
              )}

              {!routeInfo && !error && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="text-sm text-gray-600">
                    Calculate a route to see distance, duration, and restrictions information.
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Instructions */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="text-sm text-blue-800">
              <strong>Instructions:</strong> Click on the map to add markers, or use the coordinates
              above to calculate a route between two points using the Waze API.
            </div>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="h-96 lg:h-[600px]">
        <WazeMapContainer
          center={startPoint}
          zoom={12}
          markers={markers}
          onMapClick={handleMapClick}
          onMarkerClick={handleMarkerClick}
          className="w-full h-full"
        />
      </div>
    </div>
  );
};

export default WazeDemoPage;