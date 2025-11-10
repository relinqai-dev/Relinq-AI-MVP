/**
 * API Integration Tests
 * Tests the forecasting API endpoints
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock the dependencies
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => ({
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: 'test-user-123' } },
        error: null
      })
    }
  }))
}))

vi.mock('@/lib/services/forecasting-integration-service', () => ({
  forecastingIntegrationService: {
    generateAndStoreForecasts: vi.fn().mockResolvedValue({
      success: true,
      forecasts: [
        {
          sku: 'TEST-SKU-001',
          current_stock: 50,
          forecast_7_day: 28,
          recommended_order: 20,
          confidence_score: 0.85,
          trend: 'increasing',
          seasonality_detected: false,
          lead_time_factored: 7,
          model_used: 'ARIMA',
          data_quality_score: 0.9
        }
      ],
      insufficientDataItems: [],
      errors: [],
      warnings: []
    }),
    getReorderRecommendations: vi.fn().mockResolvedValue({
      recommendations: [
        {
          sku: 'TEST-SKU-001',
          itemName: 'Test Product',
          currentStock: 50,
          forecastedDemand: 28,
          recommendedOrder: 20,
          urgency: 'medium',
          daysUntilStockout: 5,
          confidence: 0.85,
          supplier: 'supplier-1'
        }
      ],
      summary: {
        totalItems: 1,
        highUrgency: 0,
        mediumUrgency: 1,
        lowUrgency: 0
      }
    }),
    getForecastConfidence: vi.fn().mockResolvedValue({
      confidence: 0.85,
      factors: ['High data quality', 'Upward sales trend'],
      recommendation: 'High confidence - safe to follow recommendations'
    })
  }
}))

vi.mock('@/lib/database/forecasts-repository', () => ({
  forecastsRepository: {
    getLatestForecasts: vi.fn().mockResolvedValue([
      {
        id: 'forecast-1',
        user_id: 'test-user-123',
        sku: 'TEST-SKU-001',
        forecast_date: '2024-01-15',
        forecast_quantity: 28,
        confidence_score: 0.85,
        model_used: 'ARIMA',
        recommended_order: 20,
        trend: 'increasing',
        seasonality_detected: false,
        data_quality_score: 0.9,
        created_at: '2024-01-15T00:00:00Z'
      }
    ]),
    getLatestForecast: vi.fn(),
    getForecastStatistics: vi.fn()
  }
}))

vi.mock('@/lib/utils/forecasting-guard', () => ({
  forecastingGuardMiddleware: vi.fn().mockResolvedValue({
    allowed: true,
    error: undefined
  }),
  getForecastingBlockedMessage: vi.fn().mockResolvedValue('')
}))

describe('Forecasting API Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should have forecasting service available', async () => {
    const { forecastingIntegrationService } = await import('@/lib/services/forecasting-integration-service')
    
    expect(forecastingIntegrationService.generateAndStoreForecasts).toBeDefined()
  })

  it('should handle GET requests for forecast retrieval', async () => {
    const { forecastsRepository } = await import('@/lib/database/forecasts-repository')
    
    const forecasts = await forecastsRepository.getLatestForecasts('test-user-123')
    
    expect(forecasts).toBeDefined()
    expect(Array.isArray(forecasts)).toBe(true)
    expect(forecasts.length).toBeGreaterThan(0)
  })

  it('should handle reorder recommendations requests', async () => {
    const { forecastingIntegrationService } = await import('@/lib/services/forecasting-integration-service')
    
    const result = await forecastingIntegrationService.getReorderRecommendations('test-user-123')
    
    expect(result.recommendations).toBeDefined()
    expect(result.summary).toBeDefined()
  })

  it('should handle forecast confidence requests', async () => {
    const { forecastingIntegrationService } = await import('@/lib/services/forecasting-integration-service')
    
    const result = await forecastingIntegrationService.getForecastConfidence('test-user-123', 'TEST-SKU-001')
    
    expect(result.confidence).toBeDefined()
    expect(result.factors).toBeDefined()
  })

  it('should handle data quality guard integration', async () => {
    const { forecastingGuardMiddleware } = await import('@/lib/utils/forecasting-guard')
    
    const result = await forecastingGuardMiddleware('test-user-123')
    
    expect(result.allowed).toBe(true)
  })
})
