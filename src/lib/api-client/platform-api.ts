import { env } from '../../app/env';
import { correlationAwareFetch } from './correlation-aware-fetch';

export type ApiClientHeadersInput = {
  token?: string;
  language?: string;
  headers?: HeadersInit;
};

export type ApiClientRequestOptions = ApiClientHeadersInput & {
  method?: string;
  body?: unknown;
};

export class ApiClientError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly payload: unknown,
  ) {
    super(message);
    this.name = 'ApiClientError';
  }
}

function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/, '');
}

function trimLeadingSlash(value: string): string {
  return value.replace(/^\/+/, '');
}

export function joinApiUrl(baseUrl: string, path: string): string {
  if (!path) return trimTrailingSlash(baseUrl);
  if (/^https?:\/\//i.test(path)) return path;
  return `${trimTrailingSlash(baseUrl)}/${trimLeadingSlash(path)}`;
}

export function resolveRestApiBaseUrl(): string {
  return trimTrailingSlash(env.VITE_API_BASE_URL);
}

export function resolveGraphqlUrl(): string {
  return env.VITE_GRAPHQL_URL;
}

export function resolveAuthServiceBaseUrl(): string {
  if (env.VITE_AUTH_BASE_URL) return trimTrailingSlash(env.VITE_AUTH_BASE_URL);
  if (typeof window !== 'undefined') return `http://${window.location.hostname}:3060/auth`;
  return 'http://localhost:3060/auth';
}

export function buildJsonHeaders(input: ApiClientHeadersInput = {}): Headers {
  const headers = new Headers(input.headers);
  headers.set('content-type', 'application/json');
  if (input.token) headers.set('authorization', `Bearer ${input.token}`);
  if (input.language) headers.set('content-language', input.language);
  return headers;
}

async function parseJsonPayload(response: Response): Promise<unknown> {
  const text = await response.text().catch(() => '');
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export async function readApiJson<T>(response: Response): Promise<T> {
  const payload = await parseJsonPayload(response);
  if (!response.ok) {
    const message = typeof payload === 'object' && payload && 'message' in payload ? String((payload as { message?: unknown }).message) : `API request failed with status ${response.status}`;
    throw new ApiClientError(message, response.status, payload);
  }
  return payload as T;
}

export function apiJson<T>(url: string, options: ApiClientRequestOptions = {}): Promise<T> {
  const init: RequestInit = {
    method: options.method ?? 'GET',
    headers: buildJsonHeaders(options),
  };

  if (options.body !== undefined) init.body = JSON.stringify(options.body);

  return correlationAwareFetch(url, init).then(readApiJson<T>);
}

export function restApiGetJson<T>(path: string, options: ApiClientHeadersInput = {}): Promise<T> {
  return apiJson<T>(joinApiUrl(resolveRestApiBaseUrl(), path), { ...options, method: 'GET' });
}

export function restApiPostJson<T>(path: string, body: unknown, options: ApiClientHeadersInput = {}): Promise<T> {
  return apiJson<T>(joinApiUrl(resolveRestApiBaseUrl(), path), { ...options, method: 'POST', body });
}

export function authServiceGetJson<T>(path: string, options: ApiClientHeadersInput = {}): Promise<T> {
  return apiJson<T>(joinApiUrl(resolveAuthServiceBaseUrl(), path), { ...options, method: 'GET' });
}

export function authServicePostJson<T>(path: string, body: unknown, options: ApiClientHeadersInput = {}): Promise<T> {
  return apiJson<T>(joinApiUrl(resolveAuthServiceBaseUrl(), path), { ...options, method: 'POST', body });
}

export function graphqlRequest<T>(query: string, variables?: Record<string, unknown>, options: ApiClientHeadersInput = {}): Promise<T> {
  return apiJson<T>(resolveGraphqlUrl(), {
    ...options,
    method: 'POST',
    body: variables ? { query, variables } : { query },
  });
}
