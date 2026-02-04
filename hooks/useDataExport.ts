/**
 * Data Export Hook
 * 
 * Manages portfolio data export state and operations
 * Requirements: Task 65 - Data Export
 */

import { useState, useCallback } from 'react';
import { Share, Platform } from 'react-native';
import * as Linking from 'expo-linking';
import { supabase } from '@/services/supabase';

// ============================================================================
// Types
// ============================================================================

export type ExportFormat = 'csv' | 'json' | 'pdf';

interface ExportResponse {
  success: boolean;
  export?: {
    format: ExportFormat;
    filename: string;
    downloadUrl: string;
    generatedAt: string;
    portfolioCount: number;
    totalAssets: number;
  };
  error?: string;
}

interface UseDataExportReturn {
  /** Loading state during export */
  isLoading: boolean;
  /** Error message if export failed */
  error: string | null;
  /** Success state after export */
  success: boolean;
  /** Export data in specified format */
  exportData: (format: ExportFormat) => Promise<boolean>;
  /** Reset state */
  reset: () => void;
}

// ============================================================================
// Hook Implementation
// ============================================================================

export function useDataExport(): UseDataExportReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  /**
   * Reset hook state
   */
  const reset = useCallback(() => {
    setIsLoading(false);
    setError(null);
    setSuccess(false);
  }, []);

  /**
   * Export portfolio data in specified format
   */
  const exportData = useCallback(async (format: ExportFormat): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Call data-export Edge Function
      const { data, error: functionError } = await supabase.functions.invoke<ExportResponse>(
        'data-export',
        {
          body: { format },
        }
      );

      if (functionError) {
        throw new Error(functionError.message || 'Export failed');
      }

      if (!data?.success || !data.export?.downloadUrl) {
        throw new Error(data?.error || 'Failed to generate export');
      }

      const { downloadUrl, filename } = data.export;

      // Share/download the file
      if (Platform.OS === 'web') {
        // On web, open in new tab
        window.open(downloadUrl, '_blank');
      } else {
        // On mobile, use Share API
        const shareResult = await Share.share({
          url: downloadUrl,
          title: filename,
          message: `Portfolio Export: ${filename}`,
        });

        // If share was dismissed, still open the URL
        if (shareResult.action === Share.dismissedAction) {
          await Linking.openURL(downloadUrl);
        }
      }

      setSuccess(true);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Export failed';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    error,
    success,
    exportData,
    reset,
  };
}

export default useDataExport;
