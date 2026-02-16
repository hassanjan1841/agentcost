'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

import { Sidebar } from '@/components/dashboard/Sidebar';
import { UserDropdown } from '@/components/dashboard/UserDropdown';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex h-screen w-full overflow-hidden bg-white">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <header className="flex h-14 items-center justify-between border-b bg-white px-6">
            <h2 className="text-lg font-semibold">Overview</h2>
            <div className="flex items-center gap-4">
              <UserDropdown />
            </div>
          </header>
          <main className="flex-1 overflow-auto p-6">
            {children}
          </main>
        </div>
      </div>
    </QueryClientProvider>
  );
}
