'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ApiClient } from '@/lib/api-client';
import { ApiKeyManager } from '@/components/settings/ApiKeyManager';
import { ProviderKeyManager } from '@/components/settings/ProviderKeyManager';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';

interface Project {
  id: string;
  name: string;
}

export default function SettingsPage() {
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  const { data: projectsData, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: () => ApiClient.get<{ projects: Project[] }>('/api/projects'),
  });

  // Auto-select first project
  useEffect(() => {
    if (projectsData?.projects && projectsData.projects.length > 0 && !selectedProjectId) {
      setSelectedProjectId(projectsData.projects[0].id);
    }
  }, [projectsData, selectedProjectId]);

  if (isLoading) {
    return (
      <div className="space-y-6 p-4 md:p-8">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (!projectsData?.projects || projectsData.projects.length === 0) {
    return (
      <div className="p-4 md:p-8">
        <Card>
          <CardHeader>
            <CardTitle>No Projects Found</CardTitle>
            <CardDescription>You need to create a project before managing API keys.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-4 md:p-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">Manage your API keys and provider credentials.</p>
      </div>

      {/* Project Selector (if multiple) */}
      <div className="w-[300px]">
        <Label>Select Project</Label>
        <Select 
          value={selectedProjectId || ''} 
          onValueChange={setSelectedProjectId}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a project" />
          </SelectTrigger>
          <SelectContent>
            {projectsData.projects.map((p) => (
              <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedProjectId && (
        <div className="grid gap-8">
          {/* Phase 6: SDK Keys */}
          <ApiKeyManager projectId={selectedProjectId} />

          {/* Phase 6b: Provider Keys */}
          <ProviderKeyManager projectId={selectedProjectId} />
        </div>
      )}
    </div>
  );
}
