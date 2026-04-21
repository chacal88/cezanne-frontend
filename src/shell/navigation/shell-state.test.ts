import { describe, expect, it } from 'vitest';
import { evaluateCapabilities, type AccessContext } from '../../lib/access-control';
import { buildShellNavigationState } from './shell-state';

const orgContext: AccessContext = { isAuthenticated: true, organizationType: 'hc', isAdmin: true, isSysAdmin: false, pivotEntitlements: [], subscriptionCapabilities: ['inbox'], rolloutFlags: [] };
const platformContext: AccessContext = { isAuthenticated: true, organizationType: 'none', isAdmin: true, isSysAdmin: true, pivotEntitlements: [], subscriptionCapabilities: [], rolloutFlags: [] };

describe('shell navigation depth state', () => {
  it('separates org and platform navigation modes with account entries', () => {
    const org = buildShellNavigationState({ accessContext: orgContext, capabilities: evaluateCapabilities(orgContext), pathname: '/dashboard' });
    expect(org).toMatchObject({ mode: 'org', activeTarget: '/dashboard' });
    expect(org.accountEntries.find((entry) => entry.id === 'hiring-company-profile')?.state).toBe('available');
    expect(org.accountEntries.find((entry) => entry.id === 'company-settings')?.state).toBe('available');
    expect(org.accountEntries.find((entry) => entry.id === 'recruitment-agency-profile')).toBeUndefined();

    const platform = buildShellNavigationState({ accessContext: platformContext, capabilities: evaluateCapabilities(platformContext), pathname: '/hiring-companies' });
    expect(platform.mode).toBe('platform');
    expect(platform.visiblePlatformGroupCount).toBeGreaterThan(0);
  });
});
