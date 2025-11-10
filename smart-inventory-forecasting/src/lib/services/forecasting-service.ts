/**
 * Forecasting Service
 * Core forecasting algorithms and data processing
 * Requirements: 3.4, 3.5, 3.6
 */

import { SalesData, InventoryItem, Supplier } from '@/types/database'

export interface ForecastRequest {
  user_id: string
  sku: string
  sales_history: SalesDataPoint[]
  current_stock: number
  lead_time_days: number
  forecast_days: number
}

export interface SalesDataPoint {
  date: string
  quantity: number
  price?: number
}

export interface ItemForecast {
  sku: string
  current_stock: number
  forecast_7_day: number
  recommended_order: number
  confidence_score: number
  trend: 'increasing' | 'decreasing' | 'stable'
  seasonality_detected: boolean
  lead_time_factored: number
  model_used: string
  data_quality_score: number
}

export interface ForecastResponse {
  success: boolean
  forecast?: ItemForecast
  insufficient_data?: boolean
  error_message?: string
  data_quality_warnings: string[]
  minimum_data_points_required?: number
}

export interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
  minimumDataPoints: number
}

export class ForecastingService {
  private readonly MIN_DATA_POINTS = 7
  private readonly CONFIDENCE_THRESHOLD = 0.5

  /**
   * Health check for forecasting service
   */
  async healthCheck(): Promise<boolean> {
    try {
      // Simple health check - in a real implementation this would check external service
      return true
    } catch (error) {
      console.error('Forecasting service health check failed:', error)
      return false
    }
  }

  /**
   * Generate forecast for a single item
   */
  async generateForecast(request: ForecastRequest): Promise<ForecastResponse> {
    try {
      const validation = this.validateForecastData(request.sales_history, request.current_stock)
      
      if (!validation.isValid) {
        return {
          success: false,
          insufficient_data: true,
          error_message: validation.errors.join(', '),
          data_quality_warnings: validation.warnings,
          minimum_data_points_required: validation.minimumDataPoints
        }
      }

      // Calculate forecast using simple moving average (in production, use more sophisticated models)
      const forecast = this.calculateSimpleForecast(request)

      return {
        success: true,
        forecast,
        data_quality_warnings: validation.warnings
      }
    } catch (error) {
      return {
        success: false,
        error_message: error instanceof Error ? error.message : 'Unknown forecasting error',
        data_quality_warnings: []
      }
    }
  }

  /**
   * Prepare sales data for forecasting
   */
  prepareSalesData(salesData: SalesData[]): SalesDataPoint[] {
    return salesData.map(sale => ({
      date: sale.sale_date,
      quantity: sale.quantity_sold,
      price: sale.unit_price || undefined
    }))
  }

  /**
   * Calculate lead time considering supplier information
   */
  calculateLeadTime(item: InventoryItem, supplier?: Supplier): number {
    if (supplier?.lead_time_days) {
      return supplier.lead_time_days
    }
    
    if (item.lead_time_days) {
      return item.lead_time_days
    }
    
    // Default lead time
    return 7
  }

  /**
   * Validate forecast data quality
   */
  validateForecastData(salesData: SalesDataPoint[], currentStock: number): ValidationResult {
    const errors: string[] = []
    const warnings: string[] = []

    // Check minimum data points
    if (salesData.length < this.MIN_DATA_POINTS) {
      errors.push(`Insufficient sales history. Need at least ${this.MIN_DATA_POINTS} data points, got ${salesData.length}`)
    }

    // Check for negative stock
    if (currentStock < 0) {
      warnings.push('Negative current stock detected')
    }

    // Check for data gaps
    const sortedData = salesData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    if (sortedData.length > 1) {
      const daysBetween = this.calculateDaysBetween(sortedData[0].date, sortedData[sortedData.length - 1].date)
      if (daysBetween > salesData.length * 2) {
        warnings.push('Significant gaps in sales history detected')
      }
    }

    // Check for zero sales periods
    const zeroSales = salesData.filter(d => d.quantity === 0).length
    if (zeroSales > salesData.length * 0.5) {
      warnings.push('High number of zero-sales days detected')
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      minimumDataPoints: this.MIN_DATA_POINTS
    }
  }

  /**
   * Calculate simple forecast using moving average and trend analysis
   */
  private calculateSimpleForecast(request: ForecastRequest): ItemForecast {
    const { sales_history, current_stock, lead_time_days, forecast_days, sku } = request

    // Sort sales data by date
    const sortedSales = sales_history.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    // Calculate moving average
    const recentSales = sortedSales.slice(-14) // Last 14 days
    const avgDailySales = recentSales.reduce((sum, sale) => sum + sale.quantity, 0) / recentSales.length

    // Calculate trend
    const trend = this.calculateTrend(sortedSales)

    // Apply trend to forecast
    let forecastQuantity = avgDailySales * forecast_days
    if (trend === 'increasing') {
      forecastQuantity *= 1.1 // 10% increase for upward trend
    } else if (trend === 'decreasing') {
      forecastQuantity *= 0.9 // 10% decrease for downward trend
    }

    // Calculate recommended order quantity
    const safetyStock = avgDailySales * 3 // 3 days safety stock
    const leadTimeDemand = avgDailySales * lead_time_days
    const recommendedOrder = Math.max(0, leadTimeDemand + safetyStock - current_stock)

    // Calculate confidence score
    const confidence = this.calculateConfidence(sortedSales, avgDailySales)

    // Check for seasonality (simple check)
    const seasonality = this.detectSeasonality(sortedSales)

    // Calculate data quality score
    const dataQuality = this.calculateDataQuality(sortedSales)

    return {
      sku,
      current_stock,
      forecast_7_day: Math.round(forecastQuantity),
      recommended_order: Math.round(recommendedOrder),
      confidence_score: confidence,
      trend,
      seasonality_detected: seasonality,
      lead_time_factored: lead_time_days,
      model_used: 'Simple Moving Average',
      data_quality_score: dataQuality
    }
  }

  private calculateTrend(salesData: SalesDataPoint[]): 'increasing' | 'decreasing' | 'stable' {
    if (salesData.length < 4) return 'stable'

    const firstHalf = salesData.slice(0, Math.floor(salesData.length / 2))
    const secondHalf = salesData.slice(Math.floor(salesData.length / 2))

    const firstAvg = firstHalf.reduce((sum, sale) => sum + sale.quantity, 0) / firstHalf.length
    const secondAvg = secondHalf.reduce((sum, sale) => sum + sale.quantity, 0) / secondHalf.length

    const changePercent = (secondAvg - firstAvg) / firstAvg

    if (changePercent > 0.1) return 'increasing'
    if (changePercent < -0.1) return 'decreasing'
    return 'stable'
  }

  private calculateConfidence(salesData: SalesDataPoint[], avgSales: number): number {
    if (salesData.length === 0) return 0

    // Calculate coefficient of variation
    const variance = salesData.reduce((sum, sale) => {
      const diff = sale.quantity - avgSales
      return sum + (diff * diff)
    }, 0) / salesData.length

    const stdDev = Math.sqrt(variance)
    const coefficientOfVariation = avgSales > 0 ? stdDev / avgSales : 1

    // Convert to confidence score (lower variation = higher confidence)
    const confidence = Math.max(0, Math.min(1, 1 - coefficientOfVariation))

    // Adjust based on data quantity
    const dataQuantityFactor = Math.min(1, salesData.length / 30) // 30 days for full confidence

    return confidence * dataQuantityFactor
  }

  private detectSeasonality(salesData: SalesDataPoint[]): boolean {
    // Simple seasonality detection - check for weekly patterns
    if (salesData.length < 14) return false

    const weeklyTotals: number[] = []
    let currentWeekTotal = 0
    let daysInWeek = 0

    for (let i = 0; i < salesData.length; i++) {
      currentWeekTotal += salesData[i].quantity
      daysInWeek++

      if (daysInWeek === 7 || i === salesData.length - 1) {
        weeklyTotals.push(currentWeekTotal)
        currentWeekTotal = 0
        daysInWeek = 0
      }
    }

    if (weeklyTotals.length < 2) return false

    // Check for significant variation between weeks
    const avgWeekly = weeklyTotals.reduce((sum, total) => sum + total, 0) / weeklyTotals.length
    const maxWeekly = Math.max(...weeklyTotals)
    const minWeekly = Math.min(...weeklyTotals)

    return (maxWeekly - minWeekly) / avgWeekly > 0.3 // 30% variation indicates seasonality
  }

  private calculateDataQuality(salesData: SalesDataPoint[]): number {
    let score = 1.0

    // Penalize for insufficient data
    if (salesData.length < 30) {
      score *= salesData.length / 30
    }

    // Penalize for gaps in data
    const daysCovered = this.calculateDaysBetween(salesData[0].date, salesData[salesData.length - 1].date)
    const expectedDataPoints = daysCovered
    const actualDataPoints = salesData.length
    
    if (actualDataPoints < expectedDataPoints * 0.8) {
      score *= 0.8 // Penalize for missing data
    }

    // Penalize for too many zero sales
    const zeroSales = salesData.filter(d => d.quantity === 0).length
    if (zeroSales > salesData.length * 0.3) {
      score *= 0.7
    }

    return Math.max(0, Math.min(1, score))
  }

  private calculateDaysBetween(startDate: string, endDate: string): number {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const diffTime = Math.abs(end.getTime() - start.getTime())
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }
}

// Singleton instance
export const forecastingService = new ForecastingService()