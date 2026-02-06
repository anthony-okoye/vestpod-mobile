/**
 * AddAssetForm Component
 * 
 * Form for adding new assets with validation.
 * Includes ticker, quantity, price, and date inputs.
 * 
 * Requirements: Task 7.3
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  ScrollView,
  KeyboardAvoidingView,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export interface AssetFormData {
  ticker: string;
  quantity: number;
  purchasePrice: number;
  purchaseDate: Date;
}

interface AddAssetFormProps {
  assetType: string;
  onSubmit: (data: AssetFormData) => void;
  onCancel: () => void;
}

interface FormErrors {
  ticker?: string;
  quantity?: string;
  purchasePrice?: string;
  purchaseDate?: string;
}

export function AddAssetForm({ assetType, onSubmit, onCancel }: AddAssetFormProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const [ticker, setTicker] = useState('');
  const [quantity, setQuantity] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [purchaseDate, setPurchaseDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!ticker.trim()) {
      newErrors.ticker = 'Ticker is required';
    }

    const quantityNum = parseFloat(quantity);
    if (!quantity.trim()) {
      newErrors.quantity = 'Quantity is required';
    } else if (isNaN(quantityNum) || quantityNum <= 0) {
      newErrors.quantity = 'Quantity must be a positive number';
    }

    const priceNum = parseFloat(purchasePrice);
    if (!purchasePrice.trim()) {
      newErrors.purchasePrice = 'Purchase price is required';
    } else if (isNaN(priceNum) || priceNum <= 0) {
      newErrors.purchasePrice = 'Price must be a positive number';
    }

    const today = new Date();
    today.setHours(23, 59, 59, 999);
    if (purchaseDate > today) {
      newErrors.purchaseDate = 'Purchase date cannot be in the future';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      return;
    }

    const formData: AssetFormData = {
      ticker: ticker.trim().toUpperCase(),
      quantity: parseFloat(quantity),
      purchasePrice: parseFloat(purchasePrice),
      purchaseDate,
    };

    onSubmit(formData);
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }

    if (selectedDate) {
      setPurchaseDate(selectedDate);
      setErrors((prev) => ({ ...prev, purchaseDate: undefined }));
    }
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const isFormValid = () => {
    return (
      ticker.trim().length > 0 &&
      quantity.trim().length > 0 &&
      parseFloat(quantity) > 0 &&
      purchasePrice.trim().length > 0 &&
      parseFloat(purchasePrice) > 0 &&
      purchaseDate <= new Date()
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.form}>
          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.text }]}>Ticker Symbol</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.backgroundSecondary,
                  color: colors.text,
                  borderColor: errors.ticker ? colors.error : colors.inputBorder,
                },
              ]}
              placeholder="e.g., AAPL, BTC, TSLA"
              placeholderTextColor={colors.inputPlaceholder}
              value={ticker}
              onChangeText={(text) => {
                setTicker(text);
                setErrors((prev) => ({ ...prev, ticker: undefined }));
              }}
              autoCapitalize="characters"
              autoCorrect={false}
              accessible={true}
              accessibilityLabel="Ticker symbol"
              accessibilityHint="Enter the asset ticker symbol"
            />
            {errors.ticker && (
              <Text style={[styles.errorText, { color: colors.error }]}>
                {errors.ticker}
              </Text>
            )}
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.text }]}>Quantity</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.backgroundSecondary,
                  color: colors.text,
                  borderColor: errors.quantity ? colors.error : colors.inputBorder,
                },
              ]}
              placeholder="0.00"
              placeholderTextColor={colors.inputPlaceholder}
              value={quantity}
              onChangeText={(text) => {
                setQuantity(text);
                setErrors((prev) => ({ ...prev, quantity: undefined }));
              }}
              keyboardType="numeric"
              accessible={true}
              accessibilityLabel="Quantity"
              accessibilityHint="Enter the quantity of assets"
            />
            {errors.quantity && (
              <Text style={[styles.errorText, { color: colors.error }]}>
                {errors.quantity}
              </Text>
            )}
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.text }]}>Purchase Price</Text>
            <View style={styles.priceInputContainer}>
              <Text style={[styles.pricePrefix, { color: colors.text }]}>$</Text>
              <TextInput
                style={[
                  styles.input,
                  styles.priceInput,
                  {
                    backgroundColor: colors.backgroundSecondary,
                    color: colors.text,
                    borderColor: errors.purchasePrice ? colors.error : colors.inputBorder,
                  },
                ]}
                placeholder="0.00"
                placeholderTextColor={colors.inputPlaceholder}
                value={purchasePrice}
                onChangeText={(text) => {
                  setPurchasePrice(text);
                  setErrors((prev) => ({ ...prev, purchasePrice: undefined }));
                }}
                keyboardType="decimal-pad"
                accessible={true}
                accessibilityLabel="Purchase price"
                accessibilityHint="Enter the purchase price per unit"
              />
            </View>
            {errors.purchasePrice && (
              <Text style={[styles.errorText, { color: colors.error }]}>
                {errors.purchasePrice}
              </Text>
            )}
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.text }]}>Purchase Date</Text>
            <TouchableOpacity
              style={[
                styles.dateButton,
                {
                  backgroundColor: colors.backgroundSecondary,
                  borderColor: errors.purchaseDate ? colors.error : colors.inputBorder,
                },
              ]}
              onPress={() => setShowDatePicker(true)}
              accessible={true}
              accessibilityLabel="Purchase date"
              accessibilityHint="Select the purchase date"
              accessibilityRole="button"
            >
              <Text style={[styles.dateText, { color: colors.text }]}>
                {formatDate(purchaseDate)}
              </Text>
            </TouchableOpacity>
            {errors.purchaseDate && (
              <Text style={[styles.errorText, { color: colors.error }]}>
                {errors.purchaseDate}
              </Text>
            )}
          </View>

          {(showDatePicker || Platform.OS === 'ios') && (
            <View style={styles.datePickerContainer}>
              <DateTimePicker
                value={purchaseDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleDateChange}
                maximumDate={new Date()}
                textColor={colors.text}
              />
              {Platform.OS === 'ios' && (
                <TouchableOpacity
                  style={[styles.datePickerDone, { backgroundColor: colors.buttonPrimary }]}
                  onPress={() => setShowDatePicker(false)}
                >
                  <Text style={[styles.datePickerDoneText, { color: colors.buttonPrimaryText }]}>
                    Done
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      <View style={[styles.buttonContainer, { backgroundColor: colors.background }]}>
        <TouchableOpacity
          style={[
            styles.submitButton,
            {
              backgroundColor: isFormValid() ? colors.buttonPrimary : colors.buttonDisabled,
            },
          ]}
          onPress={handleSubmit}
          disabled={!isFormValid()}
          accessible={true}
          accessibilityLabel="Add asset"
          accessibilityRole="button"
          accessibilityState={{ disabled: !isFormValid() }}
          accessibilityHint="Submit the form to add this asset"
        >
          <Text
            style={[
              styles.submitButtonText,
              {
                color: isFormValid() ? colors.buttonPrimaryText : colors.buttonDisabledText,
              },
            ]}
          >
            Add Asset
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.cancelButton,
            {
              borderColor: colors.border,
            },
          ]}
          onPress={onCancel}
          accessible={true}
          accessibilityLabel="Cancel"
          accessibilityRole="button"
          accessibilityHint="Cancel and go back"
        >
          <Text style={[styles.cancelButtonText, { color: colors.text }]}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.base,
  },
  form: {
    gap: Spacing.base,
  },
  field: {
    marginBottom: Spacing.sm,
  },
  label: {
    fontSize: Typography.fontSizes.md,
    fontWeight: Typography.fontWeights.semibold,
    marginBottom: Spacing.xs,
  },
  input: {
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: Typography.fontSizes.base,
    borderWidth: 1,
  },
  priceInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  pricePrefix: {
    position: 'absolute',
    left: Spacing.md,
    fontSize: Typography.fontSizes.base,
    fontWeight: Typography.fontWeights.medium,
    zIndex: 1,
  },
  priceInput: {
    flex: 1,
    paddingLeft: Spacing.xl,
  },
  dateButton: {
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
  },
  dateText: {
    fontSize: Typography.fontSizes.base,
  },
  datePickerContainer: {
    marginTop: Spacing.sm,
  },
  datePickerDone: {
    marginTop: Spacing.sm,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  datePickerDoneText: {
    fontSize: Typography.fontSizes.base,
    fontWeight: Typography.fontWeights.semibold,
  },
  errorText: {
    fontSize: Typography.fontSizes.sm,
    marginTop: Spacing.xs,
  },
  buttonContainer: {
    padding: Spacing.base,
    gap: Spacing.sm,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  submitButton: {
    borderRadius: BorderRadius.md,
    padding: Spacing.base,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    fontSize: Typography.fontSizes.base,
    fontWeight: Typography.fontWeights.semibold,
  },
  cancelButton: {
    borderRadius: BorderRadius.md,
    padding: Spacing.base,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  cancelButtonText: {
    fontSize: Typography.fontSizes.base,
    fontWeight: Typography.fontWeights.medium,
  },
});

export default AddAssetForm;
