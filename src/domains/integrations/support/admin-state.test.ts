import {
  buildIntegrationProviderViewModel,
  buildProviderAuthState,
  buildProviderConfigurationState,
  buildProviderDiagnosticsState,
  buildProviderReadinessSignals,
  listIntegrationProviders,
  resolveIntegrationProvider,
} from './admin-state';

describe('integrations admin provider state model', () => {
  it('renders all explicit provider states through the admin index model', () => {
    expect(listIntegrationProviders().map((provider) => provider.state)).toEqual([
      'connected',
      'connected',
      'degraded',
      'reauth_required',
      'disconnected',
      'unavailable',
    ]);
  });

  it('maps provider actions to configuration, auth, and diagnostics concerns', () => {
    expect(buildIntegrationProviderViewModel({ id: 'lever', name: 'Lever', family: 'job-board', state: 'degraded' }).actions).toEqual([
      { id: 'run_diagnostics', label: 'Run diagnostics', concern: 'diagnostics' },
      { id: 'view_logs', label: 'View logs', concern: 'diagnostics' },
      { id: 'configure', label: 'Configure', concern: 'configuration' },
    ]);

    expect(buildIntegrationProviderViewModel({ id: 'workday', name: 'Workday', family: 'hris', state: 'reauth_required' }).actions).toEqual([
      { id: 'reauthorize', label: 'Reauthorize', concern: 'auth' },
      { id: 'run_diagnostics', label: 'Run diagnostics', concern: 'diagnostics' },
    ]);
  });

  it('builds provider-family setup sections for calendar, job-board, and HRIS providers', () => {
    const calendar = buildIntegrationProviderViewModel({ id: 'google-calendar', name: 'Google Calendar', family: 'calendar', state: 'connected' });
    const jobBoard = buildIntegrationProviderViewModel({ id: 'lever', name: 'Lever', family: 'job-board', state: 'degraded' });
    const hris = buildIntegrationProviderViewModel({ id: 'workday', name: 'Workday', family: 'hris', state: 'reauth_required' });

    expect(calendar.sections.map((section) => section.id)).toEqual(['configuration', 'auth', 'diagnostics']);
    expect(calendar.sections[0].fields.map((field) => field.id)).toContain('conflict-policy');
    expect(jobBoard.sections[0].fields.map((field) => field.id)).toContain('board-mapping');
    expect(hris.sections[0].fields.map((field) => field.id)).toContain('sync-mapping');
  });

  it('derives deterministic configuration, auth, and diagnostics states', () => {
    const provider = { id: 'indeed', name: 'Indeed', family: 'job-board' as const, state: 'disconnected' as const };

    expect(buildProviderConfigurationState({ provider })).toBe('ready');
    expect(buildProviderConfigurationState({ provider, hasValidationError: true })).toBe('validation-error');
    expect(buildProviderConfigurationState({ provider, isSaving: true })).toBe('saving');
    expect(buildProviderConfigurationState({ provider, wasSaved: true })).toBe('saved');
    expect(buildProviderConfigurationState({ provider, hasSaveError: true })).toBe('save-error');
    expect(buildProviderConfigurationState({ provider: { ...provider, state: 'unavailable' } })).toBe('unavailable');
    expect(buildProviderConfigurationState({ provider: { ...provider, family: 'custom' } })).toBe('unimplemented');

    expect(buildProviderAuthState({ provider })).toBe('connect');
    expect(buildProviderAuthState({ provider, isPending: true })).toBe('auth-pending');
    expect(buildProviderAuthState({ provider, hasAuthFailed: true })).toBe('auth-failed');
    expect(buildProviderAuthState({ provider: { ...provider, state: 'reauth_required' } })).toBe('reauthorize');

    expect(buildProviderDiagnosticsState({ provider, isRunning: true })).toBe('running');
    expect(buildProviderDiagnosticsState({ provider, hasPassed: true })).toBe('passed');
    expect(buildProviderDiagnosticsState({ provider, hasFailed: true })).toBe('failed');
    expect(buildProviderDiagnosticsState({ provider, logsReady: true })).toBe('logs-ready');
    expect(buildProviderDiagnosticsState({ provider: { ...provider, state: 'degraded' } })).toBe('degraded');
    expect(buildProviderDiagnosticsState({ provider: { ...provider, family: 'custom' } })).toBe('unavailable');
    expect(buildProviderDiagnosticsState({ provider, shouldRetry: true })).toBe('retry');
  });

  it('normalizes provider readiness signals without exposing setup details', () => {
    expect(buildProviderReadinessSignals({ id: 'google-calendar', name: 'Google Calendar', family: 'calendar', state: 'connected' })).toEqual([
      { family: 'scheduling', outcome: 'ready', reason: 'calendar booking is available' },
    ]);
    expect(buildProviderReadinessSignals({ id: 'lever', name: 'Lever', family: 'job-board', state: 'degraded' })[0]).toMatchObject({ family: 'publishing', outcome: 'degraded' });
    expect(buildProviderReadinessSignals({ id: 'workday', name: 'Workday', family: 'hris', state: 'reauth_required' })[0]).toMatchObject({ family: 'sync-workflow', outcome: 'blocked' });
  });

  it('resolves unknown providers as unavailable while preserving parent-index fallback', () => {
    expect(resolveIntegrationProvider('unknown-provider')).toMatchObject({
      id: 'unknown-provider',
      state: 'unavailable',
      parentTarget: '/integrations',
    });
  });
});
