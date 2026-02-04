/**
 * useTheme Hook
 * 
 * Provides convenient access to theme context with all theme-related utilities.
 * Use this hook in components that need theme information or controls.
 */

import { useThemeContext } from '@/contexts/ThemeContext';
import { Colors, ThemeColors, ThemeMode, ColorScheme } from '@/constants/theme';

interface UseThemeReturn {
  // Current theme mode (light, dark, or system)
  themeMode: ThemeMode;
  // Resolved color scheme (light or dark)
  colorScheme: ColorScheme;
  // Current theme colors object
  colors: ThemeColors;
  // Boolean indicating if dark mode is active
  isDarkMode: boolean;
  // Set theme to specific mode
  setTheme: (mode: ThemeMode) => Promise<void>;
  // Toggle between light and dark (ignores system)
  toggleTheme: () => Promise<void>;
  // Whether theme is still loading from storage
  isLoading: boolean;
  // Get a specific color by name
  getColor: <K extends keyof ThemeColors>(colorName: K) => ThemeColors[K];
  // Get color with optional override
  getThemeColor: (
    props: { light?: string; dark?: string },
    colorName: keyof ThemeColors
  ) => string;
}

export function useTheme(): UseThemeReturn {
  const {
    themeMode,
    colorScheme,
    colors,
    isDarkMode,
    setTheme,
    toggleTheme,
    isLoading,
  } = useThemeContext();

  // Get a specific color from the current theme
  const getColor = <K extends keyof ThemeColors>(colorName: K): ThemeColors[K] => {
    return colors[colorName];
  };

  // Get color with optional light/dark override (matches useThemeColor pattern)
  const getThemeColor = (
    props: { light?: string; dark?: string },
    colorName: keyof ThemeColors
  ): string => {
    const colorFromProps = props[colorScheme];
    if (colorFromProps) {
      return colorFromProps;
    }
    return colors[colorName] as string;
  };

  return {
    themeMode,
    colorScheme,
    colors,
    isDarkMode,
    setTheme,
    toggleTheme,
    isLoading,
    getColor,
    getThemeColor,
  };
}
