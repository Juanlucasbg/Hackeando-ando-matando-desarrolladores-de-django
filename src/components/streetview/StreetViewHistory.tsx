import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { History, X, Clock, MapPin, Navigation, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';

import { StreetViewPosition } from '../../types/streetview.types';

interface StreetViewHistoryProps {
  onClose?: () => void;
  className?: string;
  initialHistory?: StreetViewPosition[];
  currentIndex?: number;
  onNavigateToIndex?: (index: number) => void;
  onClearHistory?: () => void;
}

export const StreetViewHistory: React.FC<StreetViewHistoryProps> = ({
  onClose,
  className = '',
  initialHistory = [],
  currentIndex = -1,
  onNavigateToIndex,
  onClearHistory,
}) => {
  const [history] = useState<StreetViewPosition[]>(initialHistory);
  const [selectedIndex, setSelectedIndex] = useState(currentIndex);

  const handleNavigateTo = (index: number) => {
    setSelectedIndex(index);
    onNavigateToIndex?.(index);
  };

  const handleGoBack = () => {
    if (selectedIndex > 0) {
      handleNavigateTo(selectedIndex - 1);
    }
  };

  const handleGoForward = () => {
    if (selectedIndex < history.length - 1) {
      handleNavigateTo(selectedIndex + 1);
    }
  };

  const formatPosition = (position: StreetViewPosition): string => {
    return `${position.lat.toFixed(4)}, ${position.lng.toFixed(4)}`;
  };

  const formatPov = (position: StreetViewPosition): string => {
    const heading = position.heading || 0;
    const pitch = position.pitch || 0;
    return `🧭 ${Math.round(heading)}° ↑${Math.round(pitch)}°`;
  };

  const getRelativeTime = (timestamp?: number): string => {
    if (!timestamp) return 'Unknown';

    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <motion.div
      className={`bg-white rounded-lg shadow-lg overflow-hidden ${className}`}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.2 }}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5" />
            <h3 className="font-semibold">Navigation History</h3>
          </div>

          <div className="flex items-center gap-1">
            {history.length > 0 && (
              <button
                onClick={onClearHistory}
                className="p-1 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
                title="Clear history"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

            {onClose && (
              <button
                onClick={onClose}
                className="p-1 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Controls */}
      {history.length > 1 && (
        <div className="p-3 border-b flex items-center justify-between">
          <button
            onClick={handleGoBack}
            disabled={selectedIndex <= 0}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
              selectedIndex > 0
                ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>

          <span className="text-sm text-gray-600">
            {selectedIndex + 1} / {history.length}
          </span>

          <button
            onClick={handleGoForward}
            disabled={selectedIndex >= history.length - 1}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
              selectedIndex < history.length - 1
                ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            Forward
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* History List */}
      <div className="max-h-96 overflow-y-auto">
        {history.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <History className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm">No navigation history yet</p>
            <p className="text-xs mt-1">Your movement history will appear here</p>
          </div>
        ) : (
          <div className="divide-y">
            {history.map((position, index) => (
              <motion.div
                key={index}
                className={`p-3 cursor-pointer transition-colors ${
                  index === selectedIndex
                    ? 'bg-blue-50 border-l-4 border-blue-500'
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => handleNavigateTo(index)}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.02 }}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    index === selectedIndex
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {index + 1}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <MapPin className="w-3 h-3 text-gray-400 flex-shrink-0" />
                      <span className="text-sm font-medium text-gray-900 truncate">
                        {formatPosition(position)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mb-1">
                      <Navigation className="w-3 h-3 text-gray-400 flex-shrink-0" />
                      <span className="text-xs text-gray-600">
                        {formatPov(position)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Clock className="w-3 h-3 text-gray-400 flex-shrink-0" />
                      <span className="text-xs text-gray-500">
                        {getRelativeTime(position.timestamp)}
                      </span>
                    </div>

                    {position.zoom !== undefined && (
                      <div className="mt-1">
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                          Zoom: {Math.round(position.zoom * 100)}%
                        </span>
                      </div>
                    )}
                  </div>

                  {index === selectedIndex && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {history.length > 0 && (
        <div className="p-3 border-t bg-gray-50">
          <div className="text-xs text-gray-600 text-center">
            {history.length} location{history.length !== 1 ? 's' : ''} in history
          </div>
        </div>
      )}
    </motion.div>
  );
};