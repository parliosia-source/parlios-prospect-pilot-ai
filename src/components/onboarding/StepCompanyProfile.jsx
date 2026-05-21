import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

export default function StepCompanyProfile({ organization, onNext }) {
  const [form, setForm] = useState({
    company_name: organization?.name || '',
    website: organization?.website || '',
    industry: organization?.industry || '',
    offer_summary: '', value_proposition: '',
    target_market: '', geographic_focus: '',
    tone_of_voice: 'professional',
  });
  const [saving, setSaving] = useState(false);

  function set(field) { return v => setForm(f => ({ ...f, [field]: v })); }

  async function handleSave() {
    if (!form.company_name) { toast.error('Le nom est requis.'); return; }
    setSaving(true);
    await base44.entities.CompanyProfile.create({ ...form, organization_id: organization.id });
    setSaving(false);
    toast.success('Profil entreprise créé !');
    onNext({ company_profile: form });
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">Votre profil entreprise</h2>
        <p className="text-muted-foreground text-sm mt-1">Ces informations alimenteront l'IA de prospection.</p>
      </div>
      <div className="space-y-4">
        <Field label="Nom de l'entreprise *">
          <Input value={form.company_name} onChange={e => set('company_name')(e.target.value)} placeholder="Acme Corp" />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Site web">
            <Input value={form.website} onChange={e => set('website')(e.target.value)} placeholder="https://…" />
          </Field>
          <Field label="Secteur">
            <Input value={form.industry} onChange={e => set('industry')(e.target.value)} placeholder="SaaS B2B" />
          </Field>
        </div>
        <Field label="Résumé de l'offre">
          <Textarea value={form.offer_summary} onChange={e => set('offer_summary')(e.target.value)} rows={2} placeholder="Ce que vous vendez en 2-3 phrases…" />
        </Field>
        <Field label="Proposition de valeur">
          <Textarea value={form.value_proposition} onChange={e => set('value_proposition')(e.target.value)} rows={2} placeholder="Ce qui vous différencie…" />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Marché cible">
            <Input value={form.target_market} onChange={e => set('target_market')(e.target.value)} placeholder="PME 50-200 employés" />
          </Field>
          <Field label="Zone géographique">
            <Input value={form.geographic_focus} onChange={e => set('geographic_focus')(e.target.value)} placeholder="France, DACH…" />
          </Field>
        </div>
        <Field label="Ton de communication">
          <Select value={form.tone_of_voice} onValueChange={set('tone_of_voice')}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="professional">Professionnel</SelectItem>
              <SelectItem value="casual">Décontracté</SelectItem>
              <SelectItem value="technical">Technique</SelectItem>
              <SelectItem value="friendly">Amical</SelectItem>
            </SelectContent>
          </Select>
        </Field>
      </div>
      <div className="flex gap-3">
        <Button onClick={handleSave} disabled={saving} className="flex-1">
          {saving ? 'Sauvegarde…' : 'Sauvegarder et continuer →'}
        </Button>
        <Button variant="ghost" onClick={() => onNext()}>Passer</Button>
      </div>
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