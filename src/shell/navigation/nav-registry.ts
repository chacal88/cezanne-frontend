import type { AccessContext, Capabilities } from '../../lib/access-control';

export type ShellNavigationItem = {
  labelKey: string;
  to: string;
  search?: { conversation?: string };
  params?: Record<string, string>;
  capability: keyof Capabilities;
  implementationState: 'implemented' | 'partial' | 'resolver-only';
  icon?: string;
};

export type SidebarNavigationLink = ShellNavigationItem & {
  id: string;
  badgeKey?: string;
};

export type SidebarNavigationEntry =
  | (SidebarNavigationLink & { kind: 'link' })
  | {
      kind: 'group';
      id: string;
      labelKey: string;
      icon: string;
      capability: keyof Capabilities;
      implementationState: ShellNavigationItem['implementationState'];
      links: SidebarNavigationLink[];
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
  icon: string;
};

export type PlatformNavigationGroup = {
  labelKey: 'platformNavigation.masterData' | 'platformNavigation.usersAndRequests' | 'platformNavigation.taxonomy';
  navGroup: 'master-data' | 'users-and-requests' | 'taxonomy';
  capability: keyof Pick<Capabilities, 'canViewPlatformMasterDataNav' | 'canViewPlatformUsersAndRequestsNav' | 'canViewPlatformTaxonomyNav'>;
  links: PlatformNavigationLink[];
  implementationState: 'implemented-links' | 'planned-routes-hidden';
  icon: string;
};

const shellNavigationItems: ShellNavigationItem[] = [
  { labelKey: 'navigation.dashboard', to: '/dashboard', capability: 'canViewDashboard', implementationState: 'implemented', icon: 'tachometer-alt' },
  { labelKey: 'navigation.notifications', to: '/notifications', capability: 'canViewNotifications', implementationState: 'implemented', icon: 'bell' },
  { labelKey: 'navigation.inbox', to: '/inbox', capability: 'canUseInbox', implementationState: 'implemented', icon: 'envelope' },
  { labelKey: 'navigation.jobs', to: '/jobs/$scope', params: { scope: 'open' }, capability: 'canViewJobsList', implementationState: 'partial', icon: 'briefcase' },
  { labelKey: 'navigation.candidateDatabase', to: '/candidates-database', capability: 'canViewCandidateDatabase', implementationState: 'partial', icon: 'database' },
  { labelKey: 'navigation.integrations', to: '/integrations', capability: 'canViewIntegrations', implementationState: 'partial', icon: 'plug' },
  { labelKey: 'navigation.reports', to: '/report', capability: 'canViewReports', implementationState: 'partial', icon: 'chart-area' },
  { labelKey: 'navigation.team', to: '/team', capability: 'canViewOrgTeam', implementationState: 'partial', icon: 'user-tie' },
  { labelKey: 'navigation.favorites', to: '/favorites', capability: 'canViewOrgFavorites', implementationState: 'partial', icon: 'star' },
  { labelKey: 'navigation.billing', to: '/billing', capability: 'canViewBilling', implementationState: 'partial', icon: 'credit-card' },
  { labelKey: 'navigation.marketplace', to: '/jobmarket/$type', params: { type: 'fill' }, capability: 'canViewMarketplace', implementationState: 'partial', icon: 'briefcase' },
  { labelKey: 'navigation.settingsCareers', to: '/settings/careers-page', capability: 'canManageCareersPage', implementationState: 'partial', icon: 'laptop-code' },
  { labelKey: 'navigation.settingsHiringFlow', to: '/settings/hiring-flow', capability: 'canManageHiringFlowSettings', implementationState: 'partial', icon: 'arrows-alt-h' },
  { labelKey: 'navigation.settingsCustomFields', to: '/settings/custom-fields', capability: 'canManageCustomFields', implementationState: 'partial', icon: 'list-alt' },
  { labelKey: 'navigation.templates', to: '/templates', capability: 'canManageTemplates', implementationState: 'partial', icon: 'sliders-h' },
  { labelKey: 'navigation.rejectReasons', to: '/reject-reasons', capability: 'canManageRejectReasons', implementationState: 'partial', icon: 'user-times' },
  { labelKey: 'navigation.settingsApiEndpoints', to: '/settings/api-endpoints', capability: 'canManageApiEndpoints', implementationState: 'partial', icon: 'wifi' },
  { labelKey: 'navigation.settingsFormsDocs', to: '/settings/forms-docs', capability: 'canManageFormsDocsSettings', implementationState: 'partial', icon: 'file-alt' },
];

const sidebarNavigationEntries: SidebarNavigationEntry[] = [
  { kind: 'link', id: 'dashboard', labelKey: 'navigation.dashboard', to: '/dashboard', capability: 'canViewDashboard', implementationState: 'implemented', icon: 'tachometer-alt' },
  {
    kind: 'group',
    id: 'jobs',
    labelKey: 'navigation.jobs',
    icon: 'briefcase',
    capability: 'canViewJobsList',
    implementationState: 'partial',
    links: [
      { id: 'jobs-open', labelKey: 'navigation.jobsManage', to: '/jobs/$scope', params: { scope: 'open' }, capability: 'canViewJobsList', implementationState: 'partial', icon: 'briefcase' },
      { id: 'jobs-requisitions', labelKey: 'navigation.jobRequisitions', to: '/build-requisition', capability: 'canUseJobRequisitionBranching', implementationState: 'partial', icon: 'calendar-check' },
    ],
  },
  { kind: 'link', id: 'marketplace', labelKey: 'navigation.marketplace', to: '/jobmarket/$type', params: { type: 'fill' }, capability: 'canViewMarketplace', implementationState: 'partial', icon: 'briefcase' },
  { kind: 'link', id: 'inbox', labelKey: 'navigation.inbox', to: '/inbox', capability: 'canUseInbox', implementationState: 'implemented', icon: 'envelope' },
  { kind: 'link', id: 'candidate-database', labelKey: 'navigation.candidateDatabase', to: '/candidates-database', capability: 'canViewCandidateDatabase', implementationState: 'partial', icon: 'database' },
  {
    kind: 'group',
    id: 'templates',
    labelKey: 'navigation.templates',
    icon: 'sliders-h',
    capability: 'canManageTemplates',
    implementationState: 'partial',
    links: [
      { id: 'templates-email', labelKey: 'navigation.templateEmail', to: '/templates', capability: 'canManageTemplates', implementationState: 'partial', icon: 'mail-bulk' },
      { id: 'templates-smart', labelKey: 'navigation.templateSmartQuestions', to: '/templates/smart-questions', capability: 'canManageTemplates', implementationState: 'partial', icon: 'question-circle' },
      { id: 'templates-diversity', labelKey: 'navigation.templateDiversityQuestions', to: '/templates/diversity-questions', capability: 'canManageTemplates', implementationState: 'partial', icon: 'user-tag' },
      { id: 'templates-interview', labelKey: 'navigation.templateInterviewScoring', to: '/templates/interview-scoring', capability: 'canManageTemplates', implementationState: 'partial', icon: 'check-square' },
      { id: 'templates-forms-docs', labelKey: 'navigation.settingsFormsDocs', to: '/settings/forms-docs', capability: 'canManageFormsDocsSettings', implementationState: 'partial', icon: 'file-alt' },
      { id: 'templates-requisition-workflows', labelKey: 'navigation.jobRequisitions', to: '/requisition-workflows', capability: 'canUseJobRequisitionBranching', implementationState: 'partial', icon: 'calendar-check' },
      { id: 'templates-reject-reasons', labelKey: 'navigation.rejectReasons', to: '/reject-reasons', capability: 'canManageRejectReasons', implementationState: 'partial', icon: 'user-times' },
    ],
  },
  {
    kind: 'group',
    id: 'team',
    labelKey: 'navigation.team',
    icon: 'user-tie',
    capability: 'canViewOrgTeam',
    implementationState: 'partial',
    links: [
      { id: 'team-users', labelKey: 'navigation.users', to: '/team', capability: 'canViewOrgTeam', implementationState: 'partial', icon: 'users' },
      { id: 'team-favorites', labelKey: 'navigation.favorites', to: '/favorites', capability: 'canViewOrgFavorites', implementationState: 'partial', icon: 'star' },
      { id: 'team-recruiters', labelKey: 'navigation.recruiters', to: '/team/recruiters', capability: 'canViewRecruiterVisibility', implementationState: 'partial', icon: 'handshake' },
    ],
  },
  {
    kind: 'group',
    id: 'settings',
    labelKey: 'navigation.settings',
    icon: 'cogs',
    capability: 'canEnterSettings',
    implementationState: 'partial',
    links: [
      { id: 'settings-user', labelKey: 'navigation.userSettings', to: '/settings/user-settings', capability: 'canViewUserSettings', implementationState: 'partial', icon: 'user-cog' },
      { id: 'settings-company', labelKey: 'navigation.companySettings', to: '/settings/company-settings', capability: 'canManageCompanySettings', implementationState: 'partial', icon: 'cog' },
      { id: 'settings-agency', labelKey: 'navigation.agencySettings', to: '/settings/agency-settings', capability: 'canManageAgencySettings', implementationState: 'partial', icon: 'map-marker' },
      { id: 'settings-careers', labelKey: 'navigation.settingsCareers', to: '/settings/careers-page', capability: 'canManageCareersPage', implementationState: 'partial', icon: 'laptop-code' },
      { id: 'settings-application-page', labelKey: 'navigation.settingsApplicationPage', to: '/settings/application-page', capability: 'canManageApplicationPage', implementationState: 'partial', icon: 'pager' },
      { id: 'settings-job-listings', labelKey: 'navigation.settingsJobListings', to: '/settings/job-listings', capability: 'canManageJobListings', implementationState: 'partial', icon: 'pager' },
      { id: 'settings-hiring-flow', labelKey: 'navigation.settingsHiringFlow', to: '/settings/hiring-flow', capability: 'canManageHiringFlowSettings', implementationState: 'partial', icon: 'arrows-alt-h' },
      { id: 'settings-integrations', labelKey: 'navigation.integrations', to: '/integrations', capability: 'canViewIntegrations', implementationState: 'partial', icon: 'link' },
      { id: 'settings-api', labelKey: 'navigation.settingsApiEndpoints', to: '/settings/api-endpoints', capability: 'canManageApiEndpoints', implementationState: 'partial', icon: 'wifi' },
      { id: 'settings-custom-fields', labelKey: 'navigation.settingsCustomFields', to: '/settings/custom-fields', capability: 'canManageCustomFields', implementationState: 'partial', icon: 'list-alt' },
    ],
  },
  {
    kind: 'group',
    id: 'reports',
    labelKey: 'navigation.reports',
    icon: 'chart-area',
    capability: 'canViewReports',
    implementationState: 'partial',
    links: [
      { id: 'reports-candidates', labelKey: 'navigation.reportCandidates', to: '/report/$family', params: { family: 'candidates' }, capability: 'canViewReportFamily', implementationState: 'partial', icon: 'address-book' },
      { id: 'reports-diversity', labelKey: 'navigation.reportDiversity', to: '/report/$family', params: { family: 'diversity' }, capability: 'canViewReportFamily', implementationState: 'partial', icon: 'user-tag' },
      { id: 'reports-hiring-process', labelKey: 'navigation.reportHiringProcess', to: '/report/$family', params: { family: 'hiring-process' }, capability: 'canViewReportFamily', implementationState: 'partial', icon: 'check-square' },
      { id: 'reports-jobs', labelKey: 'navigation.reportJobs', to: '/report/$family', params: { family: 'jobs' }, capability: 'canViewReportFamily', implementationState: 'partial', icon: 'briefcase' },
      { id: 'reports-source', labelKey: 'navigation.reportSource', to: '/report/$family', params: { family: 'source' }, capability: 'canViewReportFamily', implementationState: 'partial', icon: 'sitemap' },
      { id: 'reports-teams', labelKey: 'navigation.reportTeams', to: '/report/$family', params: { family: 'teams' }, capability: 'canViewReportFamily', implementationState: 'partial', icon: 'users' },
    ],
  },
  { kind: 'link', id: 'billing', labelKey: 'navigation.billing', to: '/billing', capability: 'canViewBilling', implementationState: 'partial', icon: 'credit-card' },
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
    icon: 'building',
    links: [
      { labelKey: 'platformNavigation.links.hiringCompanies', to: '/hiring-companies', capability: 'canManageHiringCompanies', icon: 'building' },
      { labelKey: 'platformNavigation.links.recruitmentAgencies', to: '/recruitment-agencies', capability: 'canManageRecruitmentAgencies', icon: 'newspaper' },
      { labelKey: 'platformNavigation.links.subscriptions', to: '/subscriptions', capability: 'canManagePlatformSubscriptions', icon: 'ticket-alt' },
    ],
    implementationState: 'implemented-links',
  },
  {
    labelKey: 'platformNavigation.usersAndRequests',
    navGroup: 'users-and-requests',
    capability: 'canViewPlatformUsersAndRequestsNav',
    icon: 'user-tie',
    links: [
      { labelKey: 'platformNavigation.links.users', to: '/users', capability: 'canManagePlatformUsers', icon: 'user-tie' },
      { labelKey: 'platformNavigation.links.favoriteRequests', to: '/favorites-request', capability: 'canManageFavoriteRequests', icon: 'external-link-alt' },
    ],
    implementationState: 'implemented-links',
  },
  {
    labelKey: 'platformNavigation.taxonomy',
    navGroup: 'taxonomy',
    capability: 'canViewPlatformTaxonomyNav',
    icon: 'sitemap',
    links: [{ labelKey: 'platformNavigation.links.sectors', to: '/sectors', capability: 'canManageTaxonomy', icon: 'sitemap' }],
    implementationState: 'implemented-links',
  },
];

function hasVisibleLinks(entry: SidebarNavigationEntry, capabilities: Capabilities) {
  if (entry.kind === 'link') return capabilities[entry.capability];
  return capabilities[entry.capability] && entry.links.some((link) => capabilities[link.capability]);
}

export function getVisibleShellNavigation(capabilities: Capabilities) {
  return shellNavigationItems.filter((item) => capabilities[item.capability]);
}

export function getSidebarNavigation(capabilities: Capabilities) {
  return shellNavigationItems.filter((item) => capabilities[item.capability]);
}

export function getSidebarNavigationEntries(capabilities: Capabilities): SidebarNavigationEntry[] {
  return sidebarNavigationEntries
    .filter((entry) => hasVisibleLinks(entry, capabilities))
    .map((entry) => (entry.kind === 'link' ? entry : { ...entry, links: entry.links.filter((link) => capabilities[link.capability]) }));
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
