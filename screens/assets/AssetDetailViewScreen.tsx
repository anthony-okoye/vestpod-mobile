/**
 * Asset Detail View Screen
 * 
 * Displays detailed information about an existing asset
 * Includes performance chart, key metrics, and edit/delete actions
 * Requirements: 3, 4
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';
import { assetService, priceHistoryService } from '@/services/api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface AssetDetailViewScreenProps {
  route: {
    params: {
      assetId: string;
      portfolioId: string;
    };
  };
  navigation: any;
}

interface Asset {
  id: string;
  portfolio_id: string;
  asset_type: string;
  symbol?: string;
  name: string;
  quantity: number;
  purchase_price: number;
  purchase_date: string;
  current_price?: number;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

interface PriceHistoryPoint {
  timestamp: string;
  price: number;
}

const TIME_PERIODS = ['1D', '1W', '1M', '3M', '1Y', 'ALL'] as const;
type TimePeriod = typeof TIME_PERIODS[number];

export default function AssetDetailViewScreen({ route, navigation }: AssetDetailViewScreenProps) {
  const { assetId, portfolioId } = route.params;
  
  const [asset, setAsset] = useState<Asset | null>(null);
  const [priceHistory, setPriceHistory] = useState<PriceHistoryPoint[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('1M');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAssetData = useCallback(async () => {
    try {
      setError(null);
      const assetData = await assetService.getAsset(assetId);
      setAsset(assetData);
      
      // Fetch price history
      const history = await priceHistoryService.getPriceHistory(assetId, selectedPeriod);
      setPriceHistory(history || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load asset data');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [assetId, selectedPeriod]);

  useEffect(() => {
    fetchAssetData();
  }, [fetchAssetData]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchAssetData();
  };

  const handlePeriodChange = (period: TimePeriod) => {
    setSelectedPeriod(period);
  };

  const handleEdit = () => {
    // Navigate to edit screen (to be implemented)
    Alert.alert('Edit Asset', 'Edit functionality coming soon');
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Asset',
      `Are you sure you want to delete ${asset?.name || 'this asset'}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await assetService.deleteAsset(assetId);
              navigation.goBack();
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to delete asset');
            }
          },
        },
      ]
    );
  };

  const calculateMetrics = () => {
    if (!asset) return null;
    
    const currentPrice = asset.current_price || asset.purchase_price;
    const totalValue = asset.quantity * currentPrice;
    const totalCost = asset.quantity * asset.purchase_price;
    const gainLoss = totalValue - totalCost;
    const gainLossPercent = totalCost > 0 ? ((gainLoss / totalCost) * 100) : 0;
    
    return {
      currentPrice,
      totalValue,
      totalCost,
      gainLoss,
      gainLossPercent,
    };
  };

  const getAssetTypeColor = (): string => {
    switch (asset?.asset_type) {
      case 'stock': return '#4CAF50';
      case 'crypto': return '#FF9800';
      case 'commodity': return '#9C27B0';
      case 'real_estate': return '#2196F3';
      case 'fixed_income': return '#607D8B';
      default: return '#687076';
    }
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

  const getChartData = () => {
    if (priceHistory.length === 0) {
      // Return dummy data if no history
      return {
        labels: [''],
        datasets: [{ data: [asset?.current_price || asset?.purchase_price || 0] }],
      };
    }
    
    const labels = priceHistory.map((_, index) => 
      index % Math.ceil(priceHistory.length / 5) === 0 ? '' : ''
    );
    const data = priceHistory.map((p: PriceHistoryPoint) => p.price);
    
    return {
      labels,
      datasets: [{ data }],
    };
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0a7ea4" />
          <Text style={styles.loadingText}>Loading asset...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !asset) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color="#DC2626" />
          <Text style={styles.errorText}>{error || 'Asset not found'}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchAssetData}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const metrics = calculateMetrics();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#11181C" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{asset.symbol || asset.name}</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={handleEdit} style={styles.headerButton}>
            <Ionicons name="pencil" size={20} color="#0a7ea4" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDelete} style={styles.headerButton}>
            <Ionicons name="trash" size={20} color="#DC2626" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Asset Info Card */}
        <View style={styles.assetCard}>
          <View style={[styles.assetTypeIndicator, { backgroundColor: getAssetTypeColor() }]} />
          <View style={styles.assetInfo}>
            <Text style={styles.assetSymbol}>{asset.symbol || asset.name}</Text>
            <Text style={styles.assetName}>{asset.name}</Text>
            <Text style={styles.assetType}>{asset.asset_type.replace('_', ' ').toUpperCase()}</Text>
          </View>
          <View style={styles.priceContainer}>
            <Text style={styles.currentPrice}>{formatCurrency(metrics?.currentPrice || 0)}</Text>
            <Text style={[
              styles.priceChange,
              { color: (metrics?.gainLossPercent || 0) >= 0 ? '#10B981' : '#EF4444' }
            ]}>
              {formatPercent(metrics?.gainLossPercent || 0)}
            </Text>
          </View>
        </View>

        {/* Performance Chart */}
        <View style={styles.chartSection}>
          <Text style={styles.sectionTitle}>Performance</Text>
          
          {/* Time Period Selector */}
          <View style={styles.periodSelector}>
            {TIME_PERIODS.map((period) => (
              <TouchableOpacity
                key={period}
                style={[
                  styles.periodButton,
                  selectedPeriod === period && styles.periodButtonActive,
                ]}
                onPress={() => handlePeriodChange(period)}
              >
                <Text style={[
                  styles.periodButtonText,
                  selectedPeriod === period && styles.periodButtonTextActive,
                ]}>
                  {period}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Chart */}
          <View style={styles.chartContainer}>
            <LineChart
              data={getChartData()}
              width={SCREEN_WIDTH - 48}
              height={200}
              chartConfig={{
                backgroundColor: '#FFFFFF',
                backgroundGradientFrom: '#FFFFFF',
                backgroundGradientTo: '#FFFFFF',
                decimalPlaces: 2,
                color: (opacity = 1) => `rgba(10, 126, 164, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(104, 112, 118, ${opacity})`,
                style: { borderRadius: 16 },
                propsForDots: { r: '0' },
              }}
              bezier
              style={styles.chart}
              withInnerLines={false}
              withOuterLines={false}
            />
          </View>
        </View>

        {/* Key Metrics */}
        <View style={styles.metricsSection}>
          <Text style={styles.sectionTitle}>Key Metrics</Text>
          
          <View style={styles.metricsGrid}>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Total Value</Text>
              <Text style={styles.metricValue}>{formatCurrency(metrics?.totalValue || 0)}</Text>
            </View>
            
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Total Cost</Text>
              <Text style={styles.metricValue}>{formatCurrency(metrics?.totalCost || 0)}</Text>
            </View>
            
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Gain/Loss</Text>
              <Text style={[
                styles.metricValue,
                { color: (metrics?.gainLoss || 0) >= 0 ? '#10B981' : '#EF4444' }
              ]}>
                {formatCurrency(metrics?.gainLoss || 0)}
              </Text>
            </View>
            
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Quantity</Text>
              <Text style={styles.metricValue}>{asset.quantity.toLocaleString()}</Text>
            </View>
            
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Purchase Price</Text>
              <Text style={styles.metricValue}>{formatCurrency(asset.purchase_price)}</Text>
            </View>
            
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Purchase Date</Text>
              <Text style={styles.metricValue}>
                {new Date(asset.purchase_date).toLocaleDateString()}
              </Text>
            </View>
          </View>
        </View>

        {/* Additional Info for Non-Listed Assets */}
        {asset.metadata && Object.keys(asset.metadata).length > 0 && (
          <View style={styles.additionalSection}>
            <Text style={styles.sectionTitle}>Additional Information</Text>
            {Object.entries(asset.metadata).map(([key, value]) => (
              <View key={key} style={styles.additionalRow}>
                <Text style={styles.additionalLabel}>
                  {key.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                </Text>
                <Text style={styles.additionalValue}>{String(value)}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    padding: 24,
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
    color: '#DC2626',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#0a7ea4',
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
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
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#11181C',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  headerButton: {
    padding: 4,
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
    borderRadius: 2,
    marginRight: 12,
  },
  assetInfo: {
    flex: 1,
  },
  assetSymbol: {
    fontSize: 20,
    fontWeight: '700',
    color: '#11181C',
  },
  assetName: {
    fontSize: 14,
    color: '#687076',
    marginTop: 2,
  },
  assetType: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  currentPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#11181C',
  },
  priceChange: {
    fontSize: 14,
    fontWeight: '600',
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
    fontSize: 16,
    fontWeight: '600',
    color: '#11181C',
    marginBottom: 12,
  },
  periodSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  periodButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
  },
  periodButtonActive: {
    backgroundColor: '#0a7ea4',
  },
  periodButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#687076',
  },
  periodButtonTextActive: {
    color: '#FFFFFF',
  },
  chartContainer: {
    alignItems: 'center',
  },
  chart: {
    borderRadius: 16,
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
  metricLabel: {
    fontSize: 12,
    color: '#687076',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#11181C',
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
  additionalLabel: {
    fontSize: 14,
    color: '#687076',
  },
  additionalValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#11181C',
  },
});
