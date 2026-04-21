import type { FormsDocsSettingsConfigView, FormsDocsSettingsMutationState, FormsDocsSettingsReadinessState, FormsDocsSettingsViewState } from './models';
import { buildFormsDocsDownstreamImpactSignals } from './impact';

export const formsDocsUnknownContractFields = [
  'settingsId/version backend source',
  'document request scope by candidate stage/job/public source',
  'allowed file types and max upload size',
  'downstream refresh event delivery contract',
] as const;

export function resolveFormsDocsReadiness(config: FormsDocsSettingsConfigView, options: { denied?: boolean; loading?: boolean } = {}): FormsDocsSettingsReadinessState {
  if (options.loading) return { kind: 'loading', canEdit: false, canRetry: false, reason: 'Loading forms/docs settings.' };
  if (options.denied) return { kind: 'denied', canEdit: false, canRetry: false, reason: 'The current actor cannot manage forms/docs settings.' };
  if (config.simulateUnavailable) return { kind: 'unavailable', canEdit: false, canRetry: true, reason: 'Backend contract for forms/docs controls is not confirmed.' };
  if (config.simulateStale) return { kind: 'stale', canEdit: true, canRetry: true, reason: 'Settings fixture is stale and downstream consumers need refresh intent.' };
  if (config.simulateDegraded) return { kind: 'degraded', canEdit: true, canRetry: true, reason: 'Some downstream forms/docs fields are degraded.' };
  if (config.simulateEmpty || config.requestedDocuments.length === 0) return { kind: 'empty', canEdit: true, canRetry: false, reason: 'No requested forms/documents are configured yet.' };
  return { kind: 'ready', canEdit: true, canRetry: false };
}

export function buildFormsDocsSettingsViewState(
  config: FormsDocsSettingsConfigView,
  mutation: FormsDocsSettingsMutationState = { kind: 'idle', canRetry: false },
  options: { denied?: boolean; loading?: boolean } = {},
): FormsDocsSettingsViewState {
  return {
    owner: 'settings.forms-docs-controls',
    routeId: 'settings.forms-docs-controls',
    parentTarget: '/parameters/default/settings/forms-docs',
    config,
    readiness: resolveFormsDocsReadiness(config, options),
    mutation,
    downstreamImpact: buildFormsDocsDownstreamImpactSignals(config),
    unknownContractFields: [...formsDocsUnknownContractFields],
  };
}
