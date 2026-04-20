import { evaluateCapabilities } from '../../lib/access-control';
import { getVisiblePlatformNavigation } from './nav-registry';
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
});
