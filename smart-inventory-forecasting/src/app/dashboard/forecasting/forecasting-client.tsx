'use client';

import { AppHeader } from '@/components/layout/AppHeader';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { ForecastingDashboard } from '@/components/forecasting/ForecastingDashboard';

export default function ForecastingPageClient() {
  return (
    <div className="min-h-screen bg-slate-50">
      <AppHeader />
      <AppSidebar />
      
      <main className="ml-64 pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Forecasting</h1>
              <p className="text-slate-600 mt-2">AI-powered demand forecasting for your inventory</p>
            </div>

            <ForecastingDashboard />
          </div>
        </div>
      </main>
    </div>
  );
}
