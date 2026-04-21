import type { AccountSettingsRouteKind } from './account-settings-state';

export type AccountSettingsFixture = {
  displayName: string;
  email: string;
  locale: 'en' | 'pt';
  organizationName?: string;
  timezone?: string;
  stale?: boolean;
  degraded?: boolean;
};

export type AccountSettingsAdapter = {
  loadFixture: (routeKind: AccountSettingsRouteKind) => AccountSettingsFixture | null;
  saveFixture: (routeKind: AccountSettingsRouteKind, fixture: AccountSettingsFixture) => { ok: true } | { ok: false; reason: string };
};

const fixtures: Record<AccountSettingsRouteKind, AccountSettingsFixture> = {
  'user-profile': { displayName: 'Avery Recruiter', email: 'avery@example.test', locale: 'en', timezone: 'America/Sao_Paulo' },
  'user-settings': { displayName: 'Avery Recruiter', email: 'avery@example.test', locale: 'en', timezone: 'America/Sao_Paulo' },
  'company-settings': { displayName: 'Hiring Company Admin', email: 'admin@company.example.test', locale: 'en', organizationName: 'Acme Hiring' },
  'agency-settings': { displayName: 'Agency Admin', email: 'admin@agency.example.test', locale: 'en', organizationName: 'Northstar Agency' },
  'hiring-company-profile': { displayName: 'Hiring Company Admin', email: 'admin@company.example.test', locale: 'en', organizationName: 'Acme Hiring' },
  'recruitment-agency-profile': { displayName: 'Agency Admin', email: 'admin@agency.example.test', locale: 'en', organizationName: 'Northstar Agency' },
};

export function createFixtureAccountSettingsAdapter(overrides: Partial<Record<AccountSettingsRouteKind, AccountSettingsFixture | null>> = {}): AccountSettingsAdapter {
  const store = { ...fixtures, ...overrides };
  return {
    loadFixture: (routeKind) => store[routeKind] ?? null,
    saveFixture: (routeKind, fixture) => {
      if (!fixture.displayName.trim()) return { ok: false, reason: 'display-name-required' };
      store[routeKind] = fixture;
      return { ok: true };
    },
  };
}

export const defaultAccountSettingsAdapter = createFixtureAccountSettingsAdapter();
