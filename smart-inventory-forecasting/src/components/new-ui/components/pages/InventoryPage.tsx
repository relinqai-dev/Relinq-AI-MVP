import { useState } from 'react';
import { Search, ArrowUpDown } from 'lucide-react';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { SKUDetailView } from '../inventory/SKUDetailView';

const inventoryData = [
  {
    id: 1,
    productName: 'Brand-Name Milk',
    sku: 'SKU-10234',
    vendor: 'Dairy Suppliers Inc',
    category: 'Dairy',
    currentStock: 15,
    forecastedSales: 52,
    stockStatus: 'low',
  },
  {
    id: 2,
    productName: 'Organic Eggs',
    sku: 'SKU-10567',
    vendor: 'Farm Fresh Co',
    category: 'Dairy',
    currentStock: 24,
    forecastedSales: 43,
    stockStatus: 'low',
  },
  {
    id: 3,
    productName: 'Vegan Cheese',
    sku: 'SKU-20145',
    vendor: 'Plant Based Foods',
    category: 'Dairy Alternatives',
    currentStock: 56,
    forecastedSales: 245,
    stockStatus: 'in-stock',
  },
  {
    id: 4,
    productName: 'Whole Wheat Bread',
    sku: 'SKU-30892',
    vendor: 'Artisan Bakery',
    category: 'Bakery',
    currentStock: 12,
    forecastedSales: 34,
    stockStatus: 'low',
  },
  {
    id: 5,
    productName: 'Greek Yogurt',
    sku: 'SKU-10892',
    vendor: 'Dairy Suppliers Inc',
    category: 'Dairy',
    currentStock: 45,
    forecastedSales: 36,
    stockStatus: 'in-stock',
  },
  {
    id: 6,
    productName: 'Kombucha Original',
    sku: 'SKU-40231',
    vendor: 'Beverage Distributors',
    category: 'Beverages',
    currentStock: 0,
    forecastedSales: 176,
    stockStatus: 'out',
  },
];

export function InventoryPage() {
  const [selectedSKU, setSelectedSKU] = useState<typeof inventoryData[0] | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterVendor, setFilterVendor] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  if (selectedSKU) {
    return <SKUDetailView sku={selectedSKU} onBack={() => setSelectedSKU(null)} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-slate-900 mb-1">Master Catalog</h2>
          <p className="text-slate-600">Your single source of truth for all inventory</p>
        </div>
        <Button>Export Catalog</Button>
      </div>

      <Card className="p-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search products, SKUs..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={filterVendor} onValueChange={setFilterVendor}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by vendor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Vendors</SelectItem>
              <SelectItem value="dairy">Dairy Suppliers Inc</SelectItem>
              <SelectItem value="farm">Farm Fresh Co</SelectItem>
              <SelectItem value="plant">Plant Based Foods</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Stock status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="in-stock">In Stock</SelectItem>
              <SelectItem value="low">Low Stock</SelectItem>
              <SelectItem value="out">Out of Stock</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <div className="flex items-center gap-2 cursor-pointer">
                  Product Name
                  <ArrowUpDown className="w-4 h-4" />
                </div>
              </TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Assigned Vendor</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Current Stock</TableHead>
              <TableHead className="text-right">30-Day Forecast</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {inventoryData.map((item) => (
              <TableRow
                key={item.id}
                className="cursor-pointer hover:bg-slate-50"
                onClick={() => setSelectedSKU(item)}
              >
                <TableCell className="text-slate-900">{item.productName}</TableCell>
                <TableCell className="text-slate-600">{item.sku}</TableCell>
                <TableCell className="text-slate-600">{item.vendor}</TableCell>
                <TableCell className="text-slate-600">{item.category}</TableCell>
                <TableCell className="text-right text-slate-900">{item.currentStock}</TableCell>
                <TableCell className="text-right text-slate-900">{item.forecastedSales}</TableCell>
                <TableCell>
                  {item.stockStatus === 'in-stock' && (
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100">In Stock</Badge>
                  )}
                  {item.stockStatus === 'low' && (
                    <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Low Stock</Badge>
                  )}
                  {item.stockStatus === 'out' && (
                    <Badge variant="destructive">Out of Stock</Badge>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
