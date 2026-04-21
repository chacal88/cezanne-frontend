import { describe, expect, it } from 'vitest';
import { buildAccountSettingsState } from './account-settings-state';

describe('account settings state models', () => {
  it('models user settings independently from organization settings', () => {
    expect(buildAccountSettingsState('user-settings')).toMatchObject({
      kind: 'ready',
      owner: 'settings.user-settings',
      routeCapability: 'canViewUserSettings',
      organizationType: 'user',
      canEdit: true,
    });
  });

  it('models organization-owned company and agency settings', () => {
    expect(buildAccountSettingsState('company-settings')).toMatchObject({ owner: 'settings.company-settings', organizationType: 'hc' });
    expect(buildAccountSettingsState('agency-settings')).toMatchObject({ owner: 'settings.agency-settings', organizationType: 'ra' });
  });

  it('covers denied, unavailable, stale, degraded, dirty, saving, failed, retry, and success states', () => {
    expect(buildAccountSettingsState('company-settings', { routeAllowed: false }).kind).toBe('denied');
    expect(buildAccountSettingsState('company-settings', { unavailable: true }).kind).toBe('unavailable');
    expect(buildAccountSettingsState('company-settings', { stale: true }).kind).toBe('stale');
    expect(buildAccountSettingsState('company-settings', { degraded: true }).kind).toBe('degraded');
    expect(buildAccountSettingsState('company-settings', { dirty: true })).toMatchObject({ kind: 'dirty', canSave: true });
    expect(buildAccountSettingsState('company-settings', { saving: true })).toMatchObject({ kind: 'saving', canEdit: false });
    expect(buildAccountSettingsState('company-settings', { failed: true })).toMatchObject({ kind: 'save-failed', canRetry: true });
    expect(buildAccountSettingsState('company-settings', { retry: true })).toMatchObject({ kind: 'retry', canRetry: true });
    expect(buildAccountSettingsState('company-settings', { success: true })).toMatchObject({ kind: 'success', canRefreshParent: true });
  });

  it('keeps unknown backend fields explicit rather than inventing API shape', () => {
    const state = buildAccountSettingsState('recruitment-agency-profile');
    expect(state.confirmedContracts).toContain('deterministic-fixture-adapter');
    expect(state.unknownFields).toContain('profile-persistence-api');
  });
});
