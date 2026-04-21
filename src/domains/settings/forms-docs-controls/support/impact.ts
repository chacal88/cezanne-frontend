import type { FormsDocsDownstreamImpactSignal, FormsDocsSettingsConfigView } from './models';

export function buildFormsDocsDownstreamImpactSignals(config: FormsDocsSettingsConfigView): FormsDocsDownstreamImpactSignal[] {
  if (config.simulateUnavailable) {
    return buildSignals('unavailable', 'none', 'Forms/docs settings are unavailable; downstream consumers must keep their own route states.');
  }

  if (config.simulateDegraded) {
    return buildSignals('degraded', 'refresh-on-next-open', 'Forms/docs settings are degraded; consumers should show degraded summaries and retry locally.');
  }

  if (config.simulateStale) {
    return buildSignals('stale', 'refresh-on-next-open', 'Forms/docs settings changed; downstream summaries should refresh before claiming current data.');
  }

  const shouldRefresh = config.candidateRefreshMode === 'after-save' || config.publicRefreshMode === 'after-save';
  return buildSignals('fresh', shouldRefresh ? 'refresh-now' : 'none', shouldRefresh ? 'Forms/docs settings saved; downstream consumers have explicit refresh intent.' : 'Forms/docs settings are fresh.');
}

function buildSignals(
  state: FormsDocsDownstreamImpactSignal['state'],
  refreshIntent: FormsDocsDownstreamImpactSignal['refreshIntent'],
  message: string,
): FormsDocsDownstreamImpactSignal[] {
  return [
    { consumer: 'candidate-documents-contracts', state, refreshIntent, mutationOwner: 'settings.forms-docs-controls', message },
    { consumer: 'public-application', state, refreshIntent, mutationOwner: 'settings.forms-docs-controls', message },
    { consumer: 'integration-forms-token', state, refreshIntent, mutationOwner: 'settings.forms-docs-controls', message },
  ];
}
