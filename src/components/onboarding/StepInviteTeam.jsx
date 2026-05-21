import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { UserPlus, CheckCircle, Info } from 'lucide-react';
import { toast } from 'sonner';

export default function StepInviteTeam({ onNext }) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('sales_user');
  const [invited, setInvited] = useState([]);
  const [sending, setSending] = useState(false);

  async function handleInvite() {
    if (!email.trim()) { toast.error('Email requis.'); return; }
    setSending(true);
    const res = await base44.functions.invoke('inviteTeamMember', { email, role });
    if (res.data.error) {
      toast.error(res.data.error);
    } else {
      setInvited(prev => [...prev, { email, role }]);
      toast.success(`Invitation envoyée à ${email}`);
      setEmail('');
    }
    setSending(false);
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">Invitez votre équipe</h2>
        <p className="text-muted-foreground text-sm mt-1">Ajoutez vos collègues pour collaborer sur la prospection.</p>
      </div>

      {/* Info skip message */}
      <div className="flex items-start gap-2.5 p-3.5 rounded-lg bg-accent/50 border border-primary/10">
        <Info className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
        <p className="text-sm text-foreground/80">
          Tu pourras toujours inviter ton équipe plus tard depuis la page <strong>Équipe</strong>.
        </p>
      </div>

      <div className="space-y-3">
        <div className="flex gap-2">
          <div className="flex-1 space-y-1.5">
            <Label>Email</Label>
            <Input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="colleague@company.com"
              onKeyDown={e => e.key === 'Enter' && handleInvite()}
            />
          </div>
          <div className="w-36 space-y-1.5">
            <Label>Rôle</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="sales_user">Sales User</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button variant="outline" onClick={handleInvite} disabled={sending} className="w-full gap-2">
          <UserPlus className="w-4 h-4" />
          {sending ? 'Envoi…' : 'Envoyer l\'invitation'}
        </Button>
      </div>

      {invited.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Invitations envoyées</p>
          {invited.map((inv, i) => (
            <div key={i} className="flex items-center gap-2 text-sm">
              <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <span className="text-foreground">{inv.email}</span>
              <Badge variant="secondary" className="text-xs">{inv.role}</Badge>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <Button onClick={() => onNext({ invited })} className="flex-1">
          {invited.length > 0 ? 'Continuer →' : 'Passer cette étape'}
        </Button>
      </div>
    </div>
  );
}