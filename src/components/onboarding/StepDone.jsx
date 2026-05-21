import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CheckCircle2, ArrowRight } from 'lucide-react';

export default function StepDone({ onboardingData }) {
  const navigate = useNavigate();

  const steps = [
    { label: 'Profil entreprise', done: !!onboardingData.company_profile },
    { label: 'Premier ICP', done: !!onboardingData.icp },
    { label: 'Équipe invitée', done: !!(onboardingData.invited?.length > 0) },
  ];

  return (
    <div className="space-y-8 text-center">
      <div>
        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-5">
          <CheckCircle2 className="w-8 h-8 text-emerald-600" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">Votre espace est prêt !</h2>
        <p className="text-muted-foreground text-sm mt-2">
          Vous pouvez maintenant accéder à votre dashboard et compléter la configuration à tout moment.
        </p>
      </div>

      <div className="text-left space-y-2 bg-muted/30 rounded-xl p-4">
        {steps.map(s => (
          <div key={s.label} className="flex items-center gap-3 text-sm">
            <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
              s.done ? 'bg-emerald-500 text-white' : 'bg-muted border border-border'
            }`}>
              {s.done && <CheckCircle2 className="w-3 h-3" />}
            </div>
            <span className={s.done ? 'text-foreground' : 'text-muted-foreground'}>{s.label}</span>
            {s.done ? (
              <span className="ml-auto text-xs text-emerald-600 font-medium">✓ Complété</span>
            ) : (
              <span className="ml-auto text-xs text-muted-foreground">À compléter</span>
            )}
          </div>
        ))}
      </div>

      <Button size="lg" className="w-full gap-2" onClick={() => navigate('/dashboard')}>
        Accéder au Dashboard <ArrowRight className="w-4 h-4" />
      </Button>
    </div>
  );
}