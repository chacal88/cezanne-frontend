import { describe, expect, it } from 'vitest';
import { getRouteMetadata, matchRouteMetadata, routeMetadataRegistry } from './route-metadata';
import { registeredRoutePaths } from './route-contracts';

describe('route metadata registry', () => {
  it('covers every registered route path', () => {
    for (const path of registeredRoutePaths) {
      expect(routeMetadataRegistry[path], path).toBeDefined();
    }
  });

  it('registers API endpoints as a settings-owned route', () => {
    expect(getRouteMetadata('/settings/api-endpoints')).toMatchObject({
      routeId: 'settings.api-endpoints',
      domain: 'settings',
      module: 'api-endpoints',
      requiredCapability: 'canManageApiEndpoints',
      fallbackTarget: '/dashboard',
      implementationState: 'implemented',
    });
  });



  it('marks candidate closeout routes as implemented with explicit capabilities', () => {
    expect(getRouteMetadata('/candidates-database')).toMatchObject({
      domain: 'candidates',
      module: 'database-search',
      requiredCapability: 'canViewCandidateDatabase',
      implementationState: 'implemented',
    });
    expect(getRouteMetadata('/candidates-old')).toMatchObject({ routeId: 'candidates.database.compat', parentTarget: '/candidates-database', implementationState: 'implemented' });
    expect(getRouteMetadata('/candidates-new')).toMatchObject({ routeId: 'candidates.database.compat', parentTarget: '/candidates-database', implementationState: 'implemented' });
    expect(getRouteMetadata('/candidate/candidate-123')).toMatchObject({
      domain: 'candidates',
      module: 'detail-hub',
      requiredCapability: 'canViewCandidateDetail',
      implementationState: 'implemented',
    });
    expect(getRouteMetadata('/candidate/candidate-123/cv/cv-123/offer')).toMatchObject({
      domain: 'candidates',
      module: 'action-launchers',
      requiredCapability: 'canOpenCandidateAction',
      implementationState: 'implemented',
    });
  });

  it('does not register email deliverability setup placeholder routes', () => {
    const registeredPaths = Object.keys(routeMetadataRegistry);

    expect(registeredPaths.some((path) => /deliverability|sender-domain|domain-verification|signature/.test(path))).toBe(false);
    expect(Object.values(routeMetadataRegistry).some((metadata) => /deliverability|sender-domain|domain-verification|signature/.test(`${metadata.routeId} ${metadata.module} ${metadata.requiredCapability ?? ''}`))).toBe(false);
    expect(getRouteMetadata('/inbox')).toMatchObject({
      routeId: 'inbox.home',
      domain: 'inbox',
      module: 'conversation-entry',
      requiredCapability: 'canUseInbox',
      fallbackTarget: '/dashboard',
    });
    expect(getRouteMetadata('/integrations')).toMatchObject({
      routeId: 'integrations.admin.index',
      module: 'provider-index',
    });
  });

  it('registers forms/docs controls as a settings-owned route', () => {
    expect(getRouteMetadata('/settings/forms-docs')).toMatchObject({
      routeId: 'settings.forms-docs-controls',
      domain: 'settings',
      module: 'forms-docs-controls',
      requiredCapability: 'canManageFormsDocsSettings',
      fallbackTarget: '/dashboard',
      implementationState: 'implemented',
    });
  });

  it('registers public/token routes with route-local capabilities and implementation states', () => {
    expect(matchRouteMetadata('/surveys/survey-1/job-1/cv-1')?.metadata).toMatchObject({ requiredCapability: 'canCompletePublicSurvey', implementationState: 'implemented' });
    expect(matchRouteMetadata('/chat/token/user-1')?.metadata).toMatchObject({ requiredCapability: 'canUseExternalTokenizedChat', implementationState: 'implemented' });
    expect(matchRouteMetadata('/job-requisition-approval')?.metadata).toMatchObject({ requiredCapability: 'canApproveRequisitionByToken', implementationState: 'implemented' });
    expect(matchRouteMetadata('/interview-request/schedule-1/cv-token')?.metadata).toMatchObject({ requiredCapability: 'canUseExternalReviewFlow', implementationState: 'implemented' });
    expect(matchRouteMetadata('/review-candidate/code')?.metadata).toMatchObject({ requiredCapability: 'canUseExternalReviewFlow', implementationState: 'implemented' });
    expect(matchRouteMetadata('/interview-feedback/code')?.metadata).toMatchObject({ requiredCapability: 'canUseExternalReviewFlow', implementationState: 'implemented' });
    expect(matchRouteMetadata('/integration/forms/token')?.metadata).toMatchObject({ domain: 'integrations', requiredCapability: 'canUseIntegrationTokenEntry', implementationState: 'implemented' });
  });

  it('registers operational settings and template routes with matching capabilities', () => {
    expect(getRouteMetadata('/settings/hiring-flow')).toMatchObject({ requiredCapability: 'canManageHiringFlowSettings', implementationState: 'implemented' });
    expect(getRouteMetadata('/settings/custom-fields')).toMatchObject({ requiredCapability: 'canManageCustomFields', implementationState: 'implemented' });
    expect(getRouteMetadata('/templates')).toMatchObject({ requiredCapability: 'canManageTemplates', implementationState: 'implemented' });
    expect(getRouteMetadata('/templates/smart-questions')).toMatchObject({ requiredCapability: 'canManageTemplates', implementationState: 'implemented' });
    expect(getRouteMetadata('/templates/diversity-questions')).toMatchObject({ requiredCapability: 'canManageTemplates', implementationState: 'implemented' });
    expect(getRouteMetadata('/templates/interview-scoring')).toMatchObject({ requiredCapability: 'canManageTemplates', implementationState: 'implemented' });
    expect(getRouteMetadata('/templates/template-1')).toMatchObject({ requiredCapability: 'canManageTemplates', implementationState: 'implemented' });
    expect(getRouteMetadata('/reject-reasons')).toMatchObject({ requiredCapability: 'canManageRejectReasons', implementationState: 'implemented' });
  });

  it('registers requisition forms download separately from approval', () => {
    expect(matchRouteMetadata('/job-requisition-forms/form-123')).toMatchObject({
      pattern: '/job-requisition-forms/$formId',
      params: { formId: 'form-123' },
      metadata: expect.objectContaining({
        routeId: 'public-external.requisition-forms.download',
        routeClass: 'Public/Token',
        domain: 'public-external',
        module: 'requisition-forms-download',
        requiredCapability: 'canDownloadRequisitionFormsByToken',
      }),
    });
  });

  it('registers jobs routes with implementation-depth capabilities', () => {
    expect(getRouteMetadata('/jobs/open')).toMatchObject({
      routeId: 'jobs.list',
      domain: 'jobs',
      module: 'list',
      requiredCapability: 'canViewJobsList',
      implementationState: 'implemented',
    });

    expect(getRouteMetadata('/job/job-1/cv/candidate-1/schedule')).toMatchObject({
      routeId: 'jobs.task.schedule',
      requiredCapability: 'canScheduleInterviewFromJob',
      mutationCapability: 'canScheduleInterviewFromJob',
      implementationState: 'implemented',
    });
  });

  it('registers parameters compatibility paths as resolver routes', () => {
    expect(matchRouteMetadata('/parameters/company-1/settings/api-endpoints')).toMatchObject({
      pattern: '/parameters/$settingsId/$section/$subsection',
      params: { settingsId: 'company-1', section: 'settings', subsection: 'api-endpoints' },
      metadata: expect.objectContaining({
        routeId: 'settings.operational.compat',
        domain: 'settings',
        module: 'settings-container',
        requiredCapability: 'canEnterSettings',
      }),
    });
  });

  it('registers account profile and settings routes with explicit capabilities', () => {
    expect(getRouteMetadata('/settings/user-settings')).toMatchObject({ routeId: 'settings.user-settings', requiredCapability: 'canViewUserSettings', implementationState: 'implemented' });
    expect(getRouteMetadata('/settings/company-settings')).toMatchObject({ routeId: 'settings.company-settings', requiredCapability: 'canManageCompanySettings', implementationState: 'implemented' });
    expect(getRouteMetadata('/settings/agency-settings')).toMatchObject({ routeId: 'settings.agency-settings', requiredCapability: 'canManageAgencySettings', implementationState: 'implemented' });
    expect(getRouteMetadata('/hiring-company-profile')).toMatchObject({ routeId: 'shell.hiring-company-profile', requiredCapability: 'canViewHiringCompanyProfile', mutationCapability: 'canManageCompanySettings' });
    expect(getRouteMetadata('/recruitment-agency-profile')).toMatchObject({ routeId: 'shell.recruitment-agency-profile', requiredCapability: 'canViewRecruitmentAgencyProfile', mutationCapability: 'canManageAgencySettings' });
  });

  it('registers logout and access-denied with explicit closeout metadata', () => {
    expect(getRouteMetadata('/logout')).toMatchObject({
      routeId: 'shell.logout',
      domain: 'shell',
      module: 'session',
      requiredCapability: 'canLogout',
      fallbackTarget: '/',
      implementationState: 'implemented',
    });

    expect(getRouteMetadata('/access-denied')).toMatchObject({
      routeId: 'system.access-denied',
      domain: 'system',
      module: 'fallback',
      implementationState: 'implemented',
    });
  });



  it('marks reports routes as implemented only after product-depth result, command, compatibility, and telemetry gates exist', () => {
    expect(getRouteMetadata('/report')).toMatchObject({
      routeId: 'reports.index',
      domain: 'reports',
      module: 'report-index',
      requiredCapability: 'canViewReports',
      implementationState: 'implemented',
    });
    expect(getRouteMetadata('/report/jobs')).toMatchObject({
      routeId: 'reports.family',
      domain: 'reports',
      module: 'report-family-pages',
      requiredCapability: 'canViewReportFamily',
      implementationState: 'implemented',
    });
    expect(getRouteMetadata('/hiring-company/report/hiring-process')).toMatchObject({
      routeId: 'reports.legacy.compat',
      domain: 'reports',
      module: 'report-index',
      parentTarget: '/report',
      implementationState: 'implemented',
    });
  });

});
