import { describe, expect, it, beforeEach } from 'vitest';
import { buildAccessContextForLoginPersona } from '../models';
import { clearLocalAuthSession, authTokenStorageKey, authUserStorageKey, loadAuthToken, loadLocalAuthSession, saveLocalAuthSession, serializeLocalAuthSessionForTest } from './local-session';

describe('local auth session adapter', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('stores normalized access context and auth token/user storage keys without raw credentials', () => {
    const access = buildAccessContextForLoginPersona('hc-admin');

    saveLocalAuthSession(access, '/dashboard', 'auth-token', { id: 1, firstName: 'Ada' });

    expect(loadLocalAuthSession()).toMatchObject({ isAuthenticated: true, organizationType: 'hc', isAdmin: true });
    expect(loadAuthToken()).toBe('auth-token');
    expect(window.localStorage.getItem(authTokenStorageKey)).toBe('auth-token');
    expect(window.localStorage.getItem(authUserStorageKey)).toContain('Ada');
    const raw = JSON.stringify(window.localStorage);
    expect(raw).not.toContain('password');
    expect(raw).not.toContain('admin@example.test');
  });

  it('ignores malformed sessions and clears stored state', () => {
    window.localStorage.setItem('recruit.localAuthSession', '{bad');
    expect(loadLocalAuthSession()).toBeNull();

    window.localStorage.setItem('recruit.localAuthSession', serializeLocalAuthSessionForTest(buildAccessContextForLoginPersona('ra-user')));
    expect(loadLocalAuthSession()).toMatchObject({ organizationType: 'ra' });
    window.localStorage.setItem(authTokenStorageKey, 'auth-token');
    window.localStorage.setItem(authUserStorageKey, '{}');
    clearLocalAuthSession();
    expect(loadLocalAuthSession()).toBeNull();
    expect(loadAuthToken()).toBeNull();
    expect(window.localStorage.getItem(authUserStorageKey)).toBeNull();
  });
});
