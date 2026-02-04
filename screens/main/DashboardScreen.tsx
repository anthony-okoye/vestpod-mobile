// mobile/screens/main/DashboardScreen.tsx
/**
 * Dashboard Screen
 * 
 * Displays portfolio overview with total value, performance, and quick stats
 * Requirements: 6
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
import { MainTabScreenProps } from '@/navigation/types';
import { portfolioService, assetService, subscriptionService } from '@/services/api';
import PortfolioLineChart from '@/components/charts/PortfolioLineChart';

type Props = MainTabScreenProps<'Dashboard'>;

type TimePeriod = '1D' | '1W' | '1M' | '3M' | '1Y' | 'ALL';

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
  todayChange: number;
  todayChangePercent: number;
  bestPerformer: { name: string; change: number; changePercent: number } | null;
  worstPerformer: { name: string; change: number; changePercent: number } | null;
}

interface UpcomingMaturity {
  name: string;
  maturityDate: string;
  daysUntil: number;
}

interface AllocationItem {
  type: string;
  value: number;
  percentage: number;
  color: string;
}

const ASSET_TYPE_COLORS: Record<string, string> = {
  stock: '#4CAF50',
  crypto: '#FF9800',
  commodity: '#9C27B0',
  real_estate: '#2196F3',
  fixed_income: '#607D8B',
  other: '#795548',
};


export default function DashboardScreen({ navigation }: Props) {
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('1M');
  const [summary, setSummary] = useState<PortfolioSummary>({
    totalValue: 0,
    todayChange: 0,
    todayChangePercent: 0,
    bestPerformer: null,
    worstPerformer: null,
  });
  const [allocation, setAllocation] = useState<AllocationItem[]>([]);
  const [priceHistory, setPriceHistory] = useState<{ timestamp: string; value: number }[]>([]);
  const [upcomingMaturity, setUpcomingMaturity] = useState<UpcomingMaturity | null>(null);
  const [riskScore, setRiskScore] = useState<number | null>(null);
  const [isPremium, setIsPremium] = useState(false);

  const timePeriods: TimePeriod[] = ['1D', '1W', '1M', '3M', '1Y', 'ALL'];

  const calculateUpcomingMaturity = (assets: Asset[]): UpcomingMaturity | null => {
    const now = new Date();
    let nearest: UpcomingMaturity | null = null;

    assets.forEach((asset) => {
      const metadata = asset.metadata as Record<string, any> | undefined;
      if (metadata?.maturity_date) {
        const maturityDate = new Date(metadata.maturity_date);
        const daysUntil = Math.ceil((maturityDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysUntil > 0 && (!nearest || daysUntil < nearest.daysUntil)) {
          nearest = {
            name: asset.name,
            maturityDate: metadata.maturity_date,
            daysUntil,
          };
        }
      }
    });

    return nearest;
  };

  const calculateSummary = (assets: Asset[]): PortfolioSummary => {
    if (assets.length === 0) {
      return {
        totalValue: 0,
        todayChange: 0,
        todayChangePercent: 0,
        bestPerformer: null,
        worstPerformer: null,
      };
    }

    let totalValue = 0;
    let totalCost = 0;
    let bestPerformer: PortfolioSummary['bestPerformer'] = null;
    let worstPerformer: PortfolioSummary['worstPerformer'] = null;

    assets.forEach((asset) => {
      const assetValue = (asset.current_price || asset.purchase_price) * asset.quantity;
      const assetCost = asset.purchase_price * asset.quantity;
      const change = assetValue - assetCost;
      const changePercent = assetCost > 0 ? (change / assetCost) * 100 : 0;

      totalValue += assetValue;
      totalCost += assetCost;

      if (!bestPerformer || changePercent > bestPerformer.changePercent) {
        bestPerformer = { name: asset.name, change, changePercent };
      }
      if (!worstPerformer || changePercent < worstPerformer.changePercent) {
        worstPerformer = { name: asset.name, change, changePercent };
      }
    });

    const todayChange = totalValue - totalCost;
    const todayChangePercent = totalCost > 0 ? (todayChange / totalCost) * 100 : 0;

    return {
      totalValue,
      todayChange,
      todayChangePercent,
      bestPerformer,
      worstPerformer,
    };
  };

  const calculateAllocation = (assets: Asset[]): AllocationItem[] => {
    const typeValues: Record<string, number> = {};
    let totalValue = 0;

    assets.forEach((asset) => {
      const assetValue = (asset.current_price || asset.purchase_price) * asset.quantity;
      const type = asset.asset_type || 'other';
      typeValues[type] = (typeValues[type] || 0) + assetValue;
      totalValue += assetValue;
    });

    return Object.entries(typeValues).map(([type, value]) => ({
      type,
      value,
      percentage: totalValue > 0 ? (value / totalValue) * 100 : 0,
      color: ASSET_TYPE_COLORS[type] || ASSET_TYPE_COLORS.other,
    }));
  };


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
      const calculatedMaturity = calculateUpcomingMaturity(allAssets);
      
      // Mock risk score (would come from AI analysis in production)
      const mockRiskScore = premium ? Math.floor(Math.random() * 40) + 30 : null;
      
      const mockPriceHistory = Array.from({ length: 30 }, (_, i) => ({
        timestamp: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString(),
        value: calculatedSummary.totalValue * (0.9 + Math.random() * 0.2),
      }));
      
      setPriceHistory(mockPriceHistory);
      setSummary(calculatedSummary);
      setAllocation(calculatedAllocation);
      setUpcomingMaturity(calculatedMaturity);
      setRiskScore(mockRiskScore);
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

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadDashboardData();
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatPercent = (value: number): string => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0a7ea4" />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadDashboardData}>
          <Text style={styles.retryButtonText}>Retry</Text>
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
      {/* Total Portfolio Value */}
      <View style={styles.valueCard}>
        <Text style={styles.valueLabel}>Total Portfolio Value</Text>
        <Text style={styles.valueAmount}>{formatCurrency(summary.totalValue)}</Text>
        <View style={styles.changeRow}>
          <Text
            style={[
              styles.changeAmount,
              summary.todayChange >= 0 ? styles.positive : styles.negative,
            ]}
          >
            {formatCurrency(Math.abs(summary.todayChange))}
          </Text>
          <Text
            style={[
              styles.changePercent,
              summary.todayChangePercent >= 0 ? styles.positive : styles.negative,
            ]}
          >
            {formatPercent(summary.todayChangePercent)}
          </Text>
        </View>
      </View>

      {/* Time Period Selector */}
      <View style={styles.periodSelector}>
        {timePeriods.map((period) => (
          <TouchableOpacity
            key={period}
            style={[
              styles.periodButton,
              selectedPeriod === period && styles.periodButtonActive,
            ]}
            onPress={() => setSelectedPeriod(period)}
          >
            <Text
              style={[
                styles.periodButtonText,
                selectedPeriod === period && styles.periodButtonTextActive,
              ]}
            >
              {period}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Portfolio Line Chart */}
      <PortfolioLineChart data={priceHistory} timePeriod={selectedPeriod} />

      {/* Asset Allocation */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Asset Allocation</Text>
        <View style={styles.allocationContainer}>
          {allocation.length > 0 ? (
            allocation.map((item) => (
              <View key={item.type} style={styles.allocationItem}>
                <View style={[styles.allocationDot, { backgroundColor: item.color }]} />
                <Text style={styles.allocationLabel}>
                  {item.type.replace('_', ' ').toUpperCase()}
                </Text>
                <Text style={styles.allocationPercent}>
                  {item.percentage.toFixed(1)}%
                </Text>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No assets yet</Text>
          )}
        </View>
      </View>


      {/* Quick Stats Cards */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Stats</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.statsRow}>
            {/* Best Performer */}
            <View style={[styles.statCard, styles.statCardGreen]}>
              <Text style={styles.statCardLabel}>Best Performer</Text>
              {summary.bestPerformer ? (
                <>
                  <Text style={styles.statCardValue} numberOfLines={1}>
                    {summary.bestPerformer.name}
                  </Text>
                  <Text style={[styles.statCardChange, styles.positive]}>
                    {formatPercent(summary.bestPerformer.changePercent)}
                  </Text>
                </>
              ) : (
                <Text style={styles.statCardEmpty}>No data</Text>
              )}
            </View>

            {/* Worst Performer */}
            <View style={[styles.statCard, styles.statCardRed]}>
              <Text style={styles.statCardLabel}>Worst Performer</Text>
              {summary.worstPerformer ? (
                <>
                  <Text style={styles.statCardValue} numberOfLines={1}>
                    {summary.worstPerformer.name}
                  </Text>
                  <Text style={[styles.statCardChange, styles.negative]}>
                    {formatPercent(summary.worstPerformer.changePercent)}
                  </Text>
                </>
              ) : (
                <Text style={styles.statCardEmpty}>No data</Text>
              )}
            </View>

            {/* Upcoming Maturity */}
            <View style={[styles.statCard, styles.statCardOrange]}>
              <Text style={styles.statCardLabel}>Upcoming Maturity</Text>
              {upcomingMaturity ? (
                <>
                  <Text style={styles.statCardValue} numberOfLines={1}>
                    {upcomingMaturity.name}
                  </Text>
                  <Text style={styles.statCardSubtext}>
                    {upcomingMaturity.daysUntil} days
                  </Text>
                </>
              ) : (
                <Text style={styles.statCardEmpty}>None</Text>
              )}
            </View>

            {/* Risk Score (Premium) */}
            <View style={[styles.statCard, styles.statCardPurple]}>
              <View style={styles.statCardHeader}>
                <Text style={styles.statCardLabel}>Risk Score</Text>
                {!isPremium && (
                  <View style={styles.premiumBadge}>
                    <Text style={styles.premiumBadgeText}>PRO</Text>
                  </View>
                )}
              </View>
              {isPremium && riskScore !== null ? (
                <>
                  <Text style={styles.statCardValue}>{riskScore}/100</Text>
                  <Text style={styles.statCardSubtext}>
                    {riskScore < 40 ? 'Low Risk' : riskScore < 70 ? 'Moderate' : 'High Risk'}
                  </Text>
                </>
              ) : (
                <Text style={styles.statCardEmpty}>Upgrade to view</Text>
              )}
            </View>
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
  valueLabel: {
    fontSize: 14,
    color: '#687076',
    marginBottom: 8,
  },
  valueAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#11181C',
    marginBottom: 8,
  },
  changeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  changeAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
  changePercent: {
    fontSize: 16,
    fontWeight: '600',
  },
  positive: {
    color: '#059669',
  },
  negative: {
    color: '#DC2626',
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  periodButtonActive: {
    backgroundColor: '#0a7ea4',
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#687076',
  },
  periodButtonTextActive: {
    color: '#FFFFFF',
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#11181C',
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
  allocationDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  allocationLabel: {
    flex: 1,
    fontSize: 14,
    color: '#11181C',
  },
  allocationPercent: {
    fontSize: 14,
    fontWeight: '600',
    color: '#687076',
  },
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    paddingVertical: 16,
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
  },
  statCardGreen: {
    borderLeftColor: '#059669',
  },
  statCardRed: {
    borderLeftColor: '#DC2626',
  },
  statCardOrange: {
    borderLeftColor: '#F59E0B',
  },
  statCardPurple: {
    borderLeftColor: '#8B5CF6',
  },
  statCardLabel: {
    fontSize: 12,
    color: '#687076',
    marginBottom: 8,
  },
  statCardValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#11181C',
    marginBottom: 4,
  },
  statCardChange: {
    fontSize: 14,
    fontWeight: '600',
  },
  statCardSubtext: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  statCardEmpty: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  statCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  premiumBadge: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  premiumBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
});
