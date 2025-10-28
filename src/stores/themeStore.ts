import { create } from 'zustand';
import { persist, subscribeWithSelector } from 'zustand/middleware';
import type { Theme } from '@/types/common.types';

export interface ThemeStore {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  resetTheme: () => void;
}

const initialState: Theme = 'system';

export const useThemeStore = create<ThemeStore>()(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        theme: initialState,

        setTheme: (theme: Theme) => {
          set({ theme });
        },

        toggleTheme: () => {
          const currentTheme = get().theme;
          let newTheme: Theme;

          if (currentTheme === 'light') {
            newTheme = 'dark';
          } else if (currentTheme === 'dark') {
            newTheme = 'system';
          } else {
            newTheme = 'light';
          }

          set({ theme: newTheme });
        },

        resetTheme: () => {
          set({ theme: initialState });
        },
      }),
      {
        name: 'theme-store',
        version: 1,
      }
    )
  )
);