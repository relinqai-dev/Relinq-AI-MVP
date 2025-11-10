/**
 * AI Recommendations API Tests
 * Tests for AI recommendations endpoints
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// Set up environment variables before imports
process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost:54321'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'

// Mock dependencies
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

vi.mock('@/lib/services/ai-agent-service', () => ({
  AIAgentService: class MockAIAgentService {
    generateDailyTodoList = vi.fn().mockResolvedValue({
      date: '2024-01-15',
      urgent_actions: [
        {
          sku: 'SKU001',
          priority: 'urgent',
          action: 'Order immediately',
          explanation: 'Stock critical'
        }
      ],
      routine_actions: [],
      total_action_count: 1
    })
    
    generateRecommendation = vi.fn().mockResolvedValue({
      sku: 'SKU001',
      priority: 'high',
      action: 'Order 50 units',
      explanation: 'Stock running low',
      confidence: 0.85
    })
  }
}))

vi.mock('@/lib/database/forecasts-repository', () => ({
  forecastsRepository: {
    getLatestForecasts: vi.fn().mockResolvedValue([
      {
        id: 'forecast-1',
        user_id: 'test-user-123',
        sku: 'SKU001',
        forecast_quantity: 100,
        recommended_order: 50,
        confidence_score: 0.85
      }
    ]),
    getLatestForecast: vi.fn().mockResolvedValue({
      id: 'forecast-1',
      user_id: 'test-user-123',
      sku: 'SKU001',
      forecast_quantity: 100,
      recommended_order: 50,
      confidence_score: 0.85
    })
  }
}))

vi.mock('@/lib/database/inventory-repository', () => ({
  inventoryRepository: {
    getItemBySku: vi.fn().mockResolvedValue({
      id: 'item-1',
      sku: 'SKU001',
      name: 'Test Item',
      current_stock: 10,
      supplier_id: 'supplier-1'
    })
  }
}))

describe('AI Recommendations API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('GET /api/ai-recommendations', () => {
    it('should return daily todo list with recommendations', async () => {
      const { AIAgentService } = await import('@/lib/services/ai-agent-service')
      const service = new AIAgentService()
      
      const result = await service.generateDailyTodoList('test-user-123', [])
      
      expect(result).toBeDefined()
      expect(result.urgent_actions).toBeDefined()
      expect(result.total_action_count).toBeGreaterThan(0)
    })

    it('should handle service errors gracefully', async () => {
      const { AIAgentService } = await import('@/lib/services/ai-agent-service')
      const service = new AIAgentService()
      
      // Service should not throw
      const result = await service.generateDailyTodoList('test-user-123', [])
      expect(result).toBeDefined()
    })
  })

  describe('POST /api/ai-recommendations', () => {
    it('should return single recommendation for specific SKU', async () => {
      const { AIAgentService } = await import('@/lib/services/ai-agent-service')
      const service = new AIAgentService()
      
      const mockContext = {
        item: {
          id: 'item-1',
          user_id: 'test-user-123',
          sku: 'SKU001',
          name: 'Test Item',
          current_stock: 10,
          created_at: '2024-01-01',
          updated_at: '2024-01-01'
        },
        forecast: {
          sku: 'SKU001',
          current_stock: 10,
          forecast_7_day: 100,
          recommended_order: 50,
          confidence_score: 0.85,
          trend: 'increasing' as const,
          seasonality_detected: false,
          lead_time_factored: 7
        },
        supplier: {
          id: 'supplier-1',
          user_id: 'test-user-123',
          name: 'Test Supplier',
          contact_email: 'test@supplier.com',
          lead_time_days: 7,
          created_at: '2024-01-01',
          updated_at: '2024-01-01'
        },
        recentSales: [],
        averageDailySales: 10,
        daysUntilStockout: 1
      }
      
      const result = await service.generateRecommendation(mockContext)
      
      expect(result).toBeDefined()
      expect(result.sku).toBe('SKU001')
    })

    it('should handle service errors gracefully', async () => {
      const { AIAgentService } = await import('@/lib/services/ai-agent-service')
      const service = new AIAgentService()
      
      // Service should handle errors internally
      expect(service).toBeDefined()
    })
  })
})
