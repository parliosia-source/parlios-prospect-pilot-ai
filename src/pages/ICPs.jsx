import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import AppLayout from '@/components/layout/AppLayout';
import PageHeader from '@/components/ui/PageHeader';
import ICPCard from '@/components/icps/ICPCard';
import ICPDrawer from '@/components/icps/ICPDrawer';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useCurrentUser } from '@/lib/useCurrentUser';
import { canManageConfig } from '@/lib/roles';
import { useOnboardingState } from '@/lib/useOnboardingState';

export default function ICPsPage() {
  const { userRecord, organization } = useCurrentUser();
  const { refresh: refreshOnboarding } = useOnboardingState();
  const isEditable = canManageConfig(userRecord?.role);
  const [icps, setIcps] = useState([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingIcp, setEditingIcp] = useState(null);

  useEffect(() => {
    if (!organization?.id) return;
    base44.entities.ICP.filter({ organization_id: organization.id }).then(setIcps);
  }, [organization?.id]);

  async function handleSave(data) {
    if (!organization?.id) return;
    const payload = { ...data, organization_id: organization.id };
    if (editingIcp?.id) {
      const updated = await base44.entities.ICP.update(editingIcp.id, payload);
      setIcps(prev => prev.map(i => i.id === updated.id ? updated : i));
    } else {
      const created = await base44.entities.ICP.create(payload);
      setIcps(prev => [...prev, created]);
    }
    await refreshOnboarding();
    setDrawerOpen(false);
    setEditingIcp(null);
  }

  async function handleToggle(icp) {
    const updated = await base44.entities.ICP.update(icp.id, { is_active: !icp.is_active });
    setIcps(prev => prev.map(i => i.id === updated.id ? updated : i));
    await refreshOnboarding();
  }

  async function handleDelete(icp) {
    await base44.entities.ICP.delete(icp.id);
    setIcps(prev => prev.filter(i => i.id !== icp.id));
    await refreshOnboarding();
  }

  function openNew() {
    setEditingIcp(null);
    setDrawerOpen(true);
  }

  function openEdit(icp) {
    setEditingIcp(icp);
    setDrawerOpen(true);
  }

  return (
    <AppLayout requiredRoles={['org_admin', 'manager']}>
      <PageHeader
        title="Ideal Customer Profiles"
        description="Définissez vos profils de clients idéaux pour guider la prospection IA."
        actions={isEditable && (
          <Button onClick={openNew} className="gap-2">
            <Plus className="w-4 h-4" /> Nouvel ICP
          </Button>
        )}
      />

      <div className="px-8 py-6">
        {icps.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-sm">Aucun ICP créé pour le moment.</p>
            {isEditable && (
              <Button onClick={openNew} variant="outline" className="mt-4 gap-2">
                <Plus className="w-4 h-4" /> Créer votre premier ICP
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {icps.map(icp => (
              <ICPCard
                key={icp.id}
                icp={icp}
                isEditable={isEditable}
                onEdit={openEdit}
                onToggle={handleToggle}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      <ICPDrawer
        open={drawerOpen}
        onClose={() => { setDrawerOpen(false); setEditingIcp(null); }}
        icp={editingIcp}
        onSave={handleSave}
      />
    </AppLayout>
  );
}