'use client';

import { CheckCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface DataHealthProps {
  catalogStatus: number;
  duplicateItems: number;
  itemsMissingVendor: number;
}

export function DataHealthCard({ catalogStatus, duplicateItems, itemsMissingVendor }: DataHealthProps) {
  const router = useRouter();

  return (
    <Card className="p-6 border-gray-200 shadow-sm">
      <div className="flex items-center gap-2 mb-6">
        <div className="p-2 bg-green-100 rounded-lg">
          <CheckCircle className="w-5 h-5 text-green-600" />
        </div>
        <h3 className="text-lg font-bold text-gray-900">Data Health</h3>
      </div>
      <div className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <span className="text-gray-700 font-medium">Master Catalog Status:</span>
          <span className="font-bold text-gray-900">{catalogStatus}% Clean</span>
        </div>
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <span className="text-gray-700 font-medium">Duplicate Items Found:</span>
          <span className={`font-bold ${duplicateItems > 0 ? 'text-amber-700' : 'text-green-700'}`}>
            {duplicateItems}
          </span>
        </div>
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <span className="text-gray-700 font-medium">Items Missing Vendor:</span>
          <span className={`font-bold ${itemsMissingVendor > 0 ? 'text-red-700' : 'text-green-700'}`}>
            {itemsMissingVendor}
          </span>
        </div>
        <div className="pt-2">
          <Button 
            className="w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold"
            onClick={() => router.push('/dashboard/data-cleanup')}
          >
            View Data Quality Report
          </Button>
        </div>
      </div>
    </Card>
  );
}
