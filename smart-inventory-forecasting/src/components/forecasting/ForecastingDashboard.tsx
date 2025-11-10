/**
 * Advanced Forecasting Dashboard
 * Comprehensive UI for forecasting management and insights
 * Requirements: 3.4, 3.5, 3.6
 */

'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { 
  useForecasting, 
  useForecastAlerts, 
  useForecastMetrics, 
  useReorderRecommendations 
} from '@/contexts/ForecastingContext'
import { 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  BarChart3,
  RefreshCw,
  Download,
  Filter
} from 'lucide-react'

export function ForecastingDashboard() {
  const {
    loading,
    error,
    lastUpdate,
    generateForecasts,
    getAnalytics,
    refreshData
  } = useForecasting()

  const { 
    criticalAlerts, 
    highPriorityAlerts, 
    acknowledgeAlert 
  } = useForecastAlerts()

  const { 
    successRate, 
    averageProcessingTime, 
    dataQualityScore, 
    isHealthy 
  } = useForecastMetrics()

  const { 
    recommendations, 
    urgentItems, 
    refresh: refreshRecommendations 
  } = useReorderRecommendations()

  const [analytics, setAnalytics] = useState<{ accuracy?: number; dataQualityScore?: number; trends?: unknown[]; topPerformingModels?: unknown[] } | null>(null)
  const [selectedPeriod, setSelectedPeriod] = useState<'day' | 'week' | 'month'>('week')

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const data = await getAnalytics(selectedPeriod)
        setAnalytics(data as { accuracy?: number; dataQualityScore?: number; trends?: unknown[]; topPerformingModels?: unknown[] })
      } catch (error) {
        console.error('Error loading analytics:', error)
      }
    }
    
    loadAnalytics()
  }, [selectedPeriod, getAnalytics])

  const handleGenerateForecasts = async () => {
    try {
      await generateForecasts({ priority: 'high' })
    } catch (error) {
      console.error('Error generating forecasts:', error)
    }
  }

  const handleRefreshAll = async () => {
    await Promise.all([
      refreshData(),
      refreshRecommendations()
    ])
    // Reload analytics after refresh
    try {
      const data = await getAnalytics(selectedPeriod)
      setAnalytics(data as { accuracy?: number; dataQualityScore?: number; trends?: unknown[]; topPerformingModels?: unknown[] })
    } catch (error) {
      console.error('Error loading analytics:', error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Forecasting Dashboard</h1>
          <p className="text-muted-foreground">
            AI-powered inventory forecasting and recommendations
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handleRefreshAll} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh All
          </Button>
          <Button onClick={handleGenerateForecasts} disabled={loading}>
            <TrendingUp className="h-4 w-4 mr-2" />
            Generate Forecasts
          </Button>
        </div>
      </div>

      {/* System Status */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            {isHealthy ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-red-600" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isHealthy ? 'Healthy' : 'Issues'}
            </div>
            <p className="text-xs text-muted-foreground">
              Success rate: {Math.round(successRate * 100)}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Data Quality</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(dataQualityScore * 100)}%
            </div>
            <Progress value={dataQualityScore * 100} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Urgent Items</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {urgentItems.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Require immediate attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Update</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {lastUpdate ? new Date(lastUpdate).toLocaleTimeString() : 'Never'}
            </div>
            <p className="text-xs text-muted-foreground">
              Avg processing: {Math.round(averageProcessingTime)}ms
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Critical Alerts */}
      {(criticalAlerts.length > 0 || highPriorityAlerts.length > 0) && (
        <div className="space-y-2">
          {criticalAlerts.map(alert => (
            <Alert key={alert.id} variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>{alert.message}</AlertTitle>
              <AlertDescription className="flex items-center justify-between">
                <span>{alert.actionRequired}</span>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => acknowledgeAlert(alert.id)}
                >
                  Acknowledge
                </Button>
              </AlertDescription>
            </Alert>
          ))}
          
          {highPriorityAlerts.map(alert => (
            <Alert key={alert.id}>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>{alert.message}</AlertTitle>
              <AlertDescription className="flex items-center justify-between">
                <span>{alert.actionRequired}</span>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => acknowledgeAlert(alert.id)}
                >
                  Acknowledge
                </Button>
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent Forecasts</CardTitle>
                <CardDescription>
                  Latest forecast results and confidence scores
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Forecast list implementation */}
                  <div className="text-sm text-muted-foreground">
                    Forecast data will be displayed here
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
                <CardDescription>
                  System performance and accuracy metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Forecast Accuracy</span>
                    <span className="text-sm font-medium">
                      {analytics?.accuracy ? Math.round(analytics.accuracy * 100) : 0}%
                    </span>
                  </div>
                  <Progress value={analytics?.accuracy ? analytics.accuracy * 100 : 0} />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Data Quality Score</span>
                    <span className="text-sm font-medium">
                      {Math.round(dataQualityScore * 100)}%
                    </span>
                  </div>
                  <Progress value={dataQualityScore * 100} />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Reorder Recommendations</CardTitle>
                <CardDescription>
                  Items that need reordering based on forecasts
                </CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {recommendations?.recommendations?.length > 0 ? (
                <div className="space-y-4">
                  {recommendations.recommendations.slice(0, 10).map((item: { 
                    sku: string; 
                    itemName: string; 
                    urgency: string; 
                    recommendedQuantity: number; 
                    daysUntilStockout: number;
                    currentStock: number;
                    recommendedOrder: number;
                    confidence: number;
                  }) => (
                    <div key={item.sku} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{item.itemName}</span>
                          <Badge variant={
                            item.urgency === 'high' ? 'destructive' : 
                            item.urgency === 'medium' ? 'default' : 'secondary'
                          }>
                            {item.urgency}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          SKU: {item.sku} • Current: {item.currentStock} • 
                          Recommended: {item.recommendedOrder}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          {item.daysUntilStockout} days left
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {Math.round(item.confidence * 100)}% confidence
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No recommendations available. Generate forecasts to see recommendations.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Analytics & Insights</h3>
            <div className="flex items-center space-x-2">
              <Button
                variant={selectedPeriod === 'day' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedPeriod('day')}
              >
                Day
              </Button>
              <Button
                variant={selectedPeriod === 'week' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedPeriod('week')}
              >
                Week
              </Button>
              <Button
                variant={selectedPeriod === 'month' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedPeriod('month')}
              >
                Month
              </Button>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Forecast Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  Trend analysis will be displayed here
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Model Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  Model performance metrics will be displayed here
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Forecasting Configuration</CardTitle>
              <CardDescription>
                Configure forecasting parameters and scheduling
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  Configuration options will be displayed here
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}