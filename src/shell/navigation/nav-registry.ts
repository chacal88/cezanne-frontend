import type { Capabilities } from '../../lib/access-control';

export type ShellNavigationItem = {
  labelKey: 'navigation.dashboard' | 'navigation.notifications' | 'navigation.inbox' | 'navigation.jobs';
  to: '/dashboard' | '/notifications' | '/inbox' | '/jobs/$scope';
  search?: { conversation?: string };
  params?: { scope: string };
  capability: keyof Pick<Capabilities, 'canViewDashboard' | 'canViewNotifications' | 'canUseInbox' | 'canViewJobsList'>;
};

export type PlatformNavigationGroup = {
  labelKey: 'platformNavigation.masterData' | 'platformNavigation.usersAndRequests' | 'platformNavigation.taxonomy';
  navGroup: 'master-data' | 'users-and-requests' | 'taxonomy';
  capability: keyof Pick<Capabilities, 'canViewPlatformMasterDataNav' | 'canViewPlatformUsersAndRequestsNav' | 'canViewPlatformTaxonomyNav'>;
  links: [];
  implementationState: 'planned-routes-hidden';
};

const shellNavigationItems: ShellNavigationItem[] = [
  { labelKey: 'navigation.dashboard', to: '/dashboard', capability: 'canViewDashboard' },
  { labelKey: 'navigation.notifications', to: '/notifications', capability: 'canViewNotifications' },
  { labelKey: 'navigation.inbox', to: '/inbox', capability: 'canUseInbox' },
  { labelKey: 'navigation.jobs', to: '/jobs/$scope', params: { scope: 'open' }, capability: 'canViewJobsList' },
];

const platformNavigationGroups: PlatformNavigationGroup[] = [
  {
    labelKey: 'platformNavigation.masterData',
    navGroup: 'master-data',
    capability: 'canViewPlatformMasterDataNav',
    links: [],
    implementationState: 'planned-routes-hidden',
  },
  {
    labelKey: 'platformNavigation.usersAndRequests',
    navGroup: 'users-and-requests',
    capability: 'canViewPlatformUsersAndRequestsNav',
    links: [],
    implementationState: 'planned-routes-hidden',
  },
  {
    labelKey: 'platformNavigation.taxonomy',
    navGroup: 'taxonomy',
    capability: 'canViewPlatformTaxonomyNav',
    links: [],
    implementationState: 'planned-routes-hidden',
  },
];

export function getVisibleShellNavigation(capabilities: Capabilities) {
  return shellNavigationItems.filter((item) => capabilities[item.capability]);
}

export function getVisiblePlatformNavigation(capabilities: Capabilities) {
  if (!capabilities.canViewPlatformNavigation) return [];
  return platformNavigationGroups.filter((group) => capabilities[group.capability]);
}
