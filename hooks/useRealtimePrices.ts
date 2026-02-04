/**
 * Real-time Price Updates Hook
 * 
 * Subscribes to Supabase Realtime for price updates
 * Updates asset prices in real-time
 * Requirements: 5
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '@/services/supabase';
import { useAppDispatch } from '@/store/hooks';
import { updateAssetPrice } from '@/store/slices/assetsSlice';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface UseRealtimePricesOptions {
  portfolioId?: string;
  enabled?: boolean;
}

interface UseRealtimePricesReturn {
  lastUpdated: Date | null;
  isConnected: boolean;
  connectionError: string | null;
  reconnect: () => void;
}

export function useRealtimePrices(options: UseRealtimePricesOptions = {}): UseRealtimePricesReturn {
  const { enabled = true } = options;
  const dispatch = useAppDispatch();
  
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  
  const channelRef = useRef<RealtimeChannel | null>(null);

  const handlePriceUpdate = useCallback((payload: { payload?: { asset_id?: string; price?: number; timestamp?: string } }) => {
    const data = payload.payload || payload;
    const assetId = data.asset_id;
    const price = data.price;
    const timestamp = data.timestamp;
    
    if (assetId && price !== undefined) {
      dispatch(updateAssetPrice({
        id: assetId,
        price: price,
      }));
      setLastUpdated(new Date(timestamp || Date.now()));
    }
  }, [dispatch]);

  const subscribe = useCallback(() => {
    if (!enabled) return;

    try {
      setConnectionError(null);
      
      const channel = supabase
        .channel('price-updates')
        .on('broadcast', { event: 'price-update' }, handlePriceUpdate)
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            setIsConnected(true);
            setConnectionError(null);
          } else if (status === 'CHANNEL_ERROR') {
            setIsConnected(false);
            setConnectionError('Failed to connect to price updates');
          } else if (status === 'TIMED_OUT') {
            setIsConnected(false);
            setConnectionError('Connection timed out');
          }
        });

      channelRef.current = channel;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to subscribe to price updates';
      setConnectionError(errorMessage);
      setIsConnected(false);
    }
  }, [enabled, handlePriceUpdate]);

  const unsubscribe = useCallback(async () => {
    if (channelRef.current) {
      await supabase.removeChannel(channelRef.current);
      channelRef.current = null;
      setIsConnected(false);
    }
  }, []);

  const reconnect = useCallback(() => {
    unsubscribe().then(() => {
      subscribe();
    });
  }, [subscribe, unsubscribe]);

  useEffect(() => {
    subscribe();
    
    return () => {
      unsubscribe();
    };
  }, [subscribe, unsubscribe]);

  return {
    lastUpdated,
    isConnected,
    connectionError,
    reconnect,
  };
}

export default useRealtimePrices;
