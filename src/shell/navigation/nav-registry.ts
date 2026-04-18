import type { Capabilities } from '../../lib/access-control';

export type ShellNavigationItem = {
  labelKey: 'navigation.dashboard' | 'navigation.notifications' | 'navigation.inbox';
  to: '/dashboard' | '/notifications' | '/inbox';
  search?: { conversation?: string };
  capability: keyof Pick<Capabilities, 'canViewDashboard' | 'canViewNotifications' | 'canUseInbox'>;
};

const shellNavigationItems: ShellNavigationItem[] = [
  { labelKey: 'navigation.dashboard', to: '/dashboard', capability: 'canViewDashboard' },
  { labelKey: 'navigation.notifications', to: '/notifications', capability: 'canViewNotifications' },
  { labelKey: 'navigation.inbox', to: '/inbox', capability: 'canUseInbox' },
];

export function getVisibleShellNavigation(capabilities: Capabilities) {
  return shellNavigationItems.filter((item) => capabilities[item.capability]);
}
