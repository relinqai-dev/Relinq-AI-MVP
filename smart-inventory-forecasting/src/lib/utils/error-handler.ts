/**
 * Error handling utilities
 * Requirements: 3.6, 4.6, 6.4
 */

import { ApplicationError, ErrorCode, ErrorSeverity } from '@/types/errors';

/**
 * Convert unknown errors to ApplicationError
 */
export function normalizeError(error: unknown): ApplicationError {
  if (error instanceof ApplicationError) {
    return error;
  }

  if (error instanceof Error) {
    // Check for specific error patterns
    if (error.message.includes('fetch failed') || error.message.includes('network')) {
      return new ApplicationError(
        ErrorCode.NETWORK_ERROR,
        error.message,
        'Network connection failed. Please check your internet connection and try again.',
        ErrorSeverity.HIGH,
        true
      );
    }

    if (error.message.includes('unauthorized') || error.message.includes('401')) {
      return new ApplicationError(
        ErrorCode.UNAUTHORIZED,
        error.message,
        'Your session has expired. Please log in again.',
        ErrorSeverity.HIGH,
        false
      );
    }

    if (error.message.includes('timeout')) {
      return new ApplicationError(
        ErrorCode.API_TIMEOUT,
        error.message,
        'The request took too long. Please try again.',
        ErrorSeverity.MEDIUM,
        true
      );
    }

    return new ApplicationError(
      ErrorCode.UNKNOWN_ERROR,
      error.message,
      'An unexpected error occurred. Please try again.',
      ErrorSeverity.MEDIUM,
      true
    );
  }

  return new ApplicationError(
    ErrorCode.UNKNOWN_ERROR,
    String(error),
    'An unexpected error occurred. Please try again.',
    ErrorSeverity.MEDIUM,
    true
  );
}

/**
 * Get user-friendly error message based on error code
 */
export function getUserFriendlyMessage(code: ErrorCode, context?: string): string {
  const messages: Record<ErrorCode, string> = {
    [ErrorCode.UNAUTHORIZED]: 'Your session has expired. Please log in again.',
    [ErrorCode.FORBIDDEN]: 'You do not have permission to perform this action.',
    [ErrorCode.SESSION_EXPIRED]: 'Your session has expired. Please log in again.',
    
    [ErrorCode.VALIDATION_ERROR]: context || 'Please check your input and try again.',
    [ErrorCode.INVALID_INPUT]: context || 'The information provided is invalid.',
    [ErrorCode.MISSING_REQUIRED_FIELD]: context || 'Please fill in all required fields.',
    
    [ErrorCode.DATABASE_ERROR]: 'A database error occurred. Please try again.',
    [ErrorCode.RECORD_NOT_FOUND]: context || 'The requested item was not found.',
    [ErrorCode.DUPLICATE_RECORD]: context || 'This item already exists.',
    
    [ErrorCode.EXTERNAL_API_ERROR]: 'An external service error occurred. Please try again later.',
    [ErrorCode.API_RATE_LIMIT]: 'Too many requests. Please wait a moment and try again.',
    [ErrorCode.API_TIMEOUT]: 'The request took too long. Please try again.',
    
    [ErrorCode.FORECASTING_BLOCKED]: 'Forecasting is blocked due to data quality issues. Please resolve data cleanup issues first.',
    [ErrorCode.INSUFFICIENT_DATA]: 'Not enough historical data to generate accurate forecasts. At least 14 days of sales data is required.',
    [ErrorCode.FORECASTING_SERVICE_ERROR]: 'The forecasting service is temporarily unavailable. Please try again later.',
    
    [ErrorCode.NETWORK_ERROR]: 'Network connection failed. Please check your internet connection.',
    [ErrorCode.OFFLINE]: 'You are currently offline. Please check your internet connection.',
    
    [ErrorCode.FILE_UPLOAD_ERROR]: 'Failed to upload file. Please try again.',
    [ErrorCode.FILE_PARSE_ERROR]: context || 'Failed to parse file. Please check the file format.',
    
    [ErrorCode.INTERNAL_ERROR]: 'An internal error occurred. Please try again.',
    [ErrorCode.UNKNOWN_ERROR]: 'An unexpected error occurred. Please try again.',
  };

  return messages[code] || 'An error occurred. Please try again.';
}

/**
 * Determine if an error is retryable
 */
export function isRetryableError(error: ApplicationError): boolean {
  const retryableCodes = [
    ErrorCode.NETWORK_ERROR,
    ErrorCode.API_TIMEOUT,
    ErrorCode.API_RATE_LIMIT,
    ErrorCode.INTERNAL_ERROR,
    ErrorCode.DATABASE_ERROR,
    ErrorCode.FORECASTING_SERVICE_ERROR,
  ];

  return retryableCodes.includes(error.code) || error.retryable;
}

/**
 * Log error with appropriate level
 */
export function logError(error: ApplicationError, context?: string): void {
  const logData = {
    code: error.code,
    message: error.message,
    severity: error.severity,
    timestamp: error.timestamp,
    context,
    details: error.details,
  };

  switch (error.severity) {
    case ErrorSeverity.CRITICAL:
    case ErrorSeverity.HIGH:
      console.error('[ERROR]', logData);
      break;
    case ErrorSeverity.MEDIUM:
      console.warn('[WARNING]', logData);
      break;
    case ErrorSeverity.LOW:
      console.info('[INFO]', logData);
      break;
  }
}

/**
 * Create error from API response
 */
export function createErrorFromResponse(
  status: number,
  data: Record<string, unknown>
): ApplicationError {
  let code: ErrorCode;
  let severity: ErrorSeverity;
  let retryable: boolean;

  switch (status) {
    case 401:
      code = ErrorCode.UNAUTHORIZED;
      severity = ErrorSeverity.HIGH;
      retryable = false;
      break;
    case 403:
      code = ErrorCode.FORBIDDEN;
      severity = ErrorSeverity.HIGH;
      retryable = false;
      break;
    case 404:
      code = ErrorCode.RECORD_NOT_FOUND;
      severity = ErrorSeverity.MEDIUM;
      retryable = false;
      break;
    case 409:
      code = ErrorCode.DUPLICATE_RECORD;
      severity = ErrorSeverity.MEDIUM;
      retryable = false;
      break;
    case 422:
      code = ErrorCode.VALIDATION_ERROR;
      severity = ErrorSeverity.MEDIUM;
      retryable = false;
      break;
    case 429:
      code = ErrorCode.API_RATE_LIMIT;
      severity = ErrorSeverity.MEDIUM;
      retryable = true;
      break;
    case 500:
    case 502:
    case 503:
    case 504:
      code = ErrorCode.INTERNAL_ERROR;
      severity = ErrorSeverity.HIGH;
      retryable = true;
      break;
    default:
      code = ErrorCode.UNKNOWN_ERROR;
      severity = ErrorSeverity.MEDIUM;
      retryable = true;
  }

  const message = (typeof data?.error === 'string' ? data.error : null) || 
                  (typeof data?.message === 'string' ? data.message : null) || 
                  `HTTP ${status} error`;
  const contextMessage = typeof data?.message === 'string' ? data.message : undefined;
  const userMessage = getUserFriendlyMessage(code, contextMessage);

  return new ApplicationError(
    code,
    message,
    userMessage,
    severity,
    retryable,
    data?.details as Record<string, unknown> | undefined
  );
}
