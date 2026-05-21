import { Link } from 'react-router-dom';
import { AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function OnboardingBanner({ state }) {
  if (!state) return null;
  if (state.completion_percentage === 100) return null;

  const steps = [
    {
      done: state.has_company_profile,
      label: 'Configurer le profil entreprise',
      path: '/company-profile',
    },
    {
      done: state.has_active_icp,
      label: 'Créer votre premier ICP',
      path: '/icps',
    },
    {
      done: state.has_team_member,
      label: 'Inviter un membre de l\'équipe',
      path: '/team',
    },
  ];

  const pending = steps.filter(s => !s.done);

  return (
    <div className="mx-6 mt-6 p-4 rounded-xl border border-primary/20 bg-accent/50">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-foreground mb-1">
            Complétez votre configuration ({state.completion_percentage}%)
          </p>
          <div className="flex flex-wrap gap-2 mt-2">
            {pending.map(step => (
              <Link
                key={step.path}
                to={step.path}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
              >
                <ArrowRight className="w-3 h-3" />
                {step.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="text-right text-xs text-muted-foreground">
          {[...steps].filter(s => s.done).length} / {steps.length}
        </div>
      </div>
    </div>
  );
}