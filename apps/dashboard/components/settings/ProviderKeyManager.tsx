'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Save, Trash2, Key } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ProviderKey {
  id: string;
  provider: string;
  key_mask: string;
  updated_at: string;
}

const PROVIDERS = [
  { value: 'openai', label: 'OpenAI' },
  { value: 'anthropic', label: 'Anthropic' },
  { value: 'google', label: 'Google Gemini' },
];

const PROVIDER_PLACEHOLDERS: Record<string, string> = {
  openai: 'sk-proj-...',
  anthropic: 'sk-ant-api03-...',
  google: 'AIza...',
};

export function ProviderKeyManager({ projectId }: { projectId: string }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedProvider, setSelectedProvider] = useState<string>('openai');
  const [apiKey, setApiKey] = useState('');

  // Fetch Keys
  const { data: keys, isLoading } = useQuery({
    queryKey: ['provider-keys', projectId],
    queryFn: () => ApiClient.get<{ keys: ProviderKey[] }>(`/api/provider-keys?projectId=${projectId}`),
  });

  // Save Key Mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      await ApiClient.post('/api/provider-keys', {
        projectId,
        provider: selectedProvider,
        apiKey
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['provider-keys', projectId] });
      setApiKey('');
      toast({ title: 'Key Saved', description: 'Provider key updated successfully.' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to save provider key', variant: 'destructive' });
    }
  });

  // Delete Key Mutation
  const deleteMutation = useMutation({
    mutationFn: async (provider: string) => {
      await ApiClient.delete(`/api/provider-keys?projectId=${projectId}&provider=${provider}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['provider-keys', projectId] });
      toast({ title: 'Key Removed', description: 'Provider key removed.' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to remove provider key', variant: 'destructive' });
    }
  });

  const getProviderStatus = (providerValue: string) => {
    return keys?.keys?.find(k => k.provider === providerValue);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Provider Keys</CardTitle>
        <CardDescription>
          Securely store your API keys for OpenAI, Anthropic, etc. They are encrypted at rest.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Input Form */}
        <div className="grid gap-4 p-4 border rounded-lg bg-gray-50/50">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="space-y-2 md:col-span-1">
              <Label>Provider</Label>
              <Select value={selectedProvider} onValueChange={setSelectedProvider}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PROVIDERS.map(p => (
                    <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>API Key</Label>
              <Input 
                type="password" 
                placeholder={PROVIDER_PLACEHOLDERS[selectedProvider] || 'Enter API key'} 
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
            </div>
            <div className="md:col-span-1">
              <Button 
                className="w-full" 
                onClick={() => saveMutation.mutate()}
                disabled={saveMutation.isPending || !apiKey}
              >
                {saveMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save Key
              </Button>
            </div>
          </div>
        </div>

        {/* Existing Keys List */}
        <div className="space-y-4">
          <Label className="text-base">Configured Providers</Label>
          {isLoading ? (
            <div className="py-4 text-center text-sm text-muted-foreground">Loading...</div>
          ) : keys?.keys?.length === 0 ? (
            <div className="py-4 text-center text-sm text-muted-foreground border-dashed border rounded-lg">
              No providers configured yet.
            </div>
          ) : (
            <div className="grid gap-2">
              {keys?.keys?.map((key) => {
                const providerLabel = PROVIDERS.find(p => p.value === key.provider)?.label || key.provider;
                return (
                  <div key={key.id} className="flex items-center justify-between p-3 border rounded-lg bg-white">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 rounded-full">
                        <Key className="h-4 w-4 text-green-700" />
                      </div>
                      <div>
                        <p className="font-medium">{providerLabel}</p>
                        <p className="text-xs text-muted-foreground font-mono">{key.key_mask}</p>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-red-500 hover:text-red-700"
                      onClick={() => deleteMutation.mutate(key.provider)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </CardContent>
    </Card>
  );
}
