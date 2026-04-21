import { evaluateCapabilities } from '../../lib/access-control';
import { getVisibleAccountNavigation, getVisiblePlatformNavigation, getVisibleShellNavigation } from './nav-registry';
import type { AccessContext } from '../../lib/access-control';

function buildAccessContext(overrides: Partial<AccessContext> = {}): AccessContext {
  return {
    isAuthenticated: true,
    organizationType: 'none',
    isAdmin: true,
    isSysAdmin: true,
    pivotEntitlements: [],
    subscriptionCapabilities: [],
    rolloutFlags: [],
    ...overrides,
  };
}

describe('platform navigation registry', () => {
  it('exposes all authenticated org route families without public token routes', () => {
    const hcContext = buildAccessContext({
      organizationType: 'hc',
      isSysAdmin: false,
      pivotEntitlements: ['seeCandidates', 'seeFavorites'],
      subscriptionCapabilities: ['inbox', 'formsDocs', 'rejectionReason'],
      rolloutFlags: ['customFieldsBeta'],
    });
    const links = getVisibleShellNavigation(evaluateCapabilities(hcContext));
    const targets = links.map((link) => link.to);

    expect(targets).toEqual(expect.arrayContaining([
      '/dashboard',
      '/notifications',
      '/inbox',
      '/jobs/$scope',
      '/candidates-database',
      '/integrations',
      '/report',
      '/team',
      '/favorites',
      '/billing',
      '/settings/careers-page',
      '/settings/hiring-flow',
      '/settings/custom-fields',
      '/templates',
      '/reject-reasons',
      '/settings/api-endpoints',
      '/settings/forms-docs',
    ]));
    expect(targets.some((target) => target.startsWith('/integration/') || target.startsWith('/chat/') || target.startsWith('/surveys/'))).toBe(false);
    expect(links.find((link) => link.to === '/jobs/$scope')).toMatchObject({ implementationState: 'partial' });
  });

  it('exposes RA marketplace without HC-only settings or billing', () => {
    const raContext = buildAccessContext({ organizationType: 'ra', isSysAdmin: false, isAdmin: true });
    const targets = getVisibleShellNavigation(evaluateCapabilities(raContext)).map((link) => link.to);

    expect(targets).toContain('/jobmarket/$type');
    expect(targets).not.toContain('/billing');
    expect(targets).not.toContain('/settings/hiring-flow');
  });

  it('exposes live master-data links while later platform groups stay hidden', () => {
    const capabilities = evaluateCapabilities(buildAccessContext());
    const groups = getVisiblePlatformNavigation(capabilities);

    expect(groups.map((group) => group.navGroup)).toEqual(['master-data', 'users-and-requests', 'taxonomy']);
    expect(groups[0]).toMatchObject({ implementationState: 'implemented-links' });
    expect(groups[0].links.map((link) => link.to)).toEqual(['/hiring-companies', '/recruitment-agencies', '/subscriptions']);
    expect(groups[1]).toMatchObject({ implementationState: 'implemented-links' });
    expect(groups[1].links.map((link) => link.to)).toEqual(['/users', '/favorites-request']);
    expect(groups[2]).toMatchObject({ implementationState: 'implemented-links' });
    expect(groups[2].links.map((link) => link.to)).toEqual(['/sectors']);
  });

  it('hides platform groups for org admins', () => {
    const capabilities = evaluateCapabilities(buildAccessContext({ organizationType: 'hc', isSysAdmin: false }));

    expect(getVisiblePlatformNavigation(capabilities)).toEqual([]);
  });

  it('shows account/profile links only for the authenticated organization ownership', () => {
    const hcContext = buildAccessContext({ organizationType: 'hc', isSysAdmin: false });
    const hcLinks = getVisibleAccountNavigation(evaluateCapabilities(hcContext), hcContext);
    expect(hcLinks.map((link) => link.to)).toContain('/hiring-company-profile');
    expect(hcLinks.map((link) => link.to)).toContain('/settings/company-settings');
    expect(hcLinks.map((link) => link.to)).not.toContain('/recruitment-agency-profile');

    const raContext = buildAccessContext({ organizationType: 'ra', isSysAdmin: false });
    const raLinks = getVisibleAccountNavigation(evaluateCapabilities(raContext), raContext);
    expect(raLinks.map((link) => link.to)).toContain('/recruitment-agency-profile');
    expect(raLinks.map((link) => link.to)).not.toContain('/settings/company-settings');
  });
});
