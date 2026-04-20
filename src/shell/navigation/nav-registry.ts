import type { Capabilities } from '../../lib/access-control';

export type ShellNavigationItem = {
  labelKey: 'navigation.dashboard' | 'navigation.notifications' | 'navigation.inbox' | 'navigation.jobs';
  to: '/dashboard' | '/notifications' | '/inbox' | '/jobs/$scope';
  search?: { conversation?: string };
  params?: { scope: string };
  capability: keyof Pick<Capabilities, 'canViewDashboard' | 'canViewNotifications' | 'canUseInbox' | 'canViewJobsList'>;
};

export type PlatformNavigationLink = {
  labelKey: 'platformNavigation.links.hiringCompanies' | 'platformNavigation.links.recruitmentAgencies' | 'platformNavigation.links.subscriptions' | 'platformNavigation.links.users' | 'platformNavigation.links.favoriteRequests' | 'platformNavigation.links.sectors';
  to: '/hiring-companies' | '/recruitment-agencies' | '/subscriptions' | '/users' | '/favorites-request' | '/sectors';
  capability: keyof Pick<Capabilities, 'canManageHiringCompanies' | 'canManageRecruitmentAgencies' | 'canManagePlatformSubscriptions' | 'canManagePlatformUsers' | 'canManageFavoriteRequests' | 'canManageTaxonomy'>;
};

export type PlatformNavigationGroup = {
  labelKey: 'platformNavigation.masterData' | 'platformNavigation.usersAndRequests' | 'platformNavigation.taxonomy';
  navGroup: 'master-data' | 'users-and-requests' | 'taxonomy';
  capability: keyof Pick<Capabilities, 'canViewPlatformMasterDataNav' | 'canViewPlatformUsersAndRequestsNav' | 'canViewPlatformTaxonomyNav'>;
  links: PlatformNavigationLink[];
  implementationState: 'implemented-links' | 'planned-routes-hidden';
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
    links: [
      { labelKey: 'platformNavigation.links.hiringCompanies', to: '/hiring-companies', capability: 'canManageHiringCompanies' },
      { labelKey: 'platformNavigation.links.recruitmentAgencies', to: '/recruitment-agencies', capability: 'canManageRecruitmentAgencies' },
      { labelKey: 'platformNavigation.links.subscriptions', to: '/subscriptions', capability: 'canManagePlatformSubscriptions' },
    ],
    implementationState: 'implemented-links',
  },
  {
    labelKey: 'platformNavigation.usersAndRequests',
    navGroup: 'users-and-requests',
    capability: 'canViewPlatformUsersAndRequestsNav',
    links: [
      { labelKey: 'platformNavigation.links.users', to: '/users', capability: 'canManagePlatformUsers' },
      { labelKey: 'platformNavigation.links.favoriteRequests', to: '/favorites-request', capability: 'canManageFavoriteRequests' },
    ],
    implementationState: 'implemented-links',
  },
  {
    labelKey: 'platformNavigation.taxonomy',
    navGroup: 'taxonomy',
    capability: 'canViewPlatformTaxonomyNav',
    links: [{ labelKey: 'platformNavigation.links.sectors', to: '/sectors', capability: 'canManageTaxonomy' }],
    implementationState: 'implemented-links',
  },
];

export function getVisibleShellNavigation(capabilities: Capabilities) {
  return shellNavigationItems.filter((item) => capabilities[item.capability]);
}

export function getVisiblePlatformNavigation(capabilities: Capabilities) {
  if (!capabilities.canViewPlatformNavigation) return [];
  return platformNavigationGroups
    .filter((group) => capabilities[group.capability])
    .map((group) => ({ ...group, links: group.links.filter((link) => capabilities[link.capability]) }));
}
