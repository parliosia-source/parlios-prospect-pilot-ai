// Role hierarchy and permission helpers

export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ORG_ADMIN: 'org_admin',
  MANAGER: 'manager',
  SALES_USER: 'sales_user',
};

export const PLAN_LABELS = {
  free: { label: 'Free', color: 'bg-slate-200 text-slate-700' },
  starter: { label: 'Starter', color: 'bg-blue-100 text-blue-700' },
  pro: { label: 'Pro', color: 'bg-indigo-100 text-indigo-700' },
  enterprise: { label: 'Enterprise', color: 'bg-violet-100 text-violet-700' },
};

export function canManageConfig(role) {
  return role === ROLES.SUPER_ADMIN || role === ROLES.ORG_ADMIN;
}

export function canViewConfig(role) {
  return role === ROLES.SUPER_ADMIN || role === ROLES.ORG_ADMIN || role === ROLES.MANAGER;
}

export function canManageTeam(role) {
  return role === ROLES.SUPER_ADMIN || role === ROLES.ORG_ADMIN;
}

export function isSuperAdmin(role) {
  return role === ROLES.SUPER_ADMIN;
}