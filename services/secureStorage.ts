// mobile/services/secureStorage.ts
/**
 * Secure Storage Service
 * 
 * Provides secure token storage using expo-secure-store
 * Handles authentication token persistence for auto-login
 * Requirements: 1, 14
 */

import * as SecureStore from 'expo-secure-store';

const ACCESS_TOKEN_KEY = 'vestpod_access_token';
const REFRESH_TOKEN_KEY = 'vestpod_refresh_token';
const USER_DATA_KEY = 'vestpod_user_data';

export const secureStorage = {
  /**
   * Store access token securely
   */
  async setAccessToken(token: string): Promise<void> {
    await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, token);
  },

  /**
   * Retrieve access token
   */
  async getAccessToken(): Promise<string | null> {
    return await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
  },

  /**
   * Store refresh token securely
   */
  async setRefreshToken(token: string): Promise<void> {
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token);
  },

  /**
   * Retrieve refresh token
   */
  async getRefreshToken(): Promise<string | null> {
    return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
  },

  /**
   * Store user data securely
   */
  async setUserData(userData: { id: string; email: string; name?: string }): Promise<void> {
    await SecureStore.setItemAsync(USER_DATA_KEY, JSON.stringify(userData));
  },

  /**
   * Retrieve user data
   */
  async getUserData(): Promise<{ id: string; email: string; name?: string } | null> {
    const data = await SecureStore.getItemAsync(USER_DATA_KEY);
    if (data) {
      try {
        return JSON.parse(data);
      } catch {
        return null;
      }
    }
    return null;
  },

  /**
   * Store complete session (tokens + user data)
   */
  async storeSession(
    accessToken: string,
    refreshToken: string,
    userData: { id: string; email: string; name?: string }
  ): Promise<void> {
    await Promise.all([
      this.setAccessToken(accessToken),
      this.setRefreshToken(refreshToken),
      this.setUserData(userData),
    ]);
  },

  /**
   * Clear all stored authentication data
   */
  async clearSession(): Promise<void> {
    await Promise.all([
      SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY),
      SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY),
      SecureStore.deleteItemAsync(USER_DATA_KEY),
    ]);
  },

  /**
   * Check if session exists
   */
  async hasSession(): Promise<boolean> {
    const token = await this.getAccessToken();
    return token !== null;
  },
};

export default secureStorage;
