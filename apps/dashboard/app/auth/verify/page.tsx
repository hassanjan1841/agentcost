'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';

function VerifyContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(
    token ? 'loading' : 'error'
  );
  const [message, setMessage] = useState(
    token ? 'Verifying your email...' : 'Invalid or expired verification link'
  );

  useEffect(() => {
    if (!token) return;

    async function verify() {
      try {
        const res = await fetch('/api/auth/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });

        const data = await res.json();

        if (!res.ok) {
          setStatus('error');
          setMessage(data.error || 'Invalid or expired verification link');
          toast({ title: 'Verification failed', description: data.error || 'Invalid or expired verification link', variant: 'destructive' });
          return;
        }

        setStatus('success');
        setMessage(data.message || 'Email verified successfully!');
        toast({ title: 'Email verified!', description: data.message || 'Email verified successfully!' });
      } catch {
        setStatus('error');
        setMessage('Invalid or expired verification link');
        toast({ title: 'Verification failed', description: 'Invalid or expired verification link', variant: 'destructive' });
      }
    }

    verify();
  }, [token]);

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Email Verification</CardTitle>
      </CardHeader>
      <CardContent>
        <p
          className={`text-sm ${
            status === 'success'
              ? 'text-green-600'
              : status === 'error'
                ? 'text-red-600'
                : 'text-gray-500'
          }`}
        >
          {message}
        </p>
      </CardContent>
      {status !== 'loading' && (
        <CardFooter>
          <Link
            href="/auth/login"
            className="text-sm text-gray-500 hover:text-gray-900"
          >
            Back to sign in
          </Link>
        </CardFooter>
      )}
    </Card>
  );
}

export default function VerifyPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <Suspense>
        <VerifyContent />
      </Suspense>
    </div>
  );
}
