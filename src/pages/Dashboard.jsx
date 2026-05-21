import { useEffect } from 'react';
import { TrendingUp, Users, Target, Zap } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import OnboardingBanner from '@/components/ui/OnboardingBanner';
import ComingSoon from '@/components/ui/ComingSoon';
import PageHeader from '@/components/ui/PageHeader';
import { useOnboardingState } from '@/lib/useOnboardingState';
import { useCurrentUser } from '@/lib/useCurrentUser';

function StatCard({ icon: StatIcon, label, description }) {
  return (
    <div className="bg-card border border-border rounded-xl p-5 flex flex-col gap-3">
      <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
        <StatIcon className="w-4 h-4 text-primary" />
      </div>
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>
      <div className="mt-auto pt-2 border-t border-border">
        <span className="text-[11px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded">
          Phase 2
        </span>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { userRecord } = useCurrentUser();
  const { state, refresh } = useOnboardingState();

  useEffect(() => {
    refresh();
  }, [refresh]);

  const isSuperAdmin = userRecord?.role === 'super_admin';

  return (
    <AppLayout>
      <div className="min-h-full">
        <PageHeader
          title="Dashboard"
          description={isSuperAdmin ? 'Vue plateforme Parlios' : 'Aperçu de votre activité de prospection'}
        />

        {!isSuperAdmin && <OnboardingBanner state={state} />}

        <div className="px-8 py-6">
          {isSuperAdmin ? (
            <div className="bg-accent/40 border border-primary/20 rounded-xl p-6 max-w-lg">
              <p className="text-sm font-medium text-foreground mb-1">Mode Super Admin</p>
              <p className="text-sm text-muted-foreground">
                Accédez au panneau d'administration pour gérer les organisations et les invitations.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard icon={TrendingUp} label="Campagnes actives" description="Vos campagnes en cours" />
              <StatCard icon={Users} label="Prospects qualifiés" description="Dans votre pipeline" />
              <StatCard icon={Target} label="Taux de réponse" description="Sur les 30 derniers jours" />
              <StatCard icon={Zap} label="Score IA moyen" description="Qualité des leads enrichis" />
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}