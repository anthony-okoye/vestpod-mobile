/**
 * Sync Service
 * 
 * Handles data synchronization between local cache and server.
 * Processes offline queue, fetches latest data, and handles conflict resolution.
 * 
 * Requirements: Requirement 13 - Offline Mode (Data Sync)
 */

import { offlineStorage, OfflineChange } from './offlineStorage';
import { portfolioService, assetService, profileService } from './api';

// ============================================================================
// Types
// ============================================================================

export type SyncStatus = 'success' | 'partial' | 'failed';

export interface SyncResult {
  status: SyncStatus;
  syncedChanges: number;
  failedChanges: number;
  errors: SyncError[];
}

export interface SyncError {
  changeId: string;
  type: string;
  message: string;
  retryCount: number;
}

export interface ProcessQueueResult {
  processed: number;
  failed: number;
  errors: SyncError[];
}

const MAX_RETRY_ATTEMPTS = 3;

// ============================================================================
// Queue Processing
// ============================================================================

/**
 * Process a single offline change
 * Returns true if successful, false if failed
 */
async function processChange(change: OfflineChange): Promise<boolean> {
  const { type, payload } = change;

  try {
    switch (type) {
      case 'CREATE_PORTFOLIO': {
        await portfolioService.createPortfolio(payload.name as string);
        return true;
      }

      case 'UPDATE_PORTFOLIO': {
        await portfolioService.updatePortfolio(
          payload.portfolioId as string,
          payload.name as string
        );
        return true;
      }

      case 'DELETE_PORTFOLIO': {
        await portfolioService.deletePortfolio(payload.portfolioId as string);
        return true;
      }

      case 'CREATE_ASSET': {
        await assetService.createAsset({
          portfolio_id: payload.portfolio_id as string,
          asset_type: payload.asset_type as string,
          symbol: payload.symbol as string | undefined,
          name: payload.name as string,
          quantity: payload.quantity as number,
          purchase_price: payload.purchase_price as number,
          purchase_date: payload.purchase_date as string,
          current_price: payload.current_price as number | undefined,
          metadata: payload.metadata as Record<string, unknown> | undefined,
        });
        return true;
      }

      case 'UPDATE_ASSET': {
        await assetService.updateAsset(payload.assetId as string, {
          name: payload.name as string | undefined,
          quantity: payload.quantity as number | undefined,
          purchase_price: payload.purchase_price as number | undefined,
          purchase_date: payload.purchase_date as string | undefined,
          current_price: payload.current_price as number | undefined,
          metadata: payload.metadata as Record<string, unknown> | undefined,
        });
        return true;
      }

      case 'DELETE_ASSET': {
        await assetService.deleteAsset(payload.assetId as string);
        return true;
      }

      case 'UPDATE_PROFILE': {
        await profileService.updateProfile({
          first_name: payload.first_name as string | undefined,
          last_name: payload.last_name as string | undefined,
          phone: payload.phone as string | undefined,
          currency_preference: payload.currency_preference as string | undefined,
          language_preference: payload.language_preference as string | undefined,
          avatar_url: payload.avatar_url as string | undefined,
        });
        return true;
      }

      default:
        console.warn(`Unknown change type: ${type}`);
        return false;
    }
  } catch (error) {
    console.error(`Failed to process change ${change.id}:`, error);
    return false;
  }
}

/**
 * Process all pending changes in the offline queue
 * Implements retry logic with max 3 attempts
 */
export async function processOfflineQueue(): Promise<ProcessQueueResult> {
  const queue = await offlineStorage.getOfflineQueue();
  const errors: SyncError[] = [];
  let processed = 0;
  let failed = 0;

  for (const change of queue) {
    // Skip changes that have exceeded max retries
    if (change.retryCount >= MAX_RETRY_ATTEMPTS) {
      failed++;
      errors.push({
        changeId: change.id,
        type: change.type,
        message: 'Max retry attempts exceeded',
        retryCount: change.retryCount,
      });
      continue;
    }

    const success = await processChange(change);

    if (success) {
      await offlineStorage.removeFromQueue(change.id);
      processed++;
    } else {
      const newRetryCount = await offlineStorage.incrementRetryCount(change.id);
      
      if (newRetryCount >= MAX_RETRY_ATTEMPTS) {
        failed++;
        errors.push({
          changeId: change.id,
          type: change.type,
          message: 'Failed after maximum retry attempts',
          retryCount: newRetryCount,
        });
      }
    }
  }

  // Remove failed changes from queue
  await offlineStorage.removeFailedChanges(MAX_RETRY_ATTEMPTS);

  return { processed, failed, errors };
}

// ============================================================================
// Data Sync Functions
// ============================================================================

/**
 * Sync portfolios from server to local cache
 * Server data takes priority (conflict resolution)
 */
export async function syncPortfolios(): Promise<boolean> {
  try {
    const portfolios = await portfolioService.getPortfolios();
    
    if (portfolios) {
      await offlineStorage.cachePortfolios(portfolios);
    }
    
    return true;
  } catch (error) {
    console.error('Failed to sync portfolios:', error);
    return false;
  }
}

/**
 * Sync assets for all portfolios from server to local cache
 * Server data takes priority (conflict resolution)
 */
export async function syncAssets(): Promise<boolean> {
  try {
    let portfolios = await offlineStorage.getCachedPortfolios();
    
    if (!portfolios || portfolios.length === 0) {
      // Try to fetch portfolios first
      const fetchedPortfolios = await portfolioService.getPortfolios();
      if (!fetchedPortfolios || fetchedPortfolios.length === 0) {
        return true; // No portfolios to sync assets for
      }
      await offlineStorage.cachePortfolios(fetchedPortfolios);
      portfolios = fetchedPortfolios;
    }

    const cachedPortfolios = portfolios || [];
    
    // Sync assets for each portfolio
    for (const portfolio of cachedPortfolios) {
      try {
        const assets = await assetService.getAssets(portfolio.id);
        if (assets) {
          await offlineStorage.cacheAssets(portfolio.id, assets);
        }
      } catch (error) {
        console.error(`Failed to sync assets for portfolio ${portfolio.id}:`, error);
        // Continue with other portfolios
      }
    }
    
    return true;
  } catch (error) {
    console.error('Failed to sync assets:', error);
    return false;
  }
}

/**
 * Sync user profile from server to local cache
 * Server data takes priority (conflict resolution)
 */
export async function syncUserProfile(): Promise<boolean> {
  try {
    const profile = await profileService.getProfile();
    
    if (profile) {
      await offlineStorage.cacheUserProfile(profile);
    }
    
    return true;
  } catch (error) {
    console.error('Failed to sync user profile:', error);
    return false;
  }
}

// ============================================================================
// Full Sync
// ============================================================================

/**
 * Perform a full sync of all data types
 * 1. Process offline queue first (push local changes)
 * 2. Fetch latest data from server (pull server data)
 * 
 * Returns sync status and details
 */
export async function fullSync(): Promise<SyncResult> {
  const errors: SyncError[] = [];
  let syncedChanges = 0;
  let failedChanges = 0;

  // Step 1: Process offline queue (push local changes)
  const queueResult = await processOfflineQueue();
  syncedChanges += queueResult.processed;
  failedChanges += queueResult.failed;
  errors.push(...queueResult.errors);

  // Step 2: Sync data from server (pull latest data)
  const syncResults = await Promise.all([
    syncPortfolios(),
    syncAssets(),
    syncUserProfile(),
  ]);

  const allSyncsSuccessful = syncResults.every((result) => result === true);
  const someSyncsSuccessful = syncResults.some((result) => result === true);

  // Determine overall status
  let status: SyncStatus;
  
  if (failedChanges === 0 && allSyncsSuccessful) {
    status = 'success';
  } else if (someSyncsSuccessful || syncedChanges > 0) {
    status = 'partial';
  } else {
    status = 'failed';
  }

  return {
    status,
    syncedChanges,
    failedChanges,
    errors,
  };
}

// ============================================================================
// Sync Service Export
// ============================================================================

export const syncService = {
  processOfflineQueue,
  syncPortfolios,
  syncAssets,
  syncUserProfile,
  fullSync,
  MAX_RETRY_ATTEMPTS,
};

export default syncService;
