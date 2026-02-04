/**
 * AssetDetailSkeleton Component
 * 
 * Skeleton screen for the Asset Detail view
 */

import React from 'react';
import { View, StyleSheet, ScrollView, Dimensions, SafeAreaView } from 'react-native';
import { ShimmerEffect } from '../ShimmerEffect';
import { SkeletonChart } from './SkeletonChart';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export function AssetDetailSkeleton(): React.ReactElement {
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <ShimmerEffect width={24} height={24} borderRadius={4} />
        <ShimmerEffect width={80} height={18} borderRadius={4} />
        <View style={styles.headerActions}>
          <ShimmerEffect width={24} height={24} borderRadius={4} />
          <ShimmerEffect width={24} height={24} borderRadius={4} style={styles.headerButton} />
        </View>
      </View>

      <ScrollView style={styles.content}>
        {/* Asset Info Card */}
        <View style={styles.assetCard}>
          <View style={styles.assetTypeIndicator} />
          <View style={styles.assetInfo}>
            <ShimmerEffect width={100} height={20} borderRadius={4} />
            <ShimmerEffect width={150} height={14} borderRadius={4} style={styles.assetName} />
            <ShimmerEffect width={80} height={12} borderRadius={4} style={styles.assetType} />
          </View>
          <View style={styles.priceContainer}>
            <ShimmerEffect width={90} height={18} borderRadius={4} />
            <ShimmerEffect width={60} height={14} borderRadius={4} style={styles.priceChange} />
          </View>
        </View>

        {/* Performance Chart Section */}
        <View style={styles.chartSection}>
          <ShimmerEffect width={100} height={16} borderRadius={4} style={styles.sectionTitle} />
          
          {/* Time Period Selector */}
          <View style={styles.periodSelector}>
            {['1D', '1W', '1M', '3M', '1Y', 'ALL'].map((_, index) => (
              <ShimmerEffect
                key={index}
                width={40}
                height={28}
                borderRadius={16}
              />
            ))}
          </View>

          {/* Chart */}
          <SkeletonChart type="line" width={SCREEN_WIDTH - 64} height={180} />
        </View>

        {/* Key Metrics Section */}
        <View style={styles.metricsSection}>
          <ShimmerEffect width={100} height={16} borderRadius={4} style={styles.sectionTitle} />
          
          <View style={styles.metricsGrid}>
            {['Total Value', 'Total Cost', 'Gain/Loss', 'Quantity', 'Purchase Price', 'Purchase Date'].map((_, index) => (
              <View key={index} style={styles.metricCard}>
                <ShimmerEffect width={80} height={12} borderRadius={4} />
                <ShimmerEffect width={70} height={16} borderRadius={4} style={styles.metricValue} />
              </View>
            ))}
          </View>
        </View>

        {/* Additional Info Section */}
        <View style={styles.additionalSection}>
          <ShimmerEffect width={160} height={16} borderRadius={4} style={styles.sectionTitle} />
          {[0, 1, 2].map((index) => (
            <View key={index} style={styles.additionalRow}>
              <ShimmerEffect width={100} height={14} borderRadius={4} />
              <ShimmerEffect width={80} height={14} borderRadius={4} />
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  headerButton: {
    marginLeft: 12,
  },
  content: {
    flex: 1,
  },
  assetCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    margin: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  assetTypeIndicator: {
    width: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    marginRight: 12,
  },
  assetInfo: {
    flex: 1,
  },
  assetName: {
    marginTop: 4,
  },
  assetType: {
    marginTop: 4,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  priceChange: {
    marginTop: 4,
  },
  chartSection: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  periodSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  metricsSection: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricCard: {
    width: '47%',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
  },
  metricValue: {
    marginTop: 4,
  },
  additionalSection: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  additionalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
});

export default AssetDetailSkeleton;
