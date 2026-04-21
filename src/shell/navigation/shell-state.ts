import type { AccessContext, Capabilities } from '../../lib/access-control';
import { getVisibleAccountNavigation, getVisiblePlatformNavigation, getVisibleShellNavigation } from './nav-registry';

export type ShellMode = 'org' | 'platform' | 'public-denied';
export type ShellAccountEntryState = 'available' | 'denied';
export type ShellNavigationState = {
  mode: ShellMode;
  activeTarget: string;
  visibleItemCount: number;
  visibleAccountEntryCount: number;
  visiblePlatformGroupCount: number;
  hiddenTargets: string[];
  accountEntries: Array<{ id: 'user-profile' | 'hiring-company-profile' | 'recruitment-agency-profile' | 'user-settings' | 'company-settings' | 'agency-settings' | 'logout'; target: string; state: ShellAccountEntryState }>;
};

const orgTargets = ['/dashboard', '/notifications', '/inbox', '/jobs/$scope', '/user-profile', '/settings/user-settings', '/hiring-company-profile', '/recruitment-agency-profile', '/settings/company-settings', '/settings/agency-settings'];
const platformTargets = ['/hiring-companies', '/recruitment-agencies', '/subscriptions', '/users', '/favorites-request', '/sectors', '/user-profile', '/settings/user-settings'];

function resolveShellMode(context: AccessContext): ShellMode {
  if (!context.isAuthenticated) return 'public-denied';
  if (context.isSysAdmin && context.organizationType === 'none') return 'platform';
  return 'org';
}

export function buildShellNavigationState(input: { capabilities: Capabilities; accessContext: AccessContext; pathname: string }): ShellNavigationState {
  const mode = resolveShellMode(input.accessContext);
  const visible = getVisibleShellNavigation(input.capabilities);
  const account = getVisibleAccountNavigation(input.capabilities, input.accessContext);
  const platform = getVisiblePlatformNavigation(input.capabilities);
  const visibleTargets = new Set([
    ...visible.map((item) => item.to),
    ...account.map((item) => item.to),
    ...platform.flatMap((group) => group.links.map((link) => link.to)),
  ]);
  const knownTargets = mode === 'platform' ? platformTargets : orgTargets;

  return {
    mode,
    activeTarget: input.pathname,
    visibleItemCount: visible.length,
    visibleAccountEntryCount: account.length,
    visiblePlatformGroupCount: platform.length,
    hiddenTargets: knownTargets.filter((target) => !visibleTargets.has(target as never)),
    accountEntries: account.map((entry) => ({ id: entry.id, target: entry.to, state: 'available' })),
  };
}
