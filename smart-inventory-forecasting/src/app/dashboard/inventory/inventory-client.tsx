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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Filter } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';

interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  vendor: string;
  category: string;
  currentStock: number;
  forecastedSales: number;
  stockStatus: 'in-stock' | 'low-stock' | 'out-of-stock';
}

export default function InventoryPageClient() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [vendorFilter, setVendorFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch from Supabase
    // Mock data for now
    setInventory([
      {
        id: '1',
        name: 'Brand-Name Milk',
        sku: 'MILK-001',
        vendor: 'Dairy Supplier Co',
        category: 'Dairy',
        currentStock: 15,
        forecastedSales: 120,
        stockStatus: 'low-stock',
      },
      {
        id: '2',
        name: 'Organic Eggs',
        sku: 'EGG-002',
        vendor: 'Farm Fresh',
        category: 'Dairy',
        currentStock: 24,
        forecastedSales: 95,
        stockStatus: 'in-stock',
      },
      {
        id: '3',
        name: 'Whole Wheat Bread',
        sku: 'BREAD-003',
        vendor: 'Bakery Supplies',
        category: 'Bakery',
        currentStock: 12,
        forecastedSales: 85,
        stockStatus: 'low-stock',
      },
    ]);
    setLoading(false);
  }, []);

  const filteredInventory = inventory.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesVendor = vendorFilter === 'all' || item.vendor === vendorFilter;
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    const matchesStock = stockFilter === 'all' || item.stockStatus === stockFilter;
    
    return matchesSearch && matchesVendor && matchesCategory && matchesStock;
  });

  const getStockBadge = (status: string) => {
    switch (status) {
      case 'in-stock':
        return <Badge className="bg-green-100 text-green-700">In Stock</Badge>;
      case 'low-stock':
        return <Badge className="bg-amber-100 text-amber-700">Low Stock</Badge>;
      case 'out-of-stock':
        return <Badge variant="destructive">Out of Stock</Badge>;
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
              <h1 className="text-3xl font-bold text-slate-900">Master Catalog</h1>
              <p className="text-slate-600 mt-2">Your single source of truth for all products</p>
            </div>

            {/* Filters */}
            <Card className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    placeholder="Search products or SKU..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Vendor Filter */}
                <Select value={vendorFilter} onValueChange={setVendorFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Vendors" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Vendors</SelectItem>
                    <SelectItem value="Dairy Supplier Co">Dairy Supplier Co</SelectItem>
                    <SelectItem value="Farm Fresh">Farm Fresh</SelectItem>
                    <SelectItem value="Bakery Supplies">Bakery Supplies</SelectItem>
                  </SelectContent>
                </Select>

                {/* Category Filter */}
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="Dairy">Dairy</SelectItem>
                    <SelectItem value="Bakery">Bakery</SelectItem>
                    <SelectItem value="Produce">Produce</SelectItem>
                  </SelectContent>
                </Select>

                {/* Stock Status Filter */}
                <Select value={stockFilter} onValueChange={setStockFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Stock Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Stock Status</SelectItem>
                    <SelectItem value="in-stock">In Stock</SelectItem>
                    <SelectItem value="low-stock">Low Stock</SelectItem>
                    <SelectItem value="out-of-stock">Out of Stock</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </Card>

            {/* Inventory Table */}
            <Card className="p-6">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product Name</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead>Assigned Vendor</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead className="text-right">Current Stock</TableHead>
                      <TableHead className="text-right">30-Day Forecast</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8">
                          Loading inventory...
                        </TableCell>
                      </TableRow>
                    ) : filteredInventory.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-slate-500">
                          No items found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredInventory.map((item) => (
                        <TableRow key={item.id} className="cursor-pointer hover:bg-slate-50">
                          <TableCell className="font-medium text-slate-900">{item.name}</TableCell>
                          <TableCell className="text-slate-600">{item.sku}</TableCell>
                          <TableCell className="text-slate-600">{item.vendor}</TableCell>
                          <TableCell className="text-slate-600">{item.category}</TableCell>
                          <TableCell className="text-right text-slate-900">{item.currentStock}</TableCell>
                          <TableCell className="text-right text-slate-900">{item.forecastedSales}</TableCell>
                          <TableCell>{getStockBadge(item.stockStatus)}</TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => router.push(`/dashboard/inventory/${item.id}`)}
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
