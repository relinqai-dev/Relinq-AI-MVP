/**
 * Forecasting Context Provider
 * Robust React context for forecasting state management
 * Requirements: 3.4, 3.5, 3.6
 */

'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { forecastingManager, ForecastingState, ForecastAlert } from '@/lib/forecasting/forecasting-manager'
import { useAuth } from '@/contexts/AuthContext'

interface ForecastingContextValue extends ForecastingState {
  // Core operations
  generateForecasts: (options?: {
    skus?: string[]
    forceRefresh?: boolean
    priority?: 'high' | 'normal' | 'low'
  }) => Promise<unknown>
  
  getReorderRecommendations: (filters?: {
    urgency?: Array<'high' | 'medium' | 'low'>
    supplier?: string
    minConfidence?: number
    maxDaysUntilStockout?: number
  }) => Promise<unknown>
  
  getForecastConfidence: (sku: string) => Promise<unknown>
  
  // Analytics and insights
  getAnalytics: (period?: 'day' | 'week' | 'month') => Promise<unknown>
  
  // Alert management
  acknowledgeAlert: (alertId: string) => void
  clearAlerts: () => void
  getUnacknowledgedAlerts: () => ForecastAlert[]
  
  // Configuration
  updateConfig: (config: Partial<ForecastingState['config']>) => void
  
  // Scheduling
  scheduleAutoForecast: (schedule: {
    enabled: boolean
    frequency: 'hourly' | 'daily' | 'weekly'
    time?: string
    dayOfWeek?: number
  }) => void
  
  // Cache management
  clearCache: () => void
  refreshData: () => Promise<void>
  
  // Utilities
  getForecastBySku: (sku: string) => unknown
  getHighPriorityItems: () => unknown[]
  getDataQualityScore: () => number
}

const ForecastingContext = createContext<ForecastingContextValue | null>(null)

export function ForecastingProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [state, setState] = useState<ForecastingState>(forecastingManager.getState())
  const [initialized, setInitialized] = useState(false)

  // Initialize forecasting manager when user is available
  useEffect(() => {
    if (user?.id && !initialized) {
      forecastingManager.initialize(user.id).then(() => {
        setInitialized(true)
      }).catch(error => {
        console.error('Failed to initialize forecasting manager:', error)
      })
    }
  }, [user?.id, initialized])

  // Subscribe to state changes
  useEffect(() => {
    const unsubscribe = forecastingManager.subscribe((newState) => {
      setState(newState)
    })

    return unsubscribe
  }, [])

  // Core operations
  const generateForecasts = useCallback(async (options?: {
    skus?: string[]
    forceRefresh?: boolean
    priority?: 'high' | 'normal' | 'low'
  }) => {
    if (!initialized) {
      throw new Error('Forecasting manager not initialized')
    }
    return await forecastingManager.generateForecasts(options)
  }, [initialized])

  const getReorderRecommendations = useCallback(async (filters?: {
    urgency?: ('high' | 'medium' | 'low')[]
    supplier?: string
    minConfidence?: number
    maxDaysUntilStockout?: number
  }) => {
    if (!initialized) {
      throw new Error('Forecasting manager not initialized')
    }
    return await forecastingManager.getReorderRecommendations(filters)
  }, [initialized])

  const getForecastConfidence = useCallback(async (sku: string) => {
    if (!initialized) {
      throw new Error('Forecasting manager not initialized')
    }
    return await forecastingManager.getForecastConfidence(sku)
  }, [initialized])

  const getAnalytics = useCallback(async (period: 'day' | 'week' | 'month' = 'week') => {
    if (!initialized) {
      throw new Error('Forecasting manager not initialized')
    }
    return await forecastingManager.getAnalytics(period)
  }, [initialized])

  // Alert management
  const acknowledgeAlert = useCallback((alertId: string) => {
    forecastingManager.acknowledgeAlert(alertId)
  }, [])

  const clearAlerts = useCallback(() => {
    forecastingManager.clearAlerts()
  }, [])

  const getUnacknowledgedAlerts = useCallback(() => {
    return state.alerts.filter(alert => !alert.acknowledged)
  }, [state.alerts])

  // Configuration
  const updateConfig = useCallback((config: Partial<ForecastingState['config']>) => {
    // Implementation for updating configuration
    console.log('Updating config:', config)
  }, [])

  // Scheduling
  const scheduleAutoForecast = useCallback((schedule: {
    enabled: boolean
    frequency: 'hourly' | 'daily' | 'weekly'
    time?: string
    dayOfWeek?: number
  }) => {
    forecastingManager.scheduleAutoForecast(schedule)
  }, [])

  // Cache management
  const clearCache = useCallback(() => {
    // Implementation for clearing cache
    console.log('Clearing cache')
  }, [])

  const refreshData = useCallback(async () => {
    if (!initialized) return
    await generateForecasts({ forceRefresh: true })
  }, [initialized, generateForecasts])

  // Utilities
  const getForecastBySku = useCallback((sku: string) => {
    return state.forecasts.get(sku)
  }, [state.forecasts])

  const getHighPriorityItems = useCallback(() => {
    return Array.from(state.forecasts.values()).filter(forecast => {
      // Logic to determine high priority items
      return forecast.confidence_score && forecast.confidence_score < 0.6
    })
  }, [state.forecasts])

  const getDataQualityScore = useCallback(() => {
    const forecasts = Array.from(state.forecasts.values())
    if (forecasts.length === 0) return 0
    
    const totalScore = forecasts.reduce((sum, forecast) => {
      return sum + (forecast.data_quality_score || 0)
    }, 0)
    
    return totalScore / forecasts.length
  }, [state.forecasts])

  const contextValue: ForecastingContextValue = {
    ...state,
    generateForecasts,
    getReorderRecommendations,
    getForecastConfidence,
    getAnalytics,
    acknowledgeAlert,
    clearAlerts,
    getUnacknowledgedAlerts,
    updateConfig,
    scheduleAutoForecast,
    clearCache,
    refreshData,
    getForecastBySku,
    getHighPriorityItems,
    getDataQualityScore
  }

  return (
    <ForecastingContext.Provider value={contextValue}>
      {children}
    </ForecastingContext.Provider>
  )
}

export function useForecasting() {
  const context = useContext(ForecastingContext)
  if (!context) {
    throw new Error('useForecasting must be used within a ForecastingProvider')
  }
  return context
}

// Specialized hooks for specific use cases
export function useForecastAlerts() {
  const { alerts, acknowledgeAlert, clearAlerts, getUnacknowledgedAlerts } = useForecasting()
  
  return {
    alerts,
    unacknowledgedAlerts: getUnacknowledgedAlerts(),
    acknowledgeAlert,
    clearAlerts,
    criticalAlerts: alerts.filter(a => a.severity === 'critical'),
    highPriorityAlerts: alerts.filter(a => a.severity === 'high')
  }
}

export function useForecastMetrics() {
  const { metrics, getDataQualityScore } = useForecasting()
  
  return {
    ...metrics,
    dataQualityScore: getDataQualityScore(),
    isHealthy: metrics.successRate > 0.8 && metrics.errorCount < 5
  }
}

interface ReorderRecommendation {
  sku: string;
  itemName: string;
  urgency: string;
  recommendedQuantity?: number;
  daysUntilStockout?: number;
  currentStock?: number;
  recommendedOrder?: number;
  confidence?: number;
  unitCost?: number;
}

interface RecommendationsResult {
  recommendations?: ReorderRecommendation[];
}

interface ReorderFilters {
  urgency?: Array<'high' | 'medium' | 'low'>;
  supplier?: string;
  minConfidence?: number;
  maxDaysUntilStockout?: number;
}

export function useReorderRecommendations(autoRefresh: boolean = true) {
  const { getReorderRecommendations } = useForecasting()
  const [recommendations, setRecommendations] = useState<RecommendationsResult | null>(null)
  const [loading, setLoading] = useState(false)

  const fetchRecommendations = useCallback(async (filters?: ReorderFilters) => {
    setLoading(true)
    try {
      const result = await getReorderRecommendations(filters)
      setRecommendations(result as RecommendationsResult)
    } catch (error) {
      console.error('Error fetching recommendations:', error)
    } finally {
      setLoading(false)
    }
  }, [getReorderRecommendations])

  useEffect(() => {
    if (autoRefresh) {
      fetchRecommendations()
    }
  }, [autoRefresh, fetchRecommendations])

  return {
    recommendations,
    loading,
    refresh: fetchRecommendations,
    urgentItems: recommendations?.recommendations?.filter((r) => r.urgency === 'high') || [],
    totalValue: recommendations?.recommendations?.reduce((sum: number, r) => 
      sum + ((r.recommendedOrder || 0) * (r.unitCost || 0)), 0) || 0
  }
}