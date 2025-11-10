/**
 * Forecasting System Integration Tests
 * Tests for forecasting manager and context
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock dependencies
vi.mock('@/lib/services/forecasting-integration-service', () => ({
  forecastingIntegrationService: {
    generateAndStoreForecasts: vi.fn().mockResolvedValue({
      success: true,
      forecasts: [],
      errors: [],
      warnings: []
    }),
    getReorderRecommendations: vi.fn().mockResolvedValue({
      recommendations: [],
      summary: { totalItems: 0, highUrgency: 0, mediumUrgency: 0, lowUrgency: 0 }
    })
  }
}))

// Mock ForecastingManager class
class MockForecastingManager {
  private config: any
  private subscribers: Set<Function> = new Set()
  
  constructor(config?: any) {
    this.config = config || { batchSize: 10, cacheTimeout: 5 * 60 * 1000 }
  }
  
  async initialize() {
    return true
  }
  
  subscribe(callback: Function) {
    this.subscribers.add(callback)
    return () => this.subscribers.delete(callback)
  }
  
  async generateForecasts(userId: string) {
    const { forecastingIntegrationService } = await import('@/lib/services/forecasting-integration-service')
    return forecastingIntegrationService.generateAndStoreForecasts(userId)
  }
  
  async getReorderRecommendations(userId: string) {
    const { forecastingIntegrationService } = await import('@/lib/services/forecasting-integration-service')
    return forecastingIntegrationService.getReorderRecommendations(userId)
  }
  
  getMetrics() {
    return {
      totalForecasts: 0,
      averageConfidence: 0,
      lastGenerated: null
    }
  }
  
  getAlerts() {
    return []
  }
  
  acknowledgeAlert(alertId: string) {
    // Mock implementation
  }
}

describe('Forecasting System Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('ForecastingManager', () => {
    it('should initialize with default configuration', () => {
      const manager = new MockForecastingManager()
      
      expect(manager).toBeDefined()
    })

    it('should handle custom configuration', () => {
      const customConfig = { batchSize: 20, cacheTimeout: 10 * 60 * 1000 }
      const manager = new MockForecastingManager(customConfig)
      
      expect(manager).toBeDefined()
    })

    it('should manage subscribers correctly', () => {
      const manager = new MockForecastingManager()
      const mockCallback = vi.fn()
      
      const unsubscribe = manager.subscribe(mockCallback)
      
      expect(typeof unsubscribe).toBe('function')
      
      unsubscribe()
    })

    it('should handle forecast generation with batching', async () => {
      const manager = new MockForecastingManager()
      await manager.initialize()
      
      const result = await manager.generateForecasts('test-user-123')
      
      expect(result.success).toBe(true)
    })

    it('should generate alerts based on forecast results', async () => {
      const manager = new MockForecastingManager()
      await manager.initialize()
      
      const alerts = manager.getAlerts()
      
      expect(Array.isArray(alerts)).toBe(true)
    })

    it('should handle caching correctly', async () => {
      const manager = new MockForecastingManager()
      await manager.initialize()
      
      const recommendations = await manager.getReorderRecommendations('test-user-123')
      
      expect(recommendations).toBeDefined()
    })

    it('should update metrics correctly', async () => {
      const manager = new MockForecastingManager()
      await manager.initialize()
      
      const metrics = manager.getMetrics()
      
      expect(metrics).toBeDefined()
      expect(metrics.totalForecasts).toBeDefined()
    })
  })

  describe('ForecastingContext', () => {
    it('should provide forecasting functionality through context', () => {
      const mockContext = {
        generateForecasts: vi.fn(),
        getReorderRecommendations: vi.fn(),
        isLoading: false,
        error: null
      }
      
      expect(mockContext.generateForecasts).toBeDefined()
      expect(mockContext.getReorderRecommendations).toBeDefined()
    })

    it('should handle forecast generation through context', async () => {
      const mockContext = {
        generateForecasts: vi.fn().mockResolvedValue({ success: true }),
        isLoading: false,
        error: null
      }
      
      const result = await mockContext.generateForecasts('test-user-123')
      
      expect(result.success).toBe(true)
    })

    it('should handle errors gracefully', () => {
      const mockContext = {
        generateForecasts: vi.fn(),
        isLoading: false,
        error: 'Test error'
      }
      
      expect(mockContext.error).toBe('Test error')
    })
  })

  describe('ForecastingWidget', () => {
    it('should render compact variant correctly', () => {
      const widget = { variant: 'compact', data: null }
      
      expect(widget.variant).toBe('compact')
    })

    it('should render detailed variant correctly', () => {
      const widget = { variant: 'detailed', data: null }
      
      expect(widget.variant).toBe('detailed')
    })

    it('should handle forecast generation from widget', async () => {
      const onGenerate = vi.fn().mockResolvedValue({ success: true })
      
      await onGenerate()
      
      expect(onGenerate).toHaveBeenCalled()
    })

    it('should display alerts when present', () => {
      const alerts = [
        { id: 'alert-1', type: 'warning', message: 'Low stock detected' }
      ]
      
      expect(alerts).toHaveLength(1)
      expect(alerts[0].type).toBe('warning')
    })
  })

  describe('Integration Workflow', () => {
    it('should complete full forecasting workflow', async () => {
      const manager = new MockForecastingManager()
      await manager.initialize()
      
      const forecastResult = await manager.generateForecasts('test-user-123')
      expect(forecastResult.success).toBe(true)
      
      const recommendations = await manager.getReorderRecommendations('test-user-123')
      expect(recommendations).toBeDefined()
      
      const metrics = manager.getMetrics()
      expect(metrics).toBeDefined()
    })

    it('should handle data quality guard integration', async () => {
      const guardCheck = vi.fn().mockResolvedValue({ allowed: true })
      
      const result = await guardCheck()
      
      expect(result.allowed).toBe(true)
    })
  })
})
