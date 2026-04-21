import { createRootRoute, createRoute, createRouter, Navigate, Outlet } from '@tanstack/react-router';
import { AccessBoundary, useCapabilities } from '../lib/access-control';
import { RouteTelemetryObserver } from '../lib/observability';
import { PublicShell } from '../shell/layout/public-shell';
import { AuthenticatedShell } from '../shell/layout/authenticated-shell';
import { DashboardPage } from '../domains/dashboard/dashboard-page';
import { NotificationsPage } from '../shell/notifications/notifications-page';
import { InboxPage, validateInboxSearch } from '../domains/inbox/inbox-page';
import { JobsListPage, validateJobsListScope, validateJobsListSearch } from '../domains/jobs/list/jobs-list-page';
import { JobAuthoringPage, validateJobAuthoringSearch } from '../domains/jobs/authoring/job-authoring-page';
import { JobDetailPage, validateJobDetailSearch } from '../domains/jobs/detail/job-detail-page';
import { JobTaskPage } from '../domains/jobs/task-overlays/job-task-page';
import { BuildRequisitionPage, JobRequisitionPage } from '../domains/jobs/requisition';
import { validateJobTaskSearch } from '../domains/jobs/task-overlays/job-task-context';
import { CandidateDatabasePage } from '../domains/candidates/database';
import { CandidateDetailRoutePage } from '../domains/candidates/detail-hub/candidate-detail-page';
import { CandidateTaskRoutePage } from '../domains/candidates/action-launchers/candidate-task-page';
import { validateCandidateDetailSearch, validateCandidateTaskSearch } from '../domains/candidates/support/routing';
import { SharedJobPage } from '../domains/public-external/shared-job/shared-job-page';
import { PublicApplicationPage } from '../domains/public-external/public-application/public-application-page';
import { PublicSurveyPage } from '../domains/public-external/public-survey/public-survey-page';
import { ExternalChatPage } from '../domains/public-external/external-chat/external-chat-page';
import { InterviewRequestPage } from '../domains/public-external/external-review/interview-request-page';
import { ReviewCandidatePage } from '../domains/public-external/external-review/review-candidate-page';
import { InterviewFeedbackPage } from '../domains/public-external/external-review/interview-feedback-page';
import { RequisitionApprovalPage, RequisitionFormsDownloadPage, validateRequisitionApprovalSearch, validateRequisitionFormsDownloadSearch } from '../domains/public-external/requisition-approval';
import { IntegrationCvTokenEntryPage, IntegrationFormsTokenEntryPage, IntegrationJobTokenEntryPage, IntegrationProviderDetailPage, IntegrationsIndexPage } from '../domains/integrations';
import { LegacyReportCompatibilityPage, ReportFamilyPage, ReportsIndexPage, isReportFamily } from '../domains/reports';
import { OrgInviteFoundationPage, OrgRecruiterVisibilityPage, OrgTeamIndexPage } from '../domains/team';
import { OrgFavoriteDetailPage, OrgFavoriteRequestPage, OrgFavoritesIndexPage } from '../domains/favorites';
import { BillingCardPage, BillingOverviewPage, BillingSmsPage, BillingUpgradePage } from '../domains/billing';
import { MarketplaceListPage } from '../domains/marketplace';
import { UserProfileShellOverlay } from '../shell/account/user-profile-overlay';
import { HiringCompanyProfilePage, RecruitmentAgencyProfilePage } from '../shell/account/organization-profile-page';
import { observability } from './observability';
import {
  AccessDeniedPage,
  CezanneAuthPage,
  CezanneCallbackPage,
  ConfirmRegistrationPage,
  ForgotPasswordPage,
  InviteTokenPage,
  LogoutPage,
  PublicHomePage,
  RegisterPage,
  ResetPasswordPage,
  SamlCallbackPage,
} from '../domains/auth/routes/public-pages';
import {
  candidateDetailRoutePaths,
  candidateOfferRoutePaths,
  candidateRejectRoutePaths,
  candidateScheduleRoutePaths,
} from '../lib/routing';
import { CareersPageSettingsPage } from '../domains/settings/careers-application/careers-page-settings-page';
import { ApplicationPageSettingsPage } from '../domains/settings/careers-application/application-page-settings-page';
import { JobListingsSettingsPage } from '../domains/settings/careers-application/job-listings-settings-page';
import { JobListingEditorPage } from '../domains/settings/careers-application/job-listing-editor-page';
import { HiringFlowSettingsPage } from '../domains/settings/hiring-flow/hiring-flow-settings-page';
import { CompanySubscriptionPage, MasterDataDetailPage, MasterDataEditPage, MasterDataListPage } from '../domains/sysadmin/master-data';
import { PlatformFavoriteRequestDetailPage, PlatformFavoriteRequestsPage, PlatformUserCreatePage, PlatformUserDetailPage, PlatformUserEditPage, PlatformUsersListPage } from '../domains/sysadmin/users-and-requests';
import { SectorDetailPage, SectorListPage, SubsectorDetailPage, SubsectorListPage } from '../domains/sysadmin/taxonomy';
import { CustomFieldsSettingsPage } from '../domains/settings/custom-fields/custom-fields-settings-page';
import { TemplatesSettingsPage } from '../domains/settings/templates/templates-settings-page';
import { RejectReasonsSettingsPage } from '../domains/settings/reject-reasons/reject-reasons-settings-page';
import { RequisitionWorkflowsPage } from '../domains/settings/requisition-workflows';
import { ApiEndpointsSettingsPage } from '../domains/settings/api-endpoints';
import { UserSettingsPage } from '../domains/settings/user-settings/user-settings-page';
import { CompanySettingsPage } from '../domains/settings/company-settings/company-settings-page';
import { AgencySettingsPage } from '../domains/settings/agency-settings/agency-settings-page';
import { FormsDocsSettingsPage } from '../domains/settings/forms-docs-controls';
import { getAvailableOperationalSettingsSubsections, resolveOperationalSettingsRoute } from '../domains/settings/operational';
import {
  validateApplicationPageParams,
  validateJobListingEditorSearch,
  validateJobListingsSearch,
} from '../domains/settings/careers-application';

const deniedFallback = <AccessDeniedPage />;
const dashboardFallback = <Navigate to="/dashboard" replace />;

const rootRoute = createRootRoute({
  component: () => (
    <>
      <Outlet />
      <RouteTelemetryObserver observability={observability} />
    </>
  ),
  notFoundComponent: AccessDeniedPage,
});

const publicLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'public-layout',
  component: () => (
    <PublicShell>
      <Outlet />
    </PublicShell>
  ),
});

const publicExternalLayoutRoute = createRoute({
  getParentRoute: () => publicLayoutRoute,
  id: 'public-external-layout',
  component: () => <Outlet />,
});

const shellLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'shell-layout',
  component: () => (
    <AccessBoundary capability="canEnterShell" fallback={deniedFallback}>
      <AuthenticatedShell>
        <Outlet />
      </AuthenticatedShell>
    </AccessBoundary>
  ),
});

const publicHomeRoute = createRoute({ getParentRoute: () => publicLayoutRoute, path: '/', component: PublicHomePage });
const confirmRegistrationRoute = createRoute({
  getParentRoute: () => publicLayoutRoute,
  path: '/confirm-registration/$token',
  component: () => {
    const { token } = confirmRegistrationRoute.useParams();
    return <ConfirmRegistrationPage token={token} />;
  },
});
const forgotPasswordRoute = createRoute({ getParentRoute: () => publicLayoutRoute, path: '/forgot-password', component: ForgotPasswordPage });
const resetPasswordRoute = createRoute({
  getParentRoute: () => publicLayoutRoute,
  path: '/reset-password/$token',
  component: () => {
    const { token } = resetPasswordRoute.useParams();
    return <ResetPasswordPage token={token} />;
  },
});
const registerRoute = createRoute({
  getParentRoute: () => publicLayoutRoute,
  path: '/register/$token',
  component: () => {
    const { token } = registerRoute.useParams();
    return <RegisterPage token={token} />;
  },
});
const cezanneAuthRoute = createRoute({
  getParentRoute: () => publicLayoutRoute,
  path: '/auth/cezanne/$tenantGuid',
  component: () => {
    const { tenantGuid } = cezanneAuthRoute.useParams();
    return <CezanneAuthPage tenantGuid={tenantGuid} />;
  },
});
const cezanneCallbackRoute = createRoute({
  getParentRoute: () => publicLayoutRoute,
  path: '/auth/cezanne/callback',
  validateSearch: (search) => ({ code: typeof search.code === 'string' ? search.code : undefined, error: typeof search.error === 'string' ? search.error : undefined }),
  component: () => {
    const { code, error } = cezanneCallbackRoute.useSearch();
    return <CezanneCallbackPage code={code} error={error} />;
  },
});
const samlCallbackRoute = createRoute({
  getParentRoute: () => publicLayoutRoute,
  path: '/auth/saml',
  validateSearch: (search) => ({ code: typeof search.code === 'string' ? search.code : undefined, error: typeof search.error === 'string' ? search.error : undefined }),
  component: () => {
    const { code, error } = samlCallbackRoute.useSearch();
    return <SamlCallbackPage code={code} error={error} />;
  },
});
const inviteTokenRoute = createRoute({
  getParentRoute: () => publicLayoutRoute,
  path: '/users/invite-token',
  validateSearch: (search) => ({ token: typeof search.token === 'string' ? search.token : undefined }),
  component: () => {
    const { token } = inviteTokenRoute.useSearch();
    return <InviteTokenPage token={token} />;
  },
});

const sharedJobRoute = createRoute({
  getParentRoute: () => publicExternalLayoutRoute,
  path: '/shared/$jobOrRole/$token/$source',
  component: () => {
    const { jobOrRole, token, source } = sharedJobRoute.useParams();
    return <SharedJobPage jobOrRole={jobOrRole} token={token} source={source} />;
  },
});

const publicApplicationRoute = createRoute({
  getParentRoute: () => publicExternalLayoutRoute,
  path: '/$jobOrRole/application/$token/$source',
  component: () => {
    const { jobOrRole, token, source } = publicApplicationRoute.useParams();
    return <PublicApplicationPage jobOrRole={jobOrRole} token={token} source={source} />;
  },
});

const publicSurveyRoute = createRoute({
  getParentRoute: () => publicExternalLayoutRoute,
  path: '/surveys/$surveyuuid/$jobuuid/$cvuuid',
  component: () => {
    const { surveyuuid, jobuuid, cvuuid } = publicSurveyRoute.useParams();
    return <PublicSurveyPage surveyuuid={surveyuuid} jobuuid={jobuuid} cvuuid={cvuuid} />;
  },
});

const externalChatRoute = createRoute({
  getParentRoute: () => publicExternalLayoutRoute,
  path: '/chat/$token/$userId',
  component: () => {
    const { token, userId } = externalChatRoute.useParams();
    return <ExternalChatPage token={token} userId={userId} />;
  },
});

const interviewRequestRoute = createRoute({
  getParentRoute: () => publicExternalLayoutRoute,
  path: '/interview-request/$scheduleUuid/$cvToken',
  component: () => {
    const { scheduleUuid, cvToken } = interviewRequestRoute.useParams();
    return <InterviewRequestPage scheduleUuid={scheduleUuid} cvToken={cvToken} />;
  },
});

const reviewCandidateRoute = createRoute({
  getParentRoute: () => publicExternalLayoutRoute,
  path: '/review-candidate/$code',
  component: () => {
    const { code } = reviewCandidateRoute.useParams();
    return <ReviewCandidatePage code={code} />;
  },
});

const interviewFeedbackRoute = createRoute({
  getParentRoute: () => publicExternalLayoutRoute,
  path: '/interview-feedback/$code',
  component: () => {
    const { code } = interviewFeedbackRoute.useParams();
    return <InterviewFeedbackPage code={code} />;
  },
});

const requisitionApprovalRoute = createRoute({
  getParentRoute: () => publicExternalLayoutRoute,
  path: '/job-requisition-approval',
  validateSearch: validateRequisitionApprovalSearch,
  component: () => {
    const { token } = requisitionApprovalRoute.useSearch();
    return <RequisitionApprovalPage token={token} />;
  },
});

const requisitionFormsDownloadRoute = createRoute({
  getParentRoute: () => publicExternalLayoutRoute,
  path: '/job-requisition-forms/$formId',
  validateSearch: validateRequisitionFormsDownloadSearch,
  component: () => {
    const { formId } = requisitionFormsDownloadRoute.useParams();
    const { token, download } = requisitionFormsDownloadRoute.useSearch();
    return <RequisitionFormsDownloadPage formId={formId} token={token} download={download} />;
  },
});

const integrationCvRoute = createRoute({
  getParentRoute: () => publicExternalLayoutRoute,
  path: '/integration/cv/$token',
  component: () => {
    const { token } = integrationCvRoute.useParams();
    return <IntegrationCvTokenEntryPage token={token} />;
  },
});

const integrationCvActionRoute = createRoute({
  getParentRoute: () => publicExternalLayoutRoute,
  path: '/integration/cv/$token/$action',
  component: () => {
    const { token, action } = integrationCvActionRoute.useParams();
    return <IntegrationCvTokenEntryPage token={token} action={action} />;
  },
});

const integrationFormsRoute = createRoute({
  getParentRoute: () => publicExternalLayoutRoute,
  path: '/integration/forms/$token',
  component: () => {
    const { token } = integrationFormsRoute.useParams();
    return <IntegrationFormsTokenEntryPage token={token} />;
  },
});

const integrationJobRoute = createRoute({
  getParentRoute: () => publicExternalLayoutRoute,
  path: '/integration/job/$token',
  component: () => {
    const { token } = integrationJobRoute.useParams();
    return <IntegrationJobTokenEntryPage token={token} />;
  },
});

const integrationJobActionRoute = createRoute({
  getParentRoute: () => publicExternalLayoutRoute,
  path: '/integration/job/$token/$action',
  component: () => {
    const { token, action } = integrationJobActionRoute.useParams();
    return <IntegrationJobTokenEntryPage token={token} action={action} />;
  },
});

const integrationsIndexRoute = createRoute({
  getParentRoute: () => shellLayoutRoute,
  path: '/integrations',
  component: () => (
    <AccessBoundary capability="canViewIntegrations" fallback={dashboardFallback}>
      <IntegrationsIndexPage />
    </AccessBoundary>
  ),
});

const integrationProviderDetailRoute = createRoute({
  getParentRoute: () => shellLayoutRoute,
  path: '/integrations/$providerId',
  component: () => {
    const { providerId } = integrationProviderDetailRoute.useParams();
    return (
      <AccessBoundary capability="canManageIntegrationProvider" fallback={dashboardFallback}>
        <IntegrationProviderDetailPage providerId={providerId} />
      </AccessBoundary>
    );
  },
});

const orgTeamIndexRoute = createRoute({
  getParentRoute: () => shellLayoutRoute,
  path: '/team',
  component: () => (
    <AccessBoundary capability="canViewOrgTeam" fallback={dashboardFallback}>
      <OrgTeamIndexPage />
    </AccessBoundary>
  ),
});

const orgRecruitersRoute = createRoute({
  getParentRoute: () => shellLayoutRoute,
  path: '/team/recruiters',
  component: () => (
    <AccessBoundary capability="canViewRecruiterVisibility" fallback={dashboardFallback}>
      <OrgRecruiterVisibilityPage />
    </AccessBoundary>
  ),
});

const orgInviteFoundationRoute = createRoute({
  getParentRoute: () => shellLayoutRoute,
  path: '/users/invite',
  component: () => (
    <AccessBoundary capability="canManageOrgInvites" fallback={dashboardFallback}>
      <OrgInviteFoundationPage />
    </AccessBoundary>
  ),
});

const orgFavoritesIndexRoute = createRoute({
  getParentRoute: () => shellLayoutRoute,
  path: '/favorites',
  component: () => (
    <AccessBoundary capability="canViewOrgFavorites" fallback={dashboardFallback}>
      <OrgFavoritesIndexPage />
    </AccessBoundary>
  ),
});

const orgFavoriteDetailRoute = createRoute({
  getParentRoute: () => shellLayoutRoute,
  path: '/favorites/$favoriteId',
  component: () => {
    const { favoriteId } = orgFavoriteDetailRoute.useParams();
    return (
      <AccessBoundary capability="canViewOrgFavorites" fallback={dashboardFallback}>
        <OrgFavoriteDetailPage favoriteId={favoriteId} />
      </AccessBoundary>
    );
  },
});

const orgFavoriteRequestCreateRoute = createRoute({
  getParentRoute: () => shellLayoutRoute,
  path: '/favorites/request',
  component: () => (
    <AccessBoundary capability="canViewOrgFavorites" fallback={dashboardFallback}>
      <OrgFavoriteRequestPage />
    </AccessBoundary>
  ),
});

const orgFavoriteRequestDetailRoute = createRoute({
  getParentRoute: () => shellLayoutRoute,
  path: '/favorites/request/$requestId',
  component: () => {
    const { requestId } = orgFavoriteRequestDetailRoute.useParams();
    return (
      <AccessBoundary capability="canViewOrgFavorites" fallback={dashboardFallback}>
        <OrgFavoriteRequestPage requestId={requestId} />
      </AccessBoundary>
    );
  },
});

const billingOverviewRoute = createRoute({
  getParentRoute: () => shellLayoutRoute,
  path: '/billing',
  component: () => (
    <AccessBoundary capability="canViewBilling" fallback={dashboardFallback}>
      <BillingOverviewPage />
    </AccessBoundary>
  ),
});

const billingUpgradeRoute = createRoute({
  getParentRoute: () => shellLayoutRoute,
  path: '/billing/upgrade',
  component: () => (
    <AccessBoundary capability="canUpgradeSubscription" fallback={<Navigate to="/billing" replace />}>
      <BillingUpgradePage />
    </AccessBoundary>
  ),
});

const billingSmsRoute = createRoute({
  getParentRoute: () => shellLayoutRoute,
  path: '/billing/sms',
  component: () => (
    <AccessBoundary capability="canManageSmsBilling" fallback={<Navigate to="/billing" replace />}>
      <BillingSmsPage />
    </AccessBoundary>
  ),
});

const billingCardRoute = createRoute({
  getParentRoute: () => shellLayoutRoute,
  path: '/billing/card/$cardId',
  component: () => {
    const { cardId } = billingCardRoute.useParams();
    return (
      <AccessBoundary capability="canManageBillingCard" fallback={<Navigate to="/billing" replace />}>
        <BillingCardPage cardId={cardId} />
      </AccessBoundary>
    );
  },
});

const marketplaceListRoute = createRoute({
  getParentRoute: () => shellLayoutRoute,
  path: '/jobmarket/$type',
  component: () => {
    const { type } = marketplaceListRoute.useParams();
    return (
      <AccessBoundary capability="canViewMarketplace" fallback={dashboardFallback}>
        <MarketplaceListPage type={type} />
      </AccessBoundary>
    );
  },
});

const reportsIndexRoute = createRoute({
  getParentRoute: () => shellLayoutRoute,
  path: '/report',
  component: () => (
    <AccessBoundary capability="canViewReports" fallback={dashboardFallback}>
      <ReportsIndexPage />
    </AccessBoundary>
  ),
});

const reportFamilyRoute = createRoute({
  getParentRoute: () => shellLayoutRoute,
  path: '/report/$family',
  component: () => {
    const { family } = reportFamilyRoute.useParams();
    if (!isReportFamily(family)) return <Navigate to="/report" replace />;
    return (
      <AccessBoundary capability="canViewReportFamily" fallback={<Navigate to="/report" replace />}>
        <ReportFamilyPage family={family} />
      </AccessBoundary>
    );
  },
});

const legacyReportIndexRoute = createRoute({
  getParentRoute: () => shellLayoutRoute,
  path: '/hiring-company/report',
  component: () => (
    <AccessBoundary capability="canViewReports" fallback={dashboardFallback}>
      <LegacyReportCompatibilityPage />
    </AccessBoundary>
  ),
});

const legacyReportDetailRoute = createRoute({
  getParentRoute: () => shellLayoutRoute,
  path: '/hiring-company/report/$reportId',
  component: () => {
    const { reportId } = legacyReportDetailRoute.useParams();
    return (
      <AccessBoundary capability="canViewReports" fallback={dashboardFallback}>
        <LegacyReportCompatibilityPage reportId={reportId} />
      </AccessBoundary>
    );
  },
});


function ParametersCompatibilityResolver({ settingsId, section, subsection }: { settingsId?: string; section?: string; subsection?: string }) {
  const capabilities = useCapabilities();
  const pathname = ['parameters', settingsId, section, subsection].filter(Boolean).join('/');
  const normalizedPathname = `/${pathname}`;
  const resolution = resolveOperationalSettingsRoute(normalizedPathname, getAvailableOperationalSettingsSubsections(capabilities));

  if (!resolution) {
    observability.telemetry.track({
      name: 'settings_compat_fallback_used',
      data: { routeId: 'settings.operational.compat', requestedSubsection: subsection ?? 'hiring-flow', fallbackTarget: '/dashboard', reason: 'no-available-subsection' },
    });
    return <Navigate to="/dashboard" replace />;
  }

  observability.telemetry.track({
    name: resolution.reason === 'matched' ? 'settings_compat_resolved' : 'settings_compat_fallback_used',
    data: {
      routeId: 'settings.operational.compat',
      requestedSubsection: subsection ?? 'hiring-flow',
      resolvedSubsection: resolution.active.subsectionId,
      fallbackTarget: resolution.reason === 'matched' ? undefined : resolution.active.path,
      reason: resolution.reason,
    },
  });

  return <Navigate to={resolution.active.path as '/settings/hiring-flow'} replace />;
}

const dashboardRoute = createRoute({
  getParentRoute: () => shellLayoutRoute,
  path: '/dashboard',
  component: () => (
    <AccessBoundary capability="canViewDashboard" fallback={deniedFallback}>
      <DashboardPage />
    </AccessBoundary>
  ),
});

const notificationsRoute = createRoute({
  getParentRoute: () => shellLayoutRoute,
  path: '/notifications',
  component: () => (
    <AccessBoundary capability="canViewNotifications" fallback={deniedFallback}>
      <NotificationsPage />
    </AccessBoundary>
  ),
});

const inboxRoute = createRoute({
  getParentRoute: () => shellLayoutRoute,
  path: '/inbox',
  validateSearch: validateInboxSearch,
  component: () => (
    <AccessBoundary capability="canUseInbox" fallback={deniedFallback}>
      <InboxPage />
    </AccessBoundary>
  ),
});

const careersPageSettingsRoute = createRoute({
  getParentRoute: () => shellLayoutRoute,
  path: '/settings/careers-page',
  component: () => (
    <AccessBoundary capability="canManageCareersPage" fallback={deniedFallback}>
      <CareersPageSettingsPage />
    </AccessBoundary>
  ),
});

const hiringFlowSettingsRoute = createRoute({
  getParentRoute: () => shellLayoutRoute,
  path: '/settings/hiring-flow',
  component: () => (
    <AccessBoundary capability="canManageHiringFlowSettings" fallback={deniedFallback}>
      <HiringFlowSettingsPage />
    </AccessBoundary>
  ),
});

const customFieldsSettingsRoute = createRoute({
  getParentRoute: () => shellLayoutRoute,
  path: '/settings/custom-fields',
  component: () => (
    <AccessBoundary capability="canManageCustomFields" fallback={deniedFallback}>
      <CustomFieldsSettingsPage />
    </AccessBoundary>
  ),
});

const apiEndpointsSettingsRoute = createRoute({
  getParentRoute: () => shellLayoutRoute,
  path: '/settings/api-endpoints',
  component: () => (
    <AccessBoundary capability="canManageApiEndpoints" fallback={dashboardFallback}>
      <ApiEndpointsSettingsPage />
    </AccessBoundary>
  ),
});

const formsDocsSettingsRoute = createRoute({
  getParentRoute: () => shellLayoutRoute,
  path: '/settings/forms-docs',
  component: () => (
    <AccessBoundary capability="canManageFormsDocsSettings" fallback={dashboardFallback}>
      <FormsDocsSettingsPage />
    </AccessBoundary>
  ),
});

const parametersCompatIndexRoute = createRoute({
  getParentRoute: () => shellLayoutRoute,
  path: '/parameters',
  component: () => (
    <AccessBoundary capability="canEnterSettings" fallback={dashboardFallback}>
      <ParametersCompatibilityResolver />
    </AccessBoundary>
  ),
});

const parametersCompatSettingsRoute = createRoute({
  getParentRoute: () => shellLayoutRoute,
  path: '/parameters/$settingsId',
  component: () => {
    const { settingsId } = parametersCompatSettingsRoute.useParams();
    return (
      <AccessBoundary capability="canEnterSettings" fallback={dashboardFallback}>
        <ParametersCompatibilityResolver settingsId={settingsId} />
      </AccessBoundary>
    );
  },
});

const parametersCompatSectionRoute = createRoute({
  getParentRoute: () => shellLayoutRoute,
  path: '/parameters/$settingsId/$section',
  component: () => {
    const { settingsId, section } = parametersCompatSectionRoute.useParams();
    return (
      <AccessBoundary capability="canEnterSettings" fallback={dashboardFallback}>
        <ParametersCompatibilityResolver settingsId={settingsId} section={section} />
      </AccessBoundary>
    );
  },
});

const parametersCompatSubsectionRoute = createRoute({
  getParentRoute: () => shellLayoutRoute,
  path: '/parameters/$settingsId/$section/$subsection',
  component: () => {
    const { settingsId, section, subsection } = parametersCompatSubsectionRoute.useParams();
    return (
      <AccessBoundary capability="canEnterSettings" fallback={dashboardFallback}>
        <ParametersCompatibilityResolver settingsId={settingsId} section={section} subsection={subsection} />
      </AccessBoundary>
    );
  },
});

const templatesIndexRoute = createRoute({
  getParentRoute: () => shellLayoutRoute,
  path: '/templates',
  component: () => (
    <AccessBoundary capability="canManageTemplates" fallback={deniedFallback}>
      <TemplatesSettingsPage routeState={{ kind: 'index' }} />
    </AccessBoundary>
  ),
});

const templatesSmartQuestionsRoute = createRoute({
  getParentRoute: () => shellLayoutRoute,
  path: '/templates/smart-questions',
  component: () => (
    <AccessBoundary capability="canManageTemplates" fallback={deniedFallback}>
      <TemplatesSettingsPage routeState={{ kind: 'smart-questions' }} />
    </AccessBoundary>
  ),
});

const templatesDiversityQuestionsRoute = createRoute({
  getParentRoute: () => shellLayoutRoute,
  path: '/templates/diversity-questions',
  component: () => (
    <AccessBoundary capability="canManageTemplates" fallback={deniedFallback}>
      <TemplatesSettingsPage routeState={{ kind: 'diversity-questions' }} />
    </AccessBoundary>
  ),
});

const templatesInterviewScoringRoute = createRoute({
  getParentRoute: () => shellLayoutRoute,
  path: '/templates/interview-scoring',
  component: () => (
    <AccessBoundary capability="canManageTemplates" fallback={deniedFallback}>
      <TemplatesSettingsPage routeState={{ kind: 'interview-scoring' }} />
    </AccessBoundary>
  ),
});

const templatesDetailRoute = createRoute({
  getParentRoute: () => shellLayoutRoute,
  path: '/templates/$templateId',
  component: () => {
    const { templateId } = templatesDetailRoute.useParams();
    return (
      <AccessBoundary capability="canManageTemplates" fallback={deniedFallback}>
        <TemplatesSettingsPage routeState={{ kind: 'detail', templateId }} />
      </AccessBoundary>
    );
  },
});

const rejectReasonsSettingsRoute = createRoute({
  getParentRoute: () => shellLayoutRoute,
  path: '/reject-reasons',
  component: () => (
    <AccessBoundary capability="canManageRejectReasons" fallback={deniedFallback}>
      <RejectReasonsSettingsPage />
    </AccessBoundary>
  ),
});

const applicationPageSettingsIndexRoute = createRoute({
  getParentRoute: () => shellLayoutRoute,
  path: '/settings/application-page',
  component: () => (
    <AccessBoundary capability="canManageApplicationPage" fallback={deniedFallback}>
      <ApplicationPageSettingsPage routeState={validateApplicationPageParams({})} />
    </AccessBoundary>
  ),
});

const applicationPageSettingsRoute = createRoute({
  getParentRoute: () => shellLayoutRoute,
  path: '/settings/application-page/$settingsId/$section/$subsection',
  params: {
    parse: (params) => validateApplicationPageParams(params),
    stringify: (params) => params,
  },
  component: () => {
    const params = applicationPageSettingsRoute.useParams();
    return (
      <AccessBoundary capability="canManageApplicationPage" fallback={deniedFallback}>
        <ApplicationPageSettingsPage routeState={params} />
      </AccessBoundary>
    );
  },
});

const applicationPageSettingsCompatRoute = createRoute({
  getParentRoute: () => shellLayoutRoute,
  path: '/settings/application-page/$settingsId',
  component: () => {
    const { settingsId } = applicationPageSettingsCompatRoute.useParams();
    const routeState = validateApplicationPageParams({ settingsId });
    return (
      <AccessBoundary capability="canManageApplicationPage" fallback={deniedFallback}>
        <ApplicationPageSettingsPage routeState={routeState} />
      </AccessBoundary>
    );
  },
});

const jobListingsSettingsRoute = createRoute({
  getParentRoute: () => shellLayoutRoute,
  path: '/settings/job-listings',
  validateSearch: validateJobListingsSearch,
  component: () => {
    const search = jobListingsSettingsRoute.useSearch();
    return (
      <AccessBoundary capability="canManageJobListings" fallback={deniedFallback}>
        <JobListingsSettingsPage routeState={search} />
      </AccessBoundary>
    );
  },
});

const jobListingEditorCreateRoute = createRoute({
  getParentRoute: () => shellLayoutRoute,
  path: '/settings/job-listings/edit',
  validateSearch: (search) => validateJobListingEditorSearch(search),
  component: () => {
    const search = jobListingEditorCreateRoute.useSearch();
    return (
      <AccessBoundary capability="canManageJobListings" fallback={deniedFallback}>
        <JobListingEditorPage routeState={search} />
      </AccessBoundary>
    );
  },
});

const jobListingEditorEditRoute = createRoute({
  getParentRoute: () => shellLayoutRoute,
  path: '/settings/job-listings/edit/$uuid',
  validateSearch: (search) => search,
  component: () => {
    const { uuid } = jobListingEditorEditRoute.useParams();
    const search = validateJobListingEditorSearch(jobListingEditorEditRoute.useSearch(), uuid);
    return (
      <AccessBoundary capability="canManageJobListings" fallback={deniedFallback}>
        <JobListingEditorPage routeState={search} />
      </AccessBoundary>
    );
  },
});

const hiringCompaniesRoute = createRoute({
  getParentRoute: () => shellLayoutRoute,
  path: '/hiring-companies',
  component: () => (
    <AccessBoundary capability="canManageHiringCompanies" fallback={dashboardFallback}>
      <MasterDataListPage entity="hiring-company" />
    </AccessBoundary>
  ),
});

const hiringCompanyDetailRoute = createRoute({
  getParentRoute: () => shellLayoutRoute,
  path: '/hiring-companies/$companyId',
  component: () => {
    const { companyId } = hiringCompanyDetailRoute.useParams();
    return (
      <AccessBoundary capability="canManageHiringCompanies" fallback={dashboardFallback}>
        <MasterDataDetailPage entity="hiring-company" id={companyId} />
      </AccessBoundary>
    );
  },
});

const hiringCompanyEditRoute = createRoute({
  getParentRoute: () => shellLayoutRoute,
  path: '/hiring-companies/edit/$companyId',
  component: () => {
    const { companyId } = hiringCompanyEditRoute.useParams();
    return (
      <AccessBoundary capability="canManageHiringCompanies" fallback={dashboardFallback}>
        <MasterDataEditPage entity="hiring-company" id={companyId} />
      </AccessBoundary>
    );
  },
});

const hiringCompanySubscriptionRoute = createRoute({
  getParentRoute: () => shellLayoutRoute,
  path: '/hiring-company/$companyId/subscription',
  component: () => {
    const { companyId } = hiringCompanySubscriptionRoute.useParams();
    return (
      <AccessBoundary capability="canManageHiringCompanies" fallback={dashboardFallback}>
        <CompanySubscriptionPage companyId={companyId} />
      </AccessBoundary>
    );
  },
});

const recruitmentAgenciesRoute = createRoute({
  getParentRoute: () => shellLayoutRoute,
  path: '/recruitment-agencies',
  component: () => (
    <AccessBoundary capability="canManageRecruitmentAgencies" fallback={dashboardFallback}>
      <MasterDataListPage entity="recruitment-agency" />
    </AccessBoundary>
  ),
});

const recruitmentAgencyDetailRoute = createRoute({
  getParentRoute: () => shellLayoutRoute,
  path: '/recruitment-agencies/$agencyId',
  component: () => {
    const { agencyId } = recruitmentAgencyDetailRoute.useParams();
    return (
      <AccessBoundary capability="canManageRecruitmentAgencies" fallback={dashboardFallback}>
        <MasterDataDetailPage entity="recruitment-agency" id={agencyId} />
      </AccessBoundary>
    );
  },
});

const recruitmentAgencyEditRoute = createRoute({
  getParentRoute: () => shellLayoutRoute,
  path: '/recruitment-agencies/edit/$agencyId',
  component: () => {
    const { agencyId } = recruitmentAgencyEditRoute.useParams();
    return (
      <AccessBoundary capability="canManageRecruitmentAgencies" fallback={dashboardFallback}>
        <MasterDataEditPage entity="recruitment-agency" id={agencyId} />
      </AccessBoundary>
    );
  },
});

const subscriptionsRoute = createRoute({
  getParentRoute: () => shellLayoutRoute,
  path: '/subscriptions',
  component: () => (
    <AccessBoundary capability="canManagePlatformSubscriptions" fallback={dashboardFallback}>
      <MasterDataListPage entity="subscription" />
    </AccessBoundary>
  ),
});

const subscriptionDetailRoute = createRoute({
  getParentRoute: () => shellLayoutRoute,
  path: '/subscriptions/$subscriptionId',
  component: () => {
    const { subscriptionId } = subscriptionDetailRoute.useParams();
    return (
      <AccessBoundary capability="canManagePlatformSubscriptions" fallback={dashboardFallback}>
        <MasterDataDetailPage entity="subscription" id={subscriptionId} />
      </AccessBoundary>
    );
  },
});

const platformUsersRoute = createRoute({
  getParentRoute: () => shellLayoutRoute,
  path: '/users',
  validateSearch: (search) => search,
  component: () => {
    const search = platformUsersRoute.useSearch();
    return (
      <AccessBoundary capability="canManagePlatformUsers" fallback={dashboardFallback}>
        <PlatformUsersListPage search={search} />
      </AccessBoundary>
    );
  },
});

const platformUserNewRoute = createRoute({
  getParentRoute: () => shellLayoutRoute,
  path: '/users/new',
  validateSearch: (search) => search,
  component: () => {
    const search = platformUserNewRoute.useSearch();
    return (
      <AccessBoundary capability="canManagePlatformUsers" fallback={dashboardFallback}>
        <PlatformUserCreatePage search={search} />
      </AccessBoundary>
    );
  },
});

const platformUserEditRoute = createRoute({
  getParentRoute: () => shellLayoutRoute,
  path: '/users/edit/$userId',
  validateSearch: (search) => search,
  component: () => {
    const { userId } = platformUserEditRoute.useParams();
    const search = platformUserEditRoute.useSearch();
    return (
      <AccessBoundary capability="canManagePlatformUsers" fallback={dashboardFallback}>
        <PlatformUserEditPage userId={userId} returnTo={typeof search.returnTo === 'string' ? search.returnTo : undefined} />
      </AccessBoundary>
    );
  },
});

const platformUserDetailRoute = createRoute({
  getParentRoute: () => shellLayoutRoute,
  path: '/users/$userId',
  validateSearch: (search) => search,
  component: () => {
    const { userId } = platformUserDetailRoute.useParams();
    const search = platformUserDetailRoute.useSearch();
    return (
      <AccessBoundary capability="canManagePlatformUsers" fallback={dashboardFallback}>
        <PlatformUserDetailPage userId={userId} returnTo={typeof search.returnTo === 'string' ? search.returnTo : undefined} />
      </AccessBoundary>
    );
  },
});

const platformFavoriteRequestsRoute = createRoute({
  getParentRoute: () => shellLayoutRoute,
  path: '/favorites-request',
  component: () => (
    <AccessBoundary capability="canManageFavoriteRequests" fallback={dashboardFallback}>
      <PlatformFavoriteRequestsPage />
    </AccessBoundary>
  ),
});

const platformFavoriteRequestDetailRoute = createRoute({
  getParentRoute: () => shellLayoutRoute,
  path: '/favorites-request/$requestId',
  component: () => {
    const { requestId } = platformFavoriteRequestDetailRoute.useParams();
    return (
      <AccessBoundary capability="canManageFavoriteRequests" fallback={dashboardFallback}>
        <PlatformFavoriteRequestDetailPage requestId={requestId} />
      </AccessBoundary>
    );
  },
});

const sectorsRoute = createRoute({
  getParentRoute: () => shellLayoutRoute,
  path: '/sectors',
  component: () => (
    <AccessBoundary capability="canManageTaxonomy" fallback={dashboardFallback}>
      <SectorListPage />
    </AccessBoundary>
  ),
});

const sectorDetailRoute = createRoute({
  getParentRoute: () => shellLayoutRoute,
  path: '/sectors/$sectorId',
  component: () => {
    const { sectorId } = sectorDetailRoute.useParams();
    return (
      <AccessBoundary capability="canManageTaxonomy" fallback={dashboardFallback}>
        <SectorDetailPage sectorId={sectorId} />
      </AccessBoundary>
    );
  },
});

const sectorSubsectorsRoute = createRoute({
  getParentRoute: () => shellLayoutRoute,
  path: '/sectors/$sectorId/subsectors',
  component: () => {
    const { sectorId } = sectorSubsectorsRoute.useParams();
    return (
      <AccessBoundary capability="canManageTaxonomy" fallback={dashboardFallback}>
        <SubsectorListPage sectorId={sectorId} />
      </AccessBoundary>
    );
  },
});

const subsectorDetailRoute = createRoute({
  getParentRoute: () => shellLayoutRoute,
  path: '/subsectors/$subsectorId',
  component: () => {
    const { subsectorId } = subsectorDetailRoute.useParams();
    return (
      <AccessBoundary capability="canManageTaxonomy" fallback={dashboardFallback}>
        <SubsectorDetailPage subsectorId={subsectorId} />
      </AccessBoundary>
    );
  },
});

const jobsListRoute = createRoute({
  getParentRoute: () => shellLayoutRoute,
  path: '/jobs/$scope',
  params: {
    parse: (params) => ({ scope: validateJobsListScope(params.scope) }),
    stringify: (params) => params,
  },
  validateSearch: validateJobsListSearch,
  component: () => {
    const { scope } = jobsListRoute.useParams();
    return (
      <AccessBoundary capability="canViewJobsList" fallback={deniedFallback}>
        <JobsListPage scope={scope} />
      </AccessBoundary>
    );
  },
});

const jobAuthoringCreateRoute = createRoute({
  getParentRoute: () => shellLayoutRoute,
  path: '/jobs/manage',
  validateSearch: validateJobAuthoringSearch,
  component: () => {
    const search = jobAuthoringCreateRoute.useSearch();
    return (
      <AccessBoundary capability="canCreateJob" fallback={deniedFallback}>
        <JobAuthoringPage resetWorkflow={search.resetWorkflow} copyFromJobId={search.copyFromJobId} saveState={search.saveState} />
      </AccessBoundary>
    );
  },
});

const jobAuthoringEditRoute = createRoute({
  getParentRoute: () => shellLayoutRoute,
  path: '/jobs/manage/$jobId',
  validateSearch: validateJobAuthoringSearch,
  component: () => {
    const { jobId } = jobAuthoringEditRoute.useParams();
    const search = jobAuthoringEditRoute.useSearch();
    return (
      <AccessBoundary capability="canEditJob" fallback={deniedFallback}>
        <JobAuthoringPage jobId={jobId} resetWorkflow={search.resetWorkflow} copyFromJobId={search.copyFromJobId} saveState={search.saveState} />
      </AccessBoundary>
    );
  },
});

const jobDetailRoute = createRoute({
  getParentRoute: () => shellLayoutRoute,
  path: '/job/$jobId',
  validateSearch: validateJobDetailSearch,
  component: () => {
    const { jobId } = jobDetailRoute.useParams();
    const { section, degradedSections, unavailable, transition, assignment } = jobDetailRoute.useSearch();
    return (
      <AccessBoundary capability="canViewJobDetail" fallback={deniedFallback}>
        <JobDetailPage jobId={jobId} section={section} degradedSections={degradedSections} unavailable={unavailable} transition={transition} assignment={assignment} />
      </AccessBoundary>
    );
  },
});

const jobBidCreateRoute = createRoute({
  getParentRoute: () => shellLayoutRoute,
  path: '/job/$jobId/bid',
  validateSearch: validateJobTaskSearch,
  component: () => {
    const { jobId } = jobBidCreateRoute.useParams();
    const search = jobBidCreateRoute.useSearch();
    return (
      <AccessBoundary capability="canOpenJobTask" fallback={deniedFallback}>
        <JobTaskPage kind="bid-create" jobId={jobId} parent={search.parent} section={search.section} outcome={search.outcome} parentRefresh={search.parentRefresh} />
      </AccessBoundary>
    );
  },
});

const jobBidViewRoute = createRoute({
  getParentRoute: () => shellLayoutRoute,
  path: '/job/$jobId/bid/$bidId',
  validateSearch: validateJobTaskSearch,
  component: () => {
    const { jobId, bidId } = jobBidViewRoute.useParams();
    const search = jobBidViewRoute.useSearch();
    return (
      <AccessBoundary capability="canOpenJobTask" fallback={deniedFallback}>
        <JobTaskPage kind="bid-view" jobId={jobId} bidId={bidId} parent={search.parent} section={search.section} outcome={search.outcome} parentRefresh={search.parentRefresh} />
      </AccessBoundary>
    );
  },
});

const jobCvCreateRoute = createRoute({
  getParentRoute: () => shellLayoutRoute,
  path: '/job/$jobId/cv',
  validateSearch: validateJobTaskSearch,
  component: () => {
    const { jobId } = jobCvCreateRoute.useParams();
    const search = jobCvCreateRoute.useSearch();
    return (
      <AccessBoundary capability="canOpenJobTask" fallback={deniedFallback}>
        <JobTaskPage kind="cv-create" jobId={jobId} parent={search.parent} section={search.section} outcome={search.outcome} parentRefresh={search.parentRefresh} />
      </AccessBoundary>
    );
  },
});

const jobCvViewRoute = createRoute({
  getParentRoute: () => shellLayoutRoute,
  path: '/job/$jobId/cv/$candidateId',
  validateSearch: validateJobTaskSearch,
  component: () => {
    const { jobId, candidateId } = jobCvViewRoute.useParams();
    const search = jobCvViewRoute.useSearch();
    return (
      <AccessBoundary capability="canOpenJobTask" fallback={deniedFallback}>
        <JobTaskPage kind="cv-view" jobId={jobId} candidateId={candidateId} parent={search.parent} section={search.section} outcome={search.outcome} parentRefresh={search.parentRefresh} />
      </AccessBoundary>
    );
  },
});

const jobCvRejectRoute = createRoute({
  getParentRoute: () => shellLayoutRoute,
  path: '/job/$jobId/cv-reject/$candidateId',
  validateSearch: validateJobTaskSearch,
  component: () => {
    const { jobId, candidateId } = jobCvRejectRoute.useParams();
    const search = jobCvRejectRoute.useSearch();
    return (
      <AccessBoundary capability="canRejectCvFromJob" fallback={deniedFallback}>
        <JobTaskPage kind="reject" jobId={jobId} candidateId={candidateId} parent={search.parent} section={search.section} outcome={search.outcome} parentRefresh={search.parentRefresh} />
      </AccessBoundary>
    );
  },
});

const jobScheduleRoute = createRoute({
  getParentRoute: () => shellLayoutRoute,
  path: '/job/$jobId/cv/$candidateId/schedule',
  validateSearch: validateJobTaskSearch,
  component: () => {
    const { jobId, candidateId } = jobScheduleRoute.useParams();
    const search = jobScheduleRoute.useSearch();
    return (
      <AccessBoundary capability="canScheduleInterviewFromJob" fallback={deniedFallback}>
        <JobTaskPage kind="schedule" jobId={jobId} candidateId={candidateId} parent={search.parent} section={search.section} outcome={search.outcome} parentRefresh={search.parentRefresh} />
      </AccessBoundary>
    );
  },
});

const jobOfferRoute = createRoute({
  getParentRoute: () => shellLayoutRoute,
  path: '/job/$jobId/cv/$candidateId/offer',
  validateSearch: validateJobTaskSearch,
  component: () => {
    const { jobId, candidateId } = jobOfferRoute.useParams();
    const search = jobOfferRoute.useSearch();
    return (
      <AccessBoundary capability="canCreateOfferFromJob" fallback={deniedFallback}>
        <JobTaskPage kind="offer" jobId={jobId} candidateId={candidateId} parent={search.parent} section={search.section} outcome={search.outcome} parentRefresh={search.parentRefresh} />
      </AccessBoundary>
    );
  },
});


const buildRequisitionRoute = createRoute({
  getParentRoute: () => shellLayoutRoute,
  path: '/build-requisition',
  component: () => (
    <AccessBoundary capability="canUseJobRequisitionBranching" fallback={dashboardFallback}>
      <BuildRequisitionPage />
    </AccessBoundary>
  ),
});

const jobRequisitionWorkflowRoute = createRoute({
  getParentRoute: () => shellLayoutRoute,
  path: '/job-requisitions/$jobWorkflowUuid',
  component: () => {
    const { jobWorkflowUuid } = jobRequisitionWorkflowRoute.useParams();
    return (
      <AccessBoundary capability="canUseJobRequisitionBranching" fallback={dashboardFallback}>
        <JobRequisitionPage workflowUuid={jobWorkflowUuid} />
      </AccessBoundary>
    );
  },
});

const jobRequisitionStageRoute = createRoute({
  getParentRoute: () => shellLayoutRoute,
  path: '/job-requisitions/$jobWorkflowUuid/$jobStageUuid',
  component: () => {
    const { jobWorkflowUuid, jobStageUuid } = jobRequisitionStageRoute.useParams();
    return (
      <AccessBoundary capability="canUseJobRequisitionBranching" fallback={dashboardFallback}>
        <JobRequisitionPage workflowUuid={jobWorkflowUuid} stageUuid={jobStageUuid} />
      </AccessBoundary>
    );
  },
});

const requisitionWorkflowsRoute = createRoute({
  getParentRoute: () => shellLayoutRoute,
  path: '/requisition-workflows',
  component: () => (
    <AccessBoundary capability="canManageHiringFlowSettings" fallback={dashboardFallback}>
      <RequisitionWorkflowsPage />
    </AccessBoundary>
  ),
});

const candidateDatabaseRoute = createRoute({
  getParentRoute: () => shellLayoutRoute,
  path: '/candidates-database',
  validateSearch: (search) => search,
  component: () => (
    <AccessBoundary capability="canViewCandidateDatabase" fallback={dashboardFallback}>
      <CandidateDatabasePage />
    </AccessBoundary>
  ),
});

const candidateDatabaseOldRoute = createRoute({
  getParentRoute: () => shellLayoutRoute,
  path: '/candidates-old',
  validateSearch: (search) => search,
  component: () => (
    <AccessBoundary capability="canViewCandidateDatabase" fallback={dashboardFallback}>
      <CandidateDatabasePage />
    </AccessBoundary>
  ),
});

const candidateDatabaseNewRoute = createRoute({
  getParentRoute: () => shellLayoutRoute,
  path: '/candidates-new',
  validateSearch: (search) => search,
  component: () => (
    <AccessBoundary capability="canViewCandidateDatabase" fallback={dashboardFallback}>
      <CandidateDatabasePage />
    </AccessBoundary>
  ),
});

const candidateDetailRoutes = candidateDetailRoutePaths.map((path) =>
  createRoute({
    getParentRoute: () => shellLayoutRoute,
    path,
    validateSearch: validateCandidateDetailSearch,
    component: () => (
      <AccessBoundary capability="canViewCandidateDetail" fallback={deniedFallback}>
        <CandidateDetailRoutePage />
      </AccessBoundary>
    ),
  }),
);

const candidateScheduleRoutes = candidateScheduleRoutePaths.map((path) =>
  createRoute({
    getParentRoute: () => shellLayoutRoute,
    path,
    validateSearch: validateCandidateTaskSearch,
    component: () => (
      <AccessBoundary capability="canScheduleInterviewFromCandidate" fallback={deniedFallback}>
        <CandidateTaskRoutePage />
      </AccessBoundary>
    ),
  }),
);

const candidateOfferRoutes = candidateOfferRoutePaths.map((path) =>
  createRoute({
    getParentRoute: () => shellLayoutRoute,
    path,
    validateSearch: validateCandidateTaskSearch,
    component: () => (
      <AccessBoundary capability="canCreateOfferFromCandidate" fallback={deniedFallback}>
        <CandidateTaskRoutePage />
      </AccessBoundary>
    ),
  }),
);

const candidateRejectRoutes = candidateRejectRoutePaths.map((path) =>
  createRoute({
    getParentRoute: () => shellLayoutRoute,
    path,
    validateSearch: validateCandidateTaskSearch,
    component: () => (
      <AccessBoundary capability="canRejectCandidate" fallback={deniedFallback}>
        <CandidateTaskRoutePage />
      </AccessBoundary>
    ),
  }),
);

const userSettingsRoute = createRoute({
  getParentRoute: () => shellLayoutRoute,
  path: '/settings/user-settings',
  component: () => (
    <AccessBoundary capability="canViewUserSettings" fallback={deniedFallback}>
      <UserSettingsPage />
    </AccessBoundary>
  ),
});

const companySettingsRoute = createRoute({
  getParentRoute: () => shellLayoutRoute,
  path: '/settings/company-settings',
  component: () => (
    <AccessBoundary capability="canManageCompanySettings" fallback={dashboardFallback}>
      <CompanySettingsPage />
    </AccessBoundary>
  ),
});

const agencySettingsRoute = createRoute({
  getParentRoute: () => shellLayoutRoute,
  path: '/settings/agency-settings',
  component: () => (
    <AccessBoundary capability="canManageAgencySettings" fallback={dashboardFallback}>
      <AgencySettingsPage />
    </AccessBoundary>
  ),
});

const userProfileRoute = createRoute({
  getParentRoute: () => shellLayoutRoute,
  path: '/user-profile',
  component: () => (
    <AccessBoundary capability="canOpenAccountArea" fallback={deniedFallback}>
      <UserProfileShellOverlay />
    </AccessBoundary>
  ),
});

const hiringCompanyProfileRoute = createRoute({
  getParentRoute: () => shellLayoutRoute,
  path: '/hiring-company-profile',
  component: () => (
    <AccessBoundary capability="canViewHiringCompanyProfile" fallback={dashboardFallback}>
      <HiringCompanyProfilePage />
    </AccessBoundary>
  ),
});

const recruitmentAgencyProfileRoute = createRoute({
  getParentRoute: () => shellLayoutRoute,
  path: '/recruitment-agency-profile',
  component: () => (
    <AccessBoundary capability="canViewRecruitmentAgencyProfile" fallback={dashboardFallback}>
      <RecruitmentAgencyProfilePage />
    </AccessBoundary>
  ),
});
const logoutRoute = createRoute({ getParentRoute: () => shellLayoutRoute, path: '/logout', component: LogoutPage });
const accessDeniedRoute = createRoute({ getParentRoute: () => rootRoute, path: '/access-denied', component: AccessDeniedPage });

const routeTree = rootRoute.addChildren([
  publicLayoutRoute.addChildren([
    publicHomeRoute,
    confirmRegistrationRoute,
    forgotPasswordRoute,
    resetPasswordRoute,
    registerRoute,
    cezanneAuthRoute,
    cezanneCallbackRoute,
    samlCallbackRoute,
    inviteTokenRoute,
    publicExternalLayoutRoute.addChildren([
      sharedJobRoute,
      publicApplicationRoute,
  publicSurveyRoute,
  externalChatRoute,
  interviewRequestRoute,
      reviewCandidateRoute,
      interviewFeedbackRoute,
      requisitionApprovalRoute,
      requisitionFormsDownloadRoute,
      integrationCvRoute,
      integrationCvActionRoute,
      integrationFormsRoute,
      integrationJobRoute,
      integrationJobActionRoute,
    ]),
  ]),
  shellLayoutRoute.addChildren([
    dashboardRoute,
    integrationsIndexRoute,
    integrationProviderDetailRoute,
    orgTeamIndexRoute,
    orgRecruitersRoute,
    orgInviteFoundationRoute,
    orgFavoritesIndexRoute,
    orgFavoriteRequestCreateRoute,
    orgFavoriteRequestDetailRoute,
    orgFavoriteDetailRoute,
    billingOverviewRoute,
    billingUpgradeRoute,
    billingSmsRoute,
    billingCardRoute,
    marketplaceListRoute,
    reportsIndexRoute,
    reportFamilyRoute,
    legacyReportIndexRoute,
    legacyReportDetailRoute,
    notificationsRoute,
    inboxRoute,
    careersPageSettingsRoute,
    hiringFlowSettingsRoute,
    customFieldsSettingsRoute,
    apiEndpointsSettingsRoute,
    formsDocsSettingsRoute,
    parametersCompatIndexRoute,
    parametersCompatSettingsRoute,
    parametersCompatSectionRoute,
    parametersCompatSubsectionRoute,
    templatesIndexRoute,
    templatesSmartQuestionsRoute,
    templatesDiversityQuestionsRoute,
    templatesInterviewScoringRoute,
    templatesDetailRoute,
    rejectReasonsSettingsRoute,
    applicationPageSettingsIndexRoute,
    applicationPageSettingsCompatRoute,
    applicationPageSettingsRoute,
    jobListingsSettingsRoute,
    jobListingEditorCreateRoute,
    hiringCompaniesRoute,
    hiringCompanyDetailRoute,
    hiringCompanyEditRoute,
    hiringCompanySubscriptionRoute,
    recruitmentAgenciesRoute,
    recruitmentAgencyDetailRoute,
    recruitmentAgencyEditRoute,
    subscriptionsRoute,
    subscriptionDetailRoute,
    platformUsersRoute,
    platformUserNewRoute,
    platformUserEditRoute,
    platformUserDetailRoute,
    platformFavoriteRequestsRoute,
    platformFavoriteRequestDetailRoute,
    sectorsRoute,
    sectorDetailRoute,
    sectorSubsectorsRoute,
    subsectorDetailRoute,
    jobListingEditorEditRoute,
    jobsListRoute,
    jobAuthoringCreateRoute,
    jobAuthoringEditRoute,
    jobDetailRoute,
    jobBidCreateRoute,
    jobBidViewRoute,
    jobCvCreateRoute,
    jobCvViewRoute,
    jobCvRejectRoute,
    jobScheduleRoute,
    jobOfferRoute,
    buildRequisitionRoute,
    jobRequisitionWorkflowRoute,
    jobRequisitionStageRoute,
    requisitionWorkflowsRoute,
    candidateDatabaseRoute,
    candidateDatabaseOldRoute,
    candidateDatabaseNewRoute,
    ...candidateDetailRoutes,
    ...candidateScheduleRoutes,
    ...candidateOfferRoutes,
    ...candidateRejectRoutes,
    userSettingsRoute,
    companySettingsRoute,
    agencySettingsRoute,
    userProfileRoute,
    hiringCompanyProfileRoute,
    recruitmentAgencyProfileRoute,
    logoutRoute,
  ]),
  accessDeniedRoute,
]);

export const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
