/**
 * Error Handling System Tests
 * Requirements: 3.6, 4.6, 6.4
 */

import { describe, it, expect, vi } from 'vitest';
import {
  ApplicationError,
  ErrorCode,
  ErrorSeverity,
} from '@/types/errors';
import {
  normalizeError,
  getUserFriendlyMessage,
  isRetryableError,
  createErrorFromResponse,
} from '@/lib/utils/error-handler';
import {
  retryWithBackoff,
} from '@/lib/utils/retry-handler';
import {
  createValidationError,
  createUnauthorizedError,
  createNotFoundError,
  createInsufficientDataError,
} from '@/lib/utils/api-error-handler';

describe('ApplicationError', () => {
  it('should create an ApplicationError with all properties', () => {
    const error = new ApplicationError(
      ErrorCode.VALIDATION_ERROR,
      'Validation failed',
      'Please check your input',
      ErrorSeverity.MEDIUM,
      false,
      { field: 'email' }
    );

    expect(error.code).toBe(ErrorCode.VALIDATION_ERROR);
    expect(error.message).toBe('Validation failed');
    expect(error.userMessage).toBe('Please check your input');
    expect(error.severity).toBe(ErrorSeverity.MEDIUM);
    expect(error.retryable).toBe(false);
    expect(error.details).toEqual({ field: 'email' });
    expect(error.timestamp).toBeDefined();
  });

  it('should convert to JSON', () => {
    const error = new ApplicationError(
      ErrorCode.NETWORK_ERROR,
      'Network failed',
      'Please check your connection',
      ErrorSeverity.HIGH,
      true
    );

    const json = error.toJSON();

    expect(json.code).toBe(ErrorCode.NETWORK_ERROR);
    expect(json.message).toBe('Network failed');
    expect(json.userMessage).toBe('Please check your connection');
    expect(json.severity).toBe(ErrorSeverity.HIGH);
    expect(json.retryable).toBe(true);
  });
});

describe('normalizeError', () => {
  it('should return ApplicationError as-is', () => {
    const appError = new ApplicationError(
      ErrorCode.VALIDATION_ERROR,
      'Test error',
      'User message'
    );

    const result = normalizeError(appError);
    expect(result).toBe(appError);
  });

  it('should convert network errors', () => {
    const error = new Error('fetch failed');
    const result = normalizeError(error);

    expect(result.code).toBe(ErrorCode.NETWORK_ERROR);
    expect(result.retryable).toBe(true);
  });

  it('should convert unauthorized errors', () => {
    const error = new Error('unauthorized');
    const result = normalizeError(error);

    expect(result.code).toBe(ErrorCode.UNAUTHORIZED);
    expect(result.retryable).toBe(false);
  });

  it('should convert timeout errors', () => {
    const error = new Error('timeout');
    const result = normalizeError(error);

    expect(result.code).toBe(ErrorCode.API_TIMEOUT);
    expect(result.retryable).toBe(true);
  });

  it('should handle unknown errors', () => {
    const error = new Error('Something went wrong');
    const result = normalizeError(error);

    expect(result.code).toBe(ErrorCode.UNKNOWN_ERROR);
    expect(result.retryable).toBe(true);
  });

  it('should handle non-Error objects', () => {
    const result = normalizeError('string error');

    expect(result.code).toBe(ErrorCode.UNKNOWN_ERROR);
    expect(result.message).toBe('string error');
  });
});

describe('getUserFriendlyMessage', () => {
  it('should return appropriate message for each error code', () => {
    expect(getUserFriendlyMessage(ErrorCode.UNAUTHORIZED)).toContain('session has expired');
    expect(getUserFriendlyMessage(ErrorCode.VALIDATION_ERROR)).toContain('check your input');
    expect(getUserFriendlyMessage(ErrorCode.NETWORK_ERROR)).toContain('connection');
    expect(getUserFriendlyMessage(ErrorCode.INSUFFICIENT_DATA)).toContain('historical data');
  });

  it('should use context when provided', () => {
    const message = getUserFriendlyMessage(ErrorCode.VALIDATION_ERROR, 'Email is invalid');
    expect(message).toBe('Email is invalid');
  });
});

describe('isRetryableError', () => {
  it('should identify retryable errors', () => {
    const retryableError = new ApplicationError(
      ErrorCode.NETWORK_ERROR,
      'Network failed',
      'User message',
      ErrorSeverity.HIGH,
      true
    );

    expect(isRetryableError(retryableError)).toBe(true);
  });

  it('should identify non-retryable errors', () => {
    const nonRetryableError = new ApplicationError(
      ErrorCode.VALIDATION_ERROR,
      'Validation failed',
      'User message',
      ErrorSeverity.MEDIUM,
      false
    );

    expect(isRetryableError(nonRetryableError)).toBe(false);
  });

  it('should check error code for retryability', () => {
    const error = new ApplicationError(
      ErrorCode.API_TIMEOUT,
      'Timeout',
      'User message',
      ErrorSeverity.MEDIUM,
      false // explicitly set to false
    );

    // Should still be retryable based on error code
    expect(isRetryableError(error)).toBe(true);
  });
});

describe('createErrorFromResponse', () => {
  it('should create unauthorized error for 401', () => {
    const error = createErrorFromResponse(401, { error: 'Unauthorized' });
    expect(error.code).toBe(ErrorCode.UNAUTHORIZED);
    expect(error.retryable).toBe(false);
  });

  it('should create not found error for 404', () => {
    const error = createErrorFromResponse(404, { error: 'Not found' });
    expect(error.code).toBe(ErrorCode.RECORD_NOT_FOUND);
    expect(error.retryable).toBe(false);
  });

  it('should create validation error for 422', () => {
    const error = createErrorFromResponse(422, { error: 'Invalid input' });
    expect(error.code).toBe(ErrorCode.VALIDATION_ERROR);
    expect(error.retryable).toBe(false);
  });

  it('should create rate limit error for 429', () => {
    const error = createErrorFromResponse(429, { error: 'Too many requests' });
    expect(error.code).toBe(ErrorCode.API_RATE_LIMIT);
    expect(error.retryable).toBe(true);
  });

  it('should create internal error for 500', () => {
    const error = createErrorFromResponse(500, { error: 'Internal error' });
    expect(error.code).toBe(ErrorCode.INTERNAL_ERROR);
    expect(error.retryable).toBe(true);
  });
});

describe('retryWithBackoff', () => {
  it('should succeed on first attempt', async () => {
    const fn = vi.fn().mockResolvedValue('success');
    const result = await retryWithBackoff(fn);

    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should retry on retryable errors', async () => {
    const fn = vi.fn()
      .mockRejectedValueOnce(new ApplicationError(
        ErrorCode.NETWORK_ERROR,
        'Network failed',
        'User message',
        ErrorSeverity.HIGH,
        true
      ))
      .mockResolvedValue('success');

    const result = await retryWithBackoff(fn, { maxAttempts: 3, delayMs: 10 });

    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('should not retry on non-retryable errors', async () => {
    const error = new ApplicationError(
      ErrorCode.VALIDATION_ERROR,
      'Validation failed',
      'User message',
      ErrorSeverity.MEDIUM,
      false
    );
    const fn = vi.fn().mockRejectedValue(error);

    await expect(retryWithBackoff(fn, { maxAttempts: 3 })).rejects.toThrow(error);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should throw after max attempts', async () => {
    const error = new ApplicationError(
      ErrorCode.NETWORK_ERROR,
      'Network failed',
      'User message',
      ErrorSeverity.HIGH,
      true
    );
    const fn = vi.fn().mockRejectedValue(error);

    await expect(retryWithBackoff(fn, { maxAttempts: 3, delayMs: 10 })).rejects.toThrow(error);
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('should call onRetry callback', async () => {
    const onRetry = vi.fn();
    const fn = vi.fn()
      .mockRejectedValueOnce(new ApplicationError(
        ErrorCode.NETWORK_ERROR,
        'Network failed',
        'User message',
        ErrorSeverity.HIGH,
        true
      ))
      .mockResolvedValue('success');

    await retryWithBackoff(fn, { maxAttempts: 3, delayMs: 10 }, onRetry);

    expect(onRetry).toHaveBeenCalledTimes(1);
    expect(onRetry).toHaveBeenCalledWith(1, expect.any(ApplicationError));
  });
});

describe('Error Helper Functions', () => {
  it('should create validation error', () => {
    const error = createValidationError('email', 'Email is required');

    expect(error.code).toBe(ErrorCode.VALIDATION_ERROR);
    expect(error.userMessage).toBe('Email is required');
    expect(error.details).toEqual({ field: 'email' });
  });

  it('should create unauthorized error', () => {
    const error = createUnauthorizedError();

    expect(error.code).toBe(ErrorCode.UNAUTHORIZED);
    expect(error.userMessage).toContain('session has expired');
  });

  it('should create not found error', () => {
    const error = createNotFoundError('User');

    expect(error.code).toBe(ErrorCode.RECORD_NOT_FOUND);
    expect(error.userMessage).toContain('user');
    expect(error.details).toEqual({ resource: 'User' });
  });

  it('should create insufficient data error', () => {
    const error = createInsufficientDataError(14, 7);

    expect(error.code).toBe(ErrorCode.INSUFFICIENT_DATA);
    expect(error.userMessage).toContain('14 days');
    expect(error.details).toEqual({ minDataPoints: 14, actualDataPoints: 7 });
  });
});
