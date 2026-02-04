/**
 * Sync Manager Hook
 * 
 * Monitors network connectivity and manages data synchronization.
 * Triggers sync when coming back online and tracks sync status/progress.
 * 
 * Requirements: Requirement 13 - Offline Mode (Data Sync)
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { syncService, SyncResult, SyncError } from '@/services/syncService';
import { offlineStorage } from '@/services/offlineStorage';

// ============================================================================
// Types
// ============================================================================

export type SyncState = 'idle' | 'syncing' | 'success' | 'error';

export interface UseSyncManagerOptions {
  /** Whether to automatically sync when coming back online */
  autoSyncOnReconnect?: boolean;
  /** Callback when sync completes */
  onSyncComplete?: (result: SyncResult) => void;
  /** Callback when sync fails after max retries */
  onSyncFailed?: (errors: SyncError[]) => void;
}

export interface UseSyncManagerReturn {
  /** Current sync state */
  syncState: SyncState;
  /** Sync progress (0-100) */
  syncProgress: number;
  /** Whether device is online */
  isOnline: boolean;
  /** Number of pending changes in queue */
  pendingChangesCount: number;
  /** Last sync result */
  lastSyncResult: SyncResult | null;
  /** Last sync timestamp */
  lastSyncTime: Date | null;
  /** Sync errors from last attempt */
  syncErrors: SyncError[];
  /** Manually trigger a sync */
  triggerSync: () => Promise<void>;
  /** Clear sync errors */
  clearErrors: () => void;
}

// ============================================================================
// Hook Implementation
// ============================================================================

export function useSyncManager(
  options: UseSyncManagerOptions = {}
): UseSyncManagerReturn {
  const {
    autoSyncOnReconnect = true,
    onSyncComplete,
    onSyncFailed,
  } = options;

  // State
  const [syncState, setSyncState] = useState<SyncState>('idle');
  const [syncProgress, setSyncProgress] = useState(0);
  const [isOnline, setIsOnline] = useState(true);
  const [pendingChangesCount, setPendingChangesCount] = useState(0);
  const [lastSyncResult, setLastSyncResult] = useState<SyncResult | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [syncErrors, setSyncErrors] = useState<SyncError[]>([]);

  // Refs
  const wasOffline = useRef(false);
  const isSyncing = useRef(false);

  /**
   * Update pending changes count
   */
  const updatePendingCount = useCallback(async () => {
    const count = await offlineStorage.getPendingChangesCount();
    setPendingChangesCount(count);
  }, []);

  /**
   * Perform sync operation
   */
  const performSync = useCallback(async () => {
    // Prevent concurrent syncs
    if (isSyncing.current) {
      return;
    }

    isSyncing.current = true;
    setSyncState('syncing');
    setSyncProgress(0);
    setSyncErrors([]);

    try {
      // Simulate progress updates during sync
      setSyncProgress(10);

      // Process offline queue
      setSyncProgress(30);
      
      // Perform full sync
      const result = await syncService.fullSync();
      
      setSyncProgress(90);

      // Update state based on result
      setLastSyncResult(result);
      setLastSyncTime(new Date());
      
      if (result.status === 'success') {
        setSyncState('success');
        setSyncProgress(100);
      } else if (result.status === 'partial') {
        setSyncState('success');
        setSyncProgress(100);
        if (result.errors.length > 0) {
          setSyncErrors(result.errors);
        }
      } else {
        setSyncState('error');
        setSyncErrors(result.errors);
        
        // Notify about failed sync
        if (result.failedChanges > 0 && onSyncFailed) {
          onSyncFailed(result.errors);
        }
      }

      // Callback
      onSyncComplete?.(result);

      // Update pending count after sync
      updatePendingCount();

    } catch (error) {
      console.error('Sync failed:', error);
      setSyncState('error');
      setSyncErrors([{
        changeId: 'sync-error',
        type: 'FULL_SYNC',
        message: error instanceof Error ? error.message : 'Unknown sync error',
        retryCount: 0,
      }]);
    } finally {
      isSyncing.current = false;
    }
  }, [onSyncComplete, onSyncFailed, updatePendingCount]);

  /**
   * Manually trigger sync
   */
  const triggerSync = useCallback(async () => {
    if (!isOnline) {
      console.warn('Cannot sync while offline');
      return;
    }
    await performSync();
  }, [isOnline, performSync]);

  /**
   * Clear sync errors
   */
  const clearErrors = useCallback(() => {
    setSyncErrors([]);
    if (syncState === 'error') {
      setSyncState('idle');
    }
  }, [syncState]);

  /**
   * Handle network state changes
   */
  const handleNetworkChange = useCallback((state: NetInfoState) => {
    const online = state.isConnected === true && state.isInternetReachable !== false;
    
    setIsOnline(online);

    // Check if we just came back online
    if (online && wasOffline.current && autoSyncOnReconnect) {
      // Trigger sync when coming back online
      performSync();
    }

    wasOffline.current = !online;
  }, [autoSyncOnReconnect, performSync]);

  // Subscribe to network state changes
  useEffect(() => {
    // Get initial network state
    NetInfo.fetch().then((state) => {
      const online = state.isConnected === true && state.isInternetReachable !== false;
      setIsOnline(online);
      wasOffline.current = !online;
    });

    // Subscribe to network changes
    const unsubscribe = NetInfo.addEventListener(handleNetworkChange);

    return () => {
      unsubscribe();
    };
  }, [handleNetworkChange]);

  // Update pending count on mount and periodically
  useEffect(() => {
    updatePendingCount();

    // Update pending count every 5 seconds
    const interval = setInterval(updatePendingCount, 5000);

    return () => {
      clearInterval(interval);
    };
  }, [updatePendingCount]);

  // Reset sync state after success (after 3 seconds)
  useEffect(() => {
    if (syncState === 'success') {
      const timeout = setTimeout(() => {
        setSyncState('idle');
      }, 3000);

      return () => {
        clearTimeout(timeout);
      };
    }
  }, [syncState]);

  return {
    syncState,
    syncProgress,
    isOnline,
    pendingChangesCount,
    lastSyncResult,
    lastSyncTime,
    syncErrors,
    triggerSync,
    clearErrors,
  };
}

export default useSyncManager;
