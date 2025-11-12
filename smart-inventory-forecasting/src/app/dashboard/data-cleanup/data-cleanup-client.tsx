'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppHeader } from '@/components/layout/AppHeader';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { DataCleanupDashboard } from '@/components/data-cleanup';
import { DuplicateItemMerger } from '@/components/data-cleanup/DuplicateItemMerger';
import { SupplierAssignmentWorkflow } from '@/components/data-cleanup/SupplierAssignmentWorkflow';
import { InventoryItem, Supplier, CreateSupplier } from '@/types';
import { toast } from 'sonner';

type WorkflowMode = 'dashboard' | 'merge-duplicates' | 'assign-suppliers';

export function DataCleanupClient() {
  const router = useRouter();
  const [mode, setMode] = useState<WorkflowMode>('dashboard');
  const [workflowData, setWorkflowData] = useState<{
    duplicateItems?: InventoryItem[];
    itemsNeedingSuppliers?: InventoryItem[];
    suppliers?: Supplier[];
  }>({});

  const handleCleanupComplete = () => {
    toast.success('Data cleanup completed! Forecasting is now available.');
    router.push('/dashboard');
  };

  const handleMergeDuplicates = async (
    primaryItem: InventoryItem,
    itemsToMerge: InventoryItem[],
    mergedData: Partial<InventoryItem>
  ): Promise<boolean> => {
    try {
      // Call API to merge duplicate items
      const response = await fetch('/api/inventory/merge-duplicates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          primaryItemId: primaryItem.id,
          itemsToMerge: itemsToMerge.map(item => item.id),
          mergedData
        })
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Items merged successfully');
        setMode('dashboard');
        return true;
      } else {
        toast.error(result.error || 'Failed to merge items');
        return false;
      }
    } catch {
      toast.error('An error occurred while merging items');
      return false;
    }
  };

  const handleAssignSuppliers = async (
    assignments: Array<{ itemId: string; supplierId: string }>
  ): Promise<boolean> => {
    try {
      // Call API to assign suppliers
      const response = await fetch('/api/inventory/assign-suppliers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignments })
      });

      const result = await response.json();

      if (result.success) {
        toast.success(`Suppliers assigned to ${assignments.length} items`);
        setMode('dashboard');
        return true;
      } else {
        toast.error(result.error || 'Failed to assign suppliers');
        return false;
      }
    } catch {
      toast.error('An error occurred while assigning suppliers');
      return false;
    }
  };

  const handleCreateSupplier = async (supplier: CreateSupplier): Promise<Supplier | null> => {
    try {
      const response = await fetch('/api/suppliers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(supplier)
      });

      const result = await response.json();

      if (result.success && result.data) {
        toast.success('Supplier created successfully');
        // Update local suppliers list
        setWorkflowData(prev => ({
          ...prev,
          suppliers: [...(prev.suppliers || []), result.data]
        }));
        return result.data;
      } else {
        toast.error(result.error || 'Failed to create supplier');
        return null;
      }
    } catch {
      toast.error('An error occurred while creating supplier');
      return null;
    }
  };

  const handleCancelWorkflow = () => {
    setMode('dashboard');
    setWorkflowData({});
  };

  // Mock data for demonstration - in real implementation, this would come from the cleanup issues
  const mockDuplicateItems: InventoryItem[] = [
    {
      id: '1',
      user_id: 'user1',
      sku: 'WIDGET-001',
      name: 'Blue Widget',
      current_stock: 50,
      unit_cost: 10.99,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '2',
      user_id: 'user1',
      sku: 'WIDGET-002',
      name: 'Blue Widget (Large)',
      current_stock: 25,
      unit_cost: 12.99,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  const mockItemsNeedingSuppliers: InventoryItem[] = [
    {
      id: '3',
      user_id: 'user1',
      sku: 'GADGET-001',
      name: 'Red Gadget',
      current_stock: 30,
      unit_cost: 15.99,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  const mockSuppliers: Supplier[] = [
    {
      id: 'sup1',
      user_id: 'user1',
      name: 'Acme Supplies',
      contact_email: 'orders@acme.com',
      contact_phone: '+1-555-0123',
      lead_time_days: 7,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  switch (mode) {
    case 'merge-duplicates':
      return (
        <DuplicateItemMerger
          duplicateItems={workflowData.duplicateItems || mockDuplicateItems}
          onMerge={handleMergeDuplicates}
          onCancel={handleCancelWorkflow}
        />
      );

    case 'assign-suppliers':
      return (
        <SupplierAssignmentWorkflow
          items={workflowData.itemsNeedingSuppliers || mockItemsNeedingSuppliers}
          suppliers={workflowData.suppliers || mockSuppliers}
          onAssignSuppliers={handleAssignSuppliers}
          onCreateSupplier={handleCreateSupplier}
          onCancel={handleCancelWorkflow}
        />
      );

    default:
      return (
        <div className="min-h-screen bg-slate-50">
          <AppHeader />
          <AppSidebar />
          
          <main className="ml-64 pt-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="space-y-6">
                <div>
                  <h1 className="text-3xl font-bold text-slate-900">Data Quality Management</h1>
                  <p className="text-slate-600 mt-2">
                    Identify and resolve data quality issues to improve forecast accuracy
                  </p>
                </div>
                
                <DataCleanupDashboard
                  onComplete={handleCleanupComplete}
                />
              </div>
            </div>
          </main>
        </div>
      );
  }
}