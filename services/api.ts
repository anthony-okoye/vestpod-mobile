import { supabase } from './supabase';
import type { User, Session } from '@supabase/supabase-js';

/**
 * API Service Layer
 * Provides typed methods for interacting with Supabase backend
 */

// ============================================================================
// Authentication Services
// ============================================================================

export const authService = {
  /**
   * Sign up a new user with email and password
   */
  async signUp(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    
    if (error) throw error;
    return data;
  },

  /**
   * Sign in an existing user with email and password
   */
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
    return data;
  },

  /**
   * Sign out the current user
   */
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  /**
   * Send password reset email
   */
  async resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
  },

  /**
   * Get current session
   */
  async getSession(): Promise<Session | null> {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  },

  /**
   * Get current user
   */
  async getUser(): Promise<User | null> {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    return data.user;
  },

  /**
   * Listen to auth state changes
   */
  onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    return supabase.auth.onAuthStateChange(callback);
  },
};

// ============================================================================
// Portfolio Services
// ============================================================================

export const portfolioService = {
  /**
   * Get all portfolios for the current user
   */
  async getPortfolios() {
    const { data, error } = await supabase
      .from('portfolios')
      .select('*')
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  /**
   * Get a single portfolio by ID
   */
  async getPortfolio(portfolioId: string) {
    const { data, error } = await supabase
      .from('portfolios')
      .select('*')
      .eq('id', portfolioId)
      .single();
    
    if (error) throw error;
    return data;
  },

  /**
   * Create a new portfolio
   */
  async createPortfolio(name: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('portfolios')
      .insert({
        name,
        user_id: user.id,
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  /**
   * Update a portfolio
   */
  async updatePortfolio(portfolioId: string, name: string) {
    const { data, error } = await supabase
      .from('portfolios')
      .update({ name })
      .eq('id', portfolioId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  /**
   * Delete a portfolio
   */
  async deletePortfolio(portfolioId: string) {
    const { error } = await supabase
      .from('portfolios')
      .delete()
      .eq('id', portfolioId);
    
    if (error) throw error;
  },
};

// ============================================================================
// Asset Services
// ============================================================================

export const assetService = {
  /**
   * Get all assets for a portfolio
   */
  async getAssets(portfolioId: string) {
    const { data, error } = await supabase
      .from('assets')
      .select('*')
      .eq('portfolio_id', portfolioId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  /**
   * Get a single asset by ID
   */
  async getAsset(assetId: string) {
    const { data, error } = await supabase
      .from('assets')
      .select('*')
      .eq('id', assetId)
      .single();
    
    if (error) throw error;
    return data;
  },

  /**
   * Create a new asset
   */
  async createAsset(assetData: {
    portfolio_id: string;
    asset_type: string;
    symbol?: string;
    name: string;
    quantity: number;
    purchase_price: number;
    purchase_date: string;
    current_price?: number;
    metadata?: Record<string, any>;
  }) {
    // Get current user ID for RLS policy
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('assets')
      .insert({
        ...assetData,
        user_id: user.id,
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  /**
   * Update an asset
   */
  async updateAsset(assetId: string, updates: Partial<{
    name: string;
    quantity: number;
    purchase_price: number;
    purchase_date: string;
    current_price: number;
    metadata: Record<string, any>;
  }>) {
    const { data, error } = await supabase
      .from('assets')
      .update(updates)
      .eq('id', assetId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  /**
   * Delete an asset
   */
  async deleteAsset(assetId: string) {
    const { error } = await supabase
      .from('assets')
      .delete()
      .eq('id', assetId);
    
    if (error) throw error;
  },
};

// ============================================================================
// Price History Services
// ============================================================================

export const priceHistoryService = {
  /**
   * Get price history for an asset
   */
  async getPriceHistory(assetId: string, timeRange?: string) {
    let query = supabase
      .from('price_history')
      .select('*')
      .eq('asset_id', assetId)
      .order('timestamp', { ascending: true });

    // Apply time range filter if provided
    if (timeRange) {
      const now = new Date();
      let startDate: Date;

      switch (timeRange) {
        case '1D':
          startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case '1W':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '1M':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case '3M':
          startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        case '1Y':
          startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(0); // ALL
      }

      query = query.gte('timestamp', startDate.toISOString());
    }

    const { data, error } = await query;
    
    if (error) throw error;
    return data;
  },
};

// ============================================================================
// Alert Services
// ============================================================================

export const alertService = {
  /**
   * Get all alerts for the current user
   */
  async getAlerts() {
    const { data, error } = await supabase
      .from('alerts')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  /**
   * Create a new alert
   */
  async createAlert(alertData: {
    asset_id: string;
    alert_type: string;
    condition_value: number;
    is_active: boolean;
  }) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('alerts')
      .insert({
        ...alertData,
        user_id: user.id,
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  /**
   * Update an alert
   */
  async updateAlert(alertId: string, updates: Partial<{
    condition_value: number;
    is_active: boolean;
  }>) {
    const { data, error } = await supabase
      .from('alerts')
      .update(updates)
      .eq('id', alertId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  /**
   * Delete an alert
   */
  async deleteAlert(alertId: string) {
    const { error } = await supabase
      .from('alerts')
      .delete()
      .eq('id', alertId);
    
    if (error) throw error;
  },
};

// ============================================================================
// AI Insights Services
// ============================================================================

export const insightsService = {
  /**
   * Get latest AI insights for the current user
   */
  async getLatestInsights() {
    const { data, error } = await supabase
      .from('ai_insights')
      .select('*')
      .order('generated_at', { ascending: false })
      .limit(1)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        // No insights found
        return null;
      }
      throw error;
    }
    return data;
  },

  /**
   * Get AI insights history
   */
  async getInsightsHistory(limit: number = 10) {
    const { data, error } = await supabase
      .from('ai_insights')
      .select('*')
      .order('generated_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data;
  },
};

// ============================================================================
// AI Chat Services
// ============================================================================

export const chatService = {
  /**
   * Get chat history for the current user
   */
  async getChatHistory(limit: number = 50) {
    const { data, error } = await supabase
      .from('ai_chat_history')
      .select('*')
      .order('timestamp', { ascending: true })
      .limit(limit);
    
    if (error) throw error;
    return data;
  },

  /**
   * Send a chat message and get AI response
   */
  async sendMessage(message: string) {
    const { data, error } = await supabase.functions.invoke('ai-chat-handler', {
      body: { message },
    });
    
    if (error) throw error;
    return data;
  },
};

// ============================================================================
// User Profile Services
// ============================================================================

export const profileService = {
  /**
   * Get user profile
   */
  async getProfile() {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .single();
    
    if (error) throw error;
    return data;
  },

  /**
   * Update user profile
   */
  async updateProfile(updates: Partial<{
    first_name: string;
    last_name: string;
    phone: string;
    currency_preference: string;
    language_preference: string;
    avatar_url: string;
  }>) {
    const { data, error } = await supabase
      .from('user_profiles')
      .update(updates)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  /**
   * Upload avatar image
   */
  async uploadAvatar(uri: string, userId: string) {
    // Convert URI to blob for upload
    const response = await fetch(uri);
    const blob = await response.blob();
    
    const fileExt = uri.split('.').pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, blob);

    if (uploadError) throw uploadError;

    // Get public URL
    const { data } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    return data.publicUrl;
  },

  /**
   * Save push notification token
   * Stores the Expo push token in user_profiles for push notifications
   */
  async savePushToken(token: string) {
    const { data, error } = await supabase
      .from('user_profiles')
      .update({ push_token: token })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },
};

// ============================================================================
// Subscription Services
// ============================================================================

export const subscriptionService = {
  /**
   * Get subscription status
   */
  async getSubscriptionStatus() {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        // No subscription found
        return null;
      }
      throw error;
    }
    return data;
  },

  /**
   * Check if user is premium
   */
  async isPremium(): Promise<boolean> {
    const subscription = await this.getSubscriptionStatus();
    
    if (!subscription) return false;
    
    const now = new Date();
    const expiresAt = new Date(subscription.expires_at);
    
    return subscription.is_active && expiresAt > now;
  },
};

// ============================================================================
// Real-time Subscriptions
// ============================================================================

export const realtimeService = {
  /**
   * Subscribe to price updates for user's assets
   */
  subscribeToPriceUpdates(callback: (payload: any) => void) {
    return supabase
      .channel('price-updates')
      .on('broadcast', { event: 'price-update' }, callback)
      .subscribe();
  },

  /**
   * Unsubscribe from a channel
   */
  async unsubscribe(channel: any) {
    await supabase.removeChannel(channel);
  },
};

// Export all services
export default {
  auth: authService,
  portfolio: portfolioService,
  asset: assetService,
  priceHistory: priceHistoryService,
  alert: alertService,
  insights: insightsService,
  chat: chatService,
  profile: profileService,
  subscription: subscriptionService,
  realtime: realtimeService,
};
