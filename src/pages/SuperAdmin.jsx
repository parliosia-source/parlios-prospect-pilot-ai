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
import { Plus, Building2, Mail } from 'lucide-react';
import { toast } from 'sonner';
import { PLAN_LABELS } from '@/lib/roles';

const STATUS_COLORS = {
  active: 'bg-emerald-100 text-emerald-700',
  trial: 'bg-amber-100 text-amber-700',
  suspended: 'bg-red-100 text-red-700',
};

function slugify(text) {
  return text.toString().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

export default function SuperAdminPage() {
  const [orgs, setOrgs] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [inviteToken, setInviteToken] = useState(null);
  const [form, setForm] = useState({
    name: '', website: '', industry: '', country: '', city: '',
    subscription_plan: 'free', admin_email: '',
  });

  useEffect(() => {
    base44.entities.Organization.list().then(setOrgs);
  }, []);

  function setField(field) { return v => setForm(f => ({ ...f, [field]: v })); }

  async function handleCreate() {
    if (!form.name || !form.admin_email) { toast.error('Nom et email admin requis.'); return; }
    setCreating(true);
    const { admin_email, ...org_data } = form;
    const res = await base44.functions.invoke('registerOrganization', { org_data, admin_email });
    if (res.data.error) {
      toast.error(res.data.error);
    } else {
      toast.success(`Organisation créée — invitation envoyée à ${admin_email}`);
      setInviteToken(res.data.invitation_token);
      base44.entities.Organization.list().then(setOrgs);
    }
    setCreating(false);
  }

  const slugPreview = slugify(form.name);

  return (
    <AppLayout requiredRoles={['super_admin']}>
      <PageHeader
        title="Super Admin"
        description="Gérez toutes les organisations de la plateforme Parlios."
        actions={
          <Button onClick={() => { setDialogOpen(true); setInviteToken(null); setForm({ name: '', website: '', industry: '', country: '', city: '', subscription_plan: 'free', admin_email: '' }); }} className="gap-2">
            <Plus className="w-4 h-4" /> Nouvelle organisation
          </Button>
        }
      />

      <div className="px-8 py-6">
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Organisation</th>
                <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Slug</th>
                <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Plan</th>
                <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Statut</th>
                <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Créée le</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {orgs.map(org => {
                const plan = PLAN_LABELS[org.subscription_plan] || PLAN_LABELS.free;
                return (
                  <tr key={org.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-md bg-accent flex items-center justify-center text-xs font-bold text-primary">
                          {org.name[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{org.name}</p>
                          {org.industry && <p className="text-xs text-muted-foreground">{org.industry}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-xs text-muted-foreground">{org.slug}</td>
                    <td className="px-5 py-3.5">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded ${plan.color}`}>{plan.label}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded ${STATUS_COLORS[org.status] || ''}`}>{org.status}</span>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-muted-foreground">
                      {org.created_date ? new Date(org.created_date).toLocaleDateString('fr-FR') : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {orgs.length === 0 && (
            <div className="text-center py-16">
              <Building2 className="w-8 h-8 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Aucune organisation créée.</p>
            </div>
          )}
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Créer une organisation</DialogTitle>
          </DialogHeader>
          {!inviteToken ? (
            <>
              <div className="space-y-4 py-2">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 space-y-1.5">
                    <Label>Nom de l'organisation *</Label>
                    <Input value={form.name} onChange={e => setField('name')(e.target.value)} placeholder="Acme Corp" />
                    {form.name && <p className="text-xs text-muted-foreground">Slug : <code>{slugPreview}</code></p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label>Site web</Label>
                    <Input value={form.website} onChange={e => setField('website')(e.target.value)} placeholder="https://…" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Secteur</Label>
                    <Input value={form.industry} onChange={e => setField('industry')(e.target.value)} placeholder="SaaS, Fintech…" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Pays</Label>
                    <Input value={form.country} onChange={e => setField('country')(e.target.value)} placeholder="France" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Ville</Label>
                    <Input value={form.city} onChange={e => setField('city')(e.target.value)} placeholder="Paris" />
                  </div>
                  <div className="col-span-2 space-y-1.5">
                    <Label>Plan</Label>
                    <Select value={form.subscription_plan} onValueChange={setField('subscription_plan')}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="free">Free</SelectItem>
                        <SelectItem value="starter">Starter</SelectItem>
                        <SelectItem value="pro">Pro</SelectItem>
                        <SelectItem value="enterprise">Enterprise</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2 space-y-1.5">
                    <Label>Email de l'org_admin *</Label>
                    <Input type="email" value={form.admin_email} onChange={e => setField('admin_email')(e.target.value)} placeholder="admin@entreprise.com" />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>Annuler</Button>
                <Button onClick={handleCreate} disabled={creating} className="gap-2">
                  <Mail className="w-4 h-4" />
                  {creating ? 'Création…' : 'Créer & inviter'}
                </Button>
              </DialogFooter>
            </>
          ) : (
            <div className="py-4 space-y-3">
              <p className="text-sm font-medium text-foreground">✓ Organisation créée avec succès</p>
              <p className="text-sm text-muted-foreground">Lien d'invitation à partager si l'email n'est pas reçu :</p>
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