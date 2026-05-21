import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import AppLayout from '@/components/layout/AppLayout';
import PageHeader from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X, Plus, Save } from 'lucide-react';
import { toast } from 'sonner';
import { useCurrentUser } from '@/lib/useCurrentUser';
import { canManageConfig } from '@/lib/roles';

function TagInput({ value = [], onChange, placeholder }) {
  const [input, setInput] = useState('');

  function addTag() {
    const tag = input.trim();
    if (tag && !value.includes(tag)) {
      onChange([...value, tag]);
    }
    setInput('');
  }

  return (
    <div className="flex flex-wrap gap-1.5 p-2 border border-input rounded-md min-h-10 focus-within:ring-1 focus-within:ring-ring">
      {value.map(tag => (
        <Badge key={tag} variant="secondary" className="gap-1 text-xs">
          {tag}
          <button onClick={() => onChange(value.filter(t => t !== tag))} className="hover:text-destructive">
            <X className="w-2.5 h-2.5" />
          </button>
        </Badge>
      ))}
      <input
        className="flex-1 min-w-24 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        placeholder={placeholder}
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(); } }}
      />
    </div>
  );
}

export default function CompanyProfilePage() {
  const { userRecord, organization } = useCurrentUser();
  const isEditable = canManageConfig(userRecord?.role);
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({
    company_name: '', website: '', industry: '', offer_summary: '',
    value_proposition: '', target_market: '', geographic_focus: '',
    tone_of_voice: 'professional', excluded_keywords: [], competitors: [], notes: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!organization?.id) return;
    base44.entities.CompanyProfile.filter({ organization_id: organization.id }).then(results => {
      if (results.length > 0) {
        setProfile(results[0]);
        setForm({ ...form, ...results[0] });
      }
    });
  }, [organization?.id]);

  async function handleSave() {
    if (!organization?.id) return;
    setSaving(true);
    const data = { ...form, organization_id: organization.id };
    if (profile?.id) {
      await base44.entities.CompanyProfile.update(profile.id, data);
    } else {
      const created = await base44.entities.CompanyProfile.create(data);
      setProfile(created);
    }
    setSaving(false);
    toast.success('Profil entreprise sauvegardé');
  }

  function set(field) {
    return v => setForm(f => ({ ...f, [field]: v }));
  }

  return (
    <AppLayout requiredRoles={['org_admin', 'manager']}>
      <PageHeader
        title="Profil entreprise"
        description="Décrivez votre offre et votre positionnement pour alimenter l'IA de prospection."
        actions={isEditable && (
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            <Save className="w-4 h-4" />
            {saving ? 'Sauvegarde...' : 'Sauvegarder'}
          </Button>
        )}
      />
      <div className="px-8 py-6 max-w-2xl space-y-6">
        <Section title="Identité">
          <Field label="Nom de l'entreprise">
            <Input value={form.company_name} onChange={e => set('company_name')(e.target.value)} disabled={!isEditable} placeholder="Acme Corp" />
          </Field>
          <Field label="Site web">
            <Input value={form.website} onChange={e => set('website')(e.target.value)} disabled={!isEditable} placeholder="https://example.com" />
          </Field>
          <Field label="Secteur d'activité">
            <Input value={form.industry} onChange={e => set('industry')(e.target.value)} disabled={!isEditable} placeholder="SaaS B2B, Fintech…" />
          </Field>
        </Section>

        <Section title="Offre">
          <Field label="Résumé de l'offre">
            <Textarea value={form.offer_summary} onChange={e => set('offer_summary')(e.target.value)} disabled={!isEditable} rows={3} placeholder="En 2-3 phrases, décrivez ce que vous vendez." />
          </Field>
          <Field label="Proposition de valeur">
            <Textarea value={form.value_proposition} onChange={e => set('value_proposition')(e.target.value)} disabled={!isEditable} rows={3} placeholder="Qu'est-ce qui vous différencie de vos concurrents ?" />
          </Field>
        </Section>

        <Section title="Marché">
          <Field label="Marché cible">
            <Input value={form.target_market} onChange={e => set('target_market')(e.target.value)} disabled={!isEditable} placeholder="PME françaises 50-200 employés" />
          </Field>
          <Field label="Zone géographique">
            <Input value={form.geographic_focus} onChange={e => set('geographic_focus')(e.target.value)} disabled={!isEditable} placeholder="France, DACH, Benelux…" />
          </Field>
          <Field label="Ton de communication">
            <Select value={form.tone_of_voice} onValueChange={set('tone_of_voice')} disabled={!isEditable}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="professional">Professionnel</SelectItem>
                <SelectItem value="casual">Décontracté</SelectItem>
                <SelectItem value="technical">Technique</SelectItem>
                <SelectItem value="friendly">Amical</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </Section>

        <Section title="Compétiteurs & exclusions">
          <Field label="Concurrents">
            <TagInput value={form.competitors} onChange={set('competitors')} placeholder="Ajouter un concurrent…" />
          </Field>
          <Field label="Mots-clés à exclure">
            <TagInput value={form.excluded_keywords} onChange={set('excluded_keywords')} placeholder="Ajouter un mot-clé…" />
          </Field>
        </Section>

        <Section title="Notes internes">
          <Field label="Notes">
            <Textarea value={form.notes} onChange={e => set('notes')(e.target.value)} disabled={!isEditable} rows={4} placeholder="Informations complémentaires pour l'IA…" />
          </Field>
        </Section>
      </div>
    </AppLayout>
  );
}

function Section({ title, children }) {
  return (
    <div>
      <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">{title}</h2>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium">{label}</Label>
      {children}
    </div>
  );
}