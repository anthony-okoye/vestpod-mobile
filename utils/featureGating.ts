/**
 * Feature Gating Constants
 * 
 * Defines limits and premium feature identifiers for the app
 * Requirements: Task 60 - Feature Gating
 */

/** Maximum number of alerts free users can create */
export const FREE_ALERT_LIMIT = 3;

/** List of features that require premium subscription */
export const PREMIUM_FEATURES = [
  'insights',
  'chat',
  'unlimited_alerts',
  'data_export',
] as const;

/** Type for premium feature identifiers */
export type PremiumFeature = typeof PREMIUM_FEATURES[number];
