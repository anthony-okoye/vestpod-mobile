/**
 * AllocationCard Component
 * 
 * White card with donut chart and legend showing asset allocation.
 * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6
 */

import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';

const screenWidth = Dimensions.get('window').width;

export interface AllocationItem {
  type: string;
  value: number;
  percentage: number;
  color: string;
}

export interface AllocationCardProps {
  data: AllocationItem[];
}

/**
 * Maps asset type to predefined color from theme
 * stock → #1E3A8A, crypto → #059669, real_estate → #F59E0B,
 * fixed_income → #8B5CF6, commodity → #EC4899
 */
export function getAssetTypeColor(type: string): string {
  const colorMap: Record<string, string> = {
    stock: Colors.light.allocationStocks,
    crypto: Colors.light.allocationCrypto,
    real_estate: Colors.light.allocationRealEstate,
    fixed_income: Colors.light.allocationFixedIncome,
    commodity: Colors.light.allocationCommodities,
  };
  return colorMap[type.toLowerCase()] || Colors.light.textSecondary;
}

/**
 * Formats asset type name for display (replaces underscores with spaces, capitalizes)
 */
function formatAssetTypeName(type: string): string {
  return type
    .replace(/_/g, ' ')
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

export function AllocationCard({ data }: AllocationCardProps) {
  if (!data || data.length === 0) {
    return (
      <View 
        style={styles.container} 
        accessible={true}
        accessibilityLabel="Asset allocation card with no data"
      >
        <Text 
          style={styles.title}
          accessible={true}
          accessibilityRole="header"
        >
          Asset Allocation
        </Text>
        <View 
          style={styles.emptyContainer}
          accessible={true}
          accessibilityLabel="No allocation data available"
        >
          <Text style={styles.emptyText}>No allocation data available</Text>
        </View>
      </View>
    );
  }

  // Prepare chart data for PieChart with inner radius (donut effect)
  const chartData = data.map((item) => ({
    name: formatAssetTypeName(item.type),
    population: item.value,
    color: item.color || getAssetTypeColor(item.type),
    legendFontColor: Colors.light.textSecondary,
    legendFontSize: 12,
  }));

  const chartConfig = {
    backgroundColor: Colors.light.card,
    backgroundGradientFrom: Colors.light.card,
    backgroundGradientTo: Colors.light.card,
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  };

  // Chart dimensions - smaller to fit legend on right
  const chartSize = 140;

  // Build allocation summary for accessibility
  const allocationSummary = data
    .map((item) => `${formatAssetTypeName(item.type)} ${item.percentage.toFixed(1)} percent`)
    .join(', ');

  return (
    <View
      style={styles.container}
      accessible={true}
      accessibilityRole="none"
      accessibilityLabel={`Asset allocation chart showing ${data.length} asset types`}
      accessibilityHint="Shows how your portfolio is distributed across different asset types"
    >
      <Text 
        style={styles.title}
        accessible={true}
        accessibilityRole="header"
      >
        Asset Allocation
      </Text>

      <View style={styles.contentRow}>
        {/* Donut Chart */}
        <View 
          style={styles.chartContainer}
          accessible={true}
          accessibilityRole="image"
          accessibilityLabel={`Donut chart showing allocation: ${allocationSummary}`}
        >
          <PieChart
            data={chartData}
            width={chartSize}
            height={chartSize}
            chartConfig={chartConfig}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="0"
            hasLegend={false}
            center={[chartSize / 4, 0]}
            absolute={false}
          />
        </View>

        {/* Legend positioned to the right */}
        <View 
          style={styles.legendContainer}
          accessible={true}
          accessibilityRole="list"
          accessibilityLabel="Asset allocation breakdown"
        >
          {data.map((item) => (
            <View 
              key={item.type} 
              style={styles.legendItem}
              accessible={true}
              accessibilityRole="text"
              accessibilityLabel={`${formatAssetTypeName(item.type)}: ${item.percentage.toFixed(1)} percent of portfolio`}
            >
              <View
                style={[
                  styles.legendDot,
                  { backgroundColor: item.color || getAssetTypeColor(item.type) },
                ]}
                accessibilityElementsHidden={true}
              />
              <View style={styles.legendTextContainer}>
                <Text style={styles.legendLabel} numberOfLines={1}>
                  {formatAssetTypeName(item.type)}
                </Text>
                <Text style={styles.legendPercentage}>
                  {item.percentage.toFixed(1)}%
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.light.card,
    borderRadius: BorderRadius.xl,
    padding: Spacing.base,
    marginHorizontal: Spacing.base,
    marginTop: Spacing.base,
  },
  title: {
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.light.text,
    marginBottom: Spacing.md,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  legendContainer: {
    flex: 1,
    marginLeft: Spacing.base,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: Spacing.sm,
  },
  legendTextContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  legendLabel: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.medium,
    color: Colors.light.text,
    flex: 1,
  },
  legendPercentage: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.light.textSecondary,
    marginLeft: Spacing.sm,
  },
  emptyContainer: {
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: Typography.fontSizes.md,
    color: Colors.light.textTertiary,
  },
});

export default AllocationCard;
