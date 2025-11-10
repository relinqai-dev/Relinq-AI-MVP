/**
 * Forecasting Integration Tests
 * Tests the complete forecasting workflow
 * Requirements: 3.4, 3.5, 3.6
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { forecastingIntegrationService } from '@/lib/services/forecasting-integration-service'
import { forecastingService } from '@/lib/services/forecasting-service'
import { forecastsRepository } from '@/lib/database/forecasts-repository'
import { InventoryItem, Supplier } from '@/types/database'

// Mock the dependencies
vi.mock('@/lib/services/forecasting-service')
vi.mock('@/lib/database/forecasts-repository')

const mockForecastingService = vi.mocked(forecastingService)
const mockForecastsRepository = vi.mocked(forecastsRepository)

describe('Forecasting Integration Service', () => {
  const mockUserId = 'test-user-123'
  
  const mockInventoryItem: InventoryItem = {
    id: 'item-1',
    user_id: mockUserId,
    sku: 'TEST-SKU-001',
    name: 'Test Product',
    current_stock: 50,
    supplier_id: 'supplier-1',
    lead_time_days: 7,
    unit_cost: 10.99,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }

  const mockSupplier: Supplier = {
    id: 'supplier-1',
    user_id: mockUserId,
    name: 'Test Supplier',
    contact_email: 'supplier@test.com',
    contact_phone: '555-0123',
    lead_time_days: 5,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }

  const mockSalesData = [
    {
      id: 'sale-1',
      user_id: mockUserId,
      sku: 'TEST-SKU-001',
      quantity_sold: 5,
      sale_date: '2024-01-01',
      unit_price: 15.99,
      created_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 'sale-2',
      user_id: mockUserId,
      sku: 'TEST-SKU-001',
      quantity_sold: 3,
      sale_date: '2024-01-02',
      unit_price: 15.99,
      created_at: '2024-01-02T00:00:00Z'
    }
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('generateAndStoreForecasts', () => {
    it('should successfully generate and store forecasts', async () => {
      // Mock service health check
      mockForecastingService.healthCheck.mockResolvedValue(true)
      
      // Mock sales data retrieval
      mockForecastsRepository.getSalesDataForForecasting.mockResolvedValue(mockSalesData)
      
      // Mock data preparation
      mockForecastingService.prepareSalesData.mockReturnValue([
        { date: '2024-01-01', quantity: 5 },
        { date: '2024-01-02', quantity: 3 }
      ] as any)
      
      // Mock lead time calculation
      mockForecastingService.calculateLeadTime.mockReturnValue(7)
      
      // Mock data validation
      mockForecastingService.validateForecastData.mockReturnValue({
        isValid: true,
        errors: [],
        warnings: [],
        minimumDataPoints: 14
      })
      
      // Mock forecast generation
      mockForecastingService.generateForecast.mockResolvedValue({
        success: true,
        forecast: {
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
        },
        insufficient_data: false,
        data_quality_warnings: []
      })
      
      // Mock forecast storage
      mockForecastsRepository.createForecast.mockResolvedValue({
        id: 'forecast-1',
        user_id: mockUserId,
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
      })
      
      // Mock cleanup
      mockForecastsRepository.cleanupOldForecasts.mockResolvedValue(true)

      const suppliersMap = new Map([[mockSupplier.id, mockSupplier]])
      
      const result = await forecastingIntegrationService.generateAndStoreForecasts(
        mockUserId,
        [mockInventoryItem],
        suppliersMap
      )

      expect(result.success).toBe(true)
      expect(result.forecasts).toHaveLength(1)
      expect(result.forecasts[0].sku).toBe('TEST-SKU-001')
      expect(result.errors).toHaveLength(0)
      expect(mockForecastsRepository.createForecast).toHaveBeenCalledTimes(1)
    })

    it('should handle insufficient data gracefully', async () => {
      // Mock service health check
      mockForecastingService.healthCheck.mockResolvedValue(true)
      
      // Mock sales data retrieval with insufficient data
      mockForecastsRepository.getSalesDataForForecasting.mockResolvedValue([])
      
      // Mock data preparation
      mockForecastingService.prepareSalesData.mockReturnValue([])
      
      // Mock lead time calculation
      mockForecastingService.calculateLeadTime.mockReturnValue(7)
      
      // Mock data validation with insufficient data
      mockForecastingService.validateForecastData.mockReturnValue({
        isValid: false,
        errors: ['Insufficient sales history. Need at least 14 data points, have 0'],
        warnings: [],
        minimumDataPoints: 14
      })

      const suppliersMap = new Map([[mockSupplier.id, mockSupplier]])
      
      const result = await forecastingIntegrationService.generateAndStoreForecasts(
        mockUserId,
        [mockInventoryItem],
        suppliersMap
      )

      expect(result.success).toBe(true)
      expect(result.forecasts).toHaveLength(0)
      expect(result.insufficientDataItems).toContain('TEST-SKU-001')
      expect(mockForecastsRepository.createForecast).not.toHaveBeenCalled()
    })

    it('should handle forecasting service unavailable', async () => {
      // Mock service health check failure
      mockForecastingService.healthCheck.mockResolvedValue(false)

      const suppliersMap = new Map([[mockSupplier.id, mockSupplier]])
      
      const result = await forecastingIntegrationService.generateAndStoreForecasts(
        mockUserId,
        [mockInventoryItem],
        suppliersMap
      )

      expect(result.success).toBe(false)
      expect(result.errors).toContain('Forecasting service is not available')
      expect(mockForecastsRepository.createForecast).not.toHaveBeenCalled()
    })
  })

  describe('getForecastConfidence', () => {
    it('should return confidence analysis for existing forecast', async () => {
      const mockForecast = {
        id: 'forecast-1',
        user_id: mockUserId,
        sku: 'TEST-SKU-001',
        forecast_date: '2024-01-15',
        forecast_quantity: 28,
        confidence_score: 0.85,
        model_used: 'ARIMA',
        recommended_order: 20,
        trend: 'increasing' as const,
        seasonality_detected: true,
        data_quality_score: 0.9,
        created_at: '2024-01-15T00:00:00Z'
      }

      mockForecastsRepository.getLatestForecast.mockResolvedValue(mockForecast as any)

      const result = await forecastingIntegrationService.getForecastConfidence(
        mockUserId,
        'TEST-SKU-001'
      )

      expect(result.confidence).toBe(0.85)
      expect(result.factors).toContain('High data quality')
      expect(result.factors).toContain('Seasonal patterns detected')
      expect(result.factors).toContain('Upward sales trend')
      expect(result.recommendation).toBe('High confidence - safe to follow recommendations')
    })

    it('should handle missing forecast', async () => {
      mockForecastsRepository.getLatestForecast.mockResolvedValue(null)

      const result = await forecastingIntegrationService.getForecastConfidence(
        mockUserId,
        'TEST-SKU-001'
      )

      expect(result.confidence).toBe(0)
      expect(result.factors).toContain('No forecast available')
      expect(result.recommendation).toBe('Generate forecast first')
    })
  })

  describe('getReorderRecommendations', () => {
    it('should return prioritized reorder recommendations', async () => {
      const mockForecasts = [
        {
          id: 'forecast-1',
          user_id: mockUserId,
          sku: 'TEST-SKU-001',
          forecast_date: '2024-01-15',
          forecast_quantity: 28,
          confidence_score: 0.85,
          model_used: 'ARIMA',
          recommended_order: 20,
          trend: 'increasing' as const,
          seasonality_detected: false,
          data_quality_score: 0.9,
          created_at: '2024-01-15T00:00:00Z'
        }
      ]

      const mockItems = [mockInventoryItem]

      mockForecastsRepository.getLatestForecasts.mockResolvedValue(mockForecasts as any)
      mockForecastsRepository.getItemsNeedingForecasting.mockResolvedValue(mockItems)

      const result = await forecastingIntegrationService.getReorderRecommendations(mockUserId)

      expect(result.recommendations).toHaveLength(1)
      expect(result.recommendations[0].sku).toBe('TEST-SKU-001')
      expect(result.recommendations[0].urgency).toBeDefined()
      expect(result.summary.totalItems).toBe(1)
    })

    it('should handle empty forecasts', async () => {
      mockForecastsRepository.getLatestForecasts.mockResolvedValue([])
      mockForecastsRepository.getItemsNeedingForecasting.mockResolvedValue([])

      const result = await forecastingIntegrationService.getReorderRecommendations(mockUserId)

      expect(result.recommendations).toHaveLength(0)
      expect(result.summary.totalItems).toBe(0)
    })
  })
})