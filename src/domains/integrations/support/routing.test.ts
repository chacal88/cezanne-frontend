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
    expect(matchRouteMetadata('/integration/cv/valid-token')?.metadata).toMatchObject({ routeClass: 'Public/Token', module: 'token-entry' });
    expect(matchRouteMetadata('/integration/cv/valid-token')?.metadata).not.toHaveProperty('requiredCapability', 'canManageIntegrationProvider');
    expect(matchRouteMetadata('/team/recruiters')?.metadata).toMatchObject({ routeId: 'team.org.recruiter-visibility', parentTarget: '/team', requiredCapability: 'canViewRecruiterVisibility' });
    expect(matchRouteMetadata('/users/invite')?.metadata).toMatchObject({
      routeId: 'team.org.invite-foundation',
      domain: 'team',
      module: 'invite-management',
      parentTarget: '/team',
      requiredCapability: 'canManageOrgInvites',
      fallbackTarget: '/dashboard',
    });
    expect(matchRouteMetadata('/favorites')?.metadata).toMatchObject({
      routeId: 'favorites.org.index',
      domain: 'favorites',
      module: 'org-favorites',
      requiredCapability: 'canViewOrgFavorites',
      fallbackTarget: '/dashboard',
    });
    expect(matchRouteMetadata('/favorites/favorite-1')?.metadata).toMatchObject({
      routeId: 'favorites.org.detail',
      parentTarget: '/favorites',
      requiredCapability: 'canViewOrgFavorites',
      fallbackTarget: '/dashboard',
    });
    expect(matchRouteMetadata('/favorites/request')?.metadata).toMatchObject({
      routeId: 'favorites.org.request.create',
      routeClass: 'TaskFlow',
      domain: 'favorites',
      module: 'org-favorite-requests',
      parentTarget: '/favorites',
      requiredCapability: 'canViewOrgFavorites',
      fallbackTarget: '/dashboard',
    });
    expect(matchRouteMetadata('/favorites/request/request-draft')?.metadata).toMatchObject({
      routeId: 'favorites.org.request.detail',
      routeClass: 'TaskFlow',
      parentTarget: '/favorites',
      requiredCapability: 'canViewOrgFavorites',
      fallbackTarget: '/dashboard',
    });
    expect(matchRouteMetadata('/billing')?.metadata).toMatchObject({
      routeId: 'billing.overview',
      domain: 'billing',
      module: 'overview',
      requiredCapability: 'canViewBilling',
      fallbackTarget: '/dashboard',
    });
    expect(matchRouteMetadata('/billing/upgrade')?.metadata).toMatchObject({
      routeId: 'billing.upgrade',
      routeClass: 'TaskFlow',
      parentTarget: '/billing',
      requiredCapability: 'canUpgradeSubscription',
    });
    expect(matchRouteMetadata('/billing/sms')?.metadata).toMatchObject({
      routeId: 'billing.sms',
      routeClass: 'TaskFlow',
      parentTarget: '/billing',
      requiredCapability: 'canManageSmsBilling',
    });
    expect(matchRouteMetadata('/billing/card/card-primary')?.metadata).toMatchObject({
      routeId: 'billing.card',
      routeClass: 'ShellOverlay',
      parentTarget: '/billing',
      requiredCapability: 'canManageBillingCard',
    });
    expect(matchRouteMetadata('/jobmarket/fill')?.metadata).toMatchObject({
      routeId: 'marketplace.ra.list',
      routeClass: 'PageWithStatefulUrl',
      domain: 'marketplace',
      module: 'marketplace-list',
      requiredCapability: 'canViewMarketplace',
      fallbackTarget: '/dashboard',
    });
    expect(matchRouteMetadata('/report/jobs')?.metadata).toMatchObject({ routeId: 'reports.family', parentTarget: '/report', requiredCapability: 'canViewReportFamily' });
    expect(matchRouteMetadata('/hiring-company/report/jobs')?.metadata).toMatchObject({ routeId: 'reports.legacy.compat', parentTarget: '/report', requiredCapability: 'canViewReports' });
  });

  it('keeps public survey, review, interview-feedback, and integration callback routes separate from authenticated provider setup', () => {
    const publicPaths = ['/surveys/survey-1/job-1/cv-1', '/review-candidate/valid-review', '/interview-feedback/valid-feedback'];
    const integrationCallbackPaths = ['/integration/cv/valid-token', '/integration/forms/valid-token', '/integration/job/valid-token'];

    for (const path of publicPaths) {
      expect(matchRouteMetadata(path)?.metadata).toMatchObject({ routeClass: 'Public/Token', domain: 'public-external' });
      expect(matchRouteMetadata(path)?.metadata).not.toHaveProperty('requiredCapability', 'canManageIntegrationProvider');
      expect(matchRouteMetadata(path)?.metadata).not.toMatchObject({ routeId: 'integrations.admin.detail', parentTarget: '/integrations' });
    }

    for (const path of integrationCallbackPaths) {
      expect(matchRouteMetadata(path)?.metadata).toMatchObject({ routeClass: 'Public/Token', domain: 'integrations', module: 'token-entry' });
      expect(matchRouteMetadata(path)?.metadata).not.toHaveProperty('requiredCapability', 'canManageIntegrationProvider');
      expect(matchRouteMetadata(path)?.metadata).not.toMatchObject({ routeId: 'integrations.admin.detail', parentTarget: '/integrations' });
    }

    expect(matchRouteMetadata('/integrations/greenhouse')?.metadata).toMatchObject({
      routeId: 'integrations.admin.detail',
      routeClass: 'Page',
      requiredCapability: 'canManageIntegrationProvider',
      parentTarget: '/integrations',
    });
  });
});
