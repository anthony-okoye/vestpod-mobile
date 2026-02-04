/**
 * useErrorHandler Hook
 * 
 * Centralized error handling logic with user-friendly message mapping.
 * Provides error state management, automatic clearing, and recovery functions.
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import {
  getErrorMessage,
  mapErrorToCode,
  isNetworkError,
  isAuthError,
  isRecoverableError,
  ErrorCode,
} from '../utils/errorMessages';

export interface ErrorState {
  /** Whether an error is currently active */
  hasError: boolean;
  /** The error code */
  code: ErrorCode | null;
  /** User-friendly error title */
  title: string;
  /** User-friendly error message */
  message: string;
  /** Whether the error is recoverable (user can retry) */
  recoverable: boolean;
  /** Whether this is a network-related error */
  isNetwork: boolean;
  /** Whether this is an authentication error */
  isAuth: boolean;
  /** The original error object */
  originalError: Error | null;
}

export interface UseErrorHandlerOptions {
  /** Auto-clear error after timeout (ms). Set to 0 to disable. Default: 0 */
  autoClearTimeout?: number;
  /** Callback when error is handled */
  onError?: (error: Error, code: ErrorCode) => void;
  /** Callback when error is cleared */
  onClear?: () => void;
}

export interface UseErrorHandlerReturn {
  /** Current error state */
  error: ErrorState;
  /** Handle an error - maps to user-friendly message */
  handleError: (error: unknown) => void;
  /** Clear the current error */
  clearError: () => void;
  /** Set a specific error code directly */
  setErrorCode: (code: ErrorCode) => void;
  /** Check if there's an active error */
  hasError: boolean;
}

const initialErrorState: ErrorState = {
  hasError: false,
  code: null,
  title: '',
  message: '',
  recoverable: false,
  isNetwork: false,
  isAuth: false,
  originalError: null,
};

/**
 * Hook for centralized error handling with user-friendly messages
 */
export function useErrorHandler(options: UseErrorHandlerOptions = {}): UseErrorHandlerReturn {
  const { autoClearTimeout = 0, onError, onClear } = options;
  
  const [error, setError] = useState<ErrorState>(initialErrorState);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const clearError = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    setError(initialErrorState);
    onClear?.();
  }, [onClear]);

  const handleError = useCallback((rawError: unknown) => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    // Normalize error
    const normalizedError = rawError instanceof Error 
      ? rawError 
      : new Error(String(rawError));

    // Map to error code
    const code = mapErrorToCode(rawError);
    const errorMessage = getErrorMessage(code);

    // Log for debugging
    console.error('[useErrorHandler] Error:', normalizedError.message);
    console.error('[useErrorHandler] Mapped to code:', code);

    const newErrorState: ErrorState = {
      hasError: true,
      code,
      title: errorMessage.title,
      message: errorMessage.message,
      recoverable: errorMessage.recoverable,
      isNetwork: isNetworkError(code),
      isAuth: isAuthError(code),
      originalError: normalizedError,
    };

    setError(newErrorState);
    onError?.(normalizedError, code);

    // Set auto-clear timeout if configured
    if (autoClearTimeout > 0) {
      timeoutRef.current = setTimeout(() => {
        clearError();
      }, autoClearTimeout);
    }
  }, [autoClearTimeout, onError, clearError]);

  const setErrorCode = useCallback((code: ErrorCode) => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    const errorMessage = getErrorMessage(code);

    const newErrorState: ErrorState = {
      hasError: true,
      code,
      title: errorMessage.title,
      message: errorMessage.message,
      recoverable: errorMessage.recoverable,
      isNetwork: isNetworkError(code),
      isAuth: isAuthError(code),
      originalError: null,
    };

    setError(newErrorState);

    // Set auto-clear timeout if configured
    if (autoClearTimeout > 0) {
      timeoutRef.current = setTimeout(() => {
        clearError();
      }, autoClearTimeout);
    }
  }, [autoClearTimeout, clearError]);

  return {
    error,
    handleError,
    clearError,
    setErrorCode,
    hasError: error.hasError,
  };
}

export default useErrorHandler;
