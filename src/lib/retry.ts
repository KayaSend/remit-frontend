import { shouldRetry } from './error-handler';

// ─── Retry Configuration ─────────────────────────────────────────────────────

export interface RetryConfig {
  /** Maximum number of retry attempts (default: 3) */
  maxRetries?: number;
  /** Initial delay in ms (default: 1000) */
  initialDelay?: number;
  /** Maximum delay in ms (default: 10000) */
  maxDelay?: number;
  /** Backoff multiplier (default: 2 for exponential backoff) */
  backoffMultiplier?: number;
  /** Add random jitter to prevent thundering herd (default: true) */
  jitter?: boolean;
  /** Custom function to determine if error is retryable (overrides default) */
  shouldRetry?: (error: unknown) => boolean;
  /** Callback before each retry attempt */
  onRetry?: (attempt: number, delay: number, error: unknown) => void;
}

const DEFAULT_CONFIG: Required<RetryConfig> = {
  maxRetries: 3,
  initialDelay: 1000,
  maxDelay: 10000,
  backoffMultiplier: 2,
  jitter: true,
  shouldRetry: shouldRetry,
  onRetry: () => {},
};

// ─── Retry with Exponential Backoff ──────────────────────────────────────────

/**
 * Retry a function with exponential backoff.
 * 
 * @param fn - Async function to retry
 * @param config - Retry configuration
 * @returns Promise that resolves with the function result or rejects with the last error
 * 
 * @example
 * ```ts
 * const data = await retryWithBackoff(
 *   () => apiGet('/endpoint'),
 *   { maxRetries: 3, initialDelay: 1000 }
 * );
 * ```
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  config: RetryConfig = {}
): Promise<T> {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  let lastError: unknown;

  for (let attempt = 0; attempt <= cfg.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // If this was the last attempt or error is not retryable, throw
      if (attempt === cfg.maxRetries || !cfg.shouldRetry(error)) {
        throw error;
      }

      // Calculate delay with exponential backoff
      const baseDelay = cfg.initialDelay * Math.pow(cfg.backoffMultiplier, attempt);
      const delay = Math.min(baseDelay, cfg.maxDelay);
      
      // Add jitter if enabled (random value between 0 and delay)
      const finalDelay = cfg.jitter
        ? delay * (0.5 + Math.random() * 0.5)
        : delay;

      // Call retry callback
      cfg.onRetry(attempt + 1, finalDelay, error);

      // Wait before retrying
      await sleep(finalDelay);
    }
  }

  // This should never be reached, but TypeScript needs it
  throw lastError;
}

// ─── Polling with Retry ──────────────────────────────────────────────────────

export interface PollingConfig<T> {
  /** Function to check if polling should continue (return false to stop) */
  shouldContinue: (data: T) => boolean;
  /** Polling interval in ms (default: 3000) */
  interval?: number;
  /** Maximum polling duration in ms (default: 5 minutes) */
  maxDuration?: number;
  /** Retry config for individual poll attempts */
  retryConfig?: RetryConfig;
  /** Callback on each successful poll */
  onPoll?: (data: T, attempt: number) => void;
  /** Callback when polling times out */
  onTimeout?: () => void;
}

/**
 * Poll an endpoint with retry logic for failed attempts.
 * 
 * @param fn - Async function to poll
 * @param config - Polling configuration
 * @returns Promise that resolves when shouldContinue returns false or rejects on timeout/error
 * 
 * @example
 * ```ts
 * const result = await pollWithRetry(
 *   () => getStatus(txCode),
 *   {
 *     shouldContinue: (status) => status !== 'completed',
 *     interval: 3000,
 *     maxDuration: 300000, // 5 minutes
 *   }
 * );
 * ```
 */
export async function pollWithRetry<T>(
  fn: () => Promise<T>,
  config: PollingConfig<T>
): Promise<T> {
  const {
    shouldContinue,
    interval = 3000,
    maxDuration = 300000, // 5 minutes
    retryConfig = {},
    onPoll,
    onTimeout,
  } = config;

  const startTime = Date.now();
  let attempt = 0;
  let lastResult: T | undefined;

  while (true) {
    // Check if we've exceeded max duration
    if (Date.now() - startTime > maxDuration) {
      onTimeout?.();
      throw new Error('Polling timed out');
    }

    try {
      // Poll with retry logic
      const result = await retryWithBackoff(fn, {
        maxRetries: 2, // Fewer retries for polling
        initialDelay: 500,
        ...retryConfig,
      });

      lastResult = result;
      attempt++;
      onPoll?.(result, attempt);

      // Check if we should continue polling
      if (!shouldContinue(result)) {
        return result;
      }

      // Wait before next poll
      await sleep(interval);
    } catch (error) {
      // If the error is not retryable at the poll level, throw
      const isRetryable = retryConfig.shouldRetry
        ? retryConfig.shouldRetry(error)
        : shouldRetry(error);

      if (!isRetryable) {
        throw error;
      }

      // Wait before retrying the entire poll
      await sleep(interval);
    }
  }
}

// ─── Debounced Retry ─────────────────────────────────────────────────────────

/**
 * Create a debounced retry function that prevents multiple simultaneous retries.
 * Useful for user-triggered retry buttons.
 * 
 * @param fn - Async function to retry
 * @param config - Retry configuration
 * @returns Debounced retry function
 * 
 * @example
 * ```ts
 * const debouncedRetry = createDebouncedRetry(
 *   () => submitPayment(data),
 *   { maxRetries: 3 }
 * );
 * 
 * // In component:
 * <button onClick={() => debouncedRetry()}>Retry</button>
 * ```
 */
export function createDebouncedRetry<T>(
  fn: () => Promise<T>,
  config: RetryConfig = {}
): () => Promise<T> {
  let pending: Promise<T> | null = null;

  return async () => {
    // If already retrying, return the pending promise
    if (pending) {
      return pending;
    }

    try {
      pending = retryWithBackoff(fn, config);
      return await pending;
    } finally {
      pending = null;
    }
  };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ─── Retry State Hook Helper ─────────────────────────────────────────────────

export interface RetryState {
  isRetrying: boolean;
  retryCount: number;
  lastError: unknown | null;
}

/**
 * Helper to create retry state object for components.
 */
export function createRetryState(): RetryState {
  return {
    isRetrying: false,
    retryCount: 0,
    lastError: null,
  };
}
