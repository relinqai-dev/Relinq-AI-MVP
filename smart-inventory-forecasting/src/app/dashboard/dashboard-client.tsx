'use client';

import { useEffect, useState } from 'react';
import { AppHeader } from '@/components/layout/AppHeader';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { DashboardMetrics } from '@/components/dashboard/DashboardMetrics';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { ActionableInsights } from '@/components/dashboard/ActionableInsights';
import { AtRiskInventory } from '@/components/dashboard/AtRiskInventory';
import { TopMovers } from '@/components/dashboard/TopMovers';
import { DataHealthCard } from '@/components/dashboard/DataHealthCard';
import { ForecastingWidget } from '@/components/forecasting/ForecastingWidget';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function DashboardClient() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [selectedStore, setSelectedStore] = useState('store-1');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Mock data - will be replaced with real data from Supabase
  const insights = [
    {
      id: '1',
      type: 'stockout' as const,
      title: 'Stockout Risk',
      message: "You are on track to sell out of 'Brand-Name Milk' in 2 days. Sales are 30% higher than average. I recommend ordering 40 units now.",
      action: 'Order Now',
      onAction: () => router.push('/dashboard/purchase-orders'),
    },
    {
      id: '2',
      type: 'anomaly' as const,
      title: 'Data Anomaly',
      message: "You have 3 items named 'Coca-Cola 12oz' in your POS. This may be skewing your forecast.",
      action: 'Merge Items',
      onAction: () => router.push('/dashboard/data-cleanup'),
    },
    {
      id: '3',
      type: 'trend' as const,
      title: 'New Trend',
      message: "Sales for 'Vegan Cheese' have doubled in the last 14 days. Your forecast has been adjusted.",
      action: 'View Details',
      onAction: () => router.push('/dashboard/forecasting'),
    },
  ];

  const atRiskItems = [
    {
      itemName: 'Brand-Name Milk',
      currentStock: 15,
      salesVelocity: 7.5,
      stockoutDate: '2 days',
      recommendedQty: 40,
    },
    {
      itemName: 'Organic Eggs',
      currentStock: 24,
      salesVelocity: 6.2,
      stockoutDate: '4 days',
      recommendedQty: 30,
    },
    {
      itemName: 'Whole Wheat Bread',
      currentStock: 12,
      salesVelocity: 4.8,
      stockoutDate: '3 days',
      recommendedQty: 25,
    },
  ];

  const topMovers = [
    { name: 'Vegan Cheese', forecast: 245 },
    { name: 'Oat Milk', forecast: 198 },
    { name: 'Kombucha', forecast: 176 },
    { name: 'Almond Butter', forecast: 154 },
    { name: 'Protein Bars', forecast: 142 },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <AppHeader selectedStore={selectedStore} onStoreChange={setSelectedStore} />
      <AppSidebar />
      
      <main className="ml-64 pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-8">
            {/* Page Header */}
            <div>
              <h1 className="text-3xl font-bold text-slate-900">What You Need to Focus On Right Now</h1>
              <p className="text-slate-600 mt-2">Actionable insights to keep your inventory optimized</p>
            </div>

            {/* Actionable Insights */}
            <ActionableInsights insights={insights} />

            {/* Metrics Overview */}
            <DashboardMetrics />

            {/* Quick Actions */}
            <QuickActions />

            {/* At-Risk Inventory */}
            <AtRiskInventory items={atRiskItems} />

            {/* Bottom Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <TopMovers items={topMovers} />
              <DataHealthCard 
                catalogStatus={98}
                duplicateItems={120}
                itemsMissingVendor={45}
              />
            </div>

            {/* Forecasting Widget */}
            <ForecastingWidget />
          </div>
        </div>
      </main>
    </div>
  );
}
