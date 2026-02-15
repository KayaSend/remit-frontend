import { toast } from 'sonner';
import { ApiError, clearAuthToken } from '@/services/api';

// ─── Error Categories ────────────────────────────────────────────────────────

export enum ErrorCategory {
  /** User input validation errors (400) - not retryable */
  VALIDATION = 'validation',
  /** Authentication errors (401) - requires re-login */
  AUTH = 'auth',
  /** Not found errors (404) - not retryable */
  NOT_FOUND = 'not_found',
  /** Rate limiting (429) - retryable with backoff */
  RATE_LIMIT = 'rate_limit',
  /** Server errors (500, 502, 503, 504) - retryable */
  SERVER = 'server',
  /** Network/timeout errors (408, network failure) - retryable */
  NETWORK = 'network',
  /** Processing/queued (202) - not an error, needs polling */
  PROCESSING = 'processing',
  /** Unknown errors - may be retryable */
  UNKNOWN = 'unknown',
}

export interface ErrorInfo {
  category: ErrorCategory;
  message: string;
  userMessage: string;
  isRetryable: boolean;
  shouldRedirect: boolean;
  redirectPath?: string;
}

// ─── Error Categorization ────────────────────────────────────────────────────

/**
 * Categorize an error and extract useful information for handling.
 */
export function categorizeError(error: unknown): ErrorInfo {
  // Handle ApiError instances
  if (error instanceof ApiError) {
    return categorizeApiError(error);
  }

  // Handle standard Error instances
  if (error instanceof Error) {
    return {
      category: ErrorCategory.UNKNOWN,
      message: error.message,
      userMessage: error.message || 'An unexpected error occurred',
      isRetryable: false,
      shouldRedirect: false,
    };
  }

  // Handle string errors
  if (typeof error === 'string') {
    return {
      category: ErrorCategory.UNKNOWN,
      message: error,
      userMessage: error,
      isRetryable: false,
      shouldRedirect: false,
    };
  }

  // Fallback for unknown error types
  return {
    category: ErrorCategory.UNKNOWN,
    message: 'Unknown error',
    userMessage: 'An unexpected error occurred. Please try again.',
    isRetryable: false,
    shouldRedirect: false,
  };
}

function categorizeApiError(error: ApiError): ErrorInfo {
  const status = error.status;
  const message = error.message;

  // 202 - Processing (not an error)
  if (status === 202) {
    return {
      category: ErrorCategory.PROCESSING,
      message: 'Request is being processed',
      userMessage: 'Your request is being processed. Please wait...',
      isRetryable: false,
      shouldRedirect: false,
    };
  }

  // 400 - Validation Error
  if (status === 400) {
    return {
      category: ErrorCategory.VALIDATION,
      message,
      userMessage: getUserFriendlyMessage(message, 'Please check your input and try again.'),
      isRetryable: false,
      shouldRedirect: false,
    };
  }

  // 401 - Unauthorized
  if (status === 401) {
    return {
      category: ErrorCategory.AUTH,
      message,
      userMessage: 'Your session has expired. Please log in again.',
      isRetryable: false,
      shouldRedirect: true,
      redirectPath: '/recipient/login',
    };
  }

  // 404 - Not Found
  if (status === 404) {
    return {
      category: ErrorCategory.NOT_FOUND,
      message,
      userMessage: getUserFriendlyMessage(message, 'The requested resource was not found.'),
      isRetryable: false,
      shouldRedirect: false,
    };
  }

  // 408 - Request Timeout
  if (status === 408) {
    return {
      category: ErrorCategory.NETWORK,
      message,
      userMessage: 'Request timed out. Please check your connection and try again.',
      isRetryable: true,
      shouldRedirect: false,
    };
  }

  // 429 - Rate Limit
  if (status === 429) {
    return {
      category: ErrorCategory.RATE_LIMIT,
      message,
      userMessage: 'Too many requests. Please wait a moment and try again.',
      isRetryable: true,
      shouldRedirect: false,
    };
  }

  // 503 - Service Unavailable
  if (status === 503) {
    return {
      category: ErrorCategory.SERVER,
      message,
      userMessage: 'Service is temporarily unavailable. Please try again in a few seconds.',
      isRetryable: true,
      shouldRedirect: false,
    };
  }

  // 500, 502, 504 - Server Errors
  if (status >= 500 && status < 600) {
    return {
      category: ErrorCategory.SERVER,
      message,
      userMessage: 'A server error occurred. Please try again later.',
      isRetryable: true,
      shouldRedirect: false,
    };
  }

  // Other errors
  return {
    category: ErrorCategory.UNKNOWN,
    message,
    userMessage: getUserFriendlyMessage(message, 'An error occurred. Please try again.'),
    isRetryable: false,
    shouldRedirect: false,
  };
}

// ─── User-Friendly Message Translation ──────────────────────────────────────

/**
 * Convert technical error messages to user-friendly ones.
 */
function getUserFriendlyMessage(technicalMessage: string, fallback: string): string {
  const msg = technicalMessage.toLowerCase();

  // Common error patterns
  if (msg.includes('network') || msg.includes('fetch')) {
    return 'Network error. Please check your connection.';
  }
  if (msg.includes('timeout')) {
    return 'Request timed out. Please try again.';
  }
  if (msg.includes('invalid') && msg.includes('phone')) {
    return 'Please enter a valid phone number.';
  }
  if (msg.includes('insufficient') && msg.includes('balance')) {
    return 'Insufficient balance for this transaction.';
  }
  if (msg.includes('not found')) {
    return 'The requested item was not found.';
  }
  if (msg.includes('already exists')) {
    return 'This item already exists.';
  }
  if (msg.includes('unauthorized') || msg.includes('forbidden')) {
    return 'You do not have permission to perform this action.';
  }

  // If the message is already user-friendly (no technical jargon), return it
  if (!msg.includes('error') && !msg.includes('failed') && technicalMessage.length < 100) {
    return technicalMessage;
  }

  return fallback;
}

// ─── Global Error Handler ────────────────────────────────────────────────────

export interface HandleErrorOptions {
  /** Show a toast notification (default: true) */
  showToast?: boolean;
  /** Custom user-facing message to override the default */
  customMessage?: string;
  /** Callback for redirects (provide navigate function from react-router) */
  onRedirect?: (path: string) => void;
  /** Context for logging (e.g., "CreateRemittance", "RequestPayment") */
  context?: string;
}

/**
 * Centralized error handler for all API errors.
 * 
 * Handles:
 * - 202: Returns info without showing error (processing state)
 * - 400: Shows validation error toast (not retryable)
 * - 401: Clears token, shows toast, redirects to login
 * - 503: Shows retry toast (retryable)
 * - Other errors: Shows appropriate toast based on category
 * 
 * @returns ErrorInfo for caller to handle specific cases
 */
export function handleApiError(
  error: unknown,
  options: HandleErrorOptions = {}
): ErrorInfo {
  const {
    showToast = true,
    customMessage,
    onRedirect,
    context,
  } = options;

  const errorInfo = categorizeError(error);

  // Log error for debugging (with context if provided)
  const logPrefix = context ? `[${context}]` : '[Error]';
  console.error(logPrefix, {
    category: errorInfo.category,
    message: errorInfo.message,
    status: error instanceof ApiError ? error.status : undefined,
  });

  // Handle 202 (processing) - not an error, just return info
  if (errorInfo.category === ErrorCategory.PROCESSING) {
    return errorInfo;
  }

  // Handle 401 - clear token and redirect
  if (errorInfo.category === ErrorCategory.AUTH) {
    clearAuthToken();
    if (showToast) {
      toast.error(customMessage || errorInfo.userMessage);
    }
    if (onRedirect && errorInfo.redirectPath) {
      onRedirect(errorInfo.redirectPath);
    }
    return errorInfo;
  }

  // Show toast for all other errors
  if (showToast) {
    const message = customMessage || errorInfo.userMessage;
    
    if (errorInfo.isRetryable) {
      toast.error(message, {
        description: 'Please try again',
        duration: 5000,
      });
    } else {
      toast.error(message);
    }
  }

  return errorInfo;
}

// ─── Retry Helper ────────────────────────────────────────────────────────────

/**
 * Check if an error should trigger a retry.
 */
export function shouldRetry(error: unknown): boolean {
  const errorInfo = categorizeError(error);
  return errorInfo.isRetryable;
}

/**
 * Check if an error requires user to re-authenticate.
 */
export function requiresAuth(error: unknown): boolean {
  const errorInfo = categorizeError(error);
  return errorInfo.category === ErrorCategory.AUTH;
}

/**
 * Check if an error is a processing status (202).
 */
export function isProcessing(error: unknown): boolean {
  if (error instanceof ApiError) {
    return error.status === 202;
  }
  return false;
}
