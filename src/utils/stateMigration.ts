import { AppState, StateMigration, UserPreferences, GeolocationState } from '../types';

// Version history
export const STATE_VERSIONS = {
  '1.0.0': 'Initial state structure',
  '1.1.0': 'Added search history and user stats',
  '1.2.0': 'Enhanced map layers and street view',
  '1.3.0': 'Added geolocation permissions and UI breakpoints',
  '2.0.0': 'Current version with full TypeScript support',
} as const;

// Migration from 1.0.0 to 1.1.0
const migrateFrom1_0_0: StateMigration = {
  version: '1.1.0',
  migrate: (state: any): AppState => {
    const oldState = state as any;

    return {
      map: {
        center: oldState.center || { lat: 40.7128, lng: -74.0060 },
        zoom: oldState.zoom || 12,
        bounds: oldState.bounds || null,
        markers: oldState.markers || [],
        selectedLocation: oldState.selectedLocation || null,
        isLoading: oldState.isLoading || false,
        error: oldState.error || null,
        streetView: {
          visible: oldState.streetView?.visible || false,
          position: oldState.streetView?.position || null,
          pov: oldState.streetView?.pov || { heading: 165, pitch: 0 },
          zoom: oldState.streetView?.zoom || 1,
        },
        layers: [
          { id: 'traffic', name: 'Traffic', type: 'traffic', visible: false },
          { id: 'transit', name: 'Transit', type: 'transit', visible: false },
          { id: 'bicycling', name: 'Bicycling', type: 'bicycling', visible: false },
        ],
        mapType: oldState.mapType || google.maps.MapTypeId.ROADMAP,
        gestureHandling: oldState.gestureHandling || 'auto',
        isFullscreen: false,
      },
      search: {
        query: oldState.search?.query || '',
        predictions: oldState.search?.predictions || [],
        results: oldState.search?.results || [],
        selectedLocation: oldState.search?.selectedLocation || null,
        isLoading: oldState.search?.isLoading || false,
        error: oldState.search?.error || null,
        history: [],
        isSearching: false,
        lastSearchTime: null,
      },
      ui: {
        sidebarOpen: oldState.ui?.sidebarOpen ?? true,
        sidebarTab: oldState.ui?.sidebarTab || 'search',
        activeModal: oldState.ui?.activeModal || null,
        loading: oldState.ui?.loading || false,
        theme: oldState.ui?.theme || 'system',
        notifications: [],
        tooltips: oldState.ui?.tooltips || {},
        breakpoints: {
          mobile: false,
          tablet: false,
          desktop: true,
        },
      },
      user: {
        preferences: oldState.user?.preferences || {
          theme: 'system',
          language: 'en',
          units: 'metric',
          mapType: google.maps.MapTypeId.ROADMAP,
          defaultZoom: 12,
          enableLocation: true,
          enableNotifications: true,
          autoSaveSearch: true,
          showTraffic: false,
          showTransit: false,
          gestureHandling: 'auto',
        },
        geolocation: {
          currentPosition: null,
          accuracy: null,
          heading: null,
          speed: null,
          timestamp: null,
          isWatching: false,
          error: null,
          permission: 'prompt',
        },
        isLoggedIn: oldState.user?.isLoggedIn || false,
        profile: oldState.user?.profile || null,
        stats: {
          totalSearches: 0,
          totalMarkers: 0,
          favoritePlaces: 0,
          lastActive: null,
        },
      },
    };
  },
};

// Migration from 1.1.0 to 1.2.0
const migrateFrom1_1_0: StateMigration = {
  version: '1.2.0',
  migrate: (state: any): AppState => {
    const oldState = state as AppState;

    return {
      ...oldState,
      map: {
        ...oldState.map,
        layers: oldState.map.layers.map(layer => ({
          ...layer,
          options: layer.type === 'traffic' ? { refreshInterval: 30000 } : undefined,
        })),
      },
    };
  },
};

// Migration from 1.2.0 to 1.3.0
const migrateFrom1_2_0: StateMigration = {
  version: '1.3.0',
  migrate: (state: any): AppState => {
    const oldState = state as AppState;

    return {
      ...oldState,
      ui: {
        ...oldState.ui,
        breakpoints: {
          mobile: window.innerWidth < 768,
          tablet: window.innerWidth >= 768 && window.innerWidth < 1024,
          desktop: window.innerWidth >= 1024,
        },
      },
      user: {
        ...oldState.user,
        geolocation: {
          ...oldState.user.geolocation,
          permission: (oldState.user.geolocation as any).permission || 'prompt',
        },
      },
    };
  },
};

// Migration from 1.3.0 to 2.0.0
const migrateFrom1_3_0: StateMigration = {
  version: '2.0.0',
  migrate: (state: any): AppState => {
    const oldState = state as AppState;

    // Ensure all timestamps are Date objects
    const ensureDate = (timestamp: any): Date | null => {
      if (!timestamp) return null;
      return timestamp instanceof Date ? timestamp : new Date(timestamp);
    };

    return {
      ...oldState,
      search: {
        ...oldState.search,
        history: oldState.search.history.map(item => ({
          ...item,
          timestamp: ensureDate(item.timestamp) || new Date(),
        })),
      },
      ui: {
        ...oldState.ui,
        notifications: oldState.ui.notifications.map(notification => ({
          ...notification,
          timestamp: ensureDate(notification.timestamp) || new Date(),
        })),
      },
      user: {
        ...oldState.user,
        geolocation: {
          ...oldState.user.geolocation,
          timestamp: oldState.user.geolocation.timestamp,
        },
        stats: {
          ...oldState.user.stats,
          lastActive: ensureDate(oldState.user.stats.lastActive),
        },
      },
    };
  },
};

// Migration manager
export class StateMigrationManager {
  private static instance: StateMigrationManager;
  private migrations: Map<string, StateMigration> = new Map();
  private currentVersion: string = '2.0.0';

  private constructor() {
    this.setupMigrations();
  }

  public static getInstance(): StateMigrationManager {
    if (!StateMigrationManager.instance) {
      StateMigrationManager.instance = new StateMigrationManager();
    }
    return StateMigrationManager.instance;
  }

  private setupMigrations(): void {
    this.migrations.set('1.1.0', migrateFrom1_0_0);
    this.migrations.set('1.2.0', migrateFrom1_1_0);
    this.migrations.set('1.3.0', migrateFrom1_2_0);
    this.migrations.set('2.0.0', migrateFrom1_3_0);
  }

  public getCurrentVersion(): string {
    return this.currentVersion;
  }

  public setCurrentVersion(version: string): void {
    this.currentVersion = version;
  }

  public getAvailableVersions(): string[] {
    return Array.from(this.migrations.keys()).sort();
  }

  public needsMigration(stateVersion: string): boolean {
    return stateVersion !== this.currentVersion;
  }

  public migrate(state: any, fromVersion?: string): AppState {
    let currentState = state;
    let currentVersion = fromVersion || this.detectVersion(state) || '1.0.0';

    console.log(`Starting state migration from ${currentVersion} to ${this.currentVersion}`);

    const versions = this.getAvailableVersions();

    for (const version of versions) {
      if (this.compareVersions(version, currentVersion) <= 0) continue;
      if (this.compareVersions(version, this.currentVersion) > 0) break;

      const migration = this.migrations.get(version);
      if (migration) {
        console.log(`Applying migration to version ${version}`);
        try {
          currentState = migration.migrate(currentState);
          currentVersion = version;
        } catch (error) {
          console.error(`Migration to ${version} failed:`, error);
          throw new Error(`State migration failed at version ${version}: ${error}`);
        }
      }
    }

    console.log('State migration completed successfully');
    return currentState;
  }

  private detectVersion(state: any): string | null {
    // Try to detect version based on state structure
    if (!state) return null;

    // Check for version 2.0.0 features
    if (state.search?.history?.[0]?.timestamp instanceof Date) {
      return '2.0.0';
    }

    // Check for version 1.3.0 features
    if (state.user?.geolocation?.permission) {
      return '1.3.0';
    }

    // Check for version 1.2.0 features
    if (state.map?.layers?.[0]?.options) {
      return '1.2.0';
    }

    // Check for version 1.1.0 features
    if (state.search?.history || state.user?.stats) {
      return '1.1.0';
    }

    // Default to earliest version
    return '1.0.0';
  }

  private compareVersions(v1: string, v2: string): number {
    const parts1 = v1.split('.').map(Number);
    const parts2 = v2.split('.').map(Number);
    const maxLength = Math.max(parts1.length, parts2.length);

    for (let i = 0; i < maxLength; i++) {
      const part1 = parts1[i] || 0;
      const part2 = parts2[i] || 0;

      if (part1 < part2) return -1;
      if (part1 > part2) return 1;
    }

    return 0;
  }

  public addMigration(migration: StateMigration): void {
    this.migrations.set(migration.version, migration);
  }

  public removeMigration(version: string): void {
    this.migrations.delete(version);
  }

  public exportMigrationPath(): string[] {
    const path: string[] = [];
    let currentVersion = '1.0.0';

    while (currentVersion !== this.currentVersion) {
      const nextVersion = this.getNextVersion(currentVersion);
      if (!nextVersion) break;

      path.push(nextVersion);
      currentVersion = nextVersion;
    }

    return path;
  }

  private getNextVersion(version: string): string | null {
    const versions = this.getAvailableVersions();
    const currentIndex = versions.indexOf(version);

    if (currentIndex === -1 || currentIndex === versions.length - 1) {
      return null;
    }

    return versions[currentIndex + 1];
  }
}

// Convenience functions
export const migrateState = (state: any, fromVersion?: string): AppState => {
  return StateMigrationManager.getInstance().migrate(state, fromVersion);
};

export const getCurrentStateVersion = (): string => {
  return StateMigrationManager.getInstance().getCurrentVersion();
};

export const detectStateVersion = (state: any): string | null => {
  return StateMigrationManager.getInstance().detectVersion(state);
};

export const needsStateMigration = (stateVersion: string): boolean => {
  return StateMigrationManager.getInstance().needsMigration(stateVersion);
};

// Migration middleware for Zustand persist
export const createMigrationMiddleware = () => {
  return (state: any, action: any, next: () => void) => {
    next();

    // Check if migration is needed after rehydration
    if (action.type === 'persist/REHYDRATE') {
      const manager = StateMigrationManager.getInstance();
      const detectedVersion = manager.detectVersion(state);

      if (detectedVersion && manager.needsMigration(detectedVersion)) {
        console.log('State migration needed after rehydration');
        try {
          const migratedState = manager.migrate(state, detectedVersion);
          // Note: In a real implementation, you'd need to update the store state
          // This would require access to the store's setState function
          console.log('State migrated successfully after rehydration');
        } catch (error) {
          console.error('State migration failed after rehydration:', error);
        }
      }
    }
  };
};

export default StateMigrationManager;