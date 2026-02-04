/**
 * Data Export Modal
 * 
 * Modal for exporting portfolio data in CSV, JSON, or PDF format
 * Requirements: Task 65 - Data Export
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDataExport, ExportFormat } from '@/hooks/useDataExport';

// ============================================================================
// Types
// ============================================================================

export interface DataExportModalProps {
  visible: boolean;
  onClose: () => void;
}

interface FormatOption {
  value: ExportFormat;
  label: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
}

// ============================================================================
// Constants
// ============================================================================

const FORMAT_OPTIONS: FormatOption[] = [
  {
    value: 'csv',
    label: 'CSV',
    description: 'Spreadsheet compatible',
    icon: 'grid-outline',
  },
  {
    value: 'json',
    label: 'JSON',
    description: 'Structured data format',
    icon: 'code-slash-outline',
  },
  {
    value: 'pdf',
    label: 'PDF',
    description: 'Printable report',
    icon: 'document-text-outline',
  },
];

// ============================================================================
// Component
// ============================================================================

export function DataExportModal({
  visible,
  onClose,
}: DataExportModalProps): React.ReactElement {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('csv');
  const { isLoading, error, success, exportData, reset } = useDataExport();

  // Reset state when modal opens
  useEffect(() => {
    if (visible) {
      reset();
      setSelectedFormat('csv');
    }
  }, [visible, reset]);

  // Close modal on success after brief delay
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        onClose();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [success, onClose]);

  const handleExport = async () => {
    await exportData(selectedFormat);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            accessibilityLabel="Close export modal"
            accessibilityRole="button"
            disabled={isLoading}
          >
            <Ionicons name="close" size={24} color="#11181C" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Export Portfolio</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.sectionTitle}>Select Format</Text>
          <Text style={styles.sectionDescription}>
            Choose the format for your portfolio export
          </Text>

          {/* Format Options */}
          <View style={styles.formatOptions}>
            {FORMAT_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.formatOption,
                  selectedFormat === option.value && styles.formatOptionSelected,
                ]}
                onPress={() => setSelectedFormat(option.value)}
                accessibilityLabel={`${option.label} format, ${option.description}`}
                accessibilityRole="radio"
                accessibilityState={{ selected: selectedFormat === option.value }}
                disabled={isLoading}
              >
                <View style={styles.radioContainer}>
                  <View style={styles.radio}>
                    {selectedFormat === option.value && (
                      <View style={styles.radioSelected} />
                    )}
                  </View>
                </View>
                <View style={styles.formatIconContainer}>
                  <Ionicons name={option.icon} size={24} color="#0a7ea4" />
                </View>
                <View style={styles.formatTextContainer}>
                  <Text style={styles.formatLabel}>{option.label}</Text>
                  <Text style={styles.formatDescription}>{option.description}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Error Message */}
          {error && (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={20} color="#DC2626" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Success Message */}
          {success && (
            <View style={styles.successContainer}>
              <Ionicons name="checkmark-circle" size={20} color="#10B981" />
              <Text style={styles.successText}>Export successful!</Text>
            </View>
          )}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.exportButton, isLoading && styles.exportButtonDisabled]}
            onPress={handleExport}
            accessibilityLabel="Export portfolio data"
            accessibilityRole="button"
            disabled={isLoading || success}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <Ionicons name="download-outline" size={20} color="#FFFFFF" />
                <Text style={styles.exportButtonText}>Export</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={onClose}
            accessibilityLabel="Cancel"
            accessibilityRole="button"
            disabled={isLoading}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#11181C',
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#11181C',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#687076',
    marginBottom: 24,
  },
  formatOptions: {
    gap: 12,
  },
  formatOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
  formatOptionSelected: {
    borderColor: '#0a7ea4',
    backgroundColor: '#F0F9FF',
  },
  radioContainer: {
    marginRight: 12,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#0a7ea4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioSelected: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#0a7ea4',
  },
  formatIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E0F2FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  formatTextContainer: {
    flex: 1,
  },
  formatLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#11181C',
    marginBottom: 2,
  },
  formatDescription: {
    fontSize: 13,
    color: '#687076',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    padding: 12,
    borderRadius: 8,
    marginTop: 20,
    gap: 8,
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    color: '#DC2626',
  },
  successContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    padding: 12,
    borderRadius: 8,
    marginTop: 20,
    gap: 8,
  },
  successText: {
    flex: 1,
    fontSize: 14,
    color: '#10B981',
    fontWeight: '500',
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 34,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0a7ea4',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 12,
    gap: 8,
  },
  exportButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  exportButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  cancelButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  cancelButtonText: {
    fontSize: 15,
    color: '#687076',
  },
});

export default DataExportModal;
