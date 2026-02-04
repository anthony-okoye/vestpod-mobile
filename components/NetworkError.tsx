/**
 * NetworkError Component
 * 
 * Specialized error display for network-related issues.
 * Shows offline indicator and provides retry functionality.
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

export interface NetworkErrorProps {
  /** Whether the device is offline */
  isOffline?: boolean;
  /** Custom error message */
  message?: string;
  /** Callback when retry button is pressed */
  onRetry?: () => void;
  /** Whether to show the retry button */
  showRetry?: boolean;
  /** Custom retry button text */
  retryText?: string;
  /** Whether to display in compact mode (inline banner) */
  compact?: boolean;
  /** Custom container style */
  style?: ViewStyle;
}

export function NetworkError({
  isOffline = false,
  message,
  onRetry,
  showRetry = !!onRetry,
  retryText = 'Retry',
  compact = false,
  style,
}: NetworkErrorProps) {
  const displayMessage = message || (isOffline 
    ? 'You appear to be offline. Please check your internet connection.'
    : 'Unable to connect to the server. Please try again.');

  const iconName = isOffline ? 'cloud-offline' : 'wifi';

  if (compact) {
    return (
      <View style={[styles.compactContainer, style]}>
        <View style={styles.compactContent}>
          <Ionicons name={iconName} size={18} color="#F59E0B" />
          <Text style={styles.compactMessage} numberOfLines={2}>
            {displayMessage}
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
        <Ionicons name={iconName} size={48} color="#F59E0B" />
      </View>
      
      <Text style={styles.title}>
        {isOffline ? 'No Internet Connection' : 'Connection Error'}
      </Text>
      
      <Text style={styles.message}>{displayMessage}</Text>

      {isOffline && (
        <View style={styles.offlineIndicator}>
          <View style={styles.offlineDot} />
          <Text style={styles.offlineText}>Offline</Text>
        </View>
      )}
      
      {showRetry && onRetry && (
        <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
          <Ionicons name="refresh" size={18} color="#FFFFFF" />
          <Text style={styles.retryButtonText}>{retryText}</Text>
        </TouchableOpacity>
      )}

      <Text style={styles.helpText}>
        {isOffline 
          ? 'Check your Wi-Fi or mobile data connection.'
          : 'The server may be temporarily unavailable.'}
      </Text>
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
    backgroundColor: '#FEF3C7',
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
    marginBottom: 16,
    lineHeight: 24,
    maxWidth: 300,
  },
  offlineIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 24,
    gap: 6,
  },
  offlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F59E0B',
  },
  offlineText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#92400E',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0a7ea4',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
    marginBottom: 16,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  helpText: {
    fontSize: 13,
    color: '#9BA1A6',
    textAlign: 'center',
    maxWidth: 280,
  },
  // Compact styles (inline banner)
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FEF3C7',
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
    color: '#92400E',
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

export default NetworkError;
