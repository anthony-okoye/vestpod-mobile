/**
 * DashboardHeader Component
 * 
 * Displays gradient header with greeting, portfolio value, and daily change.
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing } from '../../constants/theme';

export interface DashboardHeaderProps {
  userName: string;
  totalValue: number;
  dailyChange: number;
  dailyChangePercent: number;
}

/**
 * Returns time-based greeting based on current hour
 * Hours 0-11: "Good morning,"
 * Hours 12-17: "Good afternoon,"
 * Hours 18-23: "Good evening,"
 */
export function getGreeting(hour: number = new Date().getHours()): string {
  if (hour >= 0 && hour < 12) {
    return 'Good morning,';
  } else if (hour >= 12 && hour < 18) {
    return 'Good afternoon,';
  } else {
    return 'Good evening,';
  }
}

/**
 * Formats currency value with $ symbol and thousand separators
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Returns color based on value sign
 * Green (#10B981) for positive/zero, Red (#EF4444) for negative
 */
export function getChangeColor(value: number): string {
  return value >= 0 ? Colors.light.success : Colors.light.error;
}

export function DashboardHeader({
  userName,
  totalValue,
  dailyChange,
  dailyChangePercent,
}: DashboardHeaderProps) {
  const greeting = getGreeting();
  const changeColor = getChangeColor(dailyChange);
  const isPositive = dailyChange >= 0;
  const trendIcon = isPositive ? 'trending-up' : 'trending-down';
  const changeSign = isPositive ? '+' : '';
  const trendDescription = isPositive ? 'up' : 'down';

  return (
    <LinearGradient
      colors={[Colors.light.dashboardGradientStart, Colors.light.dashboardGradientEnd]}
      style={styles.container}
      accessible={true}
      accessibilityRole="header"
      accessibilityLabel={`Portfolio summary. ${greeting} ${userName}. Total portfolio value ${formatCurrency(totalValue)}. Today's change ${changeSign}${formatCurrency(Math.abs(dailyChange))}, ${trendDescription} ${Math.abs(dailyChangePercent).toFixed(2)} percent`}
    >
      <View 
        style={styles.greetingContainer}
        accessible={true}
        accessibilityLabel={`${greeting} ${userName}`}
      >
        <Text style={styles.greetingText}>
          {greeting}
        </Text>
        <Text style={styles.userName}>
          {userName}
        </Text>
      </View>

      <View 
        style={styles.valueContainer}
        accessible={true}
        accessibilityLabel={`Total portfolio value ${formatCurrency(totalValue)}`}
      >
        <Text style={styles.valueLabel}>Total Portfolio Value</Text>
        <Text style={styles.valueAmount}>
          {formatCurrency(totalValue)}
        </Text>
      </View>

      <View 
        style={styles.changeContainer} 
        accessible={true}
        accessibilityLabel={`Daily change ${changeSign}${formatCurrency(Math.abs(dailyChange))}, ${trendDescription} ${Math.abs(dailyChangePercent).toFixed(2)} percent`}
        accessibilityHint="Shows today's portfolio value change"
      >
        <Ionicons 
          name={trendIcon} 
          size={20} 
          color={changeColor}
          accessibilityElementsHidden={true}
        />
        <Text style={[styles.changeAmount, { color: changeColor }]}>
          {changeSign}{formatCurrency(Math.abs(dailyChange))}
        </Text>
        <Text style={[styles.changePercent, { color: changeColor }]}>
          ({changeSign}{dailyChangePercent.toFixed(2)}%)
        </Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: Spacing['2xl'],
    paddingBottom: Spacing.xl,
    paddingHorizontal: Spacing.base,
  },
  greetingContainer: {
    marginBottom: Spacing.lg,
  },
  greetingText: {
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.normal,
    color: Colors.light.dashboardHeaderSubtext,
  },
  userName: {
    fontSize: Typography.fontSizes['2xl'],
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.light.dashboardHeaderText,
  },
  valueContainer: {
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  valueLabel: {
    fontSize: Typography.fontSizes.md,
    fontWeight: Typography.fontWeights.normal,
    color: Colors.light.dashboardHeaderSubtext,
    marginBottom: Spacing.xs,
  },
  valueAmount: {
    fontSize: Typography.fontSizes['4xl'],
    fontWeight: Typography.fontWeights.bold,
    color: Colors.light.dashboardHeaderText,
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
  },
  changeAmount: {
    fontSize: Typography.fontSizes.base,
    fontWeight: Typography.fontWeights.semibold,
  },
  changePercent: {
    fontSize: Typography.fontSizes.base,
    fontWeight: Typography.fontWeights.semibold,
  },
});

export default DashboardHeader;
