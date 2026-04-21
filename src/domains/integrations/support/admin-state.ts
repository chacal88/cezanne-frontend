export type IntegrationProviderState = 'connected' | 'disconnected' | 'blocked' | 'degraded' | 'reauth_required' | 'unavailable';
export type IntegrationProviderFamily = 'calendar' | 'ats' | 'job-board' | 'hris' | 'assessment' | 'custom';
export type IntegrationProviderAction = 'configure' | 'connect' | 'reauthorize' | 'run_diagnostics' | 'view_logs';
export type IntegrationProviderConcern = 'configuration' | 'auth' | 'diagnostics';
export type IntegrationProviderSetupSectionId = 'configuration' | 'auth' | 'diagnostics';
export type IntegrationProviderConfigurationState =
  | 'loading'
  | 'ready'
  | 'validation-error'
  | 'saving'
  | 'saved'
  | 'save-error'
  | 'unavailable'
  | 'unimplemented';
export type IntegrationProviderAuthState =
  | 'connect'
  | 'reauthorize'
  | 'auth-pending'
  | 'auth-failed'
  | 'connected'
  | 'disconnected'
  | 'degraded'
  | 'reauth-required';
export type IntegrationProviderDiagnosticsState = 'idle' | 'running' | 'passed' | 'failed' | 'logs-ready' | 'degraded' | 'unavailable' | 'retry';
export type IntegrationProviderReadinessFamily = 'scheduling' | 'publishing' | 'sync-workflow' | 'ats-sync-import' | 'assessment-review-scoring';
export type IntegrationProviderReadinessOutcome = 'ready' | 'blocked' | 'degraded' | 'unavailable' | 'unimplemented';

export type IntegrationProviderSummary = {
  id: string;
  name: string;
  family: IntegrationProviderFamily;
  state: IntegrationProviderState;
};

export type IntegrationProviderSection = {
  id: IntegrationProviderSetupSectionId;
  title: string;
  state: IntegrationProviderConfigurationState | IntegrationProviderAuthState | IntegrationProviderDiagnosticsState;
  description: string;
  fields: Array<{ id: string; label: string; value: string; required?: boolean; secret?: boolean }>;
  actions: Array<{ id: IntegrationProviderAction; label: string; concern: IntegrationProviderConcern }>;
};

export type IntegrationProviderSetupTarget = {
  providerId: string;
  path: `/integrations/${string}`;
  label: string;
};

export type IntegrationProviderReadinessSignal = {
  family: IntegrationProviderReadinessFamily;
  providerFamily: IntegrationProviderFamily;
  outcome: IntegrationProviderReadinessOutcome;
  reason: string;
  setupTarget?: IntegrationProviderSetupTarget;
};

export type IntegrationProviderViewModel = IntegrationProviderSummary & {
  stateLabel: string;
  actions: Array<{ id: IntegrationProviderAction; label: string; concern: IntegrationProviderConcern }>;
  sections: IntegrationProviderSection[];
  readinessSignals: IntegrationProviderReadinessSignal[];
  parentTarget: '/integrations';
};

const supportedProviderFamilies = ['calendar', 'ats', 'job-board', 'hris', 'assessment'] as const satisfies readonly IntegrationProviderFamily[];

const providers: IntegrationProviderSummary[] = [
  { id: 'google-calendar', name: 'Google Calendar', family: 'calendar', state: 'connected' },
  { id: 'greenhouse', name: 'Greenhouse', family: 'ats', state: 'connected' },
  { id: 'lever', name: 'Lever', family: 'job-board', state: 'degraded' },
  { id: 'workday', name: 'Workday', family: 'hris', state: 'reauth_required' },
  { id: 'indeed', name: 'Indeed', family: 'job-board', state: 'disconnected' },
  { id: 'codility', name: 'Codility', family: 'assessment', state: 'disconnected' },
  { id: 'custom-provider', name: 'Custom provider', family: 'custom', state: 'unavailable' },
];

const stateLabels: Record<IntegrationProviderState, string> = {
  connected: 'Connected',
  disconnected: 'Disconnected',
  blocked: 'Blocked',
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
  blocked: [
    { id: 'configure', label: 'Configure', concern: 'configuration' },
    { id: 'run_diagnostics', label: 'Run diagnostics', concern: 'diagnostics' },
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

function isSupportedProviderFamily(family: IntegrationProviderFamily) {
  return supportedProviderFamilies.includes(family as (typeof supportedProviderFamilies)[number]);
}

function providerFamilyTitle(family: IntegrationProviderFamily) {
  const titles: Record<IntegrationProviderFamily, string> = {
    calendar: 'Calendar setup',
    ats: 'ATS setup',
    'job-board': 'Job-board setup',
    hris: 'HRIS setup',
    assessment: 'Assessment setup',
    custom: 'Custom provider setup',
  };
  return titles[family];
}

export function buildProviderConfigurationState(input: {
  provider: IntegrationProviderSummary;
  isSaving?: boolean;
  wasSaved?: boolean;
  hasValidationError?: boolean;
  hasSaveError?: boolean;
  isLoading?: boolean;
}): IntegrationProviderConfigurationState {
  if (input.isLoading) return 'loading';
  if (input.provider.state === 'unavailable') return 'unavailable';
  if (!isSupportedProviderFamily(input.provider.family)) return 'unimplemented';
  if (input.isSaving) return 'saving';
  if (input.hasValidationError) return 'validation-error';
  if (input.hasSaveError) return 'save-error';
  if (input.wasSaved) return 'saved';
  return 'ready';
}

export function buildProviderAuthState(input: {
  provider: IntegrationProviderSummary;
  isPending?: boolean;
  hasAuthFailed?: boolean;
}): IntegrationProviderAuthState {
  if (input.isPending) return 'auth-pending';
  if (input.hasAuthFailed) return 'auth-failed';
  if (input.provider.state === 'reauth_required') return 'reauthorize';
  if (input.provider.state === 'connected') return 'connected';
  if (input.provider.state === 'degraded') return 'degraded';
  if (input.provider.state === 'disconnected') return 'connect';
  return 'disconnected';
}

export function buildProviderDiagnosticsState(input: {
  provider: IntegrationProviderSummary;
  isRunning?: boolean;
  hasPassed?: boolean;
  hasFailed?: boolean;
  logsReady?: boolean;
  shouldRetry?: boolean;
}): IntegrationProviderDiagnosticsState {
  if (input.provider.state === 'unavailable' || !isSupportedProviderFamily(input.provider.family)) return 'unavailable';
  if (input.isRunning) return 'running';
  if (input.shouldRetry) return 'retry';
  if (input.hasFailed) return 'failed';
  if (input.logsReady) return 'logs-ready';
  if (input.hasPassed) return 'passed';
  if (input.provider.state === 'degraded') return 'degraded';
  return 'idle';
}

function buildConfigurationFields(provider: IntegrationProviderSummary): IntegrationProviderSection['fields'] {
  if (provider.family === 'calendar') {
    return [
      { id: 'account-readiness', label: 'Account readiness', value: provider.state === 'connected' ? 'Ready' : 'Needs connection', required: true },
      { id: 'scheduling-capability', label: 'Scheduling capability', value: provider.state === 'degraded' ? 'Limited' : 'Enabled', required: true },
      { id: 'conflict-policy', label: 'Conflict policy', value: 'Use provider conflict checks', required: true },
    ];
  }
  if (provider.family === 'job-board') {
    return [
      { id: 'credential-readiness', label: 'Posting credential readiness', value: provider.state === 'disconnected' ? 'Missing' : 'Present', required: true, secret: true },
      { id: 'board-mapping', label: 'Board mapping', value: provider.state === 'degraded' ? 'Needs repair' : 'Mapped', required: true },
      { id: 'publishing-eligibility', label: 'Publishing eligibility', value: provider.state === 'disconnected' ? 'Blocked' : 'Eligible', required: true },
    ];
  }
  if (provider.family === 'ats') {
    return [
      { id: 'source-ownership', label: 'Source ownership', value: provider.state === 'connected' ? 'Owned by ATS integration' : 'Needs source owner review', required: true },
      { id: 'candidate-sync-readiness', label: 'Candidate sync readiness', value: provider.state === 'connected' ? 'Ready' : 'Blocked until connected', required: true },
      { id: 'job-sync-readiness', label: 'Job sync readiness', value: provider.state === 'connected' ? 'Ready' : 'Mapping required', required: true },
      { id: 'webhook-presence', label: 'Webhook presence', value: provider.state === 'connected' ? 'Present' : 'Not confirmed', required: true, secret: true },
      { id: 'duplicate-import-policy', label: 'Duplicate/import policy', value: 'Normalize duplicates before operational import', required: true },
    ];
  }
  if (provider.family === 'hris') {
    return [
      { id: 'sync-mapping', label: 'Sync mapping', value: provider.state === 'reauth_required' ? 'Paused until reauthorized' : 'Mapped', required: true },
      { id: 'workflow-readiness', label: 'Workflow readiness', value: provider.state === 'reauth_required' ? 'Blocked' : 'Ready', required: true },
    ];
  }
  if (provider.family === 'assessment') {
    return [
      { id: 'template-catalog-readiness', label: 'Template/catalog readiness', value: provider.state === 'connected' ? 'Ready' : 'Template mapping required', required: true },
      { id: 'candidate-handoff-readiness', label: 'Candidate handoff readiness', value: provider.state === 'connected' ? 'Ready' : 'Blocked until connected', required: true },
      { id: 'reviewer-scoring-readiness', label: 'Reviewer/scoring callback readiness', value: provider.state === 'connected' ? 'Ready' : 'Callback readiness not confirmed', required: true },
      { id: 'callback-presence', label: 'Callback presence', value: provider.state === 'connected' ? 'Present' : 'Not confirmed', required: true, secret: true },
    ];
  }
  return [{ id: 'provider-family', label: 'Provider family', value: 'Setup depth is unsupported for this provider family.' }];
}

export function buildProviderSetupSections(provider: IntegrationProviderSummary): IntegrationProviderSection[] {
  const configurationState = buildProviderConfigurationState({ provider });
  const authState = buildProviderAuthState({ provider });
  const diagnosticsState = buildProviderDiagnosticsState({ provider });
  const sectionActions = actionsByState[provider.state];

  return [
    {
      id: 'configuration',
      title: `${providerFamilyTitle(provider.family)} configuration`,
      state: configurationState,
      description: isSupportedProviderFamily(provider.family)
        ? 'Family-specific setup values are modeled without exposing raw credentials or provider payloads.'
        : 'This provider family is visible in the shell but unsupported by this setup-depth package.',
      fields: buildConfigurationFields(provider),
      actions: sectionActions.filter((action) => action.concern === 'configuration'),
    },
    {
      id: 'auth',
      title: `${providerFamilyTitle(provider.family)} authentication`,
      state: authState,
      description: authState === 'reauthorize' ? 'Reauthorization is required before this provider is fully connected.' : 'Authentication state is modeled as a route-local readiness handoff.',
      fields: [{ id: 'auth-readiness', label: 'Auth readiness', value: authState }],
      actions: sectionActions.filter((action) => action.concern === 'auth'),
    },
    {
      id: 'diagnostics',
      title: `${providerFamilyTitle(provider.family)} diagnostics`,
      state: diagnosticsState,
      description: 'Diagnostics expose safe summaries, severity, and remediation guidance without raw logs.',
      fields: [
        { id: 'connectivity-check', label: 'Connectivity check', value: provider.state === 'unavailable' ? 'Unavailable' : 'Ready to run' },
        { id: 'last-run', label: 'Last run', value: diagnosticsState === 'unavailable' ? 'Not available' : 'Not run in this session' },
      ],
      actions: sectionActions.filter((action) => action.concern === 'diagnostics'),
    },
  ];
}

function buildProviderSetupTarget(provider: IntegrationProviderSummary): IntegrationProviderSetupTarget | undefined {
  if (provider.state === 'connected') return undefined;
  if (provider.state === 'unavailable') return undefined;
  return { providerId: provider.id, path: `/integrations/${provider.id}`, label: `Review ${provider.name} setup` };
}

export function buildProviderReadinessSignals(provider: IntegrationProviderSummary): IntegrationProviderReadinessSignal[] {
  const setupTarget = buildProviderSetupTarget(provider);
  if (provider.family === 'calendar') {
    const outcome: IntegrationProviderReadinessOutcome =
      provider.state === 'connected' ? 'ready' : provider.state === 'degraded' ? 'degraded' : provider.state === 'unavailable' ? 'unavailable' : 'blocked';
    return [{ family: 'scheduling', providerFamily: provider.family, outcome, reason: outcome === 'ready' ? 'calendar booking is available' : 'calendar setup requires attention', setupTarget }];
  }
  if (provider.family === 'job-board') {
    const outcome: IntegrationProviderReadinessOutcome =
      provider.state === 'connected' ? 'ready' : provider.state === 'degraded' ? 'degraded' : provider.state === 'unavailable' ? 'unavailable' : 'blocked';
    return [{ family: 'publishing', providerFamily: provider.family, outcome, reason: outcome === 'ready' ? 'job-board publishing is available' : 'job-board credentials or mapping require attention', setupTarget }];
  }
  if (provider.family === 'hris') {
    const outcome: IntegrationProviderReadinessOutcome =
      provider.state === 'connected' ? 'ready' : provider.state === 'degraded' ? 'degraded' : provider.state === 'reauth_required' ? 'blocked' : 'unavailable';
    return [{ family: 'sync-workflow', providerFamily: provider.family, outcome, reason: outcome === 'ready' ? 'HRIS sync/workflow is available' : 'HRIS authorization or mapping requires attention', setupTarget }];
  }
  if (provider.family === 'ats') {
    const outcome: IntegrationProviderReadinessOutcome =
      provider.state === 'connected' ? 'ready' : provider.state === 'degraded' ? 'degraded' : provider.state === 'unavailable' ? 'unavailable' : 'blocked';
    return [
      {
        family: 'ats-sync-import',
        providerFamily: provider.family,
        outcome,
        reason: outcome === 'ready' ? 'ATS sync/import handoff is available' : 'ATS source ownership, mapping, webhook, or authorization requires attention',
        setupTarget,
      },
    ];
  }
  if (provider.family === 'assessment') {
    const outcome: IntegrationProviderReadinessOutcome =
      provider.state === 'connected' ? 'ready' : provider.state === 'degraded' ? 'degraded' : provider.state === 'unavailable' ? 'unavailable' : 'blocked';
    return [
      {
        family: 'assessment-review-scoring',
        providerFamily: provider.family,
        outcome,
        reason: outcome === 'ready' ? 'Assessment review/scoring handoff is available' : 'Assessment template, handoff, callback, or authorization requires attention',
        setupTarget,
      },
    ];
  }
  return [{ family: 'sync-workflow', providerFamily: provider.family, outcome: 'unimplemented', reason: 'provider family setup depth is unsupported' }];
}

export function listIntegrationProviders(): IntegrationProviderViewModel[] {
  return providers.map(buildIntegrationProviderViewModel);
}

export function buildIntegrationProviderViewModel(provider: IntegrationProviderSummary): IntegrationProviderViewModel {
  return {
    ...provider,
    stateLabel: stateLabels[provider.state],
    actions: actionsByState[provider.state],
    sections: buildProviderSetupSections(provider),
    readinessSignals: buildProviderReadinessSignals(provider),
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
