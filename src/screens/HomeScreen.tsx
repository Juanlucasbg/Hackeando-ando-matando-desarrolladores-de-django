import React from 'react';
import { MapContainer, GoogleMap, MapControls } from '../components/map';
import { SearchBar } from '../components/search';
import { useMapStore } from '../stores/mapStore';
import { useSearchStore } from '../stores/searchStore';

export const HomeScreen: React.FC = () => {
  const { isMapLoaded } = useMapStore();
  const { searchResults, isSearching } = useSearchStore();

  return (
    <div className="h-screen w-full relative">
      {/* Search Bar Overlay */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 w-full max-w-2xl px-4">
        <SearchBar />
      </div>

      {/* Map Container */}
      <div className="h-full w-full">
        <MapContainer />
      </div>

      {/* Map Controls */}
      {isMapLoaded && (
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10">
          <MapControls />
        </div>
      )}

      {/* Search Results Overlay */}
      {searchResults.length > 0 && (
        <div className="absolute bottom-4 left-4 z-10 bg-white rounded-lg shadow-lg p-4 max-w-sm">
          <h3 className="font-semibold mb-2">Search Results</h3>
          {isSearching ? (
            <div className="text-gray-500">Searching...</div>
          ) : (
            <div className="space-y-2">
              {searchResults.slice(0, 5).map((result, index) => (
                <div key={index} className="text-sm p-2 hover:bg-gray-100 rounded cursor-pointer">
                  <div className="font-medium">{result.name}</div>
                  <div className="text-gray-600">{result.address}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default HomeScreen;