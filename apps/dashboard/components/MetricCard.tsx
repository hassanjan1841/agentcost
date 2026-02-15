import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: string;
  icon?: LucideIcon;
  prefix?: string;
}

export function MetricCard({ title, value, change, icon: Icon, prefix }: MetricCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
         <CardTitle className="text-sm font-medium text-gray-700">{title}</CardTitle>
         {Icon && <Icon className="h-4 w-4 text-gray-400" />}
       </CardHeader>
       <CardContent>
         <div className="text-2xl font-bold text-gray-900">
           {prefix}{typeof value === 'number' ? value.toLocaleString() : value}
         </div>
         {change && (
           <p className="text-xs text-gray-500 mt-1">
             {change}
           </p>
         )}
      </CardContent>
    </Card>
  );
}
