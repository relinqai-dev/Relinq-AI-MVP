import { NextResponse } from 'next/server';
import { getHealthStatus } from '@/lib/monitoring';

export const dynamic = 'force-dynamic';

/**
 * Health check endpoint for monitoring
 * Returns service status and version information
 */
export async function GET() {
  try {
    const healthStatus = await getHealthStatus();

    const statusCode = healthStatus.status === 'healthy' ? 200 : 503;

    return NextResponse.json(
      {
        ...healthStatus,
        version: '1.0.0',
        service: 'smart-inventory-forecasting',
      },
      { status: statusCode }
    );
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
        checks: {
          database: false,
          forecastingService: false,
          ai: false,
        },
      },
      { status: 503 }
    );
  }
}
