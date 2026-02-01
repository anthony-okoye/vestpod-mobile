// mobile/components/charts/PortfolioLineChart.tsx
/**
 * Portfolio Line Chart Component
 * 
 * Interactive line chart showing portfolio value over time
 * Requirements: 6
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

interface DataPoint {
  timestamp: string;
  value: number;
}

interface PortfolioLineChartProps {
  data: DataPoint[];
  timePeriod: string;
}

export default function PortfolioLineChart({ data, timePeriod }: PortfolioLineChartProps) {
  const [selectedPoint, setSelectedPoint] = useState<{ value: number; date: string } | null>(null);

  if (!data || data.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No price history available</Text>
      </View>
    );
  }

  const chartData = {
    labels: data.slice(-7).map((point) => {
      const date = new Date(point.timestamp);
      return `${date.getMonth() + 1}/${date.getDate()}`;
    }),
    datasets: [
      {
        data: data.slice(-7).map((point) => point.value),
        color: (opacity = 1) => `rgba(10, 126, 164, ${opacity})`,
        strokeWidth: 2,
      },
    ],
  };

  const chartConfig = {
    backgroundColor: '#FFFFFF',
    backgroundGradientFrom: '#FFFFFF',
    backgroundGradientTo: '#FFFFFF',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(10, 126, 164, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(104, 112, 118, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: '#0a7ea4',
    },
    propsForBackgroundLines: {
      strokeDasharray: '',
      stroke: '#E5E7EB',
      strokeWidth: 1,
    },
  };

  const handleDataPointClick = (data: { index: number; value: number; x: number; y: number }) => {
    const point = chartData.labels[data.index];
    setSelectedPoint({
      value: data.value,
      date: point,
    });
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <View style={styles.container}>
      {selectedPoint && (
        <View style={styles.tooltip}>
          <Text style={styles.tooltipValue}>{formatCurrency(selectedPoint.value)}</Text>
          <Text style={styles.tooltipDate}>{selectedPoint.date}</Text>
        </View>
      )}
      <LineChart
        data={chartData}
        width={screenWidth - 48}
        height={200}
        chartConfig={chartConfig}
        bezier
        style={styles.chart}
        onDataPointClick={handleDataPointClick}
        withInnerLines={true}
        withOuterLines={false}
        withVerticalLines={false}
        withHorizontalLines={true}
        withVerticalLabels={true}
        withHorizontalLabels={true}
        fromZero={false}
      />
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
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  tooltip: {
    backgroundColor: '#11181C',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    alignSelf: 'center',
  },
  tooltipValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  tooltipDate: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 4,
  },
});
