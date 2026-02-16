'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Code, Copy, Check, ExternalLink } from 'lucide-react';

interface InstallSDKStepProps {
  onComplete: () => void;
  onBack: () => void;
}

export function InstallSDKStep({ onComplete, onBack }: InstallSDKStepProps) {
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const installCommands = {
    npm: 'npm install @agentcost/sdk',
    yarn: 'yarn add @agentcost/sdk',
    pnpm: 'pnpm add @agentcost/sdk',
  };

  const usageExample = `import { AgentCost } from '@agentcost/sdk';

const agentcost = new AgentCost({
  apiKey: 'your-api-key-here'
});

// Track an AI request
await agentcost.track({
  model: 'gpt-4',
  provider: 'openai',
  inputTokens: 150,
  outputTokens: 50,
  cost: 0.0045
});`;

  return (
    <div className="space-y-6 py-4">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-purple-100 rounded-lg">
          <Code className="h-6 w-6 text-purple-600" />
        </div>
        <div>
          <h3 className="text-xl font-semibold">Install the SDK</h3>
          <p className="text-sm text-muted-foreground">
            Add AgentCost to your project and start tracking costs.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-sm font-medium mb-2">1. Install the package</p>
          <Tabs defaultValue="npm" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="npm">npm</TabsTrigger>
              <TabsTrigger value="yarn">yarn</TabsTrigger>
              <TabsTrigger value="pnpm">pnpm</TabsTrigger>
            </TabsList>
            {Object.entries(installCommands).map(([key, cmd]) => (
              <TabsContent key={key} value={key}>
                <div className="relative">
                  <div className="bg-zinc-950 rounded-lg p-4 pr-12 font-mono text-sm text-white">
                    {cmd}
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="absolute top-2 right-2 text-white hover:text-white/80 hover:bg-white/10"
                    onClick={() => handleCopy(cmd, `install-${key}`)}
                  >
                    {copied === `install-${key}` ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>

        <div>
          <p className="text-sm font-medium mb-2">2. Basic usage</p>
          <div className="relative">
            <pre className="bg-zinc-950 rounded-lg p-4 pr-12 text-sm text-white overflow-x-auto">
              <code>{usageExample}</code>
            </pre>
            <Button
              size="icon"
              variant="ghost"
              className="absolute top-2 right-2 text-white hover:text-white/80 hover:bg-white/10"
              onClick={() => handleCopy(usageExample, 'usage')}
            >
              {copied === 'usage' ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
          <div className="flex items-start gap-2">
            <ExternalLink className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <div>
              <strong>Need more help?</strong> Check out our{' '}
              <a href="#" className="underline font-medium">
                full documentation
              </a>{' '}
              for advanced features and examples.
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={onComplete} className="bg-gradient-to-r from-blue-600 to-purple-600">
          Go to Dashboard
        </Button>
      </div>
    </div>
  );
}
