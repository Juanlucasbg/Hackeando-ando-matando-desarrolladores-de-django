import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Ruler, X, Plus, Trash2, MousePointer, Square, Circle } from 'lucide-react';

import { StreetViewMeasurementPoint } from '../../types/streetview.types';

interface StreetViewMeasurementToolsProps {
  onClose?: () => void;
  className?: string;
  initialPoints?: StreetViewMeasurementPoint[];
  onPointsChange?: (points: StreetViewMeasurementPoint[]) => void;
}

export const StreetViewMeasurementTools: React.FC<StreetViewMeasurementToolsProps> = ({
  onClose,
  className = '',
  initialPoints = [],
  onPointsChange,
}) => {
  const [measurementPoints, setMeasurementPoints] = useState<StreetViewMeasurementPoint[]>(initialPoints);
  const [isAddingPoint, setIsAddingPoint] = useState(false);
  const [selectedTool, setSelectedTool] = useState<'distance' | 'area'>('distance');

  const handleAddPoint = useCallback(() => {
    setIsAddingPoint(true);
    // In a real implementation, this would enable click-to-add mode
    // and wait for user clicks on the panorama
  }, []);

  const handleRemovePoint = useCallback((pointId: string) => {
    const newPoints = measurementPoints.filter(point => point.id !== pointId);
    setMeasurementPoints(newPoints);
    onPointsChange?.(newPoints);
  }, [measurementPoints, onPointsChange]);

  const handleClearAll = useCallback(() => {
    setMeasurementPoints([]);
    onPointsChange?.([]);
  }, [onPointsChange]);

  const calculateDistance = (point1: StreetViewMeasurementPoint, point2: StreetViewMeasurementPoint): number => {
    const R = 6371000; // Earth's radius in meters
    const dLat = (point2.position.lat - point1.position.lat) * Math.PI / 180;
    const dLng = (point2.position.lng - point1.position.lng) * Math.PI / 180;
    const a =
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(point1.position.lat * Math.PI / 180) * Math.cos(point2.position.lat * Math.PI / 180) *
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const calculateTotalDistance = (): number => {
    if (measurementPoints.length < 2) return 0;

    let totalDistance = 0;
    for (let i = 0; i < measurementPoints.length - 1; i++) {
      totalDistance += calculateDistance(measurementPoints[i], measurementPoints[i + 1]);
    }
    return totalDistance;
  };

  const formatDistance = (meters: number): string => {
    if (meters < 1000) {
      return `${meters.toFixed(1)} m`;
    } else {
      return `${(meters / 1000).toFixed(2)} km`;
    }
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
      <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Ruler className="w-5 h-5" />
            <h3 className="font-semibold">Measurement Tools</h3>
          </div>

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

      {/* Tool Selection */}
      <div className="p-3 border-b">
        <div className="flex gap-2">
          <button
            onClick={() => setSelectedTool('distance')}
            className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedTool === 'distance'
                ? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
                : 'bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-200'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <MousePointer className="w-4 h-4" />
              Distance
            </div>
          </button>

          <button
            onClick={() => setSelectedTool('area')}
            className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedTool === 'area'
                ? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
                : 'bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-200'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Square className="w-4 h-4" />
              Area
            </div>
          </button>
        </div>
      </div>

      {/* Instructions */}
      <div className="p-3 bg-blue-50 border-b">
        <p className="text-sm text-blue-800">
          {selectedTool === 'distance'
            ? 'Click on the panorama to add points and measure distances.'
            : 'Click to add points around an area to measure its size.'
          }
        </p>
      </div>

      {/* Points List */}
      <div className="p-3 max-h-64 overflow-y-auto">
        {measurementPoints.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            <Ruler className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm">No measurement points yet</p>
            <p className="text-xs mt-1">Click "Add Point" to start measuring</p>
          </div>
        ) : (
          <div className="space-y-2">
            {measurementPoints.map((point, index) => (
              <motion.div
                key={point.id}
                className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Point {index + 1}
                    </p>
                    <p className="text-xs text-gray-500">
                      {point.position.lat.toFixed(6)}, {point.position.lng.toFixed(6)}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleRemovePoint(point.id)}
                  className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Measurement Results */}
      {measurementPoints.length > 0 && (
        <div className="p-3 border-t bg-gray-50">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Distance:</span>
              <span className="text-sm font-medium text-gray-900">
                {formatDistance(calculateTotalDistance())}
              </span>
            </div>

            {measurementPoints.length > 2 && selectedTool === 'area' && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Area:</span>
                <span className="text-sm font-medium text-gray-900">
                  {/* Area calculation would be implemented here */}
                  N/A
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="p-3 border-t space-y-2">
        <button
          onClick={handleAddPoint}
          className={`w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
            isAddingPoint
              ? 'bg-green-500 text-white'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
        >
          <Plus className="w-4 h-4" />
          {isAddingPoint ? 'Click on Panorama' : 'Add Point'}
        </button>

        {measurementPoints.length > 0 && (
          <button
            onClick={handleClearAll}
            className="w-full px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Clear All
          </button>
        )}
      </div>

      {/* Click Mode Indicator */}
      <AnimatePresence>
        {isAddingPoint && (
          <motion.div
            className="absolute top-full left-0 right-0 mt-2 bg-green-500 text-white px-3 py-2 rounded-lg text-sm text-center"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            Click on the panorama to add a measurement point
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};