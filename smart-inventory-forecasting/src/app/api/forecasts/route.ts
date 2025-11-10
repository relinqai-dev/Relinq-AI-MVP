/**
 * Forecasts API Route
 * Handles forecast generation and retrieval
 * Requirements: 3.4, 3.5, 3.6
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { Supplier } from '@/types/database'
import { forecastingIntegrationService } from '@/lib/services/forecasting-integration-service'
import { forecastsRepository } from '@/lib/database/forecasts-repository'
import type { User } from '@supabase/supabase-js'
import { forecastingGuardMiddleware, getForecastingBlockedMessage } from '@/lib/utils/forecasting-guard'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { action } = body

    switch (action) {
      case 'generate':
        return await handleGenerateForecasts((user as User).id)
      
      case 'reorder-recommendations':
        return await handleGetReorderRecommendations((user as User).id)
      
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Error in forecasts API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const sku = searchParams.get('sku')
    const action = searchParams.get('action')

    if (action === 'statistics') {
      const stats = await forecastsRepository.getForecastStatistics((user as User).id)
      return NextResponse.json(stats)
    }

    if (action === 'confidence' && sku) {
      const confidence = await forecastingIntegrationService.getForecastConfidence((user as User).id, sku)
      return NextResponse.json(confidence)
    }

    if (sku) {
      // Get specific forecast
      const forecast = await forecastsRepository.getLatestForecast((user as User).id, sku)
      return NextResponse.json(forecast)
    } else {
      // Get all latest forecasts
      const forecasts = await forecastsRepository.getLatestForecasts((user as User).id)
      return NextResponse.json(forecasts)
    }
  } catch (error) {
    console.error('Error in forecasts GET API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function handleGenerateForecasts(userId: string) {
  try {
    // Check if forecasting is allowed (data cleanup guard)
    const guardResult = await forecastingGuardMiddleware(userId)
    
    if (!guardResult.allowed) {
      const blockedMessage = await getForecastingBlockedMessage(userId)
      return NextResponse.json({
        success: false,
        error: 'Forecasting blocked due to data quality issues',
        message: blockedMessage,
        blocked: true
      }, { status: 400 })
    }

    // Get inventory items and suppliers
    const items = await forecastsRepository.getItemsNeedingForecasting(userId)
    
    if (items.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No items found for forecasting',
        forecasts: [],
        insufficientDataItems: [],
        errors: [],
        warnings: []
      })
    }

    // Get suppliers for lead time calculation
    const supabase = await createClient()
    const { data: suppliersData } = await supabase
      .from('suppliers')
      .select('*')
      .eq('user_id', userId)

    const suppliersMap = new Map<string, Supplier>()
    suppliersData?.forEach((supplier: Supplier) => {
      suppliersMap.set(supplier.id, supplier)
    })

    // Generate forecasts
    const result = await forecastingIntegrationService.generateAndStoreForecasts(
      userId,
      items,
      suppliersMap
    )

    return NextResponse.json({
      success: result.success,
      message: `Generated ${result.forecasts.length} forecasts`,
      forecasts: result.forecasts,
      insufficientDataItems: result.insufficientDataItems,
      errors: result.errors,
      warnings: result.warnings,
      totalItems: items.length
    })
  } catch (error) {
    console.error('Error generating forecasts:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to generate forecasts',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

async function handleGetReorderRecommendations(userId: string) {
  try {
    const recommendations = await forecastingIntegrationService.getReorderRecommendations(userId)
    
    return NextResponse.json({
      success: true,
      ...recommendations
    })
  } catch (error) {
    console.error('Error getting reorder recommendations:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to get reorder recommendations',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}