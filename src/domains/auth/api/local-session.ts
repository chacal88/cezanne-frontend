import type { AccessContext } from '../../../lib/access-control';

export const localAuthSessionStorageKey = 'recruit.localAuthSession';
export const authTokenStorageKey = 'oc_loginServiceToken';
export const authUserStorageKey = 'oc_loginServiceUser';
export const onboardTokenStorageKey = 'oc_onboardToken';
export const appLanguageStorageKey = 'oc_appLang';

type LocalAuthSession = {
  version: 1;
  accessContext: AccessContext;
  landingTarget?: string;
  token?: string;
  userSnapshot?: unknown;
};

function canUseLocalStorage(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function normalizeAccessContext(value: unknown): AccessContext | null {
  if (!value || typeof value !== 'object') return null;
  const record = value as Partial<AccessContext>;
  if (record.organizationType !== 'hc' && record.organizationType !== 'ra' && record.organizationType !== 'none') return null;
  return {
    isAuthenticated: record.isAuthenticated === true,
    organizationType: record.organizationType,
    isAdmin: record.isAdmin === true,
    isSysAdmin: record.isSysAdmin === true,
    pivotEntitlements: Array.isArray(record.pivotEntitlements) ? record.pivotEntitlements.filter((item): item is string => typeof item === 'string') : [],
    subscriptionCapabilities: Array.isArray(record.subscriptionCapabilities) ? record.subscriptionCapabilities.filter((item): item is string => typeof item === 'string') : [],
    rolloutFlags: Array.isArray(record.rolloutFlags) ? record.rolloutFlags.filter((item): item is string => typeof item === 'string') : [],
  };
}

export function saveLocalAuthSession(accessContext: AccessContext, landingTarget?: string, token?: string, userSnapshot?: unknown): void {
  if (!canUseLocalStorage()) return;
  const payload: LocalAuthSession = { version: 1, accessContext, landingTarget, token, userSnapshot };
  window.localStorage.setItem(localAuthSessionStorageKey, JSON.stringify(payload));
  if (token) window.localStorage.setItem(authTokenStorageKey, token);
  if (userSnapshot) window.localStorage.setItem(authUserStorageKey, JSON.stringify(userSnapshot));
}

export function loadLocalAuthSession(): AccessContext | null {
  if (!canUseLocalStorage()) return null;
  const raw = window.localStorage.getItem(localAuthSessionStorageKey);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<LocalAuthSession>;
    if (parsed.version !== 1) return null;
    return normalizeAccessContext(parsed.accessContext);
  } catch {
    return null;
  }
}

export function loadAuthToken(): string | null {
  if (!canUseLocalStorage()) return null;
  return window.localStorage.getItem(authTokenStorageKey);
}

export function clearLocalAuthSession(): void {
  if (!canUseLocalStorage()) return;
  window.localStorage.removeItem(localAuthSessionStorageKey);
  window.localStorage.removeItem(authTokenStorageKey);
  window.localStorage.removeItem(authUserStorageKey);
  window.localStorage.removeItem(onboardTokenStorageKey);
  window.localStorage.removeItem(appLanguageStorageKey);
}

export function serializeLocalAuthSessionForTest(accessContext: AccessContext, landingTarget?: string, token?: string, userSnapshot?: unknown): string {
  return JSON.stringify({ version: 1, accessContext, landingTarget, token, userSnapshot } satisfies LocalAuthSession);
}
