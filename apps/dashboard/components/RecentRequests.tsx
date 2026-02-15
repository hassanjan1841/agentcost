'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Request {
  id: string;
  provider: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  cost: number;
  duration: number;
  createdAt: Date | string;
}

interface RecentRequestsProps {
  data: Request[];
}

export function RecentRequests({ data }: RecentRequestsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Requests</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Time</TableHead>
              <TableHead>Provider</TableHead>
              <TableHead>Model</TableHead>
              <TableHead className="text-right">Tokens</TableHead>
              <TableHead className="text-right">Cost</TableHead>
              <TableHead className="text-right">Duration</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-gray-500">
                  No requests yet. Start using the SDK to see data here!
                </TableCell>
              </TableRow>
            ) : (
              data.map((request) => {
                const createdDate = new Date(request.createdAt);
                return (
                  <TableRow key={request.id}>
                    <TableCell className="font-mono text-xs text-gray-700">
                      {createdDate.toLocaleTimeString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {request.provider}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-gray-700">
                      {request.model}
                    </TableCell>
                    <TableCell className="text-right text-xs text-gray-700">
                      {request.inputTokens.toLocaleString()} + {request.outputTokens.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right font-semibold text-gray-900">
                      ${request.cost.toFixed(6)}
                    </TableCell>
                    <TableCell className="text-right text-xs text-gray-600">
                       {request.duration}ms
                     </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
