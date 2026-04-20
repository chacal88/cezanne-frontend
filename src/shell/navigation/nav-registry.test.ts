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
  it('exposes platform groups without live links while R5 route-heavy pages are unimplemented', () => {
    const capabilities = evaluateCapabilities(buildAccessContext());
    const groups = getVisiblePlatformNavigation(capabilities);

    expect(groups.map((group) => group.navGroup)).toEqual(['master-data', 'users-and-requests', 'taxonomy']);
    expect(groups.every((group) => group.links.length === 0)).toBe(true);
    expect(groups.every((group) => group.implementationState === 'planned-routes-hidden')).toBe(true);
  });

  it('hides platform groups for org admins', () => {
    const capabilities = evaluateCapabilities(buildAccessContext({ organizationType: 'hc', isSysAdmin: false }));

    expect(getVisiblePlatformNavigation(capabilities)).toEqual([]);
  });
});
