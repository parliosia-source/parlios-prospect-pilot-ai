import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { toast } from 'sonner';

function TagInput({ value = [], onChange, placeholder }) {
  const [input, setInput] = useState('');
  function add() {
    const t = input.trim();
    if (t && !value.includes(t)) onChange([...value, t]);
    setInput('');
  }
  return (
    <div className="flex flex-wrap gap-1.5 p-2 border border-input rounded-md min-h-10 focus-within:ring-1 focus-within:ring-ring">
      {value.map(t => (
        <Badge key={t} variant="secondary" className="gap-1 text-xs">
          {t}
          <button onClick={() => onChange(value.filter(v => v !== t))}><X className="w-2.5 h-2.5" /></button>
        </Badge>
      ))}
      <input
        className="flex-1 min-w-20 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        placeholder={placeholder}
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); add(); } }}
      />
    </div>
  );
}

export default function StepFirstICP({ organization, onNext }) {
  const [form, setForm] = useState({
    name: '', description: '', target_industries: [], target_locations: [],
    target_company_size: 'all', buying_signals: [], is_active: true,
  });
  const [saving, setSaving] = useState(false);

  function set(field) { return v => setForm(f => ({ ...f, [field]: v })); }

  async function handleSave() {
    if (!form.name.trim()) { toast.error('Le nom est requis.'); return; }
    setSaving(true);
    await base44.entities.ICP.create({ ...form, organization_id: organization.id });
    setSaving(false);
    toast.success('ICP créé !');
    onNext({ icp: form });
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">Votre premier ICP</h2>
        <p className="text-muted-foreground text-sm mt-1">Définissez le profil de votre client idéal pour guider la prospection.</p>
      </div>
      <div className="space-y-4">
        <Field label="Nom de l'ICP *">
          <Input value={form.name} onChange={e => set('name')(e.target.value)} placeholder="Ex: SaaS B2B DACH 200+ employés" />
        </Field>
        <Field label="Description">
          <Textarea value={form.description} onChange={e => set('description')(e.target.value)} rows={2} placeholder="Décrivez ce profil client…" />
        </Field>
        <Field label="Secteurs cibles">
          <TagInput value={form.target_industries} onChange={set('target_industries')} placeholder="SaaS, Fintech, EdTech… (Entrée)" />
        </Field>
        <Field label="Zones géographiques">
          <TagInput value={form.target_locations} onChange={set('target_locations')} placeholder="France, Allemagne… (Entrée)" />
        </Field>
        <Field label="Taille d'entreprise">
          <Select value={form.target_company_size} onValueChange={set('target_company_size')}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="smb">PME (1–200)</SelectItem>
              <SelectItem value="mid_market">Mid-Market (200–1000)</SelectItem>
              <SelectItem value="enterprise">Enterprise (1000+)</SelectItem>
              <SelectItem value="all">Tous</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field label="Signaux d'achat">
          <TagInput value={form.buying_signals} onChange={set('buying_signals')} placeholder="Levée de fonds, Recrutement… (Entrée)" />
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