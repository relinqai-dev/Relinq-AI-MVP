// Robust React hook for data cleanup functionality
import { useState, useCallback, useEffect, useRef } from 'react';
import { CleanupReport, CleanupIssue, ApiResponse } from '@/types';

interface UseDataCleanupState {
    report: CleanupReport | null;
    isLoading: boolean;
    isScanning: boolean;
    isResolvingIssues: boolean;
    error: string | null;
    lastScanTime: Date | null;
    forecastingBlocked: boolean | null;
    optimisticUpdates: Set<string>;
}

interface UseDataCleanupOptions {
    autoRefresh?: boolean;
    refreshInterval?: number;
    enableOptimisticUpdates?: boolean;
    onScanComplete?: (report: CleanupReport) => void;
    onIssueResolved?: (issueId: string) => void;
    onError?: (error: string) => void;
}

interface UseDataCleanupReturn extends UseDataCleanupState {
    // Core actions
    runScan: () => Promise<CleanupReport | null>;
    generateReport: () => Promise<CleanupReport | null>;
    refreshReport: () => Promise<void>;

    // Issue resolution
    resolveIssue: (issueId: string) => Promise<boolean>;
    resolveMultipleIssues: (issueIds: string[]) => Promise<boolean>;

    // Forecasting checks
    checkForecastingBlocked: () => Promise<boolean>;
    getForecastingBlockedMessage: () => string;

    // Utility functions
    clearError: () => void;
    getIssuesByType: (type: 'duplicate' | 'missing_supplier' | 'no_sales_history') => CleanupIssue[];
    getIssuesBySeverity: (severity: 'high' | 'medium' | 'low') => CleanupIssue[];
    getUnresolvedIssues: () => CleanupIssue[];

    // Statistics
    getCompletionPercentage: () => number;
    getTotalIssues: () => number;
    getResolvedIssues: () => number;

    // Cache management
    invalidateCache: () => void;
    isStale: () => boolean;
}

export function useDataCleanup(options: UseDataCleanupOptions = {}): UseDataCleanupReturn {
    const {
        autoRefresh = false,
        refreshInterval = 30000, // 30 seconds
        enableOptimisticUpdates = true,
        onScanComplete,
        onIssueResolved,
        onError
    } = options;

    // State management
    const [state, setState] = useState<UseDataCleanupState>({
        report: null,
        isLoading: false,
        isScanning: false,
        isResolvingIssues: false,
        error: null,
        lastScanTime: null,
        forecastingBlocked: null,
        optimisticUpdates: new Set()
    });

    // Refs for cleanup and caching
    const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const abortControllerRef = useRef<AbortController | null>(null);
    const cacheTimestampRef = useRef<Date | null>(null);

    // Cache duration (5 minutes)
    const CACHE_DURATION = 5 * 60 * 1000;

    // Generic API call handler with enhanced error handling and loading states
    const handleApiCall = useCallback(async <T>(
        apiCall: () => Promise<Response>,
        loadingStateKey?: keyof Pick<UseDataCleanupState, 'isLoading' | 'isScanning' | 'isResolvingIssues'>,
        onSuccess?: (data: T) => void
    ): Promise<T | null> => {
        try {
            // Cancel any ongoing requests
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }

            abortControllerRef.current = new AbortController();

            setState(prev => ({
                ...prev,
                [loadingStateKey || 'isLoading']: true,
                error: null
            }));

            const response = await apiCall();

            // Check if request was aborted
            if (abortControllerRef.current?.signal.aborted) {
                return null;
            }

            const result: ApiResponse<T> = await response.json();

            if (!result.success) {
                const errorMessage = result.error || 'An error occurred';
                setState(prev => ({ ...prev, error: errorMessage }));
                onError?.(errorMessage);
                return null;
            }

            if (onSuccess && result.data) {
                onSuccess(result.data);
            }

            return result.data || null;
        } catch (err) {
            if (err instanceof Error && err.name === 'AbortError') {
                return null; // Request was cancelled
            }

            const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
            setState(prev => ({ ...prev, error: errorMessage }));
            onError?.(errorMessage);
            return null;
        } finally {
            setState(prev => ({
                ...prev,
                [loadingStateKey || 'isLoading']: false
            }));
        }
    }, [onError]);

    // Core API functions
    const runScan = useCallback(async (): Promise<CleanupReport | null> => {
        const result = await handleApiCall<CleanupReport>(
            () => fetch('/api/data-cleanup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'scan' }),
                signal: abortControllerRef.current?.signal
            }),
            'isScanning',
            (data) => {
                setState(prev => ({
                    ...prev,
                    report: data,
                    lastScanTime: new Date(),
                    forecastingBlocked: data.blocking_forecasting
                }));
                cacheTimestampRef.current = new Date();
                onScanComplete?.(data);
            }
        );

        return result;
    }, [handleApiCall, onScanComplete]);

    const generateReport = useCallback(async (): Promise<CleanupReport | null> => {
        const result = await handleApiCall<CleanupReport>(
            () => fetch('/api/data-cleanup?action=report', {
                signal: abortControllerRef.current?.signal
            }),
            'isLoading',
            (data) => {
                setState(prev => ({
                    ...prev,
                    report: data,
                    forecastingBlocked: data.blocking_forecasting
                }));
                cacheTimestampRef.current = new Date();
            }
        );

        return result;
    }, [handleApiCall]);

    const refreshReport = useCallback(async (): Promise<void> => {
        await generateReport();
    }, [generateReport]);

    const resolveIssue = useCallback(async (issueId: string): Promise<boolean> => {
        // Optimistic update
        if (enableOptimisticUpdates && state.report) {
            setState(prev => ({
                ...prev,
                optimisticUpdates: new Set([...prev.optimisticUpdates, issueId]),
                report: prev.report ? {
                    ...prev.report,
                    issues: prev.report.issues.map(issue =>
                        issue.id === issueId ? { ...issue, resolved: true } : issue
                    )
                } : null
            }));
        }

        const result = await handleApiCall<CleanupIssue>(
            () => fetch('/api/data-cleanup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'resolve-issue', issueId }),
                signal: abortControllerRef.current?.signal
            }),
            'isResolvingIssues'
        );

        if (result) {
            // Remove from optimistic updates and refresh report
            setState(prev => ({
                ...prev,
                optimisticUpdates: new Set([...prev.optimisticUpdates].filter(id => id !== issueId))
            }));

            // Refresh report after successful resolution
            await handleApiCall<CleanupReport>(
                () => fetch('/api/data-cleanup?action=report', {
                    signal: abortControllerRef.current?.signal
                }),
                'isLoading',
                (data) => {
                    setState(prev => ({
                        ...prev,
                        report: data,
                        forecastingBlocked: data.blocking_forecasting
                    }));
                    cacheTimestampRef.current = new Date();
                }
            );

            onIssueResolved?.(issueId);
            return true;
        } else {
            // Revert optimistic update on failure
            if (enableOptimisticUpdates) {
                setState(prev => ({
                    ...prev,
                    optimisticUpdates: new Set([...prev.optimisticUpdates].filter(id => id !== issueId))
                }));

                // Refresh to get accurate state
                await handleApiCall<CleanupReport>(
                    () => fetch('/api/data-cleanup?action=report', {
                        signal: abortControllerRef.current?.signal
                    }),
                    'isLoading',
                    (data) => {
                        setState(prev => ({
                            ...prev,
                            report: data,
                            forecastingBlocked: data.blocking_forecasting
                        }));
                        cacheTimestampRef.current = new Date();
                    }
                );
            }
            return false;
        }
    }, [handleApiCall, onIssueResolved, enableOptimisticUpdates, state.report]);

    const resolveMultipleIssues = useCallback(async (issueIds: string[]): Promise<boolean> => {
        // Optimistic update
        if (enableOptimisticUpdates && state.report) {
            setState(prev => ({
                ...prev,
                optimisticUpdates: new Set([...prev.optimisticUpdates, ...issueIds]),
                report: prev.report ? {
                    ...prev.report,
                    issues: prev.report.issues.map(issue =>
                        issueIds.includes(issue.id) ? { ...issue, resolved: true } : issue
                    )
                } : null
            }));
        }

        const result = await handleApiCall<void>(
            () => fetch('/api/data-cleanup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'resolve-multiple', issueIds }),
                signal: abortControllerRef.current?.signal
            }),
            'isResolvingIssues'
        );

        if (result !== null) {
            // Remove from optimistic updates and refresh report
            setState(prev => ({
                ...prev,
                optimisticUpdates: new Set([...prev.optimisticUpdates].filter(id => !issueIds.includes(id)))
            }));

            // Refresh report after successful resolution
            await handleApiCall<CleanupReport>(
                () => fetch('/api/data-cleanup?action=report', {
                    signal: abortControllerRef.current?.signal
                }),
                'isLoading',
                (data) => {
                    setState(prev => ({
                        ...prev,
                        report: data,
                        forecastingBlocked: data.blocking_forecasting
                    }));
                    cacheTimestampRef.current = new Date();
                }
            );

            issueIds.forEach(id => onIssueResolved?.(id));
            return true;
        } else {
            // Revert optimistic updates on failure
            if (enableOptimisticUpdates) {
                setState(prev => ({
                    ...prev,
                    optimisticUpdates: new Set([...prev.optimisticUpdates].filter(id => !issueIds.includes(id)))
                }));

                // Refresh to get accurate state
                await handleApiCall<CleanupReport>(
                    () => fetch('/api/data-cleanup?action=report', {
                        signal: abortControllerRef.current?.signal
                    }),
                    'isLoading',
                    (data) => {
                        setState(prev => ({
                            ...prev,
                            report: data,
                            forecastingBlocked: data.blocking_forecasting
                        }));
                        cacheTimestampRef.current = new Date();
                    }
                );
            }
            return false;
        }
    }, [handleApiCall, onIssueResolved, enableOptimisticUpdates, state.report]);

    const checkForecastingBlocked = useCallback(async (): Promise<boolean> => {
        const result = await handleApiCall<boolean>(
            () => fetch('/api/data-cleanup?action=check-blocking', {
                signal: abortControllerRef.current?.signal
            }),
            'isLoading',
            (blocked) => {
                setState(prev => ({ ...prev, forecastingBlocked: blocked }));
            }
        );

        return result || false;
    }, [handleApiCall]);

    // Utility functions
    const clearError = useCallback(() => {
        setState(prev => ({ ...prev, error: null }));
    }, []);

    const getIssuesByType = useCallback((type: 'duplicate' | 'missing_supplier' | 'no_sales_history'): CleanupIssue[] => {
        return state.report?.issues.filter(issue => issue.issue_type === type) || [];
    }, [state.report]);

    const getIssuesBySeverity = useCallback((severity: 'high' | 'medium' | 'low'): CleanupIssue[] => {
        return state.report?.issues.filter(issue => issue.severity === severity) || [];
    }, [state.report]);

    const getUnresolvedIssues = useCallback((): CleanupIssue[] => {
        return state.report?.issues.filter(issue => !issue.resolved) || [];
    }, [state.report]);

    const getForecastingBlockedMessage = useCallback((): string => {
        if (!state.report) return 'Unable to determine forecasting status';

        const unresolvedIssues = getUnresolvedIssues();
        const highPriorityIssues = unresolvedIssues.filter(issue => issue.severity === 'high');
        const mediumPriorityIssues = unresolvedIssues.filter(issue => issue.severity === 'medium');

        if (!state.forecastingBlocked) {
            return 'Forecasting is available';
        }

        let message = 'Forecasting is blocked due to data quality issues:\n\n';

        if (highPriorityIssues.length > 0) {
            message += `• ${highPriorityIssues.length} high priority issues need attention\n`;
        }

        if (mediumPriorityIssues.length > 0) {
            message += `• ${mediumPriorityIssues.length} medium priority issues need attention\n`;
        }

        message += '\nPlease resolve these issues before generating forecasts.';
        return message;
    }, [state.report, state.forecastingBlocked, getUnresolvedIssues]);

    // Statistics functions
    const getCompletionPercentage = useCallback((): number => {
        return state.report?.completion_percentage || 0;
    }, [state.report]);

    const getTotalIssues = useCallback((): number => {
        return state.report?.total_issues || 0;
    }, [state.report]);

    const getResolvedIssues = useCallback((): number => {
        const total = getTotalIssues();
        const completion = getCompletionPercentage();
        return Math.round((total * completion) / 100);
    }, [getTotalIssues, getCompletionPercentage]);

    // Cache management
    const invalidateCache = useCallback(() => {
        cacheTimestampRef.current = null;
    }, []);

    const isStale = useCallback((): boolean => {
        if (!cacheTimestampRef.current) return true;
        return Date.now() - cacheTimestampRef.current.getTime() > CACHE_DURATION;
    }, [CACHE_DURATION]);

    // Auto-refresh effect
    useEffect(() => {
        if (autoRefresh && refreshInterval > 0) {
            refreshIntervalRef.current = setInterval(() => {
                if (isStale()) {
                    generateReport();
                }
            }, refreshInterval);

            return () => {
                if (refreshIntervalRef.current) {
                    clearInterval(refreshIntervalRef.current);
                }
            };
        }
    }, [autoRefresh, refreshInterval, generateReport, isStale]);

    // Cleanup effect
    useEffect(() => {
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
            if (refreshIntervalRef.current) {
                clearInterval(refreshIntervalRef.current);
            }
        };
    }, []);

    return {
        // State
        ...state,

        // Core actions
        runScan,
        generateReport,
        refreshReport,

        // Issue resolution
        resolveIssue,
        resolveMultipleIssues,

        // Forecasting checks
        checkForecastingBlocked,
        getForecastingBlockedMessage,

        // Utility functions
        clearError,
        getIssuesByType,
        getIssuesBySeverity,
        getUnresolvedIssues,

        // Statistics
        getCompletionPercentage,
        getTotalIssues,
        getResolvedIssues,

        // Cache management
        invalidateCache,
        isStale
    };
}