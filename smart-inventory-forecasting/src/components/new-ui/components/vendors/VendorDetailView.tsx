import { ArrowLeft, Mail, Phone, User, Clock, FileText } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';

const assignedProducts = [
  { sku: 'SKU-10234', name: 'Brand-Name Milk', category: 'Dairy', stock: 15 },
  { sku: 'SKU-10892', name: 'Greek Yogurt', category: 'Dairy', stock: 45 },
  { sku: 'SKU-11234', name: 'Cheddar Cheese', category: 'Dairy', stock: 28 },
  { sku: 'SKU-11567', name: 'Butter Unsalted', category: 'Dairy', stock: 34 },
];

interface VendorDetailViewProps {
  vendor: {
    id: number;
    name: string;
    email: string;
    phone: string;
    contact: string;
    leadTime: number;
    productCount: number;
  } | null;
  onBack: () => void;
}

export function VendorDetailView({ vendor, onBack }: VendorDetailViewProps) {
  const isNewVendor = !vendor;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h2 className="text-slate-900">{isNewVendor ? 'New Vendor' : vendor.name}</h2>
          <p className="text-slate-600">
            {isNewVendor ? 'Add supplier information' : 'Manage supplier information'}
          </p>
        </div>
      </div>

      <Card className="p-6">
        <h3 className="text-slate-900 mb-4">Vendor Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="vendor-name">
              Vendor Name <span className="text-red-600">*</span>
            </Label>
            <Input
              id="vendor-name"
              defaultValue={vendor?.name || ''}
              placeholder="Enter vendor name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact-email">
              Contact Email <span className="text-red-600">*</span>
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                id="contact-email"
                type="email"
                className="pl-9"
                defaultValue={vendor?.email || ''}
                placeholder="orders@vendor.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact-phone">Contact Phone</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                id="contact-phone"
                type="tel"
                className="pl-9"
                defaultValue={vendor?.phone || ''}
                placeholder="(555) 123-4567"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="primary-contact">Primary Contact Person</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                id="primary-contact"
                className="pl-9"
                defaultValue={vendor?.contact || ''}
                placeholder="John Smith"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="lead-time">
              Supplier Lead Time (days) <span className="text-red-600">*</span>
            </Label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                id="lead-time"
                type="number"
                className="pl-9"
                defaultValue={vendor?.leadTime || ''}
                placeholder="3"
                min="1"
              />
            </div>
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="e.g., Order deadline is 4 PM on Tuesdays"
              rows={3}
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <Button>Save Vendor</Button>
          <Button variant="outline" onClick={onBack}>Cancel</Button>
        </div>
      </Card>

      {!isNewVendor && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-900">Assigned Products</h3>
            <Button variant="outline" size="sm">Assign Product</Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SKU</TableHead>
                <TableHead>Product Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Current Stock</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assignedProducts.map((product) => (
                <TableRow key={product.sku}>
                  <TableCell className="text-slate-600">{product.sku}</TableCell>
                  <TableCell className="text-slate-900">{product.name}</TableCell>
                  <TableCell className="text-slate-600">{product.category}</TableCell>
                  <TableCell className="text-right text-slate-900">{product.stock}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
