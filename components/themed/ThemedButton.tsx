/**
 * ThemedButton Component
 * 
 * Button component with theme-aware colors and variants.
 */

import React from 'react';
import {
  TouchableOpacity,
  TouchableOpacityProps,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { BorderRadius, Spacing, Typography } from '@/constants/theme';

export interface ThemedButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  fullWidth?: boolean;
}

export function ThemedButton({
  title,
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  disabled,
  style,
  ...props
}: ThemedButtonProps) {
  const { colors } = useTheme();

  const isDisabled = disabled || loading;

  const sizeStyles = {
    sm: { paddingVertical: Spacing.sm, paddingHorizontal: Spacing.md },
    md: { paddingVertical: Spacing.md, paddingHorizontal: Spacing.lg },
    lg: { paddingVertical: Spacing.base, paddingHorizontal: Spacing.xl },
  };

  const textSizes = {
    sm: Typography.fontSizes.sm,
    md: Typography.fontSizes.base,
    lg: Typography.fontSizes.lg,
  };

  const getBackgroundColor = () => {
    if (isDisabled) return colors.buttonDisabled;
    switch (variant) {
      case 'primary':
        return colors.buttonPrimary;
      case 'secondary':
        return colors.buttonSecondary;
      case 'outline':
      case 'ghost':
        return 'transparent';
      default:
        return colors.buttonPrimary;
    }
  };

  const getTextColor = () => {
    if (isDisabled) return colors.buttonDisabledText;
    switch (variant) {
      case 'primary':
        return colors.buttonPrimaryText;
      case 'secondary':
        return colors.buttonSecondaryText;
      case 'outline':
      case 'ghost':
        return colors.buttonPrimary;
      default:
        return colors.buttonPrimaryText;
    }
  };

  const getBorderStyle = () => {
    if (variant === 'outline') {
      return {
        borderWidth: 1,
        borderColor: isDisabled ? colors.buttonDisabled : colors.buttonPrimary,
      };
    }
    return {};
  };

  return (
    <TouchableOpacity
      disabled={isDisabled}
      style={[
        styles.button,
        sizeStyles[size],
        { backgroundColor: getBackgroundColor() },
        getBorderStyle(),
        fullWidth && styles.fullWidth,
        style,
      ]}
      activeOpacity={0.7}
      {...props}
    >
      {loading ? (
        <ActivityIndicator size="small" color={getTextColor()} />
      ) : (
        <Text
          style={[
            styles.text,
            { color: getTextColor(), fontSize: textSizes[size] },
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  text: {
    fontWeight: '600',
  },
  fullWidth: {
    width: '100%',
  },
});
