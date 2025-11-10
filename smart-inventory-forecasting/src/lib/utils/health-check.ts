/**
 * System health check and monitoring
 * Requirements: 3.6, 4.6, 6.4
 */

import { HealthCheckResult, ServiceStatus } from '@/types/errors';
import { createClient } from '@/lib/supabase/client';

/**
 * Check database health
 */
async function checkDatabaseHealth(): Promise<ServiceStatus> {
  const startTime = Date.now();
  
  try {
    const supabase = createClient();
    const { error } = await supabase.from('inventory_items').select('id').limit(1);
    
    if (error) {
      return {
        status: 'down',
        lastCheck: new Date().toISOString(),
        error: error.message,
      };
    }
    
    return {
      status: 'up',
      responseTime: Date.now() - startTime,
      lastCheck: new Date().toISOString(),
    };
  } catch (error) {
    return {
      status: 'down',
      lastCheck: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Check forecasting service health
 */
async function checkForecastingHealth(): Promise<ServiceStatus> {
  const startTime = Date.now();
  
  try {
    const forecastingUrl = process.env.NEXT_PUBLIC_FORECASTING_SERVICE_URL;
    
    if (!forecastingUrl) {
      return {
        status: 'degraded',
        lastCheck: new Date().toISOString(),
        error: 'Forecasting service URL not configured',
      };
    }
    
    const response = await fetch(`${forecastingUrl}/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000), // 5 second timeout
    });
    
    if (!response.ok) {
      return {
        status: 'down',
        lastCheck: new Date().toISOString(),
        error: `HTTP ${response.status}`,
      };
    }
    
    return {
      status: 'up',
      responseTime: Date.now() - startTime,
      lastCheck: new Date().toISOString(),
    };
  } catch (error) {
    return {
      status: 'down',
      lastCheck: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Check authentication service health
 */
async function checkAuthenticationHealth(): Promise<ServiceStatus> {
  const startTime = Date.now();
  
  try {
    const supabase = createClient();
    const { error } = await supabase.auth.getSession();
    
    if (error) {
      return {
        status: 'down',
        lastCheck: new Date().toISOString(),
        error: (error as { message?: string })?.message || 'Authentication error',
      };
    }
    
    return {
      status: 'up',
      responseTime: Date.now() - startTime,
      lastCheck: new Date().toISOString(),
    };
  } catch (error) {
    return {
      status: 'down',
      lastCheck: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Perform comprehensive health check
 */
export async function performHealthCheck(): Promise<HealthCheckResult> {
  const [database, forecasting, authentication] = await Promise.all([
    checkDatabaseHealth(),
    checkForecastingHealth(),
    checkAuthenticationHealth(),
  ]);

  // Determine overall status
  let status: 'healthy' | 'degraded' | 'unhealthy';
  
  const downServices = [database, forecasting, authentication].filter(
    s => s.status === 'down'
  ).length;
  
  const degradedServices = [database, forecasting, authentication].filter(
    s => s.status === 'degraded'
  ).length;

  if (downServices > 0) {
    status = 'unhealthy';
  } else if (degradedServices > 0) {
    status = 'degraded';
  } else {
    status = 'healthy';
  }

  return {
    status,
    services: {
      database,
      forecasting,
      authentication,
    },
    timestamp: new Date().toISOString(),
  };
}

/**
 * Get health status message for users
 */
export function getHealthStatusMessage(health: HealthCheckResult): string {
  if (health.status === 'healthy') {
    return 'All systems operational';
  }

  const issues: string[] = [];
  
  if (health.services.database.status !== 'up') {
    issues.push('database connection');
  }
  
  if (health.services.forecasting.status !== 'up') {
    issues.push('forecasting service');
  }
  
  if (health.services.authentication.status !== 'up') {
    issues.push('authentication');
  }

  if (issues.length > 0) {
    return `Issues detected with: ${issues.join(', ')}`;
  }

  return 'Some services are experiencing issues';
}
