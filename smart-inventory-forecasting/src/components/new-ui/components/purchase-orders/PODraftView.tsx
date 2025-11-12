import { ArrowLeft, Download, Mail } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';

const poItems = [
  {
    sku: 'SKU-10234',
    itemName: 'Brand-Name Milk',
    currentStock: 15,
    recommendedQty: 40,
    unitCost: 3.50,
  },
  {
    sku: 'SKU-10892',
    itemName: 'Greek Yogurt',
    currentStock: 18,
    recommendedQty: 28,
    unitCost: 4.25,
  },
  {
    sku: 'SKU-11234',
    itemName: 'Cheddar Cheese',
    currentStock: 12,
    recommendedQty: 30,
    unitCost: 6.75,
  },
  {
    sku: 'SKU-11567',
    itemName: 'Butter Unsalted',
    currentStock: 22,
    recommendedQty: 25,
    unitCost: 5.50,
  },
  {
    sku: 'SKU-12001',
    itemName: 'Heavy Cream',
    currentStock: 8,
    recommendedQty: 20,
    unitCost: 4.00,
  },
];

interface PODraftViewProps {
  draft: {
    id: number;
    vendor: string;
    vendorEmail: string;
    itemCount: number;
    totalValue: number;
  };
  onBack: () => void;
}

export function PODraftView({ draft, onBack }: PODraftViewProps) {
  const poNumber = `PO-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
  
  const calculateTotal = () => {
    return poItems.reduce((sum, item) => sum + (item.recommendedQty * item.unitCost), 0).toFixed(2);
  };

  const handleSendEmail = () => {
    const itemList = poItems
      .map(item => `${item.itemName} (${item.sku}): ${item.recommendedQty} units @ $${item.unitCost} = $${(item.recommendedQty * item.unitCost).toFixed(2)}`)
      .join('\n');

    const subject = encodeURIComponent(`Purchase Order ${poNumber} from Astra`);
    const body = encodeURIComponent(
      `Dear ${draft.vendor} Team,\n\nPlease see our purchase order below:\n\nPO Number: ${poNumber}\nDate: ${new Date().toLocaleDateString()}\n\n${itemList}\n\nTotal: $${calculateTotal()}\n\nPlease confirm receipt of this order.\n\nBest regards,\nYour Company Name`
    );

    window.location.href = `mailto:${draft.vendorEmail}?subject=${subject}&body=${body}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h2 className="text-slate-900">Purchase Order Draft</h2>
          <p className="text-slate-600">{draft.vendor}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Generate PDF
          </Button>
          <Button onClick={handleSendEmail}>
            <Mail className="w-4 h-4 mr-2" />
            Send Email
          </Button>
        </div>
      </div>

      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="space-y-2">
            <Label>PO Number</Label>
            <Input value={poNumber} disabled />
          </div>
          <div className="space-y-2">
            <Label>Vendor Name</Label>
            <Input value={draft.vendor} disabled />
          </div>
          <div className="space-y-2">
            <Label>Contact Email</Label>
            <Input value={draft.vendorEmail} disabled />
          </div>
        </div>

        <div className="mb-4">
          <h3 className="text-slate-900 mb-3">Order Items</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SKU</TableHead>
                <TableHead>Item Name</TableHead>
                <TableHead className="text-right">Current Stock</TableHead>
                <TableHead className="text-right">Recommended Qty</TableHead>
                <TableHead className="text-right">Unit Cost</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {poItems.map((item) => (
                <TableRow key={item.sku}>
                  <TableCell className="text-slate-600">{item.sku}</TableCell>
                  <TableCell className="text-slate-900">{item.itemName}</TableCell>
                  <TableCell className="text-right text-slate-600">{item.currentStock}</TableCell>
                  <TableCell className="text-right">
                    <Input
                      type="number"
                      defaultValue={item.recommendedQty}
                      className="w-20 text-right"
                      min="1"
                    />
                  </TableCell>
                  <TableCell className="text-right text-slate-600">${item.unitCost.toFixed(2)}</TableCell>
                  <TableCell className="text-right text-slate-900">
                    ${(item.recommendedQty * item.unitCost).toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="flex justify-end pt-4 border-t border-slate-200">
          <div className="text-right">
            <p className="text-slate-600 mb-1">Total Amount</p>
            <p className="text-slate-900 text-2xl">${calculateTotal()}</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
