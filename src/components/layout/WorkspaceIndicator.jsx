import { PLAN_LABELS } from '@/lib/roles';

export default function WorkspaceIndicator({ organization, userRecord }) {
  if (!organization && userRecord?.role !== 'super_admin') return null;

  if (userRecord?.role === 'super_admin') {
    return (
      <div className="px-4 py-3 border-b border-sidebar-border">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-violet-600 flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-bold">SA</span>
          </div>
          <div className="min-w-0">
            <p className="text-white text-xs font-semibold truncate">Super Admin</p>
            <p className="text-sidebar-foreground/50 text-[11px]">Parlios Platform</p>
          </div>
        </div>
      </div>
    );
  }

  const plan = organization?.subscription_plan || 'free';
  const planConfig = PLAN_LABELS[plan] || PLAN_LABELS.free;
  const initials = organization?.name?.slice(0, 2).toUpperCase() || 'OR';

  return (
    <div className="px-4 py-3 border-b border-sidebar-border">
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-md bg-primary/80 flex items-center justify-center flex-shrink-0">
          <span className="text-white text-xs font-bold">{initials}</span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-white text-xs font-semibold truncate">{organization?.name || 'Organisation'}</p>
          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${planConfig.color}`}>
            {planConfig.label}
          </span>
        </div>
      </div>
    </div>
  );
}