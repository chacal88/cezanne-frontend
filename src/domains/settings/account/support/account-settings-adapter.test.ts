import { describe, expect, it } from 'vitest';
import { createFixtureAccountSettingsAdapter } from './account-settings-adapter';

describe('account settings adapter seam', () => {
  it('loads deterministic fixtures for replaceable profile/settings contracts', () => {
    const adapter = createFixtureAccountSettingsAdapter();
    expect(adapter.loadFixture('hiring-company-profile')).toMatchObject({ organizationName: 'Acme Hiring' });
    expect(adapter.loadFixture('recruitment-agency-profile')).toMatchObject({ organizationName: 'Northstar Agency' });
  });

  it('keeps validation local until a backend contract is confirmed', () => {
    const adapter = createFixtureAccountSettingsAdapter();
    expect(adapter.saveFixture('user-settings', { displayName: '', email: 'empty@example.test', locale: 'en' })).toEqual({ ok: false, reason: 'display-name-required' });
  });
});
