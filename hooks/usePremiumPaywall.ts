/**
 * Premium Paywall Hook
 * 
 * Manages paywall visibility state and trigger feature tracking
 * Requirements: 10 - Premium Features & Monetization
 */

import { useState, useCallback } from 'react';

export interface UsePremiumPaywallReturn {
  /** Whether the paywall modal is currently visible */
  isVisible: boolean;
  /** The feature that triggered the paywall display (if any) */
  triggerFeature: string | undefined;
  /** Show the paywall modal, optionally highlighting a specific feature */
  showPaywall: (feature?: string) => void;
  /** Hide the paywall modal and reset the trigger feature */
  hidePaywall: () => void;
}

/**
 * Hook for managing premium paywall visibility
 * 
 * @example
 * ```tsx
 * const { isVisible, triggerFeature, showPaywall, hidePaywall } = usePremiumPaywall();
 * 
 * // Show paywall when user tries to access a premium feature
 * const handleExportData = () => {
 *   if (!isPremiumUser) {
 *     showPaywall('Data Export');
 *     return;
 *   }
 *   // ... export logic
 * };
 * 
 * return (
 *   <>
 *     <PremiumPaywall
 *       visible={isVisible}
 *       onClose={hidePaywall}
 *       onSubscribe={handleSubscribe}
 *       onRestorePurchases={handleRestore}
 *       feature={triggerFeature}
 *     />
 *   </>
 * );
 * ```
 */
export function usePremiumPaywall(): UsePremiumPaywallReturn {
  const [isVisible, setIsVisible] = useState(false);
  const [triggerFeature, setTriggerFeature] = useState<string | undefined>();

  const showPaywall = useCallback((feature?: string) => {
    setTriggerFeature(feature);
    setIsVisible(true);
  }, []);

  const hidePaywall = useCallback(() => {
    setIsVisible(false);
    setTriggerFeature(undefined);
  }, []);

  return {
    isVisible,
    triggerFeature,
    showPaywall,
    hidePaywall,
  };
}

export default usePremiumPaywall;
