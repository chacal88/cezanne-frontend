import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { loginWithAuthApi, mapAuthLoginError, normalizeAuthUserToAccessContext } from './auth-api-adapter';

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
});
