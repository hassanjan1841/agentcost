'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, FolderPlus } from 'lucide-react';
import { ApiClient } from '@/lib/api-client';

interface CreateProjectStepProps {
  onNext: (projectId: string, projectName: string) => void;
  onBack: () => void;
}

export function CreateProjectStep({ onNext, onBack }: CreateProjectStepProps) {
  const [projectName, setProjectName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async () => {
    if (!projectName.trim()) {
      setError('Project name is required');
      return;
    }

    if (projectName.length > 50) {
      setError('Project name must be 50 characters or less');
      return;
    }

    setIsCreating(true);
    setError('');

    try {
      const response = await ApiClient.post<{ project: { id: string; name: string } }>(
        '/api/projects',
        { name: projectName }
      );
      
      onNext(response.project.id, response.project.name);
    } catch (err) {
      setError('Failed to create project. Please try again.');
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-6 py-4">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-blue-100 rounded-lg">
          <FolderPlus className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h3 className="text-xl font-semibold">Create Your First Project</h3>
          <p className="text-sm text-muted-foreground">
            Projects help you organize different applications or environments.
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="project-name">Project Name</Label>
        <Input
          id="project-name"
          placeholder="e.g., My AI App, Production, Staging"
          value={projectName}
          onChange={(e) => {
            setProjectName(e.target.value);
            setError('');
          }}
          onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
          maxLength={50}
          disabled={isCreating}
          autoFocus
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
        <p className="text-xs text-muted-foreground">
          {projectName.length}/50 characters
        </p>
      </div>

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack} disabled={isCreating}>
          Back
        </Button>
        <Button onClick={handleCreate} disabled={isCreating || !projectName.trim()}>
          {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Create Project
        </Button>
      </div>
    </div>
  );
}
