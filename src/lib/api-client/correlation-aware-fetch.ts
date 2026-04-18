import { ensureCorrelationId, getActiveCorrelationId } from '../observability';
import { csrfHeaderName, getCsrfToken, shouldAttachCsrfToken } from './csrf-token';

export const correlationHeaderName = 'x-correlation-id';
export const requestedWithHeaderName = 'x-requested-with';

export function withCorrelationHeaders(init: RequestInit = {}): RequestInit {
  const headers = new Headers(init.headers);
  const correlationId = getActiveCorrelationId() ?? ensureCorrelationId();

  headers.set(correlationHeaderName, correlationId);

  const method = (init.method ?? 'GET').toUpperCase();
  if (shouldAttachCsrfToken(method)) {
    headers.set(requestedWithHeaderName, 'XMLHttpRequest');
    const csrfToken = getCsrfToken();
    if (csrfToken) headers.set(csrfHeaderName, csrfToken);
  }

  return {
    ...init,
    credentials: init.credentials ?? 'same-origin',
    headers,
  };
}

export function correlationAwareFetch(input: RequestInfo | URL, init?: RequestInit) {
  return fetch(input, withCorrelationHeaders(init));
}
