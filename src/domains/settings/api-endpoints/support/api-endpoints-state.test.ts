import { describe, expect, it } from 'vitest';
import { buildApiEndpointSettingsState, getDefaultApiEndpointSettingsConfig, validateApiEndpointSettings } from './api-endpoints-state';

describe('API endpoints settings state', () => {
  it('models a ready editable foundation state', () => {
    const state = buildApiEndpointSettingsState(getDefaultApiEndpointSettingsConfig());
    expect(state).toMatchObject({
      kind: 'ready',
      owner: 'settings.api-endpoints',
      routeCapability: 'canManageApiEndpoints',
      canEdit: true,
      canSave: true,
      canRetry: false,
    });
  });

  it('blocks save when endpoint validation fails', () => {
    const state = buildApiEndpointSettingsState(getDefaultApiEndpointSettingsConfig({ endpointUrl: 'not-a-url' }));
    expect(state.kind).toBe('validation-error');
    expect(state.canSave).toBe(false);
    expect(state.validationErrors).toContain('invalid-url');
  });

  it('requires HTTPS for production endpoints', () => {
    expect(validateApiEndpointSettings(getDefaultApiEndpointSettingsConfig({ endpointUrl: 'http://example.test', environment: 'production' }))).toContain('production-requires-https');
  });

  it('models recoverable save failure and denied states', () => {
    expect(buildApiEndpointSettingsState(getDefaultApiEndpointSettingsConfig({ simulateSaveFailure: true })).kind).toBe('save-error');
    expect(buildApiEndpointSettingsState(getDefaultApiEndpointSettingsConfig(), { routeAllowed: false })).toMatchObject({ kind: 'denied', canEdit: false });
  });
});
