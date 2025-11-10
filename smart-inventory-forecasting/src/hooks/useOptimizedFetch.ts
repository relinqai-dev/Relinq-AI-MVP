/**
 * Optimized fetch hook with performance monitoring
 * Requirement 6.3: Fast performance through serverless architecture optimization
 * Requirement 6.6: Loading indicators and graceful degradation
 */

'use client'

import { useState, useCallback } from 'react'
import { usePerformance } from '@/contexts/PerformanceContext'

interface FetchOptions extends RequestInit {
  timeout?: number
}

interface FetchState<T> {
  data: T | null
  error: Error | null
  loading: boolean
}

export function useOptimizedFetch<T>() {
  const [state, setState] = useState<FetchState<T>>({
    data: null,
    error: null,
    loading: false
  })
  const { startApiCall, endApiCall } = usePerformance()

  const fetchData = useCallback(async (url: string, options: FetchOptions = {}) => {
    const { timeout = 10000, ...fetchOptions } = options
    
    setState({ data: null, error: null, loading: true })
    startApiCall()
    
    const startTime = Date.now()

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), timeout)

      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      const responseTime = Date.now() - startTime
      
      endApiCall(responseTime)
      setState({ data, error: null, loading: false })
      
      return data
    } catch (error) {
      const responseTime = Date.now() - startTime
      endApiCall(responseTime)
      
      const err = error instanceof Error ? error : new Error('An error occurred')
      setState({ data: null, error: err, loading: false })
      throw err
    }
  }, [startApiCall, endApiCall])

  return { ...state, fetchData }
}
