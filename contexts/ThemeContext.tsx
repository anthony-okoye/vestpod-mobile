/**
 * Theme Context
 * 
 * Provides theme state management with support for light, dark, and system modes.
 * Persists theme preference using AsyncStorage.
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  ReactNode,
} from 'react';
import { useColorScheme as useSystemColorScheme, Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Colors,
  ThemeMode,
  ColorScheme,
  ThemeColors,
  THEME_STORAGE_KEY,
} from '@/constants/theme';

interface ThemeContextValue {
  themeMode: ThemeMode;
  colorScheme: ColorScheme;
  colors: ThemeColors;
  isDarkMode: boolean;
  setTheme: (mode: ThemeMode) => Promise<void>;
  toggleTheme: () => Promise<void>;
  isLoading: boolean;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const systemColorScheme = useSystemColorScheme();
  const [themeMode, setThemeMode] = useState<ThemeMode>('system');
  const [isLoading, setIsLoading] = useState(true);

  // Determine the actual color scheme based on theme mode
  const colorScheme: ColorScheme = useMemo(() => {
    if (themeMode === 'system') {
      return systemColorScheme ?? 'light';
    }
    return themeMode;
  }, [themeMode, systemColorScheme]);

  const isDarkMode = colorScheme === 'dark';
  const colors = Colors[colorScheme];

  // Load saved theme preference on mount
  useEffect(() => {
    loadThemePreference();
  }, []);

  // Listen for system theme changes when in system mode
  useEffect(() => {
    if (themeMode !== 'system') return;

    const subscription = Appearance.addChangeListener(({ colorScheme: newScheme }) => {
      // Force re-render when system theme changes
    });

    return () => subscription.remove();
  }, [themeMode]);

  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme && isValidThemeMode(savedTheme)) {
        setThemeMode(savedTheme as ThemeMode);
      }
    } catch (error) {
      // Silently fail and use default theme
    } finally {
      setIsLoading(false);
    }
  };

  const isValidThemeMode = (value: string): value is ThemeMode => {
    return ['light', 'dark', 'system'].includes(value);
  };

  const setTheme = useCallback(async (mode: ThemeMode) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
      setThemeMode(mode);
    } catch (error) {
      // Still update state even if storage fails
      setThemeMode(mode);
    }
  }, []);

  const toggleTheme = useCallback(async () => {
    const nextMode: ThemeMode = isDarkMode ? 'light' : 'dark';
    await setTheme(nextMode);
  }, [isDarkMode, setTheme]);

  const contextValue: ThemeContextValue = useMemo(
    () => ({
      themeMode,
      colorScheme,
      colors,
      isDarkMode,
      setTheme,
      toggleTheme,
      isLoading,
    }),
    [themeMode, colorScheme, colors, isDarkMode, setTheme, toggleTheme, isLoading]
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeContext(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  return context;
}

export { ThemeContext };
