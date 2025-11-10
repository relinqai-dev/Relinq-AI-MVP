'use client';

/**
 * System Status Component for displaying health check information
 * Requirements: 3.6, 4.6, 6.4
 */

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { HealthCheckResult } from '@/types/errors';
import { getHealthStatusMessage } from '@/lib/utils/health-check';

export function SystemStatus() {
  const [health, setHealth] = useState<HealthCheckResult | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchHealth = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/health');
      const data = await response.json();
      setHealth(data);
    } catch (error) {
      console.error('Failed to fetch health status:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchHealth, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'up':
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'degraded':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'down':
      case 'unhealthy':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'up':
      case 'healthy':
        return <Badge variant="default" className="bg-green-100 text-green-800">Operational</Badge>;
      case 'degraded':
        return <Badge variant="default" className="bg-yellow-100 text-yellow-800">Degraded</Badge>;
      case 'down':
      case 'unhealthy':
        return <Badge variant="destructive">Down</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  if (!health) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>System Status</CardTitle>
          <CardDescription>Loading system health information...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>System Status</CardTitle>
            <CardDescription>{getHealthStatusMessage(health)}</CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchHealth}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Overall Status</span>
          {getStatusBadge(health.status)}
        </div>

        <div className="space-y-3 pt-2 border-t">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getStatusIcon(health.services.database.status)}
              <span className="text-sm">Database</span>
            </div>
            <div className="text-right">
              {getStatusBadge(health.services.database.status)}
              {health.services.database.responseTime && (
                <p className="text-xs text-gray-500 mt-1">
                  {health.services.database.responseTime}ms
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getStatusIcon(health.services.forecasting.status)}
              <span className="text-sm">Forecasting Service</span>
            </div>
            <div className="text-right">
              {getStatusBadge(health.services.forecasting.status)}
              {health.services.forecasting.responseTime && (
                <p className="text-xs text-gray-500 mt-1">
                  {health.services.forecasting.responseTime}ms
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getStatusIcon(health.services.authentication.status)}
              <span className="text-sm">Authentication</span>
            </div>
            <div className="text-right">
              {getStatusBadge(health.services.authentication.status)}
              {health.services.authentication.responseTime && (
                <p className="text-xs text-gray-500 mt-1">
                  {health.services.authentication.responseTime}ms
                </p>
              )}
            </div>
          </div>
        </div>

        <p className="text-xs text-gray-500 pt-2 border-t">
          Last updated: {new Date(health.timestamp).toLocaleTimeString()}
        </p>
      </CardContent>
    </Card>
  );
}
