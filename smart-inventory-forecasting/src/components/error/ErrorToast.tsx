'use client';

/**
 * Error Toast Component for temporary error notifications
 * Requirements: 3.6, 4.6, 6.4
 */

import React, { useEffect, useState, useCallback } from 'react';
import { ApplicationError, ErrorSeverity } from '@/types/errors';
import { cn } from '@/lib/utils';
import { X, AlertTriangle, AlertCircle, Info, XCircle } from 'lucide-react';

interface ErrorToastProps {
  error: ApplicationError | Error | string;
  duration?: number;
  onClose?: () => void;
}

export function ErrorToast({ error, duration = 5000, onClose }: ErrorToastProps) {
  const [isVisible, setIsVisible] = useState(true);

  const appError = error instanceof ApplicationError ? error : null;
  const severity = appError?.severity || ErrorSeverity.MEDIUM;
  const message = appError?.userMessage || (error instanceof Error ? error.message : error);

  const handleClose = useCallback(() => {
    setIsVisible(false);
    setTimeout(() => {
      onClose?.();
    }, 300);
  }, [onClose]);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, handleClose]);

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

  const getColorClasses = () => {
    switch (severity) {
      case ErrorSeverity.CRITICAL:
      case ErrorSeverity.HIGH:
        return 'bg-red-50 border-red-200 text-red-900';
      case ErrorSeverity.MEDIUM:
        return 'bg-yellow-50 border-yellow-200 text-yellow-900';
      case ErrorSeverity.LOW:
        return 'bg-blue-50 border-blue-200 text-blue-900';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-900';
    }
  };

  if (!isVisible) return null;

  return (
    <div
      className={cn(
        'fixed bottom-4 right-4 z-50 max-w-md w-full',
        'transform transition-all duration-300 ease-in-out',
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
      )}
    >
      <div
        className={cn(
          'rounded-lg border shadow-lg p-4',
          'flex items-start gap-3',
          getColorClasses()
        )}
      >
        <div className="flex-shrink-0 mt-0.5">{getIcon()}</div>
        <div className="flex-1 text-sm">{message}</div>
        <button
          onClick={handleClose}
          className="flex-shrink-0 hover:opacity-70 transition-opacity"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
