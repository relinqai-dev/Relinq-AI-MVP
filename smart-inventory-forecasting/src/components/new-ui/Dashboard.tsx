import { useState } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { DashboardPage } from './pages/DashboardPage';
import { InventoryPage } from './pages/InventoryPage';
import { VendorsPage } from './pages/VendorsPage';
import { PurchaseOrdersPage } from './pages/PurchaseOrdersPage';

export type PageType = 'dashboard' | 'inventory' | 'vendors' | 'purchase-orders';

export function Dashboard() {
  const [selectedStores, setSelectedStores] = useState<string[]>(['store-1']);
  const [activePage, setActivePage] = useState<PageType>('dashboard');

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return <DashboardPage />;
      case 'inventory':
        return <InventoryPage />;
      case 'vendors':
        return <VendorsPage />;
      case 'purchase-orders':
        return <PurchaseOrdersPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header 
        selectedStores={selectedStores}
        setSelectedStores={setSelectedStores}
      />
      <Sidebar activePage={activePage} setActivePage={setActivePage} />
      
      <main className="ml-64 pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {renderPage()}
        </div>
      </main>
    </div>
  );
}