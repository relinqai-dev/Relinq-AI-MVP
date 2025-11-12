import { AlertTriangle, TrendingUp, CheckCircle, AlertCircle } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';

const actionableInsights = [
  {
    id: 1,
    type: 'stockout',
    title: 'Stockout Risk',
    message: "You are on track to sell out of 'Brand-Name Milk' in 2 days. Sales are 30% higher than average. I recommend ordering 40 units now.",
    action: 'Order Now',
  },
  {
    id: 2,
    type: 'anomaly',
    title: 'Data Anomaly',
    message: "You have 3 items named 'Coca-Cola 12oz' in your POS. This may be skewing your forecast.",
    action: 'Merge Items',
  },
  {
    id: 3,
    type: 'trend',
    title: 'New Trend',
    message: "Sales for 'Vegan Cheese' have doubled in the last 14 days. Your forecast has been adjusted.",
    action: 'View Details',
  },
];

const atRiskInventory = [
  {
    itemName: 'Brand-Name Milk',
    currentStock: 15,
    salesVelocity: 7.5,
    stockoutDate: '2 days',
    recommendedQty: 40,
  },
  {
    itemName: 'Organic Eggs',
    currentStock: 24,
    salesVelocity: 6.2,
    stockoutDate: '4 days',
    recommendedQty: 30,
  },
  {
    itemName: 'Whole Wheat Bread',
    currentStock: 12,
    salesVelocity: 4.8,
    stockoutDate: '3 days',
    recommendedQty: 25,
  },
  {
    itemName: 'Greek Yogurt',
    currentStock: 18,
    salesVelocity: 5.1,
    stockoutDate: '4 days',
    recommendedQty: 28,
  },
  {
    itemName: 'Fresh Spinach',
    currentStock: 8,
    salesVelocity: 3.2,
    stockoutDate: '3 days',
    recommendedQty: 20,
  },
];

const topMovers = [
  { name: 'Vegan Cheese', forecast: 245 },
  { name: 'Oat Milk', forecast: 198 },
  { name: 'Kombucha', forecast: 176 },
  { name: 'Almond Butter', forecast: 154 },
  { name: 'Protein Bars', forecast: 142 },
];

export function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Actionable Insights */}
      <div>
        <h2 className="text-slate-900 mb-4">What You Need to Focus On Right Now</h2>
        <div className="space-y-3">
          {actionableInsights.map((insight) => (
            <Card key={insight.id} className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {insight.type === 'stockout' && (
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                    )}
                    {insight.type === 'anomaly' && (
                      <AlertCircle className="w-5 h-5 text-amber-600" />
                    )}
                    {insight.type === 'trend' && (
                      <TrendingUp className="w-5 h-5 text-green-600" />
                    )}
                    <span className="text-slate-900">{insight.title}</span>
                  </div>
                  <p className="text-slate-600">{insight.message}</p>
                </div>
                <Button size="sm">{insight.action}</Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* At-Risk Inventory */}
      <Card className="p-6">
        <h3 className="text-slate-900 mb-4">At-Risk Inventory</h3>
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
            {atRiskInventory.map((item, index) => (
              <TableRow key={index}>
                <TableCell className="text-slate-900">{item.itemName}</TableCell>
                <TableCell className="text-right text-slate-900">{item.currentStock}</TableCell>
                <TableCell className="text-right text-slate-600">{item.salesVelocity}/day</TableCell>
                <TableCell>
                  <Badge variant="destructive">{item.stockoutDate}</Badge>
                </TableCell>
                <TableCell className="text-right text-slate-900">{item.recommendedQty}</TableCell>
                <TableCell>
                  <Button size="sm" variant="outline">Add to PO</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Movers */}
        <Card className="p-6">
          <h3 className="text-slate-900 mb-4">Top Movers (By Forecast)</h3>
          <div className="space-y-3">
            {topMovers.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-violet-100 text-violet-700 rounded-full">
                    {index + 1}
                  </div>
                  <span className="text-slate-900">{item.name}</span>
                </div>
                <span className="text-slate-600">{item.forecast} units</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Data Health */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <h3 className="text-slate-900">Data Health</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Master Catalog Status:</span>
              <span className="text-slate-900">98% Clean</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Duplicate Items Found:</span>
              <span className="text-amber-600">120</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Items Missing Vendor:</span>
              <span className="text-red-600">45</span>
            </div>
            <div className="pt-4 border-t border-slate-200">
              <Button variant="outline" className="w-full">View Data Quality Report</Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
