import { ArrowUpRight, ArrowDownRight, Search } from 'lucide-react';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';

const inventoryData = [
  {
    sku: 'SKU-2847',
    name: 'Widget Pro',
    category: 'Electronics',
    currentStock: 45,
    predictedDemand: 156,
    recommendedOrder: 150,
    confidence: 96,
    status: 'critical',
    trend: 'up',
  },
  {
    sku: 'SKU-1923',
    name: 'Essential Kit',
    category: 'Home & Garden',
    currentStock: 234,
    predictedDemand: 180,
    recommendedOrder: 0,
    confidence: 94,
    status: 'good',
    trend: 'down',
  },
  {
    sku: 'SKU-4521',
    name: 'Summer Tee',
    category: 'Apparel',
    currentStock: 567,
    predictedDemand: 89,
    recommendedOrder: 0,
    confidence: 92,
    status: 'overstock',
    trend: 'down',
  },
  {
    sku: 'SKU-7834',
    name: 'Fitness Tracker',
    category: 'Sports',
    currentStock: 123,
    predictedDemand: 145,
    recommendedOrder: 50,
    confidence: 97,
    status: 'warning',
    trend: 'up',
  },
  {
    sku: 'SKU-3392',
    name: 'Organic Serum',
    category: 'Beauty',
    currentStock: 289,
    predictedDemand: 267,
    recommendedOrder: 0,
    confidence: 95,
    status: 'good',
    trend: 'up',
  },
];

export function InventoryTable() {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-slate-900 mb-1">SKU-Level Analysis</h3>
          <p className="text-slate-600 text-sm">Real-time inventory intelligence with demand predictions</p>
        </div>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input placeholder="Search SKUs..." className="pl-9" />
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>SKU</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Current Stock</TableHead>
              <TableHead className="text-right">Predicted Demand (30d)</TableHead>
              <TableHead className="text-right">Recommended Order</TableHead>
              <TableHead className="text-right">Confidence</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {inventoryData.map((item) => {
              const TrendIcon = item.trend === 'up' ? ArrowUpRight : ArrowDownRight;
              
              return (
                <TableRow key={item.sku} className="hover:bg-slate-50">
                  <TableCell className="text-slate-900">{item.sku}</TableCell>
                  <TableCell className="text-slate-900">{item.name}</TableCell>
                  <TableCell className="text-slate-600">{item.category}</TableCell>
                  <TableCell className="text-right text-slate-900">{item.currentStock}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <span className="text-slate-900">{item.predictedDemand}</span>
                      <TrendIcon 
                        className={`w-4 h-4 ${item.trend === 'up' ? 'text-green-600' : 'text-red-600'}`} 
                      />
                    </div>
                  </TableCell>
                  <TableCell className="text-right text-slate-900">
                    {item.recommendedOrder > 0 ? item.recommendedOrder : '—'}
                  </TableCell>
                  <TableCell className="text-right text-slate-600">{item.confidence}%</TableCell>
                  <TableCell>
                    {item.status === 'critical' && (
                      <Badge variant="destructive">Critical</Badge>
                    )}
                    {item.status === 'warning' && (
                      <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Warning</Badge>
                    )}
                    {item.status === 'good' && (
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Good</Badge>
                    )}
                    {item.status === 'overstock' && (
                      <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">Overstock</Badge>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
