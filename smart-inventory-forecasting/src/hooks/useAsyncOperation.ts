'use client';

/**
 * Hook for handling async operations with loading and error states
 * Requirements: 3.6, 4.6, 6.4
 */

import { useState, useCallback } from 'react';
import { ApplicationError } from '@/types/errors';
import { normalizeError } from '@/lib/utils/error-handler';
import { retryWithBackoff } from '@/lib/utils/retry-handler';

interface AsyncOperationState<T> {
  data: T | null;
  loading: boolean;
  error: ApplicationError | null;
}

interface UseAsyncOperationOptions<T = unknown> {
  onSuccess?: (data: T) => void;
  onError?: (error: ApplicationError) => void;
  retry?: boolean;
  retryAttempts?: number;
}

export function useAsyncOperation<T = unknown>(
  options: UseAsyncOperationOptions<T> = {}
) {
  const [state, setState] = useState<AsyncOperationState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(
    async (operation: () => Promise<T>) => {
      setState({ data: null, loading: true, error: null });

      try {
        let result: T;

        if (options.retry) {
          result = await retryWithBackoff(
            operation,
            { maxAttempts: options.retryAttempts || 3 }
          );
        } else {
          result = await operation();
        }

        setState({ data: result, loading: false, error: null });
        
        if (options.onSuccess) {
          options.onSuccess(result);
        }

        return result;
      } catch (error) {
        const appError = normalizeError(error);
        setState({ data: null, loading: false, error: appError });
        
        if (options.onError) {
          options.onError(appError);
        }

        throw appError;
      }
    },
    [options]
  );

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
}
