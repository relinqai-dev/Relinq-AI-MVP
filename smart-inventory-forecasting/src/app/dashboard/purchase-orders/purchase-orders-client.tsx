'use client';

import { useState } from 'react';
import { AppHeader } from '@/components/layout/AppHeader';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { FileText, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface DraftPO {
  id: string;
  vendorName: string;
  vendorEmail: string;
  itemCount: number;
  totalValue: number;
}

interface POHistory {
  id: string;
  poNumber: string;
  vendorName: string;
  dateCreated: string;
  status: 'draft' | 'sent' | 'received';
  itemCount: number;
}

export default function PurchaseOrdersPageClient() {
  const router = useRouter();
  // TODO: Replace with Supabase fetch
  const [draftPOs] = useState<DraftPO[]>([
    {
      id: '1',
      vendorName: 'Dairy Supplier Co',
      vendorEmail: 'orders@dairysupplier.com',
      itemCount: 5,
      totalValue: 450.00,
    },
    {
      id: '2',
      vendorName: 'Farm Fresh',
      vendorEmail: 'sales@farmfresh.com',
      itemCount: 2,
      totalValue: 180.00,
    },
  ]);

  const [poHistory] = useState<POHistory[]>([
    {
      id: 'po-001',
      poNumber: 'PO-2025-001',
      vendorName: 'Bakery Supplies',
      dateCreated: '2025-01-15',
      status: 'sent',
      itemCount: 8,
    },
    {
      id: 'po-002',
      poNumber: 'PO-2025-002',
      vendorName: 'Dairy Supplier Co',
      dateCreated: '2025-01-10',
      status: 'received',
      itemCount: 6,
    },
  ]);

  const [loading] = useState(false);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge variant="outline">Draft</Badge>;
      case 'sent':
        return <Badge className="bg-blue-100 text-blue-700">Sent</Badge>;
      case 'received':
        return <Badge className="bg-green-100 text-green-700">Received</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <AppHeader />
      <AppSidebar />
      
      <main className="ml-64 pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Purchase Orders</h1>
              <p className="text-slate-600 mt-2">Manage and create purchase orders from AI recommendations</p>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="drafts" className="w-full">
              <TabsList>
                <TabsTrigger value="drafts">
                  <FileText className="w-4 h-4 mr-2" />
                  Suggested Drafts ({draftPOs.length})
                </TabsTrigger>
                <TabsTrigger value="history">
                  <Clock className="w-4 h-4 mr-2" />
                  PO History
                </TabsTrigger>
              </TabsList>

              {/* Suggested Drafts Tab */}
              <TabsContent value="drafts" className="space-y-4">
                <Card className="p-6">
                  <h2 className="text-lg font-semibold text-slate-900 mb-4">
                    Auto-Generated Purchase Orders
                  </h2>
                  <p className="text-sm text-slate-600 mb-6">
                    Based on at-risk inventory, the system has automatically grouped items by vendor
                  </p>

                  {loading ? (
                    <p className="text-slate-600">Loading drafts...</p>
                  ) : draftPOs.length === 0 ? (
                    <div className="text-center py-12">
                      <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                      <p className="text-slate-500">No draft purchase orders at this time</p>
                      <p className="text-sm text-slate-400 mt-2">
                        Drafts will appear here when items need reordering
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {draftPOs.map((draft) => (
                        <Card
                          key={draft.id}
                          className="p-5 hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-violet-600"
                          onClick={() => router.push(`/dashboard/purchase-orders/${draft.id}`)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-slate-900">
                                Draft PO for {draft.vendorName}
                              </h3>
                              <p className="text-sm text-slate-600 mt-1">
                                {draft.itemCount} items • Est. ${draft.totalValue.toFixed(2)}
                              </p>
                              <p className="text-sm text-slate-500 mt-1">
                                Contact: {draft.vendorEmail}
                              </p>
                            </div>
                            <Button>
                              Review & Send
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </Card>
              </TabsContent>

              {/* PO History Tab */}
              <TabsContent value="history">
                <Card className="p-6">
                  <h2 className="text-lg font-semibold text-slate-900 mb-4">Purchase Order History</h2>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>PO Number</TableHead>
                          <TableHead>Vendor</TableHead>
                          <TableHead>Date Created</TableHead>
                          <TableHead>Items</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {loading ? (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-8">
                              Loading history...
                            </TableCell>
                          </TableRow>
                        ) : poHistory.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                              No purchase order history yet
                            </TableCell>
                          </TableRow>
                        ) : (
                          poHistory.map((po) => (
                            <TableRow key={po.id}>
                              <TableCell className="font-medium text-slate-900">{po.poNumber}</TableCell>
                              <TableCell className="text-slate-600">{po.vendorName}</TableCell>
                              <TableCell className="text-slate-600">{po.dateCreated}</TableCell>
                              <TableCell className="text-slate-600">{po.itemCount} items</TableCell>
                              <TableCell>{getStatusBadge(po.status)}</TableCell>
                              <TableCell>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => router.push(`/dashboard/purchase-orders/${po.id}`)}
                                >
                                  View
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
}
