import { evaluateCapabilities, type AccessContext } from '../access-control';
import { getPlatformFallbackOutcome, platformRouteMetadata } from './platform-foundation';

function buildAccessContext(overrides: Partial<AccessContext> = {}): AccessContext {
  return {
    isAuthenticated: true,
    organizationType: 'hc',
    isAdmin: true,
    isSysAdmin: false,
    pivotEntitlements: [],
    subscriptionCapabilities: [],
    rolloutFlags: [],
    ...overrides,
  };
}

describe('platform foundation fallback', () => {
  it('falls back authenticated non-SysAdmin users to dashboard for platform routes', () => {
    const capabilities = evaluateCapabilities(buildAccessContext());

    expect(getPlatformFallbackOutcome(capabilities, platformRouteMetadata.hiringCompanies)).toMatchObject({
      allowed: false,
      routeId: 'sysadmin.master-data.hiring-companies',
      routeFamily: 'master-data',
      capabilityOutcome: 'denied',
      fallbackTarget: '/dashboard',
      fallbackOutcome: 'dashboard',
    });
  });

  it('allows SysAdmin platform context to render implemented master-data routes', () => {
    const capabilities = evaluateCapabilities(buildAccessContext({ organizationType: 'none', isSysAdmin: true }));

    expect(getPlatformFallbackOutcome(capabilities, platformRouteMetadata.hiringCompanies)).toMatchObject({
      allowed: true,
      capabilityOutcome: 'allowed',
      fallbackOutcome: 'not-needed',
    });
  });
});
