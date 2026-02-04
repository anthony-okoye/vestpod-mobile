/**
 * Error Messages Utility
 * 
 * Maps error codes to user-friendly messages
 * Localization-ready structure for future i18n support
 */

export type ErrorCode = 
  | 'NETWORK_ERROR'
  | 'NETWORK_TIMEOUT'
  | 'NETWORK_OFFLINE'
  | 'AUTH_INVALID_CREDENTIALS'
  | 'AUTH_SESSION_EXPIRED'
  | 'AUTH_UNAUTHORIZED'
  | 'AUTH_EMAIL_NOT_CONFIRMED'
  | 'SERVER_ERROR'
  | 'SERVER_UNAVAILABLE'
  | 'SERVER_MAINTENANCE'
  | 'VALIDATION_ERROR'
  | 'VALIDATION_REQUIRED_FIELD'
  | 'VALIDATION_INVALID_FORMAT'
  | 'NOT_FOUND'
  | 'RATE_LIMITED'
  | 'UNKNOWN_ERROR';

interface ErrorMessage {
  title: string;
  message: string;
  recoverable: boolean;
}

const errorMessages: Record<ErrorCode, ErrorMessage> = {
  // Network errors
  NETWORK_ERROR: {
    title: 'Connection Error',
    message: 'Unable to connect to the server. Please check your internet connection and try again.',
    recoverable: true,
  },
  NETWORK_TIMEOUT: {
    title: 'Request Timeout',
    message: 'The request took too long to complete. Please try again.',
    recoverable: true,
  },
  NETWORK_OFFLINE: {
    title: 'No Internet Connection',
    message: 'You appear to be offline. Please check your connection and try again.',
    recoverable: true,
  },

  // Authentication errors
  AUTH_INVALID_CREDENTIALS: {
    title: 'Invalid Credentials',
    message: 'The email or password you entered is incorrect. Please try again.',
    recoverable: true,
  },
  AUTH_SESSION_EXPIRED: {
    title: 'Session Expired',
    message: 'Your session has expired. Please sign in again.',
    recoverable: true,
  },
  AUTH_UNAUTHORIZED: {
    title: 'Unauthorized',
    message: 'You do not have permission to perform this action.',
    recoverable: false,
  },
  AUTH_EMAIL_NOT_CONFIRMED: {
    title: 'Email Not Confirmed',
    message: 'Please confirm your email address before signing in.',
    recoverable: true,
  },

  // Server errors
  SERVER_ERROR: {
    title: 'Server Error',
    message: 'Something went wrong on our end. Please try again later.',
    recoverable: true,
  },
  SERVER_UNAVAILABLE: {
    title: 'Service Unavailable',
    message: 'Our servers are temporarily unavailable. Please try again in a few minutes.',
    recoverable: true,
  },
  SERVER_MAINTENANCE: {
    title: 'Under Maintenance',
    message: 'We are performing scheduled maintenance. Please try again later.',
    recoverable: false,
  },

  // Validation errors
  VALIDATION_ERROR: {
    title: 'Validation Error',
    message: 'Please check your input and try again.',
    recoverable: true,
  },
  VALIDATION_REQUIRED_FIELD: {
    title: 'Required Field',
    message: 'Please fill in all required fields.',
    recoverable: true,
  },
  VALIDATION_INVALID_FORMAT: {
    title: 'Invalid Format',
    message: 'Please check the format of your input.',
    recoverable: true,
  },

  // Other errors
  NOT_FOUND: {
    title: 'Not Found',
    message: 'The requested resource could not be found.',
    recoverable: false,
  },
  RATE_LIMITED: {
    title: 'Too Many Requests',
    message: 'You have made too many requests. Please wait a moment and try again.',
    recoverable: true,
  },
  UNKNOWN_ERROR: {
    title: 'Something Went Wrong',
    message: 'An unexpected error occurred. Please try again.',
    recoverable: true,
  },
};

/**
 * Get user-friendly error message for an error code
 */
export function getErrorMessage(code: ErrorCode): ErrorMessage {
  return errorMessages[code] || errorMessages.UNKNOWN_ERROR;
}

/**
 * Map Supabase/API error to error code
 */
export function mapErrorToCode(error: any): ErrorCode {
  if (!error) return 'UNKNOWN_ERROR';

  // Network errors
  if (error.message?.includes('Network request failed') || 
      error.message?.includes('fetch failed') ||
      error.code === 'NETWORK_ERROR') {
    return 'NETWORK_ERROR';
  }

  if (error.message?.includes('timeout') || error.code === 'TIMEOUT') {
    return 'NETWORK_TIMEOUT';
  }

  // Supabase auth errors
  if (error.message?.includes('Invalid login credentials')) {
    return 'AUTH_INVALID_CREDENTIALS';
  }

  if (error.message?.includes('JWT expired') || 
      error.message?.includes('session_expired') ||
      error.code === 'PGRST301') {
    return 'AUTH_SESSION_EXPIRED';
  }

  if (error.message?.includes('Email not confirmed')) {
    return 'AUTH_EMAIL_NOT_CONFIRMED';
  }

  if (error.status === 401 || error.code === 'PGRST301') {
    return 'AUTH_UNAUTHORIZED';
  }

  // Server errors
  if (error.status === 500 || error.code === 'PGRST500') {
    return 'SERVER_ERROR';
  }

  if (error.status === 503) {
    return 'SERVER_UNAVAILABLE';
  }

  // Not found
  if (error.status === 404 || error.code === 'PGRST116') {
    return 'NOT_FOUND';
  }

  // Rate limiting
  if (error.status === 429) {
    return 'RATE_LIMITED';
  }

  // Validation errors
  if (error.status === 400 || error.status === 422) {
    return 'VALIDATION_ERROR';
  }

  return 'UNKNOWN_ERROR';
}

/**
 * Check if error is a network-related error
 */
export function isNetworkError(code: ErrorCode): boolean {
  return code === 'NETWORK_ERROR' || 
         code === 'NETWORK_TIMEOUT' || 
         code === 'NETWORK_OFFLINE';
}

/**
 * Check if error is an authentication error
 */
export function isAuthError(code: ErrorCode): boolean {
  return code.startsWith('AUTH_');
}

/**
 * Check if error is recoverable (user can retry)
 */
export function isRecoverableError(code: ErrorCode): boolean {
  return getErrorMessage(code).recoverable;
}

export default {
  getErrorMessage,
  mapErrorToCode,
  isNetworkError,
  isAuthError,
  isRecoverableError,
};
