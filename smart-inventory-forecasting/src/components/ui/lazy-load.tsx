/**
 * Lazy Load Component for Performance
 * Requirement 6.3: Fast performance through serverless architecture optimization
 * Requirement 6.6: Loading indicators and graceful degradation
 */

'use client'

import { ReactNode } from 'react'
import { useLazyLoad } from '@/hooks/useLazyLoad'
import { Skeleton } from './skeleton'

interface LazyLoadProps {
  children: ReactNode
  fallback?: ReactNode
  height?: string
  className?: string
}

export function LazyLoad({ children, fallback, height = '200px', className }: LazyLoadProps) {
  const { elementRef, isVisible } = useLazyLoad()

  return (
    <div ref={elementRef} className={className} style={{ minHeight: isVisible ? 'auto' : height }}>
      {isVisible ? children : (fallback || <div style={{ height }}><Skeleton className="w-full h-full" /></div>)}
    </div>
  )
}

export function LazySection({ children, className }: { children: ReactNode, className?: string }) {
  const { elementRef, isVisible } = useLazyLoad({ threshold: 0.1, rootMargin: '100px' })

  return (
    <div ref={elementRef} className={className}>
      {isVisible ? children : (
        <div className="space-y-4">
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-32 w-full" />
        </div>
      )}
    </div>
  )
}
