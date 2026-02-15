'use client';

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface TimelineData {
  date: string;
  cost: number;
  requests: number;
}

interface CostChartProps {
  data: TimelineData[];
}

export function CostChart({ data }: CostChartProps) {
   // Format data for chart
   const chartData = data.map(item => ({
     date: new Date(item.date).toLocaleDateString('en-US', { 
       month: 'short', 
       day: 'numeric' 
     }),
     cost: parseFloat(item.cost.toFixed(4)),
   }));
 
   return (
     <Card>
       <CardHeader>
         <CardTitle>Cost Over Time</CardTitle>
       </CardHeader>
       <CardContent>
         <ResponsiveContainer width="100%" height={300}>
           <LineChart data={chartData}>
             <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
             <XAxis dataKey="date" stroke="#666" />
             <YAxis stroke="#666" />
             <Tooltip 
               formatter={(value: number) => `$${value.toFixed(4)}`}
               contentStyle={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb' }}
             />
             <Line 
               type="monotone" 
               dataKey="cost" 
               stroke="#2563eb" 
               strokeWidth={3}
               dot={{ fill: '#2563eb', r: 4 }}
               activeDot={{ r: 6 }}
             />
           </LineChart>
         </ResponsiveContainer>
       </CardContent>
     </Card>
   );
 }
