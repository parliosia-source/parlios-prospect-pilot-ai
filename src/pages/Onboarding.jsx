import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useCurrentUser } from '@/lib/useCurrentUser';
import StepWelcome from '@/components/onboarding/StepWelcome';
import StepCompanyProfile from '@/components/onboarding/StepCompanyProfile';
import StepFirstICP from '@/components/onboarding/StepFirstICP';
import StepInviteTeam from '@/components/onboarding/StepInviteTeam';
import StepDone from '@/components/onboarding/StepDone';

const STEPS = ['welcome', 'company-profile', 'first-icp', 'invite-team', 'done'];

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { authUser, userRecord, organization, loading } = useCurrentUser();
  const [step, setStep] = useState(0);
  const [onboardingData, setOnboardingData] = useState({});

  useEffect(() => {
    if (loading) return;
    if (!authUser) { navigate('/login'); return; }
    // If no organization and not super_admin → redirect dashboard
    if (userRecord && !userRecord.organization_id && userRecord.role !== 'super_admin') {
      navigate('/dashboard');
    }
  }, [authUser, userRecord, loading, navigate]);

  function next(data) {
    if (data) setOnboardingData(d => ({ ...d, ...data }));
    setStep(s => Math.min(s + 1, STEPS.length - 1));
  }

  function stepProps() {
    return { organization, userRecord, onNext: next, onboardingData };
  }

  if (loading) return (
    <div className="fixed inset-0 flex items-center justify-center bg-background">
      <div className="w-8 h-8 border-2 border-muted border-t-primary rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left brand panel */}
      <div className="hidden lg:flex w-80 bg-sidebar flex-col justify-between p-8">
        <div>
          <div className="flex items-center gap-2 mb-12">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-white font-bold text-sm">P</span>
            </div>
            <span className="text-white font-semibold">Parlios</span>
          </div>
          <div className="space-y-2">
            {['Bienvenue', 'Profil entreprise', 'Premier ICP', 'Équipe', 'Terminé'].map((label, i) => (
              <div key={i} className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
                i === step ? 'bg-primary text-white font-medium' :
                i < step ? 'text-sidebar-foreground/60' : 'text-sidebar-foreground/30'
              }`}>
                <div className={`w-5 h-5 rounded-full border flex items-center justify-center text-xs ${
                  i === step ? 'border-white bg-white text-primary font-bold' :
                  i < step ? 'border-primary bg-primary text-white' : 'border-sidebar-foreground/20'
                }`}>
                  {i < step ? '✓' : i + 1}
                </div>
                {label}
              </div>
            ))}
          </div>
        </div>
        <p className="text-sidebar-foreground/30 text-xs">Parlios Prospect Pilot AI</p>
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-lg">
          {step === 0 && <StepWelcome {...stepProps()} />}
          {step === 1 && <StepCompanyProfile {...stepProps()} />}
          {step === 2 && <StepFirstICP {...stepProps()} />}
          {step === 3 && <StepInviteTeam {...stepProps()} />}
          {step === 4 && <StepDone {...stepProps()} />}
        </div>
      </div>
    </div>
  );
}