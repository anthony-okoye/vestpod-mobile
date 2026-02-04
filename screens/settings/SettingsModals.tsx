/**
 * Settings Modals and Components
 * 
 * Provides settings UI components for the Investment Portfolio Tracker
 * - CurrencySelectionModal
 * - LanguageSelectionModal
 * - NotificationToggle
 * - DarkModeToggle
 * - ChartViewSelector
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Switch,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { profileService } from '@/services/api';

// ============================================================================
// Types
// ============================================================================

interface CurrencySelectionModalProps {
  visible: boolean;
  onClose: () => void;
  currentCurrency: string;
  onCurrencyChange: (currency: string) => void;
}

interface LanguageSelectionModalProps {
  visible: boolean;
  onClose: () => void;
  currentLanguage: string;
  onLanguageChange: (language: string) => void;
}

interface NotificationToggleProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
}

interface DarkModeToggleProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
}

interface ChartViewSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
}

// ============================================================================
// Constants
// ============================================================================

const CURRENCIES = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'Fr' },
];

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ja', name: 'Japanese' },
];

const CHART_VIEWS = [
  { value: 'line', label: 'Line', icon: 'analytics-outline' as const },
  { value: 'candlestick', label: 'Candlestick', icon: 'bar-chart-outline' as const },
  { value: 'area', label: 'Area', icon: 'stats-chart-outline' as const },
];

// AsyncStorage keys
const STORAGE_KEYS = {
  NOTIFICATIONS_ENABLED: '@settings/notifications_enabled',
  DARK_MODE_ENABLED: '@settings/dark_mode_enabled',
  CHART_VIEW: '@settings/chart_view',
};

// ============================================================================
// CurrencySelectionModal
// ============================================================================

export function CurrencySelectionModal({
  visible,
  onClose,
  currentCurrency,
  onCurrencyChange,
}: CurrencySelectionModalProps) {
  const [selectedCurrency, setSelectedCurrency] = useState(currentCurrency);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setSelectedCurrency(currentCurrency);
  }, [currentCurrency, visible]);

  const handleSave = async () => {
    if (selectedCurrency === currentCurrency) {
      onClose();
      return;
    }

    setIsSaving(true);
    try {
      await profileService.updateProfile({ currency_preference: selectedCurrency });
      onCurrencyChange(selectedCurrency);
      onClose();
    } catch (error) {
      console.error('Failed to update currency preference:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Currency</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#11181C" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.optionsList}>
            {CURRENCIES.map((currency) => (
              <TouchableOpacity
                key={currency.code}
                style={styles.optionItem}
                onPress={() => setSelectedCurrency(currency.code)}
              >
                <View style={styles.optionInfo}>
                  <Text style={styles.optionCode}>{currency.code}</Text>
                  <Text style={styles.optionName}>{currency.name}</Text>
                </View>
                <View style={styles.radioContainer}>
                  <View
                    style={[
                      styles.radioOuter,
                      selectedCurrency === currency.code && styles.radioOuterSelected,
                    ]}
                  >
                    {selectedCurrency === currency.code && (
                      <View style={styles.radioInner} />
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TouchableOpacity
            style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.saveButtonText}>Save</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// ============================================================================
// LanguageSelectionModal
// ============================================================================

export function LanguageSelectionModal({
  visible,
  onClose,
  currentLanguage,
  onLanguageChange,
}: LanguageSelectionModalProps) {
  const [selectedLanguage, setSelectedLanguage] = useState(currentLanguage);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setSelectedLanguage(currentLanguage);
  }, [currentLanguage, visible]);

  const handleSave = async () => {
    if (selectedLanguage === currentLanguage) {
      onClose();
      return;
    }

    setIsSaving(true);
    try {
      await profileService.updateProfile({ language_preference: selectedLanguage });
      onLanguageChange(selectedLanguage);
      onClose();
    } catch (error) {
      console.error('Failed to update language preference:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Language</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#11181C" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.optionsList}>
            {LANGUAGES.map((language) => (
              <TouchableOpacity
                key={language.code}
                style={styles.optionItem}
                onPress={() => setSelectedLanguage(language.code)}
              >
                <View style={styles.optionInfo}>
                  <Text style={styles.optionName}>{language.name}</Text>
                </View>
                <View style={styles.radioContainer}>
                  <View
                    style={[
                      styles.radioOuter,
                      selectedLanguage === language.code && styles.radioOuterSelected,
                    ]}
                  >
                    {selectedLanguage === language.code && (
                      <View style={styles.radioInner} />
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TouchableOpacity
            style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.saveButtonText}>Save</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// ============================================================================
// NotificationToggle
// ============================================================================

export function NotificationToggle({ value, onValueChange }: NotificationToggleProps) {
  const handleToggle = async (newValue: boolean) => {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.NOTIFICATIONS_ENABLED,
        JSON.stringify(newValue)
      );
      onValueChange(newValue);
    } catch (error) {
      console.error('Failed to save notification preference:', error);
    }
  };

  return (
    <View style={styles.toggleContainer}>
      <View style={styles.toggleInfo}>
        <Ionicons name="notifications-outline" size={24} color="#11181C" />
        <View style={styles.toggleTextContainer}>
          <Text style={styles.toggleLabel}>Push Notifications</Text>
          <Text style={styles.toggleDescription}>
            Receive alerts and updates
          </Text>
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={handleToggle}
        trackColor={{ false: '#E5E7EB', true: '#0a7ea4' }}
        thumbColor="#FFFFFF"
      />
    </View>
  );
}

// ============================================================================
// DarkModeToggle
// ============================================================================

export function DarkModeToggle({ value, onValueChange }: DarkModeToggleProps) {
  const handleToggle = async (newValue: boolean) => {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.DARK_MODE_ENABLED,
        JSON.stringify(newValue)
      );
      onValueChange(newValue);
    } catch (error) {
      console.error('Failed to save dark mode preference:', error);
    }
  };

  return (
    <View style={styles.toggleContainer}>
      <View style={styles.toggleInfo}>
        <Ionicons name="moon-outline" size={24} color="#11181C" />
        <View style={styles.toggleTextContainer}>
          <Text style={styles.toggleLabel}>Dark Mode</Text>
          <Text style={styles.toggleDescription}>
            Use dark theme
          </Text>
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={handleToggle}
        trackColor={{ false: '#E5E7EB', true: '#0a7ea4' }}
        thumbColor="#FFFFFF"
      />
    </View>
  );
}

// ============================================================================
// ChartViewSelector
// ============================================================================

export function ChartViewSelector({ value, onValueChange }: ChartViewSelectorProps) {
  const handleSelect = async (newValue: string) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.CHART_VIEW, newValue);
      onValueChange(newValue);
    } catch (error) {
      console.error('Failed to save chart view preference:', error);
    }
  };

  return (
    <View style={styles.selectorContainer}>
      <View style={styles.selectorHeader}>
        <Ionicons name="bar-chart-outline" size={24} color="#11181C" />
        <Text style={styles.selectorLabel}>Default Chart View</Text>
      </View>
      <View style={styles.selectorOptions}>
        {CHART_VIEWS.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.selectorOption,
              value === option.value && styles.selectorOptionSelected,
            ]}
            onPress={() => handleSelect(option.value)}
          >
            <Ionicons
              name={option.icon}
              size={20}
              color={value === option.value ? '#FFFFFF' : '#687076'}
            />
            <Text
              style={[
                styles.selectorOptionText,
                value === option.value && styles.selectorOptionTextSelected,
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

// ============================================================================
// Utility Functions
// ============================================================================

export async function loadNotificationPreference(): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATIONS_ENABLED);
    return value ? JSON.parse(value) : true;
  } catch {
    return true;
  }
}

export async function loadDarkModePreference(): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(STORAGE_KEYS.DARK_MODE_ENABLED);
    return value ? JSON.parse(value) : false;
  } catch {
    return false;
  }
}

export async function loadChartViewPreference(): Promise<string> {
  try {
    const value = await AsyncStorage.getItem(STORAGE_KEYS.CHART_VIEW);
    return value || 'line';
  } catch {
    return 'line';
  }
}

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingBottom: 34,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#11181C',
  },
  closeButton: {
    padding: 4,
  },
  optionsList: {
    maxHeight: 400,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  optionInfo: {
    flex: 1,
  },
  optionCode: {
    fontSize: 16,
    fontWeight: '600',
    color: '#11181C',
  },
  optionName: {
    fontSize: 14,
    color: '#687076',
    marginTop: 2,
  },
  radioContainer: {
    marginLeft: 12,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioOuterSelected: {
    borderColor: '#0a7ea4',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#0a7ea4',
  },
  saveButton: {
    backgroundColor: '#0a7ea4',
    marginHorizontal: 16,
    marginTop: 16,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },

  // Toggle styles
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
  },
  toggleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  toggleTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#11181C',
  },
  toggleDescription: {
    fontSize: 12,
    color: '#687076',
    marginTop: 2,
  },

  // Selector styles
  selectorContainer: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
  },
  selectorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  selectorLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#11181C',
    marginLeft: 12,
  },
  selectorOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  selectorOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    gap: 6,
  },
  selectorOptionSelected: {
    backgroundColor: '#0a7ea4',
  },
  selectorOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#687076',
  },
  selectorOptionTextSelected: {
    color: '#FFFFFF',
  },
});
