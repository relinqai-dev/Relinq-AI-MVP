import { AlertTriangle, TrendingDown, PackageX, Clock } from 'lucide-react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';

const alerts = [
  {
    id: 1,
    type: 'critical',
    icon: PackageX,
    title: 'Stock Out Risk',
    description: 'Widget Pro (SKU-2847)',
    timeframe: '3 days',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
  },
  {
    id: 2,
    type: 'warning',
    icon: TrendingDown,
    title: 'Demand Decline',
    description: 'Summer Collection',
    timeframe: '14% drop',
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
  },
  {
    id: 3,
    type: 'warning',
    icon: AlertTriangle,
    title: 'Overstock Alert',
    description: 'Winter Jackets',
    timeframe: '234% over',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
  },
  {
    id: 4,
    type: 'info',
    icon: Clock,
    title: 'Reorder Soon',
    description: 'Essential Kit (SKU-1923)',
    timeframe: '7 days',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
];

export function AlertsPanel() {
  return (
    <Card className="p-6">
      <div className="mb-4">
        <h3 className="text-slate-900 mb-1">Alerts & Insights</h3>
        <p className="text-slate-600 text-sm">Action items requiring attention</p>
      </div>

      <div className="space-y-3">
        {alerts.map((alert) => {
          const Icon = alert.icon;
          return (
            <div 
              key={alert.id} 
              className="p-3 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors cursor-pointer"
            >
              <div className="flex gap-3">
                <div className={`p-2 rounded-lg ${alert.bgColor} ${alert.color} shrink-0`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="text-slate-900 text-sm">{alert.title}</p>
                    {alert.type === 'critical' && (
                      <Badge variant="destructive" className="text-xs">Critical</Badge>
                    )}
                  </div>
                  <p className="text-slate-600 text-sm mb-1">{alert.description}</p>
                  <p className="text-slate-500 text-xs">{alert.timeframe}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
