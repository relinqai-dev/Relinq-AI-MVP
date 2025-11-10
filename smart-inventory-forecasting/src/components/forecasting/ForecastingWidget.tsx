/**
 * Forecasting Widget
 * Compact forecasting component for embedding in other dashboards
 * Requirements: 3.4, 3.5, 3.6
 */

'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useForecasting, useForecastAlerts, useReorderRecommendations } from '@/contexts/ForecastingContext'
import { TrendingUp, AlertTriangle, Clock, BarChart3 } from 'lucide-react'

interface ForecastingWidgetProps {
  variant?: 'compact' | 'detailed'
  showActions?: boolean
  maxItems?: number
}

export function ForecastingWidget({ 
  variant = 'compact', 
  showActions = true,
  maxItems = 5 
}: ForecastingWidgetProps) {
  const { 
    loading, 
    lastUpdate, 
    generateForecasts,
    metrics 
  } = useForecasting()
  
  const { criticalAlerts, highPriorityAlerts } = useForecastAlerts()
  const { urgentItems } = useReorderRecommendations()

  const handleQuickForecast = async () => {
    try {
      await generateForecasts({ priority: 'normal' })
    } catch (error) {
      console.error('Error generating forecasts:', error)
    }
  }

  if (variant === 'compact') {
    return (
      <Card className="w-full">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Forecasting</CardTitle>
            {loading && <Clock className="h-4 w-4 animate-pulse text-muted-foreground" />}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-muted-foreground">Urgent Items</div>
              <div className="text-lg font-semibold text-orange-600">
                {urgentItems.length}
              </div>
            </div>
            <div>
              <div className="text-muted-foreground">Alerts</div>
              <div className="text-lg font-semibold text-red-600">
                {criticalAlerts.length + highPriorityAlerts.length}
              </div>
            </div>
          </div>

          {/* Data Quality */}
          <div>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-muted-foreground">Data Quality</span>
              <span className="font-medium">
                {Math.round((metrics.totalForecasts > 0 ? metrics.successRate : 0) * 100)}%
              </span>
            </div>
            <Progress value={(metrics.totalForecasts > 0 ? metrics.successRate : 0) * 100} className="h-2" />
          </div>

          {/* Last Update */}
          <div className="text-xs text-muted-foreground">
            Last updated: {lastUpdate ? new Date(lastUpdate).toLocaleString() : 'Never'}
          </div>

          {/* Actions */}
          {showActions && (
            <Button 
              size="sm" 
              className="w-full" 
              onClick={handleQuickForecast}
              disabled={loading}
            >
              <TrendingUp className="h-3 w-3 mr-2" />
              {loading ? 'Generating...' : 'Update Forecasts'}
            </Button>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Inventory Forecasting
            </CardTitle>
            <CardDescription>
              AI-powered demand forecasting and reorder recommendations
            </CardDescription>
          </div>
          {showActions && (
            <Button onClick={handleQuickForecast} disabled={loading}>
              <TrendingUp className="h-4 w-4 mr-2" />
              {loading ? 'Generating...' : 'Generate Forecasts'}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">{urgentItems.length}</div>
            <div className="text-sm text-muted-foreground">Urgent Items</div>
          </div>
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">
              {criticalAlerts.length + highPriorityAlerts.length}
            </div>
            <div className="text-sm text-muted-foreground">Active Alerts</div>
          </div>
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <div className="text-2xl font-bold">
              {Math.round((metrics.totalForecasts > 0 ? metrics.successRate : 0) * 100)}%
            </div>
            <div className="text-sm text-muted-foreground">Accuracy</div>
          </div>
        </div>

        {/* Critical Alerts */}
        {(criticalAlerts.length > 0 || highPriorityAlerts.length > 0) && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              Active Alerts
            </h4>
            {[...criticalAlerts, ...highPriorityAlerts].slice(0, maxItems).map(alert => (
              <div key={alert.id} className="flex items-center justify-between p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex-1">
                  <div className="text-sm font-medium">{alert.itemName}</div>
                  <div className="text-xs text-muted-foreground">{alert.message}</div>
                </div>
                <Badge variant={alert.severity === 'critical' ? 'destructive' : 'default'}>
                  {alert.severity}
                </Badge>
              </div>
            ))}
          </div>
        )}

        {/* Top Reorder Recommendations */}
        {urgentItems.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Top Reorder Recommendations</h4>
            {urgentItems.slice(0, maxItems).map((item: { 
              sku: string; 
              itemName: string; 
              urgency: string; 
              daysUntilStockout: number;
              currentStock?: number;
              recommendedOrder?: number;
              confidence?: number;
            }) => (
              <div key={item.sku} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="text-sm font-medium">{item.itemName}</div>
                  <div className="text-xs text-muted-foreground">
                    {item.currentStock !== undefined && `Current: ${item.currentStock}`}
                    {item.recommendedOrder !== undefined && ` • Recommended: ${item.recommendedOrder}`}
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant="destructive">
                    {item.daysUntilStockout} days
                  </Badge>
                  {item.confidence !== undefined && (
                    <div className="text-xs text-muted-foreground mt-1">
                      {Math.round(item.confidence * 100)}% confidence
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* System Status */}
        <div className="pt-4 border-t">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">System Status</span>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                metrics.successRate > 0.8 ? 'bg-green-500' : 
                metrics.successRate > 0.6 ? 'bg-yellow-500' : 'bg-red-500'
              }`} />
              <span className="text-xs">
                {metrics.successRate > 0.8 ? 'Healthy' : 
                 metrics.successRate > 0.6 ? 'Warning' : 'Issues'}
              </span>
            </div>
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Last updated: {lastUpdate ? new Date(lastUpdate).toLocaleString() : 'Never'}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Specialized widgets for specific use cases
export function ForecastingStatusWidget() {
  const { metrics, loading } = useForecasting()
  const { criticalAlerts } = useForecastAlerts()

  return (
    <div className="flex items-center gap-4 p-4 bg-card border rounded-lg">
      <div className={`w-3 h-3 rounded-full ${
        metrics.successRate > 0.8 ? 'bg-green-500' : 
        metrics.successRate > 0.6 ? 'bg-yellow-500' : 'bg-red-500'
      }`} />
      <div className="flex-1">
        <div className="text-sm font-medium">
          Forecasting System
        </div>
        <div className="text-xs text-muted-foreground">
          {loading ? 'Processing...' : 
           criticalAlerts.length > 0 ? `${criticalAlerts.length} critical alerts` :
           'Operating normally'}
        </div>
      </div>
      {criticalAlerts.length > 0 && (
        <Badge variant="destructive">{criticalAlerts.length}</Badge>
      )}
    </div>
  )
}

export function QuickForecastButton() {
  const { generateForecasts, loading } = useForecasting()

  const handleQuickForecast = async () => {
    try {
      await generateForecasts({ priority: 'high' })
    } catch (error) {
      console.error('Error generating forecasts:', error)
    }
  }

  return (
    <Button 
      onClick={handleQuickForecast} 
      disabled={loading}
      className="w-full"
    >
      <TrendingUp className="h-4 w-4 mr-2" />
      {loading ? 'Generating Forecasts...' : 'Generate Forecasts'}
    </Button>
  )
}