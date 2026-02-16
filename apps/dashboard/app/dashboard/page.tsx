'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { MetricCard } from '@/components/MetricCard';
import { CostChart } from '@/components/CostChart';
import { ProviderBreakdown } from '@/components/ProviderBreakdown';
import { RecentRequests } from '@/components/RecentRequests';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DollarSign, Zap, TrendingUp, Activity, LogOut } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState, useEffect } from 'react';

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading, logout } = useAuth();
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('7d');
  const [projectId, setProjectId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/auth/login');
    }
  }, [user, authLoading, router]);

  // Fetch user's first project
  const { data: projectsData, error: projectsError } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const res = await fetch('/api/projects', {
        credentials: 'include',
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to fetch projects: ${res.status}`);
      }
      return res.json();
    },
    enabled: !!user,
    retry: 2,
  });

  useEffect(() => {
    if (projectsData?.projects && projectsData.projects.length > 0) {
      setProjectId(projectsData.projects[0].id);
    }
  }, [projectsData]);

  const { data, isLoading, error } = useQuery({
    queryKey: ['metrics', timeRange, projectId],
    queryFn: async () => {
      const res = await fetch(`/api/costs?range=${timeRange}&projectId=${projectId}`, {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to fetch');
      return res.json();
    },
    refetchInterval: 5000, // Refresh every 5 seconds
    enabled: !!projectId,
  });

  if (authLoading || !user) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Activity className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-600" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (projectsError || error || !data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 font-semibold">Failed to load dashboard</p>
          <p className="text-sm text-gray-600 mt-2">
            {projectsError?.message || error?.message || 'No project data available'}
          </p>
          <p className="text-xs text-gray-500 mt-4">ProjectID: {projectId || 'Not set'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Removed - managed by Layout */}

        {/* Key Metrics */}
        <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold tracking-tight">Dashboard Overview</h2>
             <div className="flex items-center space-x-2">
                <Select value={timeRange} onValueChange={(v: any) => setTimeRange(v)}>
                <SelectTrigger className="w-32">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="24h">Last 24h</SelectItem>
                    <SelectItem value="7d">Last 7 days</SelectItem>
                    <SelectItem value="30d">Last 30 days</SelectItem>
                </SelectContent>
                </Select>
            </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Total Spent"
            value={data.totalCost.toFixed(4)}
            prefix="$"
            icon={DollarSign}
          />
          <MetricCard
            title="Total Requests"
            value={data.totalRequests}
            icon={Zap}
          />
          <MetricCard
            title="Avg Cost/Request"
            value={data.avgCostPerRequest.toFixed(6)}
            prefix="$"
            icon={TrendingUp}
          />
          <MetricCard
            title="Most Used Model"
            value={data.mostUsedModel}
            icon={Activity}
          />
        </div>

        {/* Chart */}
        <CostChart data={data.timeline} />

        {/* Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ProviderBreakdown data={data.costByProvider} />
          
          <Card>
            <CardHeader>
              <CardTitle>Cost by Model</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.costByModel.slice(0, 5).map((item: any) => (
                  <div key={item.model} className="flex items-center justify-between">
                    <span className="font-mono text-sm text-gray-700">{item.model}</span>
                    <span className="font-semibold text-gray-900">${item.cost.toFixed(4)}</span>
                  </div>
                ))}
                {data.costByModel.length === 0 && (
                  <p className="text-sm text-gray-600">No data yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Requests */}
        <RecentRequests data={data.recentRequests} />
      </div>
    </div>
  );
}
