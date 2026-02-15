'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ProviderData {
  provider: string;
  cost: number;
  requests: number;
}

interface ProviderBreakdownProps {
  data: ProviderData[];
}

const providerColors: Record<string, string> = {
  anthropic: 'bg-purple-500',
  openai: 'bg-green-500',
  google: 'bg-blue-500',
};

export function ProviderBreakdown({ data }: ProviderBreakdownProps) {
  const total = data.reduce((sum, item) => sum + item.cost, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cost by Provider</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.map((item) => {
            const percentage = total > 0 ? (item.cost / total) * 100 : 0;
            
            return (
              <div key={item.provider} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                     <Badge variant="outline" className="capitalize">
                       {item.provider}
                     </Badge>
                     <span className="text-sm text-gray-500">
                       {item.requests} requests
                     </span>
                   </div>
                  <span className="font-semibold">
                    ${item.cost.toFixed(4)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      providerColors[item.provider as keyof typeof providerColors] || 'bg-gray-400'
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
