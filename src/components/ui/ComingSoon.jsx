import { Sparkles } from 'lucide-react';

export default function ComingSoon({ feature = 'Cette fonctionnalité', phase = 2 }) {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-80 text-center px-6">
      <div className="w-12 h-12 rounded-2xl bg-accent flex items-center justify-center mb-4">
        <Sparkles className="w-6 h-6 text-primary" />
      </div>
      <h3 className="text-base font-semibold text-foreground mb-2">{feature}</h3>
      <p className="text-sm text-muted-foreground max-w-xs">
        Disponible en Phase {phase}. Nous y travaillons activement.
      </p>
      <div className="mt-4 px-3 py-1.5 rounded-full bg-accent text-accent-foreground text-xs font-medium">
        Coming in Phase {phase}
      </div>
    </div>
  );
}