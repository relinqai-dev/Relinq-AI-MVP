/**
 * Performance Context for monitoring and optimization
 * Requirement 6.3: Fast performance through serverless architecture optimization
 * Requirement 6.6: Loading indicators and graceful degradation
 */

'use client'

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react'

interface PerformanceMetrics {
  apiCallsInProgress: number
  slowConnectionDetected: boolean
  lastResponseTime: number | null
}

interface PerformanceContextValue {
  metrics: PerformanceMetrics
  startApiCall: () => void
  endApiCall: (responseTime: number) => void
  isLoading: boolean
}

const PerformanceContext = createContext<PerformanceContextValue | null>(null)

export function PerformanceProvider({ children }: { children: ReactNode }) {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    apiCallsInProgress: 0,
    slowConnectionDetected: false,
    lastResponseTime: null
  })

  const startApiCall = useCallback(() => {
    setMetrics(prev => ({
      ...prev,
      apiCallsInProgress: prev.apiCallsInProgress + 1
    }))
  }, [])

  const endApiCall = useCallback((responseTime: number) => {
    setMetrics(prev => ({
      ...prev,
      apiCallsInProgress: Math.max(0, prev.apiCallsInProgress - 1),
      lastResponseTime: responseTime,
      slowConnectionDetected: responseTime > 3000 // 3 seconds threshold
    }))
  }, [])

  const isLoading = metrics.apiCallsInProgress > 0

  return (
    <PerformanceContext.Provider value={{ metrics, startApiCall, endApiCall, isLoading }}>
      {children}
    </PerformanceContext.Provider>
  )
}

export function usePerformance() {
  const context = useContext(PerformanceContext)
  if (!context) {
    throw new Error('usePerformance must be used within a PerformanceProvider')
  }
  return context
}
