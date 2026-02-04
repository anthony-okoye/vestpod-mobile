/**
 * OAuthButton Component
 * 
 * Reusable button for OAuth providers (Google, GitHub).
 * Displays provider icon and name with consistent styling.
 * Meets WCAG accessibility standards with 44x44pt minimum touch target.
 */

import React from 'react';
import { TouchableOpacity, Text, Image, StyleSheet, View } from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';

export interface OAuthButtonProps {
  provider: 'google' | 'github';
  onPress: () => void;
  disabled?: boolean;
}

const providerConfig = {
  google: {
    name: 'Google',
    icon: require('../../assets/images/google-logo.svg'),
    accessibilityLabel: 'Sign in with Google',
  },
  github: {
    name: 'GitHub',
    icon: require('../../assets/images/github-logo.svg'),
    accessibilityLabel: 'Sign in with GitHub',
  },
};

export function OAuthButton({ provider, onPress, disabled = false }: OAuthButtonProps) {
  const config = providerConfig[provider];

  return (
    <TouchableOpacity
      style={[styles.button, disabled && styles.buttonDisabled]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
      accessible={true}
      accessibilityLabel={config.accessibilityLabel}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
    >
      <View style={styles.content}>
        <Image 
          source={config.icon} 
          style={styles.icon} 
          resizeMode="contain"
          accessible={false} // Parent handles accessibility
          accessibilityIgnoresInvertColors={true}
        />
        <Text style={[styles.text, disabled && styles.textDisabled]}>{config.name}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.base,
    flex: 1,
    minHeight: 44, // WCAG minimum touch target
    minWidth: 44,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    width: 20,
    height: 20,
    marginRight: Spacing.sm,
  },
  text: {
    fontSize: Typography.fontSizes.md,
    fontWeight: Typography.fontWeights.medium,
    color: '#374151',
  },
  textDisabled: {
    color: '#9CA3AF',
  },
});
