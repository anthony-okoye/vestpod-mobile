/**
 * PortfolioListScreen Component
 * 
 * Displays all user portfolios with CRUD operations.
 * Supports portfolio creation, editing, deletion, and navigation to portfolio details.
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.2, 2.4, 2.5, 2.6, 3.1, 3.2, 5.1, 5.3, 5.4, 5.5, 6.1, 6.2, 6.3, 6.4, 6.5, 6.6
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Alert,
  ActionSheetIOS,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PortfolioStackScreenProps } from '@/navigation/types';
import { portfolioService, assetService } from '@/services/api';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  setPortfolios,
  addPortfolio,
  updatePortfolio,
  removePortfolio,
  selectPortfolio,
  setLoading,
  setError,
} from '@/store/slices/portfolioSlice';
import { PortfolioCard, CreatePortfolioModal } from '@/components/portfolio';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/theme';

type Props = PortfolioStackScreenProps<'PortfolioList'>;

interface Portfolio {
  id: string;
  name: string;
  user_id: string;
  total_value: number;
  created_at: string;
  updated_at: string;
}

interface PortfolioWithMetrics {
  id: string;
  name: string;
  totalValue: number;
  assetCount: number;
  performance: number;
}

interface Asset {
  id: string;
  portfolio_id: string;
  asset_type: string;
  symbol?: string;
  name: string;
  quantity: number;
  purchase_price: number;
  current_price?: number;
}

export default function PortfolioListScreen({ navigation }: Props) {
  const dispatch = useAppDispatch();
  const { portfolios, isLoading } = useAppSelector((state) => state.portfolio);

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingPortfolio, setEditingPortfolio] = useState<Portfolio | null>(null);
  const [portfolioMetrics, setPortfolioMetrics] = useState<Map<string, PortfolioWithMetrics>>(new Map());

  // Load portfolios from API
  const loadPortfolios = useCallback(async () => {
    try {
      dispatch(setLoading(true));
      const data = await portfolioService.getPortfolios();
      dispatch(setPortfolios(data || []));
      
      // Load metrics for each portfolio
      if (data && data.length > 0) {
        await loadPortfolioMetrics(data);
      }
    } catch (err: any) {
      dispatch(setError(err?.message || 'Failed to load portfolios'));
      Alert.alert('Error', 'Failed to load portfolios. Please try again.');
    }
  }, [dispatch]);

  // Load metrics (asset count, total value, performance) for portfolios
  const loadPortfolioMetrics = async (portfolioList: Portfolio[]) => {
    const metricsMap = new Map<string, PortfolioWithMetrics>();

    await Promise.all(
      portfolioList.map(async (portfolio) => {
        try {
          const assets = await assetService.getAssets(portfolio.id);
          
          let totalValue = 0;
          let totalCost = 0;
          
          assets.forEach((asset: Asset) => {
            const currentPrice = asset.current_price || asset.purchase_price;
            const assetValue = currentPrice * asset.quantity;
            const assetCost = asset.purchase_price * asset.quantity;
            
            totalValue += assetValue;
            totalCost += assetCost;
          });

          const performance = totalCost > 0 ? ((totalValue - totalCost) / totalCost) * 100 : 0;

          metricsMap.set(portfolio.id, {
            id: portfolio.id,
            name: portfolio.name,
            totalValue,
            assetCount: assets.length,
            performance,
          });
        } catch (err) {
          // If metrics fail for a portfolio, use defaults
          metricsMap.set(portfolio.id, {
            id: portfolio.id,
            name: portfolio.name,
            totalValue: 0,
            assetCount: 0,
            performance: 0,
          });
        }
      })
    );

    setPortfolioMetrics(metricsMap);
  };

  // Initial load
  useEffect(() => {
    loadPortfolios();
  }, [loadPortfolios]);

  // Handle pull-to-refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadPortfolios();
    setIsRefreshing(false);
  };

  // Handle portfolio selection (Requirement 3.1, 3.2)
  const handlePortfolioPress = (portfolio: PortfolioWithMetrics) => {
    dispatch(selectPortfolio(portfolio.id));
    navigation.navigate('PortfolioDetail', {
      portfolioId: portfolio.id,
      portfolioName: portfolio.name,
    });
  };

  // Handle portfolio options (long press) (Requirement 5.1, 6.1)
  const handlePortfolioOptions = (portfolio: PortfolioWithMetrics) => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Edit', 'Delete'],
          destructiveButtonIndex: 2,
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            handleEditPortfolio(portfolio);
          } else if (buttonIndex === 2) {
            handleDeletePortfolio(portfolio);
          }
        }
      );
    } else {
      // Android: Show alert with options
      Alert.alert(
        portfolio.name,
        'Choose an action',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Edit', onPress: () => handleEditPortfolio(portfolio) },
          {
            text: 'Delete',
            onPress: () => handleDeletePortfolio(portfolio),
            style: 'destructive',
          },
        ],
        { cancelable: true }
      );
    }
  };

  // Handle portfolio creation (Requirement 2.2, 2.4, 2.5, 2.6)
  const handleCreatePortfolio = async (name: string) => {
    try {
      // Check for duplicate name
      const existingPortfolio = portfolios.find(
        (p) => p.name.toLowerCase() === name.toLowerCase()
      );
      
      if (existingPortfolio) {
        throw new Error('Portfolio name already exists. Please choose a different name.');
      }

      const newPortfolio = await portfolioService.createPortfolio(name);
      dispatch(addPortfolio(newPortfolio));
      
      // Add to metrics map with default values
      setPortfolioMetrics((prev) => {
        const updated = new Map(prev);
        updated.set(newPortfolio.id, {
          id: newPortfolio.id,
          name: newPortfolio.name,
          totalValue: 0,
          assetCount: 0,
          performance: 0,
        });
        return updated;
      });

      setShowCreateModal(false);
      
      // Show success message
      Alert.alert('Success', `Portfolio "${name}" created successfully!`);
    } catch (err: any) {
      // Re-throw error to be handled by modal
      throw err;
    }
  };

  // Handle portfolio editing (Requirement 5.3, 5.4, 5.5)
  const handleEditPortfolio = (portfolio: PortfolioWithMetrics) => {
    const fullPortfolio = portfolios.find((p) => p.id === portfolio.id);
    if (fullPortfolio) {
      setEditingPortfolio(fullPortfolio);
      setShowCreateModal(true);
    }
  };

  const handleUpdatePortfolio = async (name: string) => {
    if (!editingPortfolio) return;

    try {
      // Check for duplicate name (excluding current portfolio)
      const existingPortfolio = portfolios.find(
        (p) => p.id !== editingPortfolio.id && p.name.toLowerCase() === name.toLowerCase()
      );
      
      if (existingPortfolio) {
        throw new Error('Portfolio name already exists. Please choose a different name.');
      }

      const updatedPortfolio = await portfolioService.updatePortfolio(
        editingPortfolio.id,
        name
      );
      dispatch(updatePortfolio(updatedPortfolio));
      
      // Update metrics map
      setPortfolioMetrics((prev) => {
        const updated = new Map(prev);
        const existing = updated.get(editingPortfolio.id);
        if (existing) {
          updated.set(editingPortfolio.id, {
            ...existing,
            name,
          });
        }
        return updated;
      });

      setShowCreateModal(false);
      setEditingPortfolio(null);
      
      // Show success message
      Alert.alert('Success', `Portfolio renamed to "${name}"!`);
    } catch (err: any) {
      // Re-throw error to be handled by modal
      throw err;
    }
  };

  // Handle portfolio deletion (Requirement 6.2, 6.3, 6.4, 6.5, 6.6)
  const handleDeletePortfolio = (portfolio: PortfolioWithMetrics) => {
    // Check if this is the only portfolio (Requirement 6.3)
    if (portfolios.length === 1) {
      Alert.alert(
        'Cannot Delete',
        'Cannot delete your only portfolio. Create another portfolio first.',
        [{ text: 'OK' }]
      );
      return;
    }

    // Show confirmation dialog (Requirement 6.1, 6.2)
    Alert.alert(
      'Delete Portfolio',
      `Are you sure you want to delete "${portfolio.name}"? This will also delete all ${portfolio.assetCount} asset${portfolio.assetCount === 1 ? '' : 's'} in this portfolio.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await portfolioService.deletePortfolio(portfolio.id);
              dispatch(removePortfolio(portfolio.id));
              
              // Remove from metrics map
              setPortfolioMetrics((prev) => {
                const updated = new Map(prev);
                updated.delete(portfolio.id);
                return updated;
              });

              Alert.alert('Success', `Portfolio "${portfolio.name}" deleted successfully.`);
            } catch (err: any) {
              Alert.alert('Error', err?.message || 'Failed to delete portfolio. Please try again.');
            }
          },
        },
      ]
    );
  };

  // Handle modal close
  const handleModalClose = () => {
    setShowCreateModal(false);
    setEditingPortfolio(null);
  };

  // Transform portfolios with metrics for display
  const displayPortfolios = useMemo(() => {
    return portfolios
      .map((portfolio) => {
        const metrics = portfolioMetrics.get(portfolio.id);
        return metrics || {
          id: portfolio.id,
          name: portfolio.name,
          totalValue: 0,
          assetCount: 0,
          performance: 0,
        };
      })
      .sort((a, b) => a.name.localeCompare(b.name)); // Sort alphabetically
  }, [portfolios, portfolioMetrics]);

  // Render portfolio card
  const renderPortfolioCard = ({ item }: { item: PortfolioWithMetrics }) => (
    <PortfolioCard
      portfolio={item}
      onPress={() => handlePortfolioPress(item)}
      onLongPress={() => handlePortfolioOptions(item)}
    />
  );

  // Render empty state (Requirement 1.4)
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="briefcase-outline" size={80} color={Colors.light.textSecondary} />
      <Text style={styles.emptyTitle}>No Portfolios Yet</Text>
      <Text style={styles.emptyMessage}>
        Create your first portfolio to start tracking your investments
      </Text>
      <TouchableOpacity
        style={styles.emptyButton}
        onPress={() => setShowCreateModal(true)}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel="Create your first portfolio"
      >
        <Text style={styles.emptyButtonText}>Create Portfolio</Text>
      </TouchableOpacity>
    </View>
  );

  // Render loading state (Requirement 1.3)
  if (isLoading && portfolios.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.light.buttonPrimary} />
        <Text style={styles.loadingText}>Loading portfolios...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Portfolios</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowCreateModal(true)}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Create new portfolio"
        >
          <Ionicons name="add" size={24} color={Colors.light.buttonPrimaryText} />
        </TouchableOpacity>
      </View>

      {/* Portfolio List (Requirement 1.1, 1.2, 1.5) */}
      <FlatList
        data={displayPortfolios}
        keyExtractor={(item) => item.id}
        renderItem={renderPortfolioCard}
        contentContainerStyle={[
          styles.listContent,
          displayPortfolios.length === 0 && styles.listContentEmpty,
        ]}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={Colors.light.buttonPrimary}
          />
        }
        ListEmptyComponent={renderEmptyState}
      />

      {/* Create/Edit Portfolio Modal */}
      <CreatePortfolioModal
        visible={showCreateModal}
        onClose={handleModalClose}
        onSubmit={editingPortfolio ? handleUpdatePortfolio : handleCreatePortfolio}
        initialName={editingPortfolio?.name}
        mode={editingPortfolio ? 'edit' : 'create'}
      />
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
  loadingText: {
    marginTop: Spacing.md,
    fontSize: Typography.fontSizes.base,
    color: Colors.light.textSecondary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.md,
    backgroundColor: Colors.light.background,
  },
  headerTitle: {
    fontSize: Typography.fontSizes['3xl'],
    fontWeight: Typography.fontWeights.bold,
    color: Colors.light.text,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.light.buttonPrimary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: Spacing.base,
  },
  listContentEmpty: {
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  emptyTitle: {
    fontSize: Typography.fontSizes['2xl'],
    fontWeight: Typography.fontWeights.bold,
    color: Colors.light.text,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  emptyMessage: {
    fontSize: Typography.fontSizes.base,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  emptyButton: {
    backgroundColor: Colors.light.buttonPrimary,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.lg,
  },
  emptyButtonText: {
    fontSize: Typography.fontSizes.base,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.light.buttonPrimaryText,
  },
});
