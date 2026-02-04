/**
 * Push Notifications Service
 * 
 * Handles push notification setup, permissions, and token management
 * for the Investment Portfolio Tracker mobile app.
 * 
 * Requirements: 7 - Push Notifications
 */

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { profileService } from './api';

// ============================================================================
// Types
// ============================================================================

export type NotificationType = 'price_alert' | 'insight_alert' | 'maturity_reminder';

export interface NotificationData {
  type: NotificationType;
  title: string;
  body: string;
  assetId?: string;
  alertId?: string;
  insightId?: string;
  portfolioId?: string;
  screen?: string;
  params?: Record<string, unknown>;
}

export interface PushNotificationState {
  token: string | null;
  permissionStatus: Notifications.PermissionStatus | null;
  error: string | null;
}

// ============================================================================
// Notification Configuration
// ============================================================================

/**
 * Configure default notification behavior
 * Called once at app initialization
 */
export function configureNotifications(): void {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

// ============================================================================
// Permission Management
// ============================================================================

/**
 * Request notification permissions from the user
 * @returns Permission status
 */
export async function requestNotificationPermissions(): Promise<Notifications.PermissionStatus> {
  if (!Device.isDevice) {
    throw new Error('Push notifications require a physical device');
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  
  if (existingStatus === 'granted') {
    return existingStatus;
  }

  const { status } = await Notifications.requestPermissionsAsync();
  return status;
}

/**
 * Check current notification permission status
 * @returns Current permission status
 */
export async function getNotificationPermissionStatus(): Promise<Notifications.PermissionStatus> {
  const { status } = await Notifications.getPermissionsAsync();
  return status;
}

// ============================================================================
// Push Token Management
// ============================================================================

/**
 * Get the Expo push token for this device
 * @returns Expo push token string
 */
export async function getExpoPushToken(): Promise<string> {
  if (!Device.isDevice) {
    throw new Error('Push notifications require a physical device');
  }

  // Check permissions first
  const permissionStatus = await getNotificationPermissionStatus();
  if (permissionStatus !== 'granted') {
    throw new Error('Notification permissions not granted');
  }

  // Get project ID from Constants
  const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
  
  if (!projectId) {
    throw new Error('Project ID not found. Ensure EAS is configured.');
  }

  const tokenData = await Notifications.getExpoPushTokenAsync({
    projectId,
  });

  return tokenData.data;
}

/**
 * Register push token with the backend
 * Stores the token in user_profiles table
 * @param token - Expo push token
 */
export async function registerPushTokenWithBackend(token: string): Promise<void> {
  await profileService.savePushToken(token);
}

/**
 * Complete push notification setup flow
 * Requests permissions, gets token, and registers with backend
 * @returns Push notification state
 */
export async function setupPushNotifications(): Promise<PushNotificationState> {
  const state: PushNotificationState = {
    token: null,
    permissionStatus: null,
    error: null,
  };

  try {
    // Request permissions
    state.permissionStatus = await requestNotificationPermissions();

    if (state.permissionStatus !== 'granted') {
      state.error = 'Notification permissions not granted';
      return state;
    }

    // Get push token
    state.token = await getExpoPushToken();

    // Register with backend
    await registerPushTokenWithBackend(state.token);

    return state;
  } catch (error) {
    state.error = error instanceof Error ? error.message : 'Failed to setup push notifications';
    return state;
  }
}

// ============================================================================
// Platform-Specific Configuration
// ============================================================================

/**
 * Configure Android notification channel
 * Required for Android 8.0+ (API level 26+)
 */
export async function configureAndroidChannel(): Promise<void> {
  if (Platform.OS !== 'android') {
    return;
  }

  await Notifications.setNotificationChannelAsync('default', {
    name: 'Default',
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#FF6B35',
    sound: 'default',
  });

  // Price alerts channel
  await Notifications.setNotificationChannelAsync('price_alerts', {
    name: 'Price Alerts',
    description: 'Notifications for price target alerts',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#FF6B35',
    sound: 'default',
  });

  // Insights channel
  await Notifications.setNotificationChannelAsync('insights', {
    name: 'AI Insights',
    description: 'Daily AI-generated portfolio insights',
    importance: Notifications.AndroidImportance.DEFAULT,
    sound: 'default',
  });

  // Maturity reminders channel
  await Notifications.setNotificationChannelAsync('maturity_reminders', {
    name: 'Maturity Reminders',
    description: 'Reminders for bond and fixed deposit maturities',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    sound: 'default',
  });
}

// ============================================================================
// Notification Handling
// ============================================================================

/**
 * Parse notification data from received notification
 * @param notification - Received notification
 * @returns Parsed notification data
 */
export function parseNotificationData(
  notification: Notifications.Notification
): NotificationData | null {
  const data = notification.request.content.data as Record<string, unknown> | undefined;
  
  if (!data) {
    return null;
  }

  return {
    type: (data.type as NotificationType) || 'price_alert',
    title: notification.request.content.title || '',
    body: notification.request.content.body || '',
    assetId: data.assetId as string | undefined,
    alertId: data.alertId as string | undefined,
    insightId: data.insightId as string | undefined,
    portfolioId: data.portfolioId as string | undefined,
    screen: data.screen as string | undefined,
    params: data.params as Record<string, unknown> | undefined,
  };
}

/**
 * Get navigation target based on notification type
 * @param data - Notification data
 * @returns Navigation screen name and params
 */
export function getNavigationTarget(
  data: NotificationData
): { screen: string; params?: Record<string, unknown> } {
  switch (data.type) {
    case 'price_alert':
      if (data.assetId && data.portfolioId) {
        return {
          screen: 'AssetDetailView',
          params: { assetId: data.assetId, portfolioId: data.portfolioId },
        };
      }
      return { screen: 'Alerts' };

    case 'insight_alert':
      return { screen: 'Insights' };

    case 'maturity_reminder':
      if (data.assetId && data.portfolioId) {
        return {
          screen: 'AssetDetailView',
          params: { assetId: data.assetId, portfolioId: data.portfolioId },
        };
      }
      return { screen: 'Assets' };

    default:
      return { screen: 'Dashboard' };
  }
}

// ============================================================================
// Badge Management
// ============================================================================

/**
 * Set the app badge count
 * @param count - Badge count to set
 */
export async function setBadgeCount(count: number): Promise<void> {
  await Notifications.setBadgeCountAsync(count);
}

/**
 * Clear the app badge
 */
export async function clearBadge(): Promise<void> {
  await Notifications.setBadgeCountAsync(0);
}

/**
 * Get current badge count
 * @returns Current badge count
 */
export async function getBadgeCount(): Promise<number> {
  return await Notifications.getBadgeCountAsync();
}

// ============================================================================
// Local Notifications (for testing)
// ============================================================================

/**
 * Schedule a local notification (useful for testing)
 * @param title - Notification title
 * @param body - Notification body
 * @param data - Additional data
 * @param trigger - When to show the notification
 */
export async function scheduleLocalNotification(
  title: string,
  body: string,
  data?: NotificationData,
  trigger?: Notifications.NotificationTriggerInput
): Promise<string> {
  const channelId = data?.type === 'price_alert' 
    ? 'price_alerts' 
    : data?.type === 'insight_alert'
    ? 'insights'
    : 'default';

  return await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data: data as unknown as Record<string, unknown>,
      sound: 'default',
      ...(Platform.OS === 'android' && { channelId }),
    },
    trigger: trigger ?? null,
  });
}

/**
 * Cancel a scheduled notification
 * @param notificationId - ID of the notification to cancel
 */
export async function cancelScheduledNotification(notificationId: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(notificationId);
}

/**
 * Cancel all scheduled notifications
 */
export async function cancelAllScheduledNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

// ============================================================================
// Export
// ============================================================================

export const notificationService = {
  configure: configureNotifications,
  requestPermissions: requestNotificationPermissions,
  getPermissionStatus: getNotificationPermissionStatus,
  getPushToken: getExpoPushToken,
  registerToken: registerPushTokenWithBackend,
  setup: setupPushNotifications,
  configureAndroidChannel,
  parseData: parseNotificationData,
  getNavigationTarget,
  setBadgeCount,
  clearBadge,
  getBadgeCount,
  scheduleLocal: scheduleLocalNotification,
  cancelScheduled: cancelScheduledNotification,
  cancelAllScheduled: cancelAllScheduledNotifications,
};

export default notificationService;
