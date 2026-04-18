export const csrfHeaderName = 'x-csrf-token';
const csrfMetaSelector = 'meta[name="csrf-token"]';

export function getCsrfToken(doc: Document | undefined = typeof document === 'undefined' ? undefined : document) {
  return doc?.querySelector(csrfMetaSelector)?.getAttribute('content') ?? undefined;
}

export function shouldAttachCsrfToken(method: string | undefined) {
  const normalizedMethod = (method ?? 'GET').toUpperCase();
  return normalizedMethod === 'POST' || normalizedMethod === 'PUT' || normalizedMethod === 'PATCH' || normalizedMethod === 'DELETE';
}
