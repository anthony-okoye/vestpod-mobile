/**
 * Portfolio Screen
 * 
 * Displays list of user portfolios with CRUD operations
 * Requirements: 2
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MainTabScreenProps } from '@/navigation/types';
import { portfolioService } from '@/services/api';
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

type Props = MainTabScreenProps<'Portfolio'>;

interface Portfolio {
  id: string;
  name: string;
  user_id: string;
  total_value?: number;
  created_at: string;
  updated_at: string;
}

export default function PortfolioScreen({ navigation }: Props) {
  const dispatch = useAppDispatch();
  const { portfolios, selectedPortfolioId, isLoading, error } = useAppSelector(
    (state) => state.portfolio
  );

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingPortfolio, setEditingPortfolio] = useState<Portfolio | null>(null);
  const [portfolioName, setPortfolioName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const loadPortfolios = useCallback(async () => {
    try {
      dispatch(setLoading(true));
      const data = await portfolioService.getPortfolios();
      dispatch(setPortfolios(data || []));
    } catch (err) {
      dispatch(setError('Failed to load portfolios'));
    }
  }, [dispatch]);

  useEffect(() => {
    loadPortfolios();
  }, [loadPortfolios]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadPortfolios();
    setIsRefreshing(false);
  };

  const openCreateModal = () => {
    setEditingPortfolio(null);
    setPortfolioName('');
    setModalVisible(true);
  };

  const openEditModal = (portfolio: Portfolio) => {
    setEditingPortfolio(portfolio);
    setPortfolioName(portfolio.name);
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!portfolioName.trim()) {
      Alert.alert('Error', 'Portfolio name is required');
      return;
    }

    setIsSaving(true);
    try {
      if (editingPortfolio) {
        const updated = await portfolioService.updatePortfolio(
          editingPortfolio.id,
          portfolioName.trim()
        );
        dispatch(updatePortfolio(updated));
      } else {
        const created = await portfolioService.createPortfolio(portfolioName.trim());
        dispatch(addPortfolio(created));
      }
      setModalVisible(false);
      setPortfolioName('');
      setEditingPortfolio(null);
    } catch (err) {
      Alert.alert('Error', 'Failed to save portfolio');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = (portfolio: Portfolio) => {
    Alert.alert(
      'Delete Portfolio',
      `Are you sure you want to delete "${portfolio.name}"? This will also delete all assets in this portfolio.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await portfolioService.deletePortfolio(portfolio.id);
              dispatch(removePortfolio(portfolio.id));
            } catch (err) {
              Alert.alert('Error', 'Failed to delete portfolio');
            }
          },
        },
      ]
    );
  };

  const handleSelectPortfolio = (portfolioId: string) => {
    dispatch(selectPortfolio(portfolioId));
  };

  const renderPortfolioItem = ({ item }: { item: Portfolio }) => {
    const isSelected = item.id === selectedPortfolioId;

    return (
      <TouchableOpacity
        style={[styles.portfolioCard, isSelected && styles.portfolioCardSelected]}
        onPress={() => handleSelectPortfolio(item.id)}
        onLongPress={() => openEditModal(item)}
      >
        <View style={styles.portfolioInfo}>
          <View style={styles.portfolioHeader}>
            <Text style={styles.portfolioName}>{item.name}</Text>
            {isSelected && (
              <View style={styles.selectedBadge}>
                <Text style={styles.selectedBadgeText}>Active</Text>
              </View>
            )}
          </View>
          <Text style={styles.portfolioDate}>
            Created {new Date(item.created_at).toLocaleDateString()}
          </Text>
        </View>
        <View style={styles.portfolioActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => openEditModal(item)}
          >
            <Ionicons name="pencil" size={20} color="#687076" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleDelete(item)}
          >
            <Ionicons name="trash-outline" size={20} color="#DC2626" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading && portfolios.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0a7ea4" />
        <Text style={styles.loadingText}>Loading portfolios...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Portfolios</Text>
        <TouchableOpacity style={styles.addButton} onPress={openCreateModal}>
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={loadPortfolios}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={portfolios}
        keyExtractor={(item) => item.id}
        renderItem={renderPortfolioItem}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="folder-open-outline" size={64} color="#9CA3AF" />
            <Text style={styles.emptyTitle}>No Portfolios Yet</Text>
            <Text style={styles.emptySubtitle}>
              Create your first portfolio to start tracking your investments
            </Text>
            <TouchableOpacity style={styles.createButton} onPress={openCreateModal}>
              <Text style={styles.createButtonText}>Create Portfolio</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* Create/Edit Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingPortfolio ? 'Edit Portfolio' : 'Create Portfolio'}
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Portfolio Name"
              value={portfolioName}
              onChangeText={setPortfolioName}
              autoFocus
              maxLength={50}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setModalVisible(false)}
                disabled={isSaving}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
                onPress={handleSave}
                disabled={isSaving}
              >
                {isSaving ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.saveButtonText}>
                    {editingPortfolio ? 'Update' : 'Create'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  addButton: {
    backgroundColor: '#0a7ea4',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    padding: 12,
    marginHorizontal: 16,
    marginTop: 16,
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
  portfolioCard: {
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
  portfolioCardSelected: {
    borderWidth: 2,
    borderColor: '#0a7ea4',
  },
  portfolioInfo: {
    flex: 1,
  },
  portfolioHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  portfolioName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#11181C',
    marginRight: 8,
  },
  selectedBadge: {
    backgroundColor: '#0a7ea4',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  selectedBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  portfolioDate: {
    fontSize: 12,
    color: '#687076',
  },
  portfolioActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    padding: 8,
  },
  emptyContainer: {
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
  createButton: {
    backgroundColor: '#0a7ea4',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    width: '85%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#11181C',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  cancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  cancelButtonText: {
    color: '#687076',
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#0a7ea4',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
