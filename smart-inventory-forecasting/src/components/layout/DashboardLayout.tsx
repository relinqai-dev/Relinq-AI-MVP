/**
 * Dashboard Layout with Mobile Support
 * Requirement 6.1: Responsive design across desktop, tablet, and mobile
 * Requirement 6.2: Touch-friendly interactions
 */

'use client'

import { ReactNode } from 'react'
import { MobileNav } from './MobileNav'
import { ResponsiveLayout } from './ResponsiveLayout'
import { HelpCenter } from '@/components/help'
import { useBreakpoint } from '@/hooks/useMediaQuery'
import { useSessionPersistence } from '@/hooks/useSessionPersistence'
import { cn } from '@/lib/utils'

interface DashboardLayoutProps {
  children: ReactNode
  title?: string
  className?: string
}

export function DashboardLayout({ children, title, className }: DashboardLayoutProps) {
  const { isMobile } = useBreakpoint()
  useSessionPersistence() // Track session across devices

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <MobileNav />
      
      {/* Desktop Sidebar */}
      {!isMobile && (
        <aside className="fixed left-0 top-0 bottom-0 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 hidden md:block">
          <div className="p-6">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Smart Inventory
            </h1>
          </div>
          {/* Desktop navigation would go here */}
        </aside>
      )}
      
      {/* Main Content */}
      <main className={cn(
        'transition-all duration-300',
        !isMobile && 'md:ml-64',
        isMobile && 'pb-20', // Space for bottom nav
        className
      )}>
        <ResponsiveLayout padding="md" safeArea>
          {title && (
            <div className="py-6 flex items-center justify-between">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                {title}
              </h1>
              <HelpCenter />
            </div>
          )}
          {children}
        </ResponsiveLayout>
      </main>
    </div>
  )
}
