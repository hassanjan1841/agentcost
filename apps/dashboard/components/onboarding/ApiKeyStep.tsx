'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Key, Copy, Check } from 'lucide-react';
import { ApiClient } from '@/lib/api-client';

interface ApiKeyStepProps {
  projectId: string;
  projectName: string;
  onNext: () => void;
  onBack: () => void;
}

export function ApiKeyStep({ projectId, projectName, onNext, onBack }: ApiKeyStepProps) {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(true);
  const [copied, setCopied] = useState(false);
  const [canProceed, setCanProceed] = useState(false);

  useEffect(() => {
    generateKey();
  }, []);

  const generateKey = async () => {
    setIsGenerating(true);
    try {
      const response = await ApiClient.post<{ apiKey: { secret: string } }>(
        '/api/keys',
        { projectId, name: 'Default Key' }
      );
      setApiKey(response.apiKey.secret);
      
      // Enable "Next" after 3 seconds or after copy
      setTimeout(() => setCanProceed(true), 3000);
    } catch (err) {
      console.error('Failed to generate API key:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (apiKey) {
      navigator.clipboard.writeText(apiKey);
      setCopied(true);
      setCanProceed(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6 py-4">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-green-100 rounded-lg">
          <Key className="h-6 w-6 text-green-600" />
        </div>
        <div>
          <h3 className="text-xl font-semibold">Your API Key</h3>
          <p className="text-sm text-muted-foreground">
            Use this key to authenticate SDK requests for <strong>{projectName}</strong>.
          </p>
        </div>
      </div>

      {isGenerating ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          <div className="space-y-3">
            <div className="relative">
              <div className="bg-zinc-950 rounded-lg p-4 pr-12 font-mono text-sm text-white break-all">
                {apiKey}
              </div>
              <Button
                size="icon"
                variant="ghost"
                className="absolute top-2 right-2 text-white hover:text-white/80 hover:bg-white/10"
                onClick={handleCopy}
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
              <strong>⚠️ Important:</strong> Copy this key now. We cannot show it to you again for security reasons.
            </div>
          </div>
        </>
      )}

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack} disabled={isGenerating}>
          Back
        </Button>
        <Button onClick={onNext} disabled={!canProceed}>
          Next
        </Button>
      </div>
    </div>
  );
}
