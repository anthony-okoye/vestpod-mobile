/**
 * Assets Screen
 * 
 * Displays list of assets with search, filters, and sorting
 * Requirements: 3, 4, 5
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MainTabScreenProps } from '@/navigation/types';
import { assetService } from '@/services/api';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setAssets, setLoading, setError } from '@/store/slices/assetsSlice';
import { useRealtimePrices } from '@/hooks/useRealtimePrices';
import { RealtimeStatus } from '@/components/RealtimeStatus';

type Props = MainTabScreenProps<'Assets'>;

type AssetType = 'all' | 'stock' | 'crypto' | 'commodity' | 'real_estate' | 'fixed_income' | 'other';
type SortOption = 'name' | 'value' | 'performance';

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

const ASSET_TYPE_LABELS: Record<string, string> = {
  all: 'All',
  stock: 'Stocks',
  crypto: 'Crypto',
  commodity: 'Commodities',
  real_estate: 'Real Estate',
  fixed_income: 'Fixed Income',
  other: 'Other',
};

const ASSET_TYPE_COLORS: Record<string, string> = {
  stock: '#4CAF50',
  crypto: '#FF9800',
  commodity: '#9C27B0',
  real_estate: '#2196F3',
  fixed_income: '#607D8B',
  other: '#795548',
};

const FILTER_TYPES: AssetType[] = ['all', 'stock', 'crypto', 'commodity', 'real_estate', 'fixed_income', 'other'];

export default function AssetsScreen({ navigation }: Props) {
  const dispatch = useAppDispatch();
  const { assets, isLoading, error } = useAppSelector((state) => state.assets);
  const { selectedPortfolioId, portfolios } = useAppSelector((state) => state.portfolio);

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<AssetType>('all');
  const [sortBy, setSortBy] = useState<SortOption>('value');
  const [sortAscending, setSortAscending] = useState(false);

  const selectedPortfolio = portfolios.find((p) => p.id === selectedPortfolioId);

  // Real-time price updates subscription
  const { 
    lastUpdated: realtimeLastUpdated, 
    isConnected, 
    connectionError, 
    reconnect 
  } = useRealtimePrices({ 
    portfolioId: selectedPortfolioId || undefined, 
    enabled: !!selectedPortfolioId 
  });

  const loadAssets = useCallback(async () => {
    if (!selectedPortfolioId) return;

    try {
      dispatch(setLoading(true));
      const data = await assetService.getAssets(selectedPortfolioId);
      dispatch(setAssets(data || []));
    } catch (err) {
      dispatch(setError('Failed to load assets'));
    }
  }, [dispatch, selectedPortfolioId]);

  useEffect(() => {
    loadAssets();
  }, [loadAssets]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadAssets();
    setIsRefreshing(false);
  };

  const calculateAssetValue = (asset: Asset): number => {
    return (asset.current_price || asset.purchase_price) * asset.quantity;
  };

  const calculatePerformance = (asset: Asset): number => {
    const currentValue = calculateAssetValue(asset);
    const costBasis = asset.purchase_price * asset.quantity;
    return costBasis > 0 ? ((currentValue - costBasis) / costBasis) * 100 : 0;
  };

  const filteredAndSortedAssets = useMemo(() => {
    let result = [...assets];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (asset) =>
          asset.name.toLowerCase().includes(query) ||
          (asset.symbol && asset.symbol.toLowerCase().includes(query))
      );
    }

    if (selectedType !== 'all') {
      result = result.filter((asset) => asset.asset_type === selectedType);
    }

    result.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'value':
          comparison = calculateAssetValue(b) - calculateAssetValue(a);
          break;
        case 'performance':
          comparison = calculatePerformance(b) - calculatePerformance(a);
          break;
      }
      return sortAscending ? -comparison : comparison;
    });

    return result;
  }, [assets, searchQuery, selectedType, sortBy, sortAscending]);

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

  const toggleSort = (option: SortOption) => {
    if (sortBy === option) {
      setSortAscending(!sortAscending);
    } else {
      setSortBy(option);
      setSortAscending(false);
    }
  };

  const handleAddAsset = () => {
    if (!selectedPortfolioId) return;
    // Navigate to add asset flow
    navigation.getParent()?.navigate('AddAsset', {
      screen: 'AssetTypeSelection',
      params: { portfolioId: selectedPortfolioId },
    });
  };

  const renderAssetCard = ({ item }: { item: Asset }) => {
    const value = calculateAssetValue(item);
    const performance = calculatePerformance(item);
    const typeColor = ASSET_TYPE_COLORS[item.asset_type] || ASSET_TYPE_COLORS.other;

    return (
      <TouchableOpacity style={styles.assetCard}>
        <View style={[styles.assetTypeIndicator, { backgroundColor: typeColor }]} />
        <View style={styles.assetInfo}>
          <View style={styles.assetHeader}>
            <Text style={styles.assetName} numberOfLines={1}>
              {item.name}
            </Text>
            {item.symbol && <Text style={styles.assetSymbol}>{item.symbol}</Text>}
          </View>
          <Text style={styles.assetType}>
            {ASSET_TYPE_LABELS[item.asset_type] || 'Other'} • {item.quantity} units
          </Text>
        </View>
        <View style={styles.assetValues}>
          <Text style={styles.assetValue}>{formatCurrency(value)}</Text>
          <Text
            style={[
              styles.assetPerformance,
              performance >= 0 ? styles.positive : styles.negative,
            ]}
          >
            {formatPercent(performance)}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderFilterChip = (type: AssetType) => {
    const isSelected = selectedType === type;
    return (
      <TouchableOpacity
        key={type}
        style={[styles.filterChip, isSelected && styles.filterChipSelected]}
        onPress={() => setSelectedType(type)}
      >
        <Text style={[styles.filterChipText, isSelected && styles.filterChipTextSelected]}>
          {ASSET_TYPE_LABELS[type]}
        </Text>
      </TouchableOpacity>
    );
  };

  if (!selectedPortfolioId) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="folder-open-outline" size={64} color="#9CA3AF" />
        <Text style={styles.emptyTitle}>No Portfolio Selected</Text>
        <Text style={styles.emptySubtitle}>
          Please select a portfolio from the Portfolio tab first
        </Text>
      </View>
    );
  }

  if (isLoading && assets.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0a7ea4" />
        <Text style={styles.loadingText}>Loading assets...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Assets</Text>
          {selectedPortfolio && (
            <Text style={styles.headerSubtitle}>{selectedPortfolio.name}</Text>
          )}
        </View>
        <TouchableOpacity style={styles.addButton} onPress={handleAddAsset}>
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Real-time Status */}
      <RealtimeStatus
        isConnected={isConnected}
        lastUpdated={realtimeLastUpdated}
        error={connectionError}
        onReconnect={reconnect}
      />

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name or symbol..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#9CA3AF"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Chips */}
      <View style={styles.filterContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={FILTER_TYPES}
          keyExtractor={(item) => item}
          renderItem={({ item }) => renderFilterChip(item)}
          contentContainerStyle={styles.filterList}
        />
      </View>

      {/* Sort Options */}
      <View style={styles.sortContainer}>
        <Text style={styles.sortLabel}>Sort by:</Text>
        <TouchableOpacity
          style={[styles.sortButton, sortBy === 'value' && styles.sortButtonActive]}
          onPress={() => toggleSort('value')}
        >
          <Text style={[styles.sortButtonText, sortBy === 'value' && styles.sortButtonTextActive]}>
            Value {sortBy === 'value' && (sortAscending ? '↑' : '↓')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.sortButton, sortBy === 'performance' && styles.sortButtonActive]}
          onPress={() => toggleSort('performance')}
        >
          <Text style={[styles.sortButtonText, sortBy === 'performance' && styles.sortButtonTextActive]}>
            Performance {sortBy === 'performance' && (sortAscending ? '↑' : '↓')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.sortButton, sortBy === 'name' && styles.sortButtonActive]}
          onPress={() => toggleSort('name')}
        >
          <Text style={[styles.sortButtonText, sortBy === 'name' && styles.sortButtonTextActive]}>
            Name {sortBy === 'name' && (sortAscending ? '↑' : '↓')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Error Banner */}
      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={loadAssets}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Asset List */}
      <FlatList
        data={filteredAndSortedAssets}
        keyExtractor={(item) => item.id}
        renderItem={renderAssetCard}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyListContainer}>
            <Ionicons name="pie-chart-outline" size={64} color="#9CA3AF" />
            <Text style={styles.emptyTitle}>No Assets Found</Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery || selectedType !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Add your first asset to start tracking'}
            </Text>
            {!searchQuery && selectedType === 'all' && (
              <TouchableOpacity style={styles.addAssetButton} onPress={handleAddAsset}>
                <Text style={styles.addAssetButtonText}>Add Asset</Text>
              </TouchableOpacity>
            )}
          </View>
        }
      />
    </View>
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
    backgroundColor: '#F5F5F5',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#687076',
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
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#11181C',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#687076',
    marginTop: 2,
  },
  addButton: {
    backgroundColor: '#0a7ea4',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#11181C',
  },
  filterContainer: {
    marginTop: 12,
  },
  filterList: {
    paddingHorizontal: 16,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterChipSelected: {
    backgroundColor: '#0a7ea4',
    borderColor: '#0a7ea4',
  },
  filterChipText: {
    fontSize: 14,
    color: '#687076',
  },
  filterChipTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sortLabel: {
    fontSize: 14,
    color: '#687076',
    marginRight: 8,
  },
  sortButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginRight: 8,
  },
  sortButtonActive: {
    backgroundColor: '#E0F2FE',
  },
  sortButtonText: {
    fontSize: 12,
    color: '#687076',
  },
  sortButtonTextActive: {
    color: '#0a7ea4',
    fontWeight: '600',
  },
  errorBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    padding: 12,
    marginHorizontal: 16,
    borderRadius: 8,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
  },
  retryText: {
    color: '#0a7ea4',
    fontSize: 14,
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
    flexGrow: 1,
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
  assetName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#11181C',
    flex: 1,
  },
  assetSymbol: {
    fontSize: 12,
    color: '#687076',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  assetType: {
    fontSize: 12,
    color: '#687076',
  },
  assetValues: {
    alignItems: 'flex-end',
  },
  assetValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#11181C',
    marginBottom: 4,
  },
  assetPerformance: {
    fontSize: 14,
    fontWeight: '600',
  },
  positive: {
    color: '#059669',
  },
  negative: {
    color: '#DC2626',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 24,
  },
  emptyListContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#11181C',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#687076',
    textAlign: 'center',
    paddingHorizontal: 32,
    marginBottom: 24,
  },
  addAssetButton: {
    backgroundColor: '#0a7ea4',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addAssetButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
