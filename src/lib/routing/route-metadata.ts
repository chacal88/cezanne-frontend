import {
  candidateDetailRoutePaths,
  candidateOfferRoutePaths,
  candidateRejectRoutePaths,
  candidateScheduleRoutePaths,
  registeredRoutePaths,
  routeClasses,
  routeIds,
  type RegisteredRoutePath,
  type RouteClass,
  type RouteId,
} from './route-contracts';

export type RouteMetadata = {
  routeId: RouteId;
  routeClass: RouteClass;
  domain: string;
  module: string;
  directEntry: 'full' | 'shell-aware' | 'scoped';
  parentTarget?: string;
  routeFamily?: string;
  requiredCapability?: string;
  fallbackTarget?: string;
  implementationState?: 'foundation-placeholder' | 'implemented';
  mutationCapability?: string;
};

export type RouteMatch = {
  pattern: RegisteredRoutePath;
  metadata: RouteMetadata;
  params: Record<string, string>;
};

function buildCandidateDetailMetadata() {
  return Object.fromEntries(
    candidateDetailRoutePaths.map((path) => [
      path,
      {
        routeId: routeIds.candidateDetail,
        routeClass: routeClasses.pageWithStatefulUrl,
        domain: 'candidates',
        module: 'detail-hub',
        directEntry: 'full',
        parentTarget: path.includes('$jobId') ? '/job/$jobId' : '/dashboard',
        requiredCapability: 'canViewCandidateDetail',
        fallbackTarget: '/dashboard',
        implementationState: 'implemented',
      } satisfies RouteMetadata,
    ]),
  );
}

function buildCandidateTaskMetadata(paths: readonly RegisteredRoutePath[], routeId: RouteId, module: string) {
  return Object.fromEntries(
    paths.map((path, index) => [
      path,
      {
        routeId,
        routeClass: routeClasses.taskFlow,
        domain: 'candidates',
        module,
        directEntry: 'scoped',
        parentTarget: candidateDetailRoutePaths[index],
        requiredCapability: 'canOpenCandidateAction',
        fallbackTarget: candidateDetailRoutePaths[index],
        implementationState: 'implemented',
      } satisfies RouteMetadata,
    ]),
  );
}

export const routeMetadataRegistry = {
  '/': { routeId: routeIds.publicHome, routeClass: routeClasses.publicToken, domain: 'auth', module: 'public-entry', directEntry: 'full', requiredCapability: 'canStartSession', implementationState: 'implemented' },
  '/confirm-registration/$token': { routeId: routeIds.confirmRegistration, routeClass: routeClasses.publicToken, domain: 'auth', module: 'registration', directEntry: 'full', requiredCapability: 'canUseAuthTokenFlow', implementationState: 'implemented' },
  '/forgot-password': { routeId: routeIds.forgotPassword, routeClass: routeClasses.publicToken, domain: 'auth', module: 'password-recovery', directEntry: 'full', requiredCapability: 'canUseAuthTokenFlow', implementationState: 'implemented' },
  '/reset-password/$token': { routeId: routeIds.resetPassword, routeClass: routeClasses.publicToken, domain: 'auth', module: 'password-recovery', directEntry: 'full', requiredCapability: 'canUseAuthTokenFlow', implementationState: 'implemented' },
  '/register/$token': { routeId: routeIds.register, routeClass: routeClasses.publicToken, domain: 'auth', module: 'registration', directEntry: 'full', requiredCapability: 'canUseAuthTokenFlow', implementationState: 'implemented' },
  '/auth/cezanne/$tenantGuid': { routeId: routeIds.authCezanne, routeClass: routeClasses.publicToken, domain: 'auth', module: 'cezanne', directEntry: 'full', requiredCapability: 'canCompleteSsoCallback', implementationState: 'implemented' },
  '/auth/cezanne/callback': { routeId: routeIds.authCezanneCallback, routeClass: routeClasses.publicToken, domain: 'auth', module: 'cezanne', directEntry: 'full', requiredCapability: 'canCompleteSsoCallback', implementationState: 'implemented' },
  '/auth/saml': { routeId: routeIds.authSaml, routeClass: routeClasses.publicToken, domain: 'auth', module: 'sso', directEntry: 'full', requiredCapability: 'canCompleteSsoCallback', implementationState: 'implemented' },
  '/users/invite-token': { routeId: routeIds.inviteToken, routeClass: routeClasses.publicToken, domain: 'auth', module: 'invite', directEntry: 'full', requiredCapability: 'canUseAuthTokenFlow', implementationState: 'implemented' },
  '/shared/$jobOrRole/$token/$source': { routeId: routeIds.sharedJob, routeClass: routeClasses.publicToken, domain: 'public-external', module: 'shared-job-view', directEntry: 'full', requiredCapability: 'canOpenSharedJob', implementationState: 'implemented' },
  '/$jobOrRole/application/$token/$source': { routeId: routeIds.publicApplication, routeClass: routeClasses.publicToken, domain: 'public-external', module: 'public-application', directEntry: 'full', parentTarget: '/shared/$jobOrRole/$token/$source', requiredCapability: 'canSubmitPublicApplication', implementationState: 'implemented' },
  '/surveys/$surveyuuid/$jobuuid/$cvuuid': { routeId: routeIds.publicSurvey, routeClass: routeClasses.publicToken, domain: 'public-external', module: 'public-survey', directEntry: 'full', requiredCapability: 'canCompletePublicSurvey', implementationState: 'implemented' },
  '/chat/$token/$userId': { routeId: routeIds.externalTokenizedChat, routeClass: routeClasses.publicToken, domain: 'public-external', module: 'external-chat', directEntry: 'full', requiredCapability: 'canUseExternalTokenizedChat', implementationState: 'implemented' },
  '/job-requisition-approval': { routeId: routeIds.requisitionApproval, routeClass: routeClasses.publicToken, domain: 'public-external', module: 'requisition-approval', directEntry: 'full', requiredCapability: 'canApproveRequisitionByToken', implementationState: 'implemented' },
  '/job-requisition-forms/$formId': { routeId: routeIds.requisitionFormsDownload, routeClass: routeClasses.publicToken, domain: 'public-external', module: 'requisition-forms-download', directEntry: 'full', requiredCapability: 'canDownloadRequisitionFormsByToken', implementationState: 'implemented' },
  '/interview-request/$scheduleUuid/$cvToken': { routeId: routeIds.externalInterviewRequest, routeClass: routeClasses.publicToken, domain: 'public-external', module: 'external-review', directEntry: 'full', requiredCapability: 'canUseExternalReviewFlow', implementationState: 'implemented' },
  '/review-candidate/$code': { routeId: routeIds.externalReviewCandidate, routeClass: routeClasses.publicToken, domain: 'public-external', module: 'external-review', directEntry: 'full', requiredCapability: 'canUseExternalReviewFlow', implementationState: 'implemented' },
  '/interview-feedback/$code': { routeId: routeIds.externalInterviewFeedback, routeClass: routeClasses.publicToken, domain: 'public-external', module: 'external-review', directEntry: 'full', requiredCapability: 'canUseExternalReviewFlow', implementationState: 'implemented' },
  '/integration/cv/$token': { routeId: routeIds.integrationCvTokenEntry, routeClass: routeClasses.publicToken, domain: 'integrations', module: 'token-entry', directEntry: 'full', requiredCapability: 'canUseIntegrationTokenEntry', implementationState: 'implemented' },
  '/integration/cv/$token/$action': { routeId: routeIds.integrationCvTokenEntry, routeClass: routeClasses.publicToken, domain: 'integrations', module: 'token-entry', directEntry: 'full', requiredCapability: 'canUseIntegrationTokenEntry', implementationState: 'implemented' },
  '/integration/forms/$token': { routeId: routeIds.integrationFormsTokenEntry, routeClass: routeClasses.publicToken, domain: 'integrations', module: 'token-entry', directEntry: 'full', requiredCapability: 'canUseIntegrationTokenEntry', implementationState: 'implemented' },
  '/integration/job/$token': { routeId: routeIds.integrationJobTokenEntry, routeClass: routeClasses.publicToken, domain: 'integrations', module: 'token-entry', directEntry: 'full', requiredCapability: 'canUseIntegrationTokenEntry', implementationState: 'implemented' },
  '/integration/job/$token/$action': { routeId: routeIds.integrationJobTokenEntry, routeClass: routeClasses.publicToken, domain: 'integrations', module: 'token-entry', directEntry: 'full', requiredCapability: 'canUseIntegrationTokenEntry', implementationState: 'implemented' },
  '/dashboard': { routeId: routeIds.dashboard, routeClass: routeClasses.page, domain: 'dashboard', module: 'landing', directEntry: 'full', requiredCapability: 'canViewDashboard', fallbackTarget: '/access-denied', implementationState: 'implemented' },
  '/notifications': { routeId: routeIds.notifications, routeClass: routeClasses.page, domain: 'shell', module: 'notifications', directEntry: 'full', requiredCapability: 'canViewNotifications', fallbackTarget: '/dashboard', implementationState: 'implemented' },
  '/inbox': { routeId: routeIds.inbox, routeClass: routeClasses.pageWithStatefulUrl, domain: 'inbox', module: 'conversation-entry', directEntry: 'full', requiredCapability: 'canUseInbox', mutationCapability: 'canOpenConversation', fallbackTarget: '/dashboard', implementationState: 'implemented' },
  '/integrations': { routeId: routeIds.integrationsAdminIndex, routeClass: routeClasses.page, domain: 'integrations', module: 'provider-index', directEntry: 'full', requiredCapability: 'canViewIntegrations', fallbackTarget: '/dashboard', implementationState: 'implemented' },
  '/integrations/$providerId': { routeId: routeIds.integrationsAdminDetail, routeClass: routeClasses.page, domain: 'integrations', module: 'provider-detail', directEntry: 'full', parentTarget: '/integrations', requiredCapability: 'canManageIntegrationProvider', fallbackTarget: '/integrations', implementationState: 'implemented' },
  '/team': { routeId: routeIds.orgTeamIndex, routeClass: routeClasses.page, domain: 'team', module: 'org-team', directEntry: 'full', requiredCapability: 'canViewOrgTeam', fallbackTarget: '/dashboard', implementationState: 'implemented' },
  '/team/recruiters': { routeId: routeIds.orgRecruiterVisibility, routeClass: routeClasses.page, domain: 'team', module: 'recruiter-visibility', directEntry: 'full', parentTarget: '/team', requiredCapability: 'canViewRecruiterVisibility', fallbackTarget: '/dashboard', implementationState: 'implemented' },
  '/users/invite': { routeId: routeIds.orgInviteFoundation, routeClass: routeClasses.taskFlow, domain: 'team', module: 'invite-management', directEntry: 'full', parentTarget: '/team', requiredCapability: 'canManageOrgInvites', fallbackTarget: '/dashboard', implementationState: 'implemented' },
  '/users': { routeId: routeIds.platformUsers, routeClass: routeClasses.pageWithStatefulUrl, domain: 'sysadmin', module: 'users', directEntry: 'full', routeFamily: 'users-and-requests', requiredCapability: 'canManagePlatformUsers', fallbackTarget: '/dashboard', implementationState: 'implemented' },
  '/users/new': { routeId: routeIds.platformUserNew, routeClass: routeClasses.page, domain: 'sysadmin', module: 'users', directEntry: 'full', routeFamily: 'users-and-requests', parentTarget: '/users', requiredCapability: 'canManagePlatformUsers', fallbackTarget: '/dashboard', implementationState: 'implemented' },
  '/users/edit/$userId': { routeId: routeIds.platformUserEdit, routeClass: routeClasses.page, domain: 'sysadmin', module: 'users', directEntry: 'full', routeFamily: 'users-and-requests', parentTarget: '/users/$userId', requiredCapability: 'canManagePlatformUsers', fallbackTarget: '/dashboard', implementationState: 'implemented' },
  '/users/$userId': { routeId: routeIds.platformUserDetail, routeClass: routeClasses.page, domain: 'sysadmin', module: 'users', directEntry: 'full', routeFamily: 'users-and-requests', parentTarget: '/users', requiredCapability: 'canManagePlatformUsers', fallbackTarget: '/dashboard', implementationState: 'implemented' },
  '/favorites-request': { routeId: routeIds.platformFavoriteRequests, routeClass: routeClasses.pageWithStatefulUrl, domain: 'sysadmin', module: 'favorite-requests', directEntry: 'full', routeFamily: 'users-and-requests', requiredCapability: 'canManageFavoriteRequests', fallbackTarget: '/dashboard', implementationState: 'implemented' },
  '/favorites-request/$requestId': { routeId: routeIds.platformFavoriteRequestDetail, routeClass: routeClasses.page, domain: 'sysadmin', module: 'favorite-requests', directEntry: 'full', routeFamily: 'users-and-requests', parentTarget: '/favorites-request', requiredCapability: 'canManageFavoriteRequests', fallbackTarget: '/dashboard', implementationState: 'implemented' },
  '/favorites': { routeId: routeIds.orgFavoritesIndex, routeClass: routeClasses.page, domain: 'favorites', module: 'org-favorites', directEntry: 'full', requiredCapability: 'canViewOrgFavorites', fallbackTarget: '/dashboard', implementationState: 'implemented' },
  '/favorites/request': { routeId: routeIds.orgFavoriteRequestCreate, routeClass: routeClasses.taskFlow, domain: 'favorites', module: 'org-favorite-requests', directEntry: 'full', parentTarget: '/favorites', requiredCapability: 'canViewOrgFavorites', fallbackTarget: '/dashboard', implementationState: 'implemented' },
  '/favorites/request/$requestId': { routeId: routeIds.orgFavoriteRequestDetail, routeClass: routeClasses.taskFlow, domain: 'favorites', module: 'org-favorite-requests', directEntry: 'full', parentTarget: '/favorites', requiredCapability: 'canViewOrgFavorites', fallbackTarget: '/dashboard', implementationState: 'implemented' },
  '/favorites/$favoriteId': { routeId: routeIds.orgFavoritesDetail, routeClass: routeClasses.page, domain: 'favorites', module: 'org-favorites', directEntry: 'full', parentTarget: '/favorites', requiredCapability: 'canViewOrgFavorites', fallbackTarget: '/dashboard', implementationState: 'implemented' },
  '/billing': { routeId: routeIds.billingOverview, routeClass: routeClasses.page, domain: 'billing', module: 'overview', directEntry: 'full', requiredCapability: 'canViewBilling', fallbackTarget: '/dashboard', implementationState: 'implemented' },
  '/billing/upgrade': { routeId: routeIds.billingUpgrade, routeClass: routeClasses.taskFlow, domain: 'billing', module: 'upgrade', directEntry: 'full', parentTarget: '/billing', requiredCapability: 'canUpgradeSubscription', fallbackTarget: '/billing', implementationState: 'implemented' },
  '/billing/sms': { routeId: routeIds.billingSms, routeClass: routeClasses.taskFlow, domain: 'billing', module: 'sms', directEntry: 'full', parentTarget: '/billing', requiredCapability: 'canManageSmsBilling', fallbackTarget: '/billing', implementationState: 'implemented' },
  '/billing/card/$cardId': { routeId: routeIds.billingCard, routeClass: routeClasses.shellOverlay, domain: 'billing', module: 'cards', directEntry: 'shell-aware', parentTarget: '/billing', requiredCapability: 'canManageBillingCard', fallbackTarget: '/billing', implementationState: 'implemented' },
  '/jobmarket/$type': { routeId: routeIds.marketplaceList, routeClass: routeClasses.pageWithStatefulUrl, domain: 'marketplace', module: 'marketplace-list', directEntry: 'full', requiredCapability: 'canViewMarketplace', fallbackTarget: '/dashboard', implementationState: 'implemented' },
  '/report': { routeId: routeIds.reportsIndex, routeClass: routeClasses.page, domain: 'reports', module: 'report-index', directEntry: 'full', requiredCapability: 'canViewReports', fallbackTarget: '/dashboard', implementationState: 'implemented' },
  '/report/$family': { routeId: routeIds.reportsFamily, routeClass: routeClasses.page, domain: 'reports', module: 'report-family-pages', directEntry: 'full', parentTarget: '/report', requiredCapability: 'canViewReportFamily', fallbackTarget: '/report', implementationState: 'implemented' },
  '/hiring-company/report': { routeId: routeIds.reportsLegacyCompat, routeClass: routeClasses.page, domain: 'reports', module: 'report-index', directEntry: 'full', parentTarget: '/report', requiredCapability: 'canViewReports', fallbackTarget: '/report', implementationState: 'implemented' },
  '/hiring-company/report/$reportId': { routeId: routeIds.reportsLegacyCompat, routeClass: routeClasses.page, domain: 'reports', module: 'report-index', directEntry: 'full', parentTarget: '/report', requiredCapability: 'canViewReports', fallbackTarget: '/report', implementationState: 'implemented' },
  '/settings/careers-page': { routeId: routeIds.careersPageSettings, routeClass: routeClasses.page, domain: 'settings', module: 'careers-application', directEntry: 'full', parentTarget: '/parameters', routeFamily: 'careers-application-settings', requiredCapability: 'canManageCareersPage', fallbackTarget: '/access-denied', implementationState: 'implemented' },
  '/settings/hiring-flow': { routeId: routeIds.operationalSettingsHiringFlow, routeClass: routeClasses.page, domain: 'settings', module: 'hiring-flow', directEntry: 'full', requiredCapability: 'canManageHiringFlowSettings', fallbackTarget: '/access-denied', implementationState: 'implemented' },
  '/settings/custom-fields': { routeId: routeIds.operationalSettingsCustomFields, routeClass: routeClasses.page, domain: 'settings', module: 'custom-fields', directEntry: 'full', requiredCapability: 'canManageCustomFields', fallbackTarget: '/access-denied', implementationState: 'implemented' },
  '/settings/api-endpoints': { routeId: routeIds.settingsApiEndpoints, routeClass: routeClasses.page, domain: 'settings', module: 'api-endpoints', directEntry: 'full', requiredCapability: 'canManageApiEndpoints', fallbackTarget: '/dashboard', implementationState: 'implemented' },
  '/settings/forms-docs': { routeId: routeIds.settingsFormsDocsControls, routeClass: routeClasses.page, domain: 'settings', module: 'forms-docs-controls', directEntry: 'full', parentTarget: '/parameters', requiredCapability: 'canManageFormsDocsSettings', fallbackTarget: '/dashboard', implementationState: 'implemented' },
  '/parameters': { routeId: routeIds.operationalSettingsCompat, routeClass: routeClasses.pageWithStatefulUrl, domain: 'settings', module: 'settings-container', directEntry: 'full', requiredCapability: 'canEnterSettings', fallbackTarget: '/dashboard', implementationState: 'implemented' },
  '/parameters/$settingsId': { routeId: routeIds.operationalSettingsCompat, routeClass: routeClasses.pageWithStatefulUrl, domain: 'settings', module: 'settings-container', directEntry: 'full', requiredCapability: 'canEnterSettings', fallbackTarget: '/dashboard', implementationState: 'implemented' },
  '/parameters/$settingsId/$section': { routeId: routeIds.operationalSettingsCompat, routeClass: routeClasses.pageWithStatefulUrl, domain: 'settings', module: 'settings-container', directEntry: 'full', requiredCapability: 'canEnterSettings', fallbackTarget: '/dashboard', implementationState: 'implemented' },
  '/parameters/$settingsId/$section/$subsection': { routeId: routeIds.operationalSettingsCompat, routeClass: routeClasses.pageWithStatefulUrl, domain: 'settings', module: 'settings-container', directEntry: 'full', requiredCapability: 'canEnterSettings', fallbackTarget: '/dashboard', implementationState: 'implemented' },
  '/templates': { routeId: routeIds.templatesIndex, routeClass: routeClasses.page, domain: 'settings', module: 'templates', directEntry: 'full', requiredCapability: 'canManageTemplates', fallbackTarget: '/access-denied', implementationState: 'implemented' },
  '/templates/smart-questions': { routeId: routeIds.templatesSmartQuestions, routeClass: routeClasses.page, domain: 'settings', module: 'templates', directEntry: 'full', parentTarget: '/templates', requiredCapability: 'canManageTemplates', fallbackTarget: '/access-denied', implementationState: 'implemented' },
  '/templates/diversity-questions': { routeId: routeIds.templatesDiversityQuestions, routeClass: routeClasses.page, domain: 'settings', module: 'templates', directEntry: 'full', parentTarget: '/templates', requiredCapability: 'canManageTemplates', fallbackTarget: '/access-denied', implementationState: 'implemented' },
  '/templates/interview-scoring': { routeId: routeIds.templatesInterviewScoring, routeClass: routeClasses.page, domain: 'settings', module: 'templates', directEntry: 'full', parentTarget: '/templates', requiredCapability: 'canManageTemplates', fallbackTarget: '/access-denied', implementationState: 'implemented' },
  '/templates/$templateId': { routeId: routeIds.templatesDetail, routeClass: routeClasses.page, domain: 'settings', module: 'templates', directEntry: 'full', parentTarget: '/templates', requiredCapability: 'canManageTemplates', fallbackTarget: '/access-denied', implementationState: 'implemented' },
  '/reject-reasons': { routeId: routeIds.operationalSettingsRejectReasons, routeClass: routeClasses.page, domain: 'settings', module: 'reject-reasons', directEntry: 'full', requiredCapability: 'canManageRejectReasons', fallbackTarget: '/access-denied', implementationState: 'implemented' },
  '/settings/application-page': { routeId: routeIds.applicationPageSettings, routeClass: routeClasses.pageWithStatefulUrl, domain: 'settings', module: 'careers-application', directEntry: 'full', parentTarget: '/parameters', routeFamily: 'careers-application-settings', requiredCapability: 'canManageApplicationPage', fallbackTarget: '/access-denied', implementationState: 'implemented' },
  '/settings/application-page/$settingsId': { routeId: routeIds.applicationPageSettings, routeClass: routeClasses.pageWithStatefulUrl, domain: 'settings', module: 'careers-application', directEntry: 'full', parentTarget: '/settings/application-page', routeFamily: 'careers-application-settings', requiredCapability: 'canManageApplicationPage', fallbackTarget: '/access-denied', implementationState: 'implemented' },
  '/settings/application-page/$settingsId/$section': { routeId: routeIds.applicationPageSettings, routeClass: routeClasses.pageWithStatefulUrl, domain: 'settings', module: 'careers-application', directEntry: 'full', parentTarget: '/settings/application-page/$settingsId', routeFamily: 'careers-application-settings', requiredCapability: 'canManageApplicationPage', fallbackTarget: '/access-denied', implementationState: 'implemented' },
  '/settings/application-page/$settingsId/$section/$subsection': { routeId: routeIds.applicationPageSettings, routeClass: routeClasses.pageWithStatefulUrl, domain: 'settings', module: 'careers-application', directEntry: 'full', parentTarget: '/settings/application-page/$settingsId/$section', routeFamily: 'careers-application-settings', requiredCapability: 'canManageApplicationPage', fallbackTarget: '/access-denied', implementationState: 'implemented' },
  '/settings/job-listings': { routeId: routeIds.jobListingsSettings, routeClass: routeClasses.pageWithStatefulUrl, domain: 'settings', module: 'careers-application', directEntry: 'full', parentTarget: '/parameters', routeFamily: 'careers-application-settings', requiredCapability: 'canManageJobListings', fallbackTarget: '/access-denied', implementationState: 'implemented' },
  '/settings/job-listings/edit': { routeId: routeIds.jobListingEditor, routeClass: routeClasses.page, domain: 'settings', module: 'careers-application', directEntry: 'full', parentTarget: '/settings/job-listings', routeFamily: 'careers-application-settings', requiredCapability: 'canManageJobListings', fallbackTarget: '/access-denied', implementationState: 'implemented' },
  '/settings/job-listings/edit/$uuid': { routeId: routeIds.jobListingEditor, routeClass: routeClasses.page, domain: 'settings', module: 'careers-application', directEntry: 'full', parentTarget: '/settings/job-listings', routeFamily: 'careers-application-settings', requiredCapability: 'canManageJobListings', fallbackTarget: '/access-denied', implementationState: 'implemented' },
  '/hiring-companies': { routeId: routeIds.platformHiringCompanies, routeClass: routeClasses.page, domain: 'sysadmin', module: 'companies', directEntry: 'full', routeFamily: 'master-data', requiredCapability: 'canManageHiringCompanies', fallbackTarget: '/dashboard', implementationState: 'implemented' },
  '/hiring-companies/$companyId': { routeId: routeIds.platformHiringCompanyDetail, routeClass: routeClasses.page, domain: 'sysadmin', module: 'companies', directEntry: 'full', routeFamily: 'master-data', parentTarget: '/hiring-companies', requiredCapability: 'canManageHiringCompanies', fallbackTarget: '/dashboard', implementationState: 'implemented' },
  '/hiring-companies/edit/$companyId': { routeId: routeIds.platformHiringCompanyEdit, routeClass: routeClasses.page, domain: 'sysadmin', module: 'companies', directEntry: 'full', routeFamily: 'master-data', parentTarget: '/hiring-companies/$companyId', requiredCapability: 'canManageHiringCompanies', fallbackTarget: '/dashboard', implementationState: 'implemented' },
  '/hiring-company/$companyId/subscription': { routeId: routeIds.platformHiringCompanySubscription, routeClass: routeClasses.page, domain: 'sysadmin', module: 'companies', directEntry: 'full', routeFamily: 'master-data', parentTarget: '/hiring-companies/$companyId', requiredCapability: 'canManageHiringCompanies', mutationCapability: 'canManagePlatformSubscriptions', fallbackTarget: '/dashboard', implementationState: 'implemented' },
  '/recruitment-agencies': { routeId: routeIds.platformRecruitmentAgencies, routeClass: routeClasses.page, domain: 'sysadmin', module: 'agencies', directEntry: 'full', routeFamily: 'master-data', requiredCapability: 'canManageRecruitmentAgencies', fallbackTarget: '/dashboard', implementationState: 'implemented' },
  '/recruitment-agencies/$agencyId': { routeId: routeIds.platformRecruitmentAgencyDetail, routeClass: routeClasses.page, domain: 'sysadmin', module: 'agencies', directEntry: 'full', routeFamily: 'master-data', parentTarget: '/recruitment-agencies', requiredCapability: 'canManageRecruitmentAgencies', fallbackTarget: '/dashboard', implementationState: 'implemented' },
  '/recruitment-agencies/edit/$agencyId': { routeId: routeIds.platformRecruitmentAgencyEdit, routeClass: routeClasses.page, domain: 'sysadmin', module: 'agencies', directEntry: 'full', routeFamily: 'master-data', parentTarget: '/recruitment-agencies/$agencyId', requiredCapability: 'canManageRecruitmentAgencies', fallbackTarget: '/dashboard', implementationState: 'implemented' },
  '/subscriptions': { routeId: routeIds.platformSubscriptions, routeClass: routeClasses.page, domain: 'sysadmin', module: 'subscriptions', directEntry: 'full', routeFamily: 'master-data', requiredCapability: 'canManagePlatformSubscriptions', fallbackTarget: '/dashboard', implementationState: 'implemented' },
  '/subscriptions/$subscriptionId': { routeId: routeIds.platformSubscriptionDetail, routeClass: routeClasses.page, domain: 'sysadmin', module: 'subscriptions', directEntry: 'full', routeFamily: 'master-data', parentTarget: '/subscriptions', requiredCapability: 'canManagePlatformSubscriptions', fallbackTarget: '/dashboard', implementationState: 'implemented' },
  '/sectors': { routeId: routeIds.platformSectors, routeClass: routeClasses.pageWithStatefulUrl, domain: 'sysadmin', module: 'taxonomy', directEntry: 'full', routeFamily: 'taxonomy', requiredCapability: 'canManageTaxonomy', fallbackTarget: '/dashboard', implementationState: 'implemented' },
  '/sectors/$sectorId': { routeId: routeIds.platformSectorDetail, routeClass: routeClasses.page, domain: 'sysadmin', module: 'taxonomy', directEntry: 'full', routeFamily: 'taxonomy', parentTarget: '/sectors', requiredCapability: 'canManageTaxonomy', fallbackTarget: '/dashboard', implementationState: 'implemented' },
  '/sectors/$sectorId/subsectors': { routeId: routeIds.platformSectorSubsectors, routeClass: routeClasses.pageWithStatefulUrl, domain: 'sysadmin', module: 'taxonomy', directEntry: 'full', routeFamily: 'taxonomy', parentTarget: '/sectors/$sectorId', requiredCapability: 'canManageTaxonomy', fallbackTarget: '/dashboard', implementationState: 'implemented' },
  '/subsectors/$subsectorId': { routeId: routeIds.platformSubsectorDetail, routeClass: routeClasses.page, domain: 'sysadmin', module: 'taxonomy', directEntry: 'full', routeFamily: 'taxonomy', parentTarget: '/sectors', requiredCapability: 'canManageTaxonomy', fallbackTarget: '/dashboard', implementationState: 'implemented' },
  '/candidates-database': { routeId: routeIds.candidateDatabase, routeClass: routeClasses.pageWithStatefulUrl, domain: 'candidates', module: 'database-search', directEntry: 'full', requiredCapability: 'canViewCandidateDatabase', fallbackTarget: '/dashboard', implementationState: 'implemented' },
  '/jobs/$scope': { routeId: routeIds.jobsList, routeClass: routeClasses.pageWithStatefulUrl, domain: 'jobs', module: 'list', directEntry: 'full', routeFamily: 'jobs', requiredCapability: 'canViewJobsList', fallbackTarget: '/access-denied', implementationState: 'implemented' },
  '/jobs/manage': { routeId: routeIds.jobAuthoringCreate, routeClass: routeClasses.page, domain: 'jobs', module: 'authoring', directEntry: 'full', routeFamily: 'jobs', parentTarget: '/jobs/open', requiredCapability: 'canCreateJob', fallbackTarget: '/access-denied', implementationState: 'implemented', mutationCapability: 'canCreateJob' },
  '/jobs/manage/$jobId': { routeId: routeIds.jobAuthoringEdit, routeClass: routeClasses.page, domain: 'jobs', module: 'authoring', directEntry: 'full', routeFamily: 'jobs', parentTarget: '/job/$jobId', requiredCapability: 'canEditJob', fallbackTarget: '/access-denied', implementationState: 'implemented', mutationCapability: 'canEditJob' },
  '/job/$jobId': { routeId: routeIds.jobDetail, routeClass: routeClasses.pageWithStatefulUrl, domain: 'jobs', module: 'detail', directEntry: 'full', routeFamily: 'jobs', parentTarget: '/jobs/open', requiredCapability: 'canViewJobDetail', fallbackTarget: '/access-denied', implementationState: 'implemented' },
  '/job/$jobId/bid': { routeId: routeIds.jobBidCreate, routeClass: routeClasses.routedOverlay, domain: 'jobs', module: 'task-overlays', directEntry: 'scoped', routeFamily: 'jobs', parentTarget: '/job/$jobId', requiredCapability: 'canOpenJobTask', fallbackTarget: '/access-denied', implementationState: 'implemented' },
  '/job/$jobId/bid/$bidId': { routeId: routeIds.jobBidView, routeClass: routeClasses.routedOverlay, domain: 'jobs', module: 'task-overlays', directEntry: 'scoped', routeFamily: 'jobs', parentTarget: '/job/$jobId', requiredCapability: 'canOpenJobTask', fallbackTarget: '/access-denied', implementationState: 'implemented' },
  '/job/$jobId/cv': { routeId: routeIds.jobCvCreate, routeClass: routeClasses.routedOverlay, domain: 'jobs', module: 'task-overlays', directEntry: 'scoped', routeFamily: 'jobs', parentTarget: '/job/$jobId', requiredCapability: 'canOpenJobTask', fallbackTarget: '/access-denied', implementationState: 'implemented' },
  '/job/$jobId/cv/$candidateId': { routeId: routeIds.jobCvView, routeClass: routeClasses.routedOverlay, domain: 'jobs', module: 'task-overlays', directEntry: 'scoped', routeFamily: 'jobs', parentTarget: '/job/$jobId', requiredCapability: 'canOpenJobTask', fallbackTarget: '/access-denied', implementationState: 'implemented' },
  '/job/$jobId/cv-reject/$candidateId': { routeId: routeIds.jobCvReject, routeClass: routeClasses.taskFlow, domain: 'jobs', module: 'task-overlays', directEntry: 'scoped', routeFamily: 'jobs', parentTarget: '/job/$jobId', requiredCapability: 'canRejectCvFromJob', fallbackTarget: '/access-denied', implementationState: 'implemented', mutationCapability: 'canRejectCvFromJob' },
  '/job/$jobId/cv/$candidateId/schedule': { routeId: routeIds.jobSchedule, routeClass: routeClasses.taskFlow, domain: 'jobs', module: 'task-overlays', directEntry: 'scoped', routeFamily: 'jobs', parentTarget: '/job/$jobId', requiredCapability: 'canScheduleInterviewFromJob', fallbackTarget: '/access-denied', implementationState: 'implemented', mutationCapability: 'canScheduleInterviewFromJob' },
  '/build-requisition': { routeId: routeIds.requisitionBuild, routeClass: routeClasses.taskFlow, domain: 'jobs', module: 'workflow-state', directEntry: 'full', parentTarget: '/jobs/open', requiredCapability: 'canUseJobRequisitionBranching', fallbackTarget: '/dashboard', implementationState: 'implemented' },
  '/job-requisitions/$jobWorkflowUuid': { routeId: routeIds.requisitionWorkflow, routeClass: routeClasses.pageWithStatefulUrl, domain: 'jobs', module: 'workflow-state', directEntry: 'full', parentTarget: '/jobs/open', requiredCapability: 'canUseJobRequisitionBranching', fallbackTarget: '/dashboard', implementationState: 'implemented' },
  '/job-requisitions/$jobWorkflowUuid/$jobStageUuid': { routeId: routeIds.requisitionWorkflow, routeClass: routeClasses.pageWithStatefulUrl, domain: 'jobs', module: 'workflow-state', directEntry: 'full', parentTarget: '/job-requisitions/$jobWorkflowUuid', requiredCapability: 'canUseJobRequisitionBranching', fallbackTarget: '/dashboard', implementationState: 'implemented' },
  '/requisition-workflows': { routeId: routeIds.requisitionWorkflowsSettings, routeClass: routeClasses.page, domain: 'settings', module: 'hiring-flow', directEntry: 'full', parentTarget: '/settings/hiring-flow', requiredCapability: 'canManageHiringFlowSettings', fallbackTarget: '/dashboard', implementationState: 'implemented' },
  '/job/$jobId/cv/$candidateId/offer': { routeId: routeIds.jobOffer, routeClass: routeClasses.taskFlow, domain: 'jobs', module: 'task-overlays', directEntry: 'scoped', routeFamily: 'jobs', parentTarget: '/job/$jobId', requiredCapability: 'canCreateOfferFromJob', fallbackTarget: '/access-denied', implementationState: 'implemented', mutationCapability: 'canCreateOfferFromJob' },
  ...buildCandidateDetailMetadata(),
  ...buildCandidateTaskMetadata(candidateScheduleRoutePaths, routeIds.candidateSchedule, 'action-launchers'),
  ...buildCandidateTaskMetadata(candidateOfferRoutePaths, routeIds.candidateOffer, 'action-launchers'),
  ...buildCandidateTaskMetadata(candidateRejectRoutePaths, routeIds.candidateReject, 'action-launchers'),
  '/settings/user-settings': { routeId: routeIds.userSettings, routeClass: routeClasses.page, domain: 'settings', module: 'user-settings', directEntry: 'full', parentTarget: '/dashboard', requiredCapability: 'canViewUserSettings', fallbackTarget: '/dashboard', implementationState: 'implemented' },
  '/settings/company-settings': { routeId: routeIds.companySettings, routeClass: routeClasses.page, domain: 'settings', module: 'company-settings', directEntry: 'full', parentTarget: '/dashboard', requiredCapability: 'canManageCompanySettings', fallbackTarget: '/dashboard', implementationState: 'implemented' },
  '/settings/agency-settings': { routeId: routeIds.agencySettings, routeClass: routeClasses.page, domain: 'settings', module: 'agency-settings', directEntry: 'full', parentTarget: '/dashboard', requiredCapability: 'canManageAgencySettings', fallbackTarget: '/dashboard', implementationState: 'implemented' },
  '/user-profile': { routeId: routeIds.userProfile, routeClass: routeClasses.shellOverlay, domain: 'shell', module: 'account', directEntry: 'shell-aware', parentTarget: '/dashboard', requiredCapability: 'canOpenAccountArea', fallbackTarget: '/dashboard', implementationState: 'implemented' },
  '/hiring-company-profile': { routeId: routeIds.hiringCompanyProfile, routeClass: routeClasses.page, domain: 'shell', module: 'account', directEntry: 'full', parentTarget: '/dashboard', requiredCapability: 'canViewHiringCompanyProfile', fallbackTarget: '/dashboard', implementationState: 'implemented', mutationCapability: 'canManageCompanySettings' },
  '/recruitment-agency-profile': { routeId: routeIds.recruitmentAgencyProfile, routeClass: routeClasses.page, domain: 'shell', module: 'account', directEntry: 'full', parentTarget: '/dashboard', requiredCapability: 'canViewRecruitmentAgencyProfile', fallbackTarget: '/dashboard', implementationState: 'implemented', mutationCapability: 'canManageAgencySettings' },
  '/logout': { routeId: routeIds.logout, routeClass: routeClasses.page, domain: 'shell', module: 'session', directEntry: 'full', requiredCapability: 'canLogout', fallbackTarget: '/', implementationState: 'implemented' },
  '/session-lost': { routeId: routeIds.sessionLoss, routeClass: routeClasses.page, domain: 'shell', module: 'session', directEntry: 'full', requiredCapability: 'canStartSession', fallbackTarget: '/', implementationState: 'implemented' },
  '/access-denied': { routeId: routeIds.accessDenied, routeClass: routeClasses.page, domain: 'system', module: 'fallback', directEntry: 'full', implementationState: 'implemented' },
} as Record<RegisteredRoutePath, RouteMetadata>;

function escapeForRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function buildPatternRegex(pattern: RegisteredRoutePath) {
  const paramNames: string[] = [];
  const source = pattern
    .split('/')
    .map((segment) => {
      if (!segment) return '';
      if (segment.startsWith('$')) {
        paramNames.push(segment.slice(1));
        return '([^/]+)';
      }
      return escapeForRegex(segment);
    })
    .join('/');

  return {
    pattern,
    paramNames,
    regex: new RegExp(`^${source}$`),
  };
}

const compiledPatterns = registeredRoutePaths.map(buildPatternRegex);

export function matchRouteMetadata(pathname: string): RouteMatch | null {
  for (const compiled of compiledPatterns) {
    const result = compiled.regex.exec(pathname);
    if (!result) continue;

    const params = Object.fromEntries(compiled.paramNames.map((name, index) => [name, result[index + 1]]));
    return {
      pattern: compiled.pattern,
      metadata: routeMetadataRegistry[compiled.pattern],
      params,
    };
  }

  return null;
}

export function getRouteMetadata(pathname: string): RouteMetadata {
  return (
    matchRouteMetadata(pathname)?.metadata ?? {
      routeId: routeIds.accessDenied,
      routeClass: routeClasses.page,
      domain: 'system',
      module: 'fallback',
      directEntry: 'full',
    }
  );
}
