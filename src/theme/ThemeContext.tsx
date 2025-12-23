/**
 * Theme Context & Provider
 * Manages dark/light mode with system preference support
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useColorScheme, Appearance } from 'react-native';
import { lightColors, darkColors, ThemeColors } from './colors';
import { typography } from './typography';
import { spacing, borderRadius, layout } from './spacing';
import type { ThemeMode } from '../types/user';
import { storageService } from '../services/storage';

// Theme object
export interface Theme {
  colors: ThemeColors;
  typography: typeof typography;
  spacing: typeof spacing;
  borderRadius: typeof borderRadius;
  layout: typeof layout;
  isDark: boolean;
}

// Theme context type
interface ThemeContextType {
  theme: Theme;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
  toggleTheme: () => Promise<void>;
}

// Create context
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Create light and dark themes
const createTheme = (isDark: boolean): Theme => ({
  colors: isDark ? darkColors : lightColors,
  typography,
  spacing,
  borderRadius,
  layout,
  isDark,
});

// Theme Provider component
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');
  const [isLoaded, setIsLoaded] = useState(false);

  // Determine if dark mode should be active
  const isDark =
    themeMode === 'dark' ||
    (themeMode === 'system' && systemColorScheme === 'dark');

  const theme = createTheme(isDark);

  // Load saved theme preference
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const preferences = await storageService.loadPreferences();
        setThemeModeState(preferences.theme);
      } catch (error) {
        console.error('Error loading theme:', error);
      } finally {
        setIsLoaded(true);
      }
    };

    loadTheme();
  }, []);

  // Set theme mode and persist
  const setThemeMode = useCallback(async (mode: ThemeMode) => {
    setThemeModeState(mode);
    try {
      const preferences = await storageService.loadPreferences();
      await storageService.savePreferences({ ...preferences, theme: mode });
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  }, []);

  // Toggle between light and dark
  const toggleTheme = useCallback(async () => {
    const newMode: ThemeMode = isDark ? 'light' : 'dark';
    await setThemeMode(newMode);
  }, [isDark, setThemeMode]);

  // Listen to system theme changes
  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      if (themeMode === 'system') {
        // Force re-render when system theme changes
        setThemeModeState('system');
      }
    });

    return () => subscription.remove();
  }, [themeMode]);

  const value: ThemeContextType = {
    theme,
    themeMode,
    setThemeMode,
    toggleTheme,
  };

  // Don't render until theme is loaded to avoid flash
  if (!isLoaded) {
    return null;
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

// Hook to use theme
export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// Hook to use colors only
export function useColors(): ThemeColors {
  const { theme } = useTheme();
  return theme.colors;
}

// Hook to check if dark mode
export function useIsDark(): boolean {
  const { theme } = useTheme();
  return theme.isDark;
}
