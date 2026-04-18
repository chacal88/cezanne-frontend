import type { AccessContext, Capabilities } from './types';

function hasOrgAccess(context: AccessContext) {
  return context.organizationType === 'hc' || context.organizationType === 'ra' || context.isSysAdmin;
}

export function evaluateCapabilities(context: AccessContext): Capabilities {
  const canEnterShell = context.isAuthenticated;
  const canUseOrgSurface = canEnterShell && hasOrgAccess(context);

  return {
    canEnterShell,
    canViewDashboard: canUseOrgSurface,
    canViewNotifications: canEnterShell,
    canUseInbox: canUseOrgSurface,
    canOpenAccountArea: canEnterShell,
    canLogout: canEnterShell,
    canSeeNavSection: canEnterShell,
  };
}
