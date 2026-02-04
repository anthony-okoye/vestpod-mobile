/**
 * ThemedText Component
 * 
 * Text component with theme-aware color and typography variants.
 */

import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Typography } from '@/constants/theme';

export interface ThemedTextProps extends TextProps {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'error' | 'success';
  size?: keyof typeof Typography.fontSizes;
  weight?: keyof typeof Typography.fontWeights;
}

export function ThemedText({
  style,
  variant = 'primary',
  size = 'base',
  weight = 'normal',
  ...props
}: ThemedTextProps) {
  const { colors } = useTheme();

  const textColors = {
    primary: colors.text,
    secondary: colors.textSecondary,
    tertiary: colors.textTertiary,
    error: colors.error,
    success: colors.success,
  };

  return (
    <Text
      style={[
        {
          color: textColors[variant],
          fontSize: Typography.fontSizes[size],
          fontWeight: Typography.fontWeights[weight],
        },
        style,
      ]}
      {...props}
    />
  );
}
