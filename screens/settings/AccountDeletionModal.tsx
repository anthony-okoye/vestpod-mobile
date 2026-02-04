// mobile/screens/settings/AccountDeletionModal.tsx
/**
 * Account Deletion Modal
 * 
 * Confirmation modal for permanent account deletion
 * Requires user to type "DELETE" to confirm
 * Requirements: Task 66
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { supabase } from '@/services/supabase';
import { authService } from '@/services/api';

interface AccountDeletionModalProps {
  visible: boolean;
  onClose: () => void;
  onDeleted: () => void;
}

const CONFIRMATION_TEXT = 'DELETE';

export default function AccountDeletionModal({
  visible,
  onClose,
  onDeleted,
}: AccountDeletionModalProps) {
  const [confirmationInput, setConfirmationInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isConfirmationValid = confirmationInput === CONFIRMATION_TEXT;

  const handleClose = () => {
    setConfirmationInput('');
    setError(null);
    onClose();
  };

  const handleDeleteAccount = async () => {
    if (!isConfirmationValid) return;

    setIsLoading(true);
    setError(null);

    try {
      const { error: deleteError } = await supabase.functions.invoke('account-deletion', {
        method: 'DELETE',
        body: { confirmation: CONFIRMATION_TEXT },
      });

      if (deleteError) {
        setError(deleteError.message || 'Failed to delete account. Please try again.');
        return;
      }

      await authService.signOut();
      onDeleted();
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const deletionItems = [
    'All portfolios and assets',
    'Price alerts and notifications',
    'AI insights and chat history',
    'Profile data and preferences',
    'Subscription information',
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.warningIcon}>⚠️</Text>
            <Text style={styles.title}>Delete Account</Text>
          </View>

          <Text style={styles.warningText}>
            This action is permanent and cannot be undone.
          </Text>

          <View style={styles.deletionList}>
            <Text style={styles.listHeader}>The following will be deleted:</Text>
            {deletionItems.map((item, index) => (
              <View key={index} style={styles.listItem}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.listItemText}>{item}</Text>
              </View>
            ))}
          </View>

          <View style={styles.confirmationSection}>
            <Text style={styles.confirmationLabel}>
              Type <Text style={styles.deleteText}>DELETE</Text> to confirm:
            </Text>
            <TextInput
              style={styles.input}
              value={confirmationInput}
              onChangeText={setConfirmationInput}
              placeholder="Type DELETE"
              autoCapitalize="characters"
              autoCorrect={false}
              editable={!isLoading}
            />
          </View>

          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleClose}
              disabled={isLoading}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.deleteButton,
                (!isConfirmationValid || isLoading) && styles.deleteButtonDisabled,
              ]}
              onPress={handleDeleteAccount}
              disabled={!isConfirmationValid || isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.deleteButtonText}>Delete Account</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  warningIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#DC2626',
  },
  warningText: {
    fontSize: 14,
    color: '#DC2626',
    fontWeight: '600',
    marginBottom: 16,
  },
  deletionList: {
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  listHeader: {
    fontSize: 14,
    fontWeight: '600',
    color: '#991B1B',
    marginBottom: 8,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  bullet: {
    color: '#DC2626',
    marginRight: 8,
    fontSize: 14,
  },
  listItemText: {
    fontSize: 14,
    color: '#7F1D1D',
    flex: 1,
  },
  confirmationSection: {
    marginBottom: 16,
  },
  confirmationLabel: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 8,
  },
  deleteText: {
    fontWeight: 'bold',
    color: '#DC2626',
  },
  input: {
    borderWidth: 2,
    borderColor: '#DC2626',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#11181C',
    backgroundColor: '#FAFAFA',
    textAlign: 'center',
    letterSpacing: 2,
  },
  errorContainer: {
    backgroundColor: '#FEE2E2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {
    flex: 1,
    backgroundColor: '#DC2626',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
  },
  deleteButtonDisabled: {
    backgroundColor: '#FCA5A5',
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
