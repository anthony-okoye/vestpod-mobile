/**
 * InsightsSkeleton Component
 * 
 * Skeleton screen for the Insights screen with gauge and charts
 */

import React from 'react';
import { View, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { ShimmerEffect } from '../ShimmerEffect';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export function InsightsSkeleton(): React.ReactElement {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Health Score Card */}
      <View style={styles.healthScoreCard}>
        <ShimmerEffect width={160} height={18} borderRadius={4} style={styles.sectionTitle} />
        <View style={styles.gaugeContainer}>
          <ShimmerEffect width={140} height={140} borderRadius={70} />
        </View>
        <ShimmerEffect width={80} height={20} borderRadius={4} style={styles.healthLabel} />
        <ShimmerEffect width={140} height={12} borderRadius={4} style={styles.generatedAt} />
      </View>

      {/* Risk Analysis Section */}
      <View style={styles.section}>
        <ShimmerEffect width={100} height={18} borderRadius={4} style={styles.sectionTitle} />
        <View style={styles.riskCard}>
          <View style={styles.riskHeader}>
            <ShimmerEffect width={24} height={24} borderRadius={4} />
            <ShimmerEffect width={100} height={18} borderRadius={4} style={styles.riskLevel} />
          </View>
          <View style={styles.riskBarContainer}>
            <ShimmerEffect width={SCREEN_WIDTH - 120} height={12} borderRadius={6} />
            <ShimmerEffect width={50} height={14} borderRadius={4} style={styles.riskScore} />
          </View>
        </View>
      </View>

      {/* Geographic Exposure Section */}
      <View style={styles.section}>
        <ShimmerEffect width={150} height={18} borderRadius={4} style={styles.sectionTitle} />
        <View style={styles.chartCard}>
          {[0, 1, 2, 3].map((index) => (
            <View key={index} style={styles.barItem}>
              <View style={styles.barLabelRow}>
                <ShimmerEffect width={10} height={10} borderRadius={5} />
                <ShimmerEffect width={80} height={14} borderRadius={4} style={styles.barLabel} />
                <ShimmerEffect width={40} height={14} borderRadius={4} />
              </View>
              <ShimmerEffect width="100%" height={8} borderRadius={4} />
            </View>
          ))}
        </View>
      </View>

      {/* Sector Exposure Section */}
      <View style={styles.section}>
        <ShimmerEffect width={130} height={18} borderRadius={4} style={styles.sectionTitle} />
        <View style={styles.chartCard}>
          {[0, 1, 2, 3, 4].map((index) => (
            <View key={index} style={styles.barItem}>
              <View style={styles.barLabelRow}>
                <ShimmerEffect width={10} height={10} borderRadius={5} />
                <ShimmerEffect width={100} height={14} borderRadius={4} style={styles.barLabel} />
                <ShimmerEffect width={40} height={14} borderRadius={4} />
              </View>
              <ShimmerEffect width="100%" height={8} borderRadius={4} />
            </View>
          ))}
        </View>
      </View>

      {/* AI Recommendations Section */}
      <View style={styles.section}>
        <ShimmerEffect width={160} height={18} borderRadius={4} style={styles.sectionTitle} />
        {[0, 1, 2].map((index) => (
          <View key={index} style={styles.recommendationCard}>
            <View style={styles.recommendationHeader}>
              <ShimmerEffect width={40} height={40} borderRadius={20} />
              <View style={styles.recommendationTitleContainer}>
                <ShimmerEffect width={150} height={16} borderRadius={4} />
                <ShimmerEffect width={50} height={16} borderRadius={4} style={styles.priorityBadge} />
              </View>
            </View>
            <ShimmerEffect width="100%" height={14} borderRadius={4} style={styles.recommendationDesc} />
            <ShimmerEffect width="80%" height={14} borderRadius={4} style={styles.recommendationDesc} />
          </View>
        ))}
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
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  healthScoreCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  gaugeContainer: {
    marginVertical: 20,
  },
  healthLabel: {
    marginBottom: 8,
  },
  generatedAt: {
    marginTop: 4,
  },
  riskCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
  },
  riskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  riskLevel: {
    marginLeft: 12,
  },
  riskBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  riskScore: {
    marginLeft: 12,
  },
  chartCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
  },
  barItem: {
    marginBottom: 16,
  },
  barLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  barLabel: {
    flex: 1,
    marginLeft: 8,
  },
  recommendationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#E5E7EB',
  },
  recommendationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  recommendationTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
    flexWrap: 'wrap',
  },
  priorityBadge: {
    marginLeft: 8,
  },
  recommendationDesc: {
    marginTop: 4,
  },
});

export default InsightsSkeleton;
