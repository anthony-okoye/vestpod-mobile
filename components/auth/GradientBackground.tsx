/**
 * GradientBackground Component
 * 
 * Provides branded blue gradient background for authentication screens.
 * Uses LinearGradient from expo-linear-gradient with brand colors.
 */

import React from 'react';
import { StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../constants/theme';

interface GradientBackgroundProps {
  children: React.ReactNode;
}

export function GradientBackground({ children }: GradientBackgroundProps) {
  return (
    <LinearGradient
      colors={[Colors.light.authGradientStart, Colors.light.authGradientEnd]}
      style={styles.container}
    >
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
