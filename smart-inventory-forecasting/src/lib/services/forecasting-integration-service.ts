/**
 * Forecasting Integration Service
 * Orchestrates forecast generation and storage
 * Requirements: 3.4, 3.5, 3.6
 */

import { forecastingService, ForecastRequest, ItemForecast } from './forecasting-service'
import { forecastsRepository } from '../database/forecasts-repository'
import { CreateForecast, InventoryItem, Supplier } from '@/types/database'

export interface ForecastIntegrationResult {
    success: boolean
    forecasts: ItemForecast[]
    insufficientDataItems: string[]
    errors: string[]
    warnings: string[]
}

export class ForecastingIntegrationService {
    /**
     * Generate and store forecasts for all user items
     * Requirements: 3.4, 3.5 - Factor in lead times and store structured data
     */
    async generateAndStoreForecasts(
        userId: string,
        items: InventoryItem[],
        suppliers: Map<string, Supplier>
    ): Promise<ForecastIntegrationResult> {
        const result: ForecastIntegrationResult = {
            success: true,
            forecasts: [],
            insufficientDataItems: [],
            errors: [],
            warnings: []
        }

        try {
            // Check if forecasting service is healthy
            const isHealthy = await forecastingService.healthCheck()
            if (!isHealthy) {
                result.success = false
                result.errors.push('Forecasting service is not available')
                return result
            }

            // Process each item
            for (const item of items) {
                try {
                    const forecast = await this.generateForecastForItem(userId, item, suppliers.get(item.supplier_id || ''))

                    if (forecast.success && forecast.forecast) {
                        // Store forecast in database
                        const storedForecast = await this.storeForecast(userId, forecast.forecast)
                        if (storedForecast) {
                            result.forecasts.push(forecast.forecast)
                        } else {
                            result.errors.push(`Failed to store forecast for ${item.sku}`)
                        }
                    } else if (forecast.insufficient_data) {
                        result.insufficientDataItems.push(item.sku)
                    } else {
                        result.errors.push(`Failed to generate forecast for ${item.sku}: ${forecast.error_message}`)
                    }

                    // Add any warnings
                    if (forecast.data_quality_warnings.length > 0) {
                        result.warnings.push(...forecast.data_quality_warnings.map(w => `${item.sku}: ${w}`))
                    }
                } catch (error) {
                    result.errors.push(`Error processing ${item.sku}: ${error instanceof Error ? error.message : 'Unknown error'}`)
                }
            }

            // Clean up old forecasts
            await forecastsRepository.cleanupOldForecasts(userId, 30)

        } catch (error) {
            result.success = false
            result.errors.push(`Integration error: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }

        return result
    }

    /**
     * Generate forecast for a single item
     * Requirements: 3.4 - Factor in supplier lead times
     */
    private async generateForecastForItem(
        userId: string,
        item: InventoryItem,
        supplier?: Supplier
    ) {
        // Get sales data for the item
        const salesData = await forecastsRepository.getSalesDataForForecasting(userId, item.sku, 60) // 60 days of history

        // Prepare sales data for forecasting service
        const salesDataPoints = forecastingService.prepareSalesData(salesData)

        // Calculate lead time
        const leadTime = forecastingService.calculateLeadTime(item, supplier)

        // Validate data before sending
        const validation = forecastingService.validateForecastData(salesDataPoints, item.current_stock)

        if (!validation.isValid) {
            return {
                success: false,
                insufficient_data: true,
                error_message: validation.errors.join(', '),
                data_quality_warnings: validation.warnings,
                minimum_data_points_required: validation.minimumDataPoints
            }
        }

        // Create forecast request
        const forecastRequest: ForecastRequest = {
            user_id: userId,
            sku: item.sku,
            sales_history: salesDataPoints,
            current_stock: item.current_stock,
            lead_time_days: leadTime,
            forecast_days: 7
        }

        // Generate forecast
        return await forecastingService.generateForecast(forecastRequest)
    }

    /**
     * Store forecast in database
     * Requirements: 3.5 - Store structured forecast data
     */
    private async storeForecast(userId: string, forecast: ItemForecast): Promise<boolean> {
        try {
            const createForecast: CreateForecast = {
                sku: forecast.sku,
                forecast_date: new Date().toISOString().split('T')[0], // Today's date
                forecast_quantity: forecast.forecast_7_day,
                confidence_score: forecast.confidence_score,
                model_used: forecast.model_used,
                recommended_order: forecast.recommended_order,
                trend: forecast.trend,
                seasonality_detected: forecast.seasonality_detected,
                data_quality_score: forecast.data_quality_score
            }

            const stored = await forecastsRepository.createForecast(userId, createForecast)
            return stored !== null
        } catch (error) {
            console.error('Error storing forecast:', error)
            return false
        }
    }

    /**
     * Get forecast confidence scoring
     * Requirements: 3.5 - Forecast confidence scoring and validation
     */
    async getForecastConfidence(userId: string, sku: string): Promise<{
        confidence: number
        factors: string[]
        recommendation: string
    }> {
        try {
            const forecast = await forecastsRepository.getLatestForecast(userId, sku)

            if (!forecast) {
                return {
                    confidence: 0,
                    factors: ['No forecast available'],
                    recommendation: 'Generate forecast first'
                }
            }

            const factors: string[] = []
            let confidence = forecast.confidence_score || 0

            // Analyze confidence factors
            if (forecast.data_quality_score && forecast.data_quality_score > 0.8) {
                factors.push('High data quality')
            } else if (forecast.data_quality_score && forecast.data_quality_score < 0.5) {
                factors.push('Low data quality - consider more historical data')
                confidence *= 0.8
            }

            if (forecast.seasonality_detected) {
                factors.push('Seasonal patterns detected')
            }

            if (forecast.trend === 'increasing') {
                factors.push('Upward sales trend')
            } else if (forecast.trend === 'decreasing') {
                factors.push('Downward sales trend')
            }

            // Generate recommendation based on confidence
            let recommendation: string
            if (confidence > 0.8) {
                recommendation = 'High confidence - safe to follow recommendations'
            } else if (confidence > 0.6) {
                recommendation = 'Moderate confidence - monitor closely'
            } else {
                recommendation = 'Low confidence - consider manual review'
            }

            return {
                confidence,
                factors,
                recommendation
            }
        } catch (error) {
            console.error('Error getting forecast confidence:', error)
            return {
                confidence: 0,
                factors: ['Error calculating confidence'],
                recommendation: 'Unable to assess forecast reliability'
            }
        }
    }

    /**
     * Get reorder recommendations with lead time calculations
     * Requirements: 3.4, 3.5 - Lead time calculation and structured output
     */
    async getReorderRecommendations(userId: string): Promise<{
        recommendations: Array<{
            sku: string
            itemName: string
            currentStock: number
            forecastedDemand: number
            recommendedOrder: number
            urgency: 'high' | 'medium' | 'low'
            daysUntilStockout: number
            confidence: number
            supplier?: string
        }>
        summary: {
            totalItems: number
            highUrgency: number
            mediumUrgency: number
            lowUrgency: number
        }
    }> {
        try {
            const forecasts = await forecastsRepository.getLatestForecasts(userId)
            const items = await forecastsRepository.getItemsNeedingForecasting(userId)

            const itemsMap = new Map(items.map(item => [item.sku, item]))
            const recommendations = []

            for (const forecast of forecasts) {
                const item = itemsMap.get(forecast.sku)
                if (!item) continue

                // Calculate days until stockout
                const dailyDemand = forecast.forecast_quantity / 7 // 7-day forecast
                const daysUntilStockout = dailyDemand > 0 ? Math.floor(item.current_stock / dailyDemand) : 999

                // Determine urgency
                let urgency: 'high' | 'medium' | 'low'
                if (daysUntilStockout <= 3 || item.current_stock <= 0) {
                    urgency = 'high'
                } else if (daysUntilStockout <= 7) {
                    urgency = 'medium'
                } else {
                    urgency = 'low'
                }

                recommendations.push({
                    sku: forecast.sku,
                    itemName: item.name,
                    currentStock: item.current_stock,
                    forecastedDemand: forecast.forecast_quantity,
                    recommendedOrder: forecast.recommended_order || 0,
                    urgency,
                    daysUntilStockout,
                    confidence: forecast.confidence_score || 0,
                    supplier: item.supplier_id || undefined
                })
            }

            // Sort by urgency and days until stockout
            recommendations.sort((a, b) => {
                const urgencyOrder = { high: 3, medium: 2, low: 1 }
                if (urgencyOrder[a.urgency] !== urgencyOrder[b.urgency]) {
                    return urgencyOrder[b.urgency] - urgencyOrder[a.urgency]
                }
                return a.daysUntilStockout - b.daysUntilStockout
            })

            // Calculate summary
            const summary = {
                totalItems: recommendations.length,
                highUrgency: recommendations.filter(r => r.urgency === 'high').length,
                mediumUrgency: recommendations.filter(r => r.urgency === 'medium').length,
                lowUrgency: recommendations.filter(r => r.urgency === 'low').length
            }

            return { recommendations, summary }
        } catch (error) {
            console.error('Error getting reorder recommendations:', error)
            return {
                recommendations: [],
                summary: { totalItems: 0, highUrgency: 0, mediumUrgency: 0, lowUrgency: 0 }
            }
        }
    }
}

// Singleton instance
export const forecastingIntegrationService = new ForecastingIntegrationService()