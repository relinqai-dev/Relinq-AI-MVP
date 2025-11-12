'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface AtRiskItem {
  itemName: string;
  currentStock: number;
  salesVelocity: number;
  stockoutDate: string;
  recommendedQty: number;
}

interface AtRiskInventoryProps {
  items: AtRiskItem[];
  onAddToPO?: (item: AtRiskItem) => void;
}

export function AtRiskInventory({ items, onAddToPO }: AtRiskInventoryProps) {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-slate-900 mb-4">At-Risk Inventory</h3>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item Name</TableHead>
              <TableHead className="text-right">Current Stock</TableHead>
              <TableHead className="text-right">7-Day Sales Velocity</TableHead>
              <TableHead>Forecasted Stockout Date</TableHead>
              <TableHead className="text-right">Recommended Order Qty</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-slate-500 py-8">
                  No at-risk inventory items found
                </TableCell>
              </TableRow>
            ) : (
              items.map((item, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium text-slate-900">{item.itemName}</TableCell>
                  <TableCell className="text-right text-slate-900">{item.currentStock}</TableCell>
                  <TableCell className="text-right text-slate-600">{item.salesVelocity.toFixed(1)}/day</TableCell>
                  <TableCell>
                    <Badge variant="destructive">{item.stockoutDate}</Badge>
                  </TableCell>
                  <TableCell className="text-right text-slate-900">{item.recommendedQty}</TableCell>
                  <TableCell>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => onAddToPO?.(item)}
                    >
                      Add to PO
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
