'use client';

import { useState, useEffect } from 'react';
import { AppHeader } from '@/components/layout/AppHeader';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface VendorDetailClientProps {
  vendorId: string;
}

export default function VendorDetailClient({ vendorId }: VendorDetailClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [vendor, setVendor] = useState({
    id: vendorId,
    name: 'Dairy Supplier Co',
    contactEmail: 'orders@dairysupplier.com',
    contactPhone: '+1 (555) 123-4567',
    primaryContact: 'John Smith',
    notes: 'Order deadline is 4 PM on Tuesdays',
    leadTime: 3,
  });

  const [assignedProducts, setAssignedProducts] = useState([
    { id: '1', name: 'Brand-Name Milk', sku: 'MILK-001', currentStock: 15 },
    { id: '2', name: 'Organic Eggs', sku: 'EGG-002', currentStock: 24 },
    { id: '3', name: 'Greek Yogurt', sku: 'YOGURT-003', currentStock: 18 },
  ]);

  useEffect(() => {
    // TODO: Fetch from Supabase
    setLoading(false);
  }, [vendorId]);

  const handleSave = async () => {
    setSaving(true);
    // TODO: Save to Supabase
    setTimeout(() => {
      setSaving(false);
      router.push('/dashboard/vendors');
    }, 1000);
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this vendor?')) {
      // TODO: Delete from Supabase
      router.push('/dashboard/vendors');
    }
  };

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
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

  const isEmailValid = validateEmail(vendor.contactEmail);
  const isFormValid = vendor.name && isEmailValid && vendor.leadTime > 0;

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
                  onClick={() => router.push('/dashboard/vendors')}
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                <div>
                  <h1 className="text-3xl font-bold text-slate-900">{vendor.name}</h1>
                  <p className="text-slate-600 mt-1">Vendor Details</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="destructive" onClick={handleDelete}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
                <Button onClick={handleSave} disabled={saving || !isFormValid}>
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>

            {/* Vendor Information Form */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Vendor Information</h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="vendorName">Vendor Name *</Label>
                  <Input
                    id="vendorName"
                    value={vendor.name}
                    onChange={(e) => setVendor({ ...vendor, name: e.target.value })}
                    className="mt-1"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="contactEmail">Contact Email *</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={vendor.contactEmail}
                    onChange={(e) => setVendor({ ...vendor, contactEmail: e.target.value })}
                    className={`mt-1 ${!isEmailValid && vendor.contactEmail ? 'border-red-500' : ''}`}
                    required
                  />
                  {!isEmailValid && vendor.contactEmail && (
                    <p className="text-sm text-red-600 mt-1">Please enter a valid email address</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="contactPhone">Contact Phone</Label>
                  <Input
                    id="contactPhone"
                    type="tel"
                    value={vendor.contactPhone}
                    onChange={(e) => setVendor({ ...vendor, contactPhone: e.target.value })}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="primaryContact">Primary Contact Person</Label>
                  <Input
                    id="primaryContact"
                    value={vendor.primaryContact}
                    onChange={(e) => setVendor({ ...vendor, primaryContact: e.target.value })}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="leadTime">Supplier Lead Time (days) *</Label>
                  <Input
                    id="leadTime"
                    type="number"
                    min="1"
                    value={vendor.leadTime}
                    onChange={(e) => setVendor({ ...vendor, leadTime: parseInt(e.target.value) || 0 })}
                    className="mt-1"
                    required
                  />
                  <p className="text-sm text-slate-500 mt-1">
                    This is used by the forecasting engine to calculate reorder points
                  </p>
                </div>

                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={vendor.notes}
                    onChange={(e) => setVendor({ ...vendor, notes: e.target.value })}
                    className="mt-1"
                    rows={3}
                    placeholder="e.g., Order deadline is 4 PM on Tuesdays"
                  />
                </div>
              </div>
            </Card>

            {/* Assigned Products */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Assigned Products</h2>
              <p className="text-sm text-slate-600 mb-4">
                All inventory items from the Master Catalog assigned to this vendor
              </p>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product Name</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead className="text-right">Current Stock</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {assignedProducts.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8 text-slate-500">
                          No products assigned to this vendor yet
                        </TableCell>
                      </TableRow>
                    ) : (
                      assignedProducts.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell className="font-medium text-slate-900">{product.name}</TableCell>
                          <TableCell className="text-slate-600">{product.sku}</TableCell>
                          <TableCell className="text-right text-slate-900">{product.currentStock}</TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => router.push(`/dashboard/inventory/${product.id}`)}
                            >
                              View Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
