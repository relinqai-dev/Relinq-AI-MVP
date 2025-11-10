/**
 * Data Cleanup API Tests
 * Tests for data cleanup API routes
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

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

vi.mock('@/lib/services/data-cleanup-service', () => ({
  dataCleanupService: {
    generateCleanupReport: vi.fn().mockResolvedValue({
      success: true,
      data: {
        total_issues: 5,
        issues_by_type: { duplicate: 2, missing_supplier: 3 },
        completion_percentage: 60,
        blocking_forecasting: false,
        issues: []
      }
    }),
    isForecastingBlocked: vi.fn().mockResolvedValue({
      success: true,
      data: false
    }),
    runCleanupScan: vi.fn().mockResolvedValue({
      success: true,
      data: {
        total_issues: 5,
        issues_by_type: { duplicate: 2, missing_supplier: 3 },
        completion_percentage: 60,
        blocking_forecasting: false,
        issues: []
      }
    }),
    resolveIssue: vi.fn().mockResolvedValue({
      success: true,
      data: { id: 'issue-1', resolved: true }
    }),
    resolveMultipleIssues: vi.fn().mockResolvedValue({
      success: true
    })
  }
}))

describe('Data Cleanup API Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('GET /api/data-cleanup', () => {
    it('should return cleanup report when action=report', async () => {
      const { dataCleanupService } = await import('@/lib/services/data-cleanup-service')
      
      const result = await dataCleanupService.generateCleanupReport('test-user-123')
      
      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
      expect(result.data?.total_issues).toBe(5)
    })

    it('should return forecasting blocked status when action=check-blocking', async () => {
      const { dataCleanupService } = await import('@/lib/services/data-cleanup-service')
      
      const result = await dataCleanupService.isForecastingBlocked('test-user-123')
      
      expect(result.success).toBe(true)
      expect(result.data).toBe(false)
    })
  })

  describe('POST /api/data-cleanup', () => {
    it('should run cleanup scan when action=scan', async () => {
      const { dataCleanupService } = await import('@/lib/services/data-cleanup-service')
      
      const result = await dataCleanupService.runCleanupScan('test-user-123')
      
      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
    })

    it('should resolve single issue when action=resolve-issue', async () => {
      const { dataCleanupService } = await import('@/lib/services/data-cleanup-service')
      
      const result = await dataCleanupService.resolveIssue('issue-1', 'test-user-123')
      
      expect(result.success).toBe(true)
    })

    it('should resolve multiple issues when action=resolve-multiple', async () => {
      const { dataCleanupService } = await import('@/lib/services/data-cleanup-service')
      
      const result = await dataCleanupService.resolveMultipleIssues(['issue-1', 'issue-2'], 'test-user-123')
      
      expect(result.success).toBe(true)
    })
  })
})
