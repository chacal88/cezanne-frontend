import { ensureCorrelationId, getActiveCorrelationId } from '../observability';

export const correlationHeaderName = 'x-correlation-id';

export function withCorrelationHeaders(init: RequestInit = {}): RequestInit {
  const headers = new Headers(init.headers);
  const correlationId = getActiveCorrelationId() ?? ensureCorrelationId();

  headers.set(correlationHeaderName, correlationId);

  return {
    ...init,
    headers,
  };
}

export function correlationAwareFetch(input: RequestInfo | URL, init?: RequestInit) {
  return fetch(input, withCorrelationHeaders(init));
}
