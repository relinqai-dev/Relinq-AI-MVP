/**
 * AI Recommendations API Route
 * Generates daily todo list and AI-powered recommendations
 * Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { AIAgentService, RecommendationContext } from '@/lib/services/ai-agent-service'
import { forecastsRepository } from '@/lib/database/forecasts-repository'
import { inventoryRepository } from '@/lib/database/inventory-repository'
import { suppliersRepository } from '@/lib/database/suppliers-repository'
import { salesRepository } from '@/lib/database/sales-repository'
import { handleApiError, createUnauthorizedError, createNotFoundError, createValidationError } from '@/lib/utils/api-error-handler'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      throw createUnauthorizedError()
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const includeAll = searchParams.get('includeAll') === 'true'
    const limit = parseInt(searchParams.get('limit') || '20')

    // Get latest forecasts
    const forecasts = await forecastsRepository.getLatestForecasts(user.id, limit)
    
    if (forecasts.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          date: new Date().toISOString().split('T')[0],
          urgent_actions: [],
          routine_actions: [],
          positive_status: "No forecasts available yet. Please generate forecasts first to get AI recommendations.",
          total_action_count: 0
        }
      })
    }

    // Get inventory items for forecasted SKUs
    const skus = forecasts.map(f => f.sku)
    const items = await inventoryRepository.getItemsBySKUs(user.id, skus)
    const itemsMap = new Map(items.map(item => [item.sku, item]))

    // Get suppliers
    const suppliers = await suppliersRepository.getAllSuppliers(user.id)
    const suppliersMap = new Map(suppliers.map(supplier => [supplier.id, supplier]))

    // Build recommendation contexts
    const contexts: RecommendationContext[] = []

    for (const forecast of forecasts) {
      const item = itemsMap.get(forecast.sku)
      if (!item) continue

      // Get recent sales data (last 30 days)
      const recentSales = await salesRepository.getSalesDataForItem(user.id, forecast.sku, 30)
      
      // Calculate average daily sales
      const totalSales = recentSales.reduce((sum, sale) => sum + sale.quantity_sold, 0)
      const averageDailySales = recentSales.length > 0 ? totalSales / 30 : 0

      // Calculate days until stockout
      const dailyDemand = forecast.forecast_quantity / 7 // 7-day forecast
      const daysUntilStockout = dailyDemand > 0 ? Math.floor(item.current_stock / dailyDemand) : 999

      // Only include items that need action or if includeAll is true
      if (includeAll || daysUntilStockout <= 14 || item.current_stock <= 0) {
        contexts.push({
          item,
          forecast: {
            sku: forecast.sku,
            current_stock: item.current_stock,
            forecast_7_day: forecast.forecast_quantity,
            recommended_order: forecast.recommended_order || 0,
            confidence_score: forecast.confidence_score || 0.5,
            trend: forecast.trend || 'stable',
            seasonality_detected: forecast.seasonality_detected || false,
            lead_time_factored: item.lead_time_days || 7
          },
          supplier: item.supplier_id ? suppliersMap.get(item.supplier_id) : undefined,
          recentSales,
          averageDailySales,
          daysUntilStockout
        })
      }
    }

    // Generate AI recommendations
    const aiAgentService = new AIAgentService()
    const todoList = await aiAgentService.generateDailyTodoList(user.id, contexts)

    return NextResponse.json({
      success: true,
      data: todoList
    })

  } catch (error) {
    return handleApiError(error, 'GET /api/ai-recommendations')
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      throw createUnauthorizedError()
    }

    const body = await request.json()
    const { sku } = body

    if (!sku) {
      throw createValidationError('sku', 'SKU is required')
    }

    // Get specific item and forecast
    const item = await inventoryRepository.getItemBySKU(user.id, sku)
    if (!item) {
      throw createNotFoundError('Item')
    }

    const forecast = await forecastsRepository.getLatestForecast(user.id, sku)
    if (!forecast) {
      throw createNotFoundError('Forecast')
    }

    // Get supplier if assigned
    const supplierResult = item.supplier_id 
      ? await suppliersRepository.getSupplierById(user.id, item.supplier_id)
      : null
    const supplier = supplierResult || undefined

    // Get recent sales data
    const recentSales = await salesRepository.getSalesDataForItem(user.id, sku, 30)
    const totalSales = recentSales.reduce((sum, sale) => sum + sale.quantity_sold, 0)
    const averageDailySales = recentSales.length > 0 ? totalSales / 30 : 0

    // Calculate days until stockout
    const dailyDemand = forecast.forecast_quantity / 7
    const daysUntilStockout = dailyDemand > 0 ? Math.floor(item.current_stock / dailyDemand) : 999

    // Build context
    const context: RecommendationContext = {
      item,
      forecast: {
        sku: forecast.sku,
        current_stock: item.current_stock,
        forecast_7_day: forecast.forecast_quantity,
        recommended_order: forecast.recommended_order || 0,
        confidence_score: forecast.confidence_score || 0.5,
        trend: forecast.trend || 'stable',
        seasonality_detected: forecast.seasonality_detected || false,
        lead_time_factored: item.lead_time_days || 7
      },
      supplier,
      recentSales,
      averageDailySales,
      daysUntilStockout
    }

    // Generate single recommendation
    const aiAgentService = new AIAgentService()
    const recommendation = await aiAgentService.generateRecommendation(context)

    return NextResponse.json({
      success: true,
      data: recommendation
    })

  } catch (error) {
    return handleApiError(error, 'POST /api/ai-recommendations')
  }
}