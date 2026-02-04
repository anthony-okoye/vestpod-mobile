/**
 * ThemedCard Component
 * 
 * Card component with theme-aware styling including background, border, and shadow.
 */

import React from 'react';
import { View, ViewProps, StyleSheet, Platform } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { BorderRadius, Spacing } from '@/constants/theme';

export interface ThemedCardProps extends ViewProps {
  elevated?: boolean;
  bordered?: boolean;
  padding?: keyof typeof Spacing;
  borderRadius?: keyof typeof BorderRadius;
}

export function ThemedCard({
  style,
  elevated = true,
  bordered = false,
  padding = 'base',
  borderRadius = 'lg',
  ...props
}: ThemedCardProps) {
  const { colors, isDarkMode } = useTheme();

  const shadowStyle = elevated
    ? Platform.select({
        ios: {
          shadowColor: colors.shadow,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: isDarkMode ? 0.3 : 0.1,
          shadowRadius: 4,
        },
        android: {
          elevation: 3,
        },
        default: {},
      })
    : {};

  const borderStyle = bordered
    ? {
        borderWidth: 1,
        borderColor: colors.cardBorder,
      }
    : {};

  return (
    <View
      style={[
        {
          backgroundColor: colors.card,
          padding: Spacing[padding],
          borderRadius: BorderRadius[borderRadius],
        },
        shadowStyle,
        borderStyle,
        style,
      ]}
      {...props}
    />
  );
}
