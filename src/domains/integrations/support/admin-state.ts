export type IntegrationProviderState = 'connected' | 'disconnected' | 'degraded' | 'reauth_required' | 'unavailable';
export type IntegrationProviderFamily = 'ats' | 'job-board' | 'hris' | 'assessment' | 'custom';
export type IntegrationProviderAction = 'configure' | 'connect' | 'reauthorize' | 'run_diagnostics' | 'view_logs';
export type IntegrationProviderConcern = 'configuration' | 'auth' | 'diagnostics';

export type IntegrationProviderSummary = {
  id: string;
  name: string;
  family: IntegrationProviderFamily;
  state: IntegrationProviderState;
};

export type IntegrationProviderViewModel = IntegrationProviderSummary & {
  stateLabel: string;
  actions: Array<{ id: IntegrationProviderAction; label: string; concern: IntegrationProviderConcern }>;
  parentTarget: '/integrations';
};

const providers: IntegrationProviderSummary[] = [
  { id: 'greenhouse', name: 'Greenhouse', family: 'ats', state: 'connected' },
  { id: 'lever', name: 'Lever', family: 'job-board', state: 'degraded' },
  { id: 'workday', name: 'Workday', family: 'hris', state: 'reauth_required' },
  { id: 'indeed', name: 'Indeed', family: 'job-board', state: 'disconnected' },
  { id: 'custom-provider', name: 'Custom provider', family: 'custom', state: 'unavailable' },
];

const stateLabels: Record<IntegrationProviderState, string> = {
  connected: 'Connected',
  disconnected: 'Disconnected',
  degraded: 'Degraded',
  reauth_required: 'Reauth required',
  unavailable: 'Unavailable',
};

const actionsByState: Record<IntegrationProviderState, IntegrationProviderViewModel['actions']> = {
  connected: [
    { id: 'configure', label: 'Configure', concern: 'configuration' },
    { id: 'run_diagnostics', label: 'Run diagnostics', concern: 'diagnostics' },
  ],
  disconnected: [
    { id: 'connect', label: 'Connect', concern: 'auth' },
    { id: 'configure', label: 'Configure', concern: 'configuration' },
  ],
  degraded: [
    { id: 'run_diagnostics', label: 'Run diagnostics', concern: 'diagnostics' },
    { id: 'view_logs', label: 'View logs', concern: 'diagnostics' },
    { id: 'configure', label: 'Configure', concern: 'configuration' },
  ],
  reauth_required: [
    { id: 'reauthorize', label: 'Reauthorize', concern: 'auth' },
    { id: 'run_diagnostics', label: 'Run diagnostics', concern: 'diagnostics' },
  ],
  unavailable: [{ id: 'view_logs', label: 'View recovery notes', concern: 'diagnostics' }],
};

export function listIntegrationProviders(): IntegrationProviderViewModel[] {
  return providers.map(buildIntegrationProviderViewModel);
}

export function buildIntegrationProviderViewModel(provider: IntegrationProviderSummary): IntegrationProviderViewModel {
  return {
    ...provider,
    stateLabel: stateLabels[provider.state],
    actions: actionsByState[provider.state],
    parentTarget: '/integrations',
  };
}

export function resolveIntegrationProvider(providerId: string): IntegrationProviderViewModel {
  const provider = providers.find((item) => item.id === providerId) ?? {
    id: providerId,
    name: providerId,
    family: 'custom' as const,
    state: 'unavailable' as const,
  };
  return buildIntegrationProviderViewModel(provider);
}
