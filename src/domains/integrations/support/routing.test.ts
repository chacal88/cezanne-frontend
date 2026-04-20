import { describe, expect, it } from 'vitest';
import { matchRouteMetadata } from '../../../lib/routing';
import { buildIntegrationCvPath, buildIntegrationFormsPath, buildIntegrationJobPath } from './routing';

describe('integration token routing', () => {
  it('builds canonical integration callback paths', () => {
    expect(buildIntegrationCvPath({ token: 'valid-token' })).toBe('/integration/cv/valid-token');
    expect(buildIntegrationCvPath({ token: 'offer-token', action: 'offer' })).toBe('/integration/cv/offer-token/offer');
    expect(buildIntegrationFormsPath({ token: 'valid-token' })).toBe('/integration/forms/valid-token');
    expect(buildIntegrationJobPath({ token: 'valid-token' })).toBe('/integration/job/valid-token');
    expect(buildIntegrationJobPath({ token: 'valid-token', action: 'preview' })).toBe('/integration/job/valid-token/preview');
  });

  it('registers integration route metadata', () => {
    expect(matchRouteMetadata('/integration/cv/valid-token')?.metadata.routeId).toBe('integrations.token-entry.cv');
    expect(matchRouteMetadata('/integration/cv/valid-token/offer')?.metadata.routeId).toBe('integrations.token-entry.cv');
    expect(matchRouteMetadata('/integration/forms/valid-token')?.metadata.routeId).toBe('integrations.token-entry.forms');
    expect(matchRouteMetadata('/integration/job/valid-token')?.metadata.routeId).toBe('integrations.token-entry.job');
    expect(matchRouteMetadata('/integration/job/valid-token/preview')?.metadata.routeId).toBe('integrations.token-entry.job');
    expect(matchRouteMetadata('/integrations')?.metadata).toMatchObject({ routeId: 'integrations.admin.index', requiredCapability: 'canViewIntegrations' });
    expect(matchRouteMetadata('/integrations/lever')?.metadata).toMatchObject({ routeId: 'integrations.admin.detail', parentTarget: '/integrations', requiredCapability: 'canManageIntegrationProvider' });
    expect(matchRouteMetadata('/team/recruiters')?.metadata).toMatchObject({ routeId: 'team.org.recruiter-visibility', parentTarget: '/team', requiredCapability: 'canViewRecruiterVisibility' });
    expect(matchRouteMetadata('/users/invite')?.metadata).toMatchObject({ routeId: 'team.org.invite-foundation', parentTarget: '/team', requiredCapability: 'canManageOrgInvites' });
    expect(matchRouteMetadata('/report/jobs')?.metadata).toMatchObject({ routeId: 'reports.family', parentTarget: '/report', requiredCapability: 'canViewReportFamily' });
    expect(matchRouteMetadata('/hiring-company/report/jobs')?.metadata).toMatchObject({ routeId: 'reports.legacy.compat', parentTarget: '/report', requiredCapability: 'canViewReports' });
  });
});
