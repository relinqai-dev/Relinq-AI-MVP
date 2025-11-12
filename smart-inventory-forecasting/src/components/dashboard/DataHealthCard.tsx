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
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <CheckCircle className="w-5 h-5 text-green-600" />
        <h3 className="text-lg font-semibold text-slate-900">Data Health</h3>
      </div>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-slate-600">Master Catalog Status:</span>
          <span className="font-semibold text-slate-900">{catalogStatus}% Clean</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-600">Duplicate Items Found:</span>
          <span className={`font-semibold ${duplicateItems > 0 ? 'text-amber-600' : 'text-green-600'}`}>
            {duplicateItems}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-600">Items Missing Vendor:</span>
          <span className={`font-semibold ${itemsMissingVendor > 0 ? 'text-red-600' : 'text-green-600'}`}>
            {itemsMissingVendor}
          </span>
        </div>
        <div className="pt-4 border-t border-slate-200">
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => router.push('/dashboard/data-cleanup')}
          >
            View Data Quality Report
          </Button>
        </div>
      </div>
    </Card>
  );
}
