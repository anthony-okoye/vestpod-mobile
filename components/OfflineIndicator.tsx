/**
 * Offline Indicator Component
 * 
 * Displays a banner when the device is offline with "Last updated" timestamp.
 * Shows sync indicator when reconnecting.
 * 
 * Requirements: Requirement 13 - Offline Mode
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  Easing,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useOfflineStatus } from '@/hooks/useOfflineStatus';

interface OfflineIndicatorProps {
  showWhenOnline?: boolean;
  onSyncStart?: () => void;
  onSyncComplete?: () => void;
}

function formatLastUpdated(timestamp: string | null): string {
  if (!timestamp) return 'Unknown';
  
  try {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffSeconds < 60) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString();
  } catch {
    return 'Unknown';
  }
}

export function OfflineIndicator({ 
  showWhenOnline = false,
  onSyncStart,
  onSyncComplete,
}: OfflineIndicatorProps): React.ReactElement | null {
  const { isOnline, isOffline, lastUpdated } = useOfflineStatus();
  const [isSyncing, setIsSyncing] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);
  
  const slideY = useSharedValue(-60);
  const rotation = useSharedValue(0);

  useEffect(() => {
    if (isOffline) {
      setWasOffline(true);
    } else if (wasOffline && isOnline) {
      setIsSyncing(true);
      onSyncStart?.();
      
      const timer = setTimeout(() => {
        setIsSyncing(false);
        setWasOffline(false);
        onSyncComplete?.();
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [isOnline, isOffline, wasOffline, onSyncStart, onSyncComplete]);

  useEffect(() => {
    const shouldShow = isOffline || isSyncing || (showWhenOnline && isOnline);
    slideY.value = withTiming(shouldShow ? 0 : -60, { duration: 300 });
  }, [isOffline, isSyncing, showWhenOnline, isOnline, slideY]);

  useEffect(() => {
    if (isSyncing) {
      rotation.value = withRepeat(
        withTiming(360, { duration: 1000, easing: Easing.linear }),
        -1,
        false
      );
    } else {
      rotation.value = 0;
    }
  }, [isSyncing, rotation]);

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: slideY.value }],
  }));

  const spinStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  if (isOnline && !isSyncing && !showWhenOnline) {
    return null;
  }

  const getStatusConfig = () => {
    if (isSyncing) {
      return {
        backgroundColor: '#3B82F6',
        icon: 'sync' as const,
        text: 'Syncing...',
        showLastUpdated: false,
      };
    }
    if (isOffline) {
      return {
        backgroundColor: '#F59E0B',
        icon: 'cloud-offline' as const,
        text: 'You are offline',
        showLastUpdated: true,
      };
    }
    return {
      backgroundColor: '#10B981',
      icon: 'cloud-done' as const,
      text: 'Online',
      showLastUpdated: false,
    };
  };

  const config = getStatusConfig();
  const statusBarHeight = Platform.OS === 'ios' ? 44 : 24;

  return (
    <Animated.View 
      style={[
        styles.container, 
        containerStyle,
        { 
          backgroundColor: config.backgroundColor,
          paddingTop: statusBarHeight,
        }
      ]}
    >
      <View style={styles.content}>
        {isSyncing ? (
          <Animated.View style={spinStyle}>
            <Ionicons name={config.icon} size={18} color="#FFFFFF" />
          </Animated.View>
        ) : (
          <Ionicons name={config.icon} size={18} color="#FFFFFF" />
        )}
        <Text style={styles.text}>{config.text}</Text>
        {config.showLastUpdated && lastUpdated && (
          <Text style={styles.lastUpdated}>
            • Last updated {formatLastUpdated(lastUpdated)}
          </Text>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    paddingBottom: 8,
    paddingHorizontal: 16,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  lastUpdated: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 12,
  },
});

export default OfflineIndicator;
