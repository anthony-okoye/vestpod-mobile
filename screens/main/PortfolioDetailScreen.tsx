/**
 * Portfolio Detail Screen
 * 
 * Displays list of assets in the selected portfolio with search and filter
 * Uses route params for portfolio selection instead of Redux
 * Requirements: 3.3, 3.4, 3.5, 4.1, 4.2
 */

import React, { useState, useEffect, useCallback, useMemo, useLayoutEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PortfolioStackScreenProps } from '@/navigation/types';
import { assetService } from '@/services/api';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setAssets, setLoading, setError } from '@/store/slices/assetsSlice';
import { PortfolioHeader, AssetCard, FloatingAddButton, EmptyState } from '@/components/portfolio';
import { Colors } from '@/constants/theme';

type Props = PortfolioStackScreenProps<'PortfolioDetail'>;

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

const FILTER_OPTIONS = ['All', 'Stocks', 'Crypto', 'Commodities', 'Real Estate', 'Fixed Income', 'Other'];

const ASSET_TYPE_MAP: Record<string, string> = {
  'All': 'all',
  'Stocks': 'stock',
  'Crypto': 'crypto',
  'Commodities': 'commodity',
  'Real Estate': 'real_estate',
  'Fixed Income': 'fixed_income',
  'Other': 'other',
};

export default function PortfolioDetailScreen({ route, navigation }: Props) {
  const { portfolioId, portfolioName } = route.params;
  const dispatch = useAppDispatch();
  const { assets, isLoading, error } = useAppSelector((state) => state.assets);

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');

  // Configure header with portfolio name and back button
  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerTitle: portfolioName,
      headerLeft: () => (
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.headerButton}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.light.text} />
        </TouchableOpacity>
      ),
    });
  }, [navigation, portfolioName]);

  const loadAssets = useCallback(async () => {
    if (!portfolioId) {
      dispatch(setAssets([]));
      return;
    }

    try {
      dispatch(setLoading(true));
      const data = await assetService.getAssets(portfolioId);
      dispatch(setAssets(data || []));
    } catch (err) {
      dispatch(setError('Failed to load assets'));
    }
  }, [dispatch, portfolioId]);

  useEffect(() => {
    loadAssets();
  }, [loadAssets]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadAssets();
    setIsRefreshing(false);
  };

  const handleAddAsset = () => {
    if (!portfolioId) return;
    navigation.getParent()?.getParent()?.navigate('AddAsset', {
      screen: 'AssetTypeSelection',
      params: { portfolioId },
    });
  };

  const handleAssetPress = (assetId: string) => {
    if (!portfolioId) return;
    navigation.getParent()?.getParent()?.navigate('AssetDetailView', { 
      assetId, 
      portfolioId 
    });
  };

  // Calculate asset display data
  const calculateAssetValue = (asset: Asset): number => {
    return (asset.current_price || asset.purchase_price) * asset.quantity;
  };

  const calculateChangePercent = (asset: Asset): number => {
    const currentValue = calculateAssetValue(asset);
    const costBasis = asset.purchase_price * asset.quantity;
    return costBasis > 0 ? ((currentValue - costBasis) / costBasis) * 100 : 0;
  };

  const generateSparklineData = (asset: Asset): number[] => {
    // Generate mock sparkline data based on change percent
    // In production, this would come from price_history table
    const changePercent = calculateChangePercent(asset);
    const baseValue = 100;
    const endValue = baseValue + changePercent;
    
    // Generate 5 data points with some variation
    return [
      baseValue,
      baseValue + (changePercent * 0.2),
      baseValue + (changePercent * 0.5),
      baseValue + (changePercent * 0.7),
      endValue,
    ];
  };

  // Filter and search assets
  const filteredAssets = useMemo(() => {
    let result = [...assets];

    // Apply type filter
    if (selectedFilter !== 'All') {
      const filterType = ASSET_TYPE_MAP[selectedFilter];
      result = result.filter((asset) => asset.asset_type === filterType);
    }

    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (asset) =>
          asset.name.toLowerCase().includes(query) ||
          (asset.symbol && asset.symbol.toLowerCase().includes(query))
      );
    }

    return result;
  }, [assets, selectedFilter, searchQuery]);

  // Transform assets for AssetCard component
  const displayAssets = useMemo(() => {
    return filteredAssets.map((asset) => ({
      id: asset.id,
      name: asset.name,
      ticker: asset.symbol || asset.asset_type.toUpperCase(),
      logo: asset.metadata?.logo,
      quantity: asset.quantity,
      totalValue: calculateAssetValue(asset),
      changePercent: calculateChangePercent(asset),
      sparklineData: generateSparklineData(asset),
    }));
  }, [filteredAssets]);

  const renderAssetCard = ({ item }: { item: typeof displayAssets[0] }) => (
    <AssetCard asset={item} onPress={handleAssetPress} />
  );

  if (isLoading && assets.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.light.buttonPrimary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <PortfolioHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedFilter={selectedFilter}
        onFilterChange={setSelectedFilter}
        filters={FILTER_OPTIONS}
      />

      <FlatList
        data={displayAssets}
        keyExtractor={(item) => item.id}
        renderItem={renderAssetCard}
        contentContainerStyle={[
          styles.listContent,
          displayAssets.length === 0 && styles.listContentEmpty,
        ]}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={Colors.light.buttonPrimary}
          />
        }
        ListEmptyComponent={
          <EmptyState
            onAddAsset={handleAddAsset}
            message={
              searchQuery || selectedFilter !== 'All'
                ? 'No assets match your search'
                : 'No assets in this portfolio'
            }
          />
        }
      />

      <FloatingAddButton onPress={handleAddAsset} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.backgroundSecondary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.light.backgroundSecondary,
  },
  listContent: {
    padding: 16,
  },
  listContentEmpty: {
    flexGrow: 1,
  },
  headerButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
});
