# Error Handling and User Feedback System

## Overview

This document describes the comprehensive error handling and user feedback system implemented for the Smart Inventory Forecasting MVP. The system provides consistent error handling, user-friendly error messages, retry mechanisms, loading indicators, and system health monitoring.

**Requirements Addressed:** 3.6, 4.6, 6.4

## Architecture

### Components

1. **Error Types and Classes** (`src/types/errors.ts`)
   - `ErrorCode` enum: Standardized error codes
   - `ErrorSeverity` enum: Error severity levels
   - `ApplicationError` class: Custom error class with user-friendly messages
   - `HealthCheckResult` interface: System health status

2. **Error Handling Utilities** (`src/lib/utils/error-handler.ts`)
   - `normalizeError()`: Convert any error to ApplicationError
   - `getUserFriendlyMessage()`: Get user-friendly error messages
   - `isRetryableError()`: Determine if error can be retried
   - `logError()`: Log errors with appropriate severity

3. **Retry Handler** (`src/lib/utils/retry-handler.ts`)
   - `retryWithBackoff()`: Retry operations with exponential backoff
   - `retryFetch()`: Retry fetch requests
   - `withRetry()`: Wrapper for any async function

4. **API Error Handler** (`src/lib/utils/api-error-handler.ts`)
   - `handleApiError()`: Consistent API error responses
   - Helper functions for common error types

5. **Health Check** (`src/lib/utils/health-check.ts`)
   - `performHealthCheck()`: Check all system services
   - Service-specific health checks

### UI Components

1. **ErrorBoundary** (`src/components/error/ErrorBoundary.tsx`)
   - Global error boundary for React errors
   - Catches and displays unhandled errors
   - Provides reset and navigation options

2. **ErrorAlert** (`src/components/error/ErrorAlert.tsx`)
   - Inline error display component
   - Shows user-friendly error messages
   - Supports retry actions

3. **ErrorToast** (`src/components/error/ErrorToast.tsx`)
   - Temporary error notifications
   - Auto-dismisses after duration
   - Color-coded by severity

4. **SystemStatus** (`src/components/ui/system-status.tsx`)
   - Displays system health information
   - Shows status of all services
   - Auto-refreshes every 30 seconds

5. **ProgressIndicator** (`src/components/ui/progress-indicator.tsx`)
   - Loading indicators with messages
   - Progress bars for long operations
   - Full-page and inline variants

### Context and Hooks

1. **ErrorContext** (`src/contexts/ErrorContext.tsx`)
   - Global error state management
   - `showError()`: Display error toast
   - `clearError()`: Dismiss error

2. **useAsyncOperation** (`src/hooks/useAsyncOperation.ts`)
   - Hook for async operations with error handling
   - Manages loading, error, and data states
   - Supports automatic retry

## Usage Examples

### 1. API Route Error Handling

```typescript
import { handleApiError, createUnauthorizedError, createNotFoundError } from '@/lib/utils/api-error-handler';

export async function GET(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      throw createUnauthorizedError();
    }

    const data = await fetchData(user.id);
    if (!data) {
      throw createNotFoundError('Data');
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return handleApiError(error, 'GET /api/endpoint');
  }
}
```

### 2. Component Error Handling

```typescript
import { useAsyncOperation } from '@/hooks/useAsyncOperation';
import { ErrorAlert } from '@/components/error/ErrorAlert';
import { InlineLoading } from '@/components/ui/progress-indicator';

function MyComponent() {
  const { data, loading, error, execute } = useAsyncOperation({
    retry: true,
    onSuccess: (data) => console.log('Success:', data),
  });

  const handleFetch = () => {
    execute(async () => {
      const response = await fetch('/api/data');
      if (!response.ok) throw new Error('Failed to fetch');
      return response.json();
    });
  };

  if (loading) return <InlineLoading message="Loading data..." />;
  if (error) return <ErrorAlert error={error} onRetry={handleFetch} />;
  
  return <div>{/* Render data */}</div>;
}
```

### 3. Using Error Context

```typescript
import { useError } from '@/contexts/ErrorContext';

function MyComponent() {
  const { showError } = useError();

  const handleAction = async () => {
    try {
      await performAction();
    } catch (error) {
      showError(error); // Shows error toast
    }
  };

  return <button onClick={handleAction}>Perform Action</button>;
}
```

### 4. Retry with Backoff

```typescript
import { retryWithBackoff } from '@/lib/utils/retry-handler';

async function fetchWithRetry() {
  return retryWithBackoff(
    async () => {
      const response = await fetch('/api/data');
      if (!response.ok) throw new Error('Failed');
      return response.json();
    },
    {
      maxAttempts: 3,
      delayMs: 1000,
      backoffMultiplier: 2,
    },
    (attempt, error) => {
      console.log(`Retry attempt ${attempt}:`, error.message);
    }
  );
}
```

### 5. Custom Error Creation

```typescript
import { ApplicationError, ErrorCode, ErrorSeverity } from '@/types/errors';

function validateInput(data: any) {
  if (!data.email) {
    throw new ApplicationError(
      ErrorCode.VALIDATION_ERROR,
      'Email is required',
      'Please provide a valid email address',
      ErrorSeverity.MEDIUM,
      false,
      { field: 'email' }
    );
  }
}
```

## Error Codes

### Authentication Errors
- `UNAUTHORIZED`: User not authenticated
- `FORBIDDEN`: User lacks permission
- `SESSION_EXPIRED`: Session has expired

### Validation Errors
- `VALIDATION_ERROR`: Input validation failed
- `INVALID_INPUT`: Invalid input format
- `MISSING_REQUIRED_FIELD`: Required field missing

### Database Errors
- `DATABASE_ERROR`: Database operation failed
- `RECORD_NOT_FOUND`: Record not found
- `DUPLICATE_RECORD`: Duplicate record exists

### External API Errors
- `EXTERNAL_API_ERROR`: External service error
- `API_RATE_LIMIT`: Rate limit exceeded
- `API_TIMEOUT`: Request timeout

### Forecasting Errors
- `FORECASTING_BLOCKED`: Forecasting blocked by data quality
- `INSUFFICIENT_DATA`: Not enough historical data
- `FORECASTING_SERVICE_ERROR`: Forecasting service unavailable

### Network Errors
- `NETWORK_ERROR`: Network connection failed
- `OFFLINE`: User is offline

### File Errors
- `FILE_UPLOAD_ERROR`: File upload failed
- `FILE_PARSE_ERROR`: File parsing failed

### Generic Errors
- `INTERNAL_ERROR`: Internal server error
- `UNKNOWN_ERROR`: Unknown error occurred

## Error Severity Levels

- **CRITICAL**: System-breaking errors requiring immediate attention
- **HIGH**: Errors preventing core functionality
- **MEDIUM**: Errors affecting specific features
- **LOW**: Minor issues or informational messages

## Health Check System

The health check system monitors:

1. **Database**: Connection and query performance
2. **Forecasting Service**: Availability and response time
3. **Authentication**: Session management

### Health Check API

```
GET /api/health
```

Response:
```json
{
  "status": "healthy" | "degraded" | "unhealthy",
  "services": {
    "database": {
      "status": "up" | "down" | "degraded",
      "responseTime": 45,
      "lastCheck": "2024-01-01T00:00:00.000Z"
    },
    "forecasting": { ... },
    "authentication": { ... }
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Best Practices

1. **Always use ApplicationError** for throwing errors in application code
2. **Use handleApiError** in all API routes for consistent error responses
3. **Wrap async operations** with useAsyncOperation hook in components
4. **Provide context** when logging errors for better debugging
5. **Use appropriate severity levels** to help prioritize issues
6. **Enable retry** only for retryable errors (network, timeout, etc.)
7. **Show user-friendly messages** instead of technical error details
8. **Log errors** with sufficient context for debugging

## Testing

Error handling can be tested by:

1. Simulating network failures
2. Testing with invalid inputs
3. Mocking API failures
4. Testing retry mechanisms
5. Verifying error messages are user-friendly

## Future Enhancements

1. Error tracking integration (e.g., Sentry)
2. Error analytics and reporting
3. User feedback collection on errors
4. Automated error recovery strategies
5. Enhanced offline support
