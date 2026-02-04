/**
 * Asset Details Screen
 * 
 * Form for entering asset details
 * - Listed assets: quantity, purchase price, date
 * - Non-listed assets: name, value, purchase date + conditional fields
 * Requirements: 3, 4
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AddAssetStackScreenProps } from '@/navigation/types';
import { assetService } from '@/services/api';
import { useAppDispatch } from '@/store/hooks';
import { addAsset } from '@/store/slices/assetsSlice';

type Props = AddAssetStackScreenProps<'AssetDetails'>;

// Non-listed asset types
const NON_LISTED_TYPES = ['real_estate', 'fixed_income', 'other'];

export default function AssetDetailsScreen({ navigation, route }: Props) {
  const { portfolioId, assetType, symbol, name: initialName, currentPrice } = route.params;
  const dispatch = useAppDispatch();

  const isNonListed = NON_LISTED_TYPES.includes(assetType);

  // Common fields
  const [assetName, setAssetName] = useState(initialName || '');
  const [quantity, setQuantity] = useState(isNonListed ? '1' : '');
  const [purchasePrice, setPurchasePrice] = useState(currentPrice?.toString() || '');
  const [purchaseDate, setPurchaseDate] = useState(formatDate(new Date()));
  
  // Non-listed asset fields
  const [currentValue, setCurrentValue] = useState('');
  
  // Fixed income specific fields
  const [maturityDate, setMaturityDate] = useState('');
  const [interestRate, setInterestRate] = useState('');
  
  // Real estate specific fields
  const [propertyAddress, setPropertyAddress] = useState('');
  const [propertyType, setPropertyType] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function validateForm(): boolean {
    const newErrors: Record<string, string> = {};

    // Non-listed assets require name
    if (isNonListed && !assetName.trim()) {
      newErrors.assetName = 'Asset name is required';
    }

    // Listed assets require quantity
    if (!isNonListed) {
      if (!quantity.trim()) {
        newErrors.quantity = 'Quantity is required';
      } else if (isNaN(Number(quantity)) || Number(quantity) <= 0) {
        newErrors.quantity = 'Quantity must be a positive number';
      }
    }

    // Purchase price/value validation
    if (isNonListed) {
      if (!currentValue.trim()) {
        newErrors.currentValue = 'Current value is required';
      } else if (isNaN(Number(currentValue)) || Number(currentValue) < 0) {
        newErrors.currentValue = 'Current value must be a non-negative number';
      }
    } else {
      if (!purchasePrice.trim()) {
        newErrors.purchasePrice = 'Purchase price is required';
      } else if (isNaN(Number(purchasePrice)) || Number(purchasePrice) < 0) {
        newErrors.purchasePrice = 'Purchase price must be a non-negative number';
      }
    }

    // Purchase date validation
    if (!purchaseDate.trim()) {
      newErrors.purchaseDate = 'Purchase date is required';
    } else if (!/^\d{4}-\d{2}-\d{2}$/.test(purchaseDate)) {
      newErrors.purchaseDate = 'Invalid date format (use YYYY-MM-DD)';
    }

    // Fixed income: validate maturity date if provided
    if (assetType === 'fixed_income' && maturityDate.trim()) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(maturityDate)) {
        newErrors.maturityDate = 'Invalid date format (use YYYY-MM-DD)';
      } else {
        const maturity = new Date(maturityDate);
        const purchase = new Date(purchaseDate);
        if (maturity <= purchase) {
          newErrors.maturityDate = 'Maturity date must be after purchase date';
        }
      }
    }

    // Fixed income: validate interest rate if provided
    if (assetType === 'fixed_income' && interestRate.trim()) {
      if (isNaN(Number(interestRate)) || Number(interestRate) < 0 || Number(interestRate) > 100) {
        newErrors.interestRate = 'Interest rate must be between 0 and 100';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Build metadata for non-listed assets
      const metadata: Record<string, any> = {};
      
      if (assetType === 'fixed_income') {
        if (maturityDate.trim()) {
          metadata.maturity_date = maturityDate;
        }
        if (interestRate.trim()) {
          metadata.interest_rate = Number(interestRate);
        }
      }
      
      if (assetType === 'real_estate') {
        if (propertyAddress.trim()) {
          metadata.property_address = propertyAddress.trim();
        }
        if (propertyType.trim()) {
          metadata.property_type = propertyType.trim();
        }
      }

      const assetData = {
        portfolio_id: portfolioId,
        asset_type: assetType,
        symbol: isNonListed ? undefined : symbol,
        name: isNonListed ? assetName.trim() : (initialName || symbol || ''),
        quantity: isNonListed ? 1 : Number(quantity),
        purchase_price: isNonListed ? Number(currentValue) : Number(purchasePrice),
        purchase_date: purchaseDate,
        current_price: isNonListed ? Number(currentValue) : undefined,
        metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
      };

      const newAsset = await assetService.createAsset(assetData);

      dispatch(addAsset(newAsset));

      const displayName = isNonListed ? assetName : symbol;
      Alert.alert(
        'Success',
        `${displayName} has been added to your portfolio.`,
        [
          {
            text: 'OK',
            onPress: () => {
              navigation.getParent()?.goBack();
            },
          },
        ]
      );
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to add asset. Please try again.';
      Alert.alert('Error', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    navigation.goBack();
  };

  const getAssetTypeColor = (): string => {
    switch (assetType) {
      case 'stock':
        return '#4CAF50';
      case 'crypto':
        return '#FF9800';
      case 'commodity':
        return '#9C27B0';
      case 'real_estate':
        return '#2196F3';
      case 'fixed_income':
        return '#607D8B';
      case 'other':
        return '#795548';
      default:
        return '#687076';
    }
  };

  const getAssetTypeLabel = (): string => {
    switch (assetType) {
      case 'stock':
        return 'Stock';
      case 'crypto':
        return 'Cryptocurrency';
      case 'commodity':
        return 'Commodity';
      case 'real_estate':
        return 'Real Estate';
      case 'fixed_income':
        return 'Fixed Income';
      case 'other':
        return 'Other Asset';
      default:
        return 'Asset';
    }
  };

  const calculateTotalValue = (): string => {
    if (isNonListed) {
      const value = Number(currentValue) || 0;
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(value);
    }
    const qty = Number(quantity) || 0;
    const price = Number(purchasePrice) || 0;
    const total = qty * price;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(total);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#11181C" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Add {getAssetTypeLabel()}</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
          {/* Asset Info Card - Only for listed assets with symbol */}
          {!isNonListed && symbol && (
            <View style={styles.assetCard}>
              <View style={[styles.assetTypeIndicator, { backgroundColor: getAssetTypeColor() }]} />
              <View style={styles.assetInfo}>
                <Text style={styles.assetSymbol}>{symbol}</Text>
                <Text style={styles.assetName}>{initialName}</Text>
                <Text style={styles.assetTypeLabel}>{getAssetTypeLabel()}</Text>
              </View>
              {currentPrice && (
                <View style={styles.priceInfo}>
                  <Text style={styles.priceLabel}>Current Price</Text>
                  <Text style={styles.priceValue}>
                    ${currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Non-Listed Asset Type Indicator */}
          {isNonListed && (
            <View style={styles.assetTypeCard}>
              <View style={[styles.assetTypeIconContainer, { backgroundColor: getAssetTypeColor() + '20' }]}>
                <Ionicons 
                  name={assetType === 'real_estate' ? 'home' : assetType === 'fixed_income' ? 'document-text' : 'ellipsis-horizontal'} 
                  size={28} 
                  color={getAssetTypeColor()} 
                />
              </View>
              <Text style={styles.assetTypeTitle}>{getAssetTypeLabel()}</Text>
              <Text style={styles.assetTypeDescription}>
                {assetType === 'real_estate' && 'Add property investments to your portfolio'}
                {assetType === 'fixed_income' && 'Track bonds, CDs, and other fixed income assets'}
                {assetType === 'other' && 'Add custom assets with manual valuation'}
              </Text>
            </View>
          )}

          {/* Form Fields */}
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>
              {isNonListed ? 'Asset Details' : 'Transaction Details'}
            </Text>

            {/* Asset Name - Only for non-listed assets */}
            {isNonListed && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Asset Name *</Text>
                <TextInput
                  style={[styles.input, errors.assetName && styles.inputError]}
                  placeholder={
                    assetType === 'real_estate' ? 'e.g., Downtown Apartment' :
                    assetType === 'fixed_income' ? 'e.g., Treasury Bond 2025' :
                    'Enter asset name'
                  }
                  value={assetName}
                  onChangeText={(text) => {
                    setAssetName(text);
                    if (errors.assetName) {
                      setErrors((prev) => ({ ...prev, assetName: '' }));
                    }
                  }}
                  placeholderTextColor="#9CA3AF"
                />
                {errors.assetName && (
                  <Text style={styles.errorText}>{errors.assetName}</Text>
                )}
              </View>
            )}

            {/* Current Value - For non-listed assets */}
            {isNonListed && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Current Value (USD) *</Text>
                <View style={styles.priceInputContainer}>
                  <Text style={styles.currencySymbol}>$</Text>
                  <TextInput
                    style={[styles.priceInput, errors.currentValue && styles.inputError]}
                    placeholder="0.00"
                    value={currentValue}
                    onChangeText={(text) => {
                      setCurrentValue(text);
                      if (errors.currentValue) {
                        setErrors((prev) => ({ ...prev, currentValue: '' }));
                      }
                    }}
                    keyboardType="decimal-pad"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
                {errors.currentValue && (
                  <Text style={styles.errorText}>{errors.currentValue}</Text>
                )}
              </View>
            )}

            {/* Quantity - Only for listed assets */}
            {!isNonListed && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Quantity *</Text>
                <TextInput
                  style={[styles.input, errors.quantity && styles.inputError]}
                  placeholder="Enter quantity"
                  value={quantity}
                  onChangeText={(text) => {
                    setQuantity(text);
                    if (errors.quantity) {
                      setErrors((prev) => ({ ...prev, quantity: '' }));
                    }
                  }}
                  keyboardType="decimal-pad"
                  placeholderTextColor="#9CA3AF"
                />
                {errors.quantity && (
                  <Text style={styles.errorText}>{errors.quantity}</Text>
                )}
              </View>
            )}

            {/* Purchase Price - Only for listed assets */}
            {!isNonListed && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Purchase Price (USD) *</Text>
                <View style={styles.priceInputContainer}>
                  <Text style={styles.currencySymbol}>$</Text>
                  <TextInput
                    style={[styles.priceInput, errors.purchasePrice && styles.inputError]}
                    placeholder="0.00"
                    value={purchasePrice}
                    onChangeText={(text) => {
                      setPurchasePrice(text);
                      if (errors.purchasePrice) {
                        setErrors((prev) => ({ ...prev, purchasePrice: '' }));
                      }
                    }}
                    keyboardType="decimal-pad"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
                {errors.purchasePrice && (
                  <Text style={styles.errorText}>{errors.purchasePrice}</Text>
                )}
              </View>
            )}

            {/* Purchase Date */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Purchase Date *</Text>
              <TextInput
                style={[styles.input, errors.purchaseDate && styles.inputError]}
                placeholder="YYYY-MM-DD"
                value={purchaseDate}
                onChangeText={(text) => {
                  setPurchaseDate(text);
                  if (errors.purchaseDate) {
                    setErrors((prev) => ({ ...prev, purchaseDate: '' }));
                  }
                }}
                placeholderTextColor="#9CA3AF"
              />
              {errors.purchaseDate && (
                <Text style={styles.errorText}>{errors.purchaseDate}</Text>
              )}
              <Text style={styles.inputHint}>Format: YYYY-MM-DD (e.g., 2024-01-15)</Text>
            </View>
          </View>

          {/* Fixed Income Specific Fields */}
          {assetType === 'fixed_income' && (
            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Fixed Income Details</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Maturity Date</Text>
                <TextInput
                  style={[styles.input, errors.maturityDate && styles.inputError]}
                  placeholder="YYYY-MM-DD"
                  value={maturityDate}
                  onChangeText={(text) => {
                    setMaturityDate(text);
                    if (errors.maturityDate) {
                      setErrors((prev) => ({ ...prev, maturityDate: '' }));
                    }
                  }}
                  placeholderTextColor="#9CA3AF"
                />
                {errors.maturityDate && (
                  <Text style={styles.errorText}>{errors.maturityDate}</Text>
                )}
                <Text style={styles.inputHint}>A reminder will be created 30 days before maturity</Text>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Interest Rate (%)</Text>
                <View style={styles.priceInputContainer}>
                  <TextInput
                    style={[styles.priceInput, errors.interestRate && styles.inputError]}
                    placeholder="0.00"
                    value={interestRate}
                    onChangeText={(text) => {
                      setInterestRate(text);
                      if (errors.interestRate) {
                        setErrors((prev) => ({ ...prev, interestRate: '' }));
                      }
                    }}
                    keyboardType="decimal-pad"
                    placeholderTextColor="#9CA3AF"
                  />
                  <Text style={styles.currencySymbol}>%</Text>
                </View>
                {errors.interestRate && (
                  <Text style={styles.errorText}>{errors.interestRate}</Text>
                )}
              </View>
            </View>
          )}

          {/* Real Estate Specific Fields */}
          {assetType === 'real_estate' && (
            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Property Details</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Property Address</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter property address"
                  value={propertyAddress}
                  onChangeText={setPropertyAddress}
                  placeholderTextColor="#9CA3AF"
                  multiline
                  numberOfLines={2}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Property Type</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., Residential, Commercial, Land"
                  value={propertyType}
                  onChangeText={setPropertyType}
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>
          )}

          {/* Summary */}
          {((isNonListed && currentValue) || (!isNonListed && quantity && purchasePrice)) && (
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>
                {isNonListed ? 'Asset Summary' : 'Transaction Summary'}
              </Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Total Value</Text>
                <Text style={styles.summaryValue}>{calculateTotalValue()}</Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Submit Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="add-circle" size={20} color="#FFFFFF" />
                <Text style={styles.submitButtonText}>Add to Portfolio</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  keyboardView: {
    flex: 1,
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
  assetTypeLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },
  priceInfo: {
    alignItems: 'flex-end',
  },
  priceLabel: {
    fontSize: 12,
    color: '#687076',
  },
  priceValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#11181C',
    marginTop: 2,
  },
  assetTypeCard: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  assetTypeIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  assetTypeTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#11181C',
    marginBottom: 4,
  },
  assetTypeDescription: {
    fontSize: 14,
    color: '#687076',
    textAlign: 'center',
  },
  formSection: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#11181C',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#11181C',
  },
  inputError: {
    borderColor: '#DC2626',
  },
  priceInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  currencySymbol: {
    fontSize: 16,
    color: '#687076',
    marginRight: 4,
  },
  priceInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#11181C',
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 12,
    marginTop: 4,
  },
  inputHint: {
    color: '#9CA3AF',
    fontSize: 12,
    marginTop: 4,
  },
  summaryCard: {
    backgroundColor: '#E0F2FE',
    margin: 16,
    borderRadius: 12,
    padding: 16,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0369A1',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#0369A1',
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0369A1',
  },
  footer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0a7ea4',
    borderRadius: 12,
    paddingVertical: 16,
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
