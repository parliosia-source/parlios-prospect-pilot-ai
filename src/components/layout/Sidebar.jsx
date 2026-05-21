import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Megaphone, GitBranch, BookOpen,
  Target, Building2, Users, ShieldAlert, ChevronRight
} from 'lucide-react';
import { ROLES, PLAN_LABELS } from '@/lib/roles';
import WorkspaceIndicator from './WorkspaceIndicator';

const NAV_ITEMS = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', roles: 'all' },
  { label: 'Campagnes', icon: Megaphone, path: '/campaigns', roles: 'all', phase: 2 },
  { label: 'Pipeline', icon: GitBranch, path: '/pipeline', roles: 'all', phase: 2 },
  { label: 'Knowledge Base', icon: BookOpen, path: '/knowledge-base', roles: 'all', phase: 2 },
  { label: 'ICPs', icon: Target, path: '/icps', roles: [ROLES.ORG_ADMIN, ROLES.MANAGER] },
  { label: 'Profil entreprise', icon: Building2, path: '/company-profile', roles: [ROLES.ORG_ADMIN, ROLES.MANAGER] },
  { label: 'Équipe', icon: Users, path: '/team', roles: [ROLES.ORG_ADMIN] },
  { label: 'Super Admin', icon: ShieldAlert, path: '/super-admin', roles: [ROLES.SUPER_ADMIN] },
];

export default function Sidebar({ userRecord, organization }) {
  const location = useLocation();
  const role = userRecord?.role;

  const visibleItems = NAV_ITEMS.filter(item => {
    if (item.roles === 'all') return true;
    return item.roles.includes(role);
  });

  return (
    <aside className="w-60 flex-shrink-0 h-screen bg-sidebar flex flex-col border-r border-sidebar-border">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-white text-xs font-bold">P</span>
          </div>
          <span className="text-white font-semibold text-sm tracking-tight">Parlios</span>
        </div>
      </div>

      {/* Workspace indicator */}
      <WorkspaceIndicator organization={organization} userRecord={userRecord} />

      {/* Navigation */}
      <nav className="flex-1 px-3 py-3 overflow-y-auto space-y-0.5">
        {visibleItems.map(item => {
          const isActive = location.pathname === item.path;
          const isPhase2 = !!item.phase;

          return (
            <Link
              key={item.path}
              to={isPhase2 ? '#' : item.path}
              onClick={isPhase2 ? e => e.preventDefault() : undefined}
              className={`
                flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all duration-150 group
                ${isActive
                  ? 'bg-primary text-white font-medium'
                  : isPhase2
                    ? 'text-sidebar-foreground/40 cursor-default'
                    : 'text-sidebar-foreground hover:bg-sidebar-hover hover:text-white'
                }
              `}
            >
              <item.icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-white' : ''}`} />
              <span className="flex-1 truncate">{item.label}</span>
              {isPhase2 && (
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-sidebar-hover text-sidebar-foreground/50 ml-auto">
                  Soon
                </span>
              )}
              {isActive && <ChevronRight className="w-3 h-3 ml-auto opacity-60" />}
            </Link>
          );
        })}
      </nav>

      {/* Bottom user info */}
      <div className="px-4 py-4 border-t border-sidebar-border">
        <p className="text-sidebar-foreground/50 text-xs truncate">{userRecord?.email || ''}</p>
        <p className="text-sidebar-foreground/30 text-xs mt-0.5 capitalize">{role?.replace('_', ' ')}</p>
      </div>
    </aside>
  );
}