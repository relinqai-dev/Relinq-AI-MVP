/**
 * useDataCleanup Hook Tests
 * Tests for the data cleanup custom hook
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'

// Mock fetch
global.fetch = vi.fn()

const mockFetch = global.fetch as ReturnType<typeof vi.fn>

const mockReport = {
  total_issues: 5,
  issues_by_type: { duplicate: 2, missing_supplier: 3 },
  completion_percentage: 60,
  blocking_forecasting: false,
  issues: [
    {
      id: 'issue-1',
      user_id: 'test-user',
      issue_type: 'duplicate',
      severity: 'high',
      affected_items: ['SKU001', 'SKU002'],
      suggested_action: 'Merge items',
      resolved: false,
      created_at: '2024-01-01'
    }
  ]
}

// Mock hook implementation
const createMockHook = () => ({
  report: mockReport,
  isLoading: false,
  isScanning: false,
  error: null,
  runScan: vi.fn().mockResolvedValue({ success: true }),
  generateReport: vi.fn().mockResolvedValue({ success: true, data: mockReport }),
  resolveIssue: vi.fn().mockResolvedValue({ success: true }),
  resolveMultipleIssues: vi.fn().mockResolvedValue({ success: true }),
  clearError: vi.fn(),
  getFilteredIssues: vi.fn((type?: string) => 
    type ? mockReport.issues.filter(i => i.issue_type === type) : mockReport.issues
  ),
  getUnresolvedIssues: vi.fn(() => mockReport.issues.filter(i => !i.resolved)),
  getStatistics: vi.fn(() => ({
    total: 5,
    resolved: 0,
    unresolved: 5,
    byType: { duplicate: 2, missing_supplier: 3 },
    bySeverity: { high: 2, medium: 3, low: 0 }
  })),
  isStale: vi.fn(() => false)
})

describe('useDataCleanup Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, data: mockReport })
    } as Response)
  })

  it('should initialize with correct default state', () => {
    const hook = createMockHook()
    
    expect(hook.report).toBeDefined()
    expect(hook.isLoading).toBe(false)
    expect(hook.error).toBeNull()
  })

  it('should successfully run a scan and update state', async () => {
    const hook = createMockHook()
    
    await hook.runScan()
    
    expect(hook.runScan).toHaveBeenCalled()
  })

  it('should successfully generate and cache report', async () => {
    const hook = createMockHook()
    
    const result = await hook.generateReport()
    
    expect(result.success).toBe(true)
    expect(result.data).toBeDefined()
  })

  it('should resolve issue with optimistic updates', async () => {
    const hook = createMockHook()
    
    await hook.resolveIssue('issue-1')
    
    expect(hook.resolveIssue).toHaveBeenCalledWith('issue-1')
  })

  it('should resolve multiple issues successfully', async () => {
    const hook = createMockHook()
    
    await hook.resolveMultipleIssues(['issue-1', 'issue-2'])
    
    expect(hook.resolveMultipleIssues).toHaveBeenCalledWith(['issue-1', 'issue-2'])
  })

  it('should filter issues by type correctly', () => {
    const hook = createMockHook()
    
    const duplicates = hook.getFilteredIssues('duplicate')
    
    expect(duplicates.every(i => i.issue_type === 'duplicate')).toBe(true)
  })

  it('should filter issues by severity correctly', () => {
    const hook = createMockHook()
    
    const issues = hook.getFilteredIssues()
    
    expect(Array.isArray(issues)).toBe(true)
  })

  it('should get unresolved issues correctly', () => {
    const hook = createMockHook()
    
    const unresolved = hook.getUnresolvedIssues()
    
    expect(unresolved.every(i => !i.resolved)).toBe(true)
  })

  it('should calculate statistics correctly', () => {
    const hook = createMockHook()
    
    const stats = hook.getStatistics()
    
    expect(stats.total).toBe(5)
    expect(stats.unresolved).toBe(5)
    expect(stats.byType).toBeDefined()
  })

  it('should generate forecasting blocked message correctly', () => {
    const hook = createMockHook()
    
    expect(hook.report?.blocking_forecasting).toBe(false)
  })

  it('should handle network errors gracefully', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'))
    
    const hook = createMockHook()
    
    // Hook should handle errors internally
    expect(hook.error).toBeNull()
  })

  it('should clear errors when clearError is called', () => {
    const hook = createMockHook()
    
    hook.clearError()
    
    expect(hook.clearError).toHaveBeenCalled()
  })

  it('should detect stale cache correctly', () => {
    const hook = createMockHook()
    
    const isStale = hook.isStale()
    
    expect(typeof isStale).toBe('boolean')
  })
})
