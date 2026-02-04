/**
 * RevenueCat Purchases Service
 * 
 * Provides subscription management via RevenueCat SDK
 * Handles purchase flow, restore purchases, and premium status
 * 
 * NOTE: react-native-purchases requires native modules.
 * Run: npx expo install react-native-purchases
 * Then rebuild the app with: npx expo prebuild && npx expo run:ios/android
 */

import Purchases, {
  PurchasesPackage,
  CustomerInfo,
  PurchasesOfferings,
  LOG_LEVEL,
  PurchasesError,
} from 'react-native-purchases';
import { Platform } from 'react-native';

// RevenueCat API keys from environment
const REVENUECAT_API_KEY_IOS = process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_IOS || '';
const REVENUECAT_API_KEY_ANDROID = process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID || '';

// Premium entitlement identifier (configured in RevenueCat dashboard)
const PREMIUM_ENTITLEMENT_ID = 'premium';

// ============================================================================
// Types
// ============================================================================

export interface PurchaseResult {
  success: boolean;
  customerInfo: CustomerInfo | null;
  error?: string;
}

export interface RestoreResult {
  success: boolean;
  customerInfo: CustomerInfo | null;
  restoredPurchases: boolean;
  error?: string;
}

// ============================================================================
// Purchases Service
// ============================================================================

export const purchasesService = {
  _initialized: false,

  /**
   * Initialize RevenueCat SDK
   * Should be called once at app startup
   */
  async initialize(userId?: string): Promise<void> {
    if (this._initialized) {
      return;
    }

    const apiKey = Platform.OS === 'ios' 
      ? REVENUECAT_API_KEY_IOS 
      : REVENUECAT_API_KEY_ANDROID;

    if (!apiKey) {
      throw new Error(
        `RevenueCat API key not configured for ${Platform.OS}. ` +
        'Set EXPO_PUBLIC_REVENUECAT_API_KEY_IOS or EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID in .env'
      );
    }

    // Enable debug logs in development
    if (__DEV__) {
      Purchases.setLogLevel(LOG_LEVEL.DEBUG);
    }

    // Configure RevenueCat
    await Purchases.configure({
      apiKey,
      appUserID: userId || null,
    });

    this._initialized = true;
  },

  /**
   * Get available subscription offerings
   */
  async getOfferings(): Promise<PurchasesOfferings | null> {
    if (!this._initialized) {
      throw new Error('Purchases service not initialized. Call initialize() first.');
    }

    const offerings = await Purchases.getOfferings();
    return offerings;
  },

  /**
   * Purchase a subscription package
   */
  async purchasePackage(pkg: PurchasesPackage): Promise<PurchaseResult> {
    if (!this._initialized) {
      throw new Error('Purchases service not initialized. Call initialize() first.');
    }

    try {
      const { customerInfo } = await Purchases.purchasePackage(pkg);
      
      return {
        success: true,
        customerInfo,
      };
    } catch (error) {
      const purchaseError = error as PurchasesError;
      
      // User cancelled - not an error
      if (purchaseError.userCancelled) {
        return {
          success: false,
          customerInfo: null,
          error: 'Purchase cancelled',
        };
      }

      return {
        success: false,
        customerInfo: null,
        error: purchaseError.message || 'Purchase failed',
      };
    }
  },

  /**
   * Restore previous purchases
   */
  async restorePurchases(): Promise<RestoreResult> {
    if (!this._initialized) {
      throw new Error('Purchases service not initialized. Call initialize() first.');
    }

    try {
      const customerInfo = await Purchases.restorePurchases();
      const hasActiveEntitlements = Object.keys(customerInfo.entitlements.active).length > 0;

      return {
        success: true,
        customerInfo,
        restoredPurchases: hasActiveEntitlements,
      };
    } catch (error) {
      const purchaseError = error as PurchasesError;
      
      return {
        success: false,
        customerInfo: null,
        restoredPurchases: false,
        error: purchaseError.message || 'Restore failed',
      };
    }
  },

  /**
   * Check if user has premium entitlement
   */
  async isPremium(): Promise<boolean> {
    if (!this._initialized) {
      return false;
    }

    try {
      const customerInfo = await Purchases.getCustomerInfo();
      return customerInfo.entitlements.active[PREMIUM_ENTITLEMENT_ID] !== undefined;
    } catch {
      return false;
    }
  },

  /**
   * Get current customer info
   */
  async getCustomerInfo(): Promise<CustomerInfo | null> {
    if (!this._initialized) {
      return null;
    }

    try {
      return await Purchases.getCustomerInfo();
    } catch {
      return null;
    }
  },

  /**
   * Login user (associate purchases with user ID)
   * Call after user authentication
   */
  async login(userId: string): Promise<CustomerInfo | null> {
    if (!this._initialized) {
      throw new Error('Purchases service not initialized. Call initialize() first.');
    }

    try {
      const { customerInfo } = await Purchases.logIn(userId);
      return customerInfo;
    } catch {
      return null;
    }
  },

  /**
   * Logout user (reset to anonymous user)
   * Call after user signs out
   */
  async logout(): Promise<CustomerInfo | null> {
    if (!this._initialized) {
      return null;
    }

    try {
      const customerInfo = await Purchases.logOut();
      return customerInfo;
    } catch {
      return null;
    }
  },

  /**
   * Add listener for customer info updates
   */
  addCustomerInfoUpdateListener(
    listener: (customerInfo: CustomerInfo) => void
  ): () => void {
    const subscription = Purchases.addCustomerInfoUpdateListener(listener);
    return () => subscription.remove();
  },

  /**
   * Check if SDK is initialized
   */
  isInitialized(): boolean {
    return this._initialized;
  },
};

export default purchasesService;
