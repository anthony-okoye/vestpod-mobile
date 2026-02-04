/**
 * Push Notifications Hook
 * 
 * Manages notification listeners, handles foreground/background notifications,
 * and provides navigation on notification tap.
 * 
 * Requirements: 7 - Push Notifications
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import * as Notifications from 'expo-notifications';
import { useNavigation, NavigationContainerRef } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';
import type { RootStackParamList } from '@/navigation/types';
import {
  notificationService,
  NotificationData,
  PushNotificationState,
} from '@/services/notifications';

// ============================================================================
// Types
// ============================================================================

export interface UseNotificationsOptions {
  /** Whether to automatically setup notifications on mount */
  autoSetup?: boolean;
  /** Callback when a notification is received in foreground */
  onNotificationReceived?: (notification: Notifications.Notification) => void;
  /** Callback when a notification is tapped */
  onNotificationTapped?: (response: Notifications.NotificationResponse) => void;
  /** Whether to automatically navigate on notification tap */
  autoNavigate?: boolean;
  /** Navigation ref for use outside NavigationContainer */
  navigationRef?: React.RefObject<NavigationContainerRef<RootStackParamList>>;
}

export interface UseNotificationsReturn {
  /** Current push notification state */
  state: PushNotificationState;
  /** Whether notifications are being set up */
  isLoading: boolean;
  /** Last received notification */
  lastNotification: Notifications.Notification | null;
  /** Last notification response (tap) */
  lastResponse: Notifications.NotificationResponse | null;
  /** Manually trigger notification setup */
  setup: () => Promise<void>;
  /** Clear the last notification */
  clearLastNotification: () => void;
}

// ============================================================================
// Hook Implementation
// ============================================================================

export function useNotifications(
  options: UseNotificationsOptions = {}
): UseNotificationsReturn {
  const {
    autoSetup = false,
    onNotificationReceived,
    onNotificationTapped,
    autoNavigate = true,
    navigationRef,
  } = options;

  // Try to get navigation, but don't fail if not available
  let navigation: NavigationProp<RootStackParamList> | null = null;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    navigation = useNavigation<NavigationProp<RootStackParamList>>();
  } catch {
    // Navigation not available (outside NavigationContainer)
  }

  // State
  const [state, setState] = useState<PushNotificationState>({
    token: null,
    permissionStatus: null,
    error: null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [lastNotification, setLastNotification] = useState<Notifications.Notification | null>(null);
  const [lastResponse, setLastResponse] = useState<Notifications.NotificationResponse | null>(null);

  // Refs for listeners
  const notificationListener = useRef<Notifications.EventSubscription | null>(null);
  const responseListener = useRef<Notifications.EventSubscription | null>(null);

  /**
   * Handle navigation based on notification data
   */
  const handleNavigation = useCallback(
    (data: NotificationData) => {
      const target = notificationService.getNavigationTarget(data);
      const nav = navigation || navigationRef?.current;

      if (!nav) {
        console.warn('Navigation not available for notification handling');
        return;
      }

      try {
        if (target.screen === 'AssetDetailView' && target.params) {
          nav.navigate('AssetDetailView' as never, target.params as never);
        } else if (target.screen === 'Alerts') {
          nav.navigate('Main' as never, { screen: 'Alerts' } as never);
        } else if (target.screen === 'Insights') {
          nav.navigate('Main' as never, { screen: 'Insights' } as never);
        } else if (target.screen === 'Assets') {
          nav.navigate('Main' as never, { screen: 'Assets' } as never);
        } else {
          nav.navigate('Main' as never, { screen: 'Dashboard' } as never);
        }
      } catch (error) {
        // Navigation might fail if not ready, silently ignore
        console.warn('Failed to navigate from notification:', error);
      }
    },
    [navigation, navigationRef]
  );

  /**
   * Handle foreground notification received
   */
  const handleNotificationReceived = useCallback(
    (notification: Notifications.Notification) => {
      setLastNotification(notification);
      onNotificationReceived?.(notification);
    },
    [onNotificationReceived]
  );

  /**
   * Handle notification tap (response)
   */
  const handleNotificationResponse = useCallback(
    (response: Notifications.NotificationResponse) => {
      setLastResponse(response);
      onNotificationTapped?.(response);

      // Parse notification data and navigate
      if (autoNavigate) {
        const data = notificationService.parseData(response.notification);
        if (data) {
          handleNavigation(data);
        }
      }

      // Clear badge on tap
      notificationService.clearBadge();
    },
    [autoNavigate, handleNavigation, onNotificationTapped]
  );

  /**
   * Setup push notifications
   */
  const setup = useCallback(async () => {
    setIsLoading(true);

    try {
      // Configure notification handler
      notificationService.configure();

      // Configure Android channels
      await notificationService.configureAndroidChannel();

      // Setup push notifications (permissions + token + backend registration)
      const result = await notificationService.setup();
      setState(result);
    } catch (error) {
      setState({
        token: null,
        permissionStatus: null,
        error: error instanceof Error ? error.message : 'Failed to setup notifications',
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Clear last notification
   */
  const clearLastNotification = useCallback(() => {
    setLastNotification(null);
    setLastResponse(null);
  }, []);

  // Setup notification listeners on mount
  useEffect(() => {
    // Configure notification handler immediately
    notificationService.configure();

    // Listener for notifications received while app is foregrounded
    notificationListener.current = Notifications.addNotificationReceivedListener(
      handleNotificationReceived
    );

    // Listener for when user taps on notification
    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      handleNotificationResponse
    );

    // Check if app was opened from a notification
    Notifications.getLastNotificationResponseAsync().then((response) => {
      if (response) {
        handleNotificationResponse(response);
      }
    });

    // Cleanup listeners on unmount
    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, [handleNotificationReceived, handleNotificationResponse]);

  // Auto setup if enabled
  useEffect(() => {
    if (autoSetup) {
      setup();
    }
  }, [autoSetup, setup]);

  return {
    state,
    isLoading,
    lastNotification,
    lastResponse,
    setup,
    clearLastNotification,
  };
}

export default useNotifications;
