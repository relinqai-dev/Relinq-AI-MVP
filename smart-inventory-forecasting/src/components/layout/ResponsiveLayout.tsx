/**
 * Responsive Layout Components
 * Requirement 6.1: Responsive design across desktop, tablet, and mobile
 * Requirement 6.2: Touch-friendly interactions and gestures
 */

'use client'

import { ReactNode } from 'react'
import { useBreakpoint } from '@/hooks/useMediaQuery'
import { useTouchDevice } from '@/hooks/useTouchDevice'
import { cn } from '@/lib/utils'

interface ResponsiveLayoutProps {
  children: ReactNode
  className?: string
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  safeArea?: boolean
}

export function ResponsiveLayout({ 
  children, 
  className = '', 
  maxWidth = 'xl',
  padding = 'md',
  safeArea = false
}: ResponsiveLayoutProps) {
  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-7xl',
    '2xl': 'max-w-none',
    full: 'max-w-full'
  }

  const paddingClasses = {
    none: '',
    sm: 'px-4 sm:px-6',
    md: 'px-4 sm:px-6 lg:px-8',
    lg: 'px-6 sm:px-8 lg:px-12'
  }

  return (
    <div className={cn(
      'w-full mx-auto',
      maxWidthClasses[maxWidth],
      paddingClasses[padding],
      safeArea && 'safe-area-padding',
      className
    )}>
      {children}
    </div>
  )
}

export function MobileFirstGrid({ 
  children, 
  className = '',
  cols = { mobile: 1, tablet: 2, desktop: 3 }
}: {
  children: ReactNode
  className?: string
  cols?: { mobile: number, tablet: number, desktop: number }
}) {
  const getGridCols = () => {
    // Use explicit class names for Tailwind to detect
    const mobileClass = cols.mobile === 1 ? 'grid-cols-1' : cols.mobile === 2 ? 'grid-cols-2' : 'grid-cols-3'
    const tabletClass = cols.tablet === 1 ? 'sm:grid-cols-1' : cols.tablet === 2 ? 'sm:grid-cols-2' : cols.tablet === 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-4'
    const desktopClass = cols.desktop === 1 ? 'lg:grid-cols-1' : cols.desktop === 2 ? 'lg:grid-cols-2' : cols.desktop === 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-4'
    
    return `${mobileClass} ${tabletClass} ${desktopClass}`
  }

  return (
    <div className={cn(
      'grid gap-4 sm:gap-6 lg:gap-8',
      getGridCols(),
      className
    )}>
      {children}
    </div>
  )
}

export function TouchFriendlyButton({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
  type = 'button'
}: {
  children: ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  className?: string
  type?: 'button' | 'submit' | 'reset'
}) {
  const isTouchDevice = useTouchDevice()
  
  const baseClasses = 'touch-target inline-flex items-center justify-center font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95'
  
  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-900 focus:ring-gray-500',
    danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500'
  }

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm min-h-[40px]',
    md: 'px-4 py-2 text-sm min-h-[44px]',
    lg: 'px-6 py-3 text-base min-h-[48px]'
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        isTouchDevice && 'touch-manipulation', // Optimize for touch
        className
      )}
    >
      {children}
    </button>
  )
}

export function ResponsiveContainer({ children, className }: { children: ReactNode, className?: string }) {
  const { isMobile } = useBreakpoint()
  
  return (
    <div 
      className={cn(
        'container-responsive',
        isMobile && 'pb-20', // Extra padding for mobile navigation
        className
      )}
    >
      {children}
    </div>
  )
}

export function AdaptiveStack({ 
  children, 
  className,
  stackOnMobile = true 
}: { 
  children: ReactNode
  className?: string
  stackOnMobile?: boolean
}) {
  return (
    <div className={cn(
      'flex gap-4',
      stackOnMobile ? 'flex-col md:flex-row' : 'flex-row',
      className
    )}>
      {children}
    </div>
  )
}