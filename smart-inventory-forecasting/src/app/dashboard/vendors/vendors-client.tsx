'use client';

import { useState, useEffect } from 'react';
import { AppHeader } from '@/components/layout/AppHeader';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Vendor {
  id: string;
  name: string;
  contactEmail: string;
  contactPhone: string;
  leadTime: number;
  productCount: number;
}

export default function VendorsPageClient() {
  const router = useRouter();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch from Supabase
    setVendors([
      {
        id: '1',
        name: 'Dairy Supplier Co',
        contactEmail: 'orders@dairysupplier.com',
        contactPhone: '+1 (555) 123-4567',
        leadTime: 3,
        productCount: 15,
      },
      {
        id: '2',
        name: 'Farm Fresh',
        contactEmail: 'sales@farmfresh.com',
        contactPhone: '+1 (555) 234-5678',
        leadTime: 2,
        productCount: 8,
      },
      {
        id: '3',
        name: 'Bakery Supplies',
        contactEmail: 'orders@bakerysupplies.com',
        contactPhone: '+1 (555) 345-6789',
        leadTime: 5,
        productCount: 12,
      },
    ]);
    setLoading(false);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <AppHeader />
      <AppSidebar />
      
      <main className="ml-64 pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-slate-900">Vendor Management</h1>
                <p className="text-slate-600 mt-2">Manage your suppliers and vendors</p>
              </div>
              <Button onClick={() => router.push('/dashboard/vendors/new')}>
                <Plus className="w-4 h-4 mr-2" />
                Add New Vendor
              </Button>
            </div>

            {/* Vendor List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loading ? (
                <Card className="p-6">
                  <p className="text-slate-600">Loading vendors...</p>
                </Card>
              ) : vendors.length === 0 ? (
                <Card className="p-6 col-span-full">
                  <p className="text-center text-slate-500">No vendors found. Add your first vendor to get started.</p>
                </Card>
              ) : (
                vendors.map((vendor) => (
                  <Card
                    key={vendor.id}
                    className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => router.push(`/dashboard/vendors/${vendor.id}`)}
                  >
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">{vendor.name}</h3>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-slate-600">Email:</span>
                        <p className="text-slate-900">{vendor.contactEmail}</p>
                      </div>
                      <div>
                        <span className="text-slate-600">Phone:</span>
                        <p className="text-slate-900">{vendor.contactPhone}</p>
                      </div>
                      <div className="flex justify-between pt-4 border-t border-slate-200">
                        <div>
                          <span className="text-slate-600">Lead Time:</span>
                          <p className="text-slate-900 font-medium">{vendor.leadTime} days</p>
                        </div>
                        <div>
                          <span className="text-slate-600">Products:</span>
                          <p className="text-slate-900 font-medium">{vendor.productCount}</p>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
