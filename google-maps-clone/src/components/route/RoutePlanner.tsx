import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { useMapStore } from '../../stores/mapStore';

interface Waypoint {
  id: string;
  address: string;
  coordinates: { lat: number; lng: number };
}

const RoutePlanner: React.FC = () => {
  const { setCenter, addMarker } = useMapStore();
  const [waypoints, setWaypoints] = useState<Waypoint[]>([
    { id: '1', address: '', coordinates: { lat: 0, lng: 0 } },
    { id: '2', address: '', coordinates: { lat: 0, lng: 0 } }
  ]);
  const [travelMode, setTravelMode] = useState<'DRIVING' | 'WALKING' | 'BICYCLING' | 'TRANSIT'>('DRIVING');
  const [isPlanning, setIsPlanning] = useState(false);

  const addWaypoint = () => {
    const newWaypoint: Waypoint = {
      id: Date.now().toString(),
      address: '',
      coordinates: { lat: 0, lng: 0 }
    };
    setWaypoints([...waypoints, newWaypoint]);
  };

  const removeWaypoint = (id: string) => {
    if (waypoints.length > 2) {
      setWaypoints(waypoints.filter(wp => wp.id !== id));
    }
  };

  const updateWaypoint = (id: string, address: string) => {
    setWaypoints(waypoints.map(wp =>
      wp.id === id ? { ...wp, address } : wp
    ));
  };

  const planRoute = async () => {
    setIsPlanning(true);
    // Simulate route planning
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Add markers for waypoints
    waypoints.forEach((waypoint, index) => {
      if (waypoint.address) {
        const coordinates = {
          lat: 40.7128 + (index * 0.01), // Mock coordinates
          lng: -74.0060 + (index * 0.01)
        };
        addMarker({
          id: waypoint.id,
          position: coordinates,
          title: waypoint.address || `Waypoint ${index + 1}`,
          icon: index === 0 ? 'start' : index === waypoints.length - 1 ? 'end' : 'waypoint'
        });
      }
    });

    setIsPlanning(false);
    alert('Route planned successfully!');
  };

  return (
    <div className="absolute top-4 left-4 z-10 w-96">
      <Card className="bg-white shadow-lg">
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Route Planner</h3>

          {/* Travel Mode Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Travel Mode</label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { mode: 'DRIVING' as const, icon: '🚗', label: 'Drive' },
                { mode: 'WALKING' as const, icon: '🚶', label: 'Walk' },
                { mode: 'BICYCLING' as const, icon: '🚴', label: 'Bike' },
                { mode: 'TRANSIT' as const, icon: '🚌', label: 'Transit' }
              ].map(({ mode, icon, label }) => (
                <button
                  key={mode}
                  onClick={() => setTravelMode(mode)}
                  className={`p-2 text-center rounded-lg border transition-colors ${
                    travelMode === mode
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="text-xl mb-1">{icon}</div>
                  <div className="text-xs">{label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Waypoints */}
          <div className="space-y-3 mb-4">
            {waypoints.map((waypoint, index) => (
              <div key={waypoint.id} className="flex items-center space-x-2">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-blue-600">
                    {index === 0 ? 'A' : index === waypoints.length - 1 ? 'B' : index}
                  </span>
                </div>
                <input
                  type="text"
                  value={waypoint.address}
                  onChange={(e) => updateWaypoint(waypoint.id, e.target.value)}
                  placeholder={index === 0 ? 'Starting point' : index === waypoints.length - 1 ? 'Destination' : 'Add stop'}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
                {waypoints.length > 2 && (
                  <button
                    onClick={() => removeWaypoint(waypoint.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Add Waypoint Button */}
          <button
            onClick={addWaypoint}
            className="w-full mb-4 py-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            + Add Stop
          </button>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button
              onClick={planRoute}
              disabled={isPlanning || waypoints.every(wp => !wp.address)}
              className="flex-1"
            >
              {isPlanning ? 'Planning...' : 'Plan Route'}
            </Button>
            <Button
              variant="outline"
              onClick={() => setWaypoints([
                { id: '1', address: '', coordinates: { lat: 0, lng: 0 } },
                { id: '2', address: '', coordinates: { lat: 0, lng: 0 } }
              ])}
            >
              Clear
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default RoutePlanner;