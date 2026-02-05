/**
 * PerformerCard Component
 * 
 * Colored card showing best or worst performing asset.
 * Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';

export type PerformerType = 'best' | 'worst';

export interface PerformerCardProps {
  type: PerformerType;
  assetName: string;
  changePercent: number;
}

/**
 * Returns background color based on performer type
 * Both best and worst use light pink (#FEE2E2) per requirements 4.2, 4.6
 */
export function getPerformerBackgroundColor(type: PerformerType): string {
  return type === 'best' 
    ? Colors.light.cardBestPerformer 
    : Colors.light.cardWorstPerformer;
}

/**
 * Returns label text based on performer type
 */
export function getPerformerLabel(type: PerformerType): string {
  return type === 'best' ? 'Best Performer' : 'Worst Performer';
}

/**
 * Returns color for percentage change display
 * Green (#059669) for positive, Red (#DC2626) for negative
 */
export function getPercentageColor(changePercent: number): string {
  return changePercent >= 0 ? Colors.light.success : Colors.light.error;
}

/**
 * Returns trend icon name based on change direction
 */
export function getTrendIconName(changePercent: number): 'trending-up' | 'trending-down' {
  return changePercent >= 0 ? 'trending-up' : 'trending-down';
}

/**
 * Formats percentage for display with sign
 */
export function formatPercentage(changePercent: number): string {
  const sign = changePercent >= 0 ? '+' : '';
  return `${sign}${changePercent.toFixed(2)}%`;
}

export function PerformerCard({
  type,
  assetName,
  changePercent,
}: PerformerCardProps) {
  const backgroundColor = getPerformerBackgroundColor(type);
  const label = getPerformerLabel(type);
  const percentageColor = getPercentageColor(changePercent);
  const trendIcon = getTrendIconName(changePercent);
  const formattedPercent = formatPercentage(changePercent);
  const trendDirection = changePercent >= 0 ? 'up' : 'down';

  return (
    <View
      style={[styles.container, { backgroundColor }]}
      accessible={true}
      accessibilityRole="none"
      accessibilityLabel={`${label}: ${assetName}, ${trendDirection} ${Math.abs(changePercent).toFixed(2)} percent`}
      accessibilityHint={type === 'best' ? 'Your top performing asset' : 'Your lowest performing asset'}
    >
      <Text 
        style={styles.label}
        accessibilityElementsHidden={true}
      >
        {label}
      </Text>
      <Text 
        style={styles.assetName} 
        numberOfLines={1}
        accessibilityElementsHidden={true}
      >
        {assetName}
      </Text>
      <View 
        style={styles.changeContainer}
        accessibilityElementsHidden={true}
      >
        <Ionicons name={trendIcon} size={16} color={percentageColor} />
        <Text style={[styles.changePercent, { color: percentageColor }]}>
          {formattedPercent}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: BorderRadius.xl,
    padding: Spacing.base,
    minHeight: 100,
  },
  label: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.normal,
    color: Colors.light.textSecondary,
    marginBottom: Spacing.xs,
  },
  assetName: {
    fontSize: Typography.fontSizes.base,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.light.text,
    marginBottom: Spacing.sm,
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  changePercent: {
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.bold,
  },
});

export default PerformerCard;
