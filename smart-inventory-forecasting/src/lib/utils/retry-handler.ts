/**
 * Retry mechanism for failed operations
 * Requirements: 3.6, 4.6, 6.4
 */

import { ApplicationError, ErrorCode, RetryConfig } from '@/types/errors';
import { isRetryableError, logError } from './error-handler';

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  delayMs: 1000,
  backoffMultiplier: 2,
  retryableErrors: [
    ErrorCode.NETWORK_ERROR,
    ErrorCode.API_TIMEOUT,
    ErrorCode.API_RATE_LIMIT,
    ErrorCode.INTERNAL_ERROR,
    ErrorCode.DATABASE_ERROR,
    ErrorCode.FORECASTING_SERVICE_ERROR,
  ],
};

/**
 * Retry a function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  config: Partial<RetryConfig> = {},
  onRetry?: (attempt: number, error: ApplicationError) => void
): Promise<T> {
  const finalConfig = { ...DEFAULT_RETRY_CONFIG, ...config };
  let lastError: ApplicationError;

  for (let attempt = 1; attempt <= finalConfig.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      const appError = error instanceof ApplicationError 
        ? error 
        : new ApplicationError(
            ErrorCode.UNKNOWN_ERROR,
            error instanceof Error ? error.message : String(error),
            'An error occurred',
          );

      lastError = appError;

      // Check if error is retryable
      if (!isRetryableError(appError) || attempt === finalConfig.maxAttempts) {
        logError(appError, `Failed after ${attempt} attempts`);
        throw appError;
      }

      // Calculate delay with exponential backoff
      const delay = finalConfig.delayMs * Math.pow(finalConfig.backoffMultiplier, attempt - 1);
      
      logError(appError, `Attempt ${attempt}/${finalConfig.maxAttempts} failed, retrying in ${delay}ms`);
      
      if (onRetry) {
        onRetry(attempt, appError);
      }

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
}

/**
 * Retry a fetch request
 */
export async function retryFetch(
  url: string,
  options?: RequestInit,
  config?: Partial<RetryConfig>
): Promise<Response> {
  return retryWithBackoff(
    async () => {
      const response = await fetch(url, options);
      
      if (!response.ok) {
        throw new ApplicationError(
          response.status === 429 ? ErrorCode.API_RATE_LIMIT :
          response.status >= 500 ? ErrorCode.INTERNAL_ERROR :
          ErrorCode.EXTERNAL_API_ERROR,
          `HTTP ${response.status}: ${response.statusText}`,
          'Request failed',
          undefined,
          response.status >= 500 || response.status === 429
        );
      }
      
      return response;
    },
    config
  );
}

/**
 * Create a retry wrapper for any async function
 */
export function withRetry<T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T,
  config?: Partial<RetryConfig>
): T {
  return (async (...args: Parameters<T>) => {
    return retryWithBackoff(() => fn(...args), config);
  }) as T;
}
