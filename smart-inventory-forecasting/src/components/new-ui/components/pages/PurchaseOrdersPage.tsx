import { useState } from 'react';
import { FileText, Clock, CheckCircle } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { PODraftView } from '../purchase-orders/PODraftView';

const suggestedDrafts = [
  {
    id: 1,
    vendor: 'Dairy Suppliers Inc',
    vendorEmail: 'orders@dairysuppliers.com',
    itemCount: 5,
    totalValue: 450,
  },
  {
    id: 2,
    vendor: 'Farm Fresh Co',
    vendorEmail: 'purchasing@farmfresh.com',
    itemCount: 2,
    totalValue: 180,
  },
  {
    id: 3,
    vendor: 'Plant Based Foods',
    vendorEmail: 'orders@plantbased.com',
    itemCount: 3,
    totalValue: 320,
  },
];

const poHistory = [
  {
    poNumber: 'PO-2024-001',
    vendor: 'Dairy Suppliers Inc',
    dateCreated: 'Nov 10, 2024',
    status: 'sent',
    totalValue: 450,
  },
  {
    poNumber: 'PO-2024-002',
    vendor: 'Farm Fresh Co',
    dateCreated: 'Nov 9, 2024',
    status: 'sent',
    totalValue: 180,
  },
  {
    poNumber: 'PO-2024-003',
    vendor: 'Beverage Distributors',
    dateCreated: 'Nov 8, 2024',
    status: 'draft',
    totalValue: 620,
  },
];

export function PurchaseOrdersPage() {
  const [selectedDraft, setSelectedDraft] = useState<typeof suggestedDrafts[0] | null>(null);

  if (selectedDraft) {
    return <PODraftView draft={selectedDraft} onBack={() => setSelectedDraft(null)} />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-slate-900 mb-1">Purchase Orders</h2>
        <p className="text-slate-600">Manage your purchase orders and supplier communications</p>
      </div>

      <Tabs defaultValue="drafts" className="w-full">
        <TabsList>
          <TabsTrigger value="drafts">Suggested Drafts</TabsTrigger>
          <TabsTrigger value="history">PO History</TabsTrigger>
        </TabsList>

        <TabsContent value="drafts" className="space-y-4 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {suggestedDrafts.map((draft) => (
              <Card
                key={draft.id}
                className="p-5 cursor-pointer hover:border-slate-300 transition-colors"
                onClick={() => setSelectedDraft(draft)}
              >
                <div className="flex items-start gap-3 mb-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-slate-900 mb-1">{draft.vendor}</h3>
                    <p className="text-slate-600 text-sm">{draft.itemCount} items</p>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Total Value:</span>
                    <span className="text-slate-900">${draft.totalValue}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Contact:</span>
                    <span className="text-slate-900">{draft.vendorEmail}</span>
                  </div>
                </div>

                <Button className="w-full" size="sm">
                  Review Draft
                </Button>
              </Card>
            ))}
          </div>

          {suggestedDrafts.length === 0 && (
            <Card className="p-12 text-center">
              <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-slate-900 mb-2">No Urgent Orders</h3>
              <p className="text-slate-600">
                All inventory levels are healthy. Check back later for automated recommendations.
              </p>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <Card className="p-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>PO Number</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Date Created</TableHead>
                  <TableHead className="text-right">Total Value</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {poHistory.map((po) => (
                  <TableRow key={po.poNumber}>
                    <TableCell className="text-slate-900">{po.poNumber}</TableCell>
                    <TableCell className="text-slate-900">{po.vendor}</TableCell>
                    <TableCell className="text-slate-600">{po.dateCreated}</TableCell>
                    <TableCell className="text-right text-slate-900">${po.totalValue}</TableCell>
                    <TableCell>
                      {po.status === 'sent' && (
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Sent
                        </Badge>
                      )}
                      {po.status === 'draft' && (
                        <Badge className="bg-slate-100 text-slate-800 hover:bg-slate-100">
                          <Clock className="w-3 h-3 mr-1" />
                          Draft
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">View</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
