'use client';

import { useState, useEffect } from 'react';
import { AppHeader } from '@/components/layout/AppHeader';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Save } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface SKUDetailClientProps {
  itemId: string;
}

export default function SKUDetailClient({ itemId }: SKUDetailClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [item, setItem] = useState({
    id: itemId,
    name: 'Brand-Name Milk',
    sku: 'MILK-001',
    vendor: 'Dairy Supplier Co',
    category: 'Dairy',
    currentStock: 15,
    leadTime: 3,
    rawPOSData: ['Milk 1L', 'Brand Milk', 'Milk Whole'],
  });

  // Mock forecast data
  const forecastData = [
    { date: 'Jan 1', historical: 45, forecast: null },
    { date: 'Jan 8', historical: 52, forecast: null },
    { date: 'Jan 15', historical: 48, forecast: null },
    { date: 'Jan 22', historical: 55, forecast: null },
    { date: 'Jan 29', historical: 50, forecast: null },
    { date: 'Feb 5', historical: null, forecast: 58 },
    { date: 'Feb 12', historical: null, forecast: 62 },
    { date: 'Feb 19', historical: null, forecast: 60 },
    { date: 'Feb 26', historical: null, forecast: 65 },
  ];

  useEffect(() => {
    // TODO: Fetch from Supabase
    setLoading(false);
  }, [itemId]);

  const handleSave = async () => {
    setSaving(true);
    // TODO: Save to Supabase
    setTimeout(() => {
      setSaving(false);
      router.push('/dashboard/inventory');
    }, 1000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <AppHeader />
      <AppSidebar />
      
      <main className="ml-64 pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => router.push('/dashboard/inventory')}
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                <div>
                  <h1 className="text-3xl font-bold text-slate-900">{item.name}</h1>
                  <p className="text-slate-600 mt-1">SKU: {item.sku}</p>
                </div>
              </div>
              <Button onClick={handleSave} disabled={saving}>
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>

            {/* Key Data */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Key Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div>
                  <Label className="text-slate-600">SKU</Label>
                  <p className="text-lg font-medium text-slate-900 mt-1">{item.sku}</p>
                </div>
                <div>
                  <Label className="text-slate-600">Assigned Vendor</Label>
                  <p className="text-lg font-medium text-slate-900 mt-1">{item.vendor}</p>
                </div>
                <div>
                  <Label className="text-slate-600">Current Stock</Label>
                  <p className="text-lg font-medium text-slate-900 mt-1">{item.currentStock} units</p>
                </div>
                <div>
                  <Label className="text-slate-600">Lead Time</Label>
                  <p className="text-lg font-medium text-slate-900 mt-1">{item.leadTime} days</p>
                </div>
              </div>
            </Card>

            {/* Forecast Chart */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Sales Forecast</h2>
              <p className="text-sm text-slate-600 mb-6">Historical sales (last 90 days) and 30-day forecast</p>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={forecastData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="historical" 
                    stroke="#8b5cf6" 
                    strokeWidth={2}
                    name="Historical Sales"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="forecast" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    name="Forecasted Sales"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>

            {/* Data Properties (Human-in-the-loop) */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Edit Product Data</h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="productName">Master Product Name</Label>
                  <Input
                    id="productName"
                    value={item.name}
                    onChange={(e) => setItem({ ...item, name: e.target.value })}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="vendor">Assign to Vendor</Label>
                  <Select value={item.vendor} onValueChange={(value) => setItem({ ...item, vendor: value })}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Dairy Supplier Co">Dairy Supplier Co</SelectItem>
                      <SelectItem value="Farm Fresh">Farm Fresh</SelectItem>
                      <SelectItem value="Bakery Supplies">Bakery Supplies</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="category">Assign to Category</Label>
                  <Input
                    id="category"
                    value={item.category}
                    onChange={(e) => setItem({ ...item, category: e.target.value })}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="leadTime">Lead Time (days)</Label>
                  <Input
                    id="leadTime"
                    type="number"
                    value={item.leadTime}
                    onChange={(e) => setItem({ ...item, leadTime: parseInt(e.target.value) })}
                    className="mt-1"
                  />
                </div>
              </div>
            </Card>

            {/* Raw POS Data */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Raw POS Data</h2>
              <p className="text-sm text-slate-600 mb-4">
                Original "dirty" data that was merged to create this golden record
              </p>
              <div className="bg-slate-50 rounded-lg p-4 space-y-2">
                {item.rawPOSData.map((data, index) => (
                  <div key={index} className="text-sm text-slate-700 font-mono">
                    • {data}
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
