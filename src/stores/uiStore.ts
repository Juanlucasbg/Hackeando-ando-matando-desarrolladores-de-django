import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { UIState } from '../types';

interface UIStore extends UIState {
  // Actions
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setSidebarTab: (tab: UIState['sidebarTab']) => void;
  setActiveModal: (modal: string | null) => void;
  setTheme: (theme: UIState['theme']) => void;
  addNotification: (notification: Omit<UIState['notifications'][0], 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  setTooltip: (tooltip: string, visible: boolean) => void;
  setBreakpoints: (breakpoints: UIState['breakpoints']) => void;
  setLoading: (loading: boolean) => void;

  // Computed getters
  getVisibleNotifications: () => UIState['notifications'];
  getActiveModals: () => string[];
  getVisibleTooltips: () => Record<string, boolean>;
  getDeviceType: () => 'mobile' | 'tablet' | 'desktop';
  hasActiveModal: () => boolean;
  hasUnreadNotifications: () => boolean;
}

const generateNotificationId = () => `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const initialState: UIState = {
  sidebarOpen: true,
  sidebarTab: 'search',
  activeModal: null,
  loading: false,
  theme: 'system',
  notifications: [],
  tooltips: {},
  breakpoints: {
    mobile: false,
    tablet: false,
    desktop: true,
  },
};

export const useUIStore = create<UIStore>()(
  devtools(
    persist(
      immer((set, get) => ({
        ...initialState,

        // Actions
        setSidebarOpen: (open) =>
          set((state) => {
            state.sidebarOpen = open;
          }),

        toggleSidebar: () =>
          set((state) => {
            state.sidebarOpen = !state.sidebarOpen;
          }),

        setSidebarTab: (tab) =>
          set((state) => {
            state.sidebarTab = tab;
          }),

        setActiveModal: (modal) =>
          set((state) => {
            state.activeModal = modal;
          }),

        setTheme: (theme) =>
          set((state) => {
            state.theme = theme;
          }),

        addNotification: (notificationData) =>
          set((state) => {
            const notification = {
              ...notificationData,
              id: generateNotificationId(),
              timestamp: new Date(),
              autoClose: notificationData.autoClose ?? true,
              duration: notificationData.duration ?? 5000,
            };

            state.notifications.push(notification);

            // Auto-remove notification if autoClose is enabled
            if (notification.autoClose && notification.duration) {
              setTimeout(() => {
                get().removeNotification(notification.id);
              }, notification.duration);
            }
          }),

        removeNotification: (id) =>
          set((state) => {
            state.notifications = state.notifications.filter((n) => n.id !== id);
          }),

        clearNotifications: () =>
          set((state) => {
            state.notifications = [];
          }),

        setTooltip: (tooltip, visible) =>
          set((state) => {
            state.tooltips[tooltip] = visible;
          }),

        setBreakpoints: (breakpoints) =>
          set((state) => {
            state.breakpoints = breakpoints;

            // Auto-close sidebar on mobile when breakpoints change
            if (breakpoints.mobile) {
              state.sidebarOpen = false;
            }
          }),

        setLoading: (loading) =>
          set((state) => {
            state.loading = loading;
          }),

        // Computed getters
        getVisibleNotifications: () => {
          return get().notifications;
        },

        getActiveModals: () => {
          const activeModal = get().activeModal;
          return activeModal ? [activeModal] : [];
        },

        getVisibleTooltips: () => {
          return get().tooltips;
        },

        getDeviceType: () => {
          const breakpoints = get().breakpoints;
          if (breakpoints.mobile) return 'mobile';
          if (breakpoints.tablet) return 'tablet';
          return 'desktop';
        },

        hasActiveModal: () => {
          return get().activeModal !== null;
        },

        hasUnreadNotifications: () => {
          return get().notifications.length > 0;
        },
      })),
      {
        name: 'ui-store',
        version: 1,
        partialize: (state) => ({
          theme: state.theme,
          sidebarOpen: state.sidebarOpen,
          sidebarTab: state.sidebarTab,
        }),
        onRehydrateStorage: () => (state) => {
          console.log('UI store hydrated:', state);

          // Apply theme to document
          if (state?.theme) {
            applyTheme(state.theme);
          }
        },
      }
    ),
    {
      name: 'ui-store',
      enabled: process.env.NODE_ENV === 'development',
    }
  )
);

// Theme utility functions
export const applyTheme = (theme: UIState['theme']) => {
  const root = document.documentElement;

  if (theme === 'system') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    root.classList.toggle('dark', prefersDark);
  } else {
    root.classList.toggle('dark', theme === 'dark');
  }

  root.setAttribute('data-theme', theme);
};

// Breakpoint detection utility
export const detectBreakpoints = (): UIState['breakpoints'] => {
  const width = window.innerWidth;

  return {
    mobile: width < 768,
    tablet: width >= 768 && width < 1024,
    desktop: width >= 1024,
  };
};

// Initialize theme and breakpoints
if (typeof window !== 'undefined') {
  // Set up system theme detection
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  mediaQuery.addEventListener('change', () => {
    const store = useUIStore.getState();
    if (store.theme === 'system') {
      applyTheme('system');
    }
  });

  // Set up breakpoint detection
  const updateBreakpoints = () => {
    useUIStore.getState().setBreakpoints(detectBreakpoints());
  };

  window.addEventListener('resize', updateBreakpoints);
  updateBreakpoints(); // Initial detection
}

// Selectors for optimized re-renders
export const useSidebarOpen = () => useUIStore((state) => state.sidebarOpen);
export const useSidebarTab = () => useUIStore((state) => state.sidebarTab);
export const useActiveModal = () => useUIStore((state) => state.activeModal);
export const useTheme = () => useUIStore((state) => state.theme);
export const useNotifications = () => useUIStore((state) => state.notifications);
export const useTooltips = () => useUIStore((state) => state.tooltips);
export const useBreakpoints = () => useUIStore((state) => state.breakpoints);
export const useLoading = () => useUIStore((state) => state.loading);

// Computed selectors
export const useVisibleNotifications = () => useUIStore((state) => state.getVisibleNotifications());
export const useDeviceType = () => useUIStore((state) => state.getDeviceType());
export const useHasActiveModal = () => useUIStore((state) => state.hasActiveModal());
export const useHasUnreadNotifications = () => useUIStore((state) => state.hasUnreadNotifications());

// Notification hooks
export const useNotificationActions = () => useUIStore((state) => ({
  addNotification: state.addNotification,
  removeNotification: state.removeNotification,
  clearNotifications: state.clearNotifications,
}));

// Modal hooks
export const useModalActions = () => useUIStore((state) => ({
  setActiveModal: state.setActiveModal,
  hasActiveModal: state.hasActiveModal(),
}));

// Sidebar hooks
export const useSidebarActions = () => useUIStore((state) => ({
  setSidebarOpen: state.setSidebarOpen,
  toggleSidebar: state.toggleSidebar,
  setSidebarTab: state.setSidebarTab,
}));

// Theme hooks
export const useThemeActions = () => useUIStore((state) => ({
  setTheme: state.setTheme,
  currentTheme: state.theme,
}));

export default useUIStore;