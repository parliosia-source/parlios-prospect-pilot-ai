import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { X } from 'lucide-react';
import { toast } from 'sonner';

const EMPTY_FORM = {
  name: '', description: '', target_industries: [], target_locations: [],
  target_company_size: 'all', buying_signals: [], is_active: true,
};

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

export default function ICPDrawer({ open, onClose, icp, onSave }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (icp) {
      setForm({ ...EMPTY_FORM, ...icp });
    } else {
      setForm(EMPTY_FORM);
    }
  }, [icp, open]);

  function set(field) { return v => setForm(f => ({ ...f, [field]: v })); }

  async function handleSubmit() {
    if (!form.name.trim()) { toast.error('Le nom est requis.'); return; }
    setSaving(true);
    await onSave(form);
    setSaving(false);
    toast.success(icp ? 'ICP mis à jour' : 'ICP créé');
  }

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{icp ? 'Modifier l\'ICP' : 'Nouvel ICP'}</SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-5">
          <div className="space-y-1.5">
            <Label>Nom *</Label>
            <Input value={form.name} onChange={e => set('name')(e.target.value)} placeholder="Ex: SaaS B2B Expansion Europe" />
          </div>
          <div className="space-y-1.5">
            <Label>Description</Label>
            <Textarea value={form.description} onChange={e => set('description')(e.target.value)} rows={3} placeholder="Décrivez ce profil client idéal…" />
          </div>
          <div className="space-y-1.5">
            <Label>Secteurs cibles</Label>
            <TagInput value={form.target_industries} onChange={set('target_industries')} placeholder="Ex: SaaS, Fintech…" />
          </div>
          <div className="space-y-1.5">
            <Label>Zones géographiques</Label>
            <TagInput value={form.target_locations} onChange={set('target_locations')} placeholder="Ex: France, Allemagne…" />
          </div>
          <div className="space-y-1.5">
            <Label>Taille d'entreprise</Label>
            <Select value={form.target_company_size} onValueChange={set('target_company_size')}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="smb">PME (1–200)</SelectItem>
                <SelectItem value="mid_market">Mid-Market (200–1000)</SelectItem>
                <SelectItem value="enterprise">Enterprise (1000+)</SelectItem>
                <SelectItem value="all">Tous</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Signaux d'achat</Label>
            <TagInput value={form.buying_signals} onChange={set('buying_signals')} placeholder="Ex: Levée de fonds, Recrutement…" />
          </div>
          <div className="flex items-center justify-between py-2">
            <Label>ICP actif</Label>
            <Switch checked={form.is_active} onCheckedChange={set('is_active')} />
          </div>
          <div className="flex gap-3 pt-4">
            <Button onClick={handleSubmit} disabled={saving} className="flex-1">
              {saving ? 'Sauvegarde…' : icp ? 'Mettre à jour' : 'Créer l\'ICP'}
            </Button>
            <Button variant="outline" onClick={onClose}>Annuler</Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}