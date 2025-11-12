import { TrendingUp, TrendingDown, Package, AlertTriangle, DollarSign, BarChart3 } from 'lucide-react';
import { Card } from './ui/card';

const metrics = [
  {
    label: 'Forecast Accuracy',
    value: '94.3%',
    change: '+2.1%',
    trend: 'up',
    icon: BarChart3,
    color: 'text-green-600',
  },
  {
    label: 'Predicted Revenue (30d)',
    value: '$847,320',
    change: '+12.4%',
    trend: 'up',
    icon: DollarSign,
    color: 'text-blue-600',
  },
  {
    label: 'Stock Optimization',
    value: '87.2%',
    change: '+5.3%',
    trend: 'up',
    icon: Package,
    color: 'text-violet-600',
  },
  {
    label: 'At-Risk SKUs',
    value: '23',
    change: '-8',
    trend: 'down',
    icon: AlertTriangle,
    color: 'text-amber-600',
  },
];

export function MetricsGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metrics.map((metric) => {
        const Icon = metric.icon;
        const isPositive = metric.trend === 'up';
        const TrendIcon = isPositive ? TrendingUp : TrendingDown;
        
        return (
          <Card key={metric.label} className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-slate-600 text-sm mb-1">{metric.label}</p>
                <p className="text-slate-900 text-2xl mb-2">{metric.value}</p>
                <div className="flex items-center gap-1">
                  <TrendIcon className={`w-4 h-4 ${isPositive ? 'text-green-600' : 'text-red-600'}`} />
                  <span className={`text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                    {metric.change}
                  </span>
                  <span className="text-slate-500 text-sm">vs last period</span>
                </div>
              </div>
              <div className={`p-3 rounded-lg bg-slate-50 ${metric.color}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
