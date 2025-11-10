// Utility functions for forecasting guard logic
import { dataCleanupService } from '@/lib/services';

/**
 * Checks if forecasting is blocked due to data quality issues
 * This should be called before any forecasting operations
 * Requirement: 2.6 - Build forecasting blocker that prevents forecasts until cleanup completion
 */
export async function checkForecastingAllowed(userId: string): Promise<{ success: boolean; data?: boolean; error?: string }> {
  try {
    const blockingResult = await dataCleanupService.isForecastingBlocked(userId);
    
    if (!blockingResult.success) {
      return { 
        success: false, 
        error: 'Failed to check data quality status' 
      };
    }

    const isBlocked = blockingResult.data;
    
    if (isBlocked) {
      return {
        success: false,
        error: 'Forecasting is currently blocked due to unresolved data quality issues. Please resolve high and medium priority cleanup issues before generating forecasts.',
        data: false
      };
    }

    return { success: true, data: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error checking forecasting status',
      data: false
    };
  }
}

/**
 * Middleware function that can be used in API routes to guard forecasting endpoints
 */
export async function forecastingGuardMiddleware(userId: string): Promise<{ allowed: boolean; error?: string }> {
  const result = await checkForecastingAllowed(userId);
  
  return {
    allowed: result.success && result.data === true,
    error: result.error
  };
}

/**
 * Gets a user-friendly message about why forecasting is blocked
 */
export async function getForecastingBlockedMessage(userId: string): Promise<string> {
  try {
    const reportResult = await dataCleanupService.generateCleanupReport(userId);
    
    if (!reportResult.success || !reportResult.data) {
      return 'Unable to generate forecasts due to data quality issues. Please run a data cleanup scan.';
    }

    const report = reportResult.data;
    const unresolvedIssues = report.issues.filter(issue => !issue.resolved);
    const highPriorityIssues = unresolvedIssues.filter(issue => issue.severity === 'high');
    const mediumPriorityIssues = unresolvedIssues.filter(issue => issue.severity === 'medium');

    let message = 'Forecasting is blocked due to data quality issues:\n\n';

    if (highPriorityIssues.length > 0) {
      message += `• ${highPriorityIssues.length} high priority issues need attention\n`;
    }

    if (mediumPriorityIssues.length > 0) {
      message += `• ${mediumPriorityIssues.length} medium priority issues need attention\n`;
    }

    message += '\nPlease resolve these issues in the Data Cleanup section before generating forecasts.';

    return message;
  } catch {
    return 'Unable to generate forecasts due to data quality issues. Please check the Data Cleanup section.';
  }
}