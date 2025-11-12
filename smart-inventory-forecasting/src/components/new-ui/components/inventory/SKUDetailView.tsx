import { ArrowLeft, Package, TrendingUp } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';

const historicalData = [
  { date: 'Day 1', sales: 4 },
  { date: 'Day 7', sales: 5 },
  { date: 'Day 14', sales: 6 },
  { date: 'Day 21', sales: 7 },
  { date: 'Day 28', sales: 8 },
  { date: 'Day 35', sales: 7 },
  { date: 'Day 42', sales: 9 },
  { date: 'Day 49', sales: 10 },
  { date: 'Day 56', sales: 8 },
  { date: 'Day 63', sales: 11 },
  { date: 'Day 70', sales: 9 },
  { date: 'Day 77', sales: 10 },
  { date: 'Day 84', sales: 12 },
  { date: 'Day 90', sales: 11 },
  { date: 'Day 97', sales: null, forecast: 13 },
  { date: 'Day 104', sales: null, forecast: 14 },
  { date: 'Day 111', sales: null, forecast: 15 },
  { date: 'Day 118', sales: null, forecast: 16 },
];

interface SKUDetailViewProps {
  sku: {
    id: number;
    productName: string;
    sku: string;
    vendor: string;
    category: string;
    currentStock: number;
    forecastedSales: number;
  };
  onBack: () => void;
}

export function SKUDetailView({ sku, onBack }: SKUDetailViewProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h2 className="text-slate-900">{sku.productName}</h2>
          <p className="text-slate-600">{sku.sku}</p>
        </div>
        <Button>Add to Purchase Order</Button>
      </div>

      {/* Key Data Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3 mb-2">
            <Package className="w-4 h-4 text-slate-500" />
            <p className="text-slate-600 text-sm">Current Stock</p>
          </div>
          <p className="text-slate-900 text-2xl">{sku.currentStock}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-4 h-4 text-slate-500" />
            <p className="text-slate-600 text-sm">30-Day Forecast</p>
          </div>
          <p className="text-slate-900 text-2xl">{sku.forecastedSales}</p>
        </Card>
        <Card className="p-4">
          <p className="text-slate-600 text-sm mb-2">Assigned Vendor</p>
          <p className="text-slate-900">{sku.vendor}</p>
        </Card>
        <Card className="p-4">
          <p className="text-slate-600 text-sm mb-2">Lead Time</p>
          <p className="text-slate-900">3 days</p>
        </Card>
      </div>

      {/* Forecast Chart */}
      <Card className="p-6">
        <h3 className="text-slate-900 mb-4">Sales History & Forecast</h3>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={historicalData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
            <YAxis stroke="#64748b" fontSize={12} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
              }}
            />
            <Legend />
            <ReferenceLine x="Day 90" stroke="#94a3b8" strokeDasharray="3 3" />
            <Line
              type="monotone"
              dataKey="sales"
              stroke="#3b82f6"
              strokeWidth={2}
              name="Historical Sales"
              dot={{ r: 3 }}
            />
            <Line
              type="monotone"
              dataKey="forecast"
              stroke="#8b5cf6"
              strokeWidth={2}
              strokeDasharray="5 5"
              name="Forecast"
              dot={{ r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Data Properties */}
      <Card className="p-6">
        <h3 className="text-slate-900 mb-4">Master Record Properties</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>Master Product Name</Label>
            <Input defaultValue={sku.productName} />
          </div>
          <div className="space-y-2">
            <Label>SKU</Label>
            <Input defaultValue={sku.sku} disabled />
          </div>
          <div className="space-y-2">
            <Label>Assign to Vendor</Label>
            <Select defaultValue={sku.vendor}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Dairy Suppliers Inc">Dairy Suppliers Inc</SelectItem>
                <SelectItem value="Farm Fresh Co">Farm Fresh Co</SelectItem>
                <SelectItem value="Plant Based Foods">Plant Based Foods</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Category</Label>
            <Input defaultValue={sku.category} />
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-slate-200">
          <h4 className="text-slate-900 mb-3">Raw POS Data</h4>
          <div className="bg-slate-50 p-4 rounded-lg">
            <p className="text-slate-600 text-sm mb-2">Original entries merged into this golden record:</p>
            <ul className="space-y-1 text-sm text-slate-600">
              <li>• "Brand Milk 1gal" (Store 1)</li>
              <li>• "Brand-Name Milk" (Store 2)</li>
              <li>• "MILK BRAND NAME" (Store 3)</li>
            </ul>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <Button>Save Changes</Button>
          <Button variant="outline">Cancel</Button>
        </div>
      </Card>
    </div>
  );
}
