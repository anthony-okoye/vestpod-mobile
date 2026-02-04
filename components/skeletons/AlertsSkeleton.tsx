/**
 * AlertsSkeleton Component
 * 
 * Skeleton screen for the Alerts list
 */

import React from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { ShimmerEffect } from '../ShimmerEffect';

interface AlertsSkeletonProps {
  itemCount?: number;
}

export function AlertsSkeleton({ itemCount = 5 }: AlertsSkeletonProps): React.ReactElement {
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <ShimmerEffect width={80} height={24} borderRadius={4} />
        <ShimmerEffect width={32} height={32} borderRadius={4} />
      </View>

      {/* Alert List */}
      <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
        {Array.from({ length: itemCount }).map((_, index) => (
          <View key={index} style={styles.alertCard}>
            {/* Alert Header */}
            <View style={styles.alertHeader}>
              <ShimmerEffect width={32} height={32} borderRadius={8} />
              <View style={styles.alertInfo}>
                <ShimmerEffect width={100} height={16} borderRadius={4} />
                <ShimmerEffect width={80} height={12} borderRadius={4} style={styles.alertType} />
              </View>
              <ShimmerEffect width={50} height={28} borderRadius={14} />
            </View>
            
            {/* Alert Condition */}
            <View style={styles.alertCondition}>
              <ShimmerEffect width={90} height={14} borderRadius={4} />
              <ShimmerEffect width={60} height={14} borderRadius={4} style={styles.conditionValue} />
            </View>
            
            {/* Alert Actions */}
            <View style={styles.alertActions}>
              <ShimmerEffect width={70} height={18} borderRadius={4} />
            </View>
          </View>
        ))}
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
  list: {
    padding: 16,
  },
  alertCard: {
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
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  alertInfo: {
    flex: 1,
    marginLeft: 12,
  },
  alertType: {
    marginTop: 4,
  },
  alertCondition: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  conditionValue: {
    marginLeft: 8,
  },
  alertActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
});

export default AlertsSkeleton;
