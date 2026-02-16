'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { UserDropdown } from '@/components/dashboard/UserDropdown';
import { MobileSidebar } from '@/components/dashboard/MobileSidebar';
import { OnboardingWizard } from '@/components/onboarding/OnboardingWizard';
import { ApiClient } from '@/lib/api-client';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(() => new QueryClient());
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      const response = await ApiClient.get<{ completed: boolean }>('/api/onboarding/status');
      setShowOnboarding(!response.completed);
    } catch (err) {
      console.error('Failed to check onboarding status:', err);
    } finally {
      setIsChecking(false);
    }
  };

  if (isChecking) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <OnboardingWizard open={showOnboarding} />
      <div className="flex h-screen w-full overflow-hidden bg-white">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <header className="flex h-14 items-center justify-between border-b bg-white px-4 md:px-6">
            <div className="flex items-center gap-4">
              <MobileSidebar />
              <h2 className="text-lg font-semibold">Overview</h2>
            </div>
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
