/**
 * Offline Storage Service
 * 
 * Provides local data caching using AsyncStorage for offline support.
 * Handles caching of portfolio data, assets, user profile, and offline change queue.
 * 
 * Requirements: Requirement 13 - Offline Mode
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys
const STORAGE_KEYS = {
  PORTFOLIOS: 'cached_portfolios',
  ASSETS: 'cached_assets',
  USER_PROFILE: 'cached_user_profile',
  LAST_UPDATED: 'last_updated_timestamp',
  OFFLINE_QUEUE: 'offline_change_queue',
  SUBSCRIPTION_STATUS: 'cached_subscription_status',
} as const;

// Types
export interface Portfolio {
  id: string;
  name: string;
  user_id: string;
  total_value: number;
  created_at: string;
  updated_at: string;
}

export type AssetType = 'stock' | 'crypto' | 'commodity' | 'real_estate' | 'fixed_income' | 'other';

export interface Asset {
  id: string;
  portfolio_id: string;
  asset_type: AssetType;
  symbol?: string;
  name: string;
  quantity: number;
  purchase_price: number;
  purchase_date: string;
  current_price?: number;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  currency_preference?: string;
  language_preference?: string;
  avatar_url?: string;
  subscription_tier?: 'free' | 'premium';
  push_token?: string;
  created_at?: string;
  updated_at?: string;
}

export type OfflineChangeType = 
  | 'CREATE_PORTFOLIO'
  | 'UPDATE_PORTFOLIO'
  | 'DELETE_PORTFOLIO'
  | 'CREATE_ASSET'
  | 'UPDATE_ASSET'
  | 'DELETE_ASSET'
  | 'UPDATE_PROFILE';

export interface OfflineChange {
  id: string;
  type: OfflineChangeType;
  payload: Record<string, unknown>;
  timestamp: string;
  retryCount: number;
}

// Portfolio functions
export async function savePortfolios(portfolios: Portfolio[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.PORTFOLIOS, JSON.stringify(portfolios));
    await setLastUpdated(new Date().toISOString());
  } catch (error) {
    console.error('[OfflineStorage] Failed to save portfolios:', error);
    throw error;
  }
}

export async function getPortfolios(): Promise<Portfolio[] | null> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.PORTFOLIOS);
    if (!data) return null;
    return JSON.parse(data) as Portfolio[];
  } catch (error) {
    console.error('[OfflineStorage] Failed to get portfolios:', error);
    return null;
  }
}

// Asset functions
export async function saveAssets(assets: Asset[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.ASSETS, JSON.stringify(assets));
    await setLastUpdated(new Date().toISOString());
  } catch (error) {
    console.error('[OfflineStorage] Failed to save assets:', error);
    throw error;
  }
}

export async function getAssets(): Promise<Asset[] | null> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.ASSETS);
    if (!data) return null;
    return JSON.parse(data) as Asset[];
  } catch (error) {
    console.error('[OfflineStorage] Failed to get assets:', error);
    return null;
  }
}

// User profile functions
export async function saveUserProfile(profile: UserProfile): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
    await setLastUpdated(new Date().toISOString());
  } catch (error) {
    console.error('[OfflineStorage] Failed to save user profile:', error);
    throw error;
  }
}

export async function getUserProfile(): Promise<UserProfile | null> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.USER_PROFILE);
    if (!data) return null;
    return JSON.parse(data) as UserProfile;
  } catch (error) {
    console.error('[OfflineStorage] Failed to get user profile:', error);
    return null;
  }
}

// Last updated timestamp functions
export async function setLastUpdated(timestamp: string): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.LAST_UPDATED, timestamp);
  } catch (error) {
    console.error('[OfflineStorage] Failed to set last updated:', error);
    throw error;
  }
}

export async function getLastUpdated(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(STORAGE_KEYS.LAST_UPDATED);
  } catch (error) {
    console.error('[OfflineStorage] Failed to get last updated:', error);
    return null;
  }
}

// Offline queue functions
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

export async function addToOfflineQueue(change: Omit<OfflineChange, 'id' | 'timestamp' | 'retryCount'>): Promise<string> {
  try {
    const queue = await getOfflineQueue();
    const newChange: OfflineChange = {
      ...change,
      id: generateId(),
      timestamp: new Date().toISOString(),
      retryCount: 0,
    };
    queue.push(newChange);
    await AsyncStorage.setItem(STORAGE_KEYS.OFFLINE_QUEUE, JSON.stringify(queue));
    return newChange.id;
  } catch (error) {
    console.error('[OfflineStorage] Failed to add to offline queue:', error);
    throw error;
  }
}

export async function getOfflineQueue(): Promise<OfflineChange[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.OFFLINE_QUEUE);
    if (!data) return [];
    return JSON.parse(data) as OfflineChange[];
  } catch (error) {
    console.error('[OfflineStorage] Failed to get offline queue:', error);
    return [];
  }
}

export async function removeFromOfflineQueue(id: string): Promise<void> {
  try {
    const queue = await getOfflineQueue();
    const filtered = queue.filter(item => item.id !== id);
    await AsyncStorage.setItem(STORAGE_KEYS.OFFLINE_QUEUE, JSON.stringify(filtered));
  } catch (error) {
    console.error('[OfflineStorage] Failed to remove from offline queue:', error);
    throw error;
  }
}

export async function incrementRetryCount(id: string): Promise<number> {
  try {
    const queue = await getOfflineQueue();
    const index = queue.findIndex(item => item.id === id);
    if (index === -1) return 0;
    
    queue[index].retryCount += 1;
    await AsyncStorage.setItem(STORAGE_KEYS.OFFLINE_QUEUE, JSON.stringify(queue));
    return queue[index].retryCount;
  } catch (error) {
    console.error('[OfflineStorage] Failed to increment retry count:', error);
    return 0;
  }
}

export async function clearOfflineQueue(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.OFFLINE_QUEUE);
  } catch (error) {
    console.error('[OfflineStorage] Failed to clear offline queue:', error);
    throw error;
  }
}

// Clear all cache
export async function clearAllCache(): Promise<void> {
  try {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.PORTFOLIOS,
      STORAGE_KEYS.ASSETS,
      STORAGE_KEYS.USER_PROFILE,
      STORAGE_KEYS.LAST_UPDATED,
      STORAGE_KEYS.OFFLINE_QUEUE,
      STORAGE_KEYS.SUBSCRIPTION_STATUS,
    ]);
  } catch (error) {
    console.error('[OfflineStorage] Failed to clear all cache:', error);
    throw error;
  }
}

// Check if cached data exists
export async function hasCachedData(): Promise<boolean> {
  const portfolios = await getPortfolios();
  const profile = await getUserProfile();
  return portfolios !== null || profile !== null;
}

// Get pending changes count
export async function getPendingChangesCount(): Promise<number> {
  const queue = await getOfflineQueue();
  return queue.length;
}

// Alias functions for syncService compatibility
export async function cachePortfolios(portfolios: Portfolio[]): Promise<void> {
  return savePortfolios(portfolios);
}

export async function getCachedPortfolios(): Promise<Portfolio[] | null> {
  return getPortfolios();
}

export async function cacheAssets(portfolioId: string, assets: Asset[]): Promise<void> {
  // Get existing assets and merge
  const existingAssets = await getAssets() || [];
  const otherAssets = existingAssets.filter(a => a.portfolio_id !== portfolioId);
  const mergedAssets = [...otherAssets, ...assets];
  return saveAssets(mergedAssets);
}

export async function cacheUserProfile(profile: UserProfile): Promise<void> {
  return saveUserProfile(profile);
}

export async function removeFromQueue(id: string): Promise<void> {
  return removeFromOfflineQueue(id);
}

export async function removeFailedChanges(maxRetries: number): Promise<void> {
  const queue = await getOfflineQueue();
  const filtered = queue.filter(item => item.retryCount < maxRetries);
  await AsyncStorage.setItem(STORAGE_KEYS.OFFLINE_QUEUE, JSON.stringify(filtered));
}

// Export as object for compatibility
export const offlineStorage = {
  savePortfolios,
  getPortfolios,
  saveAssets,
  getAssets,
  saveUserProfile,
  getUserProfile,
  setLastUpdated,
  getLastUpdated,
  addToOfflineQueue,
  getOfflineQueue,
  removeFromOfflineQueue,
  incrementRetryCount,
  clearOfflineQueue,
  clearAllCache,
  hasCachedData,
  getPendingChangesCount,
  cachePortfolios,
  getCachedPortfolios,
  cacheAssets,
  cacheUserProfile,
  removeFromQueue,
  removeFailedChanges,
};
