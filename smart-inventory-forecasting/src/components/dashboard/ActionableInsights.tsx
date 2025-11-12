'use client';

import { AlertTriangle, TrendingUp, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Insight {
  id: string;
  type: 'stockout' | 'anomaly' | 'trend';
  title: string;
  message: string;
  action: string;
  onAction?: () => void;
}

interface ActionableInsightsProps {
  insights: Insight[];
}

export function ActionableInsights({ insights }: ActionableInsightsProps) {
  return (
    <div className="space-y-3">
      {insights.map((insight) => (
        <Card key={insight.id} className="p-5 hover:shadow-md transition-shadow">
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
                <span className="font-medium text-slate-900">{insight.title}</span>
              </div>
              <p className="text-slate-600 text-sm">{insight.message}</p>
            </div>
            <Button 
              size="sm" 
              onClick={insight.onAction}
              className="shrink-0"
            >
              {insight.action}
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}
