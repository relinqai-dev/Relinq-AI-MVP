import { Card } from './ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const data = [
  { category: 'Electronics', current: 145000, predicted: 162000, accuracy: 96 },
  { category: 'Apparel', current: 98000, predicted: 112000, accuracy: 94 },
  { category: 'Home & Garden', current: 76000, predicted: 81000, accuracy: 92 },
  { category: 'Sports', current: 54000, predicted: 63000, accuracy: 95 },
  { category: 'Beauty', current: 43000, predicted: 47000, accuracy: 97 },
];

export function CategoryPerformance() {
  return (
    <Card className="p-6">
      <div className="mb-6">
        <h3 className="text-slate-900 mb-1">Category Performance</h3>
        <p className="text-slate-600 text-sm">Current vs predicted demand by category</p>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="category" stroke="#64748b" fontSize={12} />
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
          <Bar dataKey="current" fill="#3b82f6" name="Current Sales" radius={[4, 4, 0, 0]} />
          <Bar dataKey="predicted" fill="#8b5cf6" name="Predicted (30d)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}
