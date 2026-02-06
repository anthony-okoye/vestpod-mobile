/**
 * StatsCard Component
 * 
 * Gradient card showing portfolio statistics (best/worst performer, total invested, risk score).
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 5.9, 5.10, 5.11
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';

export type StatsType = 'best' | 'worst' | 'invested' | 'risk';

export interface StatsCardProps {
  type: StatsType;
  value: number | string;
  subtitle: string;
}

/**
 * Returns background color based on stats type
 * Total Invested: Light blue (#DBEAFE)
 * Risk Score: Light amber (#FEF3C7)
 * Per requirements 4.4
 */
export function getStatsBackgroundColor(type: StatsType): string {
  switch (type) {
    case 'invested':
      return '#DBEAFE'; // Light blue
    case 'risk':
      return '#FEF3C7'; // Light amber
    default:
      return '#F3F4F6'; // Default gray
  }
}

/**
 * Returns label text based on stats type
 * Per requirements 5.3 and 5.8
 */
export function getStatsLabel(type: StatsType): string {
  switch (type) {
    case 'best':
      return 'Best Performer';
    case 'worst':
      return 'Worst Performer';
    case 'invested':
      return 'Total Invested';
    case 'risk':
      return 'Risk Score';
  }
}

/**
 * Returns icon name based on stats type
 * Dollar sign for invested (5.6), warning for risk (5.11)
 * Trending icons for best/worst performers
 */
export function getStatsIconName(type: StatsType): keyof typeof Ionicons.glyphMap {
  switch (type) {
    case 'best':
      return 'trending-up';
    case 'worst':
      return 'trending-down';
    case 'invested':
      return 'cash-outline';
    case 'risk':
      return 'warning-outline';
  }
}

/**
 * Returns icon color that complements the gradient
 * White color for better visibility on gradient backgrounds
 */
export function getStatsIconColor(type: StatsType): string {
  return '#FFFFFF';
}
export function formatStatsValue(type: StatsType, value: number | string): string {
  if (type === 'invested') {
    if (typeof value === 'number') {
      return `$${value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
    }
    return String(value);
  }
  // Risk score format: X/10
  return `${value}/10`;
}

/**
 * Returns risk level text based on score
 * Per requirement 5.10:
 * - Low Risk for scores < 4
 * - Moderate for scores 4-7
 * - High Risk for scores > 7
 */
export function getRiskLevelText(score: number): string {
  if (score < 4) return 'Low Risk';
  if (score <= 7) return 'Moderate';
  return 'High Risk';
}

export function StatsCard({
  type,
  value,
  subtitle,
}: StatsCardProps) {
  const backgroundColor = getStatsBackgroundColor(type);
  const label = getStatsLabel(type);
  const iconName = getStatsIconName(type);
  const formattedValue = formatStatsValue(type, value);
  
  // For risk type, use getRiskLevelText if subtitle not provided
  const displaySubtitle = type === 'risk' && typeof value === 'number' 
    ? getRiskLevelText(value) 
    : subtitle;

  const accessibilityHintText = type === 'invested' 
    ? 'Total amount you have invested in your portfolio'
    : 'Your portfolio risk assessment score';

  return (
    <View
      style={[styles.container, { backgroundColor }]}
      accessible={true}
      accessibilityRole="none"
      accessibilityLabel={`${label}: ${type === 'invested' ? '$' : ''}${formattedValue}, ${displaySubtitle}`}
      accessibilityHint={accessibilityHintText}
    >
      <View 
        style={styles.headerRow}
        accessibilityElementsHidden={true}
      >
        <Text style={styles.label}>{label}</Text>
        <Ionicons name={iconName} size={20} color={Colors.light.textSecondary} />
      </View>
      <Text 
        style={styles.value} 
        numberOfLines={1}
        accessibilityElementsHidden={true}
      >
        {formattedValue}
      </Text>
      <Text 
        style={styles.subtitle}
        accessibilityElementsHidden={true}
      >
        {displaySubtitle}
      </Text>
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  label: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.normal,
    color: Colors.light.textSecondary,
  },
  value: {
    fontSize: Typography.fontSizes.xl,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.light.text,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.normal,
    color: Colors.light.textSecondary,
  },
});

export default StatsCard;
