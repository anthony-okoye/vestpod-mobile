/**
 * FormCard Component
 * 
 * White rounded card container for authentication forms.
 * Includes shadow, padding, and margins as per design specifications.
 * Responsive margins ensure proper display on all screen sizes.
 */

import React from 'react';
import { View, StyleSheet, Platform, useWindowDimensions } from 'react-native';
import { Colors, Spacing } from '../../constants/theme';

interface FormCardProps {
  children: React.ReactNode;
}

export function FormCard({ children }: FormCardProps) {
  const { width } = useWindowDimensions();
  
  // Adjust horizontal margins based on screen width
  // Small screens: 16px, Medium: 24px, Large: 32px
  const horizontalMargin = width < 375 ? Spacing.base : width < 768 ? Spacing.xl : Spacing['2xl'];
  
  return (
    <View style={[styles.container, { marginHorizontal: horizontalMargin }]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.light.authCardBackground,
    borderRadius: 20,
    padding: Spacing.xl,
    maxWidth: 600, // Prevent card from becoming too wide on tablets
    width: '100%',
    alignSelf: 'center',
    ...Platform.select({
      ios: {
        shadowColor: Colors.light.authCardShadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
});
