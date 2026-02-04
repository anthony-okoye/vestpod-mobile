/**
 * AssetListSkeleton Component
 * 
 * Skeleton screen for the Assets list with multiple asset card placeholders
 */

import React from 'react';
import { View, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { ShimmerEffect } from '../ShimmerEffect';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface AssetListSkeletonProps {
  itemCount?: number;
}

export function AssetListSkeleton({ itemCount = 5 }: AssetListSkeletonProps): React.ReactElement {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <ShimmerEffect width={80} height={24} borderRadius={4} />
          <ShimmerEffect width={120} height={14} borderRadius={4} style={styles.headerSubtitle} />
        </View>
        <ShimmerEffect width={40} height={40} borderRadius={20} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <ShimmerEffect width={SCREEN_WIDTH - 32} height={44} borderRadius={12} />
      </View>

      {/* Filter Chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
        <View style={styles.filterList}>
          {['All', 'Stocks', 'Crypto', 'Commodities', 'Real Estate'].map((_, index) => (
            <ShimmerEffect
              key={index}
              width={70 + Math.random() * 30}
              height={32}
              borderRadius={20}
              style={styles.filterChip}
            />
          ))}
        </View>
      </ScrollView>

      {/* Sort Options */}
      <View style={styles.sortContainer}>
        <ShimmerEffect width={50} height={14} borderRadius={4} />
        <View style={styles.sortButtons}>
          <ShimmerEffect width={60} height={28} borderRadius={6} style={styles.sortButton} />
          <ShimmerEffect width={80} height={28} borderRadius={6} style={styles.sortButton} />
          <ShimmerEffect width={50} height={28} borderRadius={6} style={styles.sortButton} />
        </View>
      </View>

      {/* Asset List */}
      <ScrollView style={styles.listContent} showsVerticalScrollIndicator={false}>
        {Array.from({ length: itemCount }).map((_, index) => (
          <View key={index} style={styles.assetCard}>
            <View style={styles.assetTypeIndicator} />
            <View style={styles.assetInfo}>
              <View style={styles.assetHeader}>
                <ShimmerEffect width={120} height={16} borderRadius={4} />
                <ShimmerEffect width={40} height={20} borderRadius={4} style={styles.assetSymbol} />
              </View>
              <ShimmerEffect width={100} height={12} borderRadius={4} style={styles.assetType} />
            </View>
            <View style={styles.assetValues}>
              <ShimmerEffect width={80} height={16} borderRadius={4} />
              <ShimmerEffect width={50} height={14} borderRadius={4} style={styles.assetPerformance} />
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerSubtitle: {
    marginTop: 4,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  filterContainer: {
    marginTop: 12,
  },
  filterList: {
    flexDirection: 'row',
    paddingHorizontal: 16,
  },
  filterChip: {
    marginRight: 8,
  },
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sortButtons: {
    flexDirection: 'row',
    marginLeft: 8,
  },
  sortButton: {
    marginRight: 8,
  },
  listContent: {
    padding: 16,
  },
  assetCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
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
  assetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  assetSymbol: {
    marginLeft: 8,
  },
  assetType: {
    marginTop: 4,
  },
  assetValues: {
    alignItems: 'flex-end',
  },
  assetPerformance: {
    marginTop: 4,
  },
});

export default AssetListSkeleton;
