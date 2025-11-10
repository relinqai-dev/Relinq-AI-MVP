'use client';

/**
 * Error Context for global error management
 * Requirements: 3.6, 4.6, 6.4
 */

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { ApplicationError } from '@/types/errors';
import { ErrorToast } from '@/components/error/ErrorToast';
import { normalizeError, logError } from '@/lib/utils/error-handler';

interface ErrorContextValue {
  showError: (error: unknown) => void;
  clearError: () => void;
  currentError: ApplicationError | null;
}

const ErrorContext = createContext<ErrorContextValue | undefined>(undefined);

interface ErrorProviderProps {
  children: ReactNode;
}

export function ErrorProvider({ children }: ErrorProviderProps) {
  const [currentError, setCurrentError] = useState<ApplicationError | null>(null);

  const showError = useCallback((error: unknown) => {
    const appError = normalizeError(error);
    logError(appError);
    setCurrentError(appError);
  }, []);

  const clearError = useCallback(() => {
    setCurrentError(null);
  }, []);

  return (
    <ErrorContext.Provider value={{ showError, clearError, currentError }}>
      {children}
      {currentError && (
        <ErrorToast
          error={currentError}
          onClose={clearError}
        />
      )}
    </ErrorContext.Provider>
  );
}

export function useError() {
  const context = useContext(ErrorContext);
  if (context === undefined) {
    throw new Error('useError must be used within an ErrorProvider');
  }
  return context;
}
