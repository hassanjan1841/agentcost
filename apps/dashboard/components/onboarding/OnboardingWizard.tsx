'use client';

import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { WelcomeStep } from './WelcomeStep';
import { CreateProjectStep } from './CreateProjectStep';
import { ApiKeyStep } from './ApiKeyStep';
import { InstallSDKStep } from './InstallSDKStep';
import { ApiClient } from '@/lib/api-client';
import { useRouter } from 'next/navigation';

interface OnboardingWizardProps {
  open: boolean;
}

export function OnboardingWizard({ open }: OnboardingWizardProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [projectId, setProjectId] = useState('');
  const [projectName, setProjectName] = useState('');

  const handleProjectCreated = (id: string, name: string) => {
    setProjectId(id);
    setProjectName(name);
    setCurrentStep(2);
  };

  const handleComplete = async () => {
    try {
      await ApiClient.post('/api/onboarding/complete', {});
      router.refresh();
    } catch (err) {
      console.error('Failed to complete onboarding:', err);
      router.refresh();
    }
  };

  const steps = [
    <WelcomeStep key="welcome" onNext={() => setCurrentStep(1)} />,
    <CreateProjectStep
      key="create-project"
      onNext={handleProjectCreated}
      onBack={() => setCurrentStep(0)}
    />,
    <ApiKeyStep
      key="api-key"
      projectId={projectId}
      projectName={projectName}
      onNext={() => setCurrentStep(3)}
      onBack={() => setCurrentStep(1)}
    />,
    <InstallSDKStep
      key="install-sdk"
      onComplete={handleComplete}
      onBack={() => setCurrentStep(2)}
    />,
  ];

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent 
        className="max-w-2xl" 
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        {/* Progress Indicator */}
        {currentStep > 0 && (
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
              <span>Step {currentStep} of 3</span>
              <span>{Math.round((currentStep / 3) * 100)}% Complete</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / 3) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Current Step */}
        {steps[currentStep]}
      </DialogContent>
    </Dialog>
  );
}
