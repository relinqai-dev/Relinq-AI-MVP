'use client';

import { Card } from '@/components/ui/card';

interface TopMover {
  name: string;
  forecast: number;
}

interface TopMoversProps {
  items: TopMover[];
}

export function TopMovers({ items }: TopMoversProps) {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-slate-900 mb-4">Top Movers (By Forecast)</h3>
      <div className="space-y-3">
        {items.length === 0 ? (
          <p className="text-center text-slate-500 py-8">No forecast data available</p>
        ) : (
          items.map((item, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 bg-violet-100 text-violet-700 rounded-full font-semibold text-sm">
                  {index + 1}
                </div>
                <span className="font-medium text-slate-900">{item.name}</span>
              </div>
              <span className="text-slate-600 font-medium">{item.forecast} units</span>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
