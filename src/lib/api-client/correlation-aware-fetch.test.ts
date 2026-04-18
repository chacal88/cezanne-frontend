import { correlationHeaderName, correlationAwareFetch, requestedWithHeaderName, withCorrelationHeaders } from './correlation-aware-fetch';
import { csrfHeaderName, shouldAttachCsrfToken } from './csrf-token';

describe('correlation-aware-fetch', () => {
  beforeEach(() => {
    document.head.innerHTML = '<meta name="csrf-token" content="csrf-token-123" />';
  });

  afterEach(() => {
    document.head.innerHTML = '';
    vi.restoreAllMocks();
  });

  it('always injects the correlation header and same-origin credentials', () => {
    const init = withCorrelationHeaders();
    const headers = new Headers(init.headers);

    expect(headers.get(correlationHeaderName)).toBeTruthy();
    expect(init.credentials).toBe('same-origin');
  });

  it('adds CSRF and xhr headers for unsafe methods when a token exists', () => {
    const init = withCorrelationHeaders({ method: 'POST' });
    const headers = new Headers(init.headers);

    expect(headers.get(csrfHeaderName)).toBe('csrf-token-123');
    expect(headers.get(requestedWithHeaderName)).toBe('XMLHttpRequest');
  });

  it('does not add CSRF headers for safe methods', () => {
    const init = withCorrelationHeaders({ method: 'GET' });
    const headers = new Headers(init.headers);

    expect(headers.get(csrfHeaderName)).toBeNull();
    expect(headers.get(requestedWithHeaderName)).toBeNull();
    expect(shouldAttachCsrfToken('GET')).toBe(false);
  });

  it('delegates to fetch with the hardened init', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{}'));

    await correlationAwareFetch('https://example.test/resource', { method: 'PATCH' });

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [, init] = fetchSpy.mock.calls[0];
    const headers = new Headers(init?.headers);
    expect(headers.get(correlationHeaderName)).toBeTruthy();
    expect(headers.get(csrfHeaderName)).toBe('csrf-token-123');
  });
});
