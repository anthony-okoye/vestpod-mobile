/**
 * Ticker Search Screen
 * 
 * Search for listed assets (stocks, crypto, commodities) by symbol
 * Implements auto-complete for symbols
 * Requirements: 3
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AddAssetStackScreenProps } from '@/navigation/types';
import { supabase } from '@/services/supabase';

type Props = AddAssetStackScreenProps<'TickerSearch'>;

interface SearchResult {
  symbol: string;
  name: string;
  price?: number;
  type: string;
}

// Common stock symbols for auto-complete suggestions
const POPULAR_STOCKS = [
  { symbol: 'AAPL', name: 'Apple Inc.', type: 'stock' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', type: 'stock' },
  { symbol: 'MSFT', name: 'Microsoft Corporation', type: 'stock' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', type: 'stock' },
  { symbol: 'TSLA', name: 'Tesla Inc.', type: 'stock' },
  { symbol: 'META', name: 'Meta Platforms Inc.', type: 'stock' },
  { symbol: 'NVDA', name: 'NVIDIA Corporation', type: 'stock' },
  { symbol: 'JPM', name: 'JPMorgan Chase & Co.', type: 'stock' },
];

const POPULAR_CRYPTO = [
  { symbol: 'BTC', name: 'Bitcoin', type: 'crypto' },
  { symbol: 'ETH', name: 'Ethereum', type: 'crypto' },
  { symbol: 'SOL', name: 'Solana', type: 'crypto' },
  { symbol: 'XRP', name: 'Ripple', type: 'crypto' },
  { symbol: 'ADA', name: 'Cardano', type: 'crypto' },
  { symbol: 'DOGE', name: 'Dogecoin', type: 'crypto' },
  { symbol: 'DOT', name: 'Polkadot', type: 'crypto' },
  { symbol: 'MATIC', name: 'Polygon', type: 'crypto' },
];

const COMMODITIES = [
  { symbol: 'XAU', name: 'Gold', type: 'commodity' },
  { symbol: 'XAG', name: 'Silver', type: 'commodity' },
  { symbol: 'XPT', name: 'Platinum', type: 'commodity' },
  { symbol: 'XPD', name: 'Palladium', type: 'commodity' },
];

export default function TickerSearchScreen({ navigation, route }: Props) {
  const { portfolioId, assetType } = route.params;
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSymbol, setSelectedSymbol] = useState<SearchResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  const getPopularAssets = useCallback((): SearchResult[] => {
    switch (assetType) {
      case 'stock':
        return POPULAR_STOCKS;
      case 'crypto':
        return POPULAR_CRYPTO;
      case 'commodity':
        return COMMODITIES;
      default:
        return [];
    }
  }, [assetType]);

  const getAssetTypeLabel = (): string => {
    switch (assetType) {
      case 'stock':
        return 'Stock';
      case 'crypto':
        return 'Cryptocurrency';
      case 'commodity':
        return 'Commodity';
      default:
        return 'Asset';
    }
  };

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults(getPopularAssets());
      return;
    }

    const query = searchQuery.toUpperCase();
    const popularAssets = getPopularAssets();
    const filtered = popularAssets.filter(
      (asset) =>
        asset.symbol.includes(query) ||
        asset.name.toUpperCase().includes(query)
    );
    setSearchResults(filtered);
  }, [searchQuery, getPopularAssets]);

  const validateAndFetchPrice = async (symbol: string): Promise<number | null> => {
    try {
      const { data, error } = await supabase.functions.invoke('stock-price-handler', {
        body: null,
        method: 'GET',
      });

      // For now, return null as we'll validate on the backend when creating the asset
      return null;
    } catch {
      return null;
    }
  };

  const handleSelectSymbol = async (result: SearchResult) => {
    Keyboard.dismiss();
    setSelectedSymbol(result);
    setIsValidating(true);
    setError(null);

    try {
      // Navigate to asset details with the selected symbol
      navigation.navigate('AssetDetails', {
        portfolioId,
        assetType,
        symbol: result.symbol,
        name: result.name,
        currentPrice: result.price,
      });
    } catch (err) {
      setError('Failed to validate symbol. Please try again.');
    } finally {
      setIsValidating(false);
      setSelectedSymbol(null);
    }
  };

  const handleManualEntry = () => {
    if (!searchQuery.trim()) {
      setError('Please enter a symbol');
      return;
    }

    const symbol = searchQuery.toUpperCase().trim();
    navigation.navigate('AssetDetails', {
      portfolioId,
      assetType,
      symbol,
      name: symbol,
    });
  };

  const handleClose = () => {
    navigation.goBack();
  };

  const renderSearchResult = ({ item }: { item: SearchResult }) => {
    const isSelected = selectedSymbol?.symbol === item.symbol;

    return (
      <TouchableOpacity
        style={[styles.resultCard, isSelected && styles.resultCardSelected]}
        onPress={() => handleSelectSymbol(item)}
        disabled={isValidating}
      >
        <View style={styles.resultInfo}>
          <Text style={styles.resultSymbol}>{item.symbol}</Text>
          <Text style={styles.resultName} numberOfLines={1}>
            {item.name}
          </Text>
        </View>
        {isSelected && isValidating ? (
          <ActivityIndicator size="small" color="#0a7ea4" />
        ) : (
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleClose} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#11181C" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Search {getAssetTypeLabel()}</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder={`Enter ${assetType === 'crypto' ? 'symbol (e.g., BTC)' : 'ticker symbol (e.g., AAPL)'}`}
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="characters"
          autoCorrect={false}
          placeholderTextColor="#9CA3AF"
          returnKeyType="search"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        )}
      </View>

      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <View style={styles.content}>
        {!searchQuery.trim() && (
          <Text style={styles.sectionTitle}>Popular {getAssetTypeLabel()}s</Text>
        )}

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0a7ea4" />
            <Text style={styles.loadingText}>Searching...</Text>
          </View>
        ) : (
          <FlatList
            data={searchResults}
            keyExtractor={(item) => item.symbol}
            renderItem={renderSearchResult}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              searchQuery.trim() ? (
                <View style={styles.emptyContainer}>
                  <Ionicons name="search-outline" size={48} color="#9CA3AF" />
                  <Text style={styles.emptyTitle}>No results found</Text>
                  <Text style={styles.emptySubtitle}>
                    Try a different symbol or enter it manually
                  </Text>
                  <TouchableOpacity
                    style={styles.manualEntryButton}
                    onPress={handleManualEntry}
                  >
                    <Text style={styles.manualEntryButtonText}>
                      Use "{searchQuery.toUpperCase()}" anyway
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : null
            }
          />
        )}
      </View>

      {searchQuery.trim() && searchResults.length > 0 && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.manualEntryLink}
            onPress={handleManualEntry}
          >
            <Text style={styles.manualEntryLinkText}>
              Can't find your symbol? Use "{searchQuery.toUpperCase()}"
            </Text>
          </TouchableOpacity>
        </View>
      )}
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
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#11181C',
  },
  placeholder: {
    width: 32,
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
  errorBanner: {
    backgroundColor: '#FEE2E2',
    padding: 12,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 8,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
  },
  content: {
    flex: 1,
    paddingTop: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#687076',
    marginHorizontal: 16,
    marginBottom: 12,
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
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  resultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  resultCardSelected: {
    borderColor: '#0a7ea4',
    borderWidth: 2,
  },
  resultInfo: {
    flex: 1,
  },
  resultSymbol: {
    fontSize: 16,
    fontWeight: '700',
    color: '#11181C',
    marginBottom: 2,
  },
  resultName: {
    fontSize: 14,
    color: '#687076',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#11181C',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#687076',
    textAlign: 'center',
    marginBottom: 24,
  },
  manualEntryButton: {
    backgroundColor: '#0a7ea4',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  manualEntryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  manualEntryLink: {
    alignItems: 'center',
  },
  manualEntryLinkText: {
    color: '#0a7ea4',
    fontSize: 14,
    fontWeight: '500',
  },
});
