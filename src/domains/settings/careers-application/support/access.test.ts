import { describe, expect, it } from 'vitest';
import { evaluateCapabilities, type AccessContext } from '../../../../lib/access-control';
import { evaluateApplicationPageAccess, evaluateCareersPageAccess, evaluateJobListingsAccess } from './access';

function buildAccessContext(overrides: Partial<AccessContext> = {}): AccessContext {
  return {
    isAuthenticated: true,
    organizationType: 'hc',
    isAdmin: true,
    isSysAdmin: false,
    pivotEntitlements: [],
    subscriptionCapabilities: ['inbox'],
    rolloutFlags: [],
    ...overrides,
  };
}

describe('careers-application access contracts', () => {
  it('keeps route family access separate while modeling readiness states', () => {
    const capabilities = evaluateCapabilities(buildAccessContext());

    expect(evaluateCareersPageAccess(capabilities, { brand: 'acme', featureEnabled: true }).readiness).toBe('ready');
    expect(evaluateApplicationPageAccess(capabilities, { settingsId: 'company-1', featureEnabled: true }).readiness).toBe('ready');
    expect(evaluateJobListingsAccess(capabilities, { brand: 'acme', featureEnabled: true, publishReady: true }).readiness).toBe('ready');
  });

  it('marks missing brand and publish readiness for job listings', () => {
    const capabilities = evaluateCapabilities(buildAccessContext());

    expect(evaluateJobListingsAccess(capabilities, { brand: undefined, featureEnabled: true, publishReady: true }).readiness).toBe('missing-brand');
    expect(evaluateJobListingsAccess(capabilities, { brand: 'acme', featureEnabled: true, publishReady: false }).readiness).toBe('publish-blocked');
  });

  it('denies admin-only access for non-admin users', () => {
    const capabilities = evaluateCapabilities(buildAccessContext({ isAdmin: false }));

    expect(evaluateCareersPageAccess(capabilities, { brand: 'acme', featureEnabled: true }).canProceed).toBe(false);
    expect(evaluateApplicationPageAccess(capabilities, { settingsId: 'company-1', featureEnabled: true }).canProceed).toBe(false);
  });
});

