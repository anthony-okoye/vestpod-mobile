/**
 * BrandHeader Component
 * 
 * Displays app logo, title, and tagline at the top of authentication screens.
 * All elements are centered with appropriate spacing.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AppLogo } from './AppLogo';
import { Colors, Typography, Spacing } from '../../constants/theme';

interface BrandHeaderProps {
  tagline: string;
}

export function BrandHeader({ tagline }: BrandHeaderProps) {
  return (
    <View style={styles.container}>
      <AppLogo />
      <Text style={styles.title}>Vest Pod</Text>
      <Text style={styles.tagline}>{tagline}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingTop: Spacing['2xl'],
    paddingBottom: Spacing.xl,
  },
  title: {
    fontSize: 32,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.light.authBrandText,
    marginTop: Spacing.base,
  },
  tagline: {
    fontSize: Typography.fontSizes.base,
    color: Colors.light.authBrandText,
    opacity: 0.9,
    marginTop: Spacing.sm,
    textAlign: 'center',
    paddingHorizontal: Spacing.xl,
  },
});
