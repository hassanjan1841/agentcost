'use client';

import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';

interface WelcomeStepProps {
  onNext: () => void;
}

export function WelcomeStep({ onNext }: WelcomeStepProps) {
  return (
    <div className="flex flex-col items-center text-center space-y-6 py-8">
      <div className="p-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full">
        <Sparkles className="h-12 w-12 text-white" />
      </div>
      
      <div className="space-y-2">
        <h2 className="text-3xl font-bold">Welcome to AgentCost! 🎉</h2>
        <p className="text-muted-foreground text-lg max-w-md">
          Track and optimize your AI costs in minutes. Let's get you set up in 3 easy steps.
        </p>
      </div>

      <div className="flex gap-2 text-sm text-muted-foreground">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-blue-500 rounded-full" />
          <span>Create Project</span>
        </div>
        <span>→</span>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-blue-500 rounded-full" />
          <span>Get API Key</span>
        </div>
        <span>→</span>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-blue-500 rounded-full" />
          <span>Install SDK</span>
        </div>
      </div>

      <Button size="lg" onClick={onNext} className="mt-4">
        Get Started
      </Button>
    </div>
  );
}
