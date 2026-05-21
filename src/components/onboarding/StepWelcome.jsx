import { Button } from '@/components/ui/button';
import { Sparkles, Target, Users } from 'lucide-react';

export default function StepWelcome({ organization, onNext }) {
  return (
    <div className="space-y-8">
      <div>
        <div className="w-12 h-12 rounded-2xl bg-accent flex items-center justify-center mb-5">
          <Sparkles className="w-6 h-6 text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">
          Bienvenue sur Parlios{organization?.name ? `, ${organization.name}` : ''} 👋
        </h1>
        <p className="text-muted-foreground mt-3 leading-relaxed">
          En quelques minutes, nous allons configurer votre espace de travail pour que l'IA de prospection puisse opérer efficacement.
        </p>
      </div>

      <div className="space-y-3">
        {[
          { icon: Target, title: 'Définir vos ICPs', desc: 'Profils clients idéaux pour cibler précisément' },
          { icon: Users, title: 'Configurer votre équipe', desc: 'Invitez vos commerciaux en quelques clics' },
          { icon: Sparkles, title: 'Activer l\'IA', desc: 'Prospection automatisée dès la Phase 2' },
        ].map(({ icon: Icon, title, desc }) => (
          <div key={title} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center flex-shrink-0">
              <Icon className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">{title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
            </div>
          </div>
        ))}
      </div>

      <Button className="w-full" size="lg" onClick={() => onNext()}>
        Commencer la configuration →
      </Button>
    </div>
  );
}