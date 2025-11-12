import { useState } from 'react';
import { Plus, Building2, Mail, Phone, Clock } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { VendorDetailView } from '../vendors/VendorDetailView';

const vendorsData = [
  {
    id: 1,
    name: 'Dairy Suppliers Inc',
    email: 'orders@dairysuppliers.com',
    phone: '(555) 123-4567',
    contact: 'John Smith',
    leadTime: 3,
    productCount: 24,
  },
  {
    id: 2,
    name: 'Farm Fresh Co',
    email: 'purchasing@farmfresh.com',
    phone: '(555) 234-5678',
    contact: 'Sarah Johnson',
    leadTime: 2,
    productCount: 18,
  },
  {
    id: 3,
    name: 'Plant Based Foods',
    email: 'orders@plantbased.com',
    phone: '(555) 345-6789',
    contact: 'Mike Chen',
    leadTime: 5,
    productCount: 12,
  },
  {
    id: 4,
    name: 'Artisan Bakery',
    email: 'wholesale@artisanbakery.com',
    phone: '(555) 456-7890',
    contact: 'Emily Rodriguez',
    leadTime: 1,
    productCount: 8,
  },
  {
    id: 5,
    name: 'Beverage Distributors',
    email: 'orders@bevdist.com',
    phone: '(555) 567-8901',
    contact: 'David Lee',
    leadTime: 4,
    productCount: 32,
  },
];

export function VendorsPage() {
  const [selectedVendor, setSelectedVendor] = useState<typeof vendorsData[0] | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  if (selectedVendor || isCreatingNew) {
    return (
      <VendorDetailView
        vendor={selectedVendor}
        onBack={() => {
          setSelectedVendor(null);
          setIsCreatingNew(false);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-slate-900 mb-1">Vendors</h2>
          <p className="text-slate-600">Manage your supplier relationships</p>
        </div>
        <Button onClick={() => setIsCreatingNew(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add New Vendor
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {vendorsData.map((vendor) => (
          <Card
            key={vendor.id}
            className="p-5 cursor-pointer hover:border-slate-300 transition-colors"
            onClick={() => setSelectedVendor(vendor)}
          >
            <div className="flex items-start gap-3 mb-4">
              <div className="p-3 bg-violet-100 rounded-lg">
                <Building2 className="w-5 h-5 text-violet-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-slate-900 mb-1">{vendor.name}</h3>
                <p className="text-slate-600 text-sm">{vendor.productCount} products</p>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-slate-600">
                <Mail className="w-4 h-4" />
                <span>{vendor.email}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Phone className="w-4 h-4" />
                <span>{vendor.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Clock className="w-4 h-4" />
                <span>{vendor.leadTime} day lead time</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-200">
              <p className="text-slate-600 text-sm">Contact: {vendor.contact}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
