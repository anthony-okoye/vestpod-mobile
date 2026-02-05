/**
 * Theme Constants
 * 
 * Defines colors, typography, and spacing for light and dark modes.
 * Provides semantic colors and component-specific styling.
 */

import { Platform } from 'react-native';

// Brand colors
const brandPrimary = '#1E3A8A';
const brandSecondary = '#6366F1';

// Semantic colors (shared between themes)
const semanticColors = {
  success: '#10B981',
  successLight: '#10B981',
  warning: '#F59E0B',
  warningLight: '#FBBF24',
  error: '#EF4444',
  errorLight: '#EF4444',
  info: '#3B82F6',
  infoLight: '#60A5FA',
};

export const Colors = {
  light: {
    // Base colors
    text: '#11181C',
    textSecondary: '#687076',
    textTertiary: '#9CA3AF',
    background: '#FFFFFF',
    backgroundSecondary: '#F9FAFB',
    backgroundTertiary: '#E5E7EB',
    tint: brandPrimary,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: brandPrimary,
    
    // Semantic colors
    success: semanticColors.success,
    successLight: semanticColors.successLight,
    warning: semanticColors.warning,
    warningLight: semanticColors.warningLight,
    error: semanticColors.error,
    errorLight: semanticColors.errorLight,
    info: semanticColors.info,
    infoLight: semanticColors.infoLight,
    
    // Component-specific colors
    card: '#FFFFFF',
    cardBorder: '#E5E7EB',
    border: '#E5E7EB',
    borderLight: '#F3F4F6',
    input: '#FFFFFF',
    inputBorder: '#D1D5DB',
    inputPlaceholder: '#9CA3AF',
    inputFocusBorder: brandPrimary,
    
    // Button colors
    buttonPrimary: brandPrimary,
    buttonPrimaryText: '#FFFFFF',
    buttonSecondary: '#F3F4F6',
    buttonSecondaryText: '#374151',
    buttonDisabled: '#E5E7EB',
    buttonDisabledText: '#9CA3AF',
    
    // Navigation
    headerBackground: '#FFFFFF',
    headerText: '#11181C',
    tabBarBackground: '#FFFFFF',
    tabBarBorder: '#E5E7EB',
    
    // Overlay
    overlay: 'rgba(0, 0, 0, 0.5)',
    modalBackground: '#FFFFFF',
    
    // Shadows
    shadow: '#000000',
    
    // Status bar
    statusBar: 'dark',
    
    // Auth-specific colors
    authGradientStart: '#1E3A8A',
    authGradientEnd: '#1E3A6F',
    authCardBackground: '#FFFFFF',
    authCardShadow: 'rgba(0, 0, 0, 0.1)',
    authInputBackground: '#F5F5F5',
    authBrandText: '#FFFFFF',
    
    // Dashboard-specific colors
    dashboardGradientStart: '#1E3A8A',
    dashboardGradientEnd: '#1E3A6F',
    dashboardHeaderText: '#FFFFFF',
    dashboardHeaderSubtext: 'rgba(255, 255, 255, 0.8)',
    
    // Card backgrounds
    cardBestPerformer: '#FEE2E2',
    cardWorstPerformer: '#FEE2E2',
    cardTotalInvested: '#DBEAFE',
    cardRiskScore: '#FEF3C7',
    
    // Allocation chart colors
    allocationStocks: '#1E3A8A',
    allocationCrypto: '#10B981',
    allocationRealEstate: '#F59E0B',
    allocationFixedIncome: '#8B5CF6',
    allocationCommodities: '#EC4899',
    
    // Tab bar colors
    tabBarActive: '#1E3A8A',
    tabBarInactive: '#9CA3AF',
    fabBackground: '#1E3A8A',
    fabIcon: '#FFFFFF',
  },
  dark: {
    // Base colors
    text: '#ECEDEE',
    textSecondary: '#9BA1A6',
    textTertiary: '#6B7280',
    background: '#151718',
    backgroundSecondary: '#1F2123',
    backgroundTertiary: '#2D2F31',
    tint: '#FFFFFF',
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: '#FFFFFF',
    
    // Semantic colors
    success: semanticColors.successLight,
    successLight: semanticColors.success,
    warning: semanticColors.warningLight,
    warningLight: semanticColors.warning,
    error: semanticColors.errorLight,
    errorLight: semanticColors.error,
    info: semanticColors.infoLight,
    infoLight: semanticColors.info,
    
    // Component-specific colors
    card: '#1F2123',
    cardBorder: '#2D2F31',
    border: '#2D2F31',
    borderLight: '#3D3F41',
    input: '#1F2123',
    inputBorder: '#3D3F41',
    inputPlaceholder: '#6B7280',
    inputFocusBorder: '#60A5FA',
    
    // Button colors
    buttonPrimary: '#60A5FA',
    buttonPrimaryText: '#151718',
    buttonSecondary: '#2D2F31',
    buttonSecondaryText: '#ECEDEE',
    buttonDisabled: '#2D2F31',
    buttonDisabledText: '#6B7280',
    
    // Navigation
    headerBackground: '#151718',
    headerText: '#ECEDEE',
    tabBarBackground: '#151718',
    tabBarBorder: '#2D2F31',
    
    // Overlay
    overlay: 'rgba(0, 0, 0, 0.7)',
    modalBackground: '#1F2123',
    
    // Shadows
    shadow: '#000000',
    
    // Status bar
    statusBar: 'light',
    
    // Auth-specific colors (same as light mode for consistency)
    authGradientStart: '#1E3A8A',
    authGradientEnd: '#1E3A6F',
    authCardBackground: '#FFFFFF',
    authCardShadow: 'rgba(0, 0, 0, 0.1)',
    authInputBackground: '#F5F5F5',
    authBrandText: '#FFFFFF',
    
    // Dashboard-specific colors
    dashboardGradientStart: '#1E3A8A',
    dashboardGradientEnd: '#1E3A6F',
    dashboardHeaderText: '#FFFFFF',
    dashboardHeaderSubtext: 'rgba(255, 255, 255, 0.8)',
    
    // Card backgrounds
    cardBestPerformer: '#FEE2E2',
    cardWorstPerformer: '#FEE2E2',
    cardTotalInvested: '#DBEAFE',
    cardRiskScore: '#FEF3C7',
    
    // Allocation chart colors
    allocationStocks: '#1E3A8A',
    allocationCrypto: '#10B981',
    allocationRealEstate: '#F59E0B',
    allocationFixedIncome: '#8B5CF6',
    allocationCommodities: '#EC4899',
    
    // Tab bar colors
    tabBarActive: '#60A5FA',
    tabBarInactive: '#6B7280',
    fabBackground: '#60A5FA',
    fabIcon: '#151718',
  },
};

// Typography constants
export const Typography = {
  fontSizes: {
    xs: 10,
    sm: 12,
    md: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
  },
  fontWeights: {
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
  lineHeights: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
};

// Spacing constants
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,
};

// Border radius constants
export const BorderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 24,
  full: 9999,
};

// Font families
export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

// Theme type definitions
export type ThemeMode = 'light' | 'dark' | 'system';
export type ColorScheme = 'light' | 'dark';
export type ThemeColors = typeof Colors.light;

// AsyncStorage key for theme preference
export const THEME_STORAGE_KEY = '@vestpod_theme_preference';
