import { describe, expect, it } from 'vitest';
import {
  buildAuthTelemetry,
  buildAuthTokenRouteState,
  parseAuthCallbackState,
  resolveAuthTokenState,
  resolveLogoutState,
  resolvePostAuthLanding,
} from './session-foundation';
import { authTokenErrorsStayPublic } from '../access/auth-capabilities';

const unsafeKeys = ['password', 'tokenValue', 'rawToken', 'code', 'authorizationCode', 'refreshToken', 'email'];

describe('auth session foundation', () => {
  it('models token lifecycle outcomes for auth token routes', () => {
    expect(resolveAuthTokenState('abc')).toBe('valid');
    expect(resolveAuthTokenState('expired-abc')).toBe('expired');
    expect(resolveAuthTokenState('used-abc')).toBe('used');
    expect(resolveAuthTokenState('locked-abc')).toBe('inaccessible');
    expect(resolveAuthTokenState('invalid-abc')).toBe('invalid');
    expect(buildAuthTokenRouteState('valid-token')).toMatchObject({ tokenState: 'valid', canSubmit: true, routeState: { kind: 'ready' } });
    expect(buildAuthTokenRouteState('expired-token')).toMatchObject({ tokenState: 'expired', canSubmit: false, routeState: { kind: 'failed' } });
  });

  it('parses callback outcomes without exposing raw callback codes', () => {
    expect(parseAuthCallbackState('cezanne', { error: 'access_denied', code: 'secret-code' })).toMatchObject({ outcome: 'callback-error', hasSafeCode: false });
    expect(parseAuthCallbackState('saml', {})).toMatchObject({ outcome: 'callback-failed', hasSafeCode: false });
    expect(parseAuthCallbackState('saml', { code: 'secret-code' })).toMatchObject({ outcome: 'callback-exchanging', hasSafeCode: true, routeState: { kind: 'session-bootstrapping' } });
    expect(JSON.stringify(parseAuthCallbackState('saml', { code: 'secret-code' }))).not.toContain('secret-code');
  });

  it('resolves post-auth landing, logout, and session loss through safe targets', () => {
    expect(resolvePostAuthLanding({ isAuthenticated: false })).toMatchObject({ target: '/', fallbackKind: 'public-entry' });
    expect(resolvePostAuthLanding({ isAuthenticated: true, organizationType: 'hc', requestedTarget: '/jobs/open' })).toMatchObject({ target: '/jobs/open', fallbackKind: 'sanitized-return' });
    expect(resolvePostAuthLanding({ isAuthenticated: true, organizationType: 'hc', requestedTarget: '/integration/cv/raw-token' })).toMatchObject({ target: '/dashboard', fallbackKind: 'dashboard' });
    expect(resolveLogoutState()).toMatchObject({ kind: 'logged-out', landingTarget: '/' });
  });

  it('keeps auth telemetry allowlisted and token errors public', () => {
    const event = buildAuthTelemetry({ action: 'callback', providerFamily: 'saml', callbackOutcome: 'callback-exchanging', entryMode: 'callback' });
    const payload = JSON.stringify(event);
    for (const key of unsafeKeys) expect(payload).not.toContain(key);
    expect(authTokenErrorsStayPublic({ canEnterShell: false, canUseAuthTokenFlow: true }, false)).toBe(true);
    expect(authTokenErrorsStayPublic({ canEnterShell: true, canUseAuthTokenFlow: true }, true)).toBe(true);
  });
});
