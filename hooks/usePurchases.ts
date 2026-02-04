/**
 * Purchases Hook
 * 
 * React hook for managing in-app purchases via RevenueCat
 * Provides premium status, offerings, and purchase/restore handlers
 * 
 * Requirements: 10 (Subscription Management)
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { purchasesService, PurchaseResult, RestoreResult } from '@/services/purchases';
import type { PurchasesOfferings, CustomerInfo, PurchasesPackage } from 'react-native-purchases';

// ============================================================================
// Types
// ============================================================================

interface UsePurchasesOptions {
  /** User ID to associate with purchases (optional) */
  userId?: string;
  /** Whether to auto-initialize on mount (default: true) */
  autoInitialize?: boolean;
}

interface UsePurchasesReturn {
  /** Whether user has premium entitlement */
  isPremium: boolean;
  /** Available subscription offerings */
  offerings: PurchasesOfferings | null;
  /** Current customer info */
  customerInfo: CustomerInfo | null;
  /** Loading state */
  isLoading: boolean;
  /** Error message if any */
  error: string | null;
  /** Purchase a package */
  purchase: (pkg: PurchasesPackage) => Promise<PurchaseResult>;
  /** Restore previous purchases */
  restore: () => Promise<RestoreResult>;
  /** Refresh offerings and customer info */
  refresh: () => Promise<void>;
  /** Initialize purchases (if autoInitialize is false) */
  initialize: () => Promise<void>;
}

// ============================================================================
// Hook Implementation
// ============================================================================

export function usePurchases(options: UsePurchasesOptions = {}): UsePurchasesReturn {
  const { userId, autoInitialize = true } = options;

  const [isPremium, setIsPremium] = useState(false);
  const [offerings, setOfferings] = useState<PurchasesOfferings | null>(null);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const initializedRef = useRef(false);
  const listenerRemoveRef = useRef<(() => void) | null>(null);

  /**
   * Update premium status from customer info
   */
  const updatePremiumStatus = useCallback((info: CustomerInfo | null) => {
    if (info) {
      const hasPremium = info.entitlements.active['premium'] !== undefined;
      setIsPremium(hasPremium);
      setCustomerInfo(info);
    } else {
      setIsPremium(false);
      setCustomerInfo(null);
    }
  }, []);

  /**
   * Initialize RevenueCat and fetch initial data
   */
  const initialize = useCallback(async () => {
    if (initializedRef.current) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Initialize RevenueCat SDK
      await purchasesService.initialize(userId);
      initializedRef.current = true;

      // Fetch offerings
      const fetchedOfferings = await purchasesService.getOfferings();
      setOfferings(fetchedOfferings);

      // Fetch customer info
      const info = await purchasesService.getCustomerInfo();
      updatePremiumStatus(info);

      // Listen for customer info updates
      listenerRemoveRef.current = purchasesService.addCustomerInfoUpdateListener(
        (updatedInfo) => {
          updatePremiumStatus(updatedInfo);
        }
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize purchases';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [userId, updatePremiumStatus]);

  /**
   * Refresh offerings and customer info
   */
  const refresh = useCallback(async () => {
    if (!initializedRef.current) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const [fetchedOfferings, info] = await Promise.all([
        purchasesService.getOfferings(),
        purchasesService.getCustomerInfo(),
      ]);

      setOfferings(fetchedOfferings);
      updatePremiumStatus(info);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to refresh purchases';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [updatePremiumStatus]);

  /**
   * Purchase a package
   */
  const purchase = useCallback(async (pkg: PurchasesPackage): Promise<PurchaseResult> => {
    if (!initializedRef.current) {
      return {
        success: false,
        customerInfo: null,
        error: 'Purchases not initialized',
      };
    }

    setError(null);

    const result = await purchasesService.purchasePackage(pkg);

    if (result.success && result.customerInfo) {
      updatePremiumStatus(result.customerInfo);
    } else if (result.error && result.error !== 'Purchase cancelled') {
      setError(result.error);
    }

    return result;
  }, [updatePremiumStatus]);

  /**
   * Restore previous purchases
   */
  const restore = useCallback(async (): Promise<RestoreResult> => {
    if (!initializedRef.current) {
      return {
        success: false,
        customerInfo: null,
        restoredPurchases: false,
        error: 'Purchases not initialized',
      };
    }

    setIsLoading(true);
    setError(null);

    const result = await purchasesService.restorePurchases();

    if (result.success && result.customerInfo) {
      updatePremiumStatus(result.customerInfo);
    } else if (result.error) {
      setError(result.error);
    }

    setIsLoading(false);
    return result;
  }, [updatePremiumStatus]);

  /**
   * Initialize on mount if autoInitialize is true
   */
  useEffect(() => {
    if (autoInitialize) {
      initialize();
    }

    return () => {
      // Cleanup listener on unmount
      if (listenerRemoveRef.current) {
        listenerRemoveRef.current();
        listenerRemoveRef.current = null;
      }
    };
  }, [autoInitialize, initialize]);

  return {
    isPremium,
    offerings,
    customerInfo,
    isLoading,
    error,
    purchase,
    restore,
    refresh,
    initialize,
  };
}

export default usePurchases;
