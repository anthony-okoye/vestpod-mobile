/**
 * Offline Status Hook
 * 
 * Detects network connectivity using NetInfo and provides offline status.
 * Auto-refreshes when connectivity changes.
 * 
 * Requirements: Requirement 13 - Offline Mode
 */

import { useEffect, useState, useCallback } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { getLastUpdated } from '@/services/offlineStorage';

interface UseOfflineStatusReturn {
  isOnline: boolean;
  isOffline: boolean;
  lastUpdated: string | null;
  connectionType: string | null;
  isInternetReachable: boolean | null;
  refreshStatus: () => Promise<void>;
}

export function useOfflineStatus(): UseOfflineStatusReturn {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [connectionType, setConnectionType] = useState<string | null>(null);
  const [isInternetReachable, setIsInternetReachable] = useState<boolean | null>(null);

  const handleNetworkChange = useCallback(async (state: NetInfoState) => {
    const online = state.isConnected === true && state.isInternetReachable !== false;
    setIsOnline(online);
    setConnectionType(state.type);
    setIsInternetReachable(state.isInternetReachable);
    
    // Update last updated timestamp when going offline
    if (!online) {
      const cached = await getLastUpdated();
      setLastUpdated(cached);
    }
  }, []);

  const refreshStatus = useCallback(async () => {
    try {
      const state = await NetInfo.fetch();
      await handleNetworkChange(state);
      
      // Refresh last updated from cache
      const cached = await getLastUpdated();
      setLastUpdated(cached);
    } catch (error) {
      console.error('[useOfflineStatus] Failed to refresh status:', error);
    }
  }, [handleNetworkChange]);

  useEffect(() => {
    // Initial fetch
    refreshStatus();

    // Subscribe to network state changes
    const unsubscribe = NetInfo.addEventListener(handleNetworkChange);

    return () => {
      unsubscribe();
    };
  }, [handleNetworkChange, refreshStatus]);

  return {
    isOnline,
    isOffline: !isOnline,
    lastUpdated,
    connectionType,
    isInternetReachable,
    refreshStatus,
  };
}

export default useOfflineStatus;
