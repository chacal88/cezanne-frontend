import type { AccessContext, Capabilities } from '../../lib/access-control';

export type ShellNavigationItem = {
  labelKey: 'navigation.dashboard' | 'navigation.notifications' | 'navigation.inbox' | 'navigation.jobs';
  to: '/dashboard' | '/notifications' | '/inbox' | '/jobs/$scope';
  search?: { conversation?: string };
  params?: { scope: string };
  capability: keyof Pick<Capabilities, 'canViewDashboard' | 'canViewNotifications' | 'canUseInbox' | 'canViewJobsList'>;
};

export type AccountNavigationLink = {
  id: 'user-profile' | 'hiring-company-profile' | 'recruitment-agency-profile' | 'user-settings' | 'company-settings' | 'agency-settings' | 'logout';
  labelKey:
    | 'accountNavigation.links.userProfile'
    | 'accountNavigation.links.hiringCompanyProfile'
    | 'accountNavigation.links.recruitmentAgencyProfile'
    | 'accountNavigation.links.userSettings'
    | 'accountNavigation.links.companySettings'
    | 'accountNavigation.links.agencySettings'
    | 'accountNavigation.links.logout';
  to: '/user-profile' | '/hiring-company-profile' | '/recruitment-agency-profile' | '/settings/user-settings' | '/settings/company-settings' | '/settings/agency-settings' | '/logout';
  capability: keyof Pick<Capabilities, 'canOpenAccountArea' | 'canViewHiringCompanyProfile' | 'canViewRecruitmentAgencyProfile' | 'canViewUserSettings' | 'canManageCompanySettings' | 'canManageAgencySettings' | 'canLogout'>;
  organizationType?: AccessContext['organizationType'];
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

const accountNavigationLinks: AccountNavigationLink[] = [
  { id: 'user-profile', labelKey: 'accountNavigation.links.userProfile', to: '/user-profile', capability: 'canOpenAccountArea' },
  { id: 'hiring-company-profile', labelKey: 'accountNavigation.links.hiringCompanyProfile', to: '/hiring-company-profile', capability: 'canViewHiringCompanyProfile', organizationType: 'hc' },
  { id: 'recruitment-agency-profile', labelKey: 'accountNavigation.links.recruitmentAgencyProfile', to: '/recruitment-agency-profile', capability: 'canViewRecruitmentAgencyProfile', organizationType: 'ra' },
  { id: 'user-settings', labelKey: 'accountNavigation.links.userSettings', to: '/settings/user-settings', capability: 'canViewUserSettings' },
  { id: 'company-settings', labelKey: 'accountNavigation.links.companySettings', to: '/settings/company-settings', capability: 'canManageCompanySettings', organizationType: 'hc' },
  { id: 'agency-settings', labelKey: 'accountNavigation.links.agencySettings', to: '/settings/agency-settings', capability: 'canManageAgencySettings', organizationType: 'ra' },
  { id: 'logout', labelKey: 'accountNavigation.links.logout', to: '/logout', capability: 'canLogout' },
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

export function getVisibleAccountNavigation(capabilities: Capabilities, accessContext: AccessContext) {
  return accountNavigationLinks.filter((item) => capabilities[item.capability] && (!item.organizationType || item.organizationType === accessContext.organizationType));
}

export function getVisiblePlatformNavigation(capabilities: Capabilities) {
  if (!capabilities.canViewPlatformNavigation) return [];
  return platformNavigationGroups
    .filter((group) => capabilities[group.capability])
    .map((group) => ({ ...group, links: group.links.filter((link) => capabilities[link.capability]) }));
}
