/**
 * Asset Type Selection Screen
 * 
 * First step in add asset flow - select asset type
 * Requirements: 3
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AddAssetStackScreenProps } from '@/navigation/types';

type Props = AddAssetStackScreenProps<'AssetTypeSelection'>;

interface AssetTypeOption {
  type: string;
  label: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  isListed: boolean;
}

const ASSET_TYPES: AssetTypeOption[] = [
  {
    type: 'stock',
    label: 'Stocks',
    description: 'Public company shares',
    icon: 'trending-up',
    color: '#4CAF50',
    isListed: true,
  },
  {
    type: 'crypto',
    label: 'Cryptocurrency',
    description: 'Bitcoin, Ethereum, etc.',
    icon: 'logo-bitcoin',
    color: '#FF9800',
    isListed: true,
  },
  {
    type: 'commodity',
    label: 'Commodities',
    description: 'Gold, Silver, Oil, etc.',
    icon: 'diamond',
    color: '#9C27B0',
    isListed: true,
  },
  {
    type: 'real_estate',
    label: 'Real Estate',
    description: 'Property investments',
    icon: 'home',
    color: '#2196F3',
    isListed: false,
  },
  {
    type: 'fixed_income',
    label: 'Fixed Income',
    description: 'Bonds, CDs, etc.',
    icon: 'document-text',
    color: '#607D8B',
    isListed: false,
  },
  {
    type: 'other',
    label: 'Other',
    description: 'Custom assets',
    icon: 'ellipsis-horizontal',
    color: '#795548',
    isListed: false,
  },
];

export default function AssetTypeSelectionScreen({ navigation, route }: Props) {
  const { portfolioId } = route.params;

  const handleSelectType = (assetType: AssetTypeOption) => {
    if (assetType.isListed) {
      navigation.navigate('TickerSearch', {
        portfolioId,
        assetType: assetType.type,
      });
    } else {
      navigation.navigate('AssetDetails', {
        portfolioId,
        assetType: assetType.type,
      });
    }
  };

  const handleClose = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
          <Ionicons name="close" size={24} color="#11181C" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Asset</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        <Text style={styles.subtitle}>What type of asset would you like to add?</Text>

        <View style={styles.optionsContainer}>
          {ASSET_TYPES.map((assetType) => (
            <TouchableOpacity
              key={assetType.type}
              style={styles.optionCard}
              onPress={() => handleSelectType(assetType)}
            >
              <View style={[styles.iconContainer, { backgroundColor: assetType.color + '20' }]}>
                <Ionicons name={assetType.icon} size={28} color={assetType.color} />
              </View>
              <View style={styles.optionInfo}>
                <Text style={styles.optionLabel}>{assetType.label}</Text>
                <Text style={styles.optionDescription}>{assetType.description}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          ))}
        </View>
      </View>
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
  closeButton: {
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
    padding: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#687076',
    marginBottom: 24,
  },
  optionsContainer: {
    gap: 12,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  optionInfo: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#11181C',
    marginBottom: 2,
  },
  optionDescription: {
    fontSize: 14,
    color: '#687076',
  },
});
