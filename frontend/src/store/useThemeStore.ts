import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { lightTheme, darkTheme } from '../utils/theme';
import type { Theme } from '../utils/theme';

interface ThemeState {
  isDark: boolean;
  theme: Theme;
  toggleTheme: () => void;
  setDark: (isDark: boolean) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      isDark: false,
      theme: lightTheme,

      toggleTheme: () =>
        set((state) => ({
          isDark: !state.isDark,
          theme: !state.isDark ? darkTheme : lightTheme,
        })),

      setDark: (isDark: boolean) =>
        set({
          isDark,
          theme: isDark ? darkTheme : lightTheme,
        }),
    }),
    {
      name: 'theme-storage',
    }
  )
);