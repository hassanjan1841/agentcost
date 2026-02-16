'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth-context';
import { Loader2, LayoutDashboard } from 'lucide-react';

export function AuthButtons() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex gap-4 justify-center">
        <Button size="lg" disabled className="w-32">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Loading
        </Button>
      </div>
    );
  }

  if (user) {
    return (
      <div className="flex gap-4 justify-center">
        <Link href="/dashboard">
          <Button size="lg" className="flex items-center gap-2">
            <LayoutDashboard className="h-4 w-4" />
            Go to Dashboard
          </Button>
        </Link>
      </div>
    );
  }

  return (
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
  );
}
