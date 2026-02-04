/**
 * Sync Status Indicator Component
 * 
 * Displays sync status with visual indicators:
 * - Spinning icon when syncing
 * - Checkmark when sync complete
 * - Error icon with retry button on failure
 * - Pending changes count when offline
 * 
 * Requirements: Requirement 13 - Offline Mode (Data Sync)
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { SyncState } from '@/hooks/useSyncManager';

// ============================================================================
// Types
// ============================================================================

export interface SyncStatusIndicatorProps {
  /** Current sync state */
  syncState: SyncState;
  /** Whether device is online */
  isOnline: boolean;
  /** Number of pending changes */
  pendingChangesCount: number;
  /** Sync progress (0-100) */
  syncProgress?: number;
  /** Last sync timestamp */
  lastSyncTime?: Date | null;
  /** Error message to display */
  errorMessage?: string;
  /** Callback when retry button is pressed */
  onRetry?: () => void;
  /** Callback when indicator is pressed */
  onPress?: () => void;
  /** Whether to show compact version */
  compact?: boolean;
}

// ============================================================================
// Helper Functions
// ============================================================================

function formatLastSync(date: Date | null): string {
  if (!date) return 'Never synced';
  
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return date.toLocaleDateString();
}

// ============================================================================
// Component
// ============================================================================

export function SyncStatusIndicator({
  syncState,
  isOnline,
  pendingChangesCount,
  syncProgress = 0,
  lastSyncTime,
  errorMessage,
  onRetry,
  onPress,
  compact = false,
}: SyncStatusIndicatorProps): React.ReactElement {
  // Animation for spinning icon
  const spinValue = useRef(new Animated.Value(0)).current;

  // Start/stop spinning animation based on sync state
  useEffect(() => {
    if (syncState === 'syncing') {
      // Start spinning
      Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 1000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    } else {
      // Stop spinning
      spinValue.setValue(0);
    }
  }, [syncState, spinValue]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // Render icon based on state
  const renderIcon = () => {
    if (syncState === 'syncing') {
      return (
        <Animated.View style={{ transform: [{ rotate: spin }] }}>
          <Ionicons name="sync" size={compact ? 16 : 20} color="#0a7ea4" />
        </Animated.View>
      );
    }

    if (syncState === 'success') {
      return (
        <Ionicons
          name="checkmark-circle"
          size={compact ? 16 : 20}
          color="#10B981"
        />
      );
    }

    if (syncState === 'error') {
      return (
        <Ionicons
          name="alert-circle"
          size={compact ? 16 : 20}
          color="#EF4444"
        />
      );
    }

    // Idle state
    if (!isOnline) {
      return (
        <Ionicons
          name="cloud-offline"
          size={compact ? 16 : 20}
          color="#F59E0B"
        />
      );
    }

    if (pendingChangesCount > 0) {
      return (
        <Ionicons
          name="cloud-upload"
          size={compact ? 16 : 20}
          color="#6B7280"
        />
      );
    }

    return (
      <Ionicons
        name="cloud-done"
        size={compact ? 16 : 20}
        color="#10B981"
      />
    );
  };

  // Render status text
  const renderStatusText = () => {
    if (syncState === 'syncing') {
      return `Syncing${syncProgress > 0 ? ` ${syncProgress}%` : '...'}`;
    }

    if (syncState === 'success') {
      return 'Synced';
    }

    if (syncState === 'error') {
      return errorMessage || 'Sync failed';
    }

    if (!isOnline) {
      if (pendingChangesCount > 0) {
        return `${pendingChangesCount} change${pendingChangesCount !== 1 ? 's' : ''} pending`;
      }
      return 'Offline';
    }

    if (pendingChangesCount > 0) {
      return `${pendingChangesCount} pending`;
    }

    return `Synced ${formatLastSync(lastSyncTime)}`;
  };

  // Compact version
  if (compact) {
    return (
      <TouchableOpacity
        style={styles.compactContainer}
        onPress={onPress}
        disabled={!onPress}
        activeOpacity={onPress ? 0.7 : 1}
      >
        {renderIcon()}
        {pendingChangesCount > 0 && !isOnline && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {pendingChangesCount > 99 ? '99+' : pendingChangesCount}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  }

  // Full version
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.statusRow}
        onPress={onPress}
        disabled={!onPress}
        activeOpacity={onPress ? 0.7 : 1}
      >
        <View style={styles.iconContainer}>{renderIcon()}</View>
        <View style={styles.textContainer}>
          <Text style={styles.statusText}>{renderStatusText()}</Text>
          {syncState === 'syncing' && syncProgress > 0 && (
            <View style={styles.progressBar}>
              <View
                style={[styles.progressFill, { width: `${syncProgress}%` }]}
              />
            </View>
          )}
        </View>
      </TouchableOpacity>

      {syncState === 'error' && onRetry && (
        <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
          <Ionicons name="refresh" size={14} color="#FFFFFF" />
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
  },
  compactContainer: {
    position: 'relative',
    padding: 4,
  },
  statusRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    marginRight: 8,
  },
  textContainer: {
    flex: 1,
  },
  statusText: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '500',
  },
  progressBar: {
    height: 3,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    marginTop: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#0a7ea4',
    borderRadius: 2,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EF4444',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    marginLeft: 8,
    gap: 4,
  },
  retryText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#F59E0B',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '700',
  },
});

export default SyncStatusIndicator;
