/**
 * Realtime Status Component
 * 
 * Displays connection status and last updated timestamp
 * Requirements: 5
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface RealtimeStatusProps {
  isConnected: boolean;
  lastUpdated: Date | null;
  error?: string | null;
  onReconnect?: () => void;
}

function formatLastUpdated(date: Date | null): string {
  if (!date) return 'Never';
  
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return date.toLocaleDateString();
}

export function RealtimeStatus({ 
  isConnected, 
  lastUpdated, 
  error, 
  onReconnect 
}: RealtimeStatusProps): React.ReactElement {
  return (
    <View style={styles.container}>
      <View style={styles.statusRow}>
        <View style={[
          styles.statusDot,
          { backgroundColor: isConnected ? '#10B981' : '#EF4444' }
        ]} />
        <Text style={styles.statusText}>
          {isConnected ? 'Live' : 'Offline'}
        </Text>
        {lastUpdated && (
          <Text style={styles.lastUpdated}>
            • Updated {formatLastUpdated(lastUpdated)}
          </Text>
        )}
      </View>
      
      {error && (
        <View style={styles.errorRow}>
          <Text style={styles.errorText}>{error}</Text>
          {onReconnect && (
            <TouchableOpacity onPress={onReconnect} style={styles.reconnectButton}>
              <Ionicons name="refresh" size={14} color="#0a7ea4" />
              <Text style={styles.reconnectText}>Reconnect</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F9FAFB',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  lastUpdated: {
    fontSize: 12,
    color: '#687076',
    marginLeft: 4,
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  errorText: {
    fontSize: 11,
    color: '#EF4444',
    flex: 1,
  },
  reconnectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  reconnectText: {
    fontSize: 11,
    color: '#0a7ea4',
    fontWeight: '600',
  },
});

export default RealtimeStatus;
