/**
 * PortfolioCard Component
 * 
 * Displays portfolio summary with name, total value, asset count, and performance.
 * Supports tap and long-press interactions for navigation and options.
 * Requirements: 1.2
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/theme';

export interface PortfolioCardProps {
  portfolio: {
    id: string;
    name: string;
    totalValue: number;
    assetCount: number;
    performance: number;
  };
  onPress: () => void;
  onLongPress: () => void;
}

export default function PortfolioCard({
  portfolio,
  onPress,
  onLongPress,
}: PortfolioCardProps) {
  const isPositive = portfolio.performance >= 0;
  const performanceColor = isPositive ? Colors.light.success : Colors.light.error;

  // Format currency
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  // Format percentage
  const formatPercentage = (value: number): string => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.7}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={`${portfolio.name} portfolio, ${formatCurrency(portfolio.totalValue)}, ${portfolio.assetCount} assets, ${formatPercentage(portfolio.performance)} performance`}
      accessibilityHint="Tap to view portfolio details, long press for options"
    >
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Ionicons name="briefcase" size={24} color={Colors.light.tint} />
        </View>
        <Text style={styles.name} numberOfLines={1}>
          {portfolio.name}
        </Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.value}>{formatCurrency(portfolio.totalValue)}</Text>
        
        <View style={styles.footer}>
          <Text style={styles.assetCount}>
            {portfolio.assetCount} {portfolio.assetCount === 1 ? 'asset' : 'assets'}
          </Text>
          
          <View style={styles.performanceContainer}>
            <Ionicons
              name={isPositive ? 'trending-up' : 'trending-down'}
              size={14}
              color={performanceColor}
            />
            <Text style={[styles.performance, { color: performanceColor }]}>
              {formatPercentage(portfolio.performance)}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.light.card,
    borderRadius: BorderRadius.xl,
    padding: Spacing.base,
    marginBottom: Spacing.md,
    ...Platform.select({
      ios: {
        shadowColor: Colors.light.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.light.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  name: {
    flex: 1,
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.light.text,
  },
  content: {
    gap: Spacing.sm,
  },
  value: {
    fontSize: Typography.fontSizes['2xl'],
    fontWeight: Typography.fontWeights.bold,
    color: Colors.light.text,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  assetCount: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.light.textSecondary,
  },
  performanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  performance: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.medium,
  },
});
