import { useEffect, useRef, useCallback } from 'react';
import { StreetViewPerformanceOptions } from '../types/streetview.types';

interface UseStreetViewPerformanceOptions {
  options?: StreetViewPerformanceOptions;
  onPerformanceUpdate?: (metrics: PerformanceMetrics) => void;
}

interface PerformanceMetrics {
  fps: number;
  renderTime: number;
  memoryUsage: number;
  quality: 'low' | 'medium' | 'high' | 'auto';
  webGLEnabled: boolean;
  hardwareAcceleration: boolean;
  devicePerformance: 'low' | 'medium' | 'high';
}

const defaultOptions: StreetViewPerformanceOptions = {
  preloadAdjacent: false,
  cacheSize: 50,
  quality: 'auto',
  enableWebGL: true,
  hardwareAcceleration: true,
};

export const useStreetViewPerformance = ({
  options = {},
  onPerformanceUpdate,
}: UseStreetViewPerformanceOptions = {}) => {
  const mergedOptions = { ...defaultOptions, ...options };
  const metricsRef = useRef<PerformanceMetrics>({
    fps: 60,
    renderTime: 0,
    memoryUsage: 0,
    quality: mergedOptions.quality,
    webGLEnabled: false,
    hardwareAcceleration: false,
    devicePerformance: 'medium',
  });

  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());
  const animationFrameRef = useRef<number>();

  // Detect device performance capabilities
  const detectDevicePerformance = useCallback((): 'low' | 'medium' | 'high' => {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

    // Check WebGL support
    if (!gl) {
      return 'low';
    }

    // Get renderer info
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    if (debugInfo) {
      const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);

      // Detect high-end GPUs
      if (renderer.includes('NVIDIA') || renderer.includes('AMD') || renderer.includes('Radeon')) {
        return 'high';
      }

      // Detect integrated or mobile GPUs
      if (renderer.includes('Intel') || renderer.includes('Mali') || renderer.includes('Adreno')) {
        return 'medium';
      }
    }

    // Check for hardware acceleration hints
    const memory = (navigator as any).deviceMemory;
    const cores = navigator.hardwareConcurrency;

    if (memory && memory >= 8 && cores && cores >= 8) {
      return 'high';
    } else if (memory && memory >= 4 && cores && cores >= 4) {
      return 'medium';
    }

    return 'low';
  }, []);

  // Check WebGL support
  const checkWebGLSupport = useCallback((): boolean => {
    try {
      const canvas = document.createElement('canvas');
      return !!(
        window.WebGLRenderingContext &&
        (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
      );
    } catch (e) {
      return false;
    }
  }, []);

  // Check hardware acceleration
  const checkHardwareAcceleration = useCallback((): boolean => {
    // Check for CSS 3D transforms support
    const el = document.createElement('div');
    el.style.transform = 'translateZ(0)';
    return el.style.transform !== '';
  }, []);

  // Monitor FPS
  const monitorFPS = useCallback(() => {
    const now = performance.now();
    const delta = now - lastTimeRef.current;
    frameCountRef.current++;

    if (delta >= 1000) {
      const fps = Math.round((frameCountRef.current * 1000) / delta);
      metricsRef.current.fps = fps;

      frameCountRef.current = 0;
      lastTimeRef.current = now;

      // Adjust quality based on FPS
      if (mergedOptions.quality === 'auto') {
        if (fps < 30) {
          metricsRef.current.quality = 'low';
        } else if (fps < 45) {
          metricsRef.current.quality = 'medium';
        } else {
          metricsRef.current.quality = 'high';
        }
      }

      onPerformanceUpdate?.(metricsRef.current);
    }

    animationFrameRef.current = requestAnimationFrame(monitorFPS);
  }, [mergedOptions.quality, onPerformanceUpdate]);

  // Monitor memory usage
  const monitorMemory = useCallback(() => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      const usedMemory = Math.round(memory.usedJSHeapSize / 1048576); // Convert to MB
      metricsRef.current.memoryUsage = usedMemory;

      // Adjust cache size based on memory usage
      if (usedMemory > 200 && mergedOptions.cacheSize > 20) {
        mergedOptions.cacheSize = Math.max(20, mergedOptions.cacheSize - 10);
      }
    }
  }, [mergedOptions]);

  // Optimize panorama for performance
  const optimizeForPerformance = useCallback((panorama: any) => {
    if (!panorama) return;

    const devicePerformance = metricsRef.current.devicePerformance;
    const quality = metricsRef.current.quality;

    // Apply performance optimizations based on device and quality settings
    const options: any = {};

    switch (quality) {
      case 'low':
        options.motionTracking = false;
        options.motionTrackingControl = false;
        options.scrollwheel = false;
        options.clickToGo = false;
        options.disableDefaultUI = true;
        break;

      case 'medium':
        options.motionTracking = false;
        options.motionTrackingControl = false;
        options.scrollwheel = true;
        options.clickToGo = true;
        options.linksControl = true;
        break;

      case 'high':
        options.motionTracking = true;
        options.motionTrackingControl = true;
        options.scrollwheel = true;
        options.clickToGo = true;
        options.linksControl = true;
        options.imageDateControl = true;
        break;

      case 'auto':
        // Let the system decide based on performance metrics
        break;
    }

    // Device-specific optimizations
    if (devicePerformance === 'low') {
      options.zoomControl = false;
      options.panControl = false;
      options.addressControl = false;
    }

    // Apply WebGL settings
    if (mergedOptions.enableWebGL && checkWebGLSupport()) {
      options.mode = 'webgl';
      metricsRef.current.webGLEnabled = true;
    } else {
      options.mode = 'html5';
      metricsRef.current.webGLEnabled = false;
    }

    panorama.setOptions(options);
  }, [checkWebGLSupport, mergedOptions.enableWebGL]);

  // Initialize performance monitoring
  useEffect(() => {
    // Detect device capabilities
    metricsRef.current.devicePerformance = detectDevicePerformance();
    metricsRef.current.webGLEnabled = checkWebGLSupport();
    metricsRef.current.hardwareAcceleration = checkHardwareAcceleration();

    // Start FPS monitoring
    animationFrameRef.current = requestAnimationFrame(monitorFPS);

    // Start memory monitoring
    const memoryInterval = setInterval(monitorMemory, 5000);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      clearInterval(memoryInterval);
    };
  }, [detectDevicePerformance, checkWebGLSupport, checkHardwareAcceleration, monitorFPS, monitorMemory]);

  // Preload adjacent panoramas
  const preloadAdjacentPanoramas = useCallback((currentPano: string, links: any[], panoramaService: any) => {
    if (!mergedOptions.preloadAdjacent || !links || links.length === 0) return;

    // Preload up to 3 adjacent panoramas
    const preloadCount = Math.min(3, links.length);

    for (let i = 0; i < preloadCount; i++) {
      const link = links[i];
      if (link.pano && link.pano !== currentPano) {
        // Preload the panorama data
        panoramaService.getPanorama({ pano: link.pano }, () => {
          // Preloaded successfully
        });
      }
    }
  }, [mergedOptions.preloadAdjacent]);

  // Clear cache
  const clearCache = useCallback(() => {
    // In a real implementation, this would clear the panorama cache
    // For now, we'll just reset cache size
    if (mergedOptions.cacheSize > 0) {
      mergedOptions.cacheSize = Math.floor(mergedOptions.cacheSize / 2);
    }
  }, [mergedOptions.cacheSize]);

  // Update performance options
  const updatePerformanceOptions = useCallback((newOptions: Partial<StreetViewPerformanceOptions>) => {
    Object.assign(mergedOptions, newOptions);

    // Update metrics
    if (newOptions.quality) {
      metricsRef.current.quality = newOptions.quality;
    }
    if (newOptions.enableWebGL !== undefined) {
      metricsRef.current.webGLEnabled = newOptions.enableWebGL && checkWebGLSupport();
    }
  }, [checkWebGLSupport]);

  // Get current metrics
  const getMetrics = useCallback(() => {
    return { ...metricsRef.current };
  }, []);

  // Force quality setting
  const setQuality = useCallback((quality: 'low' | 'medium' | 'high' | 'auto') => {
    metricsRef.current.quality = quality;
    mergedOptions.quality = quality;
    onPerformanceUpdate?.(metricsRef.current);
  }, [onPerformanceUpdate]);

  return {
    metrics: metricsRef.current,
    optimizeForPerformance,
    preloadAdjacentPanoramas,
    clearCache,
    updatePerformanceOptions,
    getMetrics,
    setQuality,
    devicePerformance: metricsRef.current.devicePerformance,
    webGLEnabled: metricsRef.current.webGLEnabled,
    hardwareAcceleration: metricsRef.current.hardwareAcceleration,
  };
};