import type { Capabilities } from '../../lib/access-control';

export type ShellNavigationItem = {
  labelKey: 'navigation.dashboard' | 'navigation.notifications' | 'navigation.inbox' | 'navigation.jobs';
  to: '/dashboard' | '/notifications' | '/inbox' | '/jobs/$scope';
  search?: { conversation?: string };
  params?: { scope: string };
  capability: keyof Pick<Capabilities, 'canViewDashboard' | 'canViewNotifications' | 'canUseInbox' | 'canViewJobsList'>;
};

const shellNavigationItems: ShellNavigationItem[] = [
  { labelKey: 'navigation.dashboard', to: '/dashboard', capability: 'canViewDashboard' },
  { labelKey: 'navigation.notifications', to: '/notifications', capability: 'canViewNotifications' },
  { labelKey: 'navigation.inbox', to: '/inbox', capability: 'canUseInbox' },
  { labelKey: 'navigation.jobs', to: '/jobs/$scope', params: { scope: 'open' }, capability: 'canViewJobsList' },
];

export function getVisibleShellNavigation(capabilities: Capabilities) {
  return shellNavigationItems.filter((item) => capabilities[item.capability]);
}
