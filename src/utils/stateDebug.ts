import { AppState, DebugInfo, StoreAction } from '../types';
import { useMapStore, useSearchStore, useUIStore, useUserStore, useDebugStore } from '../stores';

// State debugging utilities
export class StateDebugger {
  private static instance: StateDebugger;
  private isEnabled: boolean = process.env.NODE_ENV === 'development';
  private actionHistory: StoreAction[] = [];
  private stateHistory: AppState[] = [];
  private performanceMetrics: Map<string, number[]> = new Map();
  private maxHistorySize: number = 100;

  private constructor() {
    this.setupGlobalDebugger();
  }

  public static getInstance(): StateDebugger {
    if (!StateDebugger.instance) {
      StateDebugger.instance = new StateDebugger();
    }
    return StateDebugger.instance;
  }

  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    if (enabled) {
      console.log('🔍 State debugger enabled');
    } else {
      console.log('🔍 State debugger disabled');
    }
  }

  public logAction(action: StoreAction, state: AppState, executionTime: number = 0): void {
    if (!this.isEnabled) return;

    const actionEntry = {
      ...action,
      timestamp: Date.now(),
    };

    this.actionHistory.push(actionEntry);
    this.stateHistory.push({ ...state });

    // Limit history size
    if (this.actionHistory.length > this.maxHistorySize) {
      this.actionHistory = this.actionHistory.slice(-this.maxHistorySize);
    }
    if (this.stateHistory.length > this.maxHistorySize) {
      this.stateHistory = this.stateHistory.slice(-this.maxHistorySize);
    }

    // Track performance metrics
    if (!this.performanceMetrics.has(action.type)) {
      this.performanceMetrics.set(action.type, []);
    }
    const metrics = this.performanceMetrics.get(action.type)!;
    metrics.push(executionTime);

    // Keep only last 50 metrics per action
    if (metrics.length > 50) {
      metrics.splice(0, metrics.length - 50);
    }

    // Log action details
    console.group(`🎯 Action: ${action.type}`);
    console.log('Payload:', action.payload);
    console.log('Execution time:', `${executionTime.toFixed(2)}ms`);
    console.log('State snapshot:', this.createStateSnapshot(state));
    console.groupEnd();

    // Update debug store
    this.updateDebugStore(action, state, executionTime);
  }

  public getStateHistory(): AppState[] {
    return [...this.stateHistory];
  }

  public getActionHistory(): StoreAction[] {
    return [...this.actionHistory];
  }

  public getPerformanceMetrics(): Map<string, number[]> {
    return new Map(this.performanceMetrics);
  }

  public getActionStats(actionType: string): {
    count: number;
    averageTime: number;
    minTime: number;
    maxTime: number;
  } | null {
    const metrics = this.performanceMetrics.get(actionType);
    if (!metrics || metrics.length === 0) return null;

    const sum = metrics.reduce((acc, time) => acc + time, 0);
    const average = sum / metrics.length;
    const min = Math.min(...metrics);
    const max = Math.max(...metrics);

    return {
      count: metrics.length,
      averageTime: average,
      minTime: min,
      maxTime: max,
    };
  }

  public getAllActionStats(): Map<string, ReturnType<StateDebugger['getActionStats']>> {
    const stats = new Map();

    for (const actionType of this.performanceMetrics.keys()) {
      const actionStats = this.getActionStats(actionType);
      if (actionStats) {
        stats.set(actionType, actionStats);
      }
    }

    return stats;
  }

  public compareStates(index1: number, index2: number): {
    state1: AppState;
    state2: AppState;
    differences: Array<{
      path: string;
      oldValue: any;
      newValue: any;
    }>;
  } | null {
    if (index1 < 0 || index1 >= this.stateHistory.length ||
        index2 < 0 || index2 >= this.stateHistory.length) {
      return null;
    }

    const state1 = this.stateHistory[index1];
    const state2 = this.stateHistory[index2];
    const differences = this.compareObjects(state1, state2, '');

    return {
      state1,
      state2,
      differences,
    };
  }

  public exportDebugData(): {
    timestamp: string;
    actionHistory: StoreAction[];
    stateHistory: AppState[];
    performanceMetrics: Record<string, number[]>;
    systemInfo: {
      userAgent: string;
      viewport: { width: number; height: number };
      memory?: any;
    };
  } {
    return {
      timestamp: new Date().toISOString(),
      actionHistory: this.actionHistory,
      stateHistory: this.stateHistory,
      performanceMetrics: Object.fromEntries(this.performanceMetrics),
      systemInfo: {
        userAgent: navigator.userAgent,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight,
        },
        memory: (performance as any).memory,
      },
    };
  }

  public importDebugData(data: ReturnType<StateDebugger['exportDebugData']>): void {
    this.actionHistory = data.actionHistory;
    this.stateHistory = data.stateHistory;
    this.performanceMetrics = new Map(
      Object.entries(data.performanceMetrics).map(([key, value]) => [key, value])
    );

    console.log('🔍 Debug data imported successfully');
  }

  public clearHistory(): void {
    this.actionHistory = [];
    this.stateHistory = [];
    this.performanceMetrics.clear();
    console.log('🔍 Debug history cleared');
  }

  private createStateSnapshot(state: AppState): any {
    return {
      map: {
        center: state.map.center,
        zoom: state.map.zoom,
        markerCount: state.map.markers.length,
        isLoading: state.map.isLoading,
        error: state.map.error,
      },
      search: {
        query: state.search.query,
        resultCount: state.search.results.length,
        historyCount: state.search.history.length,
        isLoading: state.search.isLoading,
        error: state.search.error,
      },
      ui: {
        sidebarOpen: state.ui.sidebarOpen,
        activeModal: state.ui.activeModal,
        notificationCount: state.ui.notifications.length,
        theme: state.ui.theme,
      },
      user: {
        isLoggedIn: state.user.isLoggedIn,
        hasProfile: !!state.user.profile,
        hasLocationPermission: state.user.geolocation.permission === 'granted',
      },
    };
  }

  private compareObjects(obj1: any, obj2: any, path: string): Array<{
    path: string;
    oldValue: any;
    newValue: any;
  }> {
    const differences: Array<{ path: string; oldValue: any; newValue: any }> = [];

    const keys = new Set([...Object.keys(obj1), ...Object.keys(obj2)]);

    for (const key of keys) {
      const currentPath = path ? `${path}.${key}` : key;
      const value1 = obj1[key];
      const value2 = obj2[key];

      if (value1 === value2) continue;

      if (typeof value1 === 'object' && typeof value2 === 'object' &&
          value1 !== null && value2 !== null && !Array.isArray(value1) && !Array.isArray(value2)) {
        differences.push(...this.compareObjects(value1, value2, currentPath));
      } else {
        differences.push({
          path: currentPath,
          oldValue: value1,
          newValue: value2,
        });
      }
    }

    return differences;
  }

  private updateDebugStore(action: StoreAction, state: AppState, executionTime: number): void {
    const debugStore = useDebugStore.getState();

    debugStore.updateDebugInfo({
      store: {
        version: '1.0.0',
        lastAction: action,
        actionHistory: this.actionHistory.slice(-10),
        stateHistory: this.stateHistory.slice(-10),
        performance: {
          lastUpdate: Date.now(),
          updateTime: executionTime,
          renderCount: this.actionHistory.length,
        },
      },
      environment: {
        userAgent: navigator.userAgent,
        viewport: { width: window.innerWidth, height: window.innerHeight },
        connection: (navigator as any).connection ? {
          effectiveType: (navigator as any).connection.effectiveType,
          downlink: (navigator as any).connection.downlink,
          rtt: (navigator as any).connection.rtt,
        } : null,
      },
    });
  }

  private setupGlobalDebugger(): void {
    if (!this.isEnabled) return;

    // Attach debugger to window for easy access in console
    (window as any).__stateDebugger = this;

    // Add keyboard shortcuts for debugging
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!event.ctrlKey || !event.shiftKey) return;

      switch (event.key) {
        case 'd':
          event.preventDefault();
          this.toggleDebugger();
          break;
        case 'e':
          event.preventDefault();
          this.exportDebugData();
          break;
        case 'c':
          event.preventDefault();
          this.clearHistory();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    console.log(`
🔍 State Debugger Active!
Keyboard shortcuts:
  Ctrl+Shift+D - Toggle debugger visibility
  Ctrl+Shift+E - Export debug data
  Ctrl+Shift+C - Clear debug history

Access debugger via: window.__stateDebugger
    `);
  }

  private toggleDebugger(): void {
    // Implementation for showing/hiding debug UI
    console.log('🔍 Debugger visibility toggled');
    // In a real implementation, this would show/hide a debug overlay
  }
}

// Convenience functions
export const logStateAction = (action: StoreAction, state: AppState, executionTime: number = 0): void => {
  StateDebugger.getInstance().logAction(action, state, executionTime);
};

export const getStateHistory = (): AppState[] => {
  return StateDebugger.getInstance().getStateHistory();
};

export const getActionHistory = (): StoreAction[] => {
  return StateDebugger.getInstance().getActionHistory();
};

export const getPerformanceMetrics = (): Map<string, number[]> => {
  return StateDebugger.getInstance().getPerformanceMetrics();
};

export const exportDebugData = (): ReturnType<StateDebugger['exportDebugData']> => {
  return StateDebugger.getInstance().exportDebugData();
};

export const clearDebugHistory = (): void => {
  StateDebugger.getInstance().clearHistory();
};

// Hook for debugging
export const useStateDebug = () => {
  const debugger = StateDebugger.getInstance();

  return {
    isEnabled: debugger.isEnabled,
    setEnabled: debugger.setEnabled.bind(debugger),
    getStateHistory: debugger.getStateHistory.bind(debugger),
    getActionHistory: debugger.getActionHistory.bind(debugger),
    getPerformanceMetrics: debugger.getPerformanceMetrics.bind(debugger),
    getActionStats: debugger.getActionStats.bind(debugger),
    getAllActionStats: debugger.getAllActionStats.bind(debugger),
    compareStates: debugger.compareStates.bind(debugger),
    exportData: debugger.exportDebugData.bind(debugger),
    importData: debugger.importDebugData.bind(debugger),
    clearHistory: debugger.clearHistory.bind(debugger),
  };
};

// Performance monitoring decorator
export function withPerformanceMonitoring<T extends (...args: any[]) => any>(
  fn: T,
  name: string
): T {
  return ((...args: Parameters<T>) => {
    const startTime = performance.now();
    const result = fn(...args);
    const endTime = performance.now();
    const executionTime = endTime - startTime;

    if (executionTime > 16) { // Log if takes more than one frame (16ms at 60fps)
      console.warn(`⚠️ Slow function detected: ${name} took ${executionTime.toFixed(2)}ms`);
    }

    StateDebugger.getInstance().logAction(
      { type: `function/${name}`, payload: { args } },
      {} as AppState, // Placeholder since we don't have access to state here
      executionTime
    );

    return result;
  }) as T;
}

// Store inspector
export class StoreInspector {
  public static inspectAllStores(): void {
    const mapStore = useMapStore.getState();
    const searchStore = useSearchStore.getState();
    const uiStore = useUIStore.getState();
    const userStore = useUserStore.getState();

    console.group('🔍 Store Inspector');

    console.group('Map Store');
    console.log('Center:', mapStore.center);
    console.log('Zoom:', mapStore.zoom);
    console.log('Markers:', mapStore.markers.length);
    console.log('Loading:', mapStore.isLoading);
    console.log('Error:', mapStore.error);
    console.groupEnd();

    console.group('Search Store');
    console.log('Query:', searchStore.query);
    console.log('Results:', searchStore.results.length);
    console.log('History:', searchStore.history.length);
    console.log('Loading:', searchStore.isLoading);
    console.log('Error:', searchStore.error);
    console.groupEnd();

    console.group('UI Store');
    console.log('Theme:', uiStore.theme);
    console.log('Sidebar Open:', uiStore.sidebarOpen);
    console.log('Active Modal:', uiStore.activeModal);
    console.log('Notifications:', uiStore.notifications.length);
    console.groupEnd();

    console.group('User Store');
    console.log('Logged In:', userStore.isLoggedIn);
    console.log('Has Profile:', !!userStore.profile);
    console.log('Location Permission:', userStore.geolocation.permission);
    console.log('Stats:', userStore.stats);
    console.groupEnd();

    console.groupEnd();
  }

  public static inspectStore(storeName: 'map' | 'search' | 'ui' | 'user'): void {
    const stores = {
      map: useMapStore.getState(),
      search: useSearchStore.getState(),
      ui: useUIStore.getState(),
      user: useUserStore.getState(),
    };

    const store = stores[storeName];
    if (!store) {
      console.error(`Unknown store: ${storeName}`);
      return;
    }

    console.group(`🔍 ${storeName.charAt(0).toUpperCase() + storeName.slice(1)} Store`);
    console.log(store);
    console.groupEnd();
  }
}

export default StateDebugger;