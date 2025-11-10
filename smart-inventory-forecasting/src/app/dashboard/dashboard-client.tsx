/**
 * Dashboard Client Component with Mobile Optimizations
 * Requirement 6.1: Responsive design across desktop, tablet, and mobile
 * Requirement 6.2: Touch-friendly interactions
 * Requirement 6.3: Fast performance through serverless architecture
 * Requirement 6.6: Loading indicators and graceful degradation
 */

'use client'

import { Suspense } from 'react'
import { User } from '@supabase/supabase-js'
import { AIRecommendationsDashboard } from '@/components/ai-recommendations'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { DashboardMetrics } from '@/components/dashboard/DashboardMetrics'
import { QuickActions } from '@/components/dashboard/QuickActions'
import { MobileNav } from '@/components/layout/MobileNav'
import { ResponsiveLayout } from '@/components/layout/ResponsiveLayout'
import { LazySection } from '@/components/ui/lazy-load'
import { LoadingCard } from '@/components/ui/loading-spinner'
import { useBreakpoint } from '@/hooks/useMediaQuery'

interface DashboardClientProps {
  user: User
}

export default function DashboardClient({ user }: DashboardClientProps) {
  const { isMobile } = useBreakpoint()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-indigo-950 dark:to-purple-950">
      {/* Mobile Navigation - Requirement 6.2 */}
      <MobileNav />

      {/* Responsive Header - Requirements 6.1, 6.2 */}
      <DashboardHeader user={user} />

      {/* Main Content with Responsive Layout */}
      <main className={`max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8 ${isMobile ? 'pb-20' : ''}`}>
        <ResponsiveLayout padding="none">
          <div className="space-y-4 sm:space-y-6">
            {/* Dashboard Metrics with Lazy Loading - Requirement 6.3 */}
            <Suspense fallback={<LoadingCard />}>
              <LazySection>
                <DashboardMetrics />
              </LazySection>
            </Suspense>

            {/* Today's To-Do List - Primary Feature - Requirement 4.1 */}
            <div className="w-full">
              <Suspense fallback={<LoadingCard />}>
                <AIRecommendationsDashboard />
              </Suspense>
            </div>

            {/* Quick Actions with Lazy Loading */}
            <Suspense fallback={<LoadingCard />}>
              <LazySection>
                <QuickActions />
              </LazySection>
            </Suspense>
          </div>
        </ResponsiveLayout>
      </main>
    </div>
  )
}