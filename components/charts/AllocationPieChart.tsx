// mobile/components/charts/AllocationPieChart.tsx
/**
 * Asset Allocation Pie Chart Component
 * 
 * Donut chart showing asset allocation by type
 * Requirements: 6
 */

import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { PieChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

interface AllocationItem {
  type: string;
  value: number;
  percentage: number;
  color: string;
}

interface AllocationPieChartProps {
  data: AllocationItem[];
}

export default function AllocationPieChart({ data }: AllocationPieChartProps) {
  if (!data || data.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No allocation data available</Text>
      </View>
    );
  }

  const chartData = data.map((item) => ({
    name: item.type.replace('_', ' '),
    population: item.value,
    color: item.color,
    legendFontColor: '#687076',
    legendFontSize: 12,
  }));

  const chartConfig = {
    backgroundColor: '#FFFFFF',
    backgroundGradientFrom: '#FFFFFF',
    backgroundGradientTo: '#FFFFFF',
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  };

  const formatCurrency = (value: number): string => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`;
    }
    return `$${value.toFixed(0)}`;
  };

  return (
    <View style={styles.container}>
      <PieChart
        data={chartData}
        width={screenWidth - 48}
        height={200}
        chartConfig={chartConfig}
        accessor="population"
        backgroundColor="transparent"
        paddingLeft="15"
        absolute={false}
      />
      
      {/* Custom Legend */}
      <View style={styles.legend}>
        {data.map((item) => (
          <View key={item.type} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: item.color }]} />
            <View style={styles.legendTextContainer}>
              <Text style={styles.legendLabel}>
                {item.type.replace('_', ' ').toUpperCase()}
              </Text>
              <Text style={styles.legendValue}>
                {formatCurrency(item.value)} ({item.percentage.toFixed(1)}%)
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
  },
  emptyContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
  },
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  legend: {
    marginTop: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  legendTextContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  legendLabel: {
    fontSize: 14,
    color: '#11181C',
    fontWeight: '500',
  },
  legendValue: {
    fontSize: 14,
    color: '#687076',
  },
});
