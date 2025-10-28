import { AppState, ValidationError, Coordinates, UserPreferences } from '../types';

// Validation rules
export const validateCoordinates = (coords: any): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (!coords || typeof coords !== 'object') {
    errors.push({
      field: 'coordinates',
      message: 'Coordinates must be an object',
      code: 'INVALID_TYPE',
    });
    return errors;
  }

  if (typeof coords.lat !== 'number' || isNaN(coords.lat)) {
    errors.push({
      field: 'coordinates.lat',
      message: 'Latitude must be a valid number',
      code: 'INVALID_LATITUDE',
    });
  } else if (coords.lat < -90 || coords.lat > 90) {
    errors.push({
      field: 'coordinates.lat',
      message: 'Latitude must be between -90 and 90',
      code: 'LATITUDE_OUT_OF_RANGE',
    });
  }

  if (typeof coords.lng !== 'number' || isNaN(coords.lng)) {
    errors.push({
      field: 'coordinates.lng',
      message: 'Longitude must be a valid number',
      code: 'INVALID_LONGITUDE',
    });
  } else if (coords.lng < -180 || coords.lng > 180) {
    errors.push({
      field: 'coordinates.lng',
      message: 'Longitude must be between -180 and 180',
      code: 'LONGITUDE_OUT_OF_RANGE',
    });
  }

  return errors;
};

export const validateMapZoom = (zoom: any): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (typeof zoom !== 'number' || isNaN(zoom)) {
    errors.push({
      field: 'map.zoom',
      message: 'Zoom level must be a number',
      code: 'INVALID_ZOOM_TYPE',
    });
  } else if (zoom < 1 || zoom > 20) {
    errors.push({
      field: 'map.zoom',
      message: 'Zoom level must be between 1 and 20',
      code: 'ZOOM_OUT_OF_RANGE',
    });
  }

  return errors;
};

export const validateUserPreferences = (preferences: any): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (!preferences || typeof preferences !== 'object') {
    errors.push({
      field: 'user.preferences',
      message: 'Preferences must be an object',
      code: 'INVALID_TYPE',
    });
    return errors;
  }

  // Validate theme
  if (preferences.theme && !['light', 'dark', 'system'].includes(preferences.theme)) {
    errors.push({
      field: 'user.preferences.theme',
      message: 'Theme must be one of: light, dark, system',
      code: 'INVALID_THEME',
    });
  }

  // Validate language
  if (preferences.language && typeof preferences.language !== 'string') {
    errors.push({
      field: 'user.preferences.language',
      message: 'Language must be a string',
      code: 'INVALID_LANGUAGE',
    });
  }

  // Validate units
  if (preferences.units && !['metric', 'imperial'].includes(preferences.units)) {
    errors.push({
      field: 'user.preferences.units',
      message: 'Units must be either metric or imperial',
      code: 'INVALID_UNITS',
    });
  }

  // Validate defaultZoom
  if (preferences.defaultZoom !== undefined) {
    const zoomErrors = validateMapZoom(preferences.defaultZoom);
    errors.push(...zoomErrors.map(error => ({
      ...error,
      field: `user.preferences.${error.field}`,
    })));
  }

  // Validate gestureHandling
  if (
    preferences.gestureHandling &&
    !['auto', 'cooperative', 'greedy', 'none'].includes(preferences.gestureHandling)
  ) {
    errors.push({
      field: 'user.preferences.gestureHandling',
      message: 'Gesture handling must be one of: auto, cooperative, greedy, none',
      code: 'INVALID_GESTURE_HANDLING',
    });
  }

  return errors;
};

export const validateSearchQuery = (query: any): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (typeof query !== 'string') {
    errors.push({
      field: 'search.query',
      message: 'Search query must be a string',
      code: 'INVALID_QUERY_TYPE',
    });
  } else if (query.length > 500) {
    errors.push({
      field: 'search.query',
      message: 'Search query must be less than 500 characters',
      code: 'QUERY_TOO_LONG',
    });
  }

  return errors;
};

export const validateMarkers = (markers: any[]): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (!Array.isArray(markers)) {
    errors.push({
      field: 'map.markers',
      message: 'Markers must be an array',
      code: 'INVALID_MARKERS_TYPE',
    });
    return errors;
  }

  if (markers.length > 1000) {
    errors.push({
      field: 'map.markers',
      message: 'Too many markers (maximum 1000)',
      code: 'TOO_MANY_MARKERS',
    });
  }

  markers.forEach((marker, index) => {
    if (!marker.id || typeof marker.id !== 'string') {
      errors.push({
        field: `map.markers[${index}].id`,
        message: 'Marker must have a valid string ID',
        code: 'INVALID_MARKER_ID',
      });
    }

    const coordErrors = validateCoordinates(marker.position);
    errors.push(...coordErrors.map(error => ({
      ...error,
      field: `map.markers[${index}].position.${error.field.split('.')[1]}`,
    })));

    if (marker.title && typeof marker.title !== 'string') {
      errors.push({
        field: `map.markers[${index}].title`,
        message: 'Marker title must be a string',
        code: 'INVALID_MARKER_TITLE',
      });
    }
  });

  return errors;
};

export const validateNotifications = (notifications: any[]): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (!Array.isArray(notifications)) {
    errors.push({
      field: 'ui.notifications',
      message: 'Notifications must be an array',
      code: 'INVALID_NOTIFICATIONS_TYPE',
    });
    return errors;
  }

  if (notifications.length > 50) {
    errors.push({
      field: 'ui.notifications',
      message: 'Too many notifications (maximum 50)',
      code: 'TOO_MANY_NOTIFICATIONS',
    });
  }

  notifications.forEach((notification, index) => {
    if (!notification.id || typeof notification.id !== 'string') {
      errors.push({
        field: `ui.notifications[${index}].id`,
        message: 'Notification must have a valid string ID',
        code: 'INVALID_NOTIFICATION_ID',
      });
    }

    if (!notification.type || !['info', 'success', 'warning', 'error'].includes(notification.type)) {
      errors.push({
        field: `ui.notifications[${index}].type`,
        message: 'Notification type must be one of: info, success, warning, error',
        code: 'INVALID_NOTIFICATION_TYPE',
      });
    }

    if (!notification.title || typeof notification.title !== 'string') {
      errors.push({
        field: `ui.notifications[${index}].title`,
        message: 'Notification must have a valid string title',
        code: 'INVALID_NOTIFICATION_TITLE',
      });
    }

    if (notification.timestamp && !(notification.timestamp instanceof Date) && typeof notification.timestamp !== 'number') {
      errors.push({
        field: `ui.notifications[${index}].timestamp`,
        message: 'Notification timestamp must be a Date or number',
        code: 'INVALID_NOTIFICATION_TIMESTAMP',
      });
    }
  });

  return errors;
};

// Main validator class
export class StateValidator {
  private static instance: StateValidator;
  private validationRules: Map<string, (value: any) => ValidationError[]> = new Map();

  private constructor() {
    this.setupValidationRules();
  }

  public static getInstance(): StateValidator {
    if (!StateValidator.instance) {
      StateValidator.instance = new StateValidator();
    }
    return StateValidator.instance;
  }

  private setupValidationRules(): void {
    this.validationRules.set('map.center', validateCoordinates);
    this.validationRules.set('map.zoom', validateMapZoom);
    this.validationRules.set('map.markers', validateMarkers);
    this.validationRules.set('search.query', validateSearchQuery);
    this.validationRules.set('user.preferences', validateUserPreferences);
    this.validationRules.set('ui.notifications', validateNotifications);
  }

  public validate(state: AppState): ValidationError[] {
    const errors: ValidationError[] = [];

    // Validate map state
    errors.push(...validateCoordinates(state.map.center));
    errors.push(...validateMapZoom(state.map.zoom));
    errors.push(...validateMarkers(state.map.markers));

    // Validate search state
    errors.push(...validateSearchQuery(state.search.query));

    // Validate user state
    errors.push(...validateUserPreferences(state.user.preferences));

    // Validate UI state
    errors.push(...validateNotifications(state.ui.notifications));

    return errors;
  }

  public validatePartial(partialState: Partial<AppState>): ValidationError[] {
    const errors: ValidationError[] = [];

    if (partialState.map) {
      if (partialState.map.center) {
        errors.push(...validateCoordinates(partialState.map.center));
      }
      if (partialState.map.zoom !== undefined) {
        errors.push(...validateMapZoom(partialState.map.zoom));
      }
      if (partialState.map.markers) {
        errors.push(...validateMarkers(partialState.map.markers));
      }
    }

    if (partialState.search) {
      if (partialState.search.query !== undefined) {
        errors.push(...validateSearchQuery(partialState.search.query));
      }
    }

    if (partialState.user) {
      if (partialState.user.preferences) {
        errors.push(...validateUserPreferences(partialState.user.preferences));
      }
    }

    if (partialState.ui) {
      if (partialState.ui.notifications) {
        errors.push(...validateNotifications(partialState.ui.notifications));
      }
    }

    return errors;
  }

  public addValidationRule(path: string, rule: (value: any) => ValidationError[]): void {
    this.validationRules.set(path, rule);
  }

  public removeValidationRule(path: string): void {
    this.validationRules.delete(path);
  }

  public hasValidationRule(path: string): boolean {
    return this.validationRules.has(path);
  }

  public getValidationRules(): string[] {
    return Array.from(this.validationRules.keys());
  }
}

// Convenience functions
export const validateState = (state: AppState): ValidationError[] => {
  return StateValidator.getInstance().validate(state);
};

export const validatePartialState = (partialState: Partial<AppState>): ValidationError[] => {
  return StateValidator.getInstance().validatePartial(partialState);
};

// Validation middleware for Zustand stores
export const createValidationMiddleware = (validator: (state: any) => ValidationError[]) => {
  return (state: any, action: any, next: () => void) => {
    next();

    const errors = validator(state);
    if (errors.length > 0) {
      console.warn('State validation errors:', errors);

      // Dispatch validation error notification if UI store is available
      if (typeof window !== 'undefined' && (window as any).__uiStore) {
        (window as any).__uiStore.addNotification({
          type: 'error',
          title: 'State Validation Error',
          message: `Found ${errors.length} validation error(s) in application state`,
          autoClose: false,
        });
      }
    }
  };
};

export default StateValidator;