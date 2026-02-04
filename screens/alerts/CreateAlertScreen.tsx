/**
 * Create Alert Screen
 * 
 * Multi-step flow for creating price alerts
 * Requirements: 7
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { alertService, assetService, portfolioService, subscriptionService } from '@/services/api';

interface CreateAlertScreenProps {
  navigation: any;
  route?: {
    params?: {
      preselectedAssetId?: string;
    };
  };
}

interface Asset {
  id: string;
  portfolio_id: string;
  asset_type: string;
  symbol?: string;
  name: string;
  current_price?: number;
}

type AlertType = 'price_target' | 'percentage_change' | 'maturity_reminder';

interface AlertTypeOption {
  type: AlertType;
  label: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const ALERT_TYPES: AlertTypeOption[] = [
  {
    type: 'price_target',
    label: 'Price Target',
    description: 'Get notified when price reaches a specific value',
    icon: 'trending-up',
  },
  {
    type: 'percentage_change',
    label: 'Percentage Change',
    description: 'Get notified when price changes by a percentage',
    icon: 'analytics',
  },
  {
    type: 'maturity_reminder',
    label: 'Maturity Reminder',
    description: 'Get reminded before a fixed income asset matures',
    icon: 'calendar',
  },
];

const FREE_ALERT_LIMIT = 3;

export default function CreateAlertScreen({ navigation, route }: CreateAlertScreenProps) {
  const preselectedAssetId = route?.params?.preselectedAssetId;
  
  // Step management
  const [step, setStep] = useState<'asset' | 'type' | 'condition'>('asset');
  
  // Data
  const [assets, setAssets] = useState<Asset[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [selectedType, setSelectedType] = useState<AlertType | null>(null);
  const [conditionValue, setConditionValue] = useState('');
  
  // State
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [currentAlertCount, setCurrentAlertCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      
      // Check premium status
      const premium = await subscriptionService.isPremium();
      setIsPremium(premium);
      
      // Get current alert count
      const alerts = await alertService.getAlerts();
      setCurrentAlertCount(alerts?.length || 0);
      
      // Fetch all assets from all portfolios
      const portfolios = await portfolioService.getPortfolios();
      const allAssets: Asset[] = [];
      
      for (const portfolio of portfolios || []) {
        const portfolioAssets = await assetService.getAssets(portfolio.id);
        allAssets.push(...(portfolioAssets || []));
      }
      
      setAssets(allAssets);
      
      // If preselected asset, find and select it
      if (preselectedAssetId) {
        const preselected = allAssets.find(a => a.id === preselectedAssetId);
        if (preselected) {
          setSelectedAsset(preselected);
          setStep('type');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  }, [preselectedAssetId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const canCreateAlert = isPremium || currentAlertCount < FREE_ALERT_LIMIT;

  const handleSelectAsset = (asset: Asset) => {
    setSelectedAsset(asset);
    setStep('type');
  };

  const handleSelectType = (type: AlertType) => {
    setSelectedType(type);
    setConditionValue('');
    setStep('condition');
  };

  const handleBack = () => {
    if (step === 'type') {
      setStep('asset');
      setSelectedAsset(null);
    } else if (step === 'condition') {
      setStep('type');
      setSelectedType(null);
      setConditionValue('');
    } else {
      navigation.goBack();
    }
  };

  const validateConditionValue = (): boolean => {
    const value = parseFloat(conditionValue);
    
    if (isNaN(value)) {
      Alert.alert('Invalid Value', 'Please enter a valid number');
      return false;
    }

    if (selectedType === 'price_target' && value <= 0) {
      Alert.alert('Invalid Value', 'Price target must be greater than 0');
      return false;
    }

    if (selectedType === 'percentage_change' && (value === 0 || value < -100)) {
      Alert.alert('Invalid Value', 'Percentage change must be non-zero and greater than -100%');
      return false;
    }

    if (selectedType === 'maturity_reminder' && (value <= 0 || !Number.isInteger(value))) {
      Alert.alert('Invalid Value', 'Days before maturity must be a positive whole number');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!selectedAsset || !selectedType || !conditionValue) {
      Alert.alert('Error', 'Please complete all fields');
      return;
    }

    if (!validateConditionValue()) {
      return;
    }

    if (!canCreateAlert) {
      Alert.alert(
        'Alert Limit Reached',
        `Free users can create up to ${FREE_ALERT_LIMIT} alerts. Upgrade to Premium for unlimited alerts.`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Upgrade', onPress: () => navigation.navigate('Profile') },
        ]
      );
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await alertService.createAlert({
        asset_id: selectedAsset.id,
        alert_type: selectedType,
        condition_value: parseFloat(conditionValue),
        is_active: true,
      });

      Alert.alert(
        'Alert Created',
        'Your alert has been created successfully.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (err: any) {
      setError(err.message || 'Failed to create alert');
      Alert.alert('Error', err.message || 'Failed to create alert');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getConditionLabel = (): string => {
    switch (selectedType) {
      case 'price_target':
        return 'Target Price';
      case 'percentage_change':
        return 'Percentage Change (%)';
      case 'maturity_reminder':
        return 'Days Before Maturity';
      default:
        return 'Value';
    }
  };

  const getConditionPlaceholder = (): string => {
    switch (selectedType) {
      case 'price_target':
        return selectedAsset?.current_price 
          ? `Current: ${selectedAsset.current_price.toFixed(2)}`
          : 'Enter target price';
      case 'percentage_change':
        return 'e.g., 10 or -5';
      case 'maturity_reminder':
        return 'e.g., 30';
      default:
        return 'Enter value';
    }
  };

  const getConditionHint = (): string => {
    switch (selectedType) {
      case 'price_target':
        return 'You will be notified when the asset price reaches this value.';
      case 'percentage_change':
        return 'Enter a positive value for price increase or negative for decrease.';
      case 'maturity_reminder':
        return 'You will be reminded this many days before the asset matures.';
      default:
        return '';
    }
  };

  const getAlertTypeColor = (alertType: AlertType): string => {
    switch (alertType) {
      case 'price_target': return '#10B981';
      case 'percentage_change': return '#F59E0B';
      case 'maturity_reminder': return '#6366F1';
      default: return '#687076';
    }
  };

  const renderAssetItem = ({ item }: { item: Asset }) => (
    <TouchableOpacity
      style={[
        styles.assetItem,
        selectedAsset?.id === item.id && styles.assetItemSelected,
      ]}
      onPress={() => handleSelectAsset(item)}
    >
      <View style={styles.assetIcon}>
        <Ionicons 
          name={getAssetTypeIcon(item.asset_type)} 
          size={24} 
          color="#0a7ea4" 
        />
      </View>
      <View style={styles.assetInfo}>
        <Text style={styles.assetName}>{item.symbol || item.name}</Text>
        <Text style={styles.assetType}>{formatAssetType(item.asset_type)}</Text>
      </View>
      {item.current_price && (
        <Text style={styles.assetPrice}>
          ${item.current_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </Text>
      )}
      <Ionicons name="chevron-forward" size={20} color="#687076" />
    </TouchableOpacity>
  );

  const renderAlertTypeItem = (alertType: AlertTypeOption) => (
    <TouchableOpacity
      key={alertType.type}
      style={[
        styles.alertTypeItem,
        selectedType === alertType.type && styles.alertTypeItemSelected,
      ]}
      onPress={() => handleSelectType(alertType.type)}
    >
      <View style={[styles.alertTypeIcon, { backgroundColor: getAlertTypeColor(alertType.type) }]}>
        <Ionicons name={alertType.icon} size={24} color="#FFFFFF" />
      </View>
      <View style={styles.alertTypeInfo}>
        <Text style={styles.alertTypeLabel}>{alertType.label}</Text>
        <Text style={styles.alertTypeDescription}>{alertType.description}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#687076" />
    </TouchableOpacity>
  );

  const renderPremiumUpsell = () => (
    <View style={styles.premiumBanner}>
      <View style={styles.premiumIconContainer}>
        <Ionicons name="star" size={24} color="#F59E0B" />
      </View>
      <View style={styles.premiumInfo}>
        <Text style={styles.premiumTitle}>Alert Limit Reached</Text>
        <Text style={styles.premiumDescription}>
          Free users can create up to {FREE_ALERT_LIMIT} alerts. Upgrade to Premium for unlimited alerts.
        </Text>
      </View>
      <TouchableOpacity 
        style={styles.upgradeButton}
        onPress={() => navigation.navigate('Profile')}
      >
        <Text style={styles.upgradeButtonText}>Upgrade</Text>
      </TouchableOpacity>
    </View>
  );

  // Loading state
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0a7ea4" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (error && !assets.length) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color="#DC2626" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchData}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color="#11181C" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {step === 'asset' && 'Select Asset'}
          {step === 'type' && 'Alert Type'}
          {step === 'condition' && 'Set Condition'}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Progress indicator */}
      <View style={styles.progressContainer}>
        <View style={[styles.progressStep, step === 'asset' && styles.progressStepActive]}>
          <Text style={[styles.progressStepText, step === 'asset' && styles.progressStepTextActive]}>1</Text>
        </View>
        <View style={[styles.progressLine, (step === 'type' || step === 'condition') && styles.progressLineActive]} />
        <View style={[styles.progressStep, step === 'type' && styles.progressStepActive]}>
          <Text style={[styles.progressStepText, step === 'type' && styles.progressStepTextActive]}>2</Text>
        </View>
        <View style={[styles.progressLine, step === 'condition' && styles.progressLineActive]} />
        <View style={[styles.progressStep, step === 'condition' && styles.progressStepActive]}>
          <Text style={[styles.progressStepText, step === 'condition' && styles.progressStepTextActive]}>3</Text>
        </View>
      </View>

      {/* Premium upsell banner */}
      {!canCreateAlert && renderPremiumUpsell()}

      {/* Step 1: Asset Selection */}
      {step === 'asset' && (
        <View style={styles.stepContainer}>
          <Text style={styles.stepTitle}>Choose an asset for your alert</Text>
          {assets.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="wallet-outline" size={48} color="#D1D5DB" />
              <Text style={styles.emptyTitle}>No Assets Found</Text>
              <Text style={styles.emptySubtitle}>
                Add assets to your portfolio first to create alerts.
              </Text>
            </View>
          ) : (
            <FlatList
              data={assets}
              renderItem={renderAssetItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.assetList}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      )}

      {/* Step 2: Alert Type Selection */}
      {step === 'type' && (
        <ScrollView style={styles.stepContainer} showsVerticalScrollIndicator={false}>
          <Text style={styles.stepTitle}>Select alert type</Text>
          {selectedAsset && (
            <View style={styles.selectedAssetBadge}>
              <Ionicons name="checkmark-circle" size={16} color="#10B981" />
              <Text style={styles.selectedAssetText}>
                {selectedAsset.symbol || selectedAsset.name}
              </Text>
            </View>
          )}
          <View style={styles.alertTypeList}>
            {ALERT_TYPES.map(renderAlertTypeItem)}
          </View>
        </ScrollView>
      )}

      {/* Step 3: Condition Input */}
      {step === 'condition' && (
        <KeyboardAvoidingView 
          style={styles.stepContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.stepTitle}>Set alert condition</Text>
            
            {/* Selected asset and type summary */}
            <View style={styles.summaryContainer}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Asset:</Text>
                <Text style={styles.summaryValue}>
                  {selectedAsset?.symbol || selectedAsset?.name}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Alert Type:</Text>
                <Text style={styles.summaryValue}>
                  {ALERT_TYPES.find(t => t.type === selectedType)?.label}
                </Text>
              </View>
            </View>

            {/* Condition input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>{getConditionLabel()}</Text>
              <TextInput
                style={styles.input}
                value={conditionValue}
                onChangeText={setConditionValue}
                placeholder={getConditionPlaceholder()}
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
                autoFocus
              />
              <Text style={styles.inputHint}>{getConditionHint()}</Text>
            </View>

            {/* Submit button */}
            <TouchableOpacity
              style={[
                styles.submitButton,
                (!conditionValue || isSubmitting || !canCreateAlert) && styles.submitButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={!conditionValue || isSubmitting || !canCreateAlert}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="notifications" size={20} color="#FFFFFF" />
                  <Text style={styles.submitButtonText}>Create Alert</Text>
                </>
              )}
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  );
}

// Helper functions
function getAssetTypeIcon(assetType: string): keyof typeof Ionicons.glyphMap {
  switch (assetType) {
    case 'stock': return 'trending-up';
    case 'crypto': return 'logo-bitcoin';
    case 'bond': return 'document-text';
    case 'mutual_fund': return 'pie-chart';
    case 'etf': return 'layers';
    case 'real_estate': return 'home';
    case 'commodity': return 'cube';
    case 'forex': return 'swap-horizontal';
    default: return 'wallet';
  }
}

function formatAssetType(assetType: string): string {
  const typeMap: Record<string, string> = {
    stock: 'Stock',
    crypto: 'Cryptocurrency',
    bond: 'Bond',
    mutual_fund: 'Mutual Fund',
    etf: 'ETF',
    real_estate: 'Real Estate',
    commodity: 'Commodity',
    forex: 'Forex',
  };
  return typeMap[assetType] || assetType;
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
  headerSpacer: {
    width: 32,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
  },
  progressStep: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressStepActive: {
    backgroundColor: '#0a7ea4',
  },
  progressStepText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#687076',
  },
  progressStepTextActive: {
    color: '#FFFFFF',
  },
  progressLine: {
    width: 40,
    height: 2,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 8,
  },
  progressLineActive: {
    backgroundColor: '#0a7ea4',
  },
  premiumBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
  },
  premiumIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  premiumInfo: {
    flex: 1,
  },
  premiumTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400E',
  },
  premiumDescription: {
    fontSize: 12,
    color: '#B45309',
    marginTop: 2,
  },
  upgradeButton: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  upgradeButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  stepContainer: {
    flex: 1,
    padding: 16,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#11181C',
    marginBottom: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyTitle: {
    fontSize: 18,
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
  assetList: {
    paddingBottom: 16,
  },
  assetItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  assetItemSelected: {
    borderWidth: 2,
    borderColor: '#0a7ea4',
  },
  assetIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E0F2FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  assetInfo: {
    flex: 1,
  },
  assetName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#11181C',
  },
  assetType: {
    fontSize: 12,
    color: '#687076',
    marginTop: 2,
  },
  assetPrice: {
    fontSize: 14,
    fontWeight: '500',
    color: '#11181C',
    marginRight: 8,
  },
  selectedAssetBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
    marginBottom: 16,
    gap: 6,
  },
  selectedAssetText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#065F46',
  },
  alertTypeList: {
    gap: 12,
  },
  alertTypeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
  },
  alertTypeItemSelected: {
    borderWidth: 2,
    borderColor: '#0a7ea4',
  },
  alertTypeIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  alertTypeInfo: {
    flex: 1,
  },
  alertTypeLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#11181C',
  },
  alertTypeDescription: {
    fontSize: 12,
    color: '#687076',
    marginTop: 4,
  },
  summaryContainer: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#687076',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#11181C',
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#11181C',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    color: '#11181C',
  },
  inputHint: {
    fontSize: 12,
    color: '#687076',
    marginTop: 8,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0a7ea4',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  submitButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
