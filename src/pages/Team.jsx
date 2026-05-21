import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import AppLayout from '@/components/layout/AppLayout';
import PageHeader from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { UserPlus, Mail, Clock, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useCurrentUser } from '@/lib/useCurrentUser';
import { useOnboardingState } from '@/lib/useOnboardingState';

const ROLE_LABELS = { org_admin: 'Admin', manager: 'Manager', sales_user: 'Sales User' };
const STATUS_CONFIG = {
  active: { label: 'Actif', icon: CheckCircle, color: 'text-emerald-600' },
  pending_invitation: { label: 'Invitation envoyée', icon: Clock, color: 'text-amber-500' },
  suspended: { label: 'Suspendu', icon: null, color: 'text-muted-foreground' },
};

export default function TeamPage() {
  const { userRecord, organization } = useCurrentUser();
  const { refresh: refreshOnboarding } = useOnboardingState();
  const [members, setMembers] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [inviteForm, setInviteForm] = useState({ email: '', role: 'sales_user' });
  const [inviting, setInviting] = useState(false);
  const [inviteToken, setInviteToken] = useState(null);

  useEffect(() => {
    if (!organization?.id) return;
    base44.entities.User.filter({ organization_id: organization.id }).then(setMembers);
  }, [organization?.id]);

  async function handleInvite() {
    if (!inviteForm.email) { toast.error('Email requis.'); return; }
    setInviting(true);
    const res = await base44.functions.invoke('inviteTeamMember', inviteForm);
    if (res.data.error) {
      toast.error(res.data.error);
    } else {
      toast.success(`Invitation envoyée à ${inviteForm.email}`);
      setInviteToken(res.data.invitation_token);
      await base44.entities.User.filter({ organization_id: organization.id }).then(setMembers);
      await refreshOnboarding();
      setInviteForm({ email: '', role: 'sales_user' });
    }
    setInviting(false);
  }

  return (
    <AppLayout requiredRoles={['org_admin']}>
      <PageHeader
        title="Équipe"
        description="Gérez les membres de votre organisation."
        actions={
          <Button onClick={() => { setDialogOpen(true); setInviteToken(null); }} className="gap-2">
            <UserPlus className="w-4 h-4" /> Inviter un membre
          </Button>
        }
      />

      <div className="px-8 py-6">
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Membre</th>
                <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Rôle</th>
                <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {members.map(m => {
                const status = STATUS_CONFIG[m.status] || STATUS_CONFIG.suspended;
                const StatusIcon = status.icon;
                return (
                  <tr key={m.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-xs font-semibold text-primary">
                          {(m.email || m.full_name || '?')[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{m.full_name || '—'}</p>
                          <p className="text-xs text-muted-foreground">{m.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge variant="secondary" className="text-xs">{ROLE_LABELS[m.role] || m.role}</Badge>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className={`flex items-center gap-1.5 text-xs font-medium ${status.color}`}>
                        {StatusIcon && <StatusIcon className="w-3.5 h-3.5" />}
                        {status.label}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {members.length === 0 && (
            <div className="text-center py-12">
              <p className="text-sm text-muted-foreground">Aucun membre pour l'instant.</p>
            </div>
          )}
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Inviter un membre</DialogTitle>
          </DialogHeader>
          {!inviteToken ? (
            <>
              <div className="space-y-4 py-2">
                <div className="space-y-1.5">
                  <Label>Email</Label>
                  <Input
                    type="email" placeholder="prenom@entreprise.com"
                    value={inviteForm.email}
                    onChange={e => setInviteForm(f => ({ ...f, email: e.target.value }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Rôle</Label>
                  <Select value={inviteForm.role} onValueChange={v => setInviteForm(f => ({ ...f, role: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="sales_user">Sales User</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>Annuler</Button>
                <Button onClick={handleInvite} disabled={inviting} className="gap-2">
                  <Mail className="w-4 h-4" />
                  {inviting ? 'Envoi…' : 'Envoyer l\'invitation'}
                </Button>
              </DialogFooter>
            </>
          ) : (
            <div className="py-4 space-y-3">
              <p className="text-sm text-muted-foreground">Invitation envoyée. Si l'email n'est pas reçu, partagez ce lien :</p>
              <code className="block text-xs bg-muted rounded-lg p-3 break-all">
                {window.location.origin}/accept-invite?token={inviteToken}
              </code>
              <Button className="w-full" onClick={() => setDialogOpen(false)}>Fermer</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}