/**
 * ErrorDisplay Component
 * 
 * Reusable error display component with user-friendly messages
 * and optional retry functionality
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface ErrorDisplayProps {
  /** Error message to display */
  message: string;
  /** Optional title for the error */
  title?: string;
  /** Callback when retry button is pressed */
  onRetry?: () => void;
  /** Whether to show the retry button (default: true if onRetry provided) */
  showRetry?: boolean;
  /** Custom retry button text */
  retryText?: string;
  /** Icon name from Ionicons */
  icon?: keyof typeof Ionicons.glyphMap;
  /** Icon color */
  iconColor?: string;
  /** Whether to display in compact mode (inline banner) */
  compact?: boolean;
  /** Custom container style */
  style?: ViewStyle;
}

export function ErrorDisplay({
  message,
  title,
  onRetry,
  showRetry = !!onRetry,
  retryText = 'Try Again',
  icon = 'alert-circle',
  iconColor = '#DC2626',
  compact = false,
  style,
}: ErrorDisplayProps) {
  if (compact) {
    return (
      <View style={[styles.compactContainer, style]}>
        <View style={styles.compactContent}>
          <Ionicons name={icon} size={18} color={iconColor} />
          <Text style={styles.compactMessage} numberOfLines={2}>
            {message}
          </Text>
        </View>
        {showRetry && onRetry && (
          <TouchableOpacity onPress={onRetry} style={styles.compactRetryButton}>
            <Text style={styles.compactRetryText}>{retryText}</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <View style={styles.iconContainer}>
        <Ionicons name={icon} size={48} color={iconColor} />
      </View>
      
      {title && <Text style={styles.title}>{title}</Text>}
      
      <Text style={styles.message}>{message}</Text>
      
      {showRetry && onRetry && (
        <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
          <Ionicons name="refresh" size={18} color="#FFFFFF" />
          <Text style={styles.retryButtonText}>{retryText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#F5F5F5',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#11181C',
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#687076',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
    maxWidth: 300,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0a7ea4',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  // Compact styles (inline banner)
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FEE2E2',
    padding: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 8,
  },
  compactContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  compactMessage: {
    flex: 1,
    fontSize: 14,
    color: '#DC2626',
  },
  compactRetryButton: {
    marginLeft: 12,
  },
  compactRetryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0a7ea4',
  },
});

export default ErrorDisplay;
