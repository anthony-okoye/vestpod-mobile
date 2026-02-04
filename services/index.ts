// mobile/services/index.ts
export { supabase } from './supabase';
export { default as api, authService, portfolioService, assetService, priceHistoryService, alertService, insightsService, chatService, profileService, subscriptionService, realtimeService } from './api';
export { secureStorage } from './secureStorage';
export { purchasesService } from './purchases';
export { notificationService, configureNotifications, setupPushNotifications } from './notifications';
export type { NotificationType, NotificationData, PushNotificationState } from './notifications';

// Offline storage exports
export {
  savePortfolios,
  getPortfolios,
  saveAssets,
  getAssets,
  saveUserProfile,
  getUserProfile,
  getLastUpdated,
  setLastUpdated,
  addToOfflineQueue,
  getOfflineQueue,
  clearOfflineQueue,
  clearAllCache,
  hasCachedData,
  getPendingChangesCount,
  removeFromOfflineQueue,
  incrementRetryCount,
  storage,
} from './offlineStorage';
export type { Portfolio, Asset, UserProfile, OfflineChange, OfflineChangeType, AssetType } from './offlineStorage';
