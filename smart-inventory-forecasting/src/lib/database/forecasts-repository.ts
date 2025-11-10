/**
 * Forecasts Repository
 * Handles database operations for forecast data
 * Requirements: 3.5 - Store forecast data
 */

import { createClient } from '@/lib/supabase/server'
import { Forecast, CreateForecast, SalesData, InventoryItem } from '@/types/database'

export class ForecastsRepository {
  private async getSupabase() {
    return await createClient()
  }

  /**
   * Store forecast results in database
   */
  async createForecast(userId: string, forecast: CreateForecast): Promise<Forecast | null> {
    try {
      const supabase = await this.getSupabase()
      const { data, error } = await supabase
        .from('forecasts')
        .insert({
          user_id: userId,
          ...forecast
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating forecast:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error in createForecast:', error)
      return null
    }
  }

  /**
   * Store multiple forecasts in batch
   */
  async createBatchForecasts(userId: string, forecasts: CreateForecast[]): Promise<Forecast[]> {
    try {
      const supabase = await this.getSupabase()
      const forecastsWithUserId = forecasts.map((forecast: CreateForecast) => ({
        user_id: userId,
        ...forecast
      }))

      const { data, error } = await supabase
        .from('forecasts')
        .insert(forecastsWithUserId)
        .select()

      if (error) {
        console.error('Error creating batch forecasts:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error in createBatchForecasts:', error)
      return []
    }
  }

  /**
   * Get latest forecast for a specific SKU
   */
  async getLatestForecast(userId: string, sku: string): Promise<Forecast | null> {
    try {
      const supabase = await this.getSupabase()
      const { data, error } = await supabase
        .from('forecasts')
        .select('*')
        .eq('user_id', userId)
        .eq('sku', sku)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (error) {
        if ('code' in error && error.code === 'PGRST116') {
          // No rows returned
          return null
        }
        console.error('Error getting latest forecast:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error in getLatestForecast:', error)
      return null
    }
  }

  /**
   * Get all latest forecasts for user
   */
  async getLatestForecasts(userId: string, limit?: number): Promise<Forecast[]> {
    try {
      const supabase = await this.getSupabase()
      // Get the most recent forecast for each SKU
      const { data, error } = await supabase
        .from('forecasts')
        .select('*')
        .eq('user_id', userId)
        .order('sku')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error getting latest forecasts:', error)
        return []
      }

      // Group by SKU and take the most recent for each
      const latestBySkuMap = new Map<string, Forecast>()
      
      data?.forEach((forecast: Forecast) => {
        const existing = latestBySkuMap.get(forecast.sku)
        if (!existing || new Date(forecast.created_at) > new Date(existing.created_at)) {
          latestBySkuMap.set(forecast.sku, forecast)
        }
      })

      let results = Array.from(latestBySkuMap.values())
      
      // Apply limit if specified
      if (limit && limit > 0) {
        results = results.slice(0, limit)
      }

      return results
    } catch (error) {
      console.error('Error in getLatestForecasts:', error)
      return []
    }
  }

  /**
   * Get forecasts for specific date range
   */
  async getForecastsInDateRange(
    userId: string, 
    startDate: string, 
    endDate: string
  ): Promise<Forecast[]> {
    try {
      const supabase = await this.getSupabase()
      const { data, error } = await supabase
        .from('forecasts')
        .select('*')
        .eq('user_id', userId)
        .gte('forecast_date', startDate)
        .lte('forecast_date', endDate)
        .order('forecast_date')

      if (error) {
        console.error('Error getting forecasts in date range:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error in getForecastsInDateRange:', error)
      return []
    }
  }

  /**
   * Get sales data for forecasting
   */
  async getSalesDataForForecasting(userId: string, sku: string, days: number = 30): Promise<SalesData[]> {
    try {
      const supabase = await this.getSupabase()
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)
      const startDateStr = startDate.toISOString().split('T')[0]

      const { data, error } = await supabase
        .from('sales_data')
        .select('*')
        .eq('user_id', userId)
        .eq('sku', sku)
        .gte('sale_date', startDateStr)
        .order('sale_date')

      if (error) {
        console.error('Error getting sales data for forecasting:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error in getSalesDataForForecasting:', error)
      return []
    }
  }

  /**
   * Get inventory items that need forecasting
   */
  async getItemsNeedingForecasting(userId: string): Promise<InventoryItem[]> {
    try {
      const supabase = await this.getSupabase()
      const { data, error } = await supabase
        .from('inventory_items')
        .select('*')
        .eq('user_id', userId)
        .order('name')

      if (error) {
        console.error('Error getting items needing forecasting:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error in getItemsNeedingForecasting:', error)
      return []
    }
  }

  /**
   * Delete old forecasts to keep database clean
   */
  async cleanupOldForecasts(userId: string, daysToKeep: number = 30): Promise<boolean> {
    try {
      const supabase = await this.getSupabase()
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep)
      const cutoffDateStr = cutoffDate.toISOString().split('T')[0]

      const { error } = await supabase
        .from('forecasts')
        .delete()
        .eq('user_id', userId)
        .lt('created_at', cutoffDateStr)

      if (error) {
        console.error('Error cleaning up old forecasts:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error in cleanupOldForecasts:', error)
      return false
    }
  }

  /**
   * Get forecast statistics for user
   */
  async getForecastStatistics(userId: string): Promise<{
    totalForecasts: number
    itemsWithForecasts: number
    averageConfidence: number
    modelsUsed: Record<string, number>
  }> {
    try {
      const supabase = await this.getSupabase()
      const { data, error } = await supabase
        .from('forecasts')
        .select('sku, confidence_score, model_used')
        .eq('user_id', userId)

      if (error) {
        console.error('Error getting forecast statistics:', error)
        return {
          totalForecasts: 0,
          itemsWithForecasts: 0,
          averageConfidence: 0,
          modelsUsed: {}
        }
      }

      const forecasts = data || []
      const uniqueSkus = new Set(forecasts.map((f) => f.sku))
      const validConfidenceScores = forecasts
        .map((f) => f.confidence_score)
        .filter((score: number | null | undefined): score is number => score !== null && score !== undefined)
      
      const modelsUsed: Record<string, number> = {}
      forecasts.forEach((f) => {
        if (f.model_used) {
          modelsUsed[f.model_used] = (modelsUsed[f.model_used] || 0) + 1
        }
      })

      return {
        totalForecasts: forecasts.length,
        itemsWithForecasts: uniqueSkus.size,
        averageConfidence: validConfidenceScores.length > 0 
          ? validConfidenceScores.reduce((sum: number, score: number) => sum + score, 0) / validConfidenceScores.length
          : 0,
        modelsUsed
      }
    } catch (error) {
      console.error('Error in getForecastStatistics:', error)
      return {
        totalForecasts: 0,
        itemsWithForecasts: 0,
        averageConfidence: 0,
        modelsUsed: {}
      }
    }
  }
}

// Singleton instance
export const forecastsRepository = new ForecastsRepository()