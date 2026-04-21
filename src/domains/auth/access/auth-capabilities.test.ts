import { describe, expect, it } from 'vitest';
import { evaluateCapabilities } from '../../../lib/access-control';
import { matchRouteMetadata } from '../../../lib/routing';
import { buildAuthTokenRouteState } from '../models';
import { authTokenErrorsStayPublic } from './auth-capabilities';

describe('auth route capability boundaries', () => {
  it('keeps auth public token errors out of authenticated shell entry', () => {
    const publicCaps = evaluateCapabilities({ isAuthenticated: false, organizationType: 'none', isAdmin: false, isSysAdmin: false, pivotEntitlements: [], subscriptionCapabilities: [], rolloutFlags: [] });
    const expired = buildAuthTokenRouteState('expired-reset-token');

    expect(publicCaps.canUseAuthTokenFlow).toBe(true);
    expect(publicCaps.canEnterShell).toBe(false);
    expect(authTokenErrorsStayPublic(publicCaps, expired.canSubmit)).toBe(true);
  });

  it('registers auth routes as public/token while canEnterShell remains shell-only', () => {
    expect(matchRouteMetadata('/reset-password/expired-reset-token')?.metadata).toMatchObject({ routeClass: 'Public/Token', requiredCapability: 'canUseAuthTokenFlow' });
    expect(matchRouteMetadata('/auth/saml')?.metadata).toMatchObject({ routeClass: 'Public/Token', requiredCapability: 'canCompleteSsoCallback' });
    expect(matchRouteMetadata('/dashboard')?.metadata.requiredCapability).not.toBe('canUseAuthTokenFlow');
  });

  it('does not alter non-auth public token route contracts', () => {
    expect(matchRouteMetadata('/integration/cv/valid-token')?.metadata).toMatchObject({ routeClass: 'Public/Token', domain: 'integrations', module: 'token-entry' });
    expect(matchRouteMetadata('/chat/valid-chat-token/alex')?.metadata).toMatchObject({ routeClass: 'Public/Token', domain: 'public-external', module: 'external-chat' });
    expect(matchRouteMetadata('/surveys/survey/job/cv')?.metadata).toMatchObject({ routeClass: 'Public/Token', module: 'public-survey' });
    expect(matchRouteMetadata('/review-candidate/review-code')?.metadata).toMatchObject({ routeClass: 'Public/Token', module: 'external-review' });
    expect(matchRouteMetadata('/interview-feedback/feedback-code')?.metadata).toMatchObject({ routeClass: 'Public/Token', module: 'external-review' });
  });
});
