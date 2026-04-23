import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { completeCezanneCallback, confirmRegistrationToken, loginWithAuthApi, mapAuthLoginError, normalizeAuthUserToAccessContext, registerAccount, requestPasswordResetEmail, resetPassword } from './auth-api-adapter';

function headerValue(init: RequestInit | undefined, name: string): string | null {
  const headers = new Headers(init?.headers);
  return headers.get(name);
}

describe('auth API adapter', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('maps frontend LoginService feature source into normalized access context', () => {
    const access = normalizeAuthUserToAccessContext({
      hiring_companies: [{ pivot: { is_admin: true, candidates: true, job_requisition: true, recruiters: true, favorites: true, forms_documents: true }, current_subscription: { contracts: true } }],
      featureFlags: { customFieldsBeta: true, surveysBeta: true, blindReviewBeta: true },
      calendarIntegration: { status: 'connected' },
      sms: { included: 10 },
    });

    expect(access).toMatchObject({ isAuthenticated: true, organizationType: 'hc', isAdmin: true, isSysAdmin: false });
    expect(access.pivotEntitlements).toEqual(expect.arrayContaining(['seeCandidates', 'jobRequisition', 'recruiters', 'seeFavorites']));
    expect(access.subscriptionCapabilities).toEqual(expect.arrayContaining(['calendarIntegration', 'formsDocs', 'surveys', 'customFields', 'reviewRequests', 'inbox']));
  });

  it('keeps sysadmin separate from recruiter-core org context', () => {
    expect(normalizeAuthUserToAccessContext({ sys_admin: true })).toMatchObject({ isAuthenticated: true, organizationType: 'none', isAdmin: true, isSysAdmin: true });
  });

  it('maps known auth login errors', () => {
    expect(mapAuthLoginError('2fa code required')).toBe('two-factor-required');
    expect(mapAuthLoginError('cezanne-sso-mandatory')).toBe('sso-mandatory');
    expect(mapAuthLoginError('need to be approved')).toBe('approval-required');
    expect(mapAuthLoginError('Email need to be activated')).toBe('activation-required');
    expect(mapAuthLoginError('User setup required')).toBe('setup-required');
    expect(mapAuthLoginError('Token not found for code: abc')).toBe('provider-error');
  });

  it('calls auth login, REST authenticate, and GraphQL enrichment before dashboard handoff', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockImplementation(async (input, init) => {
      const url = String(input);
      if (url.endsWith('/auth/login')) return new Response(JSON.stringify({ token: 'auth-token' }), { status: 200 });
      if (url.endsWith('/authenticate')) return new Response(JSON.stringify({ user: { hiring_companies: [{ pivot: { is_admin: true, candidates: true } }] } }), { status: 200 });
      if (url.endsWith('/graphql')) return new Response(JSON.stringify({ data: { monolith: { auth: { calendarIntegration: { status: 'connected' } }, featureFlags: { customFieldsBeta: true } }, billing: { currentSubscriptionUsage: { smsIncluded: 5, hidden: false } } } }), { status: 200 });
      return new Response('{}', { status: 404 });
    });

    const result = await loginWithAuthApi({ email: 'admin@example.test', password: 'password' });

    expect(result).toMatchObject({ status: 'succeeded', token: 'auth-token', landing: { target: '/dashboard' }, accessContext: { organizationType: 'hc' } });
    expect(fetchSpy).toHaveBeenCalledTimes(3);
    expect(String(fetchSpy.mock.calls[0][0])).toMatch(/\/auth\/login$/);
    expect(JSON.parse(String((fetchSpy.mock.calls[0][1] as RequestInit).body))).toEqual({ email: 'admin@example.test', password: 'password' });
    expect(headerValue(fetchSpy.mock.calls[1][1] as RequestInit, 'authorization')).toBe('Bearer auth-token');
    expect(headerValue(fetchSpy.mock.calls[2][1] as RequestInit, 'authorization')).toBe('Bearer auth-token');
    expect(headerValue(fetchSpy.mock.calls[2][1] as RequestInit, 'content-language')).toBe('en');
    expect(window.localStorage.getItem('oc_loginServiceToken')).toBe('auth-token');
    expect(window.localStorage.getItem('oc_loginServiceUser')).toContain('calendarIntegration');
    expect(JSON.stringify(window.localStorage)).not.toContain('password');
    expect(JSON.stringify(window.localStorage)).not.toContain('admin@example.test');
  });

  it('maps sysadmin bootstrap to the validated platform handoff route', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (input) => {
      const url = String(input);
      if (url.endsWith('/auth/login')) return new Response(JSON.stringify({ token: 'auth-token' }), { status: 200 });
      if (url.endsWith('/authenticate')) return new Response(JSON.stringify({ user: { sys_admin: true } }), { status: 200 });
      if (url.endsWith('/graphql')) return new Response(JSON.stringify({ data: { monolith: {}, billing: {} } }), { status: 200 });
      return new Response('{}', { status: 404 });
    });

    await expect(loginWithAuthApi({ email: 'admin@example.test', password: 'password' })).resolves.toMatchObject({
      status: 'succeeded',
      accessContext: { organizationType: 'none', isSysAdmin: true },
      landing: { target: '/hiring-companies', fallbackKind: 'platform-dashboard' },
    });
  });

  it('maps confirm-registration token outcomes to the approved continuation contract', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockImplementation(async (input, init) => {
      const url = String(input);
      if (url.includes('/user/first-access?token=ready-token')) return new Response(JSON.stringify({ msg: 'token_valid', token: 'session-token' }), { status: 200 });
      if (url.includes('/user/first-access?token=pending-token')) return new Response(JSON.stringify({ msg: 'approval_pending' }), { status: 200 });
      if (url.includes('/user/first-access?token=expired-token')) return new Response(JSON.stringify({ msg: 'token_expired' }), { status: 200 });
      if (url.endsWith('/authenticate')) return new Response(JSON.stringify({ user: { hiring_companies: [{ pivot: { is_admin: true, candidates: true } }] } }), { status: 200 });
      if (url.endsWith('/graphql')) return new Response(JSON.stringify({ data: { monolith: {}, billing: {} } }), { status: 200 });
      return new Response(JSON.stringify({ msg: 'token_invalid' }), { status: 200 });
    });

    await expect(confirmRegistrationToken('ready-token')).resolves.toMatchObject({
      status: 'succeeded',
      landing: { target: '/dashboard' },
      token: 'session-token',
    });
    await expect(confirmRegistrationToken('pending-token')).resolves.toEqual({
      status: 'succeeded',
      message: 'Registration confirmed. Your account is waiting for approval.',
      redirectTo: '/',
    });
    await expect(confirmRegistrationToken('expired-token')).resolves.toEqual({
      status: 'failed',
      message: 'This registration token is expired.',
      redirectTo: '/',
    });
    await expect(confirmRegistrationToken('bad-token')).resolves.toEqual({
      status: 'failed',
      message: 'This registration token is invalid.',
      redirectTo: '/',
    });
    expect(headerValue(fetchSpy.mock.calls[1][1] as RequestInit, 'authorization')).toBe('Bearer session-token');
  });

  it('returns to public entry when confirm-registration bootstrap fails', async () => {
    window.localStorage.setItem('oc_loginServiceToken', 'stale-token');
    window.localStorage.setItem('oc_onboardToken', 'stale-onboard-token');
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (input) => {
      const url = String(input);
      if (url.includes('/user/first-access')) return new Response(JSON.stringify({ msg: 'token_valid', token: 'session-token' }), { status: 200 });
      if (url.endsWith('/authenticate')) return new Response(JSON.stringify({}), { status: 200 });
      if (url.endsWith('/graphql')) return new Response(JSON.stringify({ data: { monolith: {}, billing: {} } }), { status: 200 });
      return new Response('{}', { status: 404 });
    });

    await expect(confirmRegistrationToken('ready-token')).resolves.toEqual({
      status: 'failed',
      message: 'Registration was confirmed, but the session could not be started. Try logging in.',
      redirectTo: '/',
    });
    expect(window.localStorage.getItem('oc_loginServiceToken')).toBeNull();
    expect(window.localStorage.getItem('oc_onboardToken')).toBeNull();
  });

  it('maps forgot and reset token enums to the approved public outcomes', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (input, init) => {
      const url = String(input);
      const body = init?.body ? JSON.parse(String(init.body)) as { token?: string; email?: string } : {};
      if (url.includes('/forgot-password')) {
        if (body.email === 'missing@example.test') return new Response(JSON.stringify({ msg: 'mail_not_found' }), { status: 200 });
        if (body.email === 'error@example.test') return new Response(JSON.stringify({ msg: 'mail_error' }), { status: 200 });
        return new Response(JSON.stringify({ msg: 'mail_sent' }), { status: 200 });
      }
      if (url.includes('/reset-password')) {
        const msg = body.token === 'used-token' ? 'token_used' : body.token === 'expired-token' ? 'token_expired' : 'token_accepted';
        return new Response(JSON.stringify({ msg }), { status: 200 });
      }
      return new Response('{}', { status: 404 });
    });

    await expect(requestPasswordResetEmail('person@example.test')).resolves.toMatchObject({ status: 'succeeded', redirectTo: '/' });
    await expect(requestPasswordResetEmail('missing@example.test')).resolves.toEqual({ status: 'failed', message: 'Email not found.' });
    await expect(requestPasswordResetEmail('error@example.test')).resolves.toEqual({ status: 'failed', message: 'Failed to send, please try again or contact the system admin on support@occupop.com' });
    await expect(resetPassword({ token: 'used-token', password: 'new-password', passwordConfirmation: 'new-password' })).resolves.toEqual({ status: 'failed', message: 'This reset token was already used.', redirectTo: '/' });
    await expect(resetPassword({ token: 'expired-token', password: 'new-password', passwordConfirmation: 'new-password' })).resolves.toEqual({ status: 'failed', message: 'This reset token is expired.', redirectTo: '/' });
  });

  it('maps register invitation outcomes to the approved return contract', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (input, init) => {
      const url = String(input);
      if (url.endsWith('/invitation')) {
        const body = JSON.parse(String(init?.body)) as { user?: { token?: string } };
        return new Response(JSON.stringify({ msg: body.user?.token === 'bad-token' ? 'token_invalid' : 'ok' }), { status: 200 });
      }
      return new Response('{}', { status: 404 });
    });

    const input = { organizationType: 'hiringCompany' as const, companyName: 'Company', firstName: 'Person', lastName: 'User', email: 'person@example.test', password: 'password123', passwordConfirmation: 'password123' };
    await expect(registerAccount({ ...input, token: 'invite-token' })).resolves.toEqual({ status: 'succeeded', message: 'Registration completed.', redirectTo: '/' });
    await expect(registerAccount({ ...input, token: 'bad-token' })).resolves.toEqual({ status: 'failed', message: 'This invitation token is invalid.', redirectTo: '/' });
  });

  it('clears partial session data when provider callback bootstrap fails', async () => {
    window.localStorage.setItem('oc_loginServiceToken', 'stale-token');
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (input) => {
      const url = String(input);
      if (url.includes('/login/cezanne/callback')) return new Response(JSON.stringify({ token: 'provider-token' }), { status: 200 });
      if (url.endsWith('/authenticate')) return new Response(JSON.stringify({}), { status: 200 });
      if (url.endsWith('/graphql')) return new Response(JSON.stringify({ data: { monolith: {}, billing: {} } }), { status: 200 });
      return new Response('{}', { status: 404 });
    });

    await expect(completeCezanneCallback('safe-code')).resolves.toMatchObject({ status: 'failed', errorKind: 'bootstrap-failed' });
    expect(window.localStorage.getItem('oc_loginServiceToken')).toBeNull();
  });
});
