/**
 * EmptyState Component
 * 
 * Displays a centered message when no assets are found in the portfolio.
 * Includes a link to add the first asset.
 * 
 * Requirements: 2.3
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface EmptyStateProps {
  onAddAsset: () => void;
  message?: string;
  testID?: string;
}

export function EmptyState({ 
  onAddAsset, 
  message = 'No assets found',
  testID 
}: EmptyStateProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <View 
      style={styles.container}
      testID={testID}
    >
      <Text 
        style={[
          styles.message,
          { color: colors.textTertiary }
        ]}
        accessibilityRole="text"
      >
        {message}
      </Text>
      
      <TouchableOpacity
        style={styles.addButton}
        onPress={onAddAsset}
        activeOpacity={0.7}
        accessibilityLabel="Add your first asset"
        accessibilityHint="Opens the add asset flow to add your first investment"
        accessibilityRole="button"
      >
        <Ionicons
          name="add-circle-outline"
          size={20}
          color={colors.buttonPrimary}
          style={styles.icon}
        />
        <Text 
          style={[
            styles.addButtonText,
            { color: colors.buttonPrimary }
          ]}
        >
          Add your first asset
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing['2xl'],
    paddingVertical: Spacing['4xl'],
  },
  message: {
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.medium,
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  icon: {
    marginRight: Spacing.xs,
  },
  addButtonText: {
    fontSize: Typography.fontSizes.base,
    fontWeight: Typography.fontWeights.medium,
  },
});

export default EmptyState;
