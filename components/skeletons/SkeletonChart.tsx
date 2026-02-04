/**
 * SkeletonChart Component
 * 
 * Placeholder for charts with shimmer animation
 * Supports line charts and pie/donut charts
 */

import React from 'react';
import { View, StyleSheet, ViewStyle, Dimensions } from 'react-native';
import { ShimmerEffect } from '../ShimmerEffect';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type ChartType = 'line' | 'pie' | 'bar';

interface SkeletonChartProps {
  type?: ChartType;
  width?: number;
  height?: number;
  style?: ViewStyle;
}

export function SkeletonChart({
  type = 'line',
  width = SCREEN_WIDTH - 32,
  height = 200,
  style,
}: SkeletonChartProps): React.ReactElement {
  if (type === 'pie') {
    const size = Math.min(width, height);
    return (
      <View style={[styles.container, { width, height }, style]}>
        <ShimmerEffect
          width={size * 0.8}
          height={size * 0.8}
          borderRadius={size * 0.4}
        />
      </View>
    );
  }

  if (type === 'bar') {
    return (
      <View style={[styles.container, styles.barContainer, { width, height }, style]}>
        <View style={styles.barChart}>
          {[0.6, 0.8, 0.5, 0.9, 0.7, 0.4].map((heightRatio, index) => (
            <ShimmerEffect
              key={index}
              width={(width - 60) / 6 - 8}
              height={height * heightRatio * 0.7}
              borderRadius={4}
            />
          ))}
        </View>
        <ShimmerEffect
          width={width - 20}
          height={1}
          borderRadius={0}
          style={styles.xAxis}
        />
      </View>
    );
  }

  // Line chart skeleton
  return (
    <View style={[styles.container, { width, height }, style]}>
      <View style={styles.lineChart}>
        {/* Y-axis labels */}
        <View style={styles.yAxis}>
          {[0, 1, 2, 3].map((index) => (
            <ShimmerEffect
              key={index}
              width={30}
              height={10}
              borderRadius={4}
            />
          ))}
        </View>
        {/* Chart area */}
        <View style={styles.chartArea}>
          <ShimmerEffect
            width={width - 60}
            height={height - 40}
            borderRadius={8}
          />
        </View>
      </View>
      {/* X-axis labels */}
      <View style={styles.xAxisLabels}>
        {[0, 1, 2, 3, 4].map((index) => (
          <ShimmerEffect
            key={index}
            width={30}
            height={10}
            borderRadius={4}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lineChart: {
    flexDirection: 'row',
    flex: 1,
    width: '100%',
  },
  yAxis: {
    width: 40,
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  chartArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  xAxisLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingLeft: 40,
    marginTop: 8,
  },
  barContainer: {
    justifyContent: 'flex-end',
  },
  barChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    flex: 1,
    paddingHorizontal: 10,
    paddingBottom: 20,
  },
  xAxis: {
    marginTop: 8,
  },
});

export default SkeletonChart;
