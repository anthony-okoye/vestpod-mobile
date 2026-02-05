// mobile/screens/main/DashboardScreen.tsx
/**
 * Dashboard Screen - Redesigned
 * 
 * Displays portfolio overview with gradient header, performance chart,
 * asset allocation, performer cards, and stats cards.
 * Requirements: 1.1-1.8, 2.1-2.8, 3.1-3.6, 4.1-4.9, 5.1-5.11, 8.1-8.5, 10.2-10.5
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Text,
  TouchableOpacity,
} from 'react-native';
import { MainTabScreenProps } from '@/navigation/types';
import { portfolioService, assetService, subscriptionService } from '@/services/api';
import {
  DashboardHeader,
  PerformanceCard,
  AllocationCard,
  PerformerCard,
  StatsCard,
  getAssetTypeColor,
} from '@/components/dashboard';
import type { TimePeriod, AllocationItem } from '@/components/dashboard';
import { Colors, Spacing } from '@/constants/theme';

type Props = MainTabScreenProps<'Dashboard'>;

interface Asset {
  id: string;
  name: string;
  symbol?: string;
  asset_type: string;
  current_price: number;
  purchase_price: number;
  quantity: number;
  metadata?: Record<string, any>;
}

interface PortfolioSummary {
  totalValue: number;
  totalInvested: number;
  todayChange: number;
  todayChangePercent: number;
  bestPerformer: { name: string; changePercent: number } | null;
  worstPerformer: { name: string; changePercent: number } | null;
}

/**
 * Calculates portfolio summary from assets
 * Requirements: 10.2, 10.3, 10.4
 */
export function calculateSummary(assets: Asset[]): PortfolioSummary {
  if (assets.length === 0) {
    return {
      totalValue: 0,
      totalInvested: 0,
      todayChange: 0,
      todayChangePercent: 0,
      bestPerformer: null,
      worstPerformer: null,
    };
  }

  let totalValue = 0;
  let totalInvested = 0;
  let bestPerformer: PortfolioSummary['bestPerformer'] = null;
  let worstPerformer: PortfolioSummary['worstPerformer'] = null;

  assets.forEach((asset) => {
    const currentPrice = asset.current_price || asset.purchase_price;
    const assetValue = currentPrice * asset.quantity;
    const assetCost = asset.purchase_price * asset.quantity;
    const changePercent = assetCost > 0 ? ((assetValue - assetCost) / assetCost) * 100 : 0;

    totalValue += assetValue;
    totalInvested += assetCost;

    // Track best performer (highest percentage change)
    if (!bestPerformer || changePercent > bestPerformer.changePercent) {
      bestPerformer = { name: asset.name, changePercent };
    }
    // Track worst performer (lowest percentage change)
    if (!worstPerformer || changePercent < worstPerformer.changePercent) {
      worstPerformer = { name: asset.name, changePercent };
    }
  });

  const todayChange = totalValue - totalInvested;
  const todayChangePercent = totalInvested > 0 ? (todayChange / totalInvested) * 100 : 0;

  return {
    totalValue,
    totalInvested,
    todayChange,
    todayChangePercent,
    bestPerformer,
    worstPerformer,
  };
}

/**
 * Calculates asset allocation percentages by type
 * Requirements: 10.5
 */
export function calculateAllocation(assets: Asset[]): AllocationItem[] {
  const typeValues: Record<string, number> = {};
  let totalValue = 0;

  assets.forEach((asset) => {
    const currentPrice = asset.current_price || asset.purchase_price;
    const assetValue = currentPrice * asset.quantity;
    const type = asset.asset_type || 'other';
    typeValues[type] = (typeValues[type] || 0) + assetValue;
    totalValue += assetValue;
  });

  return Object.entries(typeValues).map(([type, value]) => ({
    type,
    value,
    percentage: totalValue > 0 ? (value / totalValue) * 100 : 0,
    color: getAssetTypeColor(type),
  }));
}

/**
 * Calculates risk score based on portfolio composition
 * Returns score from 0-10
 */
export function calculateRiskScore(allocation: AllocationItem[]): number {
  if (allocation.length === 0) return 5;

  // Risk weights by asset type (higher = riskier)
  const riskWeights: Record<string, number> = {
    crypto: 9,
    stock: 6,
    commodity: 5,
    real_estate: 4,
    fixed_income: 2,
    other: 5,
  };

  let weightedRisk = 0;
  let totalPercentage = 0;

  allocation.forEach((item) => {
    const weight = riskWeights[item.type.toLowerCase()] || 5;
    weightedRisk += weight * item.percentage;
    totalPercentage += item.percentage;
  });

  if (totalPercentage === 0) return 5;
  
  // Normalize to 0-10 scale
  return Math.round(weightedRisk / totalPercentage);
}

export default function DashboardScreen({ navigation }: Props) {
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('1M');
  const [userName, setUserName] = useState('User');
  const [summary, setSummary] = useState<PortfolioSummary>({
    totalValue: 0,
    totalInvested: 0,
    todayChange: 0,
    todayChangePercent: 0,
    bestPerformer: null,
    worstPerformer: null,
  });
  const [allocation, setAllocation] = useState<AllocationItem[]>([]);
  const [priceHistory, setPriceHistory] = useState<{ timestamp: string; value: number }[]>([]);
  const [riskScore, setRiskScore] = useState<number>(5);
  const [isPremium, setIsPremium] = useState(false);

  const loadDashboardData = useCallback(async () => {
    try {
      setError(null);

      // Check premium status
      const premium = await subscriptionService.isPremium();
      setIsPremium(premium);

      const portfolios = await portfolioService.getPortfolios();
      
      let allAssets: Asset[] = [];
      for (const portfolio of portfolios || []) {
        const portfolioAssets = await assetService.getAssets(portfolio.id);
        allAssets = [...allAssets, ...(portfolioAssets || [])];
      }

      const calculatedSummary = calculateSummary(allAssets);
      const calculatedAllocation = calculateAllocation(allAssets);
      const calculatedRiskScore = calculateRiskScore(calculatedAllocation);
      
      // Generate mock price history based on total value
      const mockPriceHistory = Array.from({ length: 30 }, (_, i) => ({
        timestamp: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString(),
        value: calculatedSummary.totalValue * (0.9 + Math.random() * 0.2),
      }));
      
      setPriceHistory(mockPriceHistory);
      setSummary(calculatedSummary);
      setAllocation(calculatedAllocation);
      setRiskScore(calculatedRiskScore);
    } catch (err) {
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    loadDashboardData();
  }, [loadDashboardData]);

  const handlePeriodChange = useCallback((period: TimePeriod) => {
    setSelectedPeriod(period);
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.light.tint} />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          style={styles.retryButton} 
          onPress={loadDashboardData}
          accessibilityRole="button"
          accessibilityLabel="Retry loading dashboard"
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Gradient Header with Portfolio Summary */}
      <DashboardHeader
        userName={userName}
        totalValue={summary.totalValue}
        dailyChange={summary.todayChange}
        dailyChangePercent={summary.todayChangePercent}
      />

      {/* Scrollable Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={Colors.light.tint}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Performance Card with Chart */}
        <PerformanceCard
          data={priceHistory}
          selectedPeriod={selectedPeriod}
          onPeriodChange={handlePeriodChange}
        />

        {/* Asset Allocation Card with Donut Chart */}
        <AllocationCard data={allocation} />

        {/* Performer Cards Row (Best and Worst side-by-side) */}
        <View style={styles.cardsRow}>
          {summary.bestPerformer ? (
            <PerformerCard
              type="best"
              assetName={summary.bestPerformer.name}
              changePercent={summary.bestPerformer.changePercent}
            />
          ) : (
            <View style={[styles.emptyCard, { backgroundColor: Colors.light.cardBestPerformer }]}>
              <Text style={styles.emptyCardLabel}>Best Performer</Text>
              <Text style={styles.emptyCardText}>No data</Text>
            </View>
          )}
          <View style={styles.cardSpacer} />
          {summary.worstPerformer ? (
            <PerformerCard
              type="worst"
              assetName={summary.worstPerformer.name}
              changePercent={summary.worstPerformer.changePercent}
            />
          ) : (
            <View style={[styles.emptyCard, { backgroundColor: Colors.light.cardWorstPerformer }]}>
              <Text style={styles.emptyCardLabel}>Worst Performer</Text>
              <Text style={styles.emptyCardText}>No data</Text>
            </View>
          )}
        </View>

        {/* Stats Cards Row (Total Invested and Risk Score side-by-side) */}
        <View style={styles.cardsRow}>
          <StatsCard
            type="invested"
            value={summary.totalInvested}
            subtitle="Capital"
          />
          <View style={styles.cardSpacer} />
          <StatsCard
            type="risk"
            value={riskScore}
            subtitle=""
          />
        </View>

        {/* Bottom spacing for tab bar */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.backgroundSecondary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing.xl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.light.backgroundSecondary,
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: 16,
    color: Colors.light.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.light.backgroundSecondary,
    padding: Spacing.xl,
  },
  errorText: {
    fontSize: 16,
    color: Colors.light.error,
    textAlign: 'center',
    marginBottom: Spacing.base,
  },
  retryButton: {
    backgroundColor: Colors.light.tint,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: 8,
  },
  retryButtonText: {
    color: Colors.light.buttonPrimaryText,
    fontSize: 16,
    fontWeight: '600',
  },
  cardsRow: {
    flexDirection: 'row',
    marginHorizontal: Spacing.base,
    marginTop: Spacing.base,
  },
  cardSpacer: {
    width: Spacing.md,
  },
  emptyCard: {
    flex: 1,
    borderRadius: 16,
    padding: Spacing.base,
    minHeight: 100,
    justifyContent: 'center',
  },
  emptyCardLabel: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    marginBottom: Spacing.xs,
  },
  emptyCardText: {
    fontSize: 14,
    color: Colors.light.textTertiary,
  },
  bottomSpacer: {
    height: Spacing['2xl'],
  },
});
