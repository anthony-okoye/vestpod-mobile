/**
 * ThemedView Component
 * 
 * View component with theme-aware background color.
 */

import React from 'react';
import { View, ViewProps, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

export interface ThemedViewProps extends ViewProps {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'card';
}

export function ThemedView({
  style,
  variant = 'primary',
  ...props
}: ThemedViewProps) {
  const { colors } = useTheme();

  const backgroundColors = {
    primary: colors.background,
    secondary: colors.backgroundSecondary,
    tertiary: colors.backgroundTertiary,
    card: colors.card,
  };

  return (
    <View
      style={[{ backgroundColor: backgroundColors[variant] }, style]}
      {...props}
    />
  );
}
