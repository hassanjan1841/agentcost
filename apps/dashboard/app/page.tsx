import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Zap, Shield, TrendingUp } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-6xl font-bold mb-6 text-gray-900">
            Stop Overspending on AI APIs
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Real-time cost tracking for OpenAI, Anthropic & Google. 
            Know what you're spending before the bill arrives.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/auth/register">
              <Button size="lg">
                Get Started Free
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button size="lg" variant="outline">
                Sign In
              </Button>
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-20">
          <Card>
            <CardHeader>
              <DollarSign className="h-8 w-8 mb-2" />
              <CardTitle>Real-time Tracking</CardTitle>
              <CardDescription>
                See costs as they happen, not at the end of the month
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Zap className="h-8 w-8 mb-2" />
              <CardTitle>Zero Code Changes</CardTitle>
              <CardDescription>
                Drop-in SDK wrapper. Your code stays the same.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Shield className="h-8 w-8 mb-2" />
              <CardTitle>Self-Hosted</CardTitle>
              <CardDescription>
                Your data stays with you. Deploy anywhere.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <TrendingUp className="h-8 w-8 mb-2" />
              <CardTitle>Budget Alerts</CardTitle>
              <CardDescription>
                Get notified before you overspend
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Code Example */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-900">
            Simple Integration
          </h2>
          <Card className="max-w-2xl mx-auto bg-gray-900">
            <CardContent className="p-6">
              <pre className="text-sm overflow-x-auto text-gray-100">
                <code>{`import { CostTracker } from '@agentcost/sdk';

const tracker = new CostTracker({
  projectId: 'your-project-id',
  apiKey: 'your-api-key',
});

const anthropic = tracker.anthropic(
  process.env.ANTHROPIC_API_KEY
);

// That's it! Costs tracked automatically ✅`}</code>
              </pre>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
