/**
 * API Error Handler for consistent error responses
 * Requirements: 3.6, 4.6, 6.4
 */

import { NextResponse } from 'next/server';
import { ApplicationError, ErrorCode, ErrorSeverity } from '@/types/errors';
import { logError } from './error-handler';

/**
 * Handle API errors and return appropriate NextResponse
 */
export function handleApiError(error: unknown, context?: string): NextResponse {
  let appError: ApplicationError;

  if (error instanceof ApplicationError) {
    appError = error;
  } else if (error instanceof Error) {
    appError = new ApplicationError(
      ErrorCode.INTERNAL_ERROR,
      error.message,
      'An error occurred while processing your request',
      ErrorSeverity.HIGH,
      true
    );
  } else {
    appError = new ApplicationError(
      ErrorCode.UNKNOWN_ERROR,
      String(error),
      'An unexpected error occurred',
      ErrorSeverity.HIGH,
      true
    );
  }

  // Log the error
  logError(appError, context);

  // Determine HTTP status code
  const statusCode = getHttpStatusCode(appError.code);

  // Return error response
  return NextResponse.json(
    {
      success: false,
      error: appError.userMessage,
      code: appError.code,
      message: appError.message,
      retryable: appError.retryable,
      timestamp: appError.timestamp,
      ...(process.env.NODE_ENV === 'development' && {
        details: appError.details,
      }),
    },
    { status: statusCode }
  );
}

/**
 * Get HTTP status code from error code
 */
function getHttpStatusCode(code: ErrorCode): number {
  const statusMap: Record<ErrorCode, number> = {
    [ErrorCode.UNAUTHORIZED]: 401,
    [ErrorCode.FORBIDDEN]: 403,
    [ErrorCode.SESSION_EXPIRED]: 401,
    
    [ErrorCode.VALIDATION_ERROR]: 422,
    [ErrorCode.INVALID_INPUT]: 400,
    [ErrorCode.MISSING_REQUIRED_FIELD]: 400,
    
    [ErrorCode.DATABASE_ERROR]: 500,
    [ErrorCode.RECORD_NOT_FOUND]: 404,
    [ErrorCode.DUPLICATE_RECORD]: 409,
    
    [ErrorCode.EXTERNAL_API_ERROR]: 502,
    [ErrorCode.API_RATE_LIMIT]: 429,
    [ErrorCode.API_TIMEOUT]: 504,
    
    [ErrorCode.FORECASTING_BLOCKED]: 400,
    [ErrorCode.INSUFFICIENT_DATA]: 400,
    [ErrorCode.FORECASTING_SERVICE_ERROR]: 503,
    
    [ErrorCode.NETWORK_ERROR]: 503,
    [ErrorCode.OFFLINE]: 503,
    
    [ErrorCode.FILE_UPLOAD_ERROR]: 400,
    [ErrorCode.FILE_PARSE_ERROR]: 400,
    
    [ErrorCode.INTERNAL_ERROR]: 500,
    [ErrorCode.UNKNOWN_ERROR]: 500,
  };

  return statusMap[code] || 500;
}

/**
 * Create validation error
 */
export function createValidationError(
  field: string,
  message: string
): ApplicationError {
  return new ApplicationError(
    ErrorCode.VALIDATION_ERROR,
    `Validation failed for ${field}: ${message}`,
    message,
    ErrorSeverity.MEDIUM,
    false,
    { field }
  );
}

/**
 * Create unauthorized error
 */
export function createUnauthorizedError(): ApplicationError {
  return new ApplicationError(
    ErrorCode.UNAUTHORIZED,
    'User is not authenticated',
    'Your session has expired. Please log in again.',
    ErrorSeverity.HIGH,
    false
  );
}

/**
 * Create not found error
 */
export function createNotFoundError(resource: string): ApplicationError {
  return new ApplicationError(
    ErrorCode.RECORD_NOT_FOUND,
    `${resource} not found`,
    `The requested ${resource.toLowerCase()} was not found.`,
    ErrorSeverity.MEDIUM,
    false,
    { resource }
  );
}

/**
 * Create insufficient data error
 */
export function createInsufficientDataError(
  minDataPoints: number,
  actualDataPoints: number
): ApplicationError {
  return new ApplicationError(
    ErrorCode.INSUFFICIENT_DATA,
    `Insufficient data: ${actualDataPoints} data points, ${minDataPoints} required`,
    `Not enough historical data to generate accurate forecasts. At least ${minDataPoints} days of sales data is required.`,
    ErrorSeverity.MEDIUM,
    false,
    { minDataPoints, actualDataPoints }
  );
}
