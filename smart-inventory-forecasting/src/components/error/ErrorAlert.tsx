'use client';

/**
 * Error Alert Component for displaying user-friendly error messages
 * Requirements: 3.6, 4.6, 6.4
 */

import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, AlertCircle, Info, XCircle, RefreshCw } from 'lucide-react';
import { ApplicationError, ErrorSeverity } from '@/types/errors';
import { cn } from '@/lib/utils';

interface ErrorAlertProps {
  error: ApplicationError | Error | string;
  onRetry?: () => void;
  onDismiss?: () => void;
  className?: string;
}

export function ErrorAlert({ error, onRetry, onDismiss, className }: ErrorAlertProps) {
  const appError = error instanceof ApplicationError 
    ? error 
    : null;

  const severity = appError?.severity || ErrorSeverity.MEDIUM;
  const message = appError?.userMessage || (error instanceof Error ? error.message : error);
  const retryable = appError?.retryable || false;

  const getIcon = () => {
    switch (severity) {
      case ErrorSeverity.CRITICAL:
      case ErrorSeverity.HIGH:
        return <XCircle className="h-5 w-5" />;
      case ErrorSeverity.MEDIUM:
        return <AlertTriangle className="h-5 w-5" />;
      case ErrorSeverity.LOW:
        return <AlertCircle className="h-5 w-5" />;
      default:
        return <Info className="h-5 w-5" />;
    }
  };

  const getVariant = () => {
    switch (severity) {
      case ErrorSeverity.CRITICAL:
      case ErrorSeverity.HIGH:
        return 'destructive';
      default:
        return 'default';
    }
  };

  const getTitle = () => {
    switch (severity) {
      case ErrorSeverity.CRITICAL:
        return 'Critical Error';
      case ErrorSeverity.HIGH:
        return 'Error';
      case ErrorSeverity.MEDIUM:
        return 'Warning';
      case ErrorSeverity.LOW:
        return 'Notice';
      default:
        return 'Error';
    }
  };

  return (
    <Alert variant={getVariant()} className={cn('relative', className)}>
      <div className="flex items-start gap-3">
        <div className="mt-0.5">{getIcon()}</div>
        <div className="flex-1 space-y-2">
          <AlertTitle>{getTitle()}</AlertTitle>
          <AlertDescription className="text-sm">
            {message}
          </AlertDescription>
          
          {(retryable && onRetry) || onDismiss ? (
            <div className="flex gap-2 mt-3">
              {retryable && onRetry && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onRetry}
                  className="h-8"
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Retry
                </Button>
              )}
              {onDismiss && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={onDismiss}
                  className="h-8"
                >
                  Dismiss
                </Button>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </Alert>
  );
}
