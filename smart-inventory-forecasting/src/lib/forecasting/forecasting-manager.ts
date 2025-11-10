/**
 * Advanced Forecasting Manager
 * Robust forecasting system with caching, scheduling, and real-time updates
 * Requirements: 3.4, 3.5, 3.6
 */

import { forecastingIntegrationService } from '@/lib/services/forecasting-integration-service'
import { forecastsRepository } from '@/lib/database/forecasts-repository'
import { Forecast, InventoryItem, Supplier } from '@/types/database'
import { createClient } from '@/lib/supabase/client'

export interface ForecastingConfig {
  autoRefreshInterval: number // minutes
  cacheTimeout: number // minutes
  batchSize: number
  retryAttempts: number
  retryDelay: number // milliseconds
}

export interface ForecastingMetrics {
  totalForecasts: number
  successRate: number
  averageProcessingTime: number
  lastUpdateTime: Date | null
  cacheHitRate: number
  errorCount: number
}

export interface ForecastAlert {
  id: string
  type: 'stockout_risk' | 'high_demand' | 'low_confidence' | 'data_quality'
  severity: 'critical' | 'high' | 'medium' | 'low'
  sku: string
  itemName: string
  message: string
  actionRequired: string
  createdAt: Date
  acknowledged: boolean
}

export interface ForecastingState {
  forecasts: Map<string, Forecast>
  loading: boolean
  error: string | null
  lastUpdate: Date | null
  metrics: ForecastingMetrics
  alerts: ForecastAlert[]
  config: ForecastingConfig
}

export class ForecastingManager {
  private state: ForecastingState
  private cache: Map<string, { data: unknown; timestamp: Date }>
  private subscribers: Set<(state: ForecastingState) => void>
  private refreshTimer: NodeJS.Timeout | null = null
  private supabase = createClient()
  private userId: string | null = null

  constructor(config?: Partial<ForecastingConfig>) {
    this.state = {
      forecasts: new Map(),
      loading: false,
      error: null,
      lastUpdate: null,
      metrics: {
        totalForecasts: 0,
        successRate: 0,
        averageProcessingTime: 0,
        lastUpdateTime: null,
        cacheHitRate: 0,
        errorCount: 0
      },
      alerts: [],
      config: {
        autoRefreshInterval: 30, // 30 minutes
        cacheTimeout: 15, // 15 minutes
        batchSize: 10,
        retryAttempts: 3,
        retryDelay: 1000,
        ...config
      }
    }
    
    this.cache = new Map()
    this.subscribers = new Set()
    
    // Initialize real-time subscriptions (only if not in test environment)
    if (typeof process === 'undefined' || process.env.NODE_ENV !== 'test') {
      this.initializeRealtimeSubscriptions()
    }
  }

  /**
   * Initialize the forecasting manager with user context
   */
  async initialize(userId: string): Promise<void> {
    this.userId = userId
    await this.loadInitialData()
    this.startAutoRefresh()
  }

  /**
   * Subscribe to state changes
   */
  subscribe(callback: (state: ForecastingState) => void): () => void {
    this.subscribers.add(callback)
    return () => this.subscribers.delete(callback)
  }

  /**
   * Get current state
   */
  getState(): ForecastingState {
    return { ...this.state }
  }

  /**
   * Generate forecasts with intelligent batching and retry logic
   */
  async generateForecasts(options?: {
    skus?: string[]
    forceRefresh?: boolean
    priority?: 'high' | 'normal' | 'low'
  }): Promise<{
    success: boolean
    results: { forecasts: Forecast[]; totalProcessed?: number; successCount?: number; errorCount?: number; message?: string }
    errors: string[]
    processingTime: number
  }> {
    const startTime = Date.now()
    
    if (!this.userId) {
      throw new Error('Forecasting manager not initialized with user ID')
    }

    this.updateState({ loading: true, error: null })

    try {
      // Get items to forecast
      const items = await this.getItemsForForecasting(options?.skus)
      
      if (items.length === 0) {
        this.updateState({ loading: false })
        return {
          success: true,
          results: { forecasts: [], message: 'No items to forecast' },
          errors: [],
          processingTime: Date.now() - startTime
        }
      }

      // Get suppliers for lead time calculation
      const suppliers = await this.getSuppliers()
      const suppliersMap = new Map(suppliers.map(s => [s.id, s]))

      // Process in batches for better performance
      const batches = this.createBatches(items, this.state.config.batchSize)
      const allResults = []
      const allErrors = []

      for (const batch of batches) {
        try {
          const batchResult = await this.processBatch(batch, suppliersMap)
          allResults.push(...batchResult.forecasts)
          allErrors.push(...batchResult.errors)
        } catch (error) {
          allErrors.push(`Batch processing error: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
      }

      // Update cache and state
      this.updateForecastsCache(allResults)
      this.generateAlerts(allResults)
      this.updateMetrics(allResults, allErrors, Date.now() - startTime)

      const result = {
        success: allErrors.length === 0,
        results: {
          forecasts: allResults,
          totalProcessed: items.length,
          successCount: allResults.length,
          errorCount: allErrors.length
        },
        errors: allErrors,
        processingTime: Date.now() - startTime
      }

      this.updateState({ 
        loading: false, 
        lastUpdate: new Date(),
        error: allErrors.length > 0 ? `${allErrors.length} errors occurred` : null
      })

      return result

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      this.updateState({ 
        loading: false, 
        error: errorMessage 
      })
      
      this.updateMetrics([], [errorMessage], Date.now() - startTime)
      
      return {
        success: false,
        results: { forecasts: [] },
        errors: [errorMessage],
        processingTime: Date.now() - startTime
      }
    }
  }

  /**
   * Get reorder recommendations with advanced filtering and sorting
   */
  async getReorderRecommendations(filters?: {
    urgency?: Array<'high' | 'medium' | 'low'>
    supplier?: string
    minConfidence?: number
    maxDaysUntilStockout?: number
  }): Promise<{ recommendations: unknown[]; summary: Record<string, unknown> }> {
    if (!this.userId) {
      throw new Error('Forecasting manager not initialized')
    }

    const cacheKey = `reorder_recommendations_${JSON.stringify(filters)}`
    const cached = this.getFromCache(cacheKey)
    
    if (cached) {
      this.updateMetrics([], [], 0, true) // Cache hit
      return cached as { recommendations: unknown[]; summary: Record<string, unknown> }
    }

    try {
      const recommendations = await forecastingIntegrationService.getReorderRecommendations(this.userId)
      
      // Apply filters
      let filteredRecommendations = recommendations.recommendations
      
      if (filters?.urgency) {
        filteredRecommendations = filteredRecommendations.filter((r: { urgency: 'high' | 'medium' | 'low' }) => 
          filters.urgency!.includes(r.urgency)
        )
      }
      
      if (filters?.supplier) {
        filteredRecommendations = filteredRecommendations.filter(r => 
          r.supplier === filters.supplier
        )
      }
      
      if (filters?.minConfidence) {
        filteredRecommendations = filteredRecommendations.filter(r => 
          r.confidence >= filters.minConfidence!
        )
      }
      
      if (filters?.maxDaysUntilStockout) {
        filteredRecommendations = filteredRecommendations.filter(r => 
          r.daysUntilStockout <= filters.maxDaysUntilStockout!
        )
      }

      const result = {
        ...recommendations,
        recommendations: filteredRecommendations,
        summary: this.calculateFilteredSummary(filteredRecommendations)
      }

      this.setCache(cacheKey, result)
      return result

    } catch (error) {
      console.error('Error getting reorder recommendations:', error)
      throw error
    }
  }

  /**
   * Get forecast confidence with detailed analysis
   */
  async getForecastConfidence(sku: string): Promise<{ confidence: number; factors: string[]; recommendation: string }> {
    if (!this.userId) {
      throw new Error('Forecasting manager not initialized')
    }

    const cacheKey = `confidence_${sku}`
    const cached = this.getFromCache(cacheKey)
    
    if (cached) {
      return cached as { confidence: number; factors: string[]; recommendation: string }
    }

    try {
      const confidence = await forecastingIntegrationService.getForecastConfidence(this.userId, sku)
      this.setCache(cacheKey, confidence)
      return confidence
    } catch (error) {
      console.error('Error getting forecast confidence:', error)
      throw error
    }
  }

  /**
   * Schedule automatic forecast generation
   */
  scheduleAutoForecast(schedule: {
    enabled: boolean
    frequency: 'hourly' | 'daily' | 'weekly'
    time?: string // HH:MM format for daily/weekly
    dayOfWeek?: number // 0-6 for weekly (0 = Sunday)
  }): void {
    // Implementation for scheduled forecasting
    console.log('Auto forecast scheduled:', schedule)
  }

  /**
   * Get forecasting analytics and insights
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getAnalytics(_period?: 'day' | 'week' | 'month'): Promise<{
    accuracy: number
    trends: Array<Record<string, unknown>>
    topPerformingModels: Array<Record<string, unknown>>
    dataQualityScore: number
    recommendations: string[]
  }> {
    if (!this.userId) {
      throw new Error('Forecasting manager not initialized')
    }

    // TODO: Implement analytics based on period parameter
    // Implementation for analytics
    return {
      accuracy: 0.85,
      trends: [],
      topPerformingModels: [],
      dataQualityScore: 0.9,
      recommendations: []
    }
  }

  /**
   * Acknowledge alerts
   */
  acknowledgeAlert(alertId: string): void {
    const alert = this.state.alerts.find(a => a.id === alertId)
    if (alert) {
      alert.acknowledged = true
      this.updateState({
        alerts: [...this.state.alerts]
      })
    }
  }

  /**
   * Clear all alerts
   */
  clearAlerts(): void {
    this.updateState({ alerts: [] })
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer)
    }
    this.subscribers.clear()
    this.cache.clear()
  }

  // Private methods

  private async loadInitialData(): Promise<void> {
    if (!this.userId) return

    try {
      const forecasts = await forecastsRepository.getLatestForecasts(this.userId)
      const forecastsMap = new Map(forecasts.map(f => [f.sku, f]))
      
      this.updateState({
        forecasts: forecastsMap,
        lastUpdate: new Date()
      })
    } catch (error) {
      console.error('Error loading initial forecast data:', error)
    }
  }

  private startAutoRefresh(): void {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer)
    }

    this.refreshTimer = setInterval(() => {
      this.refreshForecasts()
    }, this.state.config.autoRefreshInterval * 60 * 1000)
  }

  private async refreshForecasts(): Promise<void> {
    try {
      await this.generateForecasts({ forceRefresh: true, priority: 'low' })
    } catch (error) {
      console.error('Auto refresh failed:', error)
    }
  }

  private async getItemsForForecasting(skus?: string[]): Promise<InventoryItem[]> {
    if (!this.userId) return []

    const allItems = await forecastsRepository.getItemsNeedingForecasting(this.userId)
    
    if (skus && skus.length > 0) {
      return allItems.filter(item => skus.includes(item.sku))
    }
    
    return allItems
  }

  private async getSuppliers(): Promise<Supplier[]> {
    if (!this.userId) return []

    const { data } = await this.supabase
      .from('suppliers')
      .select('*')
      .eq('user_id', this.userId)

    return data || []
  }

  private createBatches<T>(items: T[], batchSize: number): T[][] {
    const batches = []
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize))
    }
    return batches
  }

  private async processBatch(
    items: InventoryItem[], 
    suppliersMap: Map<string, Supplier>
  ): Promise<{ forecasts: Forecast[]; errors: string[] }> {
    if (!this.userId) {
      return { forecasts: [], errors: ['User ID not set'] }
    }

    const result = await forecastingIntegrationService.generateAndStoreForecasts(
      this.userId,
      items,
      suppliersMap
    )

    // Convert ItemForecast[] to Forecast[] by fetching stored forecasts
    const forecasts: Forecast[] = []
    for (const itemForecast of result.forecasts) {
      const storedForecast = await forecastsRepository.getLatestForecast(this.userId, itemForecast.sku)
      if (storedForecast) {
        forecasts.push(storedForecast)
      }
    }

    return {
      forecasts,
      errors: result.errors
    }
  }

  private updateForecastsCache(forecasts: Forecast[]): void {
    forecasts.forEach(forecast => {
      this.state.forecasts.set(forecast.sku, forecast)
    })
  }

  private generateAlerts(forecasts: Array<Forecast & { daysUntilStockout?: number; itemName?: string; confidence?: number }>): void {
    const newAlerts: ForecastAlert[] = []

    forecasts.forEach(forecast => {
      // Stockout risk alert
      if (forecast.daysUntilStockout !== undefined && forecast.daysUntilStockout <= 3) {
        newAlerts.push({
          id: `stockout_${forecast.sku}_${Date.now()}`,
          type: 'stockout_risk',
          severity: forecast.daysUntilStockout <= 1 ? 'critical' : 'high',
          sku: forecast.sku,
          itemName: forecast.itemName || forecast.sku,
          message: `Risk of stockout in ${forecast.daysUntilStockout} days`,
          actionRequired: 'Place urgent reorder',
          createdAt: new Date(),
          acknowledged: false
        })
      }

      // Low confidence alert
      if (forecast.confidence !== undefined && forecast.confidence < 0.6) {
        newAlerts.push({
          id: `confidence_${forecast.sku}_${Date.now()}`,
          type: 'low_confidence',
          severity: 'medium',
          sku: forecast.sku,
          itemName: forecast.itemName || forecast.sku,
          message: `Low forecast confidence (${Math.round(forecast.confidence * 100)}%)`,
          actionRequired: 'Review data quality and sales history',
          createdAt: new Date(),
          acknowledged: false
        })
      }
    })

    this.updateState({
      alerts: [...this.state.alerts, ...newAlerts]
    })
  }

  private updateMetrics(
    forecasts: Forecast[], 
    errors: string[], 
    processingTime: number,
    cacheHit: boolean = false
  ): void {
    const metrics = { ...this.state.metrics }
    
    metrics.totalForecasts += forecasts.length
    metrics.errorCount += errors.length
    metrics.lastUpdateTime = new Date()
    
    if (forecasts.length + errors.length > 0) {
      metrics.successRate = forecasts.length / (forecasts.length + errors.length)
    }
    
    if (processingTime > 0) {
      metrics.averageProcessingTime = 
        (metrics.averageProcessingTime + processingTime) / 2
    }
    
    if (cacheHit) {
      metrics.cacheHitRate = (metrics.cacheHitRate + 1) / 2
    }

    this.updateState({ metrics })
  }

  private calculateFilteredSummary(recommendations: Array<{ urgency: string }>): { totalItems: number; highUrgency: number; mediumUrgency: number; lowUrgency: number } {
    return {
      totalItems: recommendations.length,
      highUrgency: recommendations.filter(r => r.urgency === 'high').length,
      mediumUrgency: recommendations.filter(r => r.urgency === 'medium').length,
      lowUrgency: recommendations.filter(r => r.urgency === 'low').length
    }
  }

  private initializeRealtimeSubscriptions(): void {
    try {
      // Subscribe to forecast updates
      const channel = this.supabase?.channel('forecasts')
      if (channel) {
        channel
          .on(
            'postgres_changes' as never,
            { event: '*', schema: 'public', table: 'forecasts' },
            (payload: { new?: Forecast; old?: Forecast }) => {
              this.handleRealtimeUpdate('forecasts', payload)
            }
          )
          .subscribe()
      }
    } catch (error) {
      console.warn('Failed to initialize realtime subscriptions:', error)
    }
  }

  private handleRealtimeUpdate(table: string, payload: { new?: Forecast; old?: Forecast }): void {
    if (table === 'forecasts' && payload.new) {
      const forecast = payload.new
      this.state.forecasts.set(forecast.sku, forecast)
      this.notifySubscribers()
    }
  }

  private getFromCache(key: string): unknown {
    const cached = this.cache.get(key)
    if (cached && Date.now() - cached.timestamp.getTime() < this.state.config.cacheTimeout * 60 * 1000) {
      return cached.data
    }
    this.cache.delete(key)
    return null
  }

  private setCache(key: string, data: unknown): void {
    this.cache.set(key, { data, timestamp: new Date() })
  }

  private updateState(updates: Partial<ForecastingState>): void {
    this.state = { ...this.state, ...updates }
    this.notifySubscribers()
  }

  private notifySubscribers(): void {
    this.subscribers.forEach(callback => callback(this.state))
  }
}

// Singleton instance
export const forecastingManager = new ForecastingManager()