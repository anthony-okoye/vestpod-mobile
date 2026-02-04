/**
 * Alerts Screen
 * 
 * Displays list of user's price alerts with CRUD operations
 * Requirements: 7
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MainTabScreenProps } from '@/navigation/types';
import { alertService, assetService } from '@/services/api';

type Props = MainTabScreenProps<'Alerts'>;

interface AlertItem {
  id: string;
  asset_id: string;
  alert_type: 'price_target' | 'percentage_change' | 'maturity_reminder';
  condition_value: number;
  is_active: boolean;
  triggered_at?: string;
  created_at: string;
}

interface AssetInfo {
  id: string;
  symbol?: string;
  name: string;
  current_price?: number;
}

const ALERT_TYPE_LABELS: Record<string, string> = {
  price_target: 'Price Target',
  percentage_change: 'Percentage Change',
  maturity_reminder: 'Maturity Reminder',
};

const ALERT_TYPE_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  price_target: 'trending-up',
  percentage_change: 'analytics',
  maturity_reminder: 'calendar',
};

export default function AlertsScreen({ navigation }: Props) {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [assets, setAssets] = useState<Map<string, AssetInfo>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAlerts = useCallback(async () => {
    try {
      setError(null);
      const alertsData = await alertService.getAlerts();
      setAlerts(alertsData || []);
      
      // Fetch asset info for each alert
      const assetIds = [...new Set(alertsData?.map((a: AlertItem) => a.asset_id) || [])];
      const assetMap = new Map<string, AssetInfo>();
      
      for (const assetId of assetIds) {
        try {
          const asset = await assetService.getAsset(assetId);
          assetMap.set(assetId, asset);
        } catch {
          // Asset might have been deleted
        }
      }
      
      setAssets(assetMap);
    } catch (err: any) {
      setError(err.message || 'Failed to load alerts');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchAlerts();
  };

  const handleCreateAlert = () => {
    // Navigate to create alert screen
    navigation.navigate('CreateAlert');
  };

  const handleToggleAlert = async (alertId: string, isActive: boolean) => {
    try {
      await alertService.updateAlert(alertId, { is_active: isActive });
      setAlerts(prev => 
        prev.map(a => a.id === alertId ? { ...a, is_active: isActive } : a)
      );
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to update alert');
    }
  };

  const handleDeleteAlert = (alertId: string, assetName: string) => {
    Alert.alert(
      'Delete Alert',
      `Are you sure you want to delete this alert for ${assetName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await alertService.deleteAlert(alertId);
              setAlerts(prev => prev.filter(a => a.id !== alertId));
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to delete alert');
            }
          },
        },
      ]
    );
  };

  const formatConditionValue = (alert: AlertItem): string => {
    switch (alert.alert_type) {
      case 'price_target':
        return `$${alert.condition_value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      case 'percentage_change':
        return `${alert.condition_value > 0 ? '+' : ''}${alert.condition_value}%`;
      case 'maturity_reminder':
        return `${alert.condition_value} days before`;
      default:
        return String(alert.condition_value);
    }
  };

  const getAlertTypeColor = (alertType: string): string => {
    switch (alertType) {
      case 'price_target': return '#10B981';
      case 'percentage_change': return '#F59E0B';
      case 'maturity_reminder': return '#6366F1';
      default: return '#687076';
    }
  };

  const renderAlertItem = ({ item }: { item: AlertItem }) => {
    const asset = assets.get(item.asset_id);
    const assetName = asset?.symbol || asset?.name || 'Unknown Asset';
    
    return (
      <View style={[styles.alertCard, !item.is_active && styles.alertCardInactive]}>
        <View style={styles.alertHeader}>
          <View style={[styles.alertTypeIcon, { backgroundColor: getAlertTypeColor(item.alert_type) }]}>
            <Ionicons 
              name={ALERT_TYPE_ICONS[item.alert_type] || 'notifications'} 
              size={16} 
              color="#FFFFFF" 
            />
          </View>
          <View style={styles.alertInfo}>
            <Text style={styles.alertAssetName}>{assetName}</Text>
            <Text style={styles.alertType}>{ALERT_TYPE_LABELS[item.alert_type] || item.alert_type}</Text>
          </View>
          <Switch
            value={item.is_active}
            onValueChange={(value) => handleToggleAlert(item.id, value)}
            trackColor={{ false: '#E5E7EB', true: '#0a7ea4' }}
            thumbColor="#FFFFFF"
          />
        </View>
        
        <View style={styles.alertCondition}>
          <Text style={styles.conditionLabel}>Trigger when:</Text>
          <Text style={styles.conditionValue}>{formatConditionValue(item)}</Text>
        </View>
        
        {item.triggered_at && (
          <View style={styles.triggeredBadge}>
            <Ionicons name="checkmark-circle" size={14} color="#10B981" />
            <Text style={styles.triggeredText}>
              Triggered {new Date(item.triggered_at).toLocaleDateString()}
            </Text>
          </View>
        )}
        
        <View style={styles.alertActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleDeleteAlert(item.id, assetName)}
          >
            <Ionicons name="trash-outline" size={18} color="#DC2626" />
            <Text style={styles.deleteText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="notifications-off-outline" size={64} color="#D1D5DB" />
      <Text style={styles.emptyTitle}>No Alerts Yet</Text>
      <Text style={styles.emptySubtitle}>
        Create price alerts to get notified when your assets reach target prices
      </Text>
      <TouchableOpacity style={styles.createButton} onPress={handleCreateAlert}>
        <Ionicons name="add" size={20} color="#FFFFFF" />
        <Text style={styles.createButtonText}>Create Alert</Text>
      </TouchableOpacity>
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0a7ea4" />
          <Text style={styles.loadingText}>Loading alerts...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color="#DC2626" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchAlerts}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Alerts</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleCreateAlert}>
          <Ionicons name="add" size={24} color="#0a7ea4" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={alerts}
        renderItem={renderAlertItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={alerts.length === 0 ? styles.emptyList : styles.list}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
      />
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
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#11181C',
  },
  addButton: {
    padding: 8,
  },
  list: {
    padding: 16,
  },
  emptyList: {
    flex: 1,
  },
  alertCard: {
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
  alertCardInactive: {
    opacity: 0.6,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  alertTypeIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  alertInfo: {
    flex: 1,
  },
  alertAssetName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#11181C',
  },
  alertType: {
    fontSize: 12,
    color: '#687076',
    marginTop: 2,
  },
  alertCondition: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  conditionLabel: {
    fontSize: 14,
    color: '#687076',
    marginRight: 8,
  },
  conditionValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#11181C',
  },
  triggeredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 4,
  },
  triggeredText: {
    fontSize: 12,
    color: '#10B981',
  },
  alertActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  deleteText: {
    fontSize: 14,
    color: '#DC2626',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#11181C',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#687076',
    textAlign: 'center',
    marginTop: 8,
    maxWidth: 280,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0a7ea4',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 24,
    gap: 8,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
