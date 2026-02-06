/**
 * PerformanceCard Component
 * 
 * White card containing performance chart with time period selector.
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';

const screenWidth = Dimensions.get('window').width;

export type TimePeriod = '1D' | '1W' | '1M' | '3M' | '1Y' | 'ALL';

const TIME_PERIODS: TimePeriod[] = ['1D', '1W', '1M', '3M', '1Y', 'ALL'];

export interface PerformanceDataPoint {
  timestamp: string;
  value: number;
}

export interface PerformanceCardProps {
  data: PerformanceDataPoint[];
  selectedPeriod: TimePeriod;
  onPeriodChange: (period: TimePeriod) => void;
}

/**
 * Determines chart line color based on trend (start vs end value)
 * Green (#10B981) when ending >= starting, Red (#EF4444) when ending < starting
 */
export function getTrendColor(data: PerformanceDataPoint[]): string {
  if (!data || data.length < 2) {
    return Colors.light.success;
  }
  const startValue = data[0].value;
  const endValue = data[data.length - 1].value;
  return endValue >= startValue ? Colors.light.success : Colors.light.error;
}

/**
 * Formats date labels for x-axis based on timestamp
 */
function formatDateLabel(timestamp: string): string {
  const date = new Date(timestamp);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[date.getMonth()]} ${date.getDate()}`;
}

export function PerformanceCard({
  data,
  selectedPeriod,
  onPeriodChange,
}: PerformanceCardProps) {
  const trendColor = getTrendColor(data);
  const hasData = data && data.length > 0;

  // Prepare chart data - limit to reasonable number of points for display
  const displayData = hasData ? data.slice(-7) : [];
  const chartLabels = displayData.map((point) => formatDateLabel(point.timestamp));
  const chartValues = displayData.map((point) => point.value);

  const chartData = {
    labels: chartLabels,
    datasets: [
      {
        data: chartValues.length > 0 ? chartValues : [0],
        color: (opacity = 1) => {
          const rgb = trendColor === Colors.light.success ? '16, 185, 129' : '239, 68, 68';
          return `rgba(${rgb}, ${opacity})`;
        },
        strokeWidth: 2,
      },
    ],
  };

  const chartConfig = {
    backgroundColor: Colors.light.card,
    backgroundGradientFrom: Colors.light.card,
    backgroundGradientTo: Colors.light.card,
    decimalPlaces: 0,
    color: (opacity = 1) => {
      const rgb = trendColor === Colors.light.success ? '16, 185, 129' : '239, 68, 68';
      return `rgba(${rgb}, ${opacity})`;
    },
    labelColor: () => Colors.light.textSecondary,
    style: {
      borderRadius: BorderRadius.xl,
    },
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: trendColor,
    },
    propsForBackgroundLines: {
      strokeDasharray: '',
      stroke: Colors.light.borderLight,
      strokeWidth: 1,
    },
  };

  const trendDirection = hasData && displayData.length >= 2 
    ? (displayData[displayData.length - 1].value >= displayData[0].value ? 'positive' : 'negative')
    : 'neutral';

  return (
    <View
      style={styles.container}
      accessible={true}
      accessibilityRole="none"
      accessibilityLabel={`Performance chart showing ${selectedPeriod} time period. Trend is ${trendDirection}`}
      accessibilityHint="Displays portfolio performance over time. Use the time period buttons to change the view"
    >
      <Text 
        style={styles.title}
        accessible={true}
        accessibilityRole="header"
      >
        Performance
      </Text>

      <View 
        style={styles.periodSelector}
        accessible={true}
        accessibilityRole="tablist"
        accessibilityLabel="Time period selector"
      >
        {TIME_PERIODS.map((period) => (
          <TouchableOpacity
            key={period}
            style={[
              styles.periodTab,
              selectedPeriod === period && styles.periodTabSelected,
            ]}
            onPress={() => onPeriodChange(period)}
            accessible={true}
            accessibilityRole="tab"
            accessibilityState={{ selected: selectedPeriod === period }}
            accessibilityLabel={`${period} time period${selectedPeriod === period ? ', selected' : ''}`}
            accessibilityHint={`Double tap to view ${period} performance`}
          >
            <Text
              style={[
                styles.periodText,
                selectedPeriod === period && styles.periodTextSelected,
              ]}
            >
              {period}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {hasData ? (
        <View
          accessible={true}
          accessibilityRole="image"
          accessibilityLabel={`Line chart showing portfolio performance over ${selectedPeriod}. Current trend is ${trendDirection}`}
        >
          <LineChart
            data={chartData}
            width={screenWidth - 64}
            height={180}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
            withInnerLines={true}
            withOuterLines={false}
            withVerticalLines={false}
            withHorizontalLines={true}
            withVerticalLabels={true}
            withHorizontalLabels={true}
            fromZero={false}
          />
        </View>
      ) : (
        <View 
          style={styles.emptyContainer}
          accessible={true}
          accessibilityLabel="No performance data available"
        >
          <Text style={styles.emptyText}>No performance data available</Text>
        </View>
      )}
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
  periodSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.base,
    backgroundColor: Colors.light.backgroundSecondary,
    borderRadius: BorderRadius.md,
    padding: Spacing.xs,
  },
  periodTab: {
    flex: 1,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xs,
    alignItems: 'center',
    borderRadius: BorderRadius.sm,
  },
  periodTabSelected: {
    backgroundColor: Colors.light.buttonPrimary,
  },
  periodText: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.medium,
    color: Colors.light.textSecondary,
  },
  periodTextSelected: {
    color: Colors.light.card,
  },
  chart: {
    marginVertical: Spacing.sm,
    borderRadius: BorderRadius.xl,
    marginLeft: -Spacing.base,
  },
  emptyContainer: {
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: Typography.fontSizes.md,
    color: Colors.light.textTertiary,
  },
});

export default PerformanceCard;
