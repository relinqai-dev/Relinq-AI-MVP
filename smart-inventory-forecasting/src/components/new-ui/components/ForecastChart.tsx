import { Card } from './ui/card';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const data = [
  { date: 'Jan 1', actual: 24500, predicted: 24200, historical: 21000 },
  { date: 'Jan 8', actual: 26300, predicted: 26100, historical: 22500 },
  { date: 'Jan 15', actual: 25800, predicted: 26400, historical: 23800 },
  { date: 'Jan 22', actual: 28100, predicted: 27900, historical: 25200 },
  { date: 'Jan 29', actual: 29400, predicted: 29700, historical: 26800 },
  { date: 'Feb 5', actual: 27800, predicted: 28200, historical: 24900 },
  { date: 'Feb 12', actual: null, predicted: 30500, historical: 27300 },
  { date: 'Feb 19', actual: null, predicted: 32100, historical: 28500 },
  { date: 'Feb 26', actual: null, predicted: 31800, historical: 29200 },
  { date: 'Mar 5', actual: null, predicted: 33400, historical: 30100 },
];

export function ForecastChart() {
  return (
    <Card className="p-6">
      <div className="mb-6">
        <h3 className="text-slate-900 mb-1">Demand Forecast</h3>
        <p className="text-slate-600 text-sm">Predicted vs actual sales with historical baseline</p>
      </div>
      
      <ResponsiveContainer width="100%" height={350}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.1}/>
              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
          <YAxis stroke="#64748b" fontSize={12} />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'white', 
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: '14px'
            }}
          />
          <Legend />
          <Area 
            type="monotone" 
            dataKey="historical" 
            stroke="#94a3b8" 
            fill="none"
            strokeDasharray="5 5"
            name="Historical Avg"
          />
          <Area 
            type="monotone" 
            dataKey="predicted" 
            stroke="#8b5cf6" 
            fill="url(#colorPredicted)"
            strokeWidth={2}
            name="AI Prediction"
          />
          <Area 
            type="monotone" 
            dataKey="actual" 
            stroke="#3b82f6" 
            fill="url(#colorActual)"
            strokeWidth={2}
            name="Actual Sales"
          />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  );
}