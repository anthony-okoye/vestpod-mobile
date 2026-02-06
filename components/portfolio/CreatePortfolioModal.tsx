/**
 * CreatePortfolioModal Component
 * 
 * Modal for creating and editing portfolios.
 * Supports validation, error handling, and loading states.
 * Requirements: 2.1, 2.3, 5.2
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/theme';

export interface CreatePortfolioModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (name: string) => Promise<void>;
  initialName?: string;
  mode?: 'create' | 'edit';
}

export default function CreatePortfolioModal({
  visible,
  onClose,
  onSubmit,
  initialName = '',
  mode = 'create',
}: CreatePortfolioModalProps) {
  const [name, setName] = useState(initialName);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (visible) {
      setName(initialName);
      setError('');
      setIsSubmitting(false);
    }
  }, [visible, initialName]);

  // Validate portfolio name
  const validateName = (value: string): string | null => {
    const trimmedValue = value.trim();
    
    if (!trimmedValue) {
      return 'Portfolio name is required';
    }
    
    if (trimmedValue.length < 2) {
      return 'Portfolio name must be at least 2 characters';
    }
    
    if (trimmedValue.length > 50) {
      return 'Portfolio name must be less than 50 characters';
    }
    
    return null;
  };

  // Handle form submission
  const handleSubmit = async () => {
    // Clear previous errors
    setError('');
    
    // Validate name
    const validationError = validateName(name);
    if (validationError) {
      setError(validationError);
      return;
    }
    
    // Submit
    setIsSubmitting(true);
    try {
      await onSubmit(name.trim());
      // Success - modal will be closed by parent
    } catch (err: any) {
      // Handle errors from parent (e.g., duplicate name)
      const errorMessage = err?.message || 'Failed to save portfolio. Please try again.';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    if (!isSubmitting) {
      setName(initialName);
      setError('');
      onClose();
    }
  };

  // Handle text change
  const handleTextChange = (text: string) => {
    setName(text);
    // Clear error when user starts typing
    if (error) {
      setError('');
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleCancel}
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.overlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modal}>
                {/* Header */}
                <View style={styles.header}>
                  <Text style={styles.title}>
                    {mode === 'create' ? 'Create Portfolio' : 'Edit Portfolio'}
                  </Text>
                  <TouchableOpacity
                    onPress={handleCancel}
                    disabled={isSubmitting}
                    style={styles.closeButton}
                    accessible={true}
                    accessibilityRole="button"
                    accessibilityLabel="Close modal"
                  >
                    <Ionicons
                      name="close"
                      size={24}
                      color={Colors.light.textSecondary}
                    />
                  </TouchableOpacity>
                </View>

                {/* Content */}
                <View style={styles.content}>
                  <Text style={styles.label}>Portfolio Name</Text>
                  <TextInput
                    value={name}
                    onChangeText={handleTextChange}
                    placeholder="e.g., My Investments, Retirement Fund"
                    placeholderTextColor={Colors.light.inputPlaceholder}
                    style={[
                      styles.input,
                      error && styles.inputError,
                    ]}
                    editable={!isSubmitting}
                    autoFocus
                    maxLength={50}
                    returnKeyType="done"
                    onSubmitEditing={handleSubmit}
                    accessible={true}
                    accessibilityLabel="Portfolio name input"
                    accessibilityHint="Enter a name for your portfolio"
                  />
                  
                  {/* Error message */}
                  {error ? (
                    <View style={styles.errorContainer}>
                      <Ionicons
                        name="alert-circle"
                        size={16}
                        color={Colors.light.error}
                      />
                      <Text style={styles.errorText}>{error}</Text>
                    </View>
                  ) : null}

                  {/* Character count */}
                  <Text style={styles.characterCount}>
                    {name.length}/50 characters
                  </Text>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                  <TouchableOpacity
                    style={[styles.button, styles.buttonSecondary]}
                    onPress={handleCancel}
                    disabled={isSubmitting}
                    accessible={true}
                    accessibilityRole="button"
                    accessibilityLabel="Cancel"
                  >
                    <Text style={styles.buttonSecondaryText}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.button,
                      styles.buttonPrimary,
                      isSubmitting && styles.buttonDisabled,
                    ]}
                    onPress={handleSubmit}
                    disabled={isSubmitting}
                    accessible={true}
                    accessibilityRole="button"
                    accessibilityLabel={mode === 'create' ? 'Create portfolio' : 'Save changes'}
                  >
                    {isSubmitting ? (
                      <ActivityIndicator
                        size="small"
                        color={Colors.light.buttonPrimaryText}
                      />
                    ) : (
                      <Text style={styles.buttonPrimaryText}>
                        {mode === 'create' ? 'Create' : 'Save'}
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: Colors.light.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.base,
  },
  modal: {
    backgroundColor: Colors.light.modalBackground,
    borderRadius: BorderRadius.xl,
    width: '100%',
    maxWidth: 400,
    ...Platform.select({
      ios: {
        shadowColor: Colors.light.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  title: {
    fontSize: Typography.fontSizes.xl,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.light.text,
  },
  closeButton: {
    padding: Spacing.xs,
  },
  content: {
    padding: Spacing.base,
  },
  label: {
    fontSize: Typography.fontSizes.md,
    fontWeight: Typography.fontWeights.medium,
    color: Colors.light.text,
    marginBottom: Spacing.sm,
  },
  input: {
    backgroundColor: Colors.light.input,
    borderWidth: 1,
    borderColor: Colors.light.inputBorder,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: Typography.fontSizes.base,
    color: Colors.light.text,
  },
  inputError: {
    borderColor: Colors.light.error,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.sm,
    gap: Spacing.xs,
  },
  errorText: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.light.error,
    flex: 1,
  },
  characterCount: {
    fontSize: Typography.fontSizes.xs,
    color: Colors.light.textSecondary,
    marginTop: Spacing.xs,
    textAlign: 'right',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    padding: Spacing.base,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
    gap: Spacing.md,
  },
  button: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    minWidth: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPrimary: {
    backgroundColor: Colors.light.buttonPrimary,
  },
  buttonPrimaryText: {
    fontSize: Typography.fontSizes.base,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.light.buttonPrimaryText,
  },
  buttonSecondary: {
    backgroundColor: Colors.light.buttonSecondary,
  },
  buttonSecondaryText: {
    fontSize: Typography.fontSizes.base,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.light.buttonSecondaryText,
  },
  buttonDisabled: {
    backgroundColor: Colors.light.buttonDisabled,
  },
});
