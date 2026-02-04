/**
 * Insights Screen (Premium Feature)
 * 
 * Displays AI-powered portfolio insights including:
 * - Portfolio health score gauge
 * - Risk analysis
 * - Geographic exposure chart
 * - Sector exposure chart
 * - AI recommendation cards
 * 
 * Requirements: Task 58 - Premium Insights Screen
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MainTabScreenProps } from '@/navigation/types';
import { insightsService } from '@/services/api';
import { usePurchases } from '@/hooks/usePurchases';
import { PremiumPaywall, SubscriptionPlan } from '@/components/PremiumPaywall';

type Props = MainTabScreenProps<'Insights'>;

// Types for insights data
interface GeographicExposure {
  region: string;
  percentage: number;
}

interface SectorExposure {
  sector: string;
  percentage: number;
}

interface Recommendation {
  id: string;
  type: 'buy' | 'sell' | 'hold' | 'rebalance' | 'diversify';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
}

interface InsightsData {
  id: string;
  health_score: number;
  risk_level: 'Low' | 'Medium' | 'High';
  risk_score: number;
  geographic_exposure: GeographicExposure[];
  sector_exposure: SectorExposure[];
  recommendations: Recommendation[];
  generated_at: string;
}

// Color mappings
const RISK_COLORS = {
  Low: '#10B981',
  Medium: '#F59E0B',
  High: '#EF4444',
};

const PRIORITY_COLORS = {
  high: '#EF4444',
  medium: '#F59E0B',
  low: '#10B981',
};

const RECOMMENDATION_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  buy: 'trending-up',
  sell: 'trending-down',
  hold: 'pause-circle',
  rebalance: 'swap-horizontal',
  diversify: 'git-branch',
};

const REGION_COLORS = ['#0a7ea4', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444', '#6366F1'];
const SECTOR_COLORS = ['#4CAF50', '#2196F3', '#FF9800', '#9C27B0', '#607D8B', '#795548'];

export default function InsightsScreen({ navigation }: Props) {
  const { isPremium, purchase, restore, isLoading: isPurchaseLoading } = usePurchases();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [insights, setInsights] = useState<InsightsData | null>(null);
  const [showPaywall, setShowPaywall] = useState(false);

  const loadInsights = useCallback(async () => {
    if (!isPremium) {
      setIsLoading(false);
      return;
    }

    try {
      setError(null);
      const data = await insightsService.getLatestInsights();
      
      if (data) {
        // Parse JSON fields if they're strings
        const parsedData: InsightsData = {
          ...data,
          geographic_exposure: typeof data.geographic_exposure === 'string' 
            ? JSON.parse(data.geographic_exposure) 
            : data.geographic_exposure || [],
          sector_exposure: typeof data.sector_exposure === 'string'
            ? JSON.parse(data.sector_exposure)
            : data.sector_exposure || [],
          recommendations: typeof data.recommendations === 'string'
            ? JSON.parse(data.recommendations)
            : data.recommendations || [],
        };
        setInsights(parsedData);
      } else {
        setInsights(null);
      }
    } catch (err) {
      setError('Failed to load insights. Please try again.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [isPremium]);

  useEffect(() => {
    if (!isPurchaseLoading) {
      loadInsights();
    }
  }, [isPurchaseLoading, loadInsights]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadInsights();
  };

  const handleSubscribe = async (plan: SubscriptionPlan) => {
    // In production, this would trigger the actual purchase flow
    setShowPaywall(false);
  };

  const handleRestorePurchases = async () => {
    await restore();
    setShowPaywall(false);
  };

  const getHealthScoreColor = (score: number): string => {
    if (score >= 70) return '#10B981';
    if (score >= 40) return '#F59E0B';
    return '#EF4444';
  };

  const getHealthScoreLabel = (score: number): string => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Attention';
  };

  // Show paywall for non-premium users
  if (!isPremium && !isPurchaseLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.lockedContainer}>
          <View style={styles.lockedIconContainer}>
            <Ionicons name="lock-closed" size={48} color="#8B5CF6" />
          </View>
          <Text style={styles.lockedTitle}>Premium Feature</Text>
          <Text style={styles.lockedDescription}>
            Unlock AI-powered portfolio insights, risk analysis, and personalized recommendations.
          </Text>
          <TouchableOpacity
            style={styles.unlockButton}
            onPress={() => setShowPaywall(true)}
          >
            <Text style={styles.unlockButtonText}>Unlock Insights</Text>
          </TouchableOpacity>
        </View>

        <PremiumPaywall
          visible={showPaywall}
          onClose={() => setShowPaywall(false)}
          onSubscribe={handleSubscribe}
          onRestorePurchases={handleRestorePurchases}
          feature="AI Portfolio Insights"
        />
      </View>
    );
  }

  if (isLoading || isPurchaseLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0a7ea4" />
        <Text style={styles.loadingText}>Loading insights...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadInsights}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!insights) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="analytics-outline" size={64} color="#9CA3AF" />
        <Text style={styles.emptyTitle}>No Insights Available</Text>
        <Text style={styles.emptyDescription}>
          Add assets to your portfolio to generate AI-powered insights.
        </Text>
        <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
          <Text style={styles.retryButtonText}>Refresh</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
      }
    >
      {/* Health Score Gauge */}
      <View style={styles.healthScoreCard}>
        <Text style={styles.sectionTitle}>Portfolio Health Score</Text>
        <View style={styles.gaugeContainer}>
          <View style={[
            styles.gaugeCircle,
            { borderColor: getHealthScoreColor(insights.health_score) }
          ]}>
            <Text style={[
              styles.gaugeScore,
              { color: getHealthScoreColor(insights.health_score) }
            ]}>
              {insights.health_score}
            </Text>
            <Text style={styles.gaugeLabel}>/ 100</Text>
          </View>
        </View>
        <Text style={[
          styles.healthLabel,
          { color: getHealthScoreColor(insights.health_score) }
        ]}>
          {getHealthScoreLabel(insights.health_score)}
        </Text>
        <Text style={styles.generatedAt}>
          Last updated: {new Date(insights.generated_at).toLocaleDateString()}
        </Text>
      </View>

      {/* Risk Analysis */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Risk Analysis</Text>
        <View style={styles.riskCard}>
          <View style={styles.riskHeader}>
            <Ionicons 
              name="shield-checkmark" 
              size={24} 
              color={RISK_COLORS[insights.risk_level]} 
            />
            <Text style={[
              styles.riskLevel,
              { color: RISK_COLORS[insights.risk_level] }
            ]}>
              {insights.risk_level} Risk
            </Text>
          </View>
          <View style={styles.riskBarContainer}>
            <View style={styles.riskBarBackground}>
              <View 
                style={[
                  styles.riskBarFill,
                  { 
                    width: `${insights.risk_score}%`,
                    backgroundColor: RISK_COLORS[insights.risk_level]
                  }
                ]} 
              />
            </View>
            <Text style={styles.riskScoreText}>{insights.risk_score}/100</Text>
          </View>
        </View>
      </View>

      {/* Geographic Exposure */}
      {insights.geographic_exposure && insights.geographic_exposure.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Geographic Exposure</Text>
          <View style={styles.chartCard}>
            {insights.geographic_exposure.map((item, index) => (
              <View key={item.region} style={styles.barItem}>
                <View style={styles.barLabelRow}>
                  <View style={[
                    styles.barDot,
                    { backgroundColor: REGION_COLORS[index % REGION_COLORS.length] }
                  ]} />
                  <Text style={styles.barLabel}>{item.region}</Text>
                  <Text style={styles.barPercent}>{item.percentage.toFixed(1)}%</Text>
                </View>
                <View style={styles.barBackground}>
                  <View 
                    style={[
                      styles.barFill,
                      { 
                        width: `${item.percentage}%`,
                        backgroundColor: REGION_COLORS[index % REGION_COLORS.length]
                      }
                    ]} 
                  />
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Sector Exposure */}
      {insights.sector_exposure && insights.sector_exposure.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sector Exposure</Text>
          <View style={styles.chartCard}>
            {insights.sector_exposure.map((item, index) => (
              <View key={item.sector} style={styles.barItem}>
                <View style={styles.barLabelRow}>
                  <View style={[
                    styles.barDot,
                    { backgroundColor: SECTOR_COLORS[index % SECTOR_COLORS.length] }
                  ]} />
                  <Text style={styles.barLabel}>{item.sector}</Text>
                  <Text style={styles.barPercent}>{item.percentage.toFixed(1)}%</Text>
                </View>
                <View style={styles.barBackground}>
                  <View 
                    style={[
                      styles.barFill,
                      { 
                        width: `${item.percentage}%`,
                        backgroundColor: SECTOR_COLORS[index % SECTOR_COLORS.length]
                      }
                    ]} 
                  />
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* AI Recommendations */}
      {insights.recommendations && insights.recommendations.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>AI Recommendations</Text>
          {insights.recommendations.map((rec) => (
            <View 
              key={rec.id} 
              style={[
                styles.recommendationCard,
                { borderLeftColor: PRIORITY_COLORS[rec.priority] }
              ]}
            >
              <View style={styles.recommendationHeader}>
                <View style={[
                  styles.recommendationIconContainer,
                  { backgroundColor: `${PRIORITY_COLORS[rec.priority]}20` }
                ]}>
                  <Ionicons 
                    name={RECOMMENDATION_ICONS[rec.type] || 'bulb'} 
                    size={20} 
                    color={PRIORITY_COLORS[rec.priority]} 
                  />
                </View>
                <View style={styles.recommendationTitleContainer}>
                  <Text style={styles.recommendationTitle}>{rec.title}</Text>
                  <View style={[
                    styles.priorityBadge,
                    { backgroundColor: `${PRIORITY_COLORS[rec.priority]}20` }
                  ]}>
                    <Text style={[
                      styles.priorityText,
                      { color: PRIORITY_COLORS[rec.priority] }
                    ]}>
                      {rec.priority.toUpperCase()}
                    </Text>
                  </View>
                </View>
              </View>
              <Text style={styles.recommendationDescription}>{rec.description}</Text>
            </View>
          ))}
        </View>
      )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#687076',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 24,
  },
  errorText: {
    fontSize: 16,
    color: '#DC2626',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#0a7ea4',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#11181C',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: '#687076',
    textAlign: 'center',
    marginBottom: 24,
  },
  lockedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  lockedIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#F3E8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  lockedTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#11181C',
    marginBottom: 12,
  },
  lockedDescription: {
    fontSize: 16,
    color: '#687076',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  unlockButton: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  unlockButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#11181C',
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
  gaugeCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  gaugeScore: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  gaugeLabel: {
    fontSize: 16,
    color: '#687076',
  },
  healthLabel: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  generatedAt: {
    fontSize: 12,
    color: '#9CA3AF',
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
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 12,
  },
  riskBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  riskBarBackground: {
    flex: 1,
    height: 12,
    backgroundColor: '#E5E7EB',
    borderRadius: 6,
    overflow: 'hidden',
  },
  riskBarFill: {
    height: '100%',
    borderRadius: 6,
  },
  riskScoreText: {
    marginLeft: 12,
    fontSize: 14,
    fontWeight: '600',
    color: '#687076',
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
  barDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  barLabel: {
    flex: 1,
    fontSize: 14,
    color: '#11181C',
  },
  barPercent: {
    fontSize: 14,
    fontWeight: '600',
    color: '#687076',
  },
  barBackground: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
  },
  recommendationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
  },
  recommendationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  recommendationIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  recommendationTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  recommendationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#11181C',
    marginRight: 8,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  recommendationDescription: {
    fontSize: 14,
    color: '#687076',
    lineHeight: 20,
  },
});
