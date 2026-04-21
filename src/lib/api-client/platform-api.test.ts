import { describe, expect, it, vi, afterEach } from 'vitest';
import { ApiClientError, authServicePostJson, buildJsonHeaders, graphqlRequest, joinApiUrl, readApiJson, restApiGetJson } from './platform-api';

describe('platform API client', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('joins configured base URLs and paths safely', () => {
    expect(joinApiUrl('http://localhost:8000/api/', '/authenticate')).toBe('http://localhost:8000/api/authenticate');
    expect(joinApiUrl('http://localhost:8000/api', 'jobs')).toBe('http://localhost:8000/api/jobs');
    expect(joinApiUrl('http://localhost:8000/api', 'https://example.test/absolute')).toBe('https://example.test/absolute');
  });

  it('builds JSON, bearer, and language headers', () => {
    const headers = buildJsonHeaders({ token: 'token-123', language: 'en' });
    expect(headers.get('content-type')).toBe('application/json');
    expect(headers.get('authorization')).toBe('Bearer token-123');
    expect(headers.get('content-language')).toBe('en');
  });

  it('preserves parsed payloads on API errors', async () => {
    await expect(readApiJson(new Response(JSON.stringify({ message: 'Nope', code: 'bad' }), { status: 422 }))).rejects.toMatchObject({
      name: 'ApiClientError',
      status: 422,
      payload: { message: 'Nope', code: 'bad' },
    } satisfies Partial<ApiClientError>);
  });

  it('sends REST, auth-service, and GraphQL calls through the shared transport', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 }));

    await restApiGetJson('/authenticate', { token: 'rest-token' });
    await authServicePostJson('/login', { email: 'person@example.test' });
    await graphqlRequest('query Test { viewer { id } }', { id: '1' }, { token: 'graphql-token', language: 'en' });

    expect(String(fetchSpy.mock.calls[0][0])).toMatch(/\/authenticate$/);
    expect(new Headers((fetchSpy.mock.calls[0][1] as RequestInit).headers).get('authorization')).toBe('Bearer rest-token');
    expect(String(fetchSpy.mock.calls[1][0])).toMatch(/:3060\/auth\/login$/);
    expect(JSON.parse(String((fetchSpy.mock.calls[1][1] as RequestInit).body))).toEqual({ email: 'person@example.test' });
    expect(String(fetchSpy.mock.calls[2][0])).toMatch(/\/graphql$/);
    expect(new Headers((fetchSpy.mock.calls[2][1] as RequestInit).headers).get('content-language')).toBe('en');
    expect(JSON.parse(String((fetchSpy.mock.calls[2][1] as RequestInit).body))).toEqual({ query: 'query Test { viewer { id } }', variables: { id: '1' } });
  });
});
