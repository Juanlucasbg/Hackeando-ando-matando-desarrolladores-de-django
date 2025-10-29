import React from 'react';
import { MapContainer } from '../components/map/MapContainer';
import { SearchBar } from '../components/search/SearchBar';
import { RoutePlanner } from '../components/route/RoutePlanner';

const RoutePlanningScreen: React.FC = () => {
  return (
    <div className="flex flex-col h-screen">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">Route Planning</h1>
            <SearchBar onLocationSelect={(location) => console.log('Location selected:', location)} />
          </div>
        </div>
      </header>

      <main className="flex-1 flex">
        <div className="w-full h-full">
          <MapContainer>
            <RoutePlanner />
          </MapContainer>
        </div>
      </main>
    </div>
  );
};

export default RoutePlanningScreen;