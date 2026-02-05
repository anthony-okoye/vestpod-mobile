/**
 * AssetCard Component
 * 
 * Displays individual asset with logo, details, value, and sparkline chart
 * Requirements: 2.2
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
import { LineChart } from 'react-native-chart-kit';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/theme';

interface AssetCardProps {
  asset: {
    id: string;
    name: string;
    ticker: string;
    logo?: string;
    quantity: number;
    totalValue: number;
    changePercent: number;
    sparklineData: number[];
  };
  onPress: (id: string) => void;
}

export default function AssetCard({ asset, onPress }: AssetCardProps) {
  const isPositive = asset.changePercent >= 0;
  const changeColor = isPositive ? Colors.light.success : Colors.light.error;

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

  // Prepare sparkline data
  const sparklineData = asset.sparklineData.length > 0 
    ? asset.sparklineData 
    : [0, 0, 0, 0, 0];

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress(asset.id)}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        {/* Left Section: Logo and Info */}
        <View style={styles.leftSection}>
          <View style={styles.logoContainer}>
            {asset.logo ? (
              <Text style={styles.logoEmoji}>{asset.logo}</Text>
            ) : (
              <Ionicons name="briefcase" size={24} color={Colors.light.textSecondary} />
            )}
          </View>
          <View style={styles.infoContainer}>
            <Text style={styles.assetName} numberOfLines={1}>
              {asset.name}
            </Text>
            <Text style={styles.assetDetails} numberOfLines={1}>
              {asset.ticker} • {asset.quantity.toLocaleString()} units
            </Text>
          </View>
        </View>

        {/* Right Section: Value and Change */}
        <View style={styles.rightSection}>
          <Text style={styles.totalValue}>{formatCurrency(asset.totalValue)}</Text>
          <View style={styles.changeContainer}>
            <Ionicons
              name={isPositive ? 'trending-up' : 'trending-down'}
              size={14}
              color={changeColor}
            />
            <Text style={[styles.changeText, { color: changeColor }]}>
              {formatPercentage(asset.changePercent)}
            </Text>
          </View>
        </View>
      </View>

      {/* Sparkline Chart */}
      <View style={styles.chartContainer}>
        <LineChart
          data={{
            labels: [],
            datasets: [
              {
                data: sparklineData,
              },
            ],
          }}
          width={320}
          height={32}
          chartConfig={{
            backgroundColor: 'transparent',
            backgroundGradientFrom: Colors.light.background,
            backgroundGradientTo: Colors.light.background,
            decimalPlaces: 0,
            color: () => changeColor,
            strokeWidth: 1.5,
            propsForDots: {
              r: '0',
            },
            propsForBackgroundLines: {
              strokeWidth: 0,
            },
          }}
          bezier
          withVerticalLabels={false}
          withHorizontalLabels={false}
          withDots={false}
          withInnerLines={false}
          withOuterLines={false}
          withVerticalLines={false}
          withHorizontalLines={false}
          style={styles.chart}
        />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.light.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    marginBottom: Spacing.md,
    ...Platform.select({
      ios: {
        shadowColor: Colors.light.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: Spacing.md,
  },
  logoContainer: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.light.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  logoEmoji: {
    fontSize: 24,
  },
  infoContainer: {
    flex: 1,
  },
  assetName: {
    fontSize: Typography.fontSizes.base,
    fontWeight: Typography.fontWeights.medium,
    color: Colors.light.text,
    marginBottom: 2,
  },
  assetDetails: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.light.textSecondary,
  },
  rightSection: {
    alignItems: 'flex-end',
  },
  totalValue: {
    fontSize: Typography.fontSizes.base,
    fontWeight: Typography.fontWeights.medium,
    color: Colors.light.text,
    marginBottom: 2,
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  changeText: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.medium,
  },
  chartContainer: {
    marginTop: Spacing.xs,
    marginLeft: -Spacing.base,
    marginRight: -Spacing.base,
    marginBottom: -Spacing.sm,
    overflow: 'hidden',
  },
  chart: {
    marginLeft: -16,
    paddingRight: 0,
  },
});
