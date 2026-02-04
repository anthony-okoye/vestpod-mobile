/**
 * Feature Gating Hook
 * 
 * Provides feature access checks based on premium subscription status
 * Requirements: Task 60 - Feature Gating
 */

import { useCallback } from 'react';
import { usePurchases } from './usePurchases';
import { usePremiumPaywall } from './usePremiumPaywall';
import { FREE_ALERT_LIMIT, PremiumFeature } from '@/utils/featureGating';

export interface UseFeatureGatingReturn {
  /** Whether user has premium subscription */
  isPremium: boolean;
  /** Check if user can access AI insights screen */
  canAccessInsights: () => boolean;
  /** Check if user can access AI chat screen */
  canAccessChat: () => boolean;
  /** Check if user can create a new alert (free users limited to 3) */
  canCreateAlert: (currentAlertCount: number) => boolean;
  /** Check if user can export data */
  canExportData: () => boolean;
  /** Show paywall modal for a specific feature */
  showPaywallForFeature: (feature: PremiumFeature) => void;
  /** Paywall visibility state */
  paywallVisible: boolean;
  /** Feature that triggered the paywall */
  paywallFeature: string | undefined;
  /** Hide the paywall modal */
  hidePaywall: () => void;
}

/** Human-readable feature names for paywall display */
const FEATURE_DISPLAY_NAMES: Record<PremiumFeature, string> = {
  insights: 'AI Insights',
  chat: 'AI Chat',
  unlimited_alerts: 'Unlimited Alerts',
  data_export: 'Data Export',
};

/**
 * Hook for checking feature access based on premium status
 * 
 * @example
 * ```tsx
 * const { isPremium, canAccessInsights, showPaywallForFeature } = useFeatureGating();
 * 
 * const handleInsightsPress = () => {
 *   if (!canAccessInsights()) {
 *     showPaywallForFeature('insights');
 *     return;
 *   }
 *   navigation.navigate('Insights');
 * };
 * ```
 */
export function useFeatureGating(): UseFeatureGatingReturn {
  const { isPremium } = usePurchases();
  const { isVisible, triggerFeature, showPaywall, hidePaywall } = usePremiumPaywall();

  const canAccessInsights = useCallback((): boolean => {
    return isPremium;
  }, [isPremium]);

  const canAccessChat = useCallback((): boolean => {
    return isPremium;
  }, [isPremium]);

  const canCreateAlert = useCallback((currentAlertCount: number): boolean => {
    if (isPremium) {
      return true;
    }
    return currentAlertCount < FREE_ALERT_LIMIT;
  }, [isPremium]);

  const canExportData = useCallback((): boolean => {
    return isPremium;
  }, [isPremium]);

  const showPaywallForFeature = useCallback((feature: PremiumFeature): void => {
    const displayName = FEATURE_DISPLAY_NAMES[feature];
    showPaywall(displayName);
  }, [showPaywall]);

  return {
    isPremium,
    canAccessInsights,
    canAccessChat,
    canCreateAlert,
    canExportData,
    showPaywallForFeature,
    paywallVisible: isVisible,
    paywallFeature: triggerFeature,
    hidePaywall,
  };
}

export default useFeatureGating;
