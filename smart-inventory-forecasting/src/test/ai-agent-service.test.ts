/**
 * AI Agent Service Tests
 * Tests for natural language recommendations generation
 * Requirements: 4.2, 4.3, 4.4, 4.5, 4.6
 */

import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest'

// Set environment variable before importing the service
beforeAll(() => {
  process.env.OPENAI_API_KEY = 'test-api-key'
})

import { AIAgentService, RecommendationContext } from '@/lib/services/ai-agent-service'
import { InventoryItem, Supplier, SalesData } from '@/types/database'

// Mock OpenAI
vi.mock('openai', () => {
  const mockCreate = vi.fn().mockResolvedValue({
    choices: [{
      message: {
        content: 'Order 50 units of Test Item immediately. Sales 30% higher than average this week. Risk of stockout in 2 days.'
      }
    }]
  })

  return {
    default: class MockOpenAI {
      chat = {
        completions: {
          create: mockCreate
        }
      }
    }
  }
})

describe('AIAgentService', () => {
  let aiAgentService: AIAgentService
  let mockContext: RecommendationContext

  beforeEach(() => {
    aiAgentService = new AIAgentService()

    // Mock context data
    const mockItem: InventoryItem = {
      id: '1',
      user_id: 'user1',
      sku: 'TEST-001',
      name: 'Test Item',
      current_stock: 5,
      supplier_id: 'supplier1',
      lead_time_days: 7,
      unit_cost: 10.00,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    }

    const mockSupplier: Supplier = {
      id: 'supplier1',
      user_id: 'user1',
      name: 'Test Supplier',
      contact_email: 'supplier@test.com',
      contact_phone: '123-456-7890',
      lead_time_days: 7,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    }

    const mockSalesData: SalesData[] = [
      {
        id: '1',
        user_id: 'user1',
        sku: 'TEST-001',
        quantity_sold: 10,
        sale_date: '2024-01-01',
        unit_price: 15.00,
        created_at: '2024-01-01T00:00:00Z'
      }
    ]

    mockContext = {
      item: mockItem,
      forecast: {
        sku: 'TEST-001',
        current_stock: 5,
        forecast_7_day: 35,
        recommended_order: 50,
        confidence_score: 0.85,
        trend: 'increasing',
        seasonality_detected: false,
        lead_time_factored: 7
      },
      supplier: mockSupplier,
      recentSales: mockSalesData,
      averageDailySales: 5,
      daysUntilStockout: 2
    }
  })

  describe('generateRecommendation', () => {
    it('should generate AI recommendation with proper structure', async () => {
      const recommendation = await aiAgentService.generateRecommendation(mockContext)

      expect(recommendation).toMatchObject({
        sku: 'TEST-001',
        priority: expect.any(String),
        action: expect.any(String),
        explanation: expect.any(String),
        confidence: expect.any(Number),
        reasoning_context: expect.any(String)
      })
    })

    it('should detect urgent priority for low stock items', async () => {
      mockContext.item.current_stock = 0
      mockContext.daysUntilStockout = 0

      const recommendation = await aiAgentService.generateRecommendation(mockContext)

      expect(recommendation.priority).toBe('urgent')
    })

    it('should include timeline warning for stockout risk', async () => {
      mockContext.daysUntilStockout = 2

      const recommendation = await aiAgentService.generateRecommendation(mockContext)

      expect(recommendation.timeline_warning).toBeDefined()
    })

    it('should handle AI service errors gracefully', async () => {
      // Mock OpenAI to throw error
      const mockOpenAI = vi.mocked(aiAgentService['openai'])
      mockOpenAI.chat.completions.create = vi.fn().mockRejectedValue(new Error('API Error'))

      const recommendation = await aiAgentService.generateRecommendation(mockContext)

      // Should return fallback recommendation
      expect(recommendation).toMatchObject({
        sku: 'TEST-001',
        priority: expect.any(String),
        action: expect.stringContaining('Order'),
        explanation: expect.any(String)
      })
    })
  })

  describe('generateDailyTodoList', () => {
    it('should generate todo list with urgent and routine actions', async () => {
      const contexts = [
        mockContext,
        {
          ...mockContext,
          item: { ...mockContext.item, sku: 'TEST-002', current_stock: 20 },
          daysUntilStockout: 10
        }
      ]

      const todoList = await aiAgentService.generateDailyTodoList('user1', contexts)

      expect(todoList).toMatchObject({
        date: expect.any(String),
        urgent_actions: expect.any(Array),
        routine_actions: expect.any(Array),
        total_action_count: expect.any(Number)
      })
    })

    it('should return positive status when no actions needed', async () => {
      const healthyContexts = [{
        ...mockContext,
        daysUntilStockout: 30,
        item: { ...mockContext.item, current_stock: 100 }
      }]

      const todoList = await aiAgentService.generateDailyTodoList('user1', healthyContexts)

      expect(todoList.positive_status).toBeDefined()
      expect(todoList.total_action_count).toBe(0)
    })
  })

  describe('calculatePriorityFactors', () => {
    it('should calculate priority factors correctly', () => {
      const factors = aiAgentService.calculatePriorityFactors(mockContext)

      expect(factors).toMatchObject({
        stockoutRisk: expect.any(Number),
        salesVelocity: expect.any(Number),
        businessImpact: expect.any(Number),
        urgencyScore: expect.any(Number)
      })

      expect(factors.stockoutRisk).toBeGreaterThan(0)
      expect(factors.stockoutRisk).toBeLessThanOrEqual(1)
    })

    it('should assign high stockout risk for out of stock items', () => {
      mockContext.item.current_stock = 0
      mockContext.daysUntilStockout = 0

      const factors = aiAgentService.calculatePriorityFactors(mockContext)

      expect(factors.stockoutRisk).toBe(1.0)
    })
  })

  describe('buildRecommendationPrompt', () => {
    it('should build comprehensive prompt with context', () => {
      const prompt = aiAgentService['buildRecommendationPrompt'](mockContext)

      expect(prompt).toContain('TEST-001')
      expect(prompt).toContain('Test Item')
      expect(prompt).toContain('5') // current stock
      expect(prompt).toContain('35') // forecast
      expect(prompt).toContain('50') // recommended order
      expect(prompt).toContain('Test Supplier')
    })
  })

  describe('calculateSalesTrendContext', () => {
    it('should generate appropriate trend context', () => {
      const context = aiAgentService['calculateSalesTrendContext'](10, 13)
      expect(context).toContain('higher than average')

      const context2 = aiAgentService['calculateSalesTrendContext'](10, 7)
      expect(context2).toContain('lower than average')

      const context3 = aiAgentService['calculateSalesTrendContext'](10, 10)
      expect(context3).toContain('consistent')
    })

    it('should handle zero sales gracefully', () => {
      const context = aiAgentService['calculateSalesTrendContext'](0, 0)
      expect(context).toContain('No historical sales data')
    })
  })

  describe('detectUrgencyFromResponse', () => {
    it('should detect urgent priority from keywords', () => {
      const priority = aiAgentService['detectUrgencyFromResponse'](
        'Order immediately due to critical stock levels',
        5,
        10
      )
      expect(priority).toBe('urgent')
    })

    it('should detect urgent priority from stock situation', () => {
      const priority = aiAgentService['detectUrgencyFromResponse'](
        'Regular order recommendation',
        1, // 1 day until stockout
        5
      )
      expect(priority).toBe('urgent')
    })

    it('should detect high priority for near-term stockout', () => {
      const priority = aiAgentService['detectUrgencyFromResponse'](
        'Order soon to avoid stockout',
        4, // 4 days until stockout
        10
      )
      expect(priority).toBe('high')
    })
  })
})