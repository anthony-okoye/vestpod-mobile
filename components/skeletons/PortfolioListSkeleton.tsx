/**
 * PortfolioListSkeleton Component
 * 
 * Skeleton screen for the Portfolio list
 */

import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { ShimmerEffect } from '../ShimmerEffect';

interface PortfolioListSkeletonProps {
  itemCount?: number;
}

export function PortfolioListSkeleton({ itemCount = 4 }: PortfolioListSkeletonProps): React.ReactElement {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <ShimmerEffect width={140} height={24} borderRadius={4} />
        <ShimmerEffect width={40} height={40} borderRadius={20} />
      </View>

      {/* Portfolio List */}
      <ScrollView style={styles.listContent} showsVerticalScrollIndicator={false}>
        {Array.from({ length: itemCount }).map((_, index) => (
          <View key={index} style={styles.portfolioCard}>
            <View style={styles.portfolioInfo}>
              <View style={styles.portfolioHeader}>
                <ShimmerEffect width={150} height={18} borderRadius={4} />
                <ShimmerEffect width={50} height={20} borderRadius={4} style={styles.badge} />
              </View>
              <ShimmerEffect width={120} height={12} borderRadius={4} style={styles.portfolioDate} />
            </View>
            <View style={styles.portfolioActions}>
              <ShimmerEffect width={32} height={32} borderRadius={4} />
              <ShimmerEffect width={32} height={32} borderRadius={4} style={styles.actionButton} />
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
  listContent: {
    padding: 16,
  },
  portfolioCard: {
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
  portfolioInfo: {
    flex: 1,
  },
  portfolioHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  badge: {
    marginLeft: 8,
  },
  portfolioDate: {
    marginTop: 4,
  },
  portfolioActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    marginLeft: 8,
  },
});

export default PortfolioListSkeleton;
