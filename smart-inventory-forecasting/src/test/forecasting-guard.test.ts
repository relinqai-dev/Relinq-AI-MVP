/**
 * Forecasting Guard Tests
 * Tests for data quality guard logic
 * Requirements: 2.6
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  checkForecastingAllowed,
  forecastingGuardMiddleware,
  getForecastingBlockedMessage
} from '@/lib/utils/forecasting-guard'
import { dataCleanupService } from '@/lib/services'

vi.mock('@/lib/services', () => ({
  dataCleanupService: {
    isForecastingBlocked: vi.fn(),
    generateCleanupReport: vi.fn()
  }
}))

describe('Forecasting Guard', () => {
  const mockUserId = 'test-user-123'

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('checkForecastingAllowed', () => {
    it('should allow forecasting when no blocking issues exist', async () => {
      vi.mocked(dataCleanupService.isForecastingBlocked).mockResolvedValue({
        success: true,
        data: false
      })

      const result = await checkForecastingAllowed(mockUserId)

      expect(result.success).toBe(true)
      expect(result.data).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('should block forecasting when high severity issues exist', async () => {
      vi.mocked(dataCleanupService.isForecastingBlocked).mockResolvedValue({
        success: true,
        data: true
      })

      const result = await checkForecastingAllowed(mockUserId)

      expect(result.success).toBe(false)
      expect(result.data).toBe(false)
      expect(result.error).toContain('blocked due to unresolved data quality issues')
    })

    it('should handle service errors gracefully', async () => {
      vi.mocked(dataCleanupService.isForecastingBlocked).mockResolvedValue({
        success: false,
        error: 'Database connection failed'
      })

      const result = await checkForecastingAllowed(mockUserId)

      expect(result.success).toBe(false)
      expect(result.error).toContain('Failed to check data quality status')
    })

    it('should handle exceptions gracefully', async () => {
      vi.mocked(dataCleanupService.isForecastingBlocked).mockRejectedValue(
        new Error('Unexpected error')
      )

      const result = await checkForecastingAllowed(mockUserId)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Unexpected error')
    })
  })

  describe('forecastingGuardMiddleware', () => {
    it('should return allowed=true when forecasting is allowed', async () => {
      vi.mocked(dataCleanupService.isForecastingBlocked).mockResolvedValue({
        success: true,
        data: false
      })

      const result = await forecastingGuardMiddleware(mockUserId)

      expect(result.allowed).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('should return allowed=false when forecasting is blocked', async () => {
      vi.mocked(dataCleanupService.isForecastingBlocked).mockResolvedValue({
        success: true,
        data: true
      })

      const result = await forecastingGuardMiddleware(mockUserId)

      expect(result.allowed).toBe(false)
      expect(result.error).toBeDefined()
    })
  })

  describe('getForecastingBlockedMessage', () => {
    it('should generate detailed message with issue counts', async () => {
      vi.mocked(dataCleanupService.generateCleanupReport).mockResolvedValue({
        success: true,
        data: {
          total_issues: 3,
          issues_by_type: {
            duplicate: 1,
            missing_supplier: 1,
            no_sales_history: 1
          },
          completion_percentage: 33.33,
          blocking_forecasting: true,
          issues: [
            {
              id: '1',
              user_id: mockUserId,
              issue_type: 'duplicate',
              severity: 'high',
              affected_items: ['SKU001', 'SKU002'],
              suggested_action: 'Merge duplicate items',
              resolved: false,
              created_at: '2024-01-01T00:00:00Z',
              updated_at: '2024-01-01T00:00:00Z'
            },
            {
              id: '2',
              user_id: mockUserId,
              issue_type: 'missing_supplier',
              severity: 'medium',
              affected_items: ['SKU003'],
              suggested_action: 'Assign supplier to items',
              resolved: false,
              created_at: '2024-01-01T00:00:00Z',
              updated_at: '2024-01-01T00:00:00Z'
            },
            {
              id: '3',
              user_id: mockUserId,
              issue_type: 'no_sales_history',
              severity: 'low',
              affected_items: ['SKU004'],
              suggested_action: 'Add sales history',
              resolved: true,
              created_at: '2024-01-01T00:00:00Z',
              updated_at: '2024-01-01T00:00:00Z'
            }
          ]
        }
      })

      const message = await getForecastingBlockedMessage(mockUserId)

      expect(message).toContain('1 high priority issues')
      expect(message).toContain('1 medium priority issues')
      expect(message).toContain('Data Cleanup section')
    })

    it('should handle report generation failure', async () => {
      vi.mocked(dataCleanupService.generateCleanupReport).mockResolvedValue({
        success: false,
        error: 'Failed to generate report'
      })

      const message = await getForecastingBlockedMessage(mockUserId)

      expect(message).toContain('Unable to generate forecasts')
      expect(message).toContain('run a data cleanup scan')
    })

    it('should handle exceptions gracefully', async () => {
      vi.mocked(dataCleanupService.generateCleanupReport).mockRejectedValue(
        new Error('Unexpected error')
      )

      const message = await getForecastingBlockedMessage(mockUserId)

      expect(message).toContain('Unable to generate forecasts')
      expect(message).toContain('Data Cleanup section')
    })
  })
})
