import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Compass,
  Navigation,
  ZoomIn,
  ZoomOut,
  Move,
  RotateCw,
  RotateCcw,
  Maximize2,
  Minimize2,
  Settings,
  X,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Ruler,
  History,
  Share2,
  Eye,
  EyeOff,
} from 'lucide-react';

import { StreetViewControlOptions } from '../../types/streetview.types';
import { StreetViewCompass } from './StreetViewCompass';
import { StreetViewMeasurementTools } from './StreetViewMeasurementTools';
import { StreetViewHistory } from './StreetViewHistory';
import { StreetViewShare } from './StreetViewShare';

interface StreetViewControlsProps {
  onMoveForward: () => void;
  onMoveBackward: () => void;
  onTurnLeft: () => void;
  onTurnRight: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onToggleFullscreen: () => void;
  onToggleControls: () => void;
  onExit?: () => void;
  isFullscreen: boolean;
  currentZoom: number;
  showCompass?: boolean;
  showMeasurement?: boolean;
  showHistory?: boolean;
  showShare?: boolean;
  className?: string;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  options?: StreetViewControlOptions;
}

export const StreetViewControls: React.FC<StreetViewControlsProps> = ({
  onMoveForward,
  onMoveBackward,
  onTurnLeft,
  onTurnRight,
  onZoomIn,
  onZoomOut,
  onToggleFullscreen,
  onToggleControls,
  onExit,
  isFullscreen,
  currentZoom,
  showCompass = true,
  showMeasurement = true,
  showHistory = true,
  showShare = true,
  className = '',
  position = 'bottom-left',
  options = {
    showZoomControls: true,
    showPanControls: true,
    showMovementControls: true,
    showCompass: true,
    showInfoPanel: true,
    showMeasurementTools: true,
    position: 'bottom-left',
  },
}) => {
  const [showAdvancedControls, setShowAdvancedControls] = useState(false);
  const [showMeasurementTools, setShowMeasurementTools] = useState(false);
  const [showHistoryPanel, setShowHistoryPanel] = useState(false);
  const [showSharePanel, setShowSharePanel] = useState(false);

  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4',
  };

  const handleMeasurementToggle = useCallback(() => {
    setShowMeasurementTools(prev => !prev);
    setShowHistoryPanel(false);
    setShowSharePanel(false);
  }, []);

  const handleHistoryToggle = useCallback(() => {
    setShowHistoryPanel(prev => !prev);
    setShowMeasurementTools(false);
    setShowSharePanel(false);
  }, []);

  const handleShareToggle = useCallback(() => {
    setShowSharePanel(prev => !prev);
    setShowMeasurementTools(false);
    setShowHistoryPanel(false);
  }, []);

  const closeAllPanels = useCallback(() => {
    setShowMeasurementTools(false);
    setShowHistoryPanel(false);
    setShowSharePanel(false);
    setShowAdvancedControls(false);
  }, []);

  return (
    <motion.div
      className={`absolute ${positionClasses[position]} ${className}`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
    >
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Main Controls */}
        <div className="flex flex-col gap-2 p-2">
          {/* Movement Controls */}
          {options.showMovementControls && (
            <div className="flex flex-col items-center gap-1">
              <button
                onClick={onMoveForward}
                className="p-2 hover:bg-gray-100 rounded transition-colors"
                title="Move Forward (W/↑)"
              >
                <ChevronUp className="w-5 h-5 text-gray-700" />
              </button>

              <div className="flex gap-1">
                <button
                  onClick={onTurnLeft}
                  className="p-2 hover:bg-gray-100 rounded transition-colors"
                  title="Turn Left (A/←)"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-700" />
                </button>

                <button
                  onClick={onMoveBackward}
                  className="p-2 hover:bg-gray-100 rounded transition-colors"
                  title="Move Backward (S/↓)"
                >
                  <ChevronDown className="w-5 h-5 text-gray-700" />
                </button>

                <button
                  onClick={onTurnRight}
                  className="p-2 hover:bg-gray-100 rounded transition-colors"
                  title="Turn Right (D/→)"
                >
                  <ChevronRight className="w-5 h-5 text-gray-700" />
                </button>
              </div>
            </div>
          )}

          {/* Zoom Controls */}
          {options.showZoomControls && (
            <div className="flex flex-col gap-1">
              <button
                onClick={onZoomIn}
                className="p-2 hover:bg-gray-100 rounded transition-colors"
                title="Zoom In (+/=)"
              >
                <ZoomIn className="w-5 h-5 text-gray-700" />
              </button>

              <div className="text-xs text-center text-gray-600 font-medium">
                {Math.round(currentZoom * 100)}%
              </div>

              <button
                onClick={onZoomOut}
                className="p-2 hover:bg-gray-100 rounded transition-colors"
                title="Zoom Out (-/_)"
              >
                <ZoomOut className="w-5 h-5 text-gray-700" />
              </button>
            </div>
          )}

          {/* Pan Controls */}
          {options.showPanControls && (
            <div className="flex flex-col gap-1">
              <button
                onClick={onTurnLeft}
                className="p-2 hover:bg-gray-100 rounded transition-colors"
                title="Rotate Left (Q)"
              >
                <RotateCcw className="w-5 h-5 text-gray-700" />
              </button>

              <button
                onClick={onTurnRight}
                className="p-2 hover:bg-gray-100 rounded transition-colors"
                title="Rotate Right (E)"
              >
                <RotateCw className="w-5 h-5 text-gray-700" />
              </button>
            </div>
          )}

          {/* Compass */}
          {showCompass && options.showCompass && (
            <div className="mt-2">
              <StreetViewCompass className="w-16 h-16" />
            </div>
          )}
        </div>

        {/* Advanced Controls Toggle */}
        <div className="border-t border-gray-200 p-2">
          <button
            onClick={() => setShowAdvancedControls(!showAdvancedControls)}
            className="w-full p-2 hover:bg-gray-100 rounded transition-colors flex items-center justify-center gap-2"
          >
            <Settings className="w-4 h-4 text-gray-700" />
            <span className="text-sm text-gray-700">Advanced</span>
          </button>
        </div>

        {/* Advanced Controls Panel */}
        <AnimatePresence>
          {showAdvancedControls && (
            <motion.div
              className="border-t border-gray-200 p-2"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex flex-col gap-2">
                {/* Measurement Tools */}
                {showMeasurement && options.showMeasurementTools && (
                  <button
                    onClick={handleMeasurementToggle}
                    className={`p-2 rounded transition-colors flex items-center justify-center gap-2 ${
                      showMeasurementTools ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <Ruler className="w-4 h-4" />
                    <span className="text-sm">Measure</span>
                  </button>
                )}

                {/* History */}
                {showHistory && (
                  <button
                    onClick={handleHistoryToggle}
                    className={`p-2 rounded transition-colors flex items-center justify-center gap-2 ${
                      showHistoryPanel ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <History className="w-4 h-4" />
                    <span className="text-sm">History</span>
                  </button>
                )}

                {/* Share */}
                {showShare && (
                  <button
                    onClick={handleShareToggle}
                    className={`p-2 rounded transition-colors flex items-center justify-center gap-2 ${
                      showSharePanel ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <Share2 className="w-4 h-4" />
                    <span className="text-sm">Share</span>
                  </button>
                )}

                {/* Fullscreen */}
                <button
                  onClick={onToggleFullscreen}
                  className="p-2 hover:bg-gray-100 rounded transition-colors flex items-center justify-center gap-2 text-gray-700"
                >
                  {isFullscreen ? (
                    <>
                      <Minimize2 className="w-4 h-4" />
                      <span className="text-sm">Exit Fullscreen</span>
                    </>
                  ) : (
                    <>
                      <Maximize2 className="w-4 h-4" />
                      <span className="text-sm">Fullscreen</span>
                    </>
                  )}
                </button>

                {/* Hide/Show Controls */}
                <button
                  onClick={onToggleControls}
                  className="p-2 hover:bg-gray-100 rounded transition-colors flex items-center justify-center gap-2 text-gray-700"
                >
                  <EyeOff className="w-4 h-4" />
                  <span className="text-sm">Hide Controls</span>
                </button>

                {/* Exit */}
                {onExit && (
                  <button
                    onClick={onExit}
                    className="p-2 hover:bg-red-100 rounded transition-colors flex items-center justify-center gap-2 text-red-700"
                  >
                    <X className="w-4 h-4" />
                    <span className="text-sm">Exit</span>
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Measurement Tools Panel */}
      <AnimatePresence>
        {showMeasurementTools && (
          <motion.div
            className="absolute left-full ml-2 top-0"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
          >
            <StreetViewMeasurementTools onClose={closeAllPanels} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* History Panel */}
      <AnimatePresence>
        {showHistoryPanel && (
          <motion.div
            className="absolute left-full ml-2 top-0"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
          >
            <StreetViewHistory onClose={closeAllPanels} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Share Panel */}
      <AnimatePresence>
        {showSharePanel && (
          <motion.div
            className="absolute left-full ml-2 top-0"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
          >
            <StreetViewShare onClose={closeAllPanels} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};