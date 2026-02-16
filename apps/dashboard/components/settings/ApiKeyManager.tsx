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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Plus, Trash2, Copy, Check } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { formatDistanceToNow } from 'date-fns';

interface ApiKey {
  id: string;
  name: string;
  key_mask: string;
  created_at: string;
  last_used_at: string | null;
  is_active: boolean;
}

export function ApiKeyManager({ projectId }: { projectId: string }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [createdKey, setCreatedKey] = useState<string | null>(null);

  // Fetch Keys
  const { data: keys, isLoading } = useQuery({
    queryKey: ['api-keys', projectId],
    queryFn: () => ApiClient.get<{ keys: ApiKey[] }>(`/api/keys?projectId=${projectId}`),
  });

  // Create Key Mutation
  const createMutation = useMutation({
    mutationFn: async (name: string) => {
      const res = await ApiClient.post<{ apiKey: ApiKey & { secret: string } }>(
        '/api/keys', 
        { projectId, name }
      );
      return res.apiKey;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['api-keys', projectId] });
      setCreatedKey(data.secret);
      toast({ title: 'API Key Created', description: 'Copy it now. You won\'t see it again.' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to create API key', variant: 'destructive' });
    }
  });

  // Revoke Key Mutation
  const revokeMutation = useMutation({
    mutationFn: async (id: string) => {
      await ApiClient.delete(`/api/keys?id=${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-keys', projectId] });
      toast({ title: 'API Key Revoked', description: 'The key is no longer active.' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to revoke API key', variant: 'destructive' });
    }
  });

  const handleCreate = () => {
    createMutation.mutate(newKeyName);
  };

  const handleClose = () => {
    setIsCreateOpen(false);
    setCreatedKey(null);
    setNewKeyName('');
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>SDK API Keys</CardTitle>
            <CardDescription>Manage API keys for accessing the SDK.</CardDescription>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Create New Key
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create API Key</DialogTitle>
                <DialogDescription>
                  Enter a name for this key to identify it later.
                </DialogDescription>
              </DialogHeader>
              
              {!createdKey ? (
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Name</Label>
                    <Input 
                      id="name" 
                      placeholder="e.g. Production Server" 
                      value={newKeyName}
                      onChange={(e) => setNewKeyName(e.target.value)}
                    />
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                    <Button onClick={handleCreate} disabled={createMutation.isPending || !newKeyName}>
                      {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Create
                    </Button>
                  </DialogFooter>
                </div>
              ) : (
                <div className="space-y-4 py-4">
                  <div className="rounded-md bg-zinc-950 p-4">
                    <div className="flex items-center justify-between">
                      <code className="text-sm text-white break-all">{createdKey}</code>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-white hover:text-white/80"
                        onClick={() => {
                          navigator.clipboard.writeText(createdKey);
                          toast({ title: 'Copied to clipboard' });
                        }}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground bg-yellow-50 p-3 rounded-md border border-yellow-200 text-yellow-800">
                    <strong>Important:</strong> Copy this key now. We cannot show it to you again.
                  </div>
                  <DialogFooter>
                    <Button onClick={handleClose}>Done</Button>
                  </DialogFooter>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center p-4">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Key Mask</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Last Used</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {keys?.keys?.map((key) => (
                <TableRow key={key.id}>
                  <TableCell className="font-medium">{key.name}</TableCell>
                  <TableCell className="font-mono text-xs">{key.key_mask}</TableCell>
                  <TableCell>{formatDistanceToNow(new Date(key.created_at))} ago</TableCell>
                  <TableCell>
                    {key.last_used_at 
                      ? formatDistanceToNow(new Date(key.last_used_at)) + ' ago' 
                      : 'Never'}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
                      onClick={() => revokeMutation.mutate(key.id)}
                      disabled={revokeMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {keys?.keys?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground h-24">
                    No API keys found. Create one to get started.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
