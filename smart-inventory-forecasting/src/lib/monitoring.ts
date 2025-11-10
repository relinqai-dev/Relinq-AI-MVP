/**
 * Production Monitoring and Logging Utilities
 * Provides structured logging and performance monitoring for production
 */

export interface LogContext {
  userId?: string;
  action?: string;
  resource?: string;
  metadata?: Record<string, unknown>;
}

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';

  private formatMessage(level: LogLevel, message: string, context?: LogContext) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      ...context,
      environment: process.env.NODE_ENV,
    };

    return logEntry;
  }

  debug(message: string, context?: LogContext) {
    if (this.isDevelopment) {
      console.debug(this.formatMessage('debug', message, context));
    }
  }

  info(message: string, context?: LogContext) {
    console.info(this.formatMessage('info', message, context));
  }

  warn(message: string, context?: LogContext) {
    console.warn(this.formatMessage('warn', message, context));
  }

  error(message: string, error?: Error, context?: LogContext) {
    const errorContext = {
      ...context,
      error: error
        ? {
            name: error.name,
            message: error.message,
            stack: error.stack,
          }
        : undefined,
    };

    console.error(this.formatMessage('error', message, errorContext));
  }
}

export const logger = new Logger();

/**
 * Performance monitoring utilities
 */
export class PerformanceMonitor {
  private metrics: Map<string, number[]> = new Map();

  startTimer(label: string): () => void {
    const start = performance.now();

    return () => {
      const duration = performance.now() - start;
      this.recordMetric(label, duration);
    };
  }

  recordMetric(label: string, value: number) {
    if (!this.metrics.has(label)) {
      this.metrics.set(label, []);
    }

    const values = this.metrics.get(label)!;
    values.push(value);

    // Keep only last 100 measurements
    if (values.length > 100) {
      values.shift();
    }

    // Log slow operations in production
    if (process.env.NODE_ENV === 'production' && value > 1000) {
      logger.warn(`Slow operation detected: ${label}`, {
        metadata: { duration: value, unit: 'ms' },
      });
    }
  }

  getMetrics(label: string) {
    const values = this.metrics.get(label) || [];
    if (values.length === 0) {
      return null;
    }

    const sorted = [...values].sort((a, b) => a - b);
    const sum = values.reduce((acc, val) => acc + val, 0);

    return {
      count: values.length,
      avg: sum / values.length,
      min: sorted[0],
      max: sorted[sorted.length - 1],
      p50: sorted[Math.floor(sorted.length * 0.5)],
      p95: sorted[Math.floor(sorted.length * 0.95)],
      p99: sorted[Math.floor(sorted.length * 0.99)],
    };
  }

  getAllMetrics() {
    const allMetrics: Record<string, ReturnType<typeof this.getMetrics>> = {};

    for (const [label] of this.metrics) {
      allMetrics[label] = this.getMetrics(label);
    }

    return allMetrics;
  }

  clear() {
    this.metrics.clear();
  }
}

export const performanceMonitor = new PerformanceMonitor();

/**
 * API Error tracking
 */
export interface ApiError {
  endpoint: string;
  method: string;
  statusCode: number;
  message: string;
  timestamp: string;
  userId?: string;
}

class ErrorTracker {
  private errors: ApiError[] = [];
  private maxErrors = 100;

  trackError(error: ApiError) {
    this.errors.push(error);

    // Keep only recent errors
    if (this.errors.length > this.maxErrors) {
      this.errors.shift();
    }

    // Log to console in production
    logger.error(`API Error: ${error.endpoint}`, undefined, {
      metadata: {
        endpoint: error.endpoint,
        method: error.method,
        statusCode: error.statusCode,
        message: error.message,
      },
    });
  }

  getRecentErrors(limit: number = 10): ApiError[] {
    return this.errors.slice(-limit);
  }

  getErrorsByEndpoint(endpoint: string): ApiError[] {
    return this.errors.filter((e) => e.endpoint === endpoint);
  }

  clear() {
    this.errors = [];
  }
}

export const errorTracker = new ErrorTracker();

/**
 * Health check utilities
 */
export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  checks: {
    database: boolean;
    forecastingService: boolean;
    ai: boolean;
  };
  uptime: number;
}

const startTime = Date.now();

export async function getHealthStatus(): Promise<HealthStatus> {
  const checks = {
    database: await checkDatabase(),
    forecastingService: await checkForecastingService(),
    ai: await checkAI(),
  };

  const allHealthy = Object.values(checks).every((check) => check === true);
  const someHealthy = Object.values(checks).some((check) => check === true);

  let status: 'healthy' | 'degraded' | 'unhealthy';
  if (allHealthy) {
    status = 'healthy';
  } else if (someHealthy) {
    status = 'degraded';
  } else {
    status = 'unhealthy';
  }

  return {
    status,
    timestamp: new Date().toISOString(),
    checks,
    uptime: Date.now() - startTime,
  };
}

async function checkDatabase(): Promise<boolean> {
  try {
    // Simple check - verify Supabase URL is configured
    return !!process.env.NEXT_PUBLIC_SUPABASE_URL;
  } catch {
    return false;
  }
}

async function checkForecastingService(): Promise<boolean> {
  try {
    const url = process.env.FORECASTING_SERVICE_URL;
    if (!url) return false;

    const response = await fetch(`${url}/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000),
    });

    return response.ok;
  } catch {
    return false;
  }
}

async function checkAI(): Promise<boolean> {
  try {
    return !!process.env.OPENAI_API_KEY;
  } catch {
    return false;
  }
}
