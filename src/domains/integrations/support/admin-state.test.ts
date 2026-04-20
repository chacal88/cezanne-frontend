import { buildIntegrationProviderViewModel, listIntegrationProviders, resolveIntegrationProvider } from './admin-state';

describe('integrations admin provider state model', () => {
  it('renders all explicit provider states through the admin index model', () => {
    expect(listIntegrationProviders().map((provider) => provider.state)).toEqual([
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

  it('resolves unknown providers as unavailable while preserving parent-index fallback', () => {
    expect(resolveIntegrationProvider('unknown-provider')).toMatchObject({
      id: 'unknown-provider',
      state: 'unavailable',
      parentTarget: '/integrations',
    });
  });
});
