'use client';

import { useEffect, useState } from 'react';
import { AppHeader } from '@/components/layout/AppHeader';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { DashboardMetrics } from '@/components/dashboard/DashboardMetrics';
import { ActionableInsights } from '@/components/dashboard/ActionableInsights';
import { AtRiskInventory } from '@/components/dashboard/AtRiskInventory';
import { TopMovers } from '@/components/dashboard/TopMovers';
import { DataHealthCard } from '@/components/dashboard/DataHealthCard';
// import { ForecastingWidget } from '@/components/forecasting/ForecastingWidget';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function DashboardClient() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [selectedStore, setSelectedStore] = useState('store-1');
  const [insights, setInsights] = useState<Array<{
    id: string;
    type: 'stockout' | 'anomaly' | 'trend';
    title: string;
    message: string;
    action: string;
    onAction?: () => void;
  }>>([]);
  const [atRiskItems, setAtRiskItems] = useState<Array<{
    itemName: string;
    currentStock: number;
    salesVelocity: number;
    stockoutDate: string;
    recommendedQty: number;
  }>>([]);
  const [topMovers] = useState([
    { name: 'Vegan Cheese', forecast: 245 },
    { name: 'Oat Milk', forecast: 198 },
    { name: 'Kombucha', forecast: 176 },
    { name: 'Almond Butter', forecast: 154 },
    { name: 'Protein Bars', forecast: 142 },
  ]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  // Product Brain Architecture: Fetch data from both engines
  // Data Source: Works with BOTH CSV uploads AND API integrations
  // The engines process data from Supabase regardless of how it got there
  useEffect(() => {
    if (!user) return;

    const fetchDashboardData = async () => {
      try {
        setDataLoading(true);

        // Step 1: Forecasting Engine (Mathematician) - Get at-risk inventory numbers
        // This works with data from CSV upload OR POS API integration
        const atRiskResponse = await fetch('/api/at-risk-inventory');
        const atRiskData = await atRiskResponse.json();
        
        if (atRiskData.success) {
          const formattedAtRisk = atRiskData.data.map((item: {
            itemName: string;
            currentStock: number;
            salesVelocity: number;
            forecastedStockoutDate: string;
            recommendedQty: number;
          }) => ({
            itemName: item.itemName,
            currentStock: item.currentStock,
            salesVelocity: item.salesVelocity,
            stockoutDate: item.forecastedStockoutDate,
            recommendedQty: item.recommendedQty,
          }));
          setAtRiskItems(formattedAtRisk);

          // Step 2: AI Agent (Store Manager) - Turn numbers into narrative
          const insightsResponse = await fetch('/api/actionable-insights', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ atRiskItems: atRiskData.data }),
          });
          const insightsData = await insightsResponse.json();
          
          if (insightsData.success) {
            const formattedInsights = insightsData.data.map((insight: {
              id: string;
              type: string;
              title: string;
              message: string;
              action: string;
            }) => ({
              id: insight.id,
              type: insight.type as 'stockout' | 'anomaly' | 'trend',
              title: insight.title,
              message: insight.message,
              action: insight.action,
              onAction: () => {
                if (insight.type === 'stockout') router.push('/dashboard/purchase-orders');
                else if (insight.type === 'anomaly') router.push('/dashboard/data-cleanup');
                else router.push('/dashboard/forecasting');
              },
            }));
            setInsights(formattedInsights);
          }
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setDataLoading(false);
      }
    };

    fetchDashboardData();
  }, [user, router]);

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

  return (
    <div className="min-h-screen bg-slate-50">
      <AppHeader selectedStore={selectedStore} onStoreChange={setSelectedStore} />
      <AppSidebar />
      
      <main className="ml-64 pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-8">
            {/* Page Header */}
            <div className="space-y-1">
              <h1 className="text-4xl font-bold text-gray-900 tracking-tight">What You Need to Focus On Right Now</h1>
              <p className="text-lg text-gray-600 font-medium">Actionable insights to keep your inventory optimized</p>
            </div>

            {/* Actionable Insights - AI Agent (Store Manager) output */}
            {dataLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600 mx-auto"></div>
                <p className="mt-2 text-slate-600">Loading insights...</p>
              </div>
            ) : (
              <ActionableInsights insights={insights} />
            )}

            {/* Metrics Overview */}
            <DashboardMetrics />

            {/* At-Risk Inventory - Forecasting Engine (Mathematician) output */}
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

            {/* Forecasting Widget - Removed temporarily due to server/client import conflict */}
            {/* <ForecastingWidget /> */}
          </div>
        </div>
      </main>
    </div>
  );
}
