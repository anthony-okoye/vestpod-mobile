/**
 * DashboardSkeleton Component
 * 
 * Skeleton screen for the Dashboard with chart placeholder and stats cards
 */

import React from 'react';
import { View, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { ShimmerEffect } from '../ShimmerEffect';
import { SkeletonChart } from './SkeletonChart';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export function DashboardSkeleton(): React.ReactElement {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Total Portfolio Value Card */}
      <View style={styles.valueCard}>
        <ShimmerEffect width={140} height={14} borderRadius={4} />
        <ShimmerEffect width={180} height={36} borderRadius={4} style={styles.valueAmount} />
        <View style={styles.changeRow}>
          <ShimmerEffect width={80} height={16} borderRadius={4} />
          <ShimmerEffect width={60} height={16} borderRadius={4} style={styles.changePercent} />
        </View>
      </View>

      {/* Time Period Selector */}
      <View style={styles.periodSelector}>
        {['1D', '1W', '1M', '3M', '1Y', 'ALL'].map((_, index) => (
          <ShimmerEffect
            key={index}
            width={(SCREEN_WIDTH - 48) / 6 - 4}
            height={36}
            borderRadius={8}
          />
        ))}
      </View>

      {/* Portfolio Line Chart */}
      <SkeletonChart type="line" height={200} style={styles.chart} />

      {/* Asset Allocation Section */}
      <View style={styles.section}>
        <ShimmerEffect width={120} height={18} borderRadius={4} style={styles.sectionTitle} />
        <View style={styles.allocationContainer}>
          {[0, 1, 2, 3].map((index) => (
            <View key={index} style={styles.allocationItem}>
              <ShimmerEffect width={12} height={12} borderRadius={6} />
              <ShimmerEffect width={80} height={14} borderRadius={4} style={styles.allocationLabel} />
              <ShimmerEffect width={40} height={14} borderRadius={4} />
            </View>
          ))}
        </View>
      </View>

      {/* Quick Stats Cards */}
      <View style={styles.section}>
        <ShimmerEffect width={100} height={18} borderRadius={4} style={styles.sectionTitle} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.statsRow}>
            {[0, 1, 2, 3].map((index) => (
              <View key={index} style={styles.statCard}>
                <ShimmerEffect width={80} height={12} borderRadius={4} />
                <ShimmerEffect width={100} height={16} borderRadius={4} style={styles.statValue} />
                <ShimmerEffect width={60} height={14} borderRadius={4} style={styles.statChange} />
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  contentContainer: {
    padding: 16,
  },
  valueCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  valueAmount: {
    marginTop: 12,
    marginBottom: 12,
  },
  changeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  changePercent: {
    marginLeft: 8,
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
    justifyContent: 'space-between',
  },
  chart: {
    marginBottom: 16,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  allocationContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
  },
  allocationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  allocationLabel: {
    flex: 1,
    marginLeft: 12,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    width: 150,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#E5E7EB',
  },
  statValue: {
    marginTop: 8,
  },
  statChange: {
    marginTop: 4,
  },
});

export default DashboardSkeleton;
