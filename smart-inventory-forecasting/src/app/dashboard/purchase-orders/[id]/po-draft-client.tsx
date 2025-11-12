'use client';

import { useState, useEffect } from 'react';
import { AppHeader } from '@/components/layout/AppHeader';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ArrowLeft, FileDown, Mail } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface POItem {
  id: string;
  name: string;
  sku: string;
  currentStock: number;
  recommendedQty: number;
  unitCost: number;
}

interface PODraftClientProps {
  poId: string;
}

export default function PODraftClient({ poId }: PODraftClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [po, setPO] = useState({
    id: poId,
    poNumber: 'PO-2025-003',
    vendorName: 'Dairy Supplier Co',
    vendorEmail: 'orders@dairysupplier.com',
    dateCreated: new Date().toISOString().split('T')[0],
  });

  const [items, setItems] = useState<POItem[]>([
    {
      id: '1',
      name: 'Brand-Name Milk',
      sku: 'MILK-001',
      currentStock: 15,
      recommendedQty: 40,
      unitCost: 3.50,
    },
    {
      id: '2',
      name: 'Organic Eggs',
      sku: 'EGG-002',
      currentStock: 24,
      recommendedQty: 30,
      unitCost: 4.25,
    },
    {
      id: '3',
      name: 'Greek Yogurt',
      sku: 'YOGURT-003',
      currentStock: 18,
      recommendedQty: 28,
      unitCost: 2.75,
    },
  ]);

  useEffect(() => {
    // TODO: Fetch from Supabase
    setLoading(false);
  }, [poId]);

  const updateQuantity = (itemId: string, newQty: number) => {
    setItems(items.map(item => 
      item.id === itemId ? { ...item, recommendedQty: newQty } : item
    ));
  };

  const totalValue = items.reduce((sum, item) => sum + (item.recommendedQty * item.unitCost), 0);

  const handleGeneratePDF = () => {
    // TODO: Implement PDF generation using pdf-lib
    alert('PDF generation will be implemented');
  };

  const handleSendEmail = () => {
    const itemList = items.map(item => 
      `${item.name} (${item.sku}) - Qty: ${item.recommendedQty} @ $${item.unitCost.toFixed(2)} = $${(item.recommendedQty * item.unitCost).toFixed(2)}`
    ).join('\n');

    const emailBody = `Dear ${po.vendorName},

Please see our purchase order below:

Purchase Order: ${po.poNumber}
Date: ${po.dateCreated}

Items:
${itemList}

Total: $${totalValue.toFixed(2)}

Please confirm receipt and expected delivery date.

Thank you!`;

    const mailtoLink = `mailto:${po.vendorEmail}?subject=Purchase Order ${po.poNumber} from Smart Inventory&body=${encodeURIComponent(emailBody)}`;
    window.location.href = mailtoLink;
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
                  onClick={() => router.push('/dashboard/purchase-orders')}
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                <div>
                  <h1 className="text-3xl font-bold text-slate-900">Purchase Order {po.poNumber}</h1>
                  <p className="text-slate-600 mt-1">{po.vendorName}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleGeneratePDF}>
                  <FileDown className="w-4 h-4 mr-2" />
                  Generate PDF
                </Button>
                <Button onClick={handleSendEmail}>
                  <Mail className="w-4 h-4 mr-2" />
                  Send Email
                </Button>
              </div>
            </div>

            {/* PO Header Info */}
            <Card className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm text-slate-600">Vendor Name</p>
                  <p className="text-lg font-semibold text-slate-900">{po.vendorName}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Contact Email</p>
                  <p className="text-lg font-semibold text-slate-900">{po.vendorEmail}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">PO Number</p>
                  <p className="text-lg font-semibold text-slate-900">{po.poNumber}</p>
                </div>
              </div>
            </Card>

            {/* Items Table */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Order Items</h2>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item Name</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead className="text-right">Current Stock</TableHead>
                      <TableHead className="text-right">Recommended Qty</TableHead>
                      <TableHead className="text-right">Unit Cost</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium text-slate-900">{item.name}</TableCell>
                        <TableCell className="text-slate-600">{item.sku}</TableCell>
                        <TableCell className="text-right text-slate-600">{item.currentStock}</TableCell>
                        <TableCell className="text-right">
                          <Input
                            type="number"
                            min="1"
                            value={item.recommendedQty}
                            onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 0)}
                            className="w-20 text-right"
                          />
                        </TableCell>
                        <TableCell className="text-right text-slate-600">
                          ${item.unitCost.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right font-medium text-slate-900">
                          ${(item.recommendedQty * item.unitCost).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="bg-slate-50">
                      <TableCell colSpan={5} className="text-right font-semibold text-slate-900">
                        Total Order Value:
                      </TableCell>
                      <TableCell className="text-right font-bold text-slate-900 text-lg">
                        ${totalValue.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </Card>

            {/* Email Preview */}
            <Card className="p-6 bg-slate-50">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Email Preview</h2>
              <div className="space-y-2 text-sm">
                <p><span className="font-semibold">To:</span> {po.vendorEmail}</p>
                <p><span className="font-semibold">Subject:</span> Purchase Order {po.poNumber} from Smart Inventory</p>
                <div className="mt-4 p-4 bg-white rounded border border-slate-200">
                  <p className="whitespace-pre-line text-slate-700">
                    Dear {po.vendorName},
                    {'\n\n'}
                    Please see our purchase order below:
                    {'\n\n'}
                    Purchase Order: {po.poNumber}
                    {'\n'}
                    Date: {po.dateCreated}
                    {'\n\n'}
                    Items:
                    {'\n'}
                    {items.map(item => 
                      `${item.name} (${item.sku}) - Qty: ${item.recommendedQty} @ $${item.unitCost.toFixed(2)} = $${(item.recommendedQty * item.unitCost).toFixed(2)}`
                    ).join('\n')}
                    {'\n\n'}
                    Total: ${totalValue.toFixed(2)}
                    {'\n\n'}
                    Please confirm receipt and expected delivery date.
                    {'\n\n'}
                    Thank you!
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
