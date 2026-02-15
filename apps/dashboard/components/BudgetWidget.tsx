'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, Plus, Trash2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function BudgetWidget() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    limitAmount: '',
    period: 'monthly',
    alertThreshold: '0.8',
    email: '',
  });

  const { data: budgets } = useQuery({
    queryKey: ['budgets'],
    queryFn: async () => {
      const res = await fetch('/api/budgets');
      return res.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch('/api/budgets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      setShowForm(false);
      setFormData({ limitAmount: '', period: 'monthly', alertThreshold: '0.8', email: '' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/budgets?id=${id}`, {
        method: 'DELETE',
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    createMutation.mutate({
      limitAmount: parseFloat(formData.limitAmount),
      period: formData.period,
      alertThreshold: parseFloat(formData.alertThreshold),
      email: formData.email || null,
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Budget Alerts</CardTitle>
            <CardDescription>
              Get notified when you approach spending limits
            </CardDescription>
          </div>
          <Button size="sm" onClick={() => setShowForm(!showForm)}>
            <Plus className="h-4 w-4 mr-1" />
            Add Budget
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {showForm && (
          <form onSubmit={handleSubmit} className="space-y-4 mb-6 p-4 border rounded-lg">
            <div>
              <Label htmlFor="limit">Limit Amount ($)</Label>
              <Input
                id="limit"
                type="number"
                step="0.01"
                value={formData.limitAmount}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, limitAmount: e.target.value })}
                placeholder="100.00"
                required
              />
            </div>

            <div>
              <Label htmlFor="period">Period</Label>
              <Select value={formData.period} onValueChange={(v) => setFormData({ ...formData, period: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="threshold">Alert Threshold (%)</Label>
              <Input
                id="threshold"
                type="number"
                step="0.01"
                min="0"
                max="1"
                value={formData.alertThreshold}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, alertThreshold: e.target.value })}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Alert when {(parseFloat(formData.alertThreshold) * 100).toFixed(0)}% of budget is used
              </p>
            </div>

            <div>
              <Label htmlFor="email">Email (optional)</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, email: e.target.value })}
                placeholder="you@example.com"
              />
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Creating...' : 'Create Budget'}
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </form>
        )}

        {budgets?.budgets.length === 0 && !showForm && (
          <div className="text-center py-8 text-muted-foreground">
            <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No budgets set up yet</p>
            <p className="text-sm">Click "Add Budget" to create one</p>
          </div>
        )}

        <div className="space-y-3">
          {budgets?.budgets.map((budget: any) => (
            <div key={budget.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-semibold">${budget.limitAmount} / {budget.period}</p>
                <p className="text-sm text-muted-foreground">
                  Alert at {(budget.alertThreshold * 100).toFixed(0)}%
                  {budget.email && ` • ${budget.email}`}
                </p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => deleteMutation.mutate(budget.id)}
                disabled={deleteMutation.isPending}
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
